#!/usr/bin/env bun
/**
 * Note Structure Validator
 *
 * Validates the structure and content of Zettelkasten notes.
 * Checks for atomicity, proper headings, connections, and content quality.
 */

import type { NoteType, ParsedNote, ValidationError, ValidationResult } from "../types";
import { getMarkdownFiles, parseNote } from "../utils/parser";

// Structure requirements by note type
interface StructureRequirements {
	minWordCount: number;
	maxWordCount: number;
	minLinks: number;
	requiresH1: boolean;
	requiredSections: string[];
	minCodeBlocks?: number;
}

const STRUCTURE_REQUIREMENTS: Record<NoteType, StructureRequirements> = {
	permanent: {
		minWordCount: 50,
		maxWordCount: 1000,
		minLinks: 1,
		requiresH1: true,
		requiredSections: [],
	},
	literature: {
		minWordCount: 100,
		maxWordCount: 5000,
		minLinks: 0,
		requiresH1: true,
		requiredSections: ["Key Ideas", "Summary"],
	},
	fleeting: {
		minWordCount: 10,
		maxWordCount: 500,
		minLinks: 0,
		requiresH1: false,
		requiredSections: [],
	},
	moc: {
		minWordCount: 50,
		maxWordCount: 3000,
		minLinks: 3,
		requiresH1: true,
		requiredSections: [],
	},
	daily: {
		minWordCount: 0,
		maxWordCount: 5000,
		minLinks: 0,
		requiresH1: false,
		requiredSections: [],
	},
	project: {
		minWordCount: 50,
		maxWordCount: 5000,
		minLinks: 0,
		requiresH1: true,
		requiredSections: ["Objective"],
	},
};

/**
 * Check if note is atomic (single concept)
 */
function checkAtomicity(note: ParsedNote): ValidationError[] {
	const errors: ValidationError[] = [];
	const { headings, content, path, frontmatter } = note;

	// Skip atomicity check for non-permanent notes
	if (frontmatter?.type !== "permanent") {
		return errors;
	}

	// Too many H2 sections might indicate multiple concepts
	const h2Count = headings.filter((h) => h.level === 2).length;
	if (h2Count > 5) {
		errors.push({
			file: path,
			field: "structure",
			message: `Note has ${h2Count} H2 sections. Consider splitting into multiple notes for atomicity`,
			severity: "warning",
		});
	}

	// Check for multiple distinct topics (rough heuristic)
	const contentLower = content.toLowerCase();
	const topicIndicators = [
		"on the other hand",
		"another topic",
		"separately",
		"unrelated",
		"additionally, a different",
	];

	for (const indicator of topicIndicators) {
		if (contentLower.includes(indicator)) {
			errors.push({
				file: path,
				field: "atomicity",
				message: `Phrase "${indicator}" suggests multiple topics. Consider splitting`,
				severity: "info",
			});
			break;
		}
	}

	return errors;
}

/**
 * Check heading structure
 */
function checkHeadings(note: ParsedNote): ValidationError[] {
	const errors: ValidationError[] = [];
	const { headings, path, frontmatter } = note;

	const noteType = frontmatter?.type || "permanent";
	const requirements = STRUCTURE_REQUIREMENTS[noteType] || STRUCTURE_REQUIREMENTS.permanent;

	// Check for H1
	const h1Headings = headings.filter((h) => h.level === 1);

	if (requirements.requiresH1 && h1Headings.length === 0) {
		errors.push({
			file: path,
			field: "headings",
			message: "Missing H1 heading (title)",
			severity: "warning",
		});
	}

	if (h1Headings.length > 1) {
		errors.push({
			file: path,
			field: "headings",
			message: `Multiple H1 headings found (${h1Headings.length}). Should have only one`,
			severity: "warning",
		});
	}

	// Check for heading level jumps (e.g., H1 -> H3 without H2)
	let previousLevel = 0;
	for (const heading of headings) {
		if (heading.level > previousLevel + 1 && previousLevel > 0) {
			errors.push({
				file: path,
				field: "headings",
				message: `Heading level jump from H${previousLevel} to H${heading.level} at line ${heading.line}`,
				severity: "info",
			});
		}
		previousLevel = heading.level;
	}

	// Check for required sections
	for (const required of requirements.requiredSections) {
		const found = headings.some(
			(h) =>
				h.text.toLowerCase().includes(required.toLowerCase()) ||
				required.toLowerCase().includes(h.text.toLowerCase()),
		);
		if (!found) {
			errors.push({
				file: path,
				field: "sections",
				message: `Missing required section "${required}"`,
				severity: "warning",
			});
		}
	}

	return errors;
}

/**
 * Check content quality
 */
