//! URL filtering utilities

use regex::Regex;

/// URL filter for exclude/include patterns
#[derive(Clone)]
pub struct UrlFilter {
	exclude_patterns: Vec<Regex>,
	include_patterns: Vec<Regex>,
}

impl UrlFilter {
	/// Creates a new URL filter with exclude and include patterns
	pub fn new(exclude: &[String], include: &[String]) -> Self {
		let exclude_patterns = exclude
			.iter()
			.filter_map(|p| Regex::new(p).ok())
			.collect();

		let include_patterns = include.iter().filter_map(|p| Regex::new(p).ok()).collect();

		Self {
			exclude_patterns,
			include_patterns,
		}
	}

	/// Checks if a URL should be crawled based on patterns
	pub fn should_crawl(&self, url: &str) -> bool {
		// If include patterns exist, URL must match at least one
		if !self.include_patterns.is_empty() {
			if !self.include_patterns.iter().any(|re| re.is_match(url)) {
				return false;
			}
		}

		// If URL matches any exclude pattern, reject it
		if self.exclude_patterns.iter().any(|re| re.is_match(url)) {
			return false;
		}

		true
	}
}

#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	fn test_exclude_patterns() {
		let filter = UrlFilter::new(
			&[r"\.jpg$".to_string(), r"\.png$".to_string()],
			&[],
		);

		assert!(!filter.should_crawl("https://example.com/image.jpg"));
		assert!(!filter.should_crawl("https://example.com/image.png"));
		assert!(filter.should_crawl("https://example.com/page.html"));
	}

	#[test]
	fn test_include_patterns() {
		let filter = UrlFilter::new(&[], &[r"^https://example\.com".to_string()]);

		assert!(filter.should_crawl("https://example.com/page"));
		assert!(!filter.should_crawl("https://other.com/page"));
	}

	#[test]
	fn test_combined_patterns() {
		let filter = UrlFilter::new(
			&[r"\.jpg$".to_string()],
			&[r"^https://example\.com".to_string()],
		);

		assert!(filter.should_crawl("https://example.com/page"));
		assert!(!filter.should_crawl("https://example.com/image.jpg"));
		assert!(!filter.should_crawl("https://other.com/page"));
	}
}
