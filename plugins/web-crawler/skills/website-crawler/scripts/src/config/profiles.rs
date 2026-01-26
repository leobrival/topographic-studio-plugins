//! Predefined crawl profiles

use crate::CrawlProfile;

pub fn get_profiles() -> Vec<CrawlProfile> {
    vec![
        CrawlProfile {
            name: "fast".to_string(),
            description: "Fast crawl with high concurrency".to_string(),
            max_depth: 3,
            max_workers: 50,
            rate_limit: 10.0,
            timeout: 15,
        },
        CrawlProfile {
            name: "deep".to_string(),
            description: "Deep crawl for comprehensive mapping".to_string(),
            max_depth: 10,
            max_workers: 20,
            rate_limit: 3.0,
            timeout: 30,
        },
        CrawlProfile {
            name: "gentle".to_string(),
            description: "Gentle crawl respecting server resources".to_string(),
            max_depth: 5,
            max_workers: 5,
            rate_limit: 1.0,
            timeout: 45,
        },
    ]
}

pub fn get_profile(name: &str) -> Option<CrawlProfile> {
    get_profiles().into_iter().find(|p| p.name == name)
}
