//! Sitemap.xml parser for URL discovery

use anyhow::Result;
use serde::Deserialize;
use std::collections::HashSet;

/// URL entry in a sitemap
#[derive(Debug, Clone, Deserialize)]
struct SitemapUrl {
	loc: String,
}

/// Regular sitemap structure
#[derive(Debug, Clone, Deserialize)]
struct Sitemap {
	#[serde(rename = "url", default)]
	urls: Vec<SitemapUrl>,
}

/// Sitemap index URL entry
#[derive(Debug, Clone, Deserialize)]
struct SitemapIndexUrl {
	loc: String,
}

/// Sitemap index structure
#[derive(Debug, Clone, Deserialize)]
struct SitemapIndex {
	#[serde(rename = "sitemap", default)]
	sitemaps: Vec<SitemapIndexUrl>,
}

/// Discovers and parses sitemap.xml files
pub struct SitemapParser {
	client: reqwest::Client,
	max_urls: usize,
}

impl SitemapParser {
	/// Creates a new sitemap parser
	pub fn new(timeout: u64, max_urls: usize) -> Self {
		let client = reqwest::Client::builder()
			.timeout(std::time::Duration::from_secs(timeout))
			.build()
			.unwrap();

		Self { client, max_urls }
	}

	/// Fetches URLs from sitemap.xml (tries multiple common locations)
	pub async fn fetch_sitemap_urls(&self, base_domain: &str) -> Result<Vec<String>> {
		let sitemap_urls = vec![
			format!("https://{}/sitemap.xml", base_domain),
			format!("https://{}/sitemap_index.xml", base_domain),
			format!("https://{}/wp-sitemap.xml", base_domain),
		];

		let mut all_urls = Vec::new();

		for sitemap_url in sitemap_urls {
			println!("Trying sitemap: {}", sitemap_url);

			match self.fetch_single_sitemap(&sitemap_url).await {
				Ok(urls) if !urls.is_empty() => {
					println!("Found {} URLs from sitemap", urls.len());
					all_urls.extend(urls);

					// Stop if we found URLs
					if !all_urls.is_empty() {
						break;
					}
				}
				Ok(_) => continue,
				Err(e) => {
					eprintln!("Failed to fetch sitemap {}: {}", sitemap_url, e);
					continue;
				}
			}
		}

		// Deduplicate and limit
		let unique_urls: Vec<String> = all_urls
			.into_iter()
			.collect::<HashSet<_>>()
			.into_iter()
			.take(self.max_urls)
			.collect();

		Ok(unique_urls)
	}

	/// Fetches a single sitemap URL
	async fn fetch_single_sitemap(&self, url: &str) -> Result<Vec<String>> {
		let response = self.client.get(url).send().await?;

		if !response.status().is_success() {
			return Ok(Vec::new());
		}

		let body = response.text().await?;

		// Try to parse as sitemap index first
		if let Ok(urls) = self.parse_sitemap_index(&body).await {
			if !urls.is_empty() {
				return Ok(urls);
			}
		}

		// Try to parse as regular sitemap
		self.parse_sitemap(&body)
	}

	/// Parses a sitemap index and fetches all sub-sitemaps
	fn parse_sitemap_index<'a>(
		&'a self,
		xml: &'a str,
	) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Vec<String>>> + 'a>> {
		Box::pin(async move {
			let index: SitemapIndex = quick_xml::de::from_str(xml)?;

			if index.sitemaps.is_empty() {
				return Ok(Vec::new());
			}

			println!("Found sitemap index with {} sitemaps", index.sitemaps.len());

			let mut all_urls = Vec::new();

			for sitemap_entry in index.sitemaps.iter().take(10) {
				// Limit to 10 sub-sitemaps
				match self.fetch_single_sitemap(&sitemap_entry.loc).await {
					Ok(urls) => all_urls.extend(urls),
					Err(e) => eprintln!("Failed to fetch sub-sitemap {}: {}", sitemap_entry.loc, e),
				}
			}

			Ok(all_urls)
		})
	}

	/// Parses a regular sitemap
	fn parse_sitemap(&self, xml: &str) -> Result<Vec<String>> {
		let sitemap: Sitemap = quick_xml::de::from_str(xml)?;

		let urls: Vec<String> = sitemap.urls.into_iter().map(|u| u.loc).collect();

		Ok(urls)
	}
}

#[cfg(test)]
mod tests {
	use super::*;

	#[tokio::test]
	async fn test_parse_sitemap() {
		let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
  </url>
  <url>
    <loc>https://example.com/about</loc>
  </url>
</urlset>"#;

		let parser = SitemapParser::new(30, 1000);
		let urls = parser.parse_sitemap(xml).unwrap();

		assert_eq!(urls.len(), 2);
		assert_eq!(urls[0], "https://example.com/");
		assert_eq!(urls[1], "https://example.com/about");
	}

	#[tokio::test]
	async fn test_parse_sitemap_index() {
		let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-1.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-2.xml</loc>
  </sitemap>
</sitemapindex>"#;

		let index: SitemapIndex = quick_xml::de::from_str(xml).unwrap();

		assert_eq!(index.sitemaps.len(), 2);
		assert_eq!(index.sitemaps[0].loc, "https://example.com/sitemap-1.xml");
	}
}
