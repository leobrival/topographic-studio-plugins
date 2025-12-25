# Web Crawler

High-performance web crawler with TypeScript/Bun frontend and Go backend. Modular, efficient, and compatible with Raycast.

## Features

### Core Features

- Zero Installation: Uses Bun (no npm install) and auto-compiles Go on first run
- High Performance: Go-powered concurrent crawling with configurable workers and rate limiting
- Modular Design: Clean separation between orchestration (TypeScript) and crawling (Go)
- Raycast Compatible: Native integration with Raycast launcher
- Configurable Profiles: Predefined profiles (fast, deep, gentle)
- Smart Filtering: Automatic exclusion of non-HTML resources
- Real-time Progress: Live statistics during crawling
- Multiple Output Formats: JSON and HTML reports

### Advanced Features

- Sitemap Discovery: Automatic XML sitemap parsing (sitemap.xml, sitemap_index.xml, wp-sitemap.xml)
- Checkpoint/Resume: Auto-saves progress every 30 seconds, resume after interruption
- Large Buffer Support: 10,000 jobs buffer prevents deadlocks on massive crawls
- Modern HTML Interface: Interactive web report with light/dark mode auto-detection
- Collapsible Links: Dropdown system to reduce scroll
- Performance Optimized: Handles 400+ pages and 70,000+ links efficiently

## Architecture

```
crawler/
├── src/                    # TypeScript/Bun frontend
│   ├── index.ts           # Main entry point
│   ├── cli.ts             # CLI interface
│   ├── raycast.ts         # Raycast integration
│   └── lib/
│       ├── types.ts       # Type definitions
│       ├── config.ts      # Configuration management
│       ├── logger.ts      # Structured logging
│       ├── formatters.ts  # Output formatting
│       └── go-bridge.ts   # Go process management
├── engine/                 # Go backend
│   ├── main.go            # Crawler engine
│   └── go.mod             # Go dependencies
├── config/                 # Configuration files
│   ├── default.json       # Default settings
│   └── profiles/          # Crawling profiles
└── scripts/                # Utility scripts
    ├── raycast.sh         # Raycast wrapper
    └── install.sh         # Installation script
```

## Installation

Run the installation script to set up dependencies and create aliases:

```bash
~/.claude/scripts/crawler/scripts/install.sh
```

This will:

- Check for Bun and Go installations
- Download Go dependencies
- Provide alias suggestions for your shell

### Manual Setup

Add this alias to your `~/.zshrc` or `~/.bashrc`:

```bash
alias crawler='bun ~/.claude/scripts/crawler/src/index.ts'
```

Then reload your shell:

```bash
source ~/.zshrc  # or source ~/.bashrc
```

## Usage

### Claude Code Command (Recommended)

The easiest way to use the crawler is through the Claude Code command:

```bash
# In any Claude Code session
/crawler https://example.com

# Natural language requests
"Crawl docs.example.com with 30 workers"
"Quick scan of blog.example.com"
"Deep crawl of api-site.com"
"Resume my previous crawl"
```

The command provides:

- Natural language parsing
- Real-time monitoring dashboard
- Automatic checkpoint detection
- Live progress tracking
- Intelligent error handling
- Post-crawl analysis
- Cleanup management

Workflow:

1. Parse crawl request (URL, depth, workers, etc.)
2. Check for existing checkpoints
3. Execute crawler in background
4. Display live monitoring dashboard
5. Handle interruptions gracefully
6. Generate comprehensive reports
7. Open HTML results automatically
8. Provide intelligent post-crawl analysis

### Basic Usage

```bash
# Crawl a website with default settings (depth 2, sitemap enabled)
crawler https://example.com

# Crawl with custom workers and depth
crawler https://example.com --workers 50 --depth 10

# Use a predefined profile
crawler https://example.com --profile fast

# Crawl with sitemap discovery (default)
crawler https://example.com --sitemap

# Restrict to specific domain
crawler https://blog.example.com --domain example.com

# Quick shallow crawl
crawler https://example.com --depth 1 --workers 10 --rate 5

# Deep comprehensive crawl
crawler https://example.com --depth 5 --workers 30 --rate 10
```

### Advanced Usage Examples

```bash
# Large site with checkpoint recovery
crawler https://large-site.com --depth 3 --workers 20
# Interrupt with Ctrl+C, then resume with same command

# Gentle crawling for rate-limited sites
crawler https://api-limited-site.com --profile gentle

# Fast mapping with sitemap
crawler https://docs-site.com --sitemap --depth 2 --rate 10

# Debug mode for troubleshooting
crawler https://example.com --debug

# Custom output directory
crawler https://example.com --output ~/Documents/crawl-results
```

