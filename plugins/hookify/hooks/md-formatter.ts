#!/usr/bin/env bun
/**
 * Markdown formatter hook for hookify plugin.
 * Automatically formats ALL .md and .mdx files in the project after any Edit/Write operation on a markdown file.
 * Uses markdownlint-cli2 --fix and prettier for formatting.
 */

interface HookInput {
	hook_event_name?: string;
	tool_name?: string;
	tool_input?: {
		file_path?: string;
		content?: string;
		new_string?: string;
	};
}

interface HookOutput {
	systemMessage?: string;
}

/**
 * Run a command using Bun.spawn and return its output
 */
async function runCommand(command: string, args: string[]): Promise<{ success: boolean; output: string }> {
	try {
		const proc = Bun.spawn([command, ...args], {
			cwd: process.cwd(),
			stdout: "pipe",
			stderr: "pipe",
		});

		const [stdout, stderr] = await Promise.all([
			new Response(proc.stdout).text(),
			new Response(proc.stderr).text(),
		]);

		const exitCode = await proc.exited;
		return { success: exitCode === 0, output: stdout + stderr };
	} catch {
		return { success: false, output: "Command not found" };
	}
}

/**
 * Check if a file is a Markdown file
 */
function isMarkdownFile(filePath: string): boolean {
	return filePath.endsWith(".md") || filePath.endsWith(".mdx");
}

/**
 * Format all Markdown files in the project using markdownlint-cli2 and prettier
 */
async function formatAllMarkdownFiles(): Promise<{ formatted: boolean; message: string }> {
	const globPattern = "**/*.{md,mdx}";
	const ignorePattern = "!node_modules/**/*.{md,mdx}";

	// Run markdownlint-cli2 --fix on all markdown files
	const lintResult = await runCommand("markdownlint-cli2", ["--fix", globPattern, ignorePattern]);

	// Run prettier on all markdown files
	const prettierResult = await runCommand("prettier", ["--write", globPattern, "--ignore-path", ".gitignore"]);

	if (lintResult.success || prettierResult.success) {
		const tools: string[] = [];
		if (lintResult.success) tools.push("markdownlint");
		if (prettierResult.success) tools.push("prettier");
		return { formatted: true, message: `All .md/.mdx files formatted with ${tools.join(" + ")}` };
	}

	return { formatted: false, message: "Could not format markdown files" };
}

async function main() {
	try {
		// Read input from stdin
		const chunks: Buffer[] = [];
		for await (const chunk of Bun.stdin.stream()) {
			chunks.push(chunk);
		}
		const inputText = Buffer.concat(chunks).toString("utf-8");
		const inputData: HookInput = JSON.parse(inputText);

		// Only process Edit, Write, MultiEdit tools
		const toolName = inputData.tool_name || "";
		if (!["Edit", "Write", "MultiEdit"].includes(toolName)) {
			console.log(JSON.stringify({}));
			process.exit(0);
		}

		// Get file path from tool input - only trigger if a markdown file was modified
		const filePath = inputData.tool_input?.file_path;
		if (!filePath || !isMarkdownFile(filePath)) {
			console.log(JSON.stringify({}));
			process.exit(0);
		}

		// Format ALL markdown files in the project
		const result = await formatAllMarkdownFiles();

		const output: HookOutput = {};
		if (result.formatted) {
			output.systemMessage = result.message;
		}

		console.log(JSON.stringify(output));
	} catch (error) {
		// Silent fail - don't block operations
		console.log(JSON.stringify({}));
	}

	process.exit(0);
}

main();
