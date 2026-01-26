//! Type definitions and core exports for rcrawler

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

// Module exports
pub mod config;
pub mod crawler;
pub mod integrations;
pub mod output;
pub mod parser;
pub mod services;
pub mod utils;

/// Configuration for the web crawler
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CrawlerConfig {
	/// Starting URL for the crawl
	pub base_url: String,

	/// Restrict crawling to this domain (optional)
	pub allowed_domain: Option<String>,

	/// Maximum crawl depth
	pub max_depth: usize,

	/// Number of concurrent workers
	pub max_workers: usize,

	/// Rate limit (requests per second)
	pub rate_limit: f64,

	/// Output directory for results
	pub output_dir: PathBuf,

	/// Use sitemap.xml for URL discovery
	pub use_sitemap: bool,

	/// Maximum URLs to extract from sitemap
	pub max_sitemap_urls: usize,

	/// HTTP request timeout in seconds
	pub timeout: u64,

	/// Respect robots.txt rules
	pub respect_robots_txt: bool,

	/// URL patterns to exclude (regex)
	pub exclude_patterns: Vec<String>,

	/// URL patterns to include (regex)
	pub include_patterns: Vec<String>,
}

/// Predefined crawl profile
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrawlProfile {
	pub name: String,
	pub description: String,
	pub max_depth: usize,
	pub max_workers: usize,
	pub rate_limit: f64,
	pub timeout: u64,
}

/// Result from crawling a single page
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PageResult {
	/// Page URL
	pub url: String,

	/// Page title (extracted from <title>)
	pub title: String,

	/// HTTP status code
	pub status_code: u16,

	/// Crawl depth from base URL
	pub depth: usize,

	/// Links found on the page
	pub links: Vec<String>,

	/// Error message if crawl failed
	#[serde(skip_serializing_if = "Option::is_none")]
	pub error: Option<String>,

	/// Timestamp when page was crawled
	pub crawled_at: DateTime<Utc>,

	/// Content-Type header
	pub content_type: String,
}

/// Statistics for the entire crawl
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CrawlStats {
	/// Total pages discovered
	pub pages_found: usize,

	/// Total pages successfully crawled
	pub pages_crawled: usize,

	/// External links found
	pub external_links: usize,

	/// Links excluded by patterns
	pub excluded_links: usize,

	/// Number of errors
	pub errors: usize,

	/// Crawl start time
	pub start_time: DateTime<Utc>,

	/// Crawl end time
	#[serde(skip_serializing_if = "Option::is_none")]
	pub end_time: Option<DateTime<Utc>>,

	/// Total duration in milliseconds
	#[serde(skip_serializing_if = "Option::is_none")]
	pub duration: Option<u64>,
}

/// Complete crawl results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrawlResults {
	pub stats: CrawlStats,
	pub results: Vec<PageResult>,
}

/// Output format options
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum OutputFormat {
	/// JSON results file + HTML report
	#[default]
	Default,
	/// JSON results only
	Json,
	/// Markdown LLM-ready format
	Markdown,
}

/// Graph node for visualization
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphNode {
	/// URL (unique identifier)
	pub id: String,

	/// Page title or path
	pub label: String,

	/// Crawl depth
	pub depth: usize,

	/// Status indicator
	pub status: NodeStatus,

	/// Incoming links count
	pub in_degree: usize,

	/// Outgoing links count
	pub out_degree: usize,

	/// Node size (for visualization)
	pub val: f32,
}

/// Node status in the graph
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum NodeStatus {
	Success,
	Error,
	External,
}

/// Graph link between nodes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphLink {
	pub source: String,
	pub target: String,
}

/// Complete graph data for visualization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphData {
	pub nodes: Vec<GraphNode>,
	pub links: Vec<GraphLink>,
}

impl Default for CrawlerConfig {
	fn default() -> Self {
		let output_dir = dirs::home_dir()
			.map(|home| home.join("Desktop").join("crawl_results"))
			.unwrap_or_else(|| PathBuf::from("./output"));

		Self {
			base_url: String::new(),
			allowed_domain: None,
			max_depth: 2,
			max_workers: 20,
			rate_limit: 2.0,
			output_dir,
			use_sitemap: true,
			max_sitemap_urls: 1000,
			timeout: 30,
			respect_robots_txt: true,
			exclude_patterns: vec![
				r"\.jpg$".to_string(),
				r"\.png$".to_string(),
				r"\.gif$".to_string(),
				r"\.svg$".to_string(),
				r"\.pdf$".to_string(),
				r"\.zip$".to_string(),
				r"\.css$".to_string(),
				r"\.js$".to_string(),
				r"^mailto:".to_string(),
				r"^tel:".to_string(),
				r"^javascript:".to_string(),
			],
			include_patterns: vec![],
		}
	}
}

impl CrawlStats {
	/// Create initial stats at start time
	pub fn new() -> Self {
		Self {
			pages_found: 0,
			pages_crawled: 0,
			external_links: 0,
			excluded_links: 0,
			errors: 0,
			start_time: Utc::now(),
			end_time: None,
			duration: None,
		}
	}
}

impl Default for CrawlStats {
	fn default() -> Self {
		Self::new()
	}
}

impl std::str::FromStr for OutputFormat {
	type Err = String;

	fn from_str(s: &str) -> Result<Self, Self::Err> {
		match s.to_lowercase().as_str() {
			"json" => Ok(Self::Json),
			"markdown" | "md" => Ok(Self::Markdown),
			"default" | "html" => Ok(Self::Default),
			_ => Err(format!("Unknown output format: {}", s)),
		}
	}
}
