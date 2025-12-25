/**
 * Git operations bridge
 * Handles all Git worktree operations
 */

import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "bun";
import { logger } from "./logger";
import type { WorktreeInfo } from "./types";

export class GitBridge {
	async isGitRepository(path: string = process.cwd()): Promise<boolean> {
		try {
			const result = await $`git -C ${path} rev-parse --git-dir`.quiet();
			return result.exitCode === 0;
		} catch {
			return false;
		}
	}

	async getCurrentBranch(): Promise<string> {
		const result = await $`git branch --show-current`.text();
		return result.trim();
	}

	async getDefaultBranch(): Promise<string> {
		try {
			const result = await $`git symbolic-ref refs/remotes/origin/HEAD`.text();
			const branch = result.trim().replace("refs/remotes/origin/", "");
			return branch || "main";
		} catch {
			return "main";
		}
	}

	async worktreeExists(path: string): Promise<boolean> {
		const worktrees = await this.listWorktrees();
		return worktrees.some((w) => w.path === path);
	}

	async listWorktrees(): Promise<WorktreeInfo[]> {
		try {
			const result = await $`git worktree list --porcelain`.text();
			return this.parseWorktreeList(result);
		} catch (error) {
			logger.error("Failed to list worktrees", error);
			return [];
		}
	}

	private parseWorktreeList(output: string): WorktreeInfo[] {
		const worktrees: WorktreeInfo[] = [];
		const entries = output.split("\n\n").filter(Boolean);

		for (const entry of entries) {
			const lines = entry.split("\n");
			const info: Partial<WorktreeInfo> = {
				locked: false,
				prunable: false,
				created: new Date().toISOString(),
			};

			for (const line of lines) {
				if (line.startsWith("worktree ")) {
					info.path = line.replace("worktree ", "");
				} else if (line.startsWith("HEAD ")) {
					info.commit = line.replace("HEAD ", "");
				} else if (line.startsWith("branch ")) {
					info.branch = line.replace("branch ", "").replace("refs/heads/", "");
				} else if (line === "locked") {
					info.locked = true;
				} else if (line === "prunable") {
					info.prunable = true;
				}
			}

			if (info.path && info.branch && info.commit) {
				worktrees.push(info as WorktreeInfo);
			}
		}

		return worktrees;
	}

	async createWorktree(
		path: string,
		branchName: string,
		baseBranch?: string,
	): Promise<void> {
		logger.info(`Creating worktree: ${path}`);
		logger.debug("Branch details", { branchName, baseBranch });

		if (await this.worktreeExists(path)) {
			logger.warn("Worktree already exists, removing...");
			await this.removeWorktree(path);
		}

		try {
			if (baseBranch) {
				await $`git worktree add -b ${branchName} ${path} ${baseBranch}`;
			} else {
				await $`git worktree add -b ${branchName} ${path}`;
			}

			logger.success(`Worktree created: ${path}`);
		} catch (error: any) {
			logger.error("Failed to create worktree", error);
			throw new Error(`Git worktree creation failed: ${error.message}`);
		}
	}

	async removeWorktree(path: string, force = true): Promise<void> {
		logger.info(`Removing worktree: ${path}`);

		try {
			if (force) {
				await $`git worktree remove ${path} --force`;
			} else {
				await $`git worktree remove ${path}`;
			}

			logger.success(`Worktree removed: ${path}`);
		} catch (error: any) {
			// Try manual removal if git command fails
			if (existsSync(path)) {
				logger.warn("Git command failed, attempting manual removal...");
				await $`rm -rf ${path}`;
			}
		}
	}

	async pruneWorktrees(): Promise<void> {
		logger.info("Pruning worktrees...");

		try {
			await $`git worktree prune`;
			logger.success("Worktrees pruned");
		} catch (error) {
			logger.error("Failed to prune worktrees", error);
		}
	}

	async branchExists(branchName: string): Promise<boolean> {
		try {
			const result = await $`git rev-parse --verify ${branchName}`.quiet();
			return result.exitCode === 0;
		} catch {
			return false;
		}
	}

	async deleteBranch(branchName: string, force = false): Promise<void> {
		logger.info(`Deleting branch: ${branchName}`);

		try {
			if (force) {
				await $`git branch -D ${branchName}`;
			} else {
				await $`git branch -d ${branchName}`;
			}

			logger.success(`Branch deleted: ${branchName}`);
		} catch (error: any) {
			logger.error("Failed to delete branch", error);
			throw new Error(`Branch deletion failed: ${error.message}`);
		}
	}

	async getRepositoryRoot(): Promise<string> {
		const result = await $`git rev-parse --show-toplevel`.text();
		return result.trim();
	}

	async getRepositoryName(): Promise<string> {
		const root = await this.getRepositoryRoot();
		return root.split("/").pop() || "unknown";
	}
}
