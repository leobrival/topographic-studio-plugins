#!/usr/bin/env bun
/**
 * Zettelkasten Validation Suite
 *
 * Main entry point for validating Obsidian Zettelkasten notes.
 * Combines frontmatter, structure, and link validation.
 */

import type {
	NoteStatus,
	NoteType,
	ValidationReport,
	ValidationResult,
	ValidationSummary,
} from "./types";
import { getMarkdownFiles, parseNote } from "./utils/parser";
import { exportReportJSON, exportReportMarkdown, printReport } from "./utils/reporter";
import { validateFrontmatter } from "./validators/frontmatter";
import {
	findOrphanNotes,
	findWeaklyConnected,
	validateVaultLinks,
} from "./validators/links";
import { validateStructure } from "./validators/structure";

interface ValidateOptions {
	vaultPath: string;
	strict?: boolean;
	output?: "console" | "json" | "markdown";
	outputFile?: string;
	exclude?: string[];
}

/**
 * Run full validation suite
 */
async function validate(options: ValidateOptions): Promise<ValidationReport> {
	const {
		vaultPath,
		strict = false,
		exclude = [".vectors", ".obsidian", "templates", "node_modules"],
	} = options;

	const startTime = Date.now();

	// Get all files
	const files = await getMarkdownFiles(vaultPath, exclude);
	const results: ValidationResult[] = [];

	// Build summary counters
	const summary: ValidationSummary = {
		byType: {
			permanent: 0,
			literature: 0,
			fleeting: 0,
			moc: 0,
			daily: 0,
			project: 0,
			unknown: 0,
		},
		byStatus: {
			seedling: 0,
			budding: 0,
			evergreen: 0,
			unknown: 0,
		},
		orphanNotes: 0,
		missingFrontmatter: 0,
		invalidDates: 0,
		missingLinks: 0,
		brokenLinks: 0,
	};

	// Validate each file
	for (const file of files) {
		const note = await parseNote(file);

		// Collect all errors
		const allErrors = [
			...validateFrontmatter(note),
			...validateStructure(note),
		];

		// Count by type
		const noteType = (note.frontmatter?.type as NoteType) || "unknown";
		if (summary.byType[noteType] !== undefined) {
			summary.byType[noteType]++;
		} else {
			summary.byType.unknown++;
		}

		// Count by status
		const status = (note.frontmatter?.status as NoteStatus) || "unknown";
		if (summary.byStatus[status] !== undefined) {
			summary.byStatus[status]++;
		} else {
			summary.byStatus.unknown++;
		}

		// Track specific issues
		if (!note.frontmatter) {
			summary.missingFrontmatter++;
		}

		if (note.links.length === 0 && noteType === "permanent") {
			summary.missingLinks++;
		}

		const validationErrors = allErrors.filter((e) => e.severity === "error");
		const warnings = allErrors.filter((e) => e.severity === "warning");
		const info = allErrors.filter((e) => e.severity === "info");

		// In strict mode, warnings become errors
		const effectiveErrors = strict
			? [...validationErrors, ...warnings]
			: validationErrors;

		results.push({
			file,
			valid: effectiveErrors.length === 0,
			errors: effectiveErrors,
			warnings: strict ? [] : warnings,
			info,
		});
	}

	// Run link validation
	const { orphans, brokenLinksCount } = await validateVaultLinks(vaultPath, exclude);
	summary.orphanNotes = orphans.length;
	summary.brokenLinks = brokenLinksCount;

	// Update results with link errors
	for (const result of results) {
		if (orphans.includes(result.file.split("/").pop()?.replace(/\.md$/, "") || "")) {
			result.warnings.push({
				file: result.file,
				field: "links",
				message: "Orphan note: no incoming or outgoing links",
				severity: "warning",
			});
		}
	}

	// Build report
	const report: ValidationReport = {
		timestamp: new Date().toISOString(),
		vaultPath,
		totalNotes: files.length,
		validNotes: results.filter((r) => r.valid).length,
		invalidNotes: results.filter((r) => !r.valid).length,
		totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
		totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
		results,
		summary,
	};

	const elapsed = Date.now() - startTime;
	console.log(`\nValidation completed in ${elapsed}ms\n`);

	return report;
}

/**
 * Parse command line arguments
 */
function parseArgs(): ValidateOptions {
	const args = process.argv.slice(2);
	const options: ValidateOptions = {
		vaultPath: process.cwd(),
		output: "console",
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === "--strict" || arg === "-s") {
			options.strict = true;
		} else if (arg === "--output" || arg === "-o") {
			options.output = args[++i] as "console" | "json" | "markdown";
		} else if (arg === "--file" || arg === "-f") {
			options.outputFile = args[++i];
		} else if (arg === "--exclude" || arg === "-e") {
			options.exclude = options.exclude || [];
			options.exclude.push(args[++i]);
		} else if (arg === "--help" || arg === "-h") {
			console.log(`
Zettelkasten Validation Suite

Usage:
  bun run src/index.ts [vault-path] [options]

Options:
  --strict, -s      Treat warnings as errors
  --output, -o      Output format: console, json, markdown (default: console)
  --file, -f        Output file path (for json/markdown)
  --exclude, -e     Exclude pattern (can be used multiple times)
  --help, -h        Show this help message

Examples:
  bun run src/index.ts ~/Documents/Obsidian/MyVault
  bun run src/index.ts . --strict
  bun run src/index.ts . --output json --file report.json
  bun run src/index.ts . --exclude "archive" --exclude "drafts"
`);
			process.exit(0);
		} else if (!arg.startsWith("-")) {
			options.vaultPath = arg;
		}
	}

	return options;
}

// Main entry point
if (import.meta.main) {
	const options = parseArgs();

	console.log(`
╔════════════════════════════════════════════════════════╗
║         ZETTELKASTEN VALIDATION SUITE                 ║
╚════════════════════════════════════════════════════════╝
`);

	console.log(`Vault: ${options.vaultPath}`);
	console.log(`Mode: ${options.strict ? "strict" : "normal"}`);

	try {
		const report = await validate(options);

		switch (options.output) {
			case "json": {
				const json = exportReportJSON(report);
				if (options.outputFile) {
					await Bun.write(options.outputFile, json);
					console.log(`Report saved to: ${options.outputFile}`);
				} else {
					console.log(json);
				}
				break;
			}

			case "markdown": {
				const md = exportReportMarkdown(report);
				if (options.outputFile) {
					await Bun.write(options.outputFile, md);
					console.log(`Report saved to: ${options.outputFile}`);
				} else {
					console.log(md);
				}
				break;
			}

			default:
				printReport(report);
		}

		// Exit with error code if invalid notes found
		process.exit(report.invalidNotes > 0 ? 1 : 0);
	} catch (error) {
		console.error("\x1b[31mError:\x1b[0m", error);
		process.exit(1);
	}
}

export { validate };
export type { ValidateOptions };
