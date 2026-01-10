/**
 * CLI interface for Worktree Manager
 * Handles argument parsing and validation
 */

import type { CLIOptions } from "./lib/types";

export class CLI {
	private args: string[];

	constructor() {
		this.args = process.argv.slice(2);
	}

	parse(): CLIOptions | null {
		const options: CLIOptions = {};

		// Handle help
		if (this.hasFlag("-h", "--help") || this.args.length === 0) {
			this.showHelp();
			return null;
		}

		// Handle version
		if (this.hasFlag("-v", "--version")) {
			this.showVersion();
			return null;
		}

		// Parse command
		const command = this.args[0];

		if (!command.startsWith("-")) {
			// First argument is the URL
			options.url = command;
		}

		// Parse flags
		options.branchName = this.getFlag("-b", "--branch");
		options.output = this.getFlag("-o", "--output");
		options.profile = this.getFlag("-p", "--profile");
		options.terminal = this.getFlag("-t", "--terminal");

		options.force = this.hasFlag("-f", "--force");
		options.noDeps = this.hasFlag("--no-deps");
		options.noTerminal = this.hasFlag("--no-terminal");
		options.debug = this.hasFlag("--debug");

		return options;
	}

	private hasFlag(...flags: string[]): boolean {
		return flags.some((flag) => this.args.includes(flag));
	}

	private getFlag(...flags: string[]): string | undefined {
		for (const flag of flags) {
			const index = this.args.indexOf(flag);
			if (index !== -1 && index + 1 < this.args.length) {
				return this.args[index + 1];
			}
		}
		return undefined;
	}

	showHelp() {
		console.log(`
Worktree Manager - Intelligent Git Worktree Management

USAGE:
  worktree <github-issue-url> [options]
  worktree list
  worktree clean [--force]

COMMANDS:
  <url>          Create a new worktree from a GitHub issue URL
  list           List all existing worktrees
  clean          Clean up prunable worktrees
  help           Show this help message
  version        Show version information

OPTIONS:
  -b, --branch <name>     Custom branch name (overrides auto-generation)
  -o, --output <dir>      Custom worktree base directory
  -p, --profile <name>    Use a configuration profile
  -t, --terminal <app>    Terminal app (Hyper, iTerm2, Warp, Terminal)
  -f, --force             Force cleanup of all worktrees
  --no-deps               Skip dependency installation
  --no-terminal           Don't open terminal automatically
  --debug                 Enable debug logging
  -h, --help              Show this help message
  -v, --version           Show version information

EXAMPLES:
  # Create worktree from GitHub issue
  worktree https://github.com/user/repo/issues/123

  # Create with custom branch name
  worktree https://github.com/user/repo/issues/123 --branch feature-xyz

  # Create without installing dependencies
  worktree https://github.com/user/repo/issues/123 --no-deps

  # Create with specific terminal
  worktree https://github.com/user/repo/issues/123 --terminal iTerm2

  # List all worktrees
  worktree list

  # Clean up prunable worktrees
  worktree clean

  # Force cleanup of all worktrees
  worktree clean --force

CONFIGURATION:
  Configuration is loaded from config/default.json
  You can create custom profiles in config/profiles/

  Default worktree location: ~/Developer/worktrees/

INTEGRATIONS:
  - GitHub CLI (gh) - Required for fetching issues
  - Claude CLI - Optional, for AI-powered branch naming
  - Package managers - Auto-detected (pnpm, npm, yarn, bun)
  - Terminal apps - Hyper, iTerm2, Warp, Terminal

For more information, see the README.md
    `);
	}

	showVersion() {
		console.log("Worktree Manager v1.0.0");
	}
}
