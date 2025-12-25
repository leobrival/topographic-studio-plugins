#!/usr/bin/env bun
/**
 * UserPromptSubmit hook for hookify plugin.
 * Called by Claude Code when user submits a prompt.
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

		// Load and evaluate prompt rules
		const rules = loadRules("prompt");
		const result = evaluateRules(rules, inputData);

		// Output result
		console.log(JSON.stringify(result));
	} catch (error) {
		console.log(JSON.stringify({ systemMessage: `Hookify error: ${error}` }));
	}

	process.exit(0);
}

main();
