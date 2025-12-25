/**
 * Terminal Launcher
 * Handles launching different terminal applications using dedicated scripts
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";
import { logger } from "./logger";

export class TerminalLauncher {
	private scriptsDir: string;

	constructor(scriptsDir: string) {
		this.scriptsDir = scriptsDir;
	}

	async launch(
		terminalApp: "Hyper" | "iTerm2" | "Warp" | "Terminal",
		worktreeDir: string,
		command: string,
	): Promise<boolean> {
		const launcherScript = join(this.scriptsDir, "terminals", "launcher.sh");

		if (!existsSync(launcherScript)) {
			logger.error(`Terminal launcher script not found: ${launcherScript}`);
			return false;
		}

		try {
			logger.debug(`Launching ${terminalApp}`, { launcherScript, worktreeDir });

			const result = await $`${launcherScript} ${terminalApp} ${command}`;

			if (result.exitCode === 0) {
				logger.success(`Launched ${terminalApp} successfully`);
				return true;
			} else {
				logger.error(
					`Failed to launch ${terminalApp} (exit code: ${result.exitCode})`,
				);
				return false;
			}
		} catch (error: any) {
			logger.error(`Error launching ${terminalApp}`, error);
			return false;
		}
	}

	async isTerminalInstalled(
		terminalApp: "Hyper" | "iTerm2" | "Warp" | "Terminal",
	): Promise<boolean> {
		if (terminalApp === "Terminal") {
			// Terminal.app is always available on macOS
			return true;
		}

		try {
			const appNames: Record<string, string> = {
				Hyper: "Hyper",
				iTerm2: "iTerm",
				Warp: "Warp",
			};

			const appName = appNames[terminalApp];
			const result = await $`open -Ra ${appName}`.quiet();
			return result.exitCode === 0;
		} catch {
			return false;
		}
	}

	async getInstalledTerminals(): Promise<string[]> {
		const terminals: Array<"Hyper" | "iTerm2" | "Warp" | "Terminal"> = [
			"Hyper",
			"iTerm2",
			"Warp",
			"Terminal",
		];

		const installed: string[] = [];

		for (const terminal of terminals) {
			if (await this.isTerminalInstalled(terminal)) {
				installed.push(terminal);
			}
		}

		return installed;
	}
}
