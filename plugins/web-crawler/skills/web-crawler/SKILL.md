---
name: web-crawler
description: High-performance Rust web crawler with stealth mode, LLM-ready Markdown export, multi-format output, sitemap discovery, and robots.txt support. Optimized for content extraction, site mapping, structure analysis, and LLM/RAG pipelines.
---

# Rust Web Crawler (rcrawler)

High-performance web crawler built in **pure Rust** with
production-grade features for fast, reliable site crawling.

## When to Use This Skill

Use this skill when the user requests:

- Web crawling or site mapping
- Sitemap discovery and analysis
- Link extraction and validation
- Site structure visualization
- robots.txt compliance checking
- Performance-critical web scraping
- Generating interactive web reports with graph visualization

## Core Capabilities

### 🚀 Performance

- **60+ pages/sec** throughput with async Tokio runtime
- **<50ms startup** time - Near-instant initialization
- **~50MB memory** usage - Efficient resource consumption
- **5.4 MB binary** - Single executable, no dependencies

### 🤖 Intelligence

- **Sitemap discovery**: Automatically finds and parses sitemap.xml (3 standard locations)
- **robots.txt compliance**: Respects crawling rules with per-domain caching
- **Smart filtering**: Auto-excludes images, CSS, JS, PDFs by default
- **Domain auto-detection**: Extracts and restricts to base domain automatically

### 🔒 Safety

- **Rate limiting**: Token bucket algorithm (default 2 req/s)
- **Configurable timeout**: 30 second default
- **Memory safe**: Rust's ownership system prevents crashes
- **Graceful shutdown**: 2-second grace period for pending requests

### 📊 Output

- **Multiple formats**: JSON, Markdown, HTML, CSV, Links, Text
- **LLM-ready Markdown**: Clean content with YAML frontmatter
- **Interactive HTML report**: Dashboard with graph visualization
- **Stealth mode**: User-agent rotation and realistic headers
- **Content filtering**: Remove nav, ads, scripts for clean data
- **Real-time progress**: Updates every 5 seconds during crawl

### 📝 Monitoring

- **Structured logging**: tracing with timestamps and log levels
- **Progress tracking**: `[Progress] Pages: X/Y | Active jobs: Z | Errors: N`
- **Detailed statistics**: Pages found, crawled, external links, errors, duration

## Installation & Setup

### Binary Location

```bash
~/.claude/skills/web-crawler/bin/rcrawler
```

### Build from Source

```bash
# Clone the repository
git clone https://github.com/leobrival/rcrawler.git
cd rcrawler

# Build release binary
cargo build --release

# Copy to skill directory
cp target/release/rcrawler ~/.claude/skills/web-crawler/bin/
```

Build time: ~2 minutes
Binary size: 5.4 MB

## Command Line Interface

### Basic Syntax

```bash
~/.claude/skills/web-crawler/bin/rcrawler <URL> [OPTIONS]
```

### Options

**Core Options**:

- `-w, --workers <N>`: Number of concurrent workers (default: 20, range: 1-50)
- `-d, --depth <N>`: Maximum crawl depth (default: 2)
- `-r, --rate <N>`: Rate limit in requests/second (default: 2.0)

**Configuration**:

- `-p, --profile <NAME>`: Use predefined profile (fast/deep/gentle)
- `--domain <DOMAIN>`: Restrict to specific domain (auto-detected from URL)
- `-o, --output <PATH>`: Custom output directory (default: ./output)

**Features**:

- `-s, --sitemap`: Enable/disable sitemap discovery (default: true)
- `--stealth`: Enable stealth mode with user-agent rotation
- `--markdown`: Convert HTML to LLM-ready Markdown with frontmatter
- `--filter-content`: Enable content filtering (remove nav, ads, scripts)
- `--debug`: Enable debug logging with detailed trace information
- `--resume`: Resume from checkpoint if available

**Output**:

- `-f, --formats <LIST>`: Output formats (json,markdown,html,csv,links,text)

## Profiles

### Fast Profile (Quick Mapping)

```bash
~/.claude/skills/web-crawler/bin/rcrawler <URL> -p fast
```

- Workers: 50
- Depth: 3
- Rate: 10 req/s
- **Use case**: Quick site structure overview

### Deep Profile (Comprehensive Crawl)

```bash
~/.claude/skills/web-crawler/bin/rcrawler <URL> -p deep
```

- Workers: 20
- Depth: 10
- Rate: 3 req/s
- **Use case**: Complete site analysis

### Gentle Profile (Server-Friendly)

```bash
~/.claude/skills/web-crawler/bin/rcrawler <URL> -p gentle
```

- Workers: 5
- Depth: 5
- Rate: 1 req/s
- **Use case**: Respecting server resources

## Usage Examples

### Example 1: Basic Crawl

```bash
~/.claude/skills/web-crawler/bin/rcrawler https://example.com
```