### CLI Options

```
ARGUMENTS:
  <URL>                     The URL to start crawling from

OPTIONS:
  -d, --domain <DOMAIN>     Restrict crawling to this domain
  -w, --workers <NUM>       Number of concurrent workers (default: 20)
  -D, --depth <NUM>         Maximum crawl depth (default: 2)
  -r, --rate <NUM>          Rate limit in requests/second (default: 2)
  -p, --profile <NAME>      Use predefined profile (fast, deep, gentle)
  -o, --output <DIR>        Output directory (default: ~/Desktop/crawler_results_<domain>)
  -s, --sitemap             Use sitemap.xml for URL discovery (enabled by default)
  --debug                   Enable debug logging
  -h, --help                Show help message
  -v, --version             Show version information
```

**Default Behavior:**

- Crawls to depth 2 (2 levels from start URL)
- Uses 20 concurrent workers
- Rate limited to 2 requests/second
- Sitemap discovery enabled automatically
- Generates both JSON and HTML reports
- Saves checkpoints every 30 seconds

### Profiles

Fast: Quick site mapping with high concurrency

- Workers: 50, Depth: 3, Rate: 10 req/s

Deep: Comprehensive site analysis with moderate speed

- Workers: 20, Depth: 10, Rate: 3 req/s

Gentle: Respectful crawling with low server impact

- Workers: 5, Depth: 5, Rate: 1 req/s

### Raycast Integration

1. Copy or symlink the Raycast script:

   ```bash
   ln -s ~/.claude/scripts/crawler/scripts/raycast.sh ~/raycast-scripts/crawler.sh
   ```

2. In Raycast, the script accepts these arguments:
   - **Argument 1** (required): Site URL
   - **Argument 2** (optional): Allowed domain
   - **Argument 3** (optional): Number of workers
   - **Argument 4** (optional): Rate limit
   - **Argument 5** (optional): Profile name

3. Raycast will display a compact summary and automatically open the results folder

## Output

Results are saved to `~/Desktop/crawler_results_<domain>/` by default:

- **index.html**: Beautiful interactive HTML report with light/dark mode
- **results.json**: Complete crawl results with all pages and statistics

### HTML Report Features

The generated HTML report includes:

- Automatic theme detection: Light/dark mode based on system preference
- Statistics dashboard: Pages crawled, links found, errors, duration
- Organized by depth: Results grouped by crawl depth levels
- Collapsible link sections: Dropdown UI to reduce scrolling (max 100 links shown per page)
- Responsive design: Mobile-friendly interface
- Modern aesthetics: Vercel/Next.js inspired design with Inter font

### JSON Structure

```json
{
  "stats": {
    "pages_found": 1978,
    "pages_crawled": 444,
    "external_links": 234,
    "excluded_links": 1876,
    "errors": 8,
    "duration": 145.3,
    "start_time": "2025-01-10T10:30:00Z"
  },
  "results": [
    {
      "url": "https://example.com/page",
      "title": "Page Title",
      "status_code": 200,
      "depth": 1,
      "links": ["https://example.com/other"],
      "crawled_at": "2025-01-10T10:30:15Z",
      "content_type": "text/html"
    }
  ]
}
```

### Checkpoint Files

During crawling, checkpoint files are automatically saved to `/tmp/` every 30 seconds:

- **Location**: `/tmp/crawler_<domain>_checkpoint.json`
- **Purpose**: Resume crawling after interruption or crash
- **Size**: Varies based on crawl progress (typically 50-200KB)
- **Auto-cleanup**: Can be manually deleted after successful crawl

## Configuration

### Default Configuration

Edit `config/default.json` to change default settings:

```json
{
  "maxDepth": 2,
  "maxWorkers": 20,
  "rateLimit": 2,
  "timeout": 30,
  "useSitemap": true,
  "maxSitemapURLs": 1000,
  "respectRobotsTxt": true,
  "excludePatterns": [
    "\\.jpg$",
    "\\.jpeg$",
    "\\.png$",
    "\\.gif$",
    "\\.svg$",
    "\\.pdf$",
    "\\.zip$",
    "\\.css$",
    "\\.js$",
    "^mailto:",
    "^tel:",
    "^javascript:"
  ],
  "includePatterns": []
}
```

Key Settings:

- maxDepth: Default crawl depth is 2 levels
- useSitemap: Enabled by default for faster discovery
- excludePatterns: Filters out images, media, and non-HTML resources

### Custom Profiles

Create a new profile in `config/profiles/`:

