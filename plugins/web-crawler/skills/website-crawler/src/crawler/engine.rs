//! Crawling engine with concurrent worker pool

use crate::crawler::robots::RobotsChecker;
use crate::crawler::rate_limiter::RateLimiter;
use crate::utils::filters::UrlFilter;
use crate::{CrawlerConfig, PageResult, CrawlStats, CrawlResults};
use crate::parser::html::HtmlParser;
use crate::parser::sitemap::SitemapParser;
use anyhow::Result;
use chrono::Utc;
use dashmap::DashMap;
use parking_lot::Mutex;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::mpsc;
use url::Url;

#[derive(Clone)]
struct CrawlJob {
    url: String,
    depth: usize,
}

pub struct CrawlEngine {
    config: CrawlerConfig,
    client: reqwest::Client,
    parser: HtmlParser,
    robots_checker: Option<RobotsChecker>,
    url_filter: UrlFilter,
    rate_limiter: RateLimiter,
    visited: Arc<DashMap<String, ()>>,
    results: Arc<Mutex<Vec<PageResult>>>,
    stats: Arc<Mutex<CrawlStats>>,
    active_jobs: Arc<std::sync::atomic::AtomicUsize>,
    shutdown: Arc<std::sync::atomic::AtomicBool>,
}

impl CrawlEngine {
    pub fn new(config: CrawlerConfig) -> Result<Self> {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(config.timeout))
            .user_agent("rcrawler/0.1.0")
            .gzip(true)
            .build()?;

        // Create robots checker if enabled
        let robots_checker = if config.respect_robots_txt {
            Some(RobotsChecker::new(config.timeout, "rcrawler/0.1.0".to_string()))
        } else {
            None
        };

        // Create URL filter
        let url_filter = UrlFilter::new(&config.exclude_patterns, &config.include_patterns);

        // Create rate limiter
        let rate_limiter = RateLimiter::new(config.rate_limit);

