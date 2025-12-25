/**
 * File utilities
 * Handles file operations like copying .env files
 */

import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { $ } from "bun";
import { logger } from "./logger";

export class FileUtils {
	async findEnvFiles(sourcePath: string): Promise<string[]> {
		const envFiles: string[] = [];

		try {
			const result = await $`find ${sourcePath} -name ".env*" -type f`.text();
			const files = result
				.split("\n")
				.filter(Boolean)
				.filter((f) => !f.includes("node_modules"))
				.filter((f) => !f.includes(".git"));

			return files;
		} catch (error) {
			logger.warn("Failed to find .env files", error);
			return [];
		}
	}

	async copyEnvFiles(sourcePath: string, targetPath: string): Promise<number> {
		const envFiles = await this.findEnvFiles(sourcePath);

		if (envFiles.length === 0) {
			logger.debug("No .env files found to copy");
			return 0;
		}

		logger.info(`Found ${envFiles.length} .env file(s) to copy`);

		let copiedCount = 0;

		for (const envFile of envFiles) {
			try {
				const relativePath = relative(sourcePath, envFile);
				const targetFile = join(targetPath, relativePath);
				const targetDir = dirname(targetFile);

				// Create target directory if needed
				await mkdir(targetDir, { recursive: true });

				// Copy file
				await copyFile(envFile, targetFile);

				logger.debug(`Copied: ${relativePath}`);
				copiedCount++;
			} catch (error) {
				logger.warn(`Failed to copy ${envFile}`, error);
			}
		}

		logger.success(`Copied ${copiedCount} .env file(s)`);

		return copiedCount;
	}

	async directorySize(path: string): Promise<number> {
		try {
			const result = await $`du -sk ${path}`.text();
			const sizeInKB = parseInt(result.split("\t")[0], 10);
			return sizeInKB * 1024; // Convert to bytes
		} catch {
			return 0;
		}
	}

	async fileExists(path: string): Promise<boolean> {
		return existsSync(path);
	}

	async isDirectory(path: string): Promise<boolean> {
		try {
			const result = await $`test -d ${path}`.quiet();
			return result.exitCode === 0;
		} catch {
			return false;
		}
	}

	async ensureDirectory(path: string): Promise<void> {
		await mkdir(path, { recursive: true });
	}
}
