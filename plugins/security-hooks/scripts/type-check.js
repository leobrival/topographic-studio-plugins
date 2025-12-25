#!/usr/bin/env node
/**
 * Entry point for PostToolUse hook - validates TypeScript type checking
 */
import fs from "fs";
import { configManager } from "../lib/config.js";
import { Formatter } from "../lib/formatters.js";
import { logger } from "../lib/logger.js";
import { TypeValidator } from "../lib/validators/type-validator.js";

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
		if (!config.typecheck.enabled) {
			logger.debug("Type checking disabled");
			process.exit(0);
		}
		// Create validator
		const validator = new TypeValidator(config.typecheck);
		// Validate file
		const result = validator.validate(filePath, cwd);
		if (!result.success) {
			// Type errors detected
			console.log(Formatter.formatTypeCheckResult(result));
			process.exit(2);
		}
		// Type checking passed
		process.exit(0);
	} catch (error) {
		logger.error("Type check failed", {
			error: error instanceof Error ? error.message : String(error),
		});
		process.exit(0);
	}
}
main();
//# sourceMappingURL=type-check.js.map