**Output**:

```console
[2026-01-10T01:17:27Z] INFO Starting crawl of: https://example.com
[2026-01-10T01:17:27Z] INFO Config: 20 workers, depth 2
Fetching sitemap URLs...
[Progress] Pages: 50/120 | Active jobs: 15 | Errors: 0
[Progress] Pages: 100/180 | Active jobs: 8 | Errors: 0

Crawl complete!
Pages crawled: 150
Duration: 8542ms
Results saved to: ./output/results.json
HTML report: ./output/index.html
```

### Example 2: Stealth Mode with Markdown Export

```bash
~/.claude/skills/web-crawler/bin/rcrawler https://docs.example.com \
  --stealth --markdown -f markdown -d 3
```

**Use case**: Content extraction for LLM/RAG pipelines
**Expected**: Clean Markdown with frontmatter, anti-detection headers

### Example 3: Fast Scan

```bash
~/.claude/skills/web-crawler/bin/rcrawler https://blog.example.com -p fast
```

**Use case**: Quick blog mapping
**Expected**: 50 workers, depth 3, ~3-5 seconds for 100 pages

### Example 4: Multi-Format Export

```bash
~/.claude/skills/web-crawler/bin/rcrawler https://example.com \
  -f json,markdown,csv,links -o ./export
```

**Use case**: Export data in multiple formats simultaneously
**Expected**: Generates results.json, results.md, results.csv, results.txt

### Example 5: Debug Mode

```bash
~/.claude/skills/web-crawler/bin/rcrawler https://example.com --debug
```

**Output**: Detailed trace logs for troubleshooting

## Output Format

### Directory Structure

```text
./output/
├── results.json       # Structured crawl data
├── results.md         # LLM-ready Markdown (with --markdown)
├── results.html       # Interactive report
├── results.csv        # Spreadsheet format (with -f csv)
├── results.txt        # URL list (with -f links)
└── checkpoint.json    # Auto-saved state (every 30s)
```

### JSON Structure (results.json)

```json
{
  "stats": {
    "pages_found": 450,
    "pages_crawled": 450,
    "external_links": 23,
    "excluded_links": 89,
    "errors": 0,
    "start_time": "2026-01-10T01:00:00Z",
    "end_time": "2026-01-10T01:00:07Z",
    "duration": 7512
  },
  "results": [
    {
      "url": "https://example.com",
      "title": "Example Domain",
      "status_code": 200,
      "depth": 0,
      "links": ["https://example.com/page1", "..."],
      "crawled_at": "2026-01-10T01:00:01Z",
      "content_type": "text/html"
    }
  ]
}
```

### HTML Report Features

- **Interactive dashboard** with key statistics
- **Graph visualization** using force-graph library
- **Node sizing** based on link count (logarithmic scale)
- **Status color coding**: Green (success), red (errors)
- **Hover tooltips**: In-degree and out-degree information
- **Click to navigate**: Opens page URL in new tab
- **Light/dark mode**: Auto-detection via CSS
- **Collapsible sections**: Reduces scroll for large crawls
- **Mobile responsive**: Works on all devices

## Implementation Workflow

When a user requests a crawl, follow these steps:

### 1. Parse Request

Extract from user message:

- **URL** (required): Target website
- **Workers** (optional): Number of concurrent workers
- **Depth** (optional): Maximum crawl depth
- **Rate** (optional): Requests per second
- **Profile** (optional): fast/deep/gentle

### 2. Validate Input

