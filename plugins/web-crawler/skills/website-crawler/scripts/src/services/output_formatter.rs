//! Output formatting service for flexible output generation
//!
//! Supports multiple output formats: JSON, Markdown, HTML, Links, etc.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;

use crate::{CrawlResults, PageResult};

use super::Service;

/// Available output formats
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OutputFormat {
    /// JSON structured data
    Json,
    /// Markdown format (LLM-ready)
    Markdown,
    /// HTML report
    Html,
    /// List of links only
    Links,
    /// CSV format
    Csv,
    /// Plain text
    Text,
}

impl OutputFormat {
    /// Parse format from string
    pub fn from_str(s: &str) -> Result<Self, String> {
        match s.to_lowercase().as_str() {
            "json" => Ok(Self::Json),
            "markdown" | "md" => Ok(Self::Markdown),
            "html" => Ok(Self::Html),
            "links" => Ok(Self::Links),
            "csv" => Ok(Self::Csv),
            "text" | "txt" => Ok(Self::Text),
            _ => Err(format!("Unknown output format: {}", s)),
        }
    }

    /// Get file extension for format
    pub fn extension(&self) -> &str {
        match self {
            Self::Json => "json",
            Self::Markdown => "md",
            Self::Html => "html",
            Self::Links => "txt",
            Self::Csv => "csv",
            Self::Text => "txt",
        }
    }
}

/// Configuration for output formatting
#[derive(Debug, Clone)]
pub struct OutputFormatterConfig {
    /// Formats to generate
    pub formats: Vec<OutputFormat>,
    /// Pretty print JSON
    pub pretty_json: bool,
    /// Include errors in output
    pub include_errors: bool,
    /// Maximum items in links output
    pub max_links: Option<usize>,
}

impl Default for OutputFormatterConfig {
    fn default() -> Self {
        Self {
            formats: vec![OutputFormat::Json, OutputFormat::Html],
            pretty_json: true,
            include_errors: true,
            max_links: None,
        }
    }
}

/// Output data for a single format
#[derive(Debug, Clone)]
pub struct FormattedOutput {
    /// Output format
    pub format: OutputFormat,
    /// Formatted content
    pub content: String,
    /// Suggested filename (without extension)
    pub filename: String,
}

impl FormattedOutput {
    /// Get full filename with extension
    pub fn full_filename(&self) -> String {
        format!("{}.{}", self.filename, self.format.extension())
    }
}

/// Service trait for output formatting
pub trait OutputFormatterService: Service {
    /// Format crawl results in all configured formats
    fn format(&self, results: &CrawlResults) -> Result<Vec<FormattedOutput>, String>;

    /// Format crawl results with custom config
    fn format_with_config(
        &self,
        results: &CrawlResults,
        config: &OutputFormatterConfig,
    ) -> Result<Vec<FormattedOutput>, String>;

    /// Format to a specific format
    fn format_single(
        &self,
        results: &CrawlResults,
        format: OutputFormat,
    ) -> Result<FormattedOutput, String>;

    /// Clone the service as Arc
    fn clone_service(&self) -> Arc<dyn OutputFormatterService>;
}

/// Default implementation of OutputFormatterService
pub struct DefaultOutputFormatterService {
    config: OutputFormatterConfig,
}

impl DefaultOutputFormatterService {
    pub fn new() -> Self {
        Self::with_config(OutputFormatterConfig::default())
    }

    pub fn with_config(config: OutputFormatterConfig) -> Self {
        Self { config }
    }

    /// Format as JSON
    fn format_json(&self, results: &CrawlResults, pretty: bool) -> Result<String, String> {
        if pretty {
            serde_json::to_string_pretty(results).map_err(|e| e.to_string())
        } else {
            serde_json::to_string(results).map_err(|e| e.to_string())
        }
    }

