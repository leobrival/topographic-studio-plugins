---
name: lighthouse-cli
description: Lighthouse CLI expert for web performance auditing. Use when users need to audit performance, accessibility, SEO, best practices, or generate audit reports.
---

# Lighthouse CLI Guide

Lighthouse is an open-source automated tool for improving web page quality. This guide provides essential workflows and quick references for auditing web performance, accessibility, SEO, and best practices.

## Quick Start

```bash
# Check Lighthouse installation
lighthouse --version

# Run your first audit
lighthouse https://example.com

# Audit localhost
lighthouse http://localhost:3000

# Generate JSON report
lighthouse https://example.com --output=json

# View help
lighthouse --help
```

## Common Workflows

### Workflow 1: Complete Performance Audit

```bash
# Audit with both HTML and JSON reports
lighthouse https://example.com --output=html --output=json

# View performance scores
lighthouse https://example.com --output=json | jq '.categories'

# Check specific category score
lighthouse https://example.com --output=json | jq '.categories.performance.score'
```

### Workflow 2: Mobile vs Desktop Testing

```bash
# Mobile performance audit
lighthouse https://example.com --preset=mobile --output=html

# Desktop performance audit
lighthouse https://example.com --preset=desktop --output=html

# Both reports
lighthouse https://example.com --preset=mobile --output=json --output-path=./reports/mobile.json
lighthouse https://example.com --preset=desktop --output=json --output-path=./reports/desktop.json
```

### Workflow 3: Selective Category Auditing

```bash
# Audit accessibility only
lighthouse https://example.com --only-categories=accessibility

# Audit performance and SEO only
lighthouse https://example.com --only-categories=performance,seo

# All categories except PWA
lighthouse https://example.com --skip-categories=pwa
```

### Workflow 4: Batch Auditing Multiple URLs

```bash
# Create reports directory
mkdir -p reports

# Audit multiple URLs
lighthouse https://example.com --output=html --output-path=./reports/example-com.html
lighthouse https://example.org --output=html --output-path=./reports/example-org.html

# Or with loop
for url in https://example.com https://example.org; do
  lighthouse $url --output=json --output-path=./reports/
done
```

### Workflow 5: CI/CD Integration

```bash
# Generate minimal output for CI
lighthouse https://example.com --output=json --quiet

# Audit with custom timeout
lighthouse https://example.com --output=json --timeout=60000

# Monitor performance over time
lighthouse https://example.com --output=json --output-path=./audits/$(date +%Y-%m-%d).json
```

## Decision Tree

**When to use which option:**

- **To audit a live website**: Use `lighthouse <url>` with `--preset=desktop` or `--preset=mobile`
- **To run specific audit categories**: Use `--only-categories=<category>`
- **To skip certain categories**: Use `--skip-categories=<category>`
- **To generate reports**: Use `--output=html` or `--output=json` with `--output-path`
- **For development/localhost**: Ensure server is running, then `lighthouse http://localhost:PORT`
- **For CI/CD pipelines**: Use `--output=json --quiet` with timeout settings
- **For detailed debugging**: Add `--verbose` flag
- **For exact command syntax**: See [Commands Reference](./reference/commands-reference.md)
- **For complex scenarios**: See [Common Patterns](./reference/common-patterns.md)
- **For troubleshooting**: See [Troubleshooting Guide](./reference/troubleshooting.md)

## Common Patterns

### Auditing with Authentication

```bash
# Add authentication headers
lighthouse https://example.com --extra-headers='{"Authorization":"Bearer token123"}'

# Add custom headers
lighthouse https://example.com --extra-headers='{"X-API-Key":"your-api-key"}'
```

### Performance Throttling

```bash
# Disable throttling (real device speed)
lighthouse https://example.com --throttling-method=provided

# Simulate network throttling
lighthouse https://example.com --throttling-method=simulate

# Custom Chrome flags
lighthouse https://example.com --chrome-flags="--headless"
```

### Custom Chrome Configuration

```bash
# Use specific Chrome executable
lighthouse https://example.com --chrome-path=/path/to/chrome

# Run in headless mode (faster)
lighthouse https://example.com --chrome-flags="--headless"

# Run without sandbox (containers)
lighthouse https://example.com --chrome-flags="--no-sandbox"
```

## Troubleshooting

**Common Issues:**

1. **Audit fails with timeout**
   - Solution: Increase timeout with `--timeout=60000` (milliseconds)
   - See: [Timeouts and Performance](./reference/troubleshooting.md#timeouts-and-performance)

2. **Can't audit localhost**
   - Quick fix: Verify server is running on specified port
   - See: [Cannot Audit Localhost](./reference/troubleshooting.md#cannot-audit-localhost)

3. **Authentication failing**
   - Quick fix: Use `--extra-headers` with proper format
   - See: [Authentication Issues](./reference/troubleshooting.md#authentication-issues)

4. **Report not generating**
   - Quick fix: Specify `--output-path` with full path
   - See: [Report Generation Issues](./reference/troubleshooting.md#report-generation-issues)

5. **Chrome won't launch**
   - Quick fix: Use `--chrome-path` to specify Chrome location
   - See: [Chrome Launch Issues](./reference/troubleshooting.md#chrome-launch-issues)

For detailed troubleshooting steps, see the [Troubleshooting Guide](./reference/troubleshooting.md).

## Reference Files

**Load as needed for detailed information:**

- **[Commands Reference](./reference/commands-reference.md)** - Complete CLI command documentation with all flags and options. Use when you need exact syntax or flag details for any Lighthouse command.

- **[Common Patterns](./reference/common-patterns.md)** - Real-world patterns and workflows for different audit scenarios, batch processing, CI/CD integration, report analysis, and performance monitoring. Use for implementing specific audit workflows.

- **[Troubleshooting Guide](./reference/troubleshooting.md)** - Detailed error messages, diagnosis steps, and resolution strategies for audit failures, Chrome issues, network problems, and report generation errors. Use when encountering errors or unexpected behavior.

**When to use each reference:**

- Use **Commands Reference** when you need exact syntax, flag combinations, or comprehensive command documentation
- Use **Common Patterns** for batch auditing, CI/CD integration, or multi-step audit workflows
- Use **Troubleshooting** when audits fail, Chrome won't launch, or reports don't generate

## Resources

- Official Docs: https://github.com/GoogleChrome/lighthouse
- PageSpeed Insights: https://pagespeed.web.dev
- Web.dev: https://web.dev
- Chrome DevTools: https://developer.chrome.com/docs/devtools
