#!/usr/bin/env bun
/**
 * Link Validator
 *
 * Validates links between notes in a Zettelkasten.
 * Checks for broken links, orphan notes, and link quality.
 */

import type { ParsedNote, ValidationError, ValidationResult } from "../types";
import { getMarkdownFiles, parseNote } from "../utils/parser";

interface NoteIndex {
	[key: string]: {
		path: string;
		title: string;
		aliases: string[];
		links: string[];
		type: string;
	};
}

/**
 * Build an index of all notes
 */
async function buildNoteIndex(
	vaultPath: string,
	exclude: string[],
): Promise<NoteIndex> {
	const files = await getMarkdownFiles(vaultPath, exclude);
	const index: NoteIndex = {};

	for (const file of files) {
		const note = await parseNote(file);
		const filename = note.filename.replace(/\.md$/, "");

		index[filename] = {
			path: file,
			title: note.frontmatter?.title || filename,
			aliases: note.frontmatter?.aliases || [],
			links: note.links,
			type: note.frontmatter?.type || "unknown",
		};
	}

	return index;
}

/**
 * Resolve a link target to a note
 */
function resolveLink(link: string, index: NoteIndex): string | null {
	// Direct match by filename
	if (index[link]) {
		return link;
	}

	// Match by filename without extension
	const withoutExt = link.replace(/\.md$/, "");
	if (index[withoutExt]) {
		return withoutExt;
	}

	// Match by alias
	for (const [key, note] of Object.entries(index)) {
		if (note.aliases.includes(link)) {
			return key;
		}
		if (note.title.toLowerCase() === link.toLowerCase()) {
			return key;
		}
	}

	// Match by partial filename (for paths like folder/note)
	const basename = link.split("/").pop() || link;
	if (index[basename]) {
		return basename;
	}

	return null;
}

/**
 * Validate links for a single note
 */
export function validateLinks(
	note: ParsedNote,
	index: NoteIndex,
): ValidationError[] {
	const errors: ValidationError[] = [];
	const { links, path, filename } = note;

	const currentNote = filename.replace(/\.md$/, "");

	for (const link of links) {
		const resolved = resolveLink(link, index);

		if (!resolved) {
			errors.push({
				file: path,
				field: "link",
				message: `Broken link: [[${link}]] - target not found`,
				severity: "error",
			});
		} else if (resolved === currentNote) {
			errors.push({
				file: path,
				field: "link",
				message: `Self-referencing link: [[${link}]]`,
				severity: "warning",
			});
		}
	}

	return errors;
}

/**
 * Find orphan notes (no incoming or outgoing links)
 */
export function findOrphanNotes(index: NoteIndex): string[] {
	const orphans: string[] = [];

	// Build incoming links map
	const incomingLinks: Record<string, string[]> = {};
	for (const key of Object.keys(index)) {
		incomingLinks[key] = [];
	}

	for (const [sourceKey, sourceNote] of Object.entries(index)) {
		for (const link of sourceNote.links) {
			const resolved = resolveLink(link, index);
			if (resolved && incomingLinks[resolved]) {
				incomingLinks[resolved].push(sourceKey);
			}
		}
	}

	// Find orphans
	for (const [key, note] of Object.entries(index)) {
		// Skip fleeting and daily notes
		if (note.type === "fleeting" || note.type === "daily") {
			continue;
		}

		const hasOutgoing = note.links.length > 0;
		const hasIncoming = incomingLinks[key].length > 0;

		if (!hasOutgoing && !hasIncoming) {
			orphans.push(key);
		}
	}

	return orphans;
}

/**
 * Find notes with weak connections (few links)
 */
export function findWeaklyConnected(
	index: NoteIndex,
	minLinks = 2,
): string[] {
	const weak: string[] = [];

	// Build incoming links map
	const incomingLinks: Record<string, number> = {};
	for (const key of Object.keys(index)) {
		incomingLinks[key] = 0;
	}

	for (const [_, sourceNote] of Object.entries(index)) {
		for (const link of sourceNote.links) {
			const resolved = resolveLink(link, index);
			if (resolved && incomingLinks[resolved] !== undefined) {
				incomingLinks[resolved]++;
			}
		}
	}

	// Find weakly connected
	for (const [key, note] of Object.entries(index)) {
		// Skip fleeting and daily notes
		if (note.type === "fleeting" || note.type === "daily") {
			continue;
		}

		const totalConnections = note.links.length + incomingLinks[key];
		if (totalConnections < minLinks && note.type === "permanent") {
			weak.push(key);
		}
	}

	return weak;
}

