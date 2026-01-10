/**
 * Output formatters
 * Handles formatting of output for different contexts
 */

import type { CleanupResult, WorktreeInfo, WorktreeResult } from "./types";

export class Formatters {
	static formatWorktreeInfo(worktree: WorktreeInfo): string {
		const status = worktree.locked
			? "🔒 LOCKED"
			: worktree.prunable
				? "⚠️  PRUNABLE"
				: "✅ ACTIVE";

		return `
${status} ${worktree.branch}
  Path:   ${worktree.path}
  Commit: ${worktree.commit.substring(0, 8)}
  ${worktree.issueUrl ? `Issue:  ${worktree.issueUrl}` : ""}
    `.trim();
	}

	static formatWorktreeList(worktrees: WorktreeInfo[]): string {
		if (worktrees.length === 0) {
			return "No worktrees found.";
		}

		const sections = worktrees.map((w) => Formatters.formatWorktreeInfo(w));
		return sections.join("\n\n");
	}

	static formatWorktreeResult(result: WorktreeResult): string {
		if (!result.success) {
			return `❌ Error: ${result.error}`;
		}

		return `
✅ Worktree created successfully!

Branch:     ${result.branchName}
Path:       ${result.worktreePath}
${result.metadata?.issueUrl ? `Issue:      ${result.metadata.issueUrl}` : ""}
${result.metadata?.repository ? `Repository: ${result.metadata.repository}` : ""}

Created at: ${result.metadata?.createdAt}
    `.trim();
	}

	static formatCleanupResult(result: CleanupResult): string {
		if (!result.success) {
			return `❌ Cleanup failed with ${result.errors.length} errors`;
		}

		if (result.totalCleaned === 0) {
			return "✅ No worktrees to clean";
		}

		let output = `✅ Cleanup completed: ${result.totalCleaned} worktree(s) removed\n\n`;

		if (result.removed.length > 0) {
			output += "Removed:\n";
			result.removed.forEach((path) => {
				output += `  - ${path}\n`;
			});
		}

		if (result.errors.length > 0) {
			output += "\nErrors:\n";
			result.errors.forEach((error) => {
				output += `  ⚠️  ${error}\n`;
			});
		}

		return output.trim();
	}

	static formatRaycastOutput(data: {
		title: string;
		message: string;
		path?: string;
	}): string {
		return `
# ${data.title}

${data.message}
${data.path ? `\nPath: \`${data.path}\`` : ""}
    `.trim();
	}

	static formatError(error: string): string {
		return `❌ Error: ${error}`;
	}

	static formatTable(data: Record<string, string>[]): string {
		if (data.length === 0) return "";

		const keys = Object.keys(data[0]);
		const colWidths = keys.map((key) =>
			Math.max(key.length, ...data.map((row) => String(row[key]).length)),
		);

		const header = keys.map((key, i) => key.padEnd(colWidths[i])).join(" | ");
		const separator = colWidths.map((w) => "-".repeat(w)).join("-|-");

		const rows = data.map((row) =>
			keys.map((key, i) => String(row[key]).padEnd(colWidths[i])).join(" | "),
		);

		return [header, separator, ...rows].join("\n");
	}

	static formatDuration(ms: number): string {
		if (ms < 1000) return `${ms}ms`;
		if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
		return `${(ms / 60000).toFixed(1)}m`;
	}

	static formatSize(bytes: number): string {
		const units = ["B", "KB", "MB", "GB"];
		let size = bytes;
		let unitIndex = 0;

		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}

		return `${size.toFixed(1)}${units[unitIndex]}`;
	}
}
