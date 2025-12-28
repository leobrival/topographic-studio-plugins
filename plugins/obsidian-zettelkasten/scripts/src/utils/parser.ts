/**
 * Note parsing utilities
 */

import { parse as parseYaml } from "yaml";
import type { Heading, NoteFrontmatter, ParsedNote } from "../types";

/**
 * Extract frontmatter from markdown content
 */
export function extractFrontmatter(content: string): {
	frontmatter: NoteFrontmatter | null;
	rawFrontmatter: string;
	body: string;
} {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		return {
			frontmatter: null,
			rawFrontmatter: "",
			body: content,
		};
	}

	const rawFrontmatter = match[1];
	const body = match[2];

	try {
		const frontmatter = parseYaml(rawFrontmatter) as NoteFrontmatter;
		return { frontmatter, rawFrontmatter, body };
	} catch {
		return {
			frontmatter: null,
			rawFrontmatter,
			body,
		};
	}
}

/**
 * Extract wikilinks from content
 */
export function extractLinks(content: string): string[] {
	const linkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
	const links: string[] = [];
	let match: RegExpExecArray | null;

	while (true) {
		match = linkRegex.exec(content);
		if (match === null) break;
		links.push(match[1]);
	}

	return [...new Set(links)];
}

/**
 * Extract tags from content (both YAML and inline)
 */
export function extractTags(
	content: string,
	frontmatter: NoteFrontmatter | null,
): string[] {
	const tags = new Set<string>();

	// From frontmatter
	if (frontmatter?.tags) {
		for (const tag of frontmatter.tags) {
			tags.add(tag);
		}
	}

	// Inline tags (excluding code blocks)
	const withoutCodeBlocks = content.replace(/```[\s\S]*?```/g, "");
	const tagRegex = /(?:^|\s)#([a-zA-Z][a-zA-Z0-9_/-]*)/g;
	let match: RegExpExecArray | null;

	while (true) {
		match = tagRegex.exec(withoutCodeBlocks);
		if (match === null) break;
		tags.add(match[1]);
	}

	return [...tags];
}

/**
 * Extract headings from content
 */
export function extractHeadings(content: string): Heading[] {
	const headings: Heading[] = [];
	const lines = content.split("\n");

	let inCodeBlock = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		if (line.startsWith("```")) {
			inCodeBlock = !inCodeBlock;
			continue;
		}

		if (inCodeBlock) continue;

		const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
		if (headingMatch) {
			headings.push({
				level: headingMatch[1].length,
				text: headingMatch[2],
				line: i + 1,
			});
		}
	}

	return headings;
}

/**
 * Count code blocks in content
 */
export function countCodeBlocks(content: string): number {
	const matches = content.match(/```/g);
	return matches ? Math.floor(matches.length / 2) : 0;
}

/**
 * Count words in content (excluding code blocks and frontmatter)
 */
export function countWords(content: string): number {
	// Remove code blocks
	const withoutCode = content.replace(/```[\s\S]*?```/g, "");
	// Remove frontmatter
	const withoutFrontmatter = withoutCode.replace(/^---[\s\S]*?---\n?/, "");
	// Count words
	const words = withoutFrontmatter.match(/\b\w+\b/g);
	return words ? words.length : 0;
}

/**
 * Parse a complete note
 */
export async function parseNote(filePath: string): Promise<ParsedNote> {
	const file = Bun.file(filePath);
	const content = await file.text();
	const filename = filePath.split("/").pop() || "";

	const { frontmatter, rawFrontmatter, body } = extractFrontmatter(content);
	const links = extractLinks(body);
	const tags = extractTags(body, frontmatter);
	const headings = extractHeadings(body);
	const codeBlocks = countCodeBlocks(body);
	const wordCount = countWords(content);

	return {
		path: filePath,
		filename,
		frontmatter,
		content: body,
		rawFrontmatter,
		links,
		tags,
		headings,
		codeBlocks,
		wordCount,
	};
}

/**
 * Get all markdown files in a directory
 */
export async function getMarkdownFiles(
	dirPath: string,
	exclude: string[] = [],
): Promise<string[]> {
	const glob = new Bun.Glob("**/*.md");
	const files: string[] = [];

	for await (const file of glob.scan({ cwd: dirPath, absolute: true })) {
		// Check exclusions
		const shouldExclude = exclude.some(
			(pattern) => file.includes(pattern) || file.match(new RegExp(pattern)),
		);

		if (!shouldExclude) {
			files.push(file);
		}
	}

	return files;
}
