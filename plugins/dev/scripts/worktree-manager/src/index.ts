#!/usr/bin/env bun

/**
 * Worktree Manager - Main Entry Point
 * Intelligent Git worktree manager with GitHub integration
 */

import { join } from "node:path";
import { CLI } from "./cli";
import { ConfigManager } from "./lib/config";
import { Formatters } from "./lib/formatters";
import { logger } from "./lib/logger";
import { WorktreeManager } from "./lib/worktree-manager";

async function main() {
	try {
		// Parse CLI arguments
		const cli = new CLI();
		const options = cli.parse();

		if (!options) {
			process.exit(0);
		}

		// Enable debug if requested
		if (options.debug) {
			logger.setDebug(true);
		}

		// Get directories
		const scriptDir = import.meta.dir;
		const rootDir = join(scriptDir, "..");
		const configDir = join(rootDir, "config");
		const scriptsDir = join(rootDir, "scripts");

		// Initialize managers
		const configManager = new ConfigManager(configDir);
		const worktreeManager = new WorktreeManager(configManager, scriptsDir);

		// Handle list command
		if (options.url === "list") {
			await worktreeManager.listWorktrees();
			process.exit(0);
		}

		// Handle clean command
		if (options.url === "clean") {
			const result = await worktreeManager.cleanupWorktrees(options.force);
			console.log(Formatters.formatCleanupResult(result));
			process.exit(result.success ? 0 : 1);
		}

		// Validate URL
		if (!options.url) {
			logger.error("GitHub issue URL is required");
			logger.info("Run 'worktree --help' for usage information");
			process.exit(1);
		}

		// Validate GitHub issue URL format
		if (
			!options.url.match(/^https?:\/\/github\.com\/[^/]+\/[^/]+\/issues\/\d+$/)
		) {
			logger.error("Invalid GitHub issue URL format");
			logger.info("Expected: https://github.com/owner/repo/issues/123");
			process.exit(1);
		}

		// Build configuration
		const config = await configManager.buildConfig(options);

		// Create worktree
		logger.section("Worktree Manager");
		logger.info("Starting worktree creation...");

		const result = await worktreeManager.createWorktree(options.url, config);

		// Display result
		console.log("\n");
		console.log(Formatters.formatWorktreeResult(result));

		process.exit(result.success ? 0 : 1);
	} catch (error: any) {
		logger.error("Fatal error", error);
		console.log(Formatters.formatError(error.message || "Unknown error"));
		process.exit(1);
	}
}

main();