/**
 * Find potential duplicate links (same note linked multiple times)
 */
export function findDuplicateLinks(note: ParsedNote): string[] {
	const seen = new Set<string>();
	const duplicates: string[] = [];

	for (const link of note.links) {
		const normalized = link.toLowerCase().replace(/\.md$/, "");
		if (seen.has(normalized)) {
			duplicates.push(link);
		} else {
			seen.add(normalized);
		}
	}

	return duplicates;
}

/**
 * Validate all links in a vault
 */
export async function validateVaultLinks(
	vaultPath: string,
	exclude: string[] = [".vectors", ".obsidian", "templates"],
): Promise<{
	results: ValidationResult[];
	orphans: string[];
	weaklyConnected: string[];
	brokenLinksCount: number;
}> {
	const index = await buildNoteIndex(vaultPath, exclude);
	const files = await getMarkdownFiles(vaultPath, exclude);
	const results: ValidationResult[] = [];
	let brokenLinksCount = 0;

	for (const file of files) {
		const note = await parseNote(file);
		const errors = validateLinks(note, index);

		// Check for duplicate links
		const duplicates = findDuplicateLinks(note);
		for (const dup of duplicates) {
			errors.push({
				file,
				field: "link",
				message: `Duplicate link: [[${dup}]]`,
				severity: "info",
			});
		}

		const validationErrors = errors.filter((e) => e.severity === "error");
		const warnings = errors.filter((e) => e.severity === "warning");
		const info = errors.filter((e) => e.severity === "info");

		brokenLinksCount += validationErrors.length;

		results.push({
			file,
			valid: validationErrors.length === 0,
			errors: validationErrors,
			warnings,
			info,
		});
	}

	const orphans = findOrphanNotes(index);
	const weaklyConnected = findWeaklyConnected(index);

	return {
		results,
		orphans,
		weaklyConnected,
		brokenLinksCount,
	};
}

// CLI entry point
if (import.meta.main) {
	const vaultPath = process.argv[2] || process.cwd();

	console.log(`\nValidating links in: ${vaultPath}\n`);

	const { results, orphans, weaklyConnected, brokenLinksCount } =
		await validateVaultLinks(vaultPath);

	const totalNotes = results.length;
	const notesWithBrokenLinks = results.filter((r) => !r.valid).length;

	// Print broken links
	if (brokenLinksCount > 0) {
		console.log("\x1b[31m─ Broken Links ─\x1b[0m\n");
		for (const result of results) {
			if (result.errors.length > 0) {
				const filename = result.file.split("/").pop();
				console.log(`\x1b[31mFAIL\x1b[0m ${filename}`);
				for (const error of result.errors) {
					console.log(`  \x1b[31mERROR\x1b[0m ${error.message}`);
				}
			}
		}
	}

	// Print orphan notes
	if (orphans.length > 0) {
		console.log("\n\x1b[33m─ Orphan Notes (no connections) ─\x1b[0m\n");
		for (const orphan of orphans) {
			console.log(`  \x1b[33mORPHAN\x1b[0m ${orphan}`);
		}
	}

	// Print weakly connected notes
	if (weaklyConnected.length > 0) {
		console.log("\n\x1b[34m─ Weakly Connected (<2 total links) ─\x1b[0m\n");
		for (const weak of weaklyConnected.slice(0, 10)) {
			console.log(`  \x1b[34mWEAK\x1b[0m ${weak}`);
		}
		if (weaklyConnected.length > 10) {
			console.log(`  ... and ${weaklyConnected.length - 10} more`);
		}
	}

	console.log(`\n${"─".repeat(50)}`);
	console.log(`Total Notes: ${totalNotes}`);
	console.log(`Broken Links: ${brokenLinksCount} in ${notesWithBrokenLinks} notes`);
	console.log(`Orphan Notes: ${orphans.length}`);
	console.log(`Weakly Connected: ${weaklyConnected.length}`);
	console.log(`${"─".repeat(50)}\n`);

	process.exit(brokenLinksCount > 0 ? 1 : 0);
}

export {
	validateLinks,
	validateVaultLinks,
	findOrphanNotes,
	findWeaklyConnected,
	buildNoteIndex,
};
