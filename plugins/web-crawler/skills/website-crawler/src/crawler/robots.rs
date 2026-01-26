//! robots.txt parser and checker

use anyhow::Result;
use dashmap::DashMap;
use std::sync::Arc;
use std::time::Duration;

/// Manages robots.txt rules for multiple domains
#[derive(Clone)]
pub struct RobotsChecker {
	client: reqwest::Client,
	cache: Arc<DashMap<String, Option<String>>>, // Cache robots.txt content
	user_agent: String,
}

impl RobotsChecker {
	/// Creates a new robots.txt checker
	pub fn new(timeout: u64, user_agent: String) -> Self {
		let client = reqwest::Client::builder()
			.timeout(Duration::from_secs(timeout))
			.build()
			.unwrap();

		Self {
			client,
			cache: Arc::new(DashMap::new()),
			user_agent,
		}
	}

	/// Checks if a URL is allowed by robots.txt
	pub async fn is_allowed(&self, url: &str) -> bool {
		let parsed = match url::Url::parse(url) {
			Ok(u) => u,
			Err(_) => return true, // Invalid URL, allow by default
		};

		let domain = match parsed.domain() {
			Some(d) => d.to_string(),
			None => return true, // No domain, allow by default
		};

		// Check cache first
		if let Some(content) = self.cache.get(&domain) {
			return match content.value() {
				Some(robots_txt) => {
					let mut matcher = robotstxt::DefaultMatcher::default();
					matcher.one_agent_allowed_by_robots(&self.user_agent, robots_txt, url)
				}
				None => true, // No robots.txt found, allow all
			};
		}

		// Fetch and parse robots.txt
		let robots_url = format!("{}://{}/robots.txt", parsed.scheme(), domain);

		match self.fetch_robots(&robots_url).await {
			Ok(Some(content)) => {
				let mut matcher = robotstxt::DefaultMatcher::default();
				let allowed = matcher.one_agent_allowed_by_robots(&self.user_agent, &content, url);
				self.cache.insert(domain, Some(content));
				allowed
			}
			Ok(None) => {
				// No robots.txt found, allow all
				self.cache.insert(domain, None);
				true
			}
			Err(e) => {
				eprintln!("Failed to fetch robots.txt for {}: {}", domain, e);
				self.cache.insert(domain, None);
				true // Allow on error
			}
		}
	}

	/// Fetches robots.txt content from a URL
	async fn fetch_robots(&self, url: &str) -> Result<Option<String>> {
		let response = self.client.get(url).send().await?;

		if !response.status().is_success() {
			return Ok(None);
		}

		let body = response.text().await?;
		Ok(Some(body))
	}
}

#[cfg(test)]
mod tests {
	use super::*;

	#[tokio::test]
	async fn test_robots_txt_parsing() {
		let checker = RobotsChecker::new(30, "rcrawler/0.1.0".to_string());

		// Test with a known robots.txt
		let allowed = checker.is_allowed("https://www.google.com/search").await;
		println!("Google /search allowed: {}", allowed);

		// Should be cached now
		let allowed2 = checker.is_allowed("https://www.google.com/search").await;
		assert_eq!(allowed, allowed2);
	}

	#[tokio::test]
	async fn test_no_robots_txt() {
		let checker = RobotsChecker::new(30, "rcrawler/0.1.0".to_string());

		// Test with a domain that likely doesn't have robots.txt
		let allowed = checker.is_allowed("https://example.com/page").await;
		assert!(allowed); // Should allow by default
	}
}
