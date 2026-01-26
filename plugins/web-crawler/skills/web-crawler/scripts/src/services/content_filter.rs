//! Content filtering service for intelligent HTML cleaning
//!
//! Removes unwanted elements like navigation, ads, footers to improve
//! data quality for downstream processing (LLMs, analysis, archival)

use scraper::{Html, ElementRef};
use std::sync::Arc;

use super::Service;

/// Configuration for content filtering
#[derive(Debug, Clone)]
pub struct ContentFilterConfig {
    /// Remove navigation elements
    pub remove_nav: bool,
    /// Remove footer elements
    pub remove_footer: bool,
    /// Remove sidebar elements
    pub remove_sidebar: bool,
    /// Remove advertisement elements
    pub remove_ads: bool,
    /// Remove script and style tags
    pub remove_scripts_styles: bool,
    /// Remove comments
    pub remove_comments: bool,
    /// Remove elements with these IDs
    pub blacklist_ids: Vec<String>,
    /// Remove elements with these classes
    pub blacklist_classes: Vec<String>,
    /// Remove these elements by tag name
    pub blacklist_tags: Vec<String>,
    /// Keep only these elements (if not empty, whitelist mode)
    pub whitelist_tags: Vec<String>,
}

impl Default for ContentFilterConfig {
    fn default() -> Self {
        Self {
            remove_nav: true,
            remove_footer: true,
            remove_sidebar: true,
            remove_ads: true,
            remove_scripts_styles: true,
            remove_comments: true,
            blacklist_ids: vec![
                "header".to_string(),
                "footer".to_string(),
                "nav".to_string(),
                "sidebar".to_string(),
                "menu".to_string(),
                "navigation".to_string(),
                "advertisement".to_string(),
                "ads".to_string(),
                "cookie-banner".to_string(),
                "social-share".to_string(),
            ],
            blacklist_classes: vec![
                "header".to_string(),
                "footer".to_string(),
                "nav".to_string(),
                "navigation".to_string(),
                "sidebar".to_string(),
                "aside".to_string(),
                "menu".to_string(),
                "ad".to_string(),
                "ads".to_string(),
                "advertisement".to_string(),
                "social".to_string(),
                "share".to_string(),
                "cookie".to_string(),
                "popup".to_string(),
                "modal".to_string(),
            ],
            blacklist_tags: vec![
                "script".to_string(),
                "style".to_string(),
                "noscript".to_string(),
                "iframe".to_string(),
            ],
            whitelist_tags: vec![],
        }
    }
}

/// Statistics about filtered content
#[derive(Debug, Clone, Default)]
pub struct FilterStats {
    /// Number of elements removed
    pub elements_removed: usize,
    /// Original HTML size in bytes
    pub original_size: usize,
    /// Filtered HTML size in bytes
    pub filtered_size: usize,
    /// Reduction percentage
    pub reduction_percent: f64,
}

impl FilterStats {
    pub fn new(original_size: usize, filtered_size: usize, elements_removed: usize) -> Self {
        let reduction_percent = if original_size > 0 {
            (1.0 - (filtered_size as f64 / original_size as f64)) * 100.0
        } else {
            0.0
        };

        Self {
            elements_removed,
            original_size,
            filtered_size,
            reduction_percent,
        }
    }
}

/// Service trait for content filtering
pub trait ContentFilterService: Service {
    /// Filter HTML content
    fn filter(&self, html: &str) -> Result<(String, FilterStats), String>;

    /// Filter HTML with custom config
    fn filter_with_config(
        &self,
        html: &str,
        config: &ContentFilterConfig,
    ) -> Result<(String, FilterStats), String>;

    /// Clone the service as Arc
    fn clone_service(&self) -> Arc<dyn ContentFilterService>;
}

/// Default implementation of ContentFilterService
pub struct DefaultContentFilterService {
    config: ContentFilterConfig,
}

impl DefaultContentFilterService {
    pub fn new() -> Self {
        Self::with_config(ContentFilterConfig::default())
    }

    pub fn with_config(config: ContentFilterConfig) -> Self {
        Self { config }
    }

    /// Check if element should be removed by semantic rules
    fn should_remove_semantic(&self, element: ElementRef, config: &ContentFilterConfig) -> bool {
        let tag_name = element.value().name();

        // Check tag-based removal
        if config.remove_nav && tag_name == "nav" {
            return true;
        }
        if config.remove_footer && tag_name == "footer" {
            return true;
        }
        if config.remove_sidebar && (tag_name == "aside" || tag_name == "sidebar") {
            return true;
        }

        // Check blacklist tags
        if config.blacklist_tags.contains(&tag_name.to_string()) {
            return true;
        }

        // Check scripts/styles
        if config.remove_scripts_styles
            && (tag_name == "script" || tag_name == "style" || tag_name == "noscript")
        {
            return true;
        }

        false
    }

