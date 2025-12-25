/**
 * Raycast integration module
 * Handles Raycast-specific argument parsing and output formatting
 */

import { logger } from "./lib/logger";
import type { CLIOptions } from "./lib/types";

export class RaycastAdapter {
	/**
	 * Parse Raycast script arguments
	 * Raycast passes arguments as positional parameters
	 */
	static parseRaycastArgs(): CLIOptions | null {
		const args = process.argv.slice(2);

		if (args.length === 0) {
			logger.error("No arguments provided from Raycast");
			return null;
		}

		// Raycast argument structure:
		// arg1: URL (required)
		// arg2: Domain (optional)
		// arg3: Workers (optional)
		// arg4: Rate limit (optional)
		// arg5: Profile (optional)

		const url = args[0];
		if (!url) {
			logger.error("URL is required");
			return null;
		}

		const domain = args[1] && args[1].trim() !== "" ? args[1] : undefined;
		const workers =
			args[2] && args[2].trim() !== ""
				? Number.parseInt(args[2], 10)
				: undefined;
		const rate =
			args[3] && args[3].trim() !== ""
				? Number.parseInt(args[3], 10)
				: undefined;
		const profile = args[4] && args[4].trim() !== "" ? args[4] : undefined;

		const options: CLIOptions = {
			url,
			domain,
			workers: Number.isNaN(workers as number) ? undefined : workers,
			rate: Number.isNaN(rate as number) ? undefined : rate,
			profile,
			sitemap: true, // Enable sitemap by default for Raycast
		};

		return options;
	}

	/**
	 * Format output for Raycast compact mode
	 * Returns a short, actionable message
	 */
	static formatCompactOutput(
		pagesCrawled: number,
		pagesFound: number,
		duration: number,
		outputDir: string,
	): string {
		return `✅ Crawled ${pagesCrawled} pages (${pagesFound} found) in ${duration.toFixed(1)}s\n📁 ${outputDir}`;
	}

	/**
	 * Format error output for Raycast
	 */
	static formatError(error: string): string {
		return `❌ Crawling failed: ${error}`;
	}

	/**
	 * Open results directory in Finder (Raycast-friendly)
	 */
	static openResults(outputDir: string): void {
		const { spawn } = require("node:child_process");
		spawn("open", [outputDir], { detached: true, stdio: "ignore" }).unref();
	}

	/**
	 * Check if running in Raycast environment
	 */
	static isRaycastEnvironment(): boolean {
		// Raycast sets specific environment variables
		return (
			process.env.RAYCAST === "1" ||
			process.env.RAYCAST_VERSION !== undefined ||
			process.argv[1]?.includes("raycast")
		);
	}

	/**
	 * Get Raycast-appropriate log level
	 * Raycast compact mode should be quieter
	 */
	static getLogLevel(): "minimal" | "normal" | "verbose" {
		if (RaycastAdapter.isRaycastEnvironment()) {
			return "minimal"; // Less verbose for Raycast
		}
		return "normal";
	}
}
