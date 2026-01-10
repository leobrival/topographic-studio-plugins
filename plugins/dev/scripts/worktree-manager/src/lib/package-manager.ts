/**
 * Package manager detection and operations
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";
import { logger } from "./logger";
import type { PackageManagerInfo } from "./types";

export class PackageManager {
	async detect(projectPath: string): Promise<PackageManagerInfo | null> {
		const managers: PackageManagerInfo[] = [
			{
				name: "pnpm",
				lockFile: "pnpm-lock.yaml",
				installCommand: "pnpm install",
			},
			{ name: "bun", lockFile: "bun.lockb", installCommand: "bun install" },
			{ name: "yarn", lockFile: "yarn.lock", installCommand: "yarn install" },
			{
				name: "npm",
				lockFile: "package-lock.json",
				installCommand: "npm install",
			},
		];

		for (const manager of managers) {
			const lockPath = join(projectPath, manager.lockFile);
			if (existsSync(lockPath)) {
				logger.debug(`Detected package manager: ${manager.name}`, { lockPath });
				return manager;
			}
		}

		// Check if package.json exists
		const packageJsonPath = join(projectPath, "package.json");
		if (existsSync(packageJsonPath)) {
			logger.debug("No lock file found, defaulting to npm");
			return managers[3]; // npm
		}

		return null;
	}

	async install(
		projectPath: string,
		packageManager: PackageManagerInfo,
	): Promise<boolean> {
		logger.info(`Installing dependencies with ${packageManager.name}...`);

		try {
			const result =
				await $`cd ${projectPath} && ${packageManager.installCommand}`;

			if (result.exitCode === 0) {
				logger.success(`Dependencies installed with ${packageManager.name}`);
				return true;
			}

			logger.error(
				`Failed to install dependencies (exit code: ${result.exitCode})`,
			);
			return false;
		} catch (error: any) {
			logger.error("Installation failed", error);
			return false;
		}
	}

	async isInstalled(name: string): Promise<boolean> {
		try {
			const result = await $`which ${name}`.quiet();
			return result.exitCode === 0;
		} catch {
			return false;
		}
	}

	async getInstalledManagers(): Promise<string[]> {
		const managers = ["pnpm", "npm", "yarn", "bun"];
		const installed: string[] = [];

		for (const manager of managers) {
			if (await this.isInstalled(manager)) {
				installed.push(manager);
			}
		}

		return installed;
	}
}
