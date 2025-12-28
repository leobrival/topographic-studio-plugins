/**
 * Validation report utilities
 */

import type { ValidationError, ValidationReport, ValidationResult } from "../types";

// ANSI color codes
const colors = {
	reset: "\x1b[0m",
	bold: "\x1b[1m",
	dim: "\x1b[2m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
	bgRed: "\x1b[41m",
	bgGreen: "\x1b[42m",
	bgYellow: "\x1b[43m",
};

function colorize(text: string, ...codes: string[]): string {
	return `${codes.join("")}${text}${colors.reset}`;
}

/**
 * Format a single validation error
 */
function formatError(error: ValidationError, showFile = false): string {
	const prefix = {
		error: colorize("ERROR", colors.red, colors.bold),
		warning: colorize("WARN", colors.yellow),
		info: colorize("INFO", colors.blue),
	}[error.severity];

	const location = error.line ? `:${error.line}` : "";
	const file = showFile ? colorize(` ${error.file}${location}`, colors.dim) : "";
	const field = error.field ? colorize(` [${error.field}]`, colors.cyan) : "";

	return `  ${prefix}${field} ${error.message}${file}`;
}

/**
 * Format validation result for a single file
 */
function formatResult(result: ValidationResult): string {
	const lines: string[] = [];

	const status = result.valid
		? colorize("PASS", colors.green, colors.bold)
		: colorize("FAIL", colors.red, colors.bold);

	const filename = result.file.split("/").pop() || result.file;
	lines.push(`\n${status} ${colorize(filename, colors.bold)}`);

	if (!result.valid || result.warnings.length > 0) {
		for (const error of result.errors) {
			lines.push(formatError(error));
		}
		for (const warning of result.warnings) {
			lines.push(formatError(warning));
		}
	}

	return lines.join("\n");
}

/**
 * Print validation report to console
 */
export function printReport(report: ValidationReport): void {
	console.log("\n" + colorize("═".repeat(60), colors.dim));
	console.log(colorize(" ZETTELKASTEN VALIDATION REPORT", colors.bold, colors.cyan));
	console.log(colorize("═".repeat(60), colors.dim));

	console.log(`\n${colorize("Vault:", colors.bold)} ${report.vaultPath}`);
	console.log(`${colorize("Time:", colors.bold)} ${report.timestamp}`);

	// Summary stats
	console.log("\n" + colorize("─ Summary ─", colors.dim));

	const passRate = ((report.validNotes / report.totalNotes) * 100).toFixed(1);
	const passColor = report.validNotes === report.totalNotes ? colors.green : colors.yellow;

	console.log(`  Total notes:  ${colorize(String(report.totalNotes), colors.bold)}`);
	console.log(
		`  Valid:        ${colorize(String(report.validNotes), colors.green)} (${passRate}%)`,
	);
	console.log(`  Invalid:      ${colorize(String(report.invalidNotes), colors.red)}`);
	console.log(`  Errors:       ${colorize(String(report.totalErrors), colors.red)}`);
	console.log(`  Warnings:     ${colorize(String(report.totalWarnings), colors.yellow)}`);

	// By type
	console.log("\n" + colorize("─ Notes by Type ─", colors.dim));
	for (const [type, count] of Object.entries(report.summary.byType)) {
		if (count > 0) {
			console.log(`  ${type.padEnd(12)} ${count}`);
		}
	}

	// By status
	console.log("\n" + colorize("─ Notes by Status ─", colors.dim));
	for (const [status, count] of Object.entries(report.summary.byStatus)) {
		if (count > 0) {
			console.log(`  ${status.padEnd(12)} ${count}`);
		}
	}

	// Issues summary
	if (
		report.summary.orphanNotes > 0 ||
		report.summary.brokenLinks > 0 ||
		report.summary.missingFrontmatter > 0
	) {
		console.log("\n" + colorize("─ Issues ─", colors.dim));
		if (report.summary.orphanNotes > 0) {
			console.log(
				`  ${colorize("Orphan notes:", colors.yellow)} ${report.summary.orphanNotes}`,
			);
		}
		if (report.summary.brokenLinks > 0) {
			console.log(
				`  ${colorize("Broken links:", colors.red)} ${report.summary.brokenLinks}`,
			);
		}
		if (report.summary.missingFrontmatter > 0) {
			console.log(
				`  ${colorize("Missing frontmatter:", colors.yellow)} ${report.summary.missingFrontmatter}`,
			);
		}
		if (report.summary.invalidDates > 0) {
			console.log(
				`  ${colorize("Invalid dates:", colors.yellow)} ${report.summary.invalidDates}`,
			);
		}
	}

	// Detailed results for invalid notes
	const invalidResults = report.results.filter((r) => !r.valid);
	if (invalidResults.length > 0) {
		console.log("\n" + colorize("─ Invalid Notes ─", colors.dim));
		for (const result of invalidResults) {
			console.log(formatResult(result));
		}
	}

	// Final status
	console.log("\n" + colorize("═".repeat(60), colors.dim));
	if (report.invalidNotes === 0) {
		console.log(colorize(" All notes are valid!", colors.green, colors.bold));
	} else {
		console.log(
			colorize(` ${report.invalidNotes} note(s) need attention`, colors.red, colors.bold),
		);
	}
	console.log(colorize("═".repeat(60), colors.dim) + "\n");
}

/**
 * Export report as JSON
 */
export function exportReportJSON(report: ValidationReport): string {
	return JSON.stringify(report, null, 2);
}

/**
 * Export report as Markdown
 */
export function exportReportMarkdown(report: ValidationReport): string {
	const lines: string[] = [
		"# Zettelkasten Validation Report",
		"",
		`**Generated:** ${report.timestamp}`,
		`**Vault:** ${report.vaultPath}`,
		"",
		"## Summary",
		"",
		"| Metric | Count |",
		"|--------|-------|",
		`| Total Notes | ${report.totalNotes} |`,
		`| Valid | ${report.validNotes} |`,
		`| Invalid | ${report.invalidNotes} |`,
		`| Errors | ${report.totalErrors} |`,
		`| Warnings | ${report.totalWarnings} |`,
		"",
		"## Notes by Type",
		"",
		"| Type | Count |",
		"|------|-------|",
	];

	for (const [type, count] of Object.entries(report.summary.byType)) {
		if (count > 0) {
			lines.push(`| ${type} | ${count} |`);
		}
	}

	lines.push("", "## Notes by Status", "", "| Status | Count |", "|--------|-------|");

	for (const [status, count] of Object.entries(report.summary.byStatus)) {
		if (count > 0) {
			lines.push(`| ${status} | ${count} |`);
		}
	}

	if (report.invalidNotes > 0) {
		lines.push("", "## Invalid Notes", "");

		for (const result of report.results.filter((r) => !r.valid)) {
			const filename = result.file.split("/").pop();
			lines.push(`### ${filename}`, "");

			for (const error of result.errors) {
				lines.push(`- **ERROR** [${error.field}]: ${error.message}`);
			}
			for (const warning of result.warnings) {
				lines.push(`- **WARN** [${error.field}]: ${warning.message}`);
			}
			lines.push("");
		}
	}

	return lines.join("\n");
}
