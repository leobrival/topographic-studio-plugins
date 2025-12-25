/**
 * Bridge between TypeScript and Go crawler engine
 * Handles compilation, execution, and communication with Go process
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { logger } from "./logger";
import type { CrawlerConfig, CrawlResults, GoProcessResult } from "./types";

export class GoBridge {
	private engineDir: string;
	private crawlerBinary: string;

	constructor(engineDir: string) {
		this.engineDir = engineDir;
		this.crawlerBinary = join(engineDir, "crawler");
	}

	async ensureCrawlerExists(): Promise<boolean> {
		if (existsSync(this.crawlerBinary)) {
			logger.debug("Go crawler binary found");
			return true;
		}

		logger.info("Go crawler binary not found, compiling...");
		return await this.compileCrawler();
	}

	private async compileCrawler(): Promise<boolean> {
		if (!existsSync(this.engineDir)) {
			logger.error(`Engine directory not found: ${this.engineDir}`);
			return false;
		}

		// Check if Go is installed
		const goCheck = await this.checkGoInstalled();
		if (!goCheck) {
			logger.error("Go is not installed. Install with: brew install go");
			return false;
		}

		logger.info("Compiling Go crawler (this may take a moment)...");

		return new Promise((resolve) => {
			const buildProcess = spawn("go", ["build", "-o", "crawler", "main.go"], {
				cwd: this.engineDir,
				stdio: ["ignore", "pipe", "pipe"],
			});

			let stderr = "";

			buildProcess.stderr?.on("data", (data) => {
				stderr += data.toString();
			});

			buildProcess.on("close", (code) => {
				if (code === 0) {
					logger.info("Go crawler compiled successfully");
					resolve(true);
				} else {
					logger.error(`Go compilation failed with code ${code}`);
					if (stderr) {
						logger.error(`Compilation error: ${stderr}`);
					}
					resolve(false);
				}
			});

			buildProcess.on("error", (err) => {
				logger.error(`Failed to start Go compilation: ${err.message}`);
				resolve(false);
			});
		});
	}

	private async checkGoInstalled(): Promise<boolean> {
		return new Promise((resolve) => {
			const goVersion = spawn("go", ["version"], { stdio: "ignore" });
			goVersion.on("close", (code) => resolve(code === 0));
			goVersion.on("error", () => resolve(false));
		});
	}

	async executeCrawler(config: CrawlerConfig): Promise<GoProcessResult> {
		// Ensure binary exists
		const exists = await this.ensureCrawlerExists();
		if (!exists) {
			return {
				success: false,
				error: "Failed to compile or find Go crawler binary",
			};
		}

		// Prepare output directory
		await mkdir(config.outputDir, { recursive: true });

		// Build command arguments
		const args = [
			"--url",
			config.baseURL,
			"--domain",
			config.allowedDomain || "",
			"--depth",
			config.maxDepth.toString(),
			"--workers",
			config.maxWorkers.toString(),
			"--rate",
			config.rateLimit.toString(),
			"--output",
			config.outputDir,
		];

		if (config.useSitemap) {
			args.push("--sitemap");
		}

		logger.info("Starting Go crawler...");
		logger.debug(`Command: ${this.crawlerBinary} ${args.join(" ")}`);

		return new Promise((resolve) => {
			const crawlerProcess = spawn(this.crawlerBinary, args, {
				cwd: this.engineDir,
				stdio: ["ignore", "inherit", "inherit"], // Stream output directly to console
			});

			const timeout = setTimeout(() => {
				logger.warn("Crawler timeout (10 minutes), killing process...");
				crawlerProcess.kill();
				resolve({
					success: false,
					error: "Crawler timeout exceeded (10 minutes)",
				});
			}, 600000); // 10 minutes

			crawlerProcess.on("close", async (code) => {
				clearTimeout(timeout);

				if (code === 0) {
					logger.info("Go crawler finished successfully");
					// Read results
					const results = await this.readResults(config.outputDir);
					if (results) {
						resolve({ success: true, results });
					} else {
						resolve({
							success: false,
							error: "Failed to read crawler results",
						});
					}
				} else {
					logger.error(`Go crawler failed with exit code ${code}`);
					resolve({
						success: false,
						error: `Crawler process exited with code ${code}`,
					});
				}
			});

			crawlerProcess.on("error", (err) => {
				clearTimeout(timeout);
				logger.error(`Failed to start Go crawler: ${err.message}`);
				resolve({
					success: false,
					error: err.message,
				});
			});
		});
	}

	private async readResults(outputDir: string): Promise<CrawlResults | null> {
		const resultsFile = join(outputDir, "results.json");

		if (!existsSync(resultsFile)) {
			logger.error(`Results file not found: ${resultsFile}`);
			return null;
		}

		try {
			const content = await readFile(resultsFile, "utf-8");
			return JSON.parse(content);
		} catch (error) {
			logger.error(`Failed to read results file: ${error}`);
			return null;
		}
	}

	async writeConfigFile(
		config: CrawlerConfig,
		outputPath: string,
	): Promise<boolean> {
		try {
			await writeFile(outputPath, JSON.stringify(config, null, 2), "utf-8");
			logger.debug(`Config written to: ${outputPath}`);
			return true;
		} catch (error) {
			logger.error(`Failed to write config file: ${error}`);
			return false;
		}
	}
}
