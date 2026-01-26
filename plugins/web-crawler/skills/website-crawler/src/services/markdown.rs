//! Markdown conversion service
//!
//! Converts HTML content to clean, LLM-ready Markdown format

use html2md;
use scraper::{Html, Selector};
use std::sync::Arc;
use url::Url;

use super::Service;

/// Configuration for Markdown conversion
#[derive(Debug, Clone)]
pub struct MarkdownConfig {
    /// Add frontmatter with metadata
    pub include_frontmatter: bool,
    /// Include source URL in output
    pub include_source_url: bool,
    /// Convert code blocks with language detection
    pub preserve_code_blocks: bool,
    /// Maximum line length (0 = no limit)
    pub max_line_length: usize,
}

impl Default for MarkdownConfig {
    fn default() -> Self {
        Self {
            include_frontmatter: true,
            include_source_url: true,
            preserve_code_blocks: true,
            max_line_length: 0,
        }
    }
}

/// Markdown output with metadata
#[derive(Debug, Clone)]
pub struct MarkdownOutput {
    /// Converted markdown content
    pub content: String,
    /// Extracted title
    pub title: Option<String>,
    /// Extracted description
    pub description: Option<String>,
    /// Word count
    pub word_count: usize,
}

/// Service trait for Markdown conversion
pub trait MarkdownService: Service {
    /// Convert HTML to Markdown
    fn convert(&self, html: &str, url: &str) -> Result<MarkdownOutput, String>;

    /// Convert HTML to Markdown with custom config
    fn convert_with_config(
        &self,
        html: &str,
        url: &str,
        config: &MarkdownConfig,
    ) -> Result<MarkdownOutput, String>;

    /// Clone the service as Arc
    fn clone_service(&self) -> Arc<dyn MarkdownService>;
}

/// Default implementation of MarkdownService
pub struct DefaultMarkdownService {
    config: MarkdownConfig,
}

impl DefaultMarkdownService {
    pub fn new() -> Self {
        Self::with_config(MarkdownConfig::default())
    }

    pub fn with_config(config: MarkdownConfig) -> Self {
        Self { config }
    }

    /// Extract metadata from HTML
    fn extract_metadata(&self, html: &str) -> (Option<String>, Option<String>) {
        let document = Html::parse_document(html);

        // Extract title
        let title = if let Ok(selector) = Selector::parse("title") {
            document
                .select(&selector)
                .next()
                .map(|el| el.text().collect::<String>().trim().to_string())
        } else {
            None
        };

        // Extract description from meta tags
        let description = if let Ok(selector) = Selector::parse("meta[name='description']") {
            document
                .select(&selector)
                .next()
                .and_then(|el| el.value().attr("content"))
                .map(|s| s.to_string())
        } else {
            None
        };

        (title, description)
    }

    /// Create frontmatter for Markdown
    fn create_frontmatter(
        &self,
        url: &str,
        title: Option<&str>,
        description: Option<&str>,
    ) -> String {
        let mut frontmatter = String::from("---\n");

        if let Some(title) = title {
            frontmatter.push_str(&format!("title: \"{}\"\n", Self::escape_yaml(title)));
        }

        if let Some(description) = description {
            frontmatter.push_str(&format!(
                "description: \"{}\"\n",
                Self::escape_yaml(description)
            ));
        }

        frontmatter.push_str(&format!("source: \"{}\"\n", url));

        let now = chrono::Utc::now();
        frontmatter.push_str(&format!("crawled_at: \"{}\"\n", now.to_rfc3339()));

        frontmatter.push_str("---\n\n");
        frontmatter
    }

    /// Escape YAML special characters
    fn escape_yaml(s: &str) -> String {
        s.replace('"', "\\\"").replace('\n', " ")
    }

    /// Optimize markdown for LLMs
    fn optimize_for_llm(&self, markdown: String, url: &str) -> String {
        let mut optimized = markdown;

        // Remove excessive blank lines (more than 2 consecutive)
        let re = regex::Regex::new(r"\n{3,}").unwrap();
        optimized = re.replace_all(&optimized, "\n\n").to_string();

        // Trim whitespace from each line
        optimized = optimized
            .lines()
            .map(|line| line.trim_end())
            .collect::<Vec<_>>()
            .join("\n");

        // Add source context if configured
        if self.config.include_source_url {
            let parsed_url = Url::parse(url).ok();
            let domain = parsed_url
                .and_then(|u| u.host_str().map(|h| h.to_string()))
                .unwrap_or_else(|| "unknown".to_string());

            optimized.push_str(&format!("\n\n---\n*Source: {}*\n", domain));
        }

        optimized
    }