function checkContent(note: ParsedNote): ValidationError[] {
	const errors: ValidationError[] = [];
	const { wordCount, content, path, frontmatter } = note;

	const noteType = frontmatter?.type || "permanent";
	const requirements = STRUCTURE_REQUIREMENTS[noteType] || STRUCTURE_REQUIREMENTS.permanent;

	// Word count checks
	if (wordCount < requirements.minWordCount) {
		errors.push({
			file: path,
			field: "content",
			message: `Note is too short (${wordCount} words). Minimum for ${noteType}: ${requirements.minWordCount}`,
			severity: noteType === "permanent" ? "warning" : "info",
		});
	}

	if (wordCount > requirements.maxWordCount) {
		errors.push({
			file: path,
			field: "content",
			message: `Note is too long (${wordCount} words). Maximum for ${noteType}: ${requirements.maxWordCount}. Consider splitting`,
			severity: "warning",
		});
	}

	// Check for empty content
	if (content.trim().length === 0) {
		errors.push({
			file: path,
			field: "content",
			message: "Note has no content",
			severity: "error",
		});
	}

	// Check for placeholder content
	const placeholders = ["TODO", "FIXME", "[PLACEHOLDER]", "Lorem ipsum", "xxx"];
	const contentLower = content.toLowerCase();

	for (const placeholder of placeholders) {
		if (contentLower.includes(placeholder.toLowerCase())) {
			errors.push({
				file: path,
				field: "content",
				message: `Contains placeholder text: "${placeholder}"`,
				severity: "warning",
			});
		}
	}

	// Check for excessive quotes (literature notes may have more)
	if (noteType === "permanent") {
		const quoteMatches = content.match(/^>\s/gm);
		const quoteCount = quoteMatches ? quoteMatches.length : 0;

		if (quoteCount > 3) {
			errors.push({
				file: path,
				field: "content",
				message: `Many blockquotes (${quoteCount}). Permanent notes should be in your own words`,
				severity: "warning",
			});
		}
	}

	return errors;
}

/**
 * Check links and connections
 */
function checkConnections(note: ParsedNote): ValidationError[] {
	const errors: ValidationError[] = [];
	const { links, path, frontmatter } = note;

	const noteType = frontmatter?.type || "permanent";
	const requirements = STRUCTURE_REQUIREMENTS[noteType] || STRUCTURE_REQUIREMENTS.permanent;

	// Check minimum links
	if (links.length < requirements.minLinks) {
		errors.push({
			file: path,
			field: "links",
			message: `Insufficient links (${links.length}). ${noteType} notes should have at least ${requirements.minLinks}`,
			severity: noteType === "permanent" ? "warning" : "info",
		});
	}

	// For permanent notes, check for "Connections" section
	if (noteType === "permanent" && links.length > 0) {
		const { headings } = note;
		const hasConnectionsSection = headings.some(
			(h) =>
				h.text.toLowerCase().includes("connection") ||
				h.text.toLowerCase().includes("links") ||
				h.text.toLowerCase().includes("related"),
		);

		if (!hasConnectionsSection) {
			errors.push({
				file: path,
				field: "structure",
				message: 'Consider adding a "Connections" section to explain link relationships',
				severity: "info",
			});
		}
	}

	return errors;
}

/**
 * Validate structure for a single note
 */
export function validateStructure(note: ParsedNote): ValidationError[] {
	const errors: ValidationError[] = [];

	errors.push(...checkAtomicity(note));
	errors.push(...checkHeadings(note));
	errors.push(...checkContent(note));
	errors.push(...checkConnections(note));

	return errors;
}

/**
 * Validate all notes in a vault
 */
export async function validateVaultStructure(
	vaultPath: string,
	exclude: string[] = [".vectors", ".obsidian", "templates"],
): Promise<ValidationResult[]> {
	const files = await getMarkdownFiles(vaultPath, exclude);
	const results: ValidationResult[] = [];

	for (const file of files) {
		const note = await parseNote(file);
		const errors = validateStructure(note);

		const validationErrors = errors.filter((e) => e.severity === "error");
		const warnings = errors.filter((e) => e.severity === "warning");
		const info = errors.filter((e) => e.severity === "info");

		results.push({
			file,
			valid: validationErrors.length === 0,
			errors: validationErrors,
			warnings,
			info,
		});
	}

	return results;
}

// CLI entry point
if (import.meta.main) {
	const vaultPath = process.argv[2] || process.cwd();

	console.log(`\nValidating structure in: ${vaultPath}\n`);

	const results = await validateVaultStructure(vaultPath);

	const totalNotes = results.length;
	const issueNotes = results.filter((r) => !r.valid || r.warnings.length > 0).length;
	const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
	const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
	const totalInfo = results.reduce((sum, r) => sum + r.info.length, 0);

	// Print results with issues
	for (const result of results) {
		if (!result.valid || result.warnings.length > 0) {
			const filename = result.file.split("/").pop();
			const status = result.valid ? "\x1b[33mWARN\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
			console.log(`${status} ${filename}`);

			for (const error of result.errors) {
				console.log(`  \x1b[31mERROR\x1b[0m [${error.field}] ${error.message}`);
			}
			for (const warning of result.warnings) {
				console.log(`  \x1b[33mWARN\x1b[0m  [${warning.field}] ${warning.message}`);
			}
		}
	}

	console.log(`\n${"─".repeat(50)}`);
	console.log(`Total: ${totalNotes} | With Issues: ${issueNotes}`);
	console.log(`Errors: ${totalErrors} | Warnings: ${totalWarnings} | Info: ${totalInfo}`);
	console.log(`${"─".repeat(50)}\n`);

	process.exit(totalErrors > 0 ? 1 : 0);
}

export { validateStructure, validateVaultStructure };