        Ok(Self {
            config,
            client,
            parser: HtmlParser::new(),
            robots_checker,
            url_filter,
            rate_limiter,
            visited: Arc::new(DashMap::new()),
            results: Arc::new(Mutex::new(Vec::new())),
            stats: Arc::new(Mutex::new(CrawlStats::new())),
            active_jobs: Arc::new(std::sync::atomic::AtomicUsize::new(0)),
            shutdown: Arc::new(std::sync::atomic::AtomicBool::new(false)),
        })
    }

    pub async fn crawl(&self) -> Result<CrawlResults> {
        let (tx, rx) = mpsc::channel::<CrawlJob>(10000);
        let rx = Arc::new(tokio::sync::Mutex::new(rx));

        // Try to fetch sitemap URLs first if enabled
        if self.config.use_sitemap {
            if let Some(domain) = &self.config.allowed_domain {
                println!("Fetching sitemap URLs...");
                let sitemap_parser = SitemapParser::new(self.config.timeout, self.config.max_sitemap_urls);

                match sitemap_parser.fetch_sitemap_urls(domain).await {
                    Ok(urls) if !urls.is_empty() => {
                        println!("Adding {} URLs from sitemap", urls.len());
                        for url in urls {
                            if !self.visited.contains_key(&url) {
                                self.active_jobs.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
                                tx.send(CrawlJob {
                                    url,
                                    depth: 1, // Sitemap URLs start at depth 1
                                }).await?;
                            }
                        }
                    }
                    Ok(_) => {
                        println!("No sitemap URLs found, falling back to base URL");
                        // Fallback to base URL
                        self.active_jobs.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
                        tx.send(CrawlJob {
                            url: self.config.base_url.clone(),
                            depth: 0,
                        }).await?;
                    }
                    Err(e) => {
                        eprintln!("Failed to fetch sitemap: {}", e);
                        // Fallback to base URL
                        self.active_jobs.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
                        tx.send(CrawlJob {
                            url: self.config.base_url.clone(),
                            depth: 0,
                        }).await?;
                    }
                }
            } else {
                // No domain specified, use base URL
                self.active_jobs.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
                tx.send(CrawlJob {
                    url: self.config.base_url.clone(),
                    depth: 0,
                }).await?;
            }
        } else {
            // Sitemap disabled, use base URL
            self.active_jobs.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
            tx.send(CrawlJob {
                url: self.config.base_url.clone(),
                depth: 0,
            }).await?;
        }

        // Spawn workers
        let mut handles = Vec::new();
        for _ in 0..self.config.max_workers {
            let engine = self.clone();
            let tx_clone = tx.clone();
            let rx_clone = Arc::clone(&rx);

            let handle = tokio::spawn(async move {
                loop {
                    // Check shutdown flag
                    if engine.shutdown.load(std::sync::atomic::Ordering::SeqCst) {
                        break;
                    }

                    let job = {
                        let mut rx = rx_clone.lock().await;
                        // Use try_recv with timeout to allow checking shutdown flag
                        tokio::select! {
                            job = rx.recv() => job,
                            _ = tokio::time::sleep(Duration::from_millis(100)) => {
                                continue;
                            }
                        }
                    };

                    match job {
                        Some(job) => {
                            if let Err(e) = engine.process_job(job, &tx_clone).await {
                                eprintln!("Error processing job: {}", e);
                            }
                        }
                        None => break,
                    }
                }
            });

            handles.push(handle);
        }

        // Spawn progress monitoring task (every 5 seconds)
        let stats_clone = Arc::clone(&self.stats);
        let active_jobs_clone = Arc::clone(&self.active_jobs);
        let shutdown_clone = Arc::clone(&self.shutdown);
        tokio::spawn(async move {
            let mut ticker = tokio::time::interval(Duration::from_secs(5));
            loop {
                ticker.tick().await;

                if shutdown_clone.load(std::sync::atomic::Ordering::SeqCst) {
                    break;
                }

                let stats = stats_clone.lock();
                let active = active_jobs_clone.load(std::sync::atomic::Ordering::SeqCst);

                eprintln!(
                    "[Progress] Pages: {}/{} | Active jobs: {} | Errors: {}",
                    stats.pages_crawled,
                    stats.pages_found,
                    active,
                    stats.errors
                );
            }
        });

        // Spawn monitoring task that signals shutdown when all jobs are done
        let active_jobs = Arc::clone(&self.active_jobs);
        let shutdown = Arc::clone(&self.shutdown);
        tokio::spawn(async move {
            let mut ticker = tokio::time::interval(Duration::from_millis(500));
            loop {
                ticker.tick().await;

                let remaining = active_jobs.load(std::sync::atomic::Ordering::SeqCst);

                if remaining == 0 {
                    // Grace period - wait 2 seconds to catch late jobs
                    tokio::time::sleep(Duration::from_secs(2)).await;

                    // Check again after grace period
                    let after_grace = active_jobs.load(std::sync::atomic::Ordering::SeqCst);

                    if after_grace == 0 {
                        // All jobs done, signal shutdown
                        shutdown.store(true, std::sync::atomic::Ordering::SeqCst);
                        break;
                    }
                }
            }
        });

        // Drop our reference to sender (monitoring task still has one)
        drop(tx);

        // Wait for all workers
        for handle in handles {
            let _ = handle.await;
        }

        // Finalize stats
        {
            let mut stats = self.stats.lock();
            stats.end_time = Some(Utc::now());
            stats.duration = Some(
                stats.end_time.unwrap()
                    .signed_duration_since(stats.start_time)
                    .num_milliseconds() as u64
            );
        }

        let results = self.results.lock().clone();
        let stats = self.stats.lock().clone();

        Ok(CrawlResults { stats, results })
    }

    async fn process_job(&self, job: CrawlJob, tx: &mpsc::Sender<CrawlJob>) -> Result<()> {
        // CRITICAL: Decrement active_jobs IMMEDIATELY (Go pattern line 392)
        self.active_jobs.fetch_sub(1, std::sync::atomic::Ordering::SeqCst);

        // Check if already visited
        if self.visited.contains_key(&job.url) {
            return Ok(());
        }

        // Mark as visited
        self.visited.insert(job.url.clone(), ());

        // Update stats
        {
            let mut stats = self.stats.lock();
            stats.pages_found += 1;
        }

        // Skip if domain restriction
        if let Some(ref allowed_domain) = self.config.allowed_domain {
            if let Ok(url) = Url::parse(&job.url) {
                if let Some(domain) = url.domain() {
                    if domain != allowed_domain && !domain.ends_with(&format!(".{}", allowed_domain)) {
                        let mut stats = self.stats.lock();
                        stats.external_links += 1;
                        return Ok(());
                    }
                }
            }
        }

        // Crawl page
        match self.crawl_page(&job.url, job.depth).await {
            Ok(result) => {
                // Queue discovered links if depth allows
                if job.depth < self.config.max_depth {
                    for link in &result.links {
                        // Skip if already visited
                        if self.visited.contains_key(link) {
                            continue;
                        }

                        // Check URL filter (exclude patterns)
                        if !self.url_filter.should_crawl(link) {
                            continue;
                        }

                        // Check robots.txt if enabled
                        if let Some(ref checker) = self.robots_checker {
                            if !checker.is_allowed(link).await {
                                continue;
                            }
                        }

                        // CRITICAL: Increment BEFORE sending (Go pattern lines 342, 352, 408)
                        self.active_jobs.fetch_add(1, std::sync::atomic::Ordering::SeqCst);

                        if tx.send(CrawlJob {
                            url: link.clone(),
                            depth: job.depth + 1,
                        }).await.is_err() {
                            // Channel closed, decrement back
                            self.active_jobs.fetch_sub(1, std::sync::atomic::Ordering::SeqCst);
                            break;
                        }
                    }
                }

                // Store result
                self.results.lock().push(result);

                // Update stats
                let mut stats = self.stats.lock();
                stats.pages_crawled += 1;
            }
            Err(e) => {
                eprintln!("Error crawling {}: {}", job.url, e);
                let mut stats = self.stats.lock();
                stats.errors += 1;
            }
        }

        Ok(())
    }

    async fn crawl_page(&self, url: &str, depth: usize) -> Result<PageResult> {
        // Wait for rate limiter before making request
        self.rate_limiter.wait().await;

        let response = self.client.get(url).send().await?;

        let status_code = response.status().as_u16();
        let content_type = response
            .headers()
            .get("content-type")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("unknown")
            .to_string();

        let html = response.text().await?;
        let title = self.parser.parse_title(&html);

        let base_url = url::Url::parse(url)?;
        let links = self.parser.parse_links(&html, &base_url)?;

        Ok(PageResult {
            url: url.to_string(),
            title,
            status_code,
            depth,
            links,
            error: None,
            crawled_at: Utc::now(),
            content_type,
        })
    }
}

impl Clone for CrawlEngine {
    fn clone(&self) -> Self {
        Self {
            config: self.config.clone(),
            client: self.client.clone(),
            parser: HtmlParser::new(),
            robots_checker: self.robots_checker.clone(),
            url_filter: self.url_filter.clone(),
            rate_limiter: self.rate_limiter.clone(),
            visited: Arc::clone(&self.visited),
            results: Arc::clone(&self.results),
            stats: Arc::clone(&self.stats),
            active_jobs: Arc::clone(&self.active_jobs),
            shutdown: Arc::clone(&self.shutdown),
        }
    }
}