    /// Format as Markdown
    fn format_markdown(&self, results: &CrawlResults) -> Result<String, String> {
        let mut md = String::new();

        // Title
        md.push_str("# Crawl Results\n\n");

        // Stats
        md.push_str("## Statistics\n\n");
        md.push_str(&format!("- **Pages Found**: {}\n", results.stats.pages_found));
        md.push_str(&format!(
            "- **Pages Crawled**: {}\n",
            results.stats.pages_crawled
        ));
        md.push_str(&format!(
            "- **External Links**: {}\n",
            results.stats.external_links
        ));
        md.push_str(&format!("- **Errors**: {}\n", results.stats.errors));

        if let Some(duration) = results.stats.duration {
            md.push_str(&format!("- **Duration**: {}ms\n", duration));
        }

        md.push_str("\n");

        // Results by depth
        let mut by_depth: HashMap<usize, Vec<&PageResult>> = HashMap::new();
        for result in &results.results {
            by_depth.entry(result.depth).or_default().push(result);
        }

        let mut depths: Vec<_> = by_depth.keys().collect();
        depths.sort();

        for depth in depths {
            let pages = &by_depth[depth];
            md.push_str(&format!("## Depth {} ({} pages)\n\n", depth, pages.len()));

            for page in pages {
                md.push_str(&format!("### {}\n\n", page.title));
                md.push_str(&format!("**URL**: {}\n\n", page.url));
                md.push_str(&format!("**Status**: {}\n\n", page.status_code));

                if !page.links.is_empty() {
                    md.push_str(&format!("**Links** ({}):\n\n", page.links.len()));
                    for (i, link) in page.links.iter().enumerate().take(10) {
                        md.push_str(&format!("{}. {}\n", i + 1, link));
                    }
                    if page.links.len() > 10 {
                        md.push_str(&format!("\n*...and {} more*\n", page.links.len() - 10));
                    }
                    md.push_str("\n");
                }

                if let Some(error) = &page.error {
                    md.push_str(&format!("**Error**: {}\n\n", error));
                }

                md.push_str("---\n\n");
            }
        }

        Ok(md)
    }

    /// Format as links list
    fn format_links(&self, results: &CrawlResults, max_links: Option<usize>) -> Result<String, String> {
        let mut links = String::new();

        let urls: Vec<_> = results.results.iter().map(|r| &r.url).collect();
        let limit = max_links.unwrap_or(urls.len());

        for (i, url) in urls.iter().enumerate().take(limit) {
            links.push_str(url);
            links.push('\n');

            if i >= limit - 1 && urls.len() > limit {
                links.push_str(&format!("\n# {} more URLs omitted\n", urls.len() - limit));
                break;
            }
        }

        Ok(links)
    }

    /// Format as CSV
    fn format_csv(&self, results: &CrawlResults) -> Result<String, String> {
        let mut csv = String::new();

        // Header
        csv.push_str("URL,Title,Status Code,Depth,Links Count,Error\n");

        // Rows
        for result in &results.results {
            csv.push_str(&format!(
                "\"{}\",\"{}\",{},{},{},\"{}\"\n",
                Self::escape_csv(&result.url),
                Self::escape_csv(&result.title),
                result.status_code,
                result.depth,
                result.links.len(),
                result.error.as_deref().unwrap_or("")
            ));
        }

        Ok(csv)
    }

    /// Format as plain text
    fn format_text(&self, results: &CrawlResults) -> Result<String, String> {
        let mut text = String::new();

        text.push_str("=== CRAWL RESULTS ===\n\n");

        text.push_str("Statistics:\n");
        text.push_str(&format!("  Pages Found: {}\n", results.stats.pages_found));
        text.push_str(&format!("  Pages Crawled: {}\n", results.stats.pages_crawled));
        text.push_str(&format!("  External Links: {}\n", results.stats.external_links));
        text.push_str(&format!("  Errors: {}\n", results.stats.errors));

        if let Some(duration) = results.stats.duration {
            text.push_str(&format!("  Duration: {}ms\n", duration));
        }

        text.push_str("\n");

        text.push_str("Pages:\n\n");
        for (i, result) in results.results.iter().enumerate() {
            text.push_str(&format!("{}. {}\n", i + 1, result.title));
            text.push_str(&format!("   URL: {}\n", result.url));
            text.push_str(&format!("   Status: {}\n", result.status_code));
            text.push_str(&format!("   Depth: {}\n", result.depth));
            text.push_str(&format!("   Links: {}\n", result.links.len()));

            if let Some(error) = &result.error {
                text.push_str(&format!("   Error: {}\n", error));
            }

            text.push_str("\n");
        }

        Ok(text)
    }

    /// Escape CSV field
    fn escape_csv(s: &str) -> String {
        s.replace('"', "\"\"")
    }
}

impl Default for DefaultOutputFormatterService {
    fn default() -> Self {
        Self::new()
    }
}

impl Service for DefaultOutputFormatterService {}

impl OutputFormatterService for DefaultOutputFormatterService {
    fn format(&self, results: &CrawlResults) -> Result<Vec<FormattedOutput>, String> {
        self.format_with_config(results, &self.config)
    }

    fn format_with_config(
        &self,
        results: &CrawlResults,
        config: &OutputFormatterConfig,
    ) -> Result<Vec<FormattedOutput>, String> {
        let mut outputs = Vec::new();

        for format in &config.formats {
            let output = self.format_single(results, *format)?;
            outputs.push(output);
        }

        Ok(outputs)
    }

