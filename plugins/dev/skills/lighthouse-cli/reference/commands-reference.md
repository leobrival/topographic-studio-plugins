# Lighthouse CLI Commands Reference

Complete reference for all Lighthouse CLI commands with detailed options and flags.

## Installation & Setup

### Installation

```bash
# Install via npm
npm install -g lighthouse

# Install via pnpm
pnpm i -g lighthouse

# Install via bun
bun add -g lighthouse

# Check version
lighthouse --version

# Show help
lighthouse --help
```

## Basic Auditing

### `lighthouse <url>`

Perform a complete audit on a URL.

```bash
# Audit a URL (default: generates HTML report)
lighthouse https://example.com

# Audit with custom output filename
lighthouse https://example.com --output-path=./report.html

# Audit localhost
lighthouse http://localhost:3000

# Audit with specific format (html, json, csv)
lighthouse https://example.com --output=json

# Audit with multiple output formats
lighthouse https://example.com --output=html --output=json

# Audit with all output formats
lighthouse https://example.com --output=html --output=json --output=csv
```

## Output & Reports

### Output Formats

```bash
# Generate HTML report (default)
lighthouse https://example.com --output=html

# Generate JSON report
lighthouse https://example.com --output=json

# Generate CSV report
lighthouse https://example.com --output=csv

# Generate multiple formats at once
lighthouse https://example.com --output=html --output=json --output=csv

# Output to stdout
lighthouse https://example.com --output=json > report.json

# Specify custom output directory
lighthouse https://example.com --output-path=/path/to/reports/

# Save report with custom name
lighthouse https://example.com --output-path=./my-audit.html

# Save report to specific file
lighthouse https://example.com --output=json --output-path=report.json
```

## Audit Categories

### Run Specific Categories

```bash
# Run all categories (default)
lighthouse https://example.com

# Audit performance only
lighthouse https://example.com --only-categories=performance

# Audit accessibility only
lighthouse https://example.com --only-categories=accessibility

# Audit SEO only
lighthouse https://example.com --only-categories=seo

# Audit best practices only
lighthouse https://example.com --only-categories=best-practices

# Audit PWA only
lighthouse https://example.com --only-categories=pwa

# Run multiple specific categories
lighthouse https://example.com --only-categories=performance,accessibility,seo
```

### Skip Categories

```bash
# Skip specific categories
lighthouse https://example.com --skip-categories=pwa

# Skip multiple categories
lighthouse https://example.com --skip-categories=pwa,best-practices
```

## Device & Environment

### Device Presets

```bash
# Desktop preset (optimized for desktop)
lighthouse https://example.com --preset=desktop

# Mobile preset (optimized for mobile)
lighthouse https://example.com --preset=mobile

# Explicitly set form factor
lighthouse https://example.com --emulated-form-factor=mobile
lighthouse https://example.com --emulated-form-factor=desktop
```

### Viewport & Display

```bash
# Desktop viewport (default)
lighthouse https://example.com --emulated-form-factor=desktop

# Mobile viewport
lighthouse https://example.com --emulated-form-factor=mobile

# Custom viewport width and height
lighthouse https://example.com --viewport-width=414 --viewport-height=896
```

## Performance Throttling

### Network & CPU Throttling

```bash
# Disable network throttling (real device speed)
lighthouse https://example.com --throttling-method=provided

# Simulate network throttling (default)
lighthouse https://example.com --throttling-method=simulate

# Use DevTools throttling
lighthouse https://example.com --throttling-method=devtools
```

## Authentication & Headers

### Add Headers & Cookies

```bash
# Add authentication header
lighthouse https://example.com --extra-headers='{"Authorization":"Bearer token123"}'

# Add API key header
lighthouse https://example.com --extra-headers='{"X-API-Key":"your-api-key"}'

# Set cookies
lighthouse https://example.com --extra-headers='{"Cookie":"session=abc123"}'

# Multiple headers
lighthouse https://example.com --extra-headers='{"Authorization":"Bearer token","X-Custom":"value"}'
```

## Chrome Configuration

### Browser Control

```bash
# Use custom Chrome executable
lighthouse https://example.com --chrome-path=/path/to/chrome

# Run in headless mode (faster)
lighthouse https://example.com --chrome-flags="--headless"

# Run with visible browser
lighthouse https://example.com --chrome-flags="--no-headless"

# Run without sandbox (useful in containers)
lighthouse https://example.com --chrome-flags="--no-sandbox"

# Combine multiple flags
lighthouse https://example.com --chrome-flags="--headless --no-sandbox"
```

## Timing & Performance

### Timeouts & Delays

```bash
# Maximum wait time for page load (milliseconds)
lighthouse https://example.com --max-wait-for-load=45000

# Custom audit timeout (milliseconds)
lighthouse https://example.com --timeout=60000

# Set longer timeout for slow sites
lighthouse https://example.com --timeout=120000
```

## Output Control

### Logging & Verbosity

```bash
# Enable verbose logging
lighthouse https://example.com --verbose

# Suppress unnecessary output
lighthouse https://example.com --quiet

# Save report assets locally
lighthouse https://example.com --save-assets
```

## Batch & Scripting

### Multiple URLs

```bash
# Audit multiple URLs in sequence
for url in https://example.com https://example.org; do
  lighthouse $url --output=json --output-path=./reports/
done

# Audit URLs from file
while read url; do
  lighthouse $url --output=json --output-path=./reports/
done < urls.txt
```

## Report Analysis

### Extract Scores

```bash
# View all category scores
lighthouse https://example.com --output=json | jq '.categories'

# Extract performance score
lighthouse https://example.com --output=json | jq '.categories.performance.score'

# Extract all scores as list
lighthouse https://example.com --output=json | jq '.categories | map({name: .id, score: .score})'

# Get audit-level details
lighthouse https://example.com --output=json | jq '.audits'
```

## Environment Variables

### Configuration via Environment

```bash
# Set Chrome executable path
export CHROME_PATH=/path/to/chrome
lighthouse https://example.com

# Set custom user data directory
export CHROME_USER_DATA_DIR=/tmp/chrome-data
lighthouse https://example.com
```

## Global Options

All Lighthouse commands support these global flags:

- `--version` — Show version
- `--help` — Show help
- `--verbose` — Enable verbose logging
- `--quiet` — Suppress output
- `--output` — Output format (html, json, csv)
- `--output-path` — Output file path or directory
- `--save-assets` — Save assets locally
- `--emulated-form-factor` — Device type (mobile, desktop)
- `--preset` — Configuration preset (mobile, desktop)
- `--only-categories` — Specific categories to audit
- `--skip-categories` — Categories to skip
- `--timeout` — Maximum audit duration (milliseconds)
- `--max-wait-for-load` — Maximum page load wait time
- `--chrome-path` — Custom Chrome executable path
- `--chrome-flags` — Custom Chrome launch flags
- `--extra-headers` — Additional HTTP headers (JSON)
- `--throttling-method` — Method (simulate, devtools, provided)
- `--viewport-width` — Custom viewport width
- `--viewport-height` — Custom viewport height
