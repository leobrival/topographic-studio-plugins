#!/usr/bin/env bun
/**
 * Ralph Wiggum Stop Hook
 * Prevents session exit when a ralph-loop is active
 * Feeds Claude's output back as input to continue the loop
 *
 * TypeScript/Bun conversion of the original stop-hook.sh
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";

interface HookInput {
	transcript_path: string;
}

interface HookOutput {
	decision: "block" | "allow";
	reason?: string;
	systemMessage?: string;
}

interface TranscriptMessage {
	role: string;
	message: {
		content: Array<{ type: string; text?: string }>;
	};
}

const RALPH_STATE_FILE = ".claude/ralph-loop.local.md";

/**
 * Parse YAML frontmatter from the state file
 * Equivalent to sed -n '/^---$/,/^---$/{ /^---$/d; p; }' in bash
 */
function parseFrontmatter(content: string): Record<string, string> {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return {};

	const frontmatter: Record<string, string> = {};
	const lines = match[1].split("\n");

	for (const line of lines) {
		const colonIndex = line.indexOf(":");
		if (colonIndex > 0) {
			const key = line.substring(0, colonIndex).trim();
			let value = line.substring(colonIndex + 1).trim();
			// Remove surrounding quotes (equivalent to sed 's/^"\(.*\)"$/\1/')
			if (value.startsWith('"') && value.endsWith('"')) {
				value = value.slice(1, -1);
			}
			frontmatter[key] = value;
		}
	}

	return frontmatter;
}

/**
 * Extract prompt text (everything after the closing ---)
 * Equivalent to awk '/^---$/{i++; next} i>=2' in bash
 */
function extractPrompt(content: string): string {
	const lines = content.split("\n");
	let dashCount = 0;
	const promptLines: string[] = [];

	for (const line of lines) {
		if (line === "---") {
			dashCount++;
			continue;
		}
		if (dashCount >= 2) {
			promptLines.push(line);
		}
	}

	return promptLines.join("\n").trim();
}

/**
 * Get the last assistant message from transcript (JSONL format)
 */
function getLastAssistantMessage(transcriptPath: string): string | null {
	if (!existsSync(transcriptPath)) {
		return null;
	}

	const content = readFileSync(transcriptPath, "utf-8");
	const lines = content.split("\n").filter((line) => line.trim());

	// Find last assistant message
	let lastAssistantLine = "";
	for (const line of lines) {
		if (line.includes('"role":"assistant"')) {
			lastAssistantLine = line;
		}
	}

	if (!lastAssistantLine) {
		return null;
	}

	try {
		const parsed: TranscriptMessage = JSON.parse(lastAssistantLine);
		const textParts = parsed.message.content
			.filter((c) => c.type === "text" && c.text)
			.map((c) => c.text);
		return textParts.join("\n");
	} catch {
		return null;
	}
}

/**
 * Check if completion promise is present in text
 * Equivalent to perl regex extraction in bash
 */
function checkCompletionPromise(text: string, promise: string): boolean {
	// Look for <promise>TEXT</promise> tags
	const regex = /<promise>([\s\S]*?)<\/promise>/;
	const match = text.match(regex);

	if (!match) return false;

	// Normalize whitespace (equivalent to perl: s/^\s+|\s+$//g; s/\s+/ /g)
	const promiseText = match[1].trim().replace(/\s+/g, " ");
	// Use literal string comparison (not pattern matching)
	return promiseText === promise;
}

/**
 * Update iteration count in state file
 */
function updateIteration(content: string, newIteration: number): string {
	return content.replace(/^iteration:\s*\d+/m, `iteration: ${newIteration}`);
}

