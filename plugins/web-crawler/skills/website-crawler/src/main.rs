use clap::Parser;
use rcrawler::{
    config,
    crawler::engine::CrawlEngine,
    integrations::raycast,
    services::{
        content_filter::{ContentFilterConfig, DefaultContentFilterService},
        markdown::{DefaultMarkdownService, MarkdownConfig},
        output_formatter::{DefaultOutputFormatterService, OutputFormat, OutputFormatterConfig},
        stealth::{DefaultStealthService, StealthConfig},
        ServiceContainer,
    },
    utils::logger,
};
use std::path::PathBuf;
use std::sync::Arc;
use tracing::info;

#[derive(Parser, Debug)]
#[command(name = "rcrawler")]
#[command(about = "High-performance web crawler in Rust", long_about = None)]
struct Cli {
    /// URL to crawl
    url: String,

    /// Restrict to this domain
    #[arg(long)]
    domain: Option<String>,

    /// Number of concurrent workers
    #[arg(short, long)]
    workers: Option<usize>,

    /// Maximum crawl depth
    #[arg(short = 'd', long)]
    depth: Option<usize>,

    /// Rate limit (requests per second)
    #[arg(short, long)]
    rate: Option<f64>,

    /// Profile (fast, deep, gentle)
    #[arg(short, long)]
    profile: Option<String>,

    /// Output directory
    #[arg(short, long)]
    output: Option<PathBuf>,

    /// Use sitemap.xml
    #[arg(short, long)]
    sitemap: Option<bool>,

    /// Output formats (comma-separated: json,markdown,html,links,csv,text)
    #[arg(short, long, default_value = "json,html", value_delimiter = ',')]
    formats: Vec<String>,

    /// Enable stealth mode (user-agent rotation, realistic headers)
    #[arg(long)]
    stealth: bool,

    /// Enable content filtering (remove nav, ads, scripts)
    #[arg(long)]
    filter_content: bool,

    /// Convert HTML to Markdown (LLM-ready)
    #[arg(long)]
    markdown: bool,

    /// Enable debug logging
    #[arg(long)]
    debug: bool,

    /// Resume from checkpoint if available
    #[arg(long)]
    resume: bool,

    /// Enable map-only mode (extract links without full crawl)
    #[arg(long)]
    map_only: bool,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    // Initialize logger
    logger::init_logger(cli.debug);

    // Build configuration
    let config = config::build_config(
        cli.url.clone(),
        cli.domain.clone(),
        cli.workers,
        cli.depth,
        cli.rate,
        cli.profile.as_deref(),
        cli.output.clone(),
        cli.sitemap,
    );

    info!("Starting crawl of: {}", config.base_url);
    info!(
        "Config: {} workers, depth {}",
        config.max_workers, config.max_depth
    );

    // Build service container
    let services = build_services(&cli);

    if cli.stealth {
        info!("Stealth mode enabled");
    }
    if cli.filter_content {
        info!("Content filtering enabled");
    }
    if cli.markdown {
        info!("Markdown conversion enabled");
    }

    // Create engine and crawl
    let engine = CrawlEngine::new(config.clone())?;
    let results = engine.crawl().await?;

    // Process results with services
    let processed_results = process_results(&results, &services, &cli).await?;

    // Parse output formats
    let output_formats: Vec<OutputFormat> = cli
        .formats
        .iter()
        .filter_map(|f| OutputFormat::from_str(f).ok())
        .collect();

    // Format output
    let formatter_config = OutputFormatterConfig {
        formats: output_formats.clone(),
        pretty_json: true,
        include_errors: true,
        max_links: None,
    };

    let outputs = services
        .output_formatter
        .format_with_config(&processed_results, &formatter_config)
        .map_err(|e| anyhow::anyhow!(e))?;

    // Write output files
    for output in &outputs {
        let file_path = config.output_dir.join(output.full_filename());
        std::fs::write(&file_path, &output.content)?;
        info!("Wrote {} output to: {}", output.format.extension(), file_path.display());
    }

    // Check if running in Raycast environment
    if raycast::is_raycast_env() {
        // Compact output for Raycast
        let raycast_output = raycast::format_for_raycast(&processed_results);
        println!("{}", raycast_output);
    } else {
        // Standard output
        println!("\nCrawl complete!");
        println!("Pages crawled: {}", processed_results.stats.pages_crawled);
        if let Some(duration) = processed_results.stats.duration {
            println!("Duration: {}ms", duration);
        }

        println!("\nGenerated outputs:");
        for output in &outputs {
            let file_path = config.output_dir.join(output.full_filename());
            println!("  - {}: {}", output.format.extension(), file_path.display());
        }
    }

    Ok(())
}

/// Build service container based on CLI options
fn build_services(cli: &Cli) -> ServiceContainer {
    let mut builder = ServiceContainer::builder();

    // Stealth service
    if cli.stealth {
        let stealth_config = StealthConfig {
            rotate_user_agent: true,
            random_delays: false,
            randomize_tls: false,
            custom_user_agents: vec![],
        };
        builder = builder.with_stealth(Arc::new(DefaultStealthService::with_config(
            stealth_config,
        )));
    } else {
        builder = builder.with_stealth(Arc::new(DefaultStealthService::new()));
    }

    // Markdown service
    let markdown_config = MarkdownConfig {
        include_frontmatter: cli.markdown,
        include_source_url: true,
        preserve_code_blocks: true,
        max_line_length: 0,
    };
    builder =
        builder.with_markdown(Arc::new(DefaultMarkdownService::with_config(markdown_config)));

    // Content filter service
    if cli.filter_content {
        let filter_config = ContentFilterConfig::default();
        builder = builder.with_content_filter(Arc::new(
            DefaultContentFilterService::with_config(filter_config),
        ));
    } else {
        // Minimal filtering (only scripts/styles)
        let filter_config = ContentFilterConfig {
            remove_nav: false,
            remove_footer: false,
            remove_sidebar: false,
            remove_ads: false,
            remove_scripts_styles: true,
            remove_comments: false,
            blacklist_ids: vec![],
            blacklist_classes: vec![],
            blacklist_tags: vec!["script".to_string(), "style".to_string()],
            whitelist_tags: vec![],
        };
        builder = builder.with_content_filter(Arc::new(
            DefaultContentFilterService::with_config(filter_config),
        ));
    }

    // Output formatter service
    builder = builder.with_output_formatter(Arc::new(DefaultOutputFormatterService::new()));

    builder.build()
}

/// Process results with services (filtering, markdown conversion, etc.)
async fn process_results(
    results: &rcrawler::CrawlResults,
    _services: &ServiceContainer,
    _cli: &Cli,
) -> anyhow::Result<rcrawler::CrawlResults> {
    let processed = results.clone();

    // Note: In a real implementation, we would process each page's HTML
    // For now, we just return the results as-is
    // This would be integrated into the crawling engine itself

    Ok(processed)
}