    /// Count words in text
    fn count_words(&self, text: &str) -> usize {
        text.split_whitespace().count()
    }
}

impl Default for DefaultMarkdownService {
    fn default() -> Self {
        Self::new()
    }
}

impl Service for DefaultMarkdownService {}

impl MarkdownService for DefaultMarkdownService {
    fn convert(&self, html: &str, url: &str) -> Result<MarkdownOutput, String> {
        self.convert_with_config(html, url, &self.config)
    }

    fn convert_with_config(
        &self,
        html: &str,
        url: &str,
        config: &MarkdownConfig,
    ) -> Result<MarkdownOutput, String> {
        // Extract metadata
        let (title, description) = self.extract_metadata(html);

        // Convert HTML to Markdown using html2md
        let markdown = html2md::parse_html(html);

        // Optimize for LLM consumption
        let optimized = self.optimize_for_llm(markdown, url);

        // Add frontmatter if configured
        let content = if config.include_frontmatter {
            let frontmatter = self.create_frontmatter(url, title.as_deref(), description.as_deref());
            format!("{}{}", frontmatter, optimized)
        } else {
            optimized
        };

        // Count words
        let word_count = self.count_words(&content);

        Ok(MarkdownOutput {
            content,
            title,
            description,
            word_count,
        })
    }

    fn clone_service(&self) -> Arc<dyn MarkdownService> {
        Arc::new(Self {
            config: self.config.clone(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_conversion() {
        let service = DefaultMarkdownService::new();
        let html = r#"
            <!DOCTYPE html>
            <html>
            <head>
                <title>Test Page</title>
                <meta name="description" content="Test description">
            </head>
            <body>
                <h1>Hello World</h1>
                <p>This is a test.</p>
            </body>
            </html>
        "#;

        let result = service.convert(html, "https://example.com").unwrap();

        assert!(result.content.contains("Hello World"));
        assert!(result.content.contains("This is a test"));
        assert_eq!(result.title, Some("Test Page".to_string()));
        assert_eq!(result.description, Some("Test description".to_string()));
        assert!(result.word_count > 0);
    }

    #[test]
    fn test_frontmatter_generation() {
        let config = MarkdownConfig {
            include_frontmatter: true,
            ..Default::default()
        };
        let service = DefaultMarkdownService::with_config(config);
        let html = r#"
            <html>
            <head><title>Test</title></head>
            <body><p>Content</p></body>
            </html>
        "#;

        let result = service.convert(html, "https://example.com").unwrap();

        assert!(result.content.starts_with("---\n"));
        assert!(result.content.contains("title: \"Test\""));
        assert!(result.content.contains("source: \"https://example.com\""));
        assert!(result.content.contains("crawled_at:"));
    }

    #[test]
    fn test_no_frontmatter() {
        let config = MarkdownConfig {
            include_frontmatter: false,
            ..Default::default()
        };
        let service = DefaultMarkdownService::with_config(config);
        let html = r#"
            <html>
            <head><title>Test</title></head>
            <body><p>Content</p></body>
            </html>
        "#;

        let result = service.convert(html, "https://example.com").unwrap();

        assert!(!result.content.starts_with("---\n"));
    }

    #[test]
    fn test_code_block_preservation() {
        let service = DefaultMarkdownService::new();
        let html = r#"
            <html>
            <body>
                <pre><code class="language-rust">fn main() {
    println!("Hello");
}</code></pre>
            </body>
            </html>
        "#;

        let result = service.convert(html, "https://example.com").unwrap();

        assert!(result.content.contains("fn main()"));
        assert!(result.content.contains("println!"));
    }

    #[test]
    fn test_word_count() {
        let service = DefaultMarkdownService::new();
        let html = r#"
            <html>
            <body>
                <p>One two three four five</p>
            </body>
            </html>
        "#;

        let result = service.convert(html, "https://example.com").unwrap();

        assert!(result.word_count >= 5);
    }

    #[test]
    fn test_yaml_escaping() {
        let escaped = DefaultMarkdownService::escape_yaml("Test \"quoted\" text\nwith newline");
        assert!(escaped.contains("\\\""));
        assert!(!escaped.contains('\n'));
    }
}
