//! Configuration management

pub mod profiles;

use crate::CrawlerConfig;
use std::path::PathBuf;
use url::Url;

pub fn build_config(
    base_url: String,
    domain: Option<String>,
    workers: Option<usize>,
    depth: Option<usize>,
    rate: Option<f64>,
    profile: Option<&str>,
    output: Option<PathBuf>,
    sitemap: Option<bool>,
) -> CrawlerConfig {
    let mut config = CrawlerConfig::default();
    
    if let Some(profile_name) = profile {
        if let Some(p) = profiles::get_profile(profile_name) {
            config.max_depth = p.max_depth;
            config.max_workers = p.max_workers;
            config.rate_limit = p.rate_limit;
            config.timeout = p.timeout;
        }
    }
    
    config.base_url = base_url.clone();

    // Extract domain from base_url if not provided
    config.allowed_domain = domain.or_else(|| {
        Url::parse(&base_url)
            .ok()
            .and_then(|url| url.domain().map(|d| d.to_string()))
    });
    
    if let Some(w) = workers {
        config.max_workers = w;
    }
    if let Some(d) = depth {
        config.max_depth = d;
    }
    if let Some(r) = rate {
        config.rate_limit = r;
    }
    if let Some(o) = output {
        config.output_dir = o;
    }
    if let Some(s) = sitemap {
        config.use_sitemap = s;
    }

    // Ensure output directory exists
    if let Err(e) = std::fs::create_dir_all(&config.output_dir) {
        eprintln!("Warning: Could not create output directory: {}", e);
    }

    config
}
