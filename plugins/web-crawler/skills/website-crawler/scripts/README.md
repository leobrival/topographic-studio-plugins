# rcrawler

High-performance web crawler built in Rust.

## Features

- Fast async crawling (60+ pages/sec)
- Multiple output formats (JSON, Markdown, HTML, CSV, Links, Text)
- Stealth mode with user-agent rotation
- LLM-ready Markdown with frontmatter
- Automatic sitemap discovery and robots.txt compliance
- Built-in rate limiting and progress monitoring

## Installation

```bash
cargo build --release
cp target/release/rcrawler ~/bin/
```

## Usage

```bash
# Basic crawl
rcrawler https://example.com

# With profiles
rcrawler https://example.com -p fast

# Stealth mode + Markdown export
rcrawler https://docs.example.com --stealth --markdown -f markdown -d 3

# Multi-format export
rcrawler https://example.com -f json,markdown,csv -o ./export
```

## Options

- `-d, --depth <NUM>`: Maximum crawl depth (default: 2)
- `-w, --workers <NUM>`: Concurrent workers (default: 20)
- `-r, --rate <NUM>`: Rate limit requests/sec (default: 2.0)
- `-p, --profile <NAME>`: fast (50 workers), deep (10 depth), gentle (1/s)
- `-o, --output <DIR>`: Output directory (default: ./output)
- `-f, --formats <LIST>`: Output formats (default: json,html)
- `--stealth`: User-agent rotation and realistic headers
- `--markdown`: Convert to LLM-ready Markdown
- `--filter-content`: Remove nav, ads, scripts
- `--sitemap`: Enable sitemap.xml discovery (default: true)
- `--debug`: Enable debug logging

## Output Formats

- `results.json` - Structured data with stats
- `results.md` - Clean Markdown with frontmatter
- `results.html` - Interactive report with graph
- `results.txt` - URL list
- `results.csv` - Spreadsheet format

## Performance

- Throughput: 60+ pages/sec
- Memory: ~50MB
- Binary: 5.7 MB
- Startup: <50ms

## Development

```bash
cargo test          # Run tests
cargo clippy        # Lint
cargo fmt           # Format
cargo build --release
```

## License

MIT
