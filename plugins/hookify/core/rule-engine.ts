/**
 * Rule evaluation engine for hookify plugin.
 */

import { readFileSync } from "node:fs";
import type { Rule, Condition, HookInput, HookOutput } from "./types";

// Regex cache
const regexCache = new Map<string, RegExp>();

function compileRegex(pattern: string): RegExp {
	let regex = regexCache.get(pattern);
	if (!regex) {
		regex = new RegExp(pattern, "i");
		regexCache.set(pattern, regex);
	}
	return regex;
}

/**
 * Check if tool_name matches the matcher pattern.
 */
function matchesTool(matcher: string, toolName: string): boolean {
	if (matcher === "*") return true;
	const patterns = matcher.split("|");
	return patterns.includes(toolName);
}

/**
 * Extract field value from tool input.
 */
function extractField(
	field: string,
	toolName: string,
	toolInput: Record<string, unknown>,
	inputData: HookInput
): string | null {
	// Direct tool_input fields
	if (field in toolInput) {
		const value = toolInput[field];
		return typeof value === "string" ? value : String(value);
	}

	// Stop event fields
	if (field === "reason") {
		return inputData.reason || "";
	}
	if (field === "transcript" && inputData.transcript_path) {
		try {
			return readFileSync(inputData.transcript_path, "utf-8");
		} catch {
			return "";
		}
	}
	if (field === "user_prompt") {
		return inputData.user_prompt || "";
	}

	// Tool-specific fields
	if (toolName === "Bash" && field === "command") {
		return (toolInput.command as string) || "";
	}

	if (toolName === "Write" || toolName === "Edit") {
		if (field === "content" || field === "new_text" || field === "new_string") {
			return (toolInput.content as string) || (toolInput.new_string as string) || "";
		}
		if (field === "old_text" || field === "old_string") {
			return (toolInput.old_string as string) || "";
		}
		if (field === "file_path") {
			return (toolInput.file_path as string) || "";
		}
	}

	if (toolName === "MultiEdit") {
		if (field === "file_path") {
			return (toolInput.file_path as string) || "";
		}
		if (field === "new_text" || field === "content") {
			const edits = toolInput.edits as Array<{ new_string?: string }> | undefined;
			if (edits) {
				return edits.map((e) => e.new_string || "").join(" ");
			}
		}
	}

	return null;
}

/**
 * Check if a condition matches.
 */
function checkCondition(
	condition: Condition,
	toolName: string,
	toolInput: Record<string, unknown>,
	inputData: HookInput
): boolean {
	const fieldValue = extractField(condition.field, toolName, toolInput, inputData);
	if (fieldValue === null) return false;

	const { operator, pattern } = condition;

	switch (operator) {
		case "regex_match":
			try {
				const regex = compileRegex(pattern);
				return regex.test(fieldValue);
			} catch {
				console.error(`Invalid regex pattern: ${pattern}`);
				return false;
			}
		case "contains":
			return fieldValue.includes(pattern);
		case "equals":
			return fieldValue === pattern;
		case "not_contains":
			return !fieldValue.includes(pattern);
		case "starts_with":
			return fieldValue.startsWith(pattern);
		case "ends_with":
			return fieldValue.endsWith(pattern);
		default:
			return false;
	}
}

/**
 * Check if a rule matches the input.
 */
function ruleMatches(rule: Rule, inputData: HookInput): boolean {
	const toolName = inputData.tool_name || "";
	const toolInput = (inputData.tool_input as Record<string, unknown>) || {};

	// Check tool matcher
	if (rule.tool_matcher && !matchesTool(rule.tool_matcher, toolName)) {
		return false;
	}

	// Must have at least one condition
	if (rule.conditions.length === 0) {
		return false;
	}

	// All conditions must match
	for (const condition of rule.conditions) {
		if (!checkCondition(condition, toolName, toolInput, inputData)) {
			return false;
		}
	}

	return true;
}

/**
 * Evaluate all rules and return combined results.
 */
export function evaluateRules(rules: Rule[], inputData: HookInput): HookOutput {
	const hookEvent = inputData.hook_event_name || "";
	const blockingRules: Rule[] = [];
	const warningRules: Rule[] = [];

	for (const rule of rules) {
		if (ruleMatches(rule, inputData)) {
			if (rule.action === "block") {
				blockingRules.push(rule);
			} else {
				warningRules.push(rule);
			}
		}
	}

	// Blocking rules take priority
	if (blockingRules.length > 0) {
		const messages = blockingRules.map((r) => `**[${r.name}]**\n${r.message}`);
		const combinedMessage = messages.join("\n\n");

		if (hookEvent === "Stop") {
			return {
				decision: "block",
				reason: combinedMessage,
				systemMessage: combinedMessage,
			};
		}
		if (hookEvent === "PreToolUse" || hookEvent === "PostToolUse") {
			return {
				hookSpecificOutput: {
					hookEventName: hookEvent,
					permissionDecision: "deny",
				},
				systemMessage: combinedMessage,
			};
		}
		return { systemMessage: combinedMessage };
	}

	// Warning rules
	if (warningRules.length > 0) {
		const messages = warningRules.map((r) => `**[${r.name}]**\n${r.message}`);
		return { systemMessage: messages.join("\n\n") };
	}

	// No matches
	return {};
}
