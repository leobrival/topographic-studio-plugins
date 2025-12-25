#!/usr/bin/env bun
/**
 * PreToolUse hook for hookify plugin.
 * Called by Claude Code before any tool executes.
 */

import { loadRules } from "../core/config-loader";
import { evaluateRules } from "../core/rule-engine";
import type { HookInput } from "../core/types";

async function main() {
	try {
		// Read input from stdin
		const chunks: Buffer[] = [];
		for await (const chunk of Bun.stdin.stream()) {
			chunks.push(chunk);
		}
		const inputText = Buffer.concat(chunks).toString("utf-8");
		const inputData: HookInput = JSON.parse(inputText);

		// Determine event type
		const toolName = inputData.tool_name || "";
		let event: string | undefined;

		if (toolName === "Bash") {
			event = "bash";
		} else if (["Edit", "Write", "MultiEdit"].includes(toolName)) {
			event = "file";
		}

		// Load and evaluate rules
		const rules = loadRules(event);
		const result = evaluateRules(rules, inputData);

		// Output result
		console.log(JSON.stringify(result));
	} catch (error) {
		// On error, allow operation
		console.log(JSON.stringify({ systemMessage: `Hookify error: ${error}` }));
	}

	process.exit(0);
}

main();
