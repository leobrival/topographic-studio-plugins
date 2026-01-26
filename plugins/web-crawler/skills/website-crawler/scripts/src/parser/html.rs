//! HTML parsing

use scraper::{Html, Selector};
use anyhow::Result;

pub struct HtmlParser;

impl HtmlParser {
    pub fn new() -> Self {
        Self
    }
    
    pub fn parse_title(&self, html: &str) -> String {
        let document = Html::parse_document(html);
        let title_selector = Selector::parse("title").unwrap();
        
        document
            .select(&title_selector)
            .next()
            .map(|el| el.text().collect::<String>())
            .unwrap_or_else(|| "No title".to_string())
    }
    
    pub fn parse_links(&self, html: &str, base_url: &url::Url) -> Result<Vec<String>> {
        let document = Html::parse_document(html);
        let link_selector = Selector::parse("a[href]").unwrap();
        
        let mut links = Vec::new();
        
        for element in document.select(&link_selector) {
            if let Some(href) = element.value().attr("href") {
                if let Ok(absolute_url) = base_url.join(href) {
                    links.push(absolute_url.to_string());
                }
            }
        }
        
        Ok(links)
    }
}
