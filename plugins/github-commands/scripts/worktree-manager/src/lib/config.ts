/**
 * Configuration manager for Worktree Manager
 * Handles loading and merging of configuration files
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { logger } from "./logger";
import type { CLIOptions, WorktreeConfig } from "./types";

export class ConfigManager {
	private configDir: string;
	private defaultConfig: WorktreeConfig | null = null;

	constructor(configDir: string) {
		this.configDir = configDir;
	}

	async loadDefaultConfig(): Promise<WorktreeConfig> {
		if (this.defaultConfig) {
			return this.defaultConfig;
		}

		const configPath = join(this.configDir, "default.json");

		if (!existsSync(configPath)) {
			throw new Error(`Default config not found at ${configPath}`);
		}

		const content = await readFile(configPath, "utf-8");
		this.defaultConfig = JSON.parse(content) as WorktreeConfig;

		logger.debug("Loaded default configuration", { configPath });

		return this.defaultConfig;
	}

	async loadProfileConfig(
		profileName: string,
	): Promise<Partial<WorktreeConfig> | null> {
		const profilePath = join(this.configDir, "profiles", `${profileName}.json`);

		if (!existsSync(profilePath)) {
			logger.warn(`Profile not found: ${profileName}`);
			return null;
		}

		const content = await readFile(profilePath, "utf-8");
		const profile = JSON.parse(content);

		logger.debug(`Loaded profile: ${profileName}`, { profilePath });

		return profile;
	}

	async buildConfig(options: CLIOptions): Promise<WorktreeConfig> {
		const defaultConfig = await this.loadDefaultConfig();
		let finalConfig = { ...defaultConfig };

		// Load profile if specified
		if (options.profile) {
			const profile = await this.loadProfileConfig(options.profile);
			if (profile) {
				finalConfig = { ...finalConfig, ...profile };
			}
		}

		// Override with CLI options
		if (options.output) {
			finalConfig.worktreeBasePath = options.output;
		}

		if (options.noDeps) {
			finalConfig.autoInstallDeps = false;
		}

		if (options.noTerminal) {
			finalConfig.openTerminal = false;
		}

		if (options.terminal) {
			const validTerminals = ["Hyper", "iTerm2", "Warp", "Terminal"];
			if (validTerminals.includes(options.terminal)) {
				finalConfig.terminalApp = options.terminal as
					| "Hyper"
					| "iTerm2"
					| "Warp"
					| "Terminal";
			} else {
				logger.warn(`Invalid terminal: ${options.terminal}. Using default.`);
			}
		}

		if (options.debug) {
			logger.setDebug(true);
		}

		return finalConfig;
	}

	expandPath(path: string): string {
		if (path.startsWith("~/")) {
			return join(process.env.HOME || "", path.slice(2));
		}
		return path;
	}

	async saveWorktreeHistory(
		worktreePath: string,
		metadata: any,
	): Promise<void> {
		const historyPath = join(this.configDir, "..", ".worktrees.json");

		let history: any[] = [];

		if (existsSync(historyPath)) {
			const content = await readFile(historyPath, "utf-8");
			history = JSON.parse(content);
		}

		history.push({
			path: worktreePath,
			createdAt: new Date().toISOString(),
			...metadata,
		});

		await Bun.write(historyPath, JSON.stringify(history, null, 2));
		logger.debug("Saved worktree to history", { historyPath });
	}
}