async function main() {
	// Read hook input from stdin
	const chunks: Buffer[] = [];
	for await (const chunk of Bun.stdin.stream()) {
		chunks.push(chunk);
	}
	const inputText = Buffer.concat(chunks).toString("utf-8");

	let hookInput: HookInput;
	try {
		hookInput = JSON.parse(inputText);
	} catch {
		// Invalid input - allow exit
		process.exit(0);
	}

	// Check if ralph-loop is active
	if (!existsSync(RALPH_STATE_FILE)) {
		// No active loop - allow exit
		process.exit(0);
	}

	// Read state file
	const stateContent = readFileSync(RALPH_STATE_FILE, "utf-8");
	const frontmatter = parseFrontmatter(stateContent);

	const iteration = parseInt(frontmatter.iteration || "1", 10);
	const maxIterations = parseInt(frontmatter.max_iterations || "0", 10);
	const completionPromise = frontmatter.completion_promise || "";

	// Validate numeric fields before arithmetic operations
	if (Number.isNaN(iteration)) {
		console.error("⚠️  Ralph loop: State file corrupted");
		console.error(`   File: ${RALPH_STATE_FILE}`);
		console.error(
			`   Problem: 'iteration' field is not a valid number (got: '${frontmatter.iteration}')`,
		);
		console.error("");
		console.error(
			"   This usually means the state file was manually edited or corrupted.",
		);
		console.error("   Ralph loop is stopping. Run /ralph-loop again to start fresh.");
		unlinkSync(RALPH_STATE_FILE);
		process.exit(0);
	}

	if (Number.isNaN(maxIterations)) {
		console.error("⚠️  Ralph loop: State file corrupted");
		console.error(`   File: ${RALPH_STATE_FILE}`);
		console.error(
			`   Problem: 'max_iterations' field is not a valid number (got: '${frontmatter.max_iterations}')`,
		);
		console.error("");
		console.error(
			"   This usually means the state file was manually edited or corrupted.",
		);
		console.error("   Ralph loop is stopping. Run /ralph-loop again to start fresh.");
		unlinkSync(RALPH_STATE_FILE);
		process.exit(0);
	}

	// Check if max iterations reached
	if (maxIterations > 0 && iteration >= maxIterations) {
		console.error(`🛑 Ralph loop: Max iterations (${maxIterations}) reached.`);
		unlinkSync(RALPH_STATE_FILE);
		process.exit(0);
	}

	// Get transcript path from hook input
	const transcriptPath = hookInput.transcript_path;

	if (!existsSync(transcriptPath)) {
		console.error("⚠️  Ralph loop: Transcript file not found");
		console.error(`   Expected: ${transcriptPath}`);
		console.error(
			"   This is unusual and may indicate a Claude Code internal issue.",
		);
		console.error("   Ralph loop is stopping.");
		unlinkSync(RALPH_STATE_FILE);
		process.exit(0);
	}

	// Read last assistant message from transcript
	// First check if there are any assistant messages
	const transcriptContent = readFileSync(transcriptPath, "utf-8");
	if (!transcriptContent.includes('"role":"assistant"')) {
		console.error(
			"⚠️  Ralph loop: No assistant messages found in transcript",
		);
		console.error(`   Transcript: ${transcriptPath}`);
		console.error(
			"   This is unusual and may indicate a transcript format issue",
		);
		console.error("   Ralph loop is stopping.");
		unlinkSync(RALPH_STATE_FILE);
		process.exit(0);
	}

	const lastOutput = getLastAssistantMessage(transcriptPath);

	if (!lastOutput) {
		console.error(
			"⚠️  Ralph loop: Failed to extract last assistant message",
		);
		console.error("   Ralph loop is stopping.");
		unlinkSync(RALPH_STATE_FILE);
		process.exit(0);
	}

	// Check for completion promise (only if set)
	if (completionPromise && completionPromise !== "null") {
		if (checkCompletionPromise(lastOutput, completionPromise)) {
			console.error(
				`✅ Ralph loop: Detected <promise>${completionPromise}</promise>`,
			);
			unlinkSync(RALPH_STATE_FILE);
			process.exit(0);
		}
	}

	// Not complete - continue loop with SAME PROMPT
	const nextIteration = iteration + 1;

	// Extract prompt (everything after the closing ---)
	const promptText = extractPrompt(stateContent);

	if (!promptText) {
		console.error("⚠️  Ralph loop: State file corrupted or incomplete");
		console.error(`   File: ${RALPH_STATE_FILE}`);
		console.error("   Problem: No prompt text found");
		console.error("");
		console.error("   This usually means:");
		console.error("     • State file was manually edited");
		console.error("     • File was corrupted during writing");
		console.error("");
		console.error(
			"   Ralph loop is stopping. Run /ralph-loop again to start fresh.",
		);
		unlinkSync(RALPH_STATE_FILE);
		process.exit(0);
	}

	// Update iteration in state file
	const updatedContent = updateIteration(stateContent, nextIteration);
	writeFileSync(RALPH_STATE_FILE, updatedContent);

	// Build system message with iteration count and completion promise info
	let systemMsg: string;
	if (completionPromise && completionPromise !== "null") {
		systemMsg = `🔄 Ralph iteration ${nextIteration} | To stop: output <promise>${completionPromise}</promise> (ONLY when statement is TRUE - do not lie to exit!)`;
	} else {
		systemMsg = `🔄 Ralph iteration ${nextIteration} | No completion promise set - loop runs infinitely`;
	}

	// Output JSON to block the stop and feed prompt back
	const output: HookOutput = {
		decision: "block",
		reason: promptText,
		systemMessage: systemMsg,
	};

	console.log(JSON.stringify(output));
	process.exit(0);
}

main();
