/**
 * Configuration management system
 * Handles loading profiles and merging with CLI options
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { logger } from "./logger";
import type { CLIOptions, CrawlerConfig, CrawlProfile } from "./types";

export class ConfigManager {
	private configDir: string;

	constructor(configDir: string) {
		this.configDir = configDir;
	}

	async loadDefaultConfig(): Promise<Partial<CrawlerConfig>> {
		const defaultPath = join(this.configDir, "default.json");

		if (!existsSync(defaultPath)) {
			logger.warn("Default config not found, using hardcoded defaults");
			return this.getHardcodedDefaults();
		}

		try {
			const content = await readFile(defaultPath, "utf-8");
			return JSON.parse(content);
		} catch (error) {
			logger.error(`Failed to load default config: ${error}`);
			return this.getHardcodedDefaults();
		}
	}

	async loadProfile(
		profileName: string,
	): Promise<Partial<CrawlerConfig> | null> {
		const profilePath = join(this.configDir, "profiles", `${profileName}.json`);

		if (!existsSync(profilePath)) {
			logger.error(`Profile '${profileName}' not found at ${profilePath}`);
			return null;
		}

		try {
			const content = await readFile(profilePath, "utf-8");
			const profile: CrawlProfile = JSON.parse(content);
			logger.info(`Loaded profile: ${profile.name} - ${profile.description}`);
			return this.profileToConfig(profile);
		} catch (error) {
			logger.error(`Failed to load profile '${profileName}': ${error}`);
			return null;
		}
	}

	async buildConfig(options: CLIOptions): Promise<CrawlerConfig> {
		let config = await this.loadDefaultConfig();

		// Load profile if specified
		if (options.profile) {
			const profileConfig = await this.loadProfile(options.profile);
			if (profileConfig) {
				config = { ...config, ...profileConfig };
			}
		}

		// Parse domain from URL if not provided
		const allowedDomain = options.domain || this.extractDomain(options.url);

		// Override with CLI options
		const finalConfig: CrawlerConfig = {
			baseURL: options.url,
			allowedDomain,
			maxDepth: options.depth ?? (config.maxDepth || 5),
			maxWorkers: options.workers ?? (config.maxWorkers || 20),
			rateLimit: options.rate ?? (config.rateLimit || 2),
			outputDir:
				options.output ??
				(config.outputDir || this.getDefaultOutputDir(allowedDomain)),
			useSitemap: options.sitemap ?? (config.useSitemap || true),
			maxSitemapURLs: config.maxSitemapURLs || 1000,
			timeout: config.timeout || 30,
			respectRobotsTxt: config.respectRobotsTxt ?? true,
			excludePatterns: config.excludePatterns || [],
			includePatterns: config.includePatterns || [],
		};

		return finalConfig;
	}

	private getHardcodedDefaults(): Partial<CrawlerConfig> {
		return {
			maxDepth: 5,
			maxWorkers: 20,
			rateLimit: 2,
			timeout: 30,
			useSitemap: true,
			maxSitemapURLs: 1000,
			respectRobotsTxt: true,
			excludePatterns: [],
			includePatterns: [],
		};
	}

	private profileToConfig(profile: CrawlProfile): Partial<CrawlerConfig> {
		return {
			maxDepth: profile.maxDepth,
			maxWorkers: profile.maxWorkers,
			rateLimit: profile.rateLimit,
			timeout: profile.timeout,
		};
	}

	private extractDomain(url: string): string {
		try {
			const urlObj = new URL(url);
			return urlObj.hostname;
		} catch (error) {
			logger.error(`Failed to parse URL: ${url}`);
			return "unknown";
		}
	}

	private getDefaultOutputDir(domain: string): string {
		const safeDomain = domain.replace(/\./g, "_");
		const homeDir = process.env.HOME || "/tmp";
		return join(homeDir, "Desktop", `crawler_results_${safeDomain}`);
	}

	listProfiles(): string[] {
		const profilesDir = join(this.configDir, "profiles");
		if (!existsSync(profilesDir)) {
			return [];
		}

		try {
			const files = require("node:fs").readdirSync(profilesDir);
			return files
				.filter((f: string) => f.endsWith(".json"))
				.map((f: string) => f.replace(".json", ""));
		} catch (error) {
			logger.error(`Failed to list profiles: ${error}`);
			return [];
		}
	}
}
