/**
 * Type definitions for the web crawler system
 */

export type LogLevel = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export interface CrawlerConfig {
	baseURL: string;
	allowedDomain?: string;
	maxDepth: number;
	maxWorkers: number;
	rateLimit: number;
	outputDir: string;
	useSitemap: boolean;
	maxSitemapURLs: number;
	timeout: number;
	respectRobotsTxt: boolean;
	excludePatterns?: string[];
	includePatterns?: string[];
}

export interface CrawlProfile {
	name: string;
	description: string;
	maxDepth: number;
	maxWorkers: number;
	rateLimit: number;
	timeout: number;
}

export interface PageResult {
	url: string;
	title: string;
	statusCode: number;
	depth: number;
	links: string[];
	error?: string;
	crawledAt: string;
	contentType: string;
}

export interface CrawlStats {
	pagesFound: number;
	pagesCrawled: number;
	externalLinks: number;
	excludedLinks: number;
	errors: number;
	startTime: string;
	endTime?: string;
	duration?: number;
}

export interface CrawlResults {
	stats: CrawlStats;
	results: PageResult[];
}

export interface CLIOptions {
	url: string;
	domain?: string;
	workers?: number;
	depth?: number;
	rate?: number;
	profile?: string;
	output?: string;
	sitemap?: boolean;
	debug?: boolean;
}

export interface GoProcessResult {
	success: boolean;
	results?: CrawlResults;
	error?: string;
}