    fn format_single(
        &self,
        results: &CrawlResults,
        format: OutputFormat,
    ) -> Result<FormattedOutput, String> {
        let content = match format {
            OutputFormat::Json => self.format_json(results, self.config.pretty_json)?,
            OutputFormat::Markdown => self.format_markdown(results)?,
            OutputFormat::Html => {
                // Note: HTML formatting would use the existing html.rs module
                // For now, we'll use JSON as fallback
                self.format_json(results, false)?
            }
            OutputFormat::Links => self.format_links(results, self.config.max_links)?,
            OutputFormat::Csv => self.format_csv(results)?,
            OutputFormat::Text => self.format_text(results)?,
        };

        Ok(FormattedOutput {
            format,
            content,
            filename: "results".to_string(),
        })
    }

    fn clone_service(&self) -> Arc<dyn OutputFormatterService> {
        Arc::new(Self {
            config: self.config.clone(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{CrawlStats, PageResult};
    use chrono::Utc;

    fn create_test_results() -> CrawlResults {
        CrawlResults {
            stats: CrawlStats {
                pages_found: 10,
                pages_crawled: 8,
                external_links: 5,
                excluded_links: 2,
                errors: 2,
                start_time: Utc::now(),
                end_time: Some(Utc::now()),
                duration: Some(5000),
            },
            results: vec![
                PageResult {
                    url: "https://example.com".to_string(),
                    title: "Example Domain".to_string(),
                    status_code: 200,
                    depth: 0,
                    links: vec!["https://example.com/page1".to_string()],
                    error: None,
                    crawled_at: Utc::now(),
                    content_type: "text/html".to_string(),
                },
                PageResult {
                    url: "https://example.com/page1".to_string(),
                    title: "Page 1".to_string(),
                    status_code: 200,
                    depth: 1,
                    links: vec![],
                    error: None,
                    crawled_at: Utc::now(),
                    content_type: "text/html".to_string(),
                },
            ],
        }
    }

    #[test]
    fn test_format_json() {
        let service = DefaultOutputFormatterService::new();
        let results = create_test_results();

        let output = service.format_single(&results, OutputFormat::Json).unwrap();

        assert_eq!(output.format, OutputFormat::Json);
        assert!(output.content.contains("Example Domain"));
        assert!(output.full_filename().ends_with(".json"));
    }

    #[test]
    fn test_format_markdown() {
        let service = DefaultOutputFormatterService::new();
        let results = create_test_results();

        let output = service.format_single(&results, OutputFormat::Markdown).unwrap();

        assert_eq!(output.format, OutputFormat::Markdown);
        assert!(output.content.contains("# Crawl Results"));
        assert!(output.content.contains("## Statistics"));
        assert!(output.content.contains("Example Domain"));
    }

    #[test]
    fn test_format_links() {
        let service = DefaultOutputFormatterService::new();
        let results = create_test_results();

        let output = service.format_single(&results, OutputFormat::Links).unwrap();

        assert_eq!(output.format, OutputFormat::Links);
        assert!(output.content.contains("https://example.com"));
        assert!(output.content.contains("https://example.com/page1"));
    }

    #[test]
    fn test_format_csv() {
        let service = DefaultOutputFormatterService::new();
        let results = create_test_results();

        let output = service.format_single(&results, OutputFormat::Csv).unwrap();

        assert_eq!(output.format, OutputFormat::Csv);
        assert!(output.content.contains("URL,Title,Status Code"));
        assert!(output.content.contains("Example Domain"));
    }

    #[test]
    fn test_format_text() {
        let service = DefaultOutputFormatterService::new();
        let results = create_test_results();

        let output = service.format_single(&results, OutputFormat::Text).unwrap();

        assert_eq!(output.format, OutputFormat::Text);
        assert!(output.content.contains("=== CRAWL RESULTS ==="));
        assert!(output.content.contains("Example Domain"));
    }

    #[test]
    fn test_multiple_formats() {
        let config = OutputFormatterConfig {
            formats: vec![OutputFormat::Json, OutputFormat::Markdown, OutputFormat::Links],
            ..Default::default()
        };
        let service = DefaultOutputFormatterService::with_config(config);
        let results = create_test_results();

        let outputs = service.format(&results).unwrap();

        assert_eq!(outputs.len(), 3);
        assert_eq!(outputs[0].format, OutputFormat::Json);
        assert_eq!(outputs[1].format, OutputFormat::Markdown);
        assert_eq!(outputs[2].format, OutputFormat::Links);
    }

    #[test]
    fn test_output_format_parsing() {
        assert_eq!(OutputFormat::from_str("json").unwrap(), OutputFormat::Json);
        assert_eq!(OutputFormat::from_str("markdown").unwrap(), OutputFormat::Markdown);
        assert_eq!(OutputFormat::from_str("md").unwrap(), OutputFormat::Markdown);
        assert_eq!(OutputFormat::from_str("html").unwrap(), OutputFormat::Html);
        assert_eq!(OutputFormat::from_str("links").unwrap(), OutputFormat::Links);
        assert_eq!(OutputFormat::from_str("csv").unwrap(), OutputFormat::Csv);
        assert!(OutputFormat::from_str("invalid").is_err());
    }
}
