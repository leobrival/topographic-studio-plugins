//! Raycast integration for compact output

use crate::CrawlResults;
use std::env;

/// Checks if running in Raycast environment
pub fn is_raycast_env() -> bool {
	env::var("RAYCAST").is_ok()
}

/// Formats results for Raycast display (compact JSON)
pub fn format_for_raycast(results: &CrawlResults) -> String {
	let stats = &results.stats;
	
	// Compact summary
	let summary = format!(
		"✅ Crawl complete: {} pages in {}ms",
		stats.pages_crawled,
		stats.duration.unwrap_or(0)
	);

	// Top 10 pages only for Raycast
	let top_pages: Vec<RaycastPage> = results.results
		.iter()
		.take(10)
		.map(|p| RaycastPage {
			url: p.url.clone(),
			title: p.title.clone(),
			status: p.status_code,
			depth: p.depth,
		})
		.collect();

	let output = RaycastOutput {
		summary,
		stats: RaycastStats {
			pages_crawled: stats.pages_crawled,
			pages_found: stats.pages_found,
			errors: stats.errors,
			duration_ms: stats.duration.unwrap_or(0),
		},
		top_pages,
	};

	serde_json::to_string_pretty(&output).unwrap_or_else(|_| "Error formatting output".to_string())
}

#[derive(serde::Serialize)]
struct RaycastOutput {
	summary: String,
	stats: RaycastStats,
	top_pages: Vec<RaycastPage>,
}

#[derive(serde::Serialize)]
struct RaycastStats {
	pages_crawled: usize,
	pages_found: usize,
	errors: usize,
	duration_ms: u64,
}

#[derive(serde::Serialize)]
struct RaycastPage {
	url: String,
	title: String,
	status: u16,
	depth: usize,
}

#[cfg(test)]
mod tests {
	use super::*;
	use crate::{CrawlStats, PageResult};
	use chrono::Utc;

	#[test]
	fn test_raycast_format() {
		let results = CrawlResults {
			stats: CrawlStats {
				pages_found: 10,
				pages_crawled: 10,
				external_links: 0,
				excluded_links: 0,
				errors: 0,
				start_time: Utc::now(),
				end_time: Some(Utc::now()),
				duration: Some(1000),
			},
			results: vec![
				PageResult {
					url: "https://example.com".to_string(),
					title: "Example".to_string(),
					status_code: 200,
					depth: 0,
					links: vec![],
					error: None,
					crawled_at: Utc::now(),
					content_type: "text/html".to_string(),
				}
			],
		};

		let output = format_for_raycast(&results);
		assert!(output.contains("pages_crawled"));
		assert!(output.contains("summary"));
	}
}
