/**
 * Main Worktree Manager
 * Orchestrates worktree creation, management, and cleanup
 */

import { join } from "node:path";
import { $ } from "bun";
import type { ConfigManager } from "./config";
import { FileUtils } from "./file-utils";
import { GitBridge } from "./git-bridge";
import { GitHubIntegration } from "./github-integration";
import { logger } from "./logger";
import { PackageManager } from "./package-manager";
import { TerminalLauncher } from "./terminal-launcher";
import type { CleanupResult, WorktreeConfig, WorktreeResult } from "./types";

export class WorktreeManager {
	private git: GitBridge;
	private github: GitHubIntegration;
	private packageManager: PackageManager;
	private fileUtils: FileUtils;
	private configManager: ConfigManager;
	private terminalLauncher: TerminalLauncher;

	constructor(configManager: ConfigManager, scriptsDir: string) {
		this.git = new GitBridge();
		this.github = new GitHubIntegration();
		this.packageManager = new PackageManager();
		this.fileUtils = new FileUtils();
		this.configManager = configManager;
		this.terminalLauncher = new TerminalLauncher(scriptsDir);
	}

	async createWorktree(
		issueUrl: string,
		config: WorktreeConfig,
	): Promise<WorktreeResult> {
		const startTime = Date.now();

		try {
			// Validate git repository
			if (!(await this.git.isGitRepository())) {
				return {
					success: false,
					error:
						"Not a git repository. Run this command from inside a git repository.",
				};
			}

			// Fetch GitHub issue
			logger.section("Fetching GitHub Issue");
			const issue = await this.github.fetchIssue(issueUrl);

			if (!issue) {
				return {
					success: false,
					error:
						"Failed to fetch GitHub issue. Check the URL and your gh auth status.",
				};
			}

			// Generate branch name
			logger.section("Generating Branch Name");
			let branchName: string;

			if (
				config.integrations.claude.enabled &&
				config.integrations.claude.autoGenerateBranchName
			) {
				branchName = await this.github.generateBranchNameWithClaude(issue);
			} else {
				branchName = this.github.generateBranchNameFromIssue(issue);
			}

			logger.info(`Branch name: ${branchName}`);

			// Prepare paths
			const repositoryName = await this.git.getRepositoryName();
			const basePath = this.configManager.expandPath(config.worktreeBasePath);
			const worktreeDir = join(
				basePath,
				`${repositoryName}-worktree`,
				branchName,
			);

			logger.section("Creating Worktree");
			logger.table({
				Repository: repositoryName,
				Branch: branchName,
				Path: worktreeDir,
				Issue: `#${issue.number} - ${issue.title}`,
			});

			// Create worktree directory
			await this.fileUtils.ensureDirectory(
				join(basePath, `${repositoryName}-worktree`),
			);

			// Create worktree
			const defaultBranch = await this.git.getDefaultBranch();
			await this.git.createWorktree(worktreeDir, branchName, defaultBranch);

			// Copy .env files
			if (config.copyEnvFiles) {
				logger.section("Copying Environment Files");
				const repoRoot = await this.git.getRepositoryRoot();
				await this.fileUtils.copyEnvFiles(repoRoot, worktreeDir);
			}

			// Install dependencies
			if (config.autoInstallDeps) {
				logger.section("Installing Dependencies");
				const pm = await this.packageManager.detect(worktreeDir);

				if (pm) {
					await this.packageManager.install(worktreeDir, pm);
				} else {
					logger.info(
						"No package.json found, skipping dependency installation",
					);
				}
			}

			// Open terminal
			if (config.openTerminal) {
				logger.section("Opening Terminal");
				await this.openTerminal(worktreeDir, branchName, issueUrl, config);
			}

			// Save to history
			await this.configManager.saveWorktreeHistory(worktreeDir, {
				branchName,
				issueUrl,
				issueNumber: issue.number,
				repository: repositoryName,
			});

			const duration = Date.now() - startTime;

			logger.section("Success");
			logger.success(`Worktree created in ${(duration / 1000).toFixed(1)}s`);

			return {
				success: true,
				worktreePath: worktreeDir,
				branchName,
				metadata: {
					issueUrl,
					issueNumber: issue.number,
					repository: repositoryName,
					createdAt: new Date().toISOString(),
				},
			};
		} catch (error: any) {
			logger.error("Failed to create worktree", error);
			return {
				success: false,
				error: error.message || "Unknown error",
			};
		}
	}

	private async openTerminal(
		worktreeDir: string,
		branchName: string,
		issueUrl: string,
		config: WorktreeConfig,
	): Promise<void> {
		const claudeCommand = config.integrations.claude.autoStartPlanMode
			? `claude --dangerously-skip-permissions --permission-mode plan '/run-tasks ${issueUrl}'`
			: "claude --plan";

		const command = `cd ${worktreeDir} && echo 'Branch: ${branchName}' && echo 'Issue: ${issueUrl}' && echo && ${claudeCommand}`;

		try {
			// Check if terminal is installed
			const isInstalled = await this.terminalLauncher.isTerminalInstalled(
				config.terminalApp,
			);

			if (!isInstalled) {
				logger.warn(
					`${config.terminalApp} is not installed, skipping terminal opening`,
				);
				return;
			}

			// Launch terminal using dedicated script
			const success = await this.terminalLauncher.launch(
				config.terminalApp,
				worktreeDir,
				command,
			);

			if (success) {
				logger.success(`Opened ${config.terminalApp} terminal`);
			} else {
				logger.warn(
					`Failed to open ${config.terminalApp}, please navigate manually`,
				);
			}
		} catch (error) {
			logger.warn(
				`Failed to open ${config.terminalApp}, please navigate manually`,
				error,
			);
		}
	}

	async listWorktrees(): Promise<void> {
		logger.section("Git Worktrees");

		const worktrees = await this.git.listWorktrees();

		if (worktrees.length === 0) {
			logger.info("No worktrees found");
			return;
		}

		for (const worktree of worktrees) {
			const status = worktree.locked
				? "🔒 LOCKED"
				: worktree.prunable
					? "⚠️  PRUNABLE"
					: "✅ ACTIVE";

			console.log(`\n${status} ${worktree.branch}`);
			console.log(`  Path:   ${worktree.path}`);
			console.log(`  Commit: ${worktree.commit.substring(0, 8)}`);
		}
	}

	async cleanupWorktrees(force = false): Promise<CleanupResult> {
		logger.section("Cleanup Worktrees");

		const worktrees = await this.git.listWorktrees();
		const removed: string[] = [];
		const errors: string[] = [];

		// Skip main worktree (index 0)
		for (let i = 1; i < worktrees.length; i++) {
			const worktree = worktrees[i];

			if (worktree.prunable || force) {
				try {
					await this.git.removeWorktree(worktree.path, true);
					removed.push(worktree.path);
					logger.success(`Removed: ${worktree.path}`);
				} catch (error: any) {
					errors.push(`${worktree.path}: ${error.message}`);
					logger.error(`Failed to remove: ${worktree.path}`, error);
				}
			}
		}

		// Prune worktrees
		await this.git.pruneWorktrees();

		return {
			success: errors.length === 0,
			removed,
			errors,
			totalCleaned: removed.length,
		};
	}
}
