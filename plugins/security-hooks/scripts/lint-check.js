#!/usr/bin/env node
/**
 * Entry point for PostToolUse hook - validates linting
 */
import fs from "fs";
import { configManager } from "../lib/config.js";
import { Formatter } from "../lib/formatters.js";
import { logger } from "../lib/logger.js";
import { LintValidator } from "../lib/validators/lint-validator.js";

async function main() {
	try {
		// Parse input from stdin
		const stdinData = fs.readFileSync(process.stdin.fd, "utf-8");
		const input = JSON.parse(stdinData);
		// Extract file path and cwd
		const filePath = input.tool_input?.file_path;
		const cwd = input.cwd || process.cwd();
		if (!filePath) {
			process.exit(0);
		}
		// Load configuration
		const config = configManager.loadConfig();
		if (!config.linting.enabled) {
			logger.debug("Linting disabled");
			process.exit(0);
		}
		// Create validator
		const validator = new LintValidator(config.linting);
		// Validate file
		const result = validator.validate(filePath, cwd);
		if (!result.success) {
			// Linting errors detected
			console.log(Formatter.formatLintResult(result));
			process.exit(2);
		}
		// Linting passed
		process.exit(0);
	} catch (error) {
		logger.error("Lint check failed", {
			error: error instanceof Error ? error.message : String(error),
		});
		process.exit(0);
	}
}
main();
//# sourceMappingURL=lint-check.js.map
