#!/usr/bin/env bun
/**
 * Ralph Loop Setup Script
 * Creates state file for in-session Ralph loop
 *
 * TypeScript/Bun conversion of the original setup-ralph-loop.sh
 */

import { mkdirSync, writeFileSync, existsSync } from "node:fs";

interface ParsedArgs {
	prompt: string[];
	maxIterations: number;
	completionPromise: string;
	help: boolean;
}

const HELP_TEXT = `Ralph Loop - Interactive self-referential development loop

USAGE:
  /ralph-loop [PROMPT...] [OPTIONS]

ARGUMENTS:
  PROMPT...    Initial prompt to start the loop (can be multiple words without quotes)

OPTIONS:
  --max-iterations <n>           Maximum iterations before auto-stop (default: unlimited)
  --completion-promise '<text>'  Promise phrase (USE QUOTES for multi-word)
  -h, --help                     Show this help message

DESCRIPTION:
  Starts a Ralph Wiggum loop in your CURRENT session. The stop hook prevents
  exit and feeds your output back as input until completion or iteration limit.

  To signal completion, you must output: <promise>YOUR_PHRASE</promise>

  Use this for:
  - Interactive iteration where you want to see progress
  - Tasks requiring self-correction and refinement
  - Learning how Ralph works

EXAMPLES:
  /ralph-loop Build a todo API --completion-promise 'DONE' --max-iterations 20
  /ralph-loop --max-iterations 10 Fix the auth bug
  /ralph-loop Refactor cache layer  (runs forever)
  /ralph-loop --completion-promise 'TASK COMPLETE' Create a REST API

STOPPING:
  Only by reaching --max-iterations or detecting --completion-promise
  No manual stop - Ralph runs infinitely by default!

MONITORING:
  # View current iteration:
  grep '^iteration:' .claude/ralph-loop.local.md

  # View full state:
  head -10 .claude/ralph-loop.local.md`;

function parseArgs(args: string[]): ParsedArgs {
	const result: ParsedArgs = {
		prompt: [],
		maxIterations: 0,
		completionPromise: "",
		help: false,
	};

	let i = 0;
	while (i < args.length) {
		const arg = args[i];

		switch (arg) {
			case "-h":
			case "--help":
				result.help = true;
				i++;
				break;

			case "--max-iterations": {
				const nextArg = args[i + 1];
				if (!nextArg) {
					console.error("❌ Error: --max-iterations requires a number argument");
					console.error("");
					console.error("   Valid examples:");
					console.error("     --max-iterations 10");
					console.error("     --max-iterations 50");
					console.error("     --max-iterations 0  (unlimited)");
					console.error("");
					console.error("   You provided: --max-iterations (with no number)");
					process.exit(1);
				}
				const num = parseInt(nextArg, 10);
				if (Number.isNaN(num) || num < 0 || !/^\d+$/.test(nextArg)) {
					console.error(
						`❌ Error: --max-iterations must be a positive integer or 0, got: ${nextArg}`,
					);
					console.error("");
					console.error("   Valid examples:");
					console.error("     --max-iterations 10");
					console.error("     --max-iterations 50");
					console.error("     --max-iterations 0  (unlimited)");
					console.error("");
					console.error("   Invalid: decimals (10.5), negative numbers (-5), text");
					process.exit(1);
				}
				result.maxIterations = num;
				i += 2;
				break;
			}

			case "--completion-promise": {
				const nextArg = args[i + 1];
				if (!nextArg) {
					console.error("❌ Error: --completion-promise requires a text argument");
					console.error("");
					console.error("   Valid examples:");
					console.error("     --completion-promise 'DONE'");
					console.error("     --completion-promise 'TASK COMPLETE'");
					console.error("     --completion-promise 'All tests passing'");
					console.error("");
					console.error("   You provided: --completion-promise (with no text)");
					console.error("");
					console.error("   Note: Multi-word promises must be quoted!");
					process.exit(1);
				}
				result.completionPromise = nextArg;
				i += 2;
				break;
			}

			default:
				// Non-option argument - collect all as prompt parts
				result.prompt.push(arg);
				i++;
				break;
		}
	}

	return result;
}

function main() {
	const args = process.argv.slice(2);
	const parsed = parseArgs(args);

	if (parsed.help) {
		console.log(HELP_TEXT);
		process.exit(0);
	}

	const prompt = parsed.prompt.join(" ");

	if (!prompt) {
		console.error("❌ Error: No prompt provided");
		console.error("");
		console.error("   Ralph needs a task description to work on.");
		console.error("");
		console.error("   Examples:");
		console.error("     /ralph-loop Build a REST API for todos");
		console.error("     /ralph-loop Fix the auth bug --max-iterations 20");
		console.error("     /ralph-loop --completion-promise 'DONE' Refactor code");
		console.error("");
		console.error("   For all options: /ralph-loop --help");
		process.exit(1);
	}

	// Create .claude directory if needed
	if (!existsSync(".claude")) {
		mkdirSync(".claude", { recursive: true });
	}

	// Quote completion promise for YAML if it contains special chars or is not null
	const completionPromiseYaml =
		parsed.completionPromise && parsed.completionPromise !== "null"
			? `"${parsed.completionPromise}"`
			: "null";

	// Create state file (markdown with YAML frontmatter)
	const stateContent = `---
active: true
iteration: 1
max_iterations: ${parsed.maxIterations}
completion_promise: ${completionPromiseYaml}
started_at: "${new Date().toISOString()}"
---

${prompt}
`;

	writeFileSync(".claude/ralph-loop.local.md", stateContent);

	// Output setup message
	console.log("🔄 Ralph loop activated in this session!");
	console.log("");
	console.log("Iteration: 1");
	console.log(
		`Max iterations: ${parsed.maxIterations > 0 ? parsed.maxIterations : "unlimited"}`,
	);
	console.log(
		`Completion promise: ${
			parsed.completionPromise
				? `${parsed.completionPromise} (ONLY output when TRUE - do not lie!)`
				: "none (runs forever)"
		}`,
	);
	console.log("");
	console.log(
		"The stop hook is now active. When you try to exit, the SAME PROMPT will be",
	);
	console.log(
		"fed back to you. You'll see your previous work in files, creating a",
	);
	console.log("self-referential loop where you iteratively improve on the same task.");
	console.log("");
	console.log("To monitor: head -10 .claude/ralph-loop.local.md");
	console.log("");
	console.log(
		"⚠️  WARNING: This loop cannot be stopped manually! It will run infinitely",
	);
	console.log("    unless you set --max-iterations or --completion-promise.");
	console.log("");
	console.log("🔄");

	// Output the initial prompt if provided
	if (prompt) {
		console.log("");
		console.log(prompt);
	}
}

main();