- Check URL format (add https:// if missing)
- Validate workers range (1-50)
- Validate depth (1-10 recommended)
- Validate rate (0.1-20.0 recommended)

### 3. Build Command

```bash
~/.claude/skills/web-crawler/bin/rcrawler <URL> \
  -w <workers> \
  -d <depth> \
  -r <rate> \
  [--debug] \
  [-o <output>]
```

### 4. Execute Crawl

Use Bash tool to run the command:

```bash
~/.claude/skills/web-crawler/bin/rcrawler https://example.com -w 20 -d 2
```

### 5. Monitor Progress

Watch for progress updates in output:

- `[Progress] Pages: X/Y | Active jobs: Z | Errors: N`
- Updates appear every 5 seconds
- Shows real-time crawl status

### 6. Report Results

When crawl completes, inform user:

- Number of pages crawled
- Duration in seconds or minutes
- Path to results: `./output/results.json`
- Path to HTML report: `./output/index.html`
- Offer to open HTML report: `open ./output/index.html`

## Natural Language Parsing

### Example User Requests

**Request**: "Crawl docs.example.com"
**Parse**: URL = <https://docs.example.com>, use defaults
**Command**: `rcrawler https://docs.example.com`

**Request**: "Quick scan of blog.example.com"
**Parse**: URL = blog.example.com, profile = fast
**Command**: `rcrawler https://blog.example.com -p fast`

**Request**: "Deep crawl of api-docs.example.com with 40 workers"
**Parse**: URL = api-docs.example.com, workers = 40, depth = deep
**Command**: `rcrawler https://api-docs.example.com -w 40 -d 5`

**Request**: "Crawl example.com carefully, don't overload their server"
**Parse**: URL = example.com, profile = gentle
**Command**: `rcrawler https://example.com -p gentle`

**Request**: "Map the structure of help.example.com"
**Parse**: URL = help.example.com, depth = moderate
**Command**: `rcrawler https://help.example.com -d 3`

## Error Handling

### Binary Not Found

```console
# Check if binary exists
ls ~/.claude/skills/web-crawler/bin/rcrawler

# If missing, build it
cd ~/.claude/skills/web-crawler/scripts && cargo build --release
```

### Crawl Failures

**Network errors**:

- Verify URL is accessible: `curl -I <URL>`
- Check if site is down or blocking crawlers
- Try with lower rate: `-r 1`

**robots.txt blocking**:

- Crawler respects robots.txt by default
- Check rules: `curl <URL>/robots.txt`
- Inform user of restrictions

**Timeout errors**:

- Increase timeout in code (default 30s)
- Reduce workers: `-w 10`
- Lower rate limit: `-r 1`

**Too many errors**:

- Enable debug mode: `--debug`
- Check specific failing URLs
- May need to exclude certain patterns

## Performance Benchmarks

### Test: adonisjs.com

- **Pages**: 450
- **Duration**: 7.5 seconds
- **Throughput**: 60 pages/sec
- **Workers**: 20
- **Depth**: 2

### Test: rust-lang.org

- **Pages**: 16
- **Duration**: 3.9 seconds
- **Workers**: 10
- **Depth**: 1

### Test: example.com

- **Pages**: 2
- **Duration**: 2.7 seconds
- **Workers**: 5
- **Depth**: 1

## Technical Architecture

### Core Components

1. **CrawlEngine** (src/crawler/engine.rs)
   - Worker pool management
   - Job queue coordination
   - Shutdown signaling
   - Statistics tracking

2. **RobotsChecker** (src/crawler/robots.rs)
   - Per-domain caching
   - Rule validation
   - Fallback on errors

3. **RateLimiter** (src/crawler/rate_limiter.rs)
   - Token bucket algorithm
   - Configurable rate
   - Shared across workers

4. **UrlFilter** (src/utils/filters.rs)
   - Regex-based filtering
   - Include/exclude patterns
   - Default exclusions

5. **HtmlParser** (src/parser/html.rs)
   - CSS selector queries
   - Title extraction
   - Link discovery

6. **SitemapParser** (src/parser/sitemap.rs)
   - XML parsing
   - Index traversal
   - URL extraction

### Key Dependencies

- **tokio**: Async runtime (multi-threaded)
- **reqwest**: HTTP client (connection pooling)
- **scraper**: HTML parsing (CSS selectors)
- **quick-xml**: Sitemap parsing
- **governor**: Rate limiting (token bucket)
- **tracing**: Structured logging
- **dashmap**: Concurrent HashMap
- **robotstxt**: robots.txt compliance
- **clap**: CLI argument parsing
- **serde/serde_json**: Serialization

## Tips & Best Practices

### 1. Start with Default Settings

First crawl should use defaults to understand site structure.

### 2. Use Profiles for Common Scenarios

- **fast**: Quick overviews
- **deep**: Comprehensive analysis
- **gentle**: Respectful crawling

### 3. Monitor Progress

Watch the `[Progress]` lines to ensure crawl is progressing.

### 4. Check HTML Report

Interactive visualization helps understand site structure better than JSON.

### 5. Respect Rate Limits

Default 2 req/s is safe for most sites. Increase cautiously.

### 6. Enable Debug for Issues

`--debug` flag provides detailed logs for troubleshooting.

### 7. Review robots.txt

Check `<URL>/robots.txt` to understand crawling restrictions.

### 8. Use Custom Output for Multiple Crawls

Avoid overwriting results with `-o` flag.

## Future Enhancements (V2.0)

- **Checkpoint resume**: Full integration of checkpoint system
- **Per-domain rate limiting**: Different rates for different domains
- **JavaScript rendering**: chromiumoxide for dynamic sites
- **Distributed crawling**: Redis-based job queue
- **Advanced analytics**: SEO analysis, link quality scoring

## Support & Resources

- **GitHub Repository**: [leobrival/rcrawler](https://github.com/leobrival/rcrawler)
- **Binary**: `~/.claude/skills/web-crawler/bin/rcrawler`
- **Skill Documentation**: This file (SKILL.md)
- **Quick Start**: README.md (this repository)
- **Development Guide**: [DEVELOPMENT.md](https://github.com/leobrival/rcrawler/blob/main/DEVELOPMENT.md)

---

**Version**: 1.0.0
**Status**: Production Ready
