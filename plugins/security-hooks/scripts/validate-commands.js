#!/usr/bin/env node
/**
 * Entry point for PreToolUse hook - validates bash commands for security
 */
import fs from "fs";
import { configManager } from "../lib/config.js";
import { Formatter } from "../lib/formatters.js";
import { logger } from "../lib/logger.js";
import { CommandValidator } from "../lib/validators/command-validator.js";

async function main() {
	try {
		// Parse input from stdin
		const stdinData = fs.readFileSync(process.stdin.fd, "utf-8");
		const input = JSON.parse(stdinData);
		// Only validate Bash commands
		if (input.tool_name !== "Bash") {
			process.exit(0);
		}
		const command = input.tool_input?.command;
		if (!command) {
			process.exit(0);
		}
		// Load configuration and patterns
		const config = configManager.loadConfig();
		if (!config.security.enabled) {
			logger.debug("Security validation disabled");
			process.exit(0);
		}
		const dangerousPatterns = configManager.getDangerousPatterns();
		const safePatterns = configManager.getSafePatterns();
		// Create validator
		const validator = new CommandValidator(dangerousPatterns, safePatterns);
		// Validate command
		const result = validator.validate(command);
		if (!result.isValid) {
			// Command blocked
			console.log(Formatter.formatValidationResult(result));
			process.exit(2);
		}
		// Command allowed
		process.exit(0);
	} catch (error) {
		logger.error("Validation failed", {
			error: error instanceof Error ? error.message : String(error),
		});
		process.exit(0);
	}
}
main();
//# sourceMappingURL=validate-command.js.map