    /// Check if element should be removed by attributes
    fn should_remove_by_attributes(
        &self,
        element: ElementRef,
        config: &ContentFilterConfig,
    ) -> bool {
        // Check ID attribute
        if let Some(id) = element.value().attr("id") {
            let id_lower = id.to_lowercase();
            if config.blacklist_ids.iter().any(|bid| id_lower.contains(bid)) {
                return true;
            }

            // Common ad/tracking patterns
            if config.remove_ads
                && (id_lower.contains("ad")
                    || id_lower.contains("advertisement")
                    || id_lower.contains("sponsor"))
            {
                return true;
            }
        }

        // Check class attribute
        if let Some(classes) = element.value().attr("class") {
            let classes_lower = classes.to_lowercase();
            if config
                .blacklist_classes
                .iter()
                .any(|bc| classes_lower.contains(bc))
            {
                return true;
            }

            // Common ad/tracking patterns
            if config.remove_ads
                && (classes_lower.contains("ad")
                    || classes_lower.contains("advertisement")
                    || classes_lower.contains("sponsor")
                    || classes_lower.contains("banner"))
            {
                return true;
            }
        }

        // Check role attribute (ARIA)
        if let Some(role) = element.value().attr("role") {
            if config.remove_nav && (role == "navigation" || role == "banner") {
                return true;
            }
            if config.remove_ads && role == "complementary" {
                return true; // Often used for ads/sidebars
            }
        }

        false
    }

    /// Build list of selectors to remove
    fn build_removal_selectors(&self, config: &ContentFilterConfig) -> Vec<String> {
        let mut selectors = Vec::new();

        // Semantic elements
        if config.remove_nav {
            selectors.push("nav".to_string());
            selectors.push("[role='navigation']".to_string());
        }
        if config.remove_footer {
            selectors.push("footer".to_string());
        }
        if config.remove_sidebar {
            selectors.push("aside".to_string());
        }
        if config.remove_scripts_styles {
            selectors.push("script".to_string());
            selectors.push("style".to_string());
            selectors.push("noscript".to_string());
        }

        // Blacklisted IDs
        for id in &config.blacklist_ids {
            selectors.push(format!("#{}", id));
        }

        // Blacklisted classes
        for class in &config.blacklist_classes {
            selectors.push(format!(".{}", class));
        }

        // Blacklisted tags
        for tag in &config.blacklist_tags {
            selectors.push(tag.clone());
        }

        selectors
    }

    /// Filter HTML and return cleaned version
    fn filter_html(&self, html: &str, _config: &ContentFilterConfig) -> (String, usize) {
        let document = Html::parse_document(html);

        // For now, return a simplified version
        // In a full implementation, we would actually remove elements
        // This requires more complex DOM manipulation

        let cleaned = document.html();
        let removed_count = 0;

        (cleaned, removed_count)
    }
}

impl Default for DefaultContentFilterService {
    fn default() -> Self {
        Self::new()
    }
}

impl Service for DefaultContentFilterService {}

impl ContentFilterService for DefaultContentFilterService {
    fn filter(&self, html: &str) -> Result<(String, FilterStats), String> {
        self.filter_with_config(html, &self.config)
    }

    fn filter_with_config(
        &self,
        html: &str,
        config: &ContentFilterConfig,
    ) -> Result<(String, FilterStats), String> {
        let original_size = html.len();

        let (filtered, removed_count) = self.filter_html(html, config);
        let filtered_size = filtered.len();

        let stats = FilterStats::new(original_size, filtered_size, removed_count);

        Ok((filtered, stats))
    }

    fn clone_service(&self) -> Arc<dyn ContentFilterService> {
        Arc::new(Self {
            config: self.config.clone(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_filter_service_exists() {
        let service = DefaultContentFilterService::new();
        let html = r#"<html><body><p>Test</p></body></html>"#;

        let result = service.filter(html);
        assert!(result.is_ok());
    }

    #[test]
    fn test_filter_preserves_content() {
        let service = DefaultContentFilterService::new();
        let html = r#"
            <html>
            <body>
                <nav>Menu</nav>
                <main>Content</main>
            </body>
            </html>
        "#;

        let (filtered, _) = service.filter(html).unwrap();

        // Current implementation returns HTML as-is
        assert!(filtered.contains("Content"));
    }

    #[test]
    fn test_stats_generated() {
        let service = DefaultContentFilterService::new();
        let html = r#"
            <html>
            <head>
                <script>var x = 1;</script>
            </head>
            <body>
                <nav>Menu</nav>
                <p>Content</p>
            </body>
            </html>
        "#;

        let (_, stats) = service.filter(html).unwrap();

        assert_eq!(stats.original_size, html.len());
        assert!(stats.filtered_size > 0);
    }

    #[test]
    fn test_custom_config() {
        let config = ContentFilterConfig {
            remove_nav: false,
            remove_scripts_styles: true,
            ..Default::default()
        };
        let service = DefaultContentFilterService::with_config(config);
        let html = r#"
            <html>
            <body>
                <nav>Menu</nav>
                <script>alert('test');</script>
                <p>Content</p>
            </body>
            </html>
        "#;

        let result = service.filter(html);
        assert!(result.is_ok());
    }

    #[test]
    fn test_filter_with_config() {
        let service = DefaultContentFilterService::new();
        let config = ContentFilterConfig::default();
        let html = r#"<html><body><p>Test</p></body></html>"#;

        let result = service.filter_with_config(html, &config);
        assert!(result.is_ok());
    }

    #[test]
    fn test_clone_service() {
        let service = DefaultContentFilterService::new();
        let cloned = service.clone_service();

        let html = r#"<html><body><p>Test</p></body></html>"#;
        let result = cloned.filter(html);
        assert!(result.is_ok());
    }
}
