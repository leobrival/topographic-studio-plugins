---
title: Lighthouse CLI
description: Lighthouse CLI commands for automated web performance auditing
allowed-tools: [Bash(lighthouse *)]
---

Comprehensive cheat-sheet for `lighthouse` commands to audit web pages for performance, accessibility, SEO, and best practices.

## Installation & Configuration

```bash
# Install via npm
npm install -g lighthouse

# Install via pnpm
pnpm i -g lighthouse

# Check Lighthouse version
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

# Audit with specific format (html, json, csv)
lighthouse https://example.com --output=json

# Audit with multiple output formats
lighthouse https://example.com --output=html --output=json

# Audit localhost
lighthouse http://localhost:3000
```

## Output & Report Management

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

# Specify custom output directory
lighthouse https://example.com --output-path=/path/to/reports/

# Output to stdout
lighthouse https://example.com --output=json > report.json
```

### Report Options

```bash
# Save report with custom name
lighthouse https://example.com --output-path=./my-audit.html

# Save report to current directory (default behavior)
lighthouse https://example.com --save-assets

# Don't save HTML report locally
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

## Performance Throttling & Environment

### Network & CPU Throttling

```bash
# Simulate slow 4G network
lighthouse https://example.com --throttling-method=simulate --throttle-method=simulate

# Simulate offline
lighthouse https://example.com --throttling-method=devtools

# No throttling
lighthouse https://example.com --throttling-method=provided

# Custom CPU throttling (rate multiplier)
lighthouse https://example.com --emulated-form-factor=desktop

# Mobile emulation
lighthouse https://example.com --emulated-form-factor=mobile

# Desktop emulation
lighthouse https://example.com --emulated-form-factor=desktop
```

### View Port & Device Configuration

```bash
# Desktop viewport (default)
lighthouse https://example.com --emulated-form-factor=desktop

# Mobile viewport
lighthouse https://example.com --emulated-form-factor=mobile

# Custom viewport width
lighthouse https://example.com --viewport-width=414 --viewport-height=896
```

## Authentication & Cookies

```bash
# Add extra HTTP headers (auth token)
lighthouse https://example.com --extra-headers='{"Authorization":"Bearer token123"}'

# Set cookies
lighthouse https://example.com --extra-headers='{"Cookie":"session=abc123"}'

# Audit with authentication
lighthouse https://example.com --extra-headers='{"X-API-Key":"your-api-key"}'
```

## Advanced Options

### Preset Configurations

```bash
# Desktop preset (optimized for desktop)
lighthouse https://example.com --preset=desktop

# Mobile preset (optimized for mobile)
lighthouse https://example.com --preset=mobile

# Desktop mobile preset
lighthouse https://example.com --emulated-form-factor=mobile

# View all presets
lighthouse --help | grep preset
```

### Audit Settings

```bash
# Disable network throttling
lighthouse https://example.com --throttling-method=provided

# Disable CPU throttling
lighthouse https://example.com --throttling-method=provided

# Run in headless mode (faster)
lighthouse https://example.com --chrome-flags="--headless"

# Run with visible browser
lighthouse https://example.com --chrome-flags="--no-headless"

# Maximum wait time for page load
lighthouse https://example.com --max-wait-for-load=45000

# Custom timeout (milliseconds)
lighthouse https://example.com --timeout=60000
```

### Chrome Instance Control

```bash
# Use custom Chrome executable
lighthouse https://example.com --chrome-path=/path/to/chrome

# Run without sandbox (useful in containers)
lighthouse https://example.com --chrome-flags="--no-sandbox"

# Enable verbose logging
lighthouse https://example.com --verbose

# Print trace to stdout
lighthouse https://example.com --verbose
```

## Batch Auditing

### Multiple URLs

```bash
# Audit multiple URLs in sequence
for url in https://example.com https://example.org; do
  lighthouse $url --output=json --output-path=./reports/
done

# Run audits in parallel with GNU Parallel
cat urls.txt | parallel lighthouse {} --output=json --output-path=./reports/
```

## Scoring & Thresholds

### View Scoring Details

```bash
# Generate full report with scoring breakdown
lighthouse https://example.com --output=json | jq '.categories'

# Extract performance score
lighthouse https://example.com --output=json | jq '.categories.performance.score'

# Extract all category scores
lighthouse https://example.com --output=json | jq '.categories | map({name: .id, score: .score})'
```

## Lighthouse Server Mode

### Run as a Server

```bash
# Start Lighthouse CI server
lighthouse-ci

# Configure port
lighthouse-ci --port=9000

# Run audits against server
lighthouse http://localhost:3000 --output=json
```

## Continuous Integration

### CI/CD Integration

```bash
# Generate minimal JSON output for CI
lighthouse https://example.com --output=json --quiet

# Return non-zero exit code on performance issues
lighthouse https://example.com --output=json && echo "Audit passed"

# Audit with timeout for CI pipelines
lighthouse https://example.com --output=json --timeout=60000

# Suppress unnecessary output
lighthouse https://example.com --output=json 2>/dev/null
```

## Common Usage Examples

```bash
# Complete audit workflow
lighthouse https://example.com --output=html --output=json

# Mobile performance audit
lighthouse https://example.com --preset=mobile --output=html

# Desktop accessibility audit
lighthouse https://example.com --preset=desktop --only-categories=accessibility

# Batch audit with reports
mkdir -p reports
lighthouse https://example.com --output=html --output-path=./reports/example-com.html
lighthouse https://example.org --output=html --output-path=./reports/example-org.html

# CI/CD audit with strict performance check
lighthouse https://example.com --output=json --threshold=90,80,90,90,90

# Monitor performance over time
lighthouse https://example.com --output=json --output-path=./audits/$(date +%Y-%m-%d).json

# Headless audit (fastest)
lighthouse https://example.com --chrome-flags="--headless" --output=json

# Full debug mode
lighthouse https://example.com --verbose --output=json --output=html
```

## Environment Variables

```bash
# Set Chrome executable path
export CHROME_PATH=/path/to/chrome
lighthouse https://example.com

# Set custom user data directory
export CHROME_USER_DATA_DIR=/tmp/chrome-data
lighthouse https://example.com
```

## Performance Scores Reference

- **90-100**: Good
- **50-89**: Needs Improvement
- **0-49**: Poor

## Global Options

All Lighthouse commands support these global flags:

- `--version` — Show version
- `--help` — Show help
- `--verbose` — Enable verbose logging
- `--quiet` — Suppress output
- `--output` — Output format (html, json, csv)
- `--output-path` — Output file path
- `--save-assets` — Save assets locally
- `--emulated-form-factor` — Device type (mobile, desktop)
- `--preset` — Configuration preset (mobile, desktop)
- `--timeout` — Maximum audit duration (milliseconds)
- `--chrome-path` — Custom Chrome executable path
- `--chrome-flags` — Custom Chrome launch flags
