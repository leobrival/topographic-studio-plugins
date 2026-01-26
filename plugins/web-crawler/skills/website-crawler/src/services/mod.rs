//! Service layer for modular architecture with dependency injection
//!
//! This module provides a service-based architecture where components can be
//! injected and swapped easily for testing and customization.

pub mod stealth;
pub mod markdown;
pub mod content_filter;
pub mod output_formatter;

use std::sync::Arc;

/// Trait for services that can be cloned across threads
pub trait Service: Send + Sync {}

/// Service container for dependency injection
#[derive(Clone)]
pub struct ServiceContainer {
    pub stealth: Arc<dyn stealth::StealthService>,
    pub markdown: Arc<dyn markdown::MarkdownService>,
    pub content_filter: Arc<dyn content_filter::ContentFilterService>,
    pub output_formatter: Arc<dyn output_formatter::OutputFormatterService>,
}

impl ServiceContainer {
    /// Create a new service container with default implementations
    pub fn new() -> Self {
        Self {
            stealth: Arc::new(stealth::DefaultStealthService::new()),
            markdown: Arc::new(markdown::DefaultMarkdownService::new()),
            content_filter: Arc::new(content_filter::DefaultContentFilterService::new()),
            output_formatter: Arc::new(output_formatter::DefaultOutputFormatterService::new()),
        }
    }

    /// Builder pattern for custom service configuration
    pub fn builder() -> ServiceContainerBuilder {
        ServiceContainerBuilder::default()
    }
}

impl Default for ServiceContainer {
    fn default() -> Self {
        Self::new()
    }
}

/// Builder for ServiceContainer
#[derive(Default)]
pub struct ServiceContainerBuilder {
    stealth: Option<Arc<dyn stealth::StealthService>>,
    markdown: Option<Arc<dyn markdown::MarkdownService>>,
    content_filter: Option<Arc<dyn content_filter::ContentFilterService>>,
    output_formatter: Option<Arc<dyn output_formatter::OutputFormatterService>>,
}

impl ServiceContainerBuilder {
    pub fn with_stealth(mut self, service: Arc<dyn stealth::StealthService>) -> Self {
        self.stealth = Some(service);
        self
    }

    pub fn with_markdown(mut self, service: Arc<dyn markdown::MarkdownService>) -> Self {
        self.markdown = Some(service);
        self
    }

    pub fn with_content_filter(
        mut self,
        service: Arc<dyn content_filter::ContentFilterService>,
    ) -> Self {
        self.content_filter = Some(service);
        self
    }

    pub fn with_output_formatter(
        mut self,
        service: Arc<dyn output_formatter::OutputFormatterService>,
    ) -> Self {
        self.output_formatter = Some(service);
        self
    }

    pub fn build(self) -> ServiceContainer {
        ServiceContainer {
            stealth: self
                .stealth
                .unwrap_or_else(|| Arc::new(stealth::DefaultStealthService::new())),
            markdown: self
                .markdown
                .unwrap_or_else(|| Arc::new(markdown::DefaultMarkdownService::new())),
            content_filter: self
                .content_filter
                .unwrap_or_else(|| Arc::new(content_filter::DefaultContentFilterService::new())),
            output_formatter: self.output_formatter.unwrap_or_else(|| {
                Arc::new(output_formatter::DefaultOutputFormatterService::new())
            }),
        }
    }
}
