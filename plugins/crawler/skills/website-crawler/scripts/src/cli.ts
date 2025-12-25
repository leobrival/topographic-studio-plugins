/**
 * CLI interface for the web crawler
 * Parses command line arguments and displays help
 */

import { logger } from "./lib/logger";
import type { CLIOptions } from "./lib/types";

export class CLI {
	private args: string[];

	constructor(args: string[] = process.argv.slice(2)) {
		this.args = args;
	}

	parse(): CLIOptions | null {
		if (
			this.args.length === 0 ||
			this.hasFlag("--help") ||
			this.hasFlag("-h")
		) {
			this.showHelp();
			return null;
		}

		if (this.hasFlag("--version") || this.hasFlag("-v")) {
			this.showVersion();
			return null;
		}

		// First argument is the URL
		const url = this.args[0];
		if (!url || url.startsWith("--") || url.startsWith("-")) {
			logger.error("URL is required as the first argument");
			this.showHelp();
			return null;
		}

		const options: CLIOptions = {
			url,
			domain: this.getOption("--domain", "-d"),
			workers: this.getNumberOption("--workers", "-w"),
			depth: this.getNumberOption("--depth", "-D"),
			rate: this.getNumberOption("--rate", "-r"),
			profile: this.getOption("--profile", "-p"),
			output: this.getOption("--output", "-o"),
			sitemap: this.hasFlag("--sitemap") || this.hasFlag("-s"),
			debug: this.hasFlag("--debug"),
		};

		return options;
	}

	private hasFlag(flag: string): boolean {
		return this.args.includes(flag);
	}

	private getOption(longFlag: string, shortFlag?: string): string | undefined {
		let index = this.args.indexOf(longFlag);
		if (index === -1 && shortFlag) {
			index = this.args.indexOf(shortFlag);
		}

		if (index !== -1 && index + 1 < this.args.length) {
			return this.args[index + 1];
		}

		return undefined;
	}

	private getNumberOption(
		longFlag: string,
		shortFlag?: string,
	): number | undefined {
		const value = this.getOption(longFlag, shortFlag);
		if (value) {
			const num = Number.parseInt(value, 10);
			if (!Number.isNaN(num)) {
				return num;
			}
			logger.warn(`Invalid number for ${longFlag}: ${value}`);
		}
		return undefined;
	}

	private showHelp(): void {
		const help = `
Web Crawler - High-performance site crawling with Go backend

USAGE:
  crawler <URL> [OPTIONS]

ARGUMENTS:
  <URL>                     The URL to start crawling from

OPTIONS:
  -d, --domain <DOMAIN>     Restrict crawling to this domain (default: extracted from URL)
  -w, --workers <NUM>       Number of concurrent workers (default: 20)
  -D, --depth <NUM>         Maximum crawl depth (default: 2)
  -r, --rate <NUM>          Rate limit in requests/second (default: 2)
  -p, --profile <NAME>      Use predefined profile (fast, deep, gentle)
  -o, --output <DIR>        Output directory (default: ~/Desktop/crawler_results_<domain>)
  -s, --sitemap             Use sitemap.xml for URL discovery (default: true)
  --debug                   Enable debug logging
  -h, --help                Show this help message
  -v, --version             Show version information

PROFILES:
  fast     - Fast crawling with high concurrency (50 workers, depth 3)
  deep     - Deep crawling with moderate speed (20 workers, depth 10)
  gentle   - Gentle crawling respecting servers (5 workers, depth 5)

EXAMPLES:
  # Basic crawling
  crawler https://example.com

  # Crawl with custom settings
  crawler https://example.com --workers 50 --depth 10 --rate 5

  # Use a predefined profile
  crawler https://example.com --profile fast

  # Crawl with sitemap discovery
  crawler https://example.com --sitemap

  # Restrict to specific domain
  crawler https://blog.example.com --domain example.com

For more information, see the documentation at ~/.claude/scripts/crawler/README.md
`;

		console.log(help);
	}

	private showVersion(): void {
		console.log("Web Crawler v1.0.0");
		console.log("TypeScript/Bun frontend with Go backend");
	}
}
