/**
 * Formatting utilities for displaying crawl results
 */

import type { CrawlStats, PageResult } from "./types";

export class Formatters {
	static formatDuration(seconds: number): string {
		if (seconds < 60) {
			return `${seconds.toFixed(1)}s`;
		}
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}m ${remainingSeconds}s`;
	}

	static formatNumber(num: number): string {
		if (num >= 1000000) {
			return `${(num / 1000000).toFixed(1)}M`;
		}
		if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}K`;
		}
		return num.toString();
	}

	static formatBytes(bytes: number): string {
		if (bytes >= 1024 * 1024) {
			return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
		}
		if (bytes >= 1024) {
			return `${(bytes / 1024).toFixed(2)} KB`;
		}
		return `${bytes} B`;
	}

	static formatSpeed(pagesPerSecond: number): string {
		return `${pagesPerSecond.toFixed(1)} pages/sec`;
	}

	static createProgressBar(percentage: number, width: number = 40): string {
		const filled = Math.floor((percentage / 100) * width);
		const empty = width - filled;
		return `[${"=".repeat(filled)}${" ".repeat(empty)}] ${percentage.toFixed(0)}%`;
	}

	static formatStats(stats: CrawlStats): string {
		const lines = [
			"=".repeat(60),
			"CRAWLING STATISTICS",
			"=".repeat(60),
			`Pages crawled:      ${stats.pagesCrawled}`,
			`Pages found:        ${stats.pagesFound}`,
			`External links:     ${stats.externalLinks}`,
			`Excluded links:     ${stats.excludedLinks}`,
			`Errors:             ${stats.errors}`,
		];

		if (stats.duration) {
			lines.push(
				`Total time:         ${Formatters.formatDuration(stats.duration)}`,
			);

			if (stats.pagesCrawled > 0) {
				const speed = stats.pagesCrawled / stats.duration;
				lines.push(`Average speed:      ${Formatters.formatSpeed(speed)}`);
			}
		}

		lines.push("=".repeat(60));
		return lines.join("\n");
	}

	static formatPageResult(
		page: PageResult,
		showLinks: boolean = false,
	): string {
		const lines = [
			`URL:         ${page.url}`,
			`Title:       ${page.title || "Untitled"}`,
			`Status:      ${page.statusCode}`,
			`Depth:       ${page.depth}`,
			`Content:     ${page.contentType}`,
			`Links found: ${page.links.length}`,
			`Crawled at:  ${page.crawledAt}`,
		];

		if (page.error) {
			lines.push(`Error:       ${page.error}`);
		}

		if (showLinks && page.links.length > 0) {
			lines.push("Links:");
			page.links.slice(0, 10).forEach((link) => {
				lines.push(`  - ${link}`);
			});
			if (page.links.length > 10) {
				lines.push(`  ... and ${page.links.length - 10} more`);
			}
		}

		return lines.join("\n");
	}

	static formatTableRow(columns: string[], widths: number[]): string {
		return (
			"| " +
			columns
				.map((col, i) => {
					const width = widths[i];
					return col.length > width
						? col.substring(0, width - 3) + "..."
						: col.padEnd(width);
				})
				.join(" | ") +
			" |"
		);
	}

	static createSummaryTable(pages: PageResult[]): string {
		const widths = [50, 10, 8, 10];
		const header = Formatters.formatTableRow(
			["URL", "Status", "Depth", "Links"],
			widths,
		);
		const separator =
			"+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+";

		const lines = [separator, header, separator];

		pages.forEach((page) => {
			const row = Formatters.formatTableRow(
				[
					page.url,
					page.statusCode.toString(),
					page.depth.toString(),
					page.links.length.toString(),
				],
				widths,
			);
			lines.push(row);
		});

		lines.push(separator);
		return lines.join("\n");
	}
}
