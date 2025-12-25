#!/usr/bin/env bun

/**
 * Web Crawler - Main Entry Point
 * High-performance web crawler with TypeScript/Bun frontend and Go backend
 */

import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CLI } from "./cli";
import { ConfigManager } from "./lib/config";
import { Formatters } from "./lib/formatters";
import { GoBridge } from "./lib/go-bridge";
import { generateHTML } from "./lib/html-generator";
import { logger } from "./lib/logger";
import { RaycastAdapter } from "./raycast";

async function main() {
	const startTime = Date.now();

	try {
		// Detect execution environment
		const isRaycast = RaycastAdapter.isRaycastEnvironment();

		// Parse arguments based on environment
		let options;
		if (isRaycast) {
			logger.info("Running in Raycast mode");
			options = RaycastAdapter.parseRaycastArgs();
		} else {
			const cli = new CLI();
			options = cli.parse();
		}

		if (!options) {
			process.exit(0);
		}

		// Enable debug logging if requested
		if (options.debug) {
			logger.debug("Debug mode enabled");
		}

		// Get script directory
		const scriptDir = import.meta.dir;
		const rootDir = join(scriptDir, "..");
		const configDir = join(rootDir, "config");
		const engineDir = join(rootDir, "engine");

		// Initialize configuration manager
		const configManager = new ConfigManager(configDir);

		// Build final configuration
		logger.info("Building configuration...");
		const config = await configManager.buildConfig(options);

		logger.info("=".repeat(60));
		logger.info("WEB CRAWLER STARTING");
		logger.info("=".repeat(60));
		logger.info(`URL:           ${config.baseURL}`);
		logger.info(`Domain:        ${config.allowedDomain}`);
		logger.info(`Max depth:     ${config.maxDepth}`);
		logger.info(`Workers:       ${config.maxWorkers}`);
		logger.info(`Rate limit:    ${config.rateLimit} req/s`);
		logger.info(`Use sitemap:   ${config.useSitemap}`);
		logger.info(`Output dir:    ${config.outputDir}`);
		logger.info("=".repeat(60));

		// Initialize Go bridge
		const goBridge = new GoBridge(engineDir);

		// Execute crawler
		logger.info("Executing Go crawler...");
		const result = await goBridge.executeCrawler(config);

		const endTime = Date.now();
		const duration = (endTime - startTime) / 1000;

		if (!result.success) {
			logger.error(`Crawling failed: ${result.error}`);

			if (isRaycast) {
				console.log(
					RaycastAdapter.formatError(result.error || "Unknown error"),
				);
			}

			process.exit(1);
		}

		if (!result.results) {
			logger.error("No results returned from crawler");
			process.exit(1);
		}

		// Update stats with duration
		result.results.stats.duration = duration;

		// Generate HTML report
		try {
			const htmlContent = generateHTML(result.results, duration);
			const htmlPath = join(config.outputDir, "index.html");
			await writeFile(htmlPath, htmlContent, "utf-8");
			logger.info(`HTML report generated: ${htmlPath}`);
		} catch (error) {
			logger.warn(`Failed to generate HTML report: ${error}`);
		}

		// Display results
		logger.info("\n" + Formatters.formatStats(result.results.stats));

		// Display sample pages
		if (result.results.results.length > 0) {
			logger.info("\nSample pages (first 5):");
			result.results.results.slice(0, 5).forEach((page, idx) => {
				console.log(
					`\n[${idx + 1}] ${Formatters.formatPageResult(page, false)}`,
				);
			});
		}

		// Raycast-specific output
		if (isRaycast) {
			console.log(
				"\n" +
					RaycastAdapter.formatCompactOutput(
						result.results.stats.pagesCrawled,
						result.results.stats.pagesFound,
						duration,
						config.outputDir,
					),
			);
			RaycastAdapter.openResults(config.outputDir);
		} else {
			// CLI mode - offer to open results
			logger.info(`\nResults saved to: ${config.outputDir}`);
			logger.info("Opening results directory...");

			const { spawn } = await import("node:child_process");
			spawn("open", [config.outputDir], {
				detached: true,
				stdio: "ignore",
			}).unref();
		}

		logger.info("\n✅ Crawling completed successfully!");
		process.exit(0);
	} catch (error) {
		logger.fatal(`Fatal error: ${error}`);
		process.exit(1);
	}
}

// Run main function
main();
