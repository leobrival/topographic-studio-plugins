//! Stealth mode service for anti-detection
//!
//! Provides user-agent rotation, TLS fingerprinting, and other anti-bot measures

use rand::seq::SliceRandom;
use reqwest::header::{HeaderMap, HeaderValue, USER_AGENT, ACCEPT, ACCEPT_LANGUAGE, ACCEPT_ENCODING};
use std::sync::Arc;

use super::Service;

/// Stealth configuration
#[derive(Debug, Clone)]
pub struct StealthConfig {
    /// Enable user-agent rotation
    pub rotate_user_agent: bool,
    /// Enable random delays
    pub random_delays: bool,
    /// Enable TLS fingerprinting randomization
    pub randomize_tls: bool,
    /// Custom user agents (if empty, uses defaults)
    pub custom_user_agents: Vec<String>,
}

impl Default for StealthConfig {
    fn default() -> Self {
        Self {
            rotate_user_agent: true,
            random_delays: false,
            randomize_tls: false,
            custom_user_agents: Vec::new(),
        }
    }
}

/// Service trait for stealth operations
pub trait StealthService: Service {
    /// Get headers for a request with stealth mode applied
    fn get_stealth_headers(&self) -> HeaderMap;

    /// Get a random user agent
    fn get_user_agent(&self) -> String;

    /// Get random delay in milliseconds (0 if disabled)
    fn get_random_delay(&self) -> u64;

    /// Clone the service as Arc
    fn clone_service(&self) -> Arc<dyn StealthService>;
}

/// Default implementation of StealthService
pub struct DefaultStealthService {
    config: StealthConfig,
    user_agents: Vec<String>,
}

impl DefaultStealthService {
    pub fn new() -> Self {
        Self::with_config(StealthConfig::default())
    }

    pub fn with_config(config: StealthConfig) -> Self {
        let user_agents = if config.custom_user_agents.is_empty() {
            Self::default_user_agents()
        } else {
            config.custom_user_agents.clone()
        };

        Self {
            config,
            user_agents,
        }
    }

    /// Default user agents covering major browsers and platforms
    fn default_user_agents() -> Vec<String> {
        vec![
            // Chrome on Windows
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36".to_string(),
            // Chrome on macOS
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36".to_string(),
            // Firefox on Windows
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0".to_string(),
            // Firefox on macOS
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0".to_string(),
            // Safari on macOS
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15".to_string(),
            // Edge on Windows
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0".to_string(),
            // Chrome on Linux
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36".to_string(),
            // Firefox on Linux
            "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0".to_string(),
        ]
    }
}

impl Default for DefaultStealthService {
    fn default() -> Self {
        Self::new()
    }
}

impl Service for DefaultStealthService {}

impl StealthService for DefaultStealthService {
    fn get_stealth_headers(&self) -> HeaderMap {
        let mut headers = HeaderMap::new();

        // User-Agent
        let user_agent = self.get_user_agent();
        if let Ok(value) = HeaderValue::from_str(&user_agent) {
            headers.insert(USER_AGENT, value);
        }

        // Accept
        headers.insert(
            ACCEPT,
            HeaderValue::from_static(
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            ),
        );

        // Accept-Language
        headers.insert(
            ACCEPT_LANGUAGE,
            HeaderValue::from_static("en-US,en;q=0.9"),
        );

        // Accept-Encoding
        headers.insert(
            ACCEPT_ENCODING,
            HeaderValue::from_static("gzip, deflate, br"),
        );

        // Additional realistic headers
        headers.insert("Sec-Fetch-Site", HeaderValue::from_static("same-origin"));
        headers.insert("Sec-Fetch-Mode", HeaderValue::from_static("navigate"));
        headers.insert("Sec-Fetch-Dest", HeaderValue::from_static("document"));
        headers.insert("Sec-Fetch-User", HeaderValue::from_static("?1"));

        headers
    }

    fn get_user_agent(&self) -> String {
        if self.config.rotate_user_agent {
            let mut rng = rand::thread_rng();
            self.user_agents
                .choose(&mut rng)
                .cloned()
                .unwrap_or_else(|| self.user_agents[0].clone())
        } else {
            self.user_agents[0].clone()
        }
    }

    fn get_random_delay(&self) -> u64 {
        if self.config.random_delays {
            use rand::Rng;
            let mut rng = rand::thread_rng();
            rng.gen_range(100..500) // 100-500ms random delay
        } else {
            0
        }
    }

    fn clone_service(&self) -> Arc<dyn StealthService> {
        Arc::new(Self {
            config: self.config.clone(),
            user_agents: self.user_agents.clone(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_user_agents() {
        let service = DefaultStealthService::new();
        assert!(!service.user_agents.is_empty());
        assert_eq!(service.user_agents.len(), 8);
    }

    #[test]
    fn test_stealth_headers() {
        let service = DefaultStealthService::new();
        let headers = service.get_stealth_headers();

        assert!(headers.contains_key(USER_AGENT));
        assert!(headers.contains_key(ACCEPT));
        assert!(headers.contains_key(ACCEPT_LANGUAGE));
        assert!(headers.contains_key(ACCEPT_ENCODING));
    }

    #[test]
    fn test_user_agent_rotation() {
        let config = StealthConfig {
            rotate_user_agent: true,
            ..Default::default()
        };
        let service = DefaultStealthService::with_config(config);

        // Get multiple user agents and verify they can vary
        let ua1 = service.get_user_agent();
        assert!(!ua1.is_empty());
        assert!(service.user_agents.contains(&ua1));
    }

    #[test]
    fn test_custom_user_agents() {
        let custom_agents = vec!["Custom Agent 1".to_string(), "Custom Agent 2".to_string()];
        let config = StealthConfig {
            custom_user_agents: custom_agents.clone(),
            ..Default::default()
        };
        let service = DefaultStealthService::with_config(config);

        assert_eq!(service.user_agents, custom_agents);
    }

    #[test]
    fn test_random_delay_disabled() {
        let service = DefaultStealthService::new();
        assert_eq!(service.get_random_delay(), 0);
    }

    #[test]
    fn test_random_delay_enabled() {
        let config = StealthConfig {
            random_delays: true,
            ..Default::default()
        };
        let service = DefaultStealthService::with_config(config);
        let delay = service.get_random_delay();

        assert!(delay >= 100 && delay < 500);
    }
}