```json
{
  "name": "custom",
  "description": "Custom crawling strategy",
  "maxDepth": 7,
  "maxWorkers": 30,
  "rateLimit": 5,
  "timeout": 30
}
```

## How It Works

1. **TypeScript Frontend** (Bun runtime):
   - Parses CLI arguments or Raycast inputs
   - Loads configuration from JSON files
   - Manages Go process lifecycle
   - Formats and displays results

2. **Go Backend** (compiled on-demand):
   - High-performance concurrent crawling
   - URL normalization and deduplication
   - HTML parsing and link extraction
   - Rate limiting and resource management
   - Results serialization to JSON

3. **Communication**:
   - TypeScript spawns Go process with command-line arguments
   - Go streams progress to stdout
   - Go writes final results to JSON file
   - TypeScript reads results and formats output

## Performance

- **Concurrent Workers**: Up to 50 parallel workers (configurable)
- **Rate Limiting**: Smart rate limiting per second
- **Resource Exclusion**: Automatic filtering of non-HTML resources
- **Memory Efficient**: Streaming processing, minimal memory footprint
- **Fast Compilation**: Go binary compiled once, reused afterward
- **Sitemap Optimization**: Instant discovery of thousands of URLs
- **Job Queue Buffer**: 10,000 jobs buffer prevents deadlocks on large crawls
- **Checkpoint System**: Minimal overhead (~30ms every 30 seconds)

### Real-World Performance

Test Case: Claude Code product page

- URL: https://www.claude.com/product/claude-code
- Configuration: Depth 2, 10 workers, 5 req/s, sitemap enabled
- Results:
  - Pages crawled: 444
  - Total links found: 79,000+
  - Duration: ~145 seconds
  - Sitemap URLs discovered: 181
  - Output size: 15MB JSON + HTML report

## Requirements

- Bun: JavaScript/TypeScript runtime
- Go: 1.21 or later (for compilation)

Install dependencies:

```bash
# macOS
brew install go

# Bun (if not installed)
curl -fsSL https://bun.sh/install | bash
```

## Advanced Features

### Checkpoint/Resume System

The crawler automatically saves progress every 30 seconds, allowing you to resume after interruption:

How it works:

1. Checkpoint files are saved to `/tmp/crawler_<domain>_checkpoint.json`
2. Contains visited URLs, crawl results, and statistics
3. Automatically detected and loaded on restart
4. No manual intervention required

Manual checkpoint management:

```bash
# View checkpoint file
cat /tmp/crawler_example_com_checkpoint.json

# Delete checkpoint to start fresh
rm /tmp/crawler_example_com_checkpoint.json

# Resume from checkpoint (automatic)
crawler https://example.com
```

Checkpoint structure:

```json
{
  "base_url": "https://example.com",
  "allowed_domain": "example.com",
  "visited_urls": ["https://example.com", "https://example.com/about"],
  "results": [...],
  "stats": {...},
  "timestamp": "2025-01-10T10:30:00Z"
}
```

### Sitemap Discovery

The crawler intelligently discovers and parses XML sitemaps:

Supported formats:

- sitemap.xml - Standard sitemap
- sitemap_index.xml - Sitemap index with multiple sitemaps
- sitemap-index.xml - Alternative naming convention
- wp-sitemap.xml - WordPress sitemap

How it works:

1. Attempts to fetch sitemap URLs in order of priority
2. Parses XML and extracts `<loc>` tags
3. Recursively processes sitemap indexes
4. Falls back to regular crawling if no sitemap found
5. Respects maxSitemapURLs configuration limit

Example output:

```
Sitemap found: https://example.com/sitemap.xml
Discovered 1,234 URLs from sitemap
Starting crawl with sitemap URLs...
```

## Troubleshooting

### Go compilation fails

Ensure Go is properly installed:

```bash
go version
```

If issues persist, manually compile the Go engine:

```bash
cd ~/.claude/scripts/crawler/engine
go mod download
go build -o crawler main.go
```

### Permission denied

Make scripts executable:

```bash
chmod +x ~/.claude/scripts/crawler/src/index.ts
chmod +x ~/.claude/scripts/crawler/scripts/*.sh
```

### Bun not found

Install Bun:

```bash
curl -fsSL https://bun.sh/install | bash
```

Then add to your PATH (usually automatic).

## Inspiration

This crawler architecture is inspired by:

- `~/.claude/scripts/statusline` - Modular structure
- `~/Developer/raycast/scripts/crawling.py` - Hybrid Python+Go approach
- AdonisJS logger - Structured logging patterns

## License

Part of the Claude Code configuration system.
