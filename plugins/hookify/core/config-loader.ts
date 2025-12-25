/**
 * Configuration loader for hookify plugin.
 * Loads and parses .claude/hookify.*.local.md files and plugin rules.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import type { Rule, Condition } from "./types";

/**
 * Extract YAML frontmatter and message body from markdown.
 */
function extractFrontmatter(content: string): { frontmatter: Record<string, unknown>; message: string } {
	if (!content.startsWith("---")) {
		return { frontmatter: {}, message: content };
	}

	const parts = content.split("---");
	if (parts.length < 3) {
		return { frontmatter: {}, message: content };
	}

	const frontmatterText = parts[1];
	const message = parts.slice(2).join("---").trim();

	// Simple YAML parser
	const frontmatter: Record<string, unknown> = {};
	const lines = frontmatterText.split("\n");

	let currentKey: string | null = null;
	let currentList: unknown[] = [];
	let currentDict: Record<string, string> = {};
	let inList = false;
	let inDictItem = false;

	for (const line of lines) {
		const stripped = line.trim();
		if (!stripped || stripped.startsWith("#")) continue;

		const indent = line.length - line.trimStart().length;

		// Top-level key
		if (indent === 0 && line.includes(":") && !stripped.startsWith("-")) {
			// Save previous list
			if (inList && currentKey) {
				if (inDictItem && Object.keys(currentDict).length > 0) {
					currentList.push(currentDict);
					currentDict = {};
				}
				frontmatter[currentKey] = currentList;
				inList = false;
				inDictItem = false;
				currentList = [];
			}

			const colonIdx = line.indexOf(":");
			const key = line.slice(0, colonIdx).trim();
			const value = line.slice(colonIdx + 1).trim();

			if (!value) {
				currentKey = key;
				inList = true;
				currentList = [];
			} else {
				const cleanValue = value.replace(/^["']|["']$/g, "");
				if (cleanValue.toLowerCase() === "true") {
					frontmatter[key] = true;
				} else if (cleanValue.toLowerCase() === "false") {
					frontmatter[key] = false;
				} else {
					frontmatter[key] = cleanValue;
				}
			}
		}
		// List item
		else if (stripped.startsWith("-") && inList) {
			if (inDictItem && Object.keys(currentDict).length > 0) {
				currentList.push(currentDict);
				currentDict = {};
			}

			const itemText = stripped.slice(1).trim();

			if (itemText.includes(":") && itemText.includes(",")) {
				// Inline dict
				const itemDict: Record<string, string> = {};
				for (const part of itemText.split(",")) {
					if (part.includes(":")) {
						const [k, v] = part.split(":");
						itemDict[k.trim()] = v.trim().replace(/^["']|["']$/g, "");
					}
				}
				currentList.push(itemDict);
				inDictItem = false;
			} else if (itemText.includes(":")) {
				// Start of multi-line dict
				inDictItem = true;
				const [k, v] = itemText.split(":");
				currentDict = { [k.trim()]: v.trim().replace(/^["']|["']$/g, "") };
			} else {
				currentList.push(itemText.replace(/^["']|["']$/g, ""));
				inDictItem = false;
			}
		}
		// Dict item continuation
		else if (indent > 2 && inDictItem && stripped.includes(":")) {
			const [k, v] = stripped.split(":");
			currentDict[k.trim()] = v.trim().replace(/^["']|["']$/g, "");
		}
	}

	// Save final list
	if (inList && currentKey) {
		if (inDictItem && Object.keys(currentDict).length > 0) {
			currentList.push(currentDict);
		}
		frontmatter[currentKey] = currentList;
	}

	return { frontmatter, message };
}

/**
 * Create a Rule from frontmatter and message.
 */
function ruleFromDict(frontmatter: Record<string, unknown>, message: string): Rule {
	const conditions: Condition[] = [];

	// Handle conditions list
	if (Array.isArray(frontmatter.conditions)) {
		for (const c of frontmatter.conditions) {
			if (typeof c === "object" && c !== null) {
				conditions.push({
					field: String((c as Record<string, unknown>).field || ""),
					operator: ((c as Record<string, unknown>).operator as Condition["operator"]) || "regex_match",
					pattern: String((c as Record<string, unknown>).pattern || ""),
				});
			}
		}
	}

	// Legacy simple pattern
	const simplePattern = frontmatter.pattern as string | undefined;
	if (simplePattern && conditions.length === 0) {
		const event = (frontmatter.event as string) || "all";
		let field = "content";
		if (event === "bash") field = "command";
		else if (event === "file") field = "new_text";

		conditions.push({
			field,
			operator: "regex_match",
			pattern: simplePattern,
		});
	}

	return {
		name: String(frontmatter.name || "unnamed"),
		enabled: frontmatter.enabled !== false,
		event: (frontmatter.event as Rule["event"]) || "all",
		pattern: simplePattern,
		conditions,
		action: (frontmatter.action as "warn" | "block") || "warn",
		tool_matcher: frontmatter.tool_matcher as string | undefined,
		message: message.trim(),
	};
}

/**
 * Load a single rule file.
 */
function loadRuleFile(filePath: string): Rule | null {
	try {
		const content = readFileSync(filePath, "utf-8");
		const { frontmatter, message } = extractFrontmatter(content);

		if (Object.keys(frontmatter).length === 0) {
			console.error(`Warning: ${filePath} missing YAML frontmatter`);
			return null;
		}

		return ruleFromDict(frontmatter, message);
	} catch (error) {
		console.error(`Error loading ${filePath}:`, error);
		return null;
	}
}

/**
 * Load all hookify rules from .claude directory and plugin rules directory.
 */
export function loadRules(event?: string): Rule[] {
	const rules: Rule[] = [];

	// Load from .claude directory (project-specific rules)
	const claudeDir = ".claude";
	if (existsSync(claudeDir)) {
		try {
			const files = readdirSync(claudeDir);
			for (const file of files) {
				if (file.startsWith("hookify.") && file.endsWith(".local.md")) {
					const rule = loadRuleFile(join(claudeDir, file));
					if (rule && rule.enabled) {
						if (!event || rule.event === "all" || rule.event === event) {
							rules.push(rule);
						}
					}
				}
			}
		} catch {
			// Directory might not exist or be readable
		}
	}

	// Load from plugin rules directory
	const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
	if (pluginRoot) {
		const rulesDir = join(pluginRoot, "rules");
		if (existsSync(rulesDir)) {
			try {
				const files = readdirSync(rulesDir);
				for (const file of files) {
					if (file.endsWith(".local.md")) {
						const rule = loadRuleFile(join(rulesDir, file));
						if (rule && rule.enabled) {
							if (!event || rule.event === "all" || rule.event === event) {
								rules.push(rule);
							}
						}
					}
				}
			} catch {
				// Rules directory might not exist
			}
		}
	}

	return rules;
}
