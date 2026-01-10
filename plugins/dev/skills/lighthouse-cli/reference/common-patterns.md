# Lighthouse Common Patterns

Real-world patterns and workflows for common Lighthouse use cases.

## Development Workflow

### Local Application Auditing

```bash
# Start local dev server
npm run dev  # or your dev command

# In another terminal, audit the running application
lighthouse http://localhost:3000 --preset=desktop --output=html

# Watch the report
open ./lhreport-*.html  # macOS
# or use your browser to open the HTML file
```

### Continuous Development Monitoring

```bash
# Audit after each build
npm run build && lighthouse http://localhost:3000 --output=json

# Save to timestamped file
lighthouse http://localhost:3000 --output=json --output-path=./audits/$(date +%Y-%m-%d-%H%M%S).json

# Track performance over time
cat audits/*.json | jq '.categories.performance.score'
```

## Mobile vs Desktop Testing

### Comprehensive Device Testing

```bash
# Create reports directory
mkdir -p reports/mobile reports/desktop

# Audit mobile performance
lighthouse https://example.com --preset=mobile --output=html --output-path=./reports/mobile/index.html

# Audit desktop performance
lighthouse https://example.com --preset=desktop --output=html --output-path=./reports/desktop/index.html

# Generate JSON for comparison
lighthouse https://example.com --preset=mobile --output=json --output-path=./reports/mobile.json
lighthouse https://example.com --preset=desktop --output=json --output-path=./reports/desktop.json
```

### Device-Specific Audits

```bash
# Mobile with custom viewport
lighthouse https://example.com --emulated-form-factor=mobile --viewport-width=375 --viewport-height=667

# Tablet testing (iPad dimensions)
lighthouse https://example.com --viewport-width=768 --viewport-height=1024

# Desktop with custom dimensions
lighthouse https://example.com --viewport-width=1440 --viewport-height=900
```

## Selective Auditing

### Category-Focused Audits

```bash
# Performance audit only
lighthouse https://example.com --only-categories=performance --output=html

# Accessibility audit only
lighthouse https://example.com --only-categories=accessibility --output=html

# SEO audit only
lighthouse https://example.com --only-categories=seo --output=html

# Multiple categories
lighthouse https://example.com --only-categories=performance,accessibility --output=html

# All except PWA
lighthouse https://example.com --skip-categories=pwa --output=html
```

## Batch Processing

### Audit Multiple Sites

```bash
# Simple batch audit
mkdir -p reports
for url in https://example.com https://example.org https://example.net; do
  lighthouse $url --output=html --output-path=./reports/$(echo $url | sed 's|https://||g').html
done
```

### Batch Audit from File

```bash
# Create urls.txt with one URL per line
cat > urls.txt << EOF
https://example.com
https://example.org
https://example.net
EOF

# Audit all URLs
mkdir -p reports
while read url; do
  echo "Auditing: $url"
  lighthouse $url --output=json --output-path=./reports/$(echo $url | sed 's|[^a-zA-Z0-9]|_|g').json
done < urls.txt
```

### Parallel Batch Auditing (GNU Parallel)

```bash
# Install GNU Parallel (if not present)
# brew install parallel (macOS) or apt-get install parallel (Linux)

# Audit URLs in parallel
mkdir -p reports
cat urls.txt | parallel lighthouse {} --output=json --output-path=./reports/{/.}.json

# Limit parallel jobs
cat urls.txt | parallel -j 3 lighthouse {} --output=json --output-path=./reports/{/.}.json
```

## CI/CD Integration

### GitHub Actions Pattern

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse Audit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g lighthouse
      - run: npm run build
      - run: |
          lighthouse http://localhost:3000 \
            --output=json \
            --output=html \
            --output-path=./reports/
```

### Local CI-Style Audit

```bash
# Build and audit
npm run build
npm run start &
SERVER_PID=$!

# Wait for server
sleep 3

# Run audit with minimal output
lighthouse http://localhost:3000 --output=json --quiet

# Cleanup
kill $SERVER_PID
```

## Report Analysis

### Extract and Compare Scores

```bash
# View all scores
lighthouse https://example.com --output=json | jq '.categories[] | {id: .id, score: (.score * 100)}'

# Extract specific score
lighthouse https://example.com --output=json | jq '.categories.performance.score'

# Compare before/after
echo "Before:"
jq '.categories.performance.score' before.json
echo "After:"
jq '.categories.performance.score' after.json
```

### Performance Tracking

```bash
# Create performance history
mkdir -p audits
for i in {1..7}; do
  DATE=$(date -d "-$i days" +%Y-%m-%d)
  echo "$DATE: $(jq '.categories.performance.score' audits/$DATE.json 2>/dev/null || echo 'N/A')"
done | sort

# Graph over time (requires external tools)
jq '.categories.performance.score' audits/*.json | gnuplot
```

## Authentication & Protected Pages

### Audit Protected Content

```bash
# Add bearer token
lighthouse https://api.example.com/dashboard \
  --extra-headers='{"Authorization":"Bearer your-token-here"}'

# Add custom headers
lighthouse https://example.com \
  --extra-headers='{"X-API-Key":"key123","X-Custom-Header":"value"}'

# Add cookies
lighthouse https://example.com \
  --extra-headers='{"Cookie":"session_id=abc123"}'
```

### Multi-Header Authentication

```bash
# Complex header setup (JSON format)
lighthouse https://example.com \
  --extra-headers='{
    "Authorization": "Bearer token123",
    "X-API-Key": "api-key-here",
    "X-Request-ID": "req-12345",
    "Accept": "application/json"
  }'
```

## Performance Throttling

### Simulate Various Network Conditions

```bash
# Real network (no throttling)
lighthouse https://example.com --throttling-method=provided

# Simulated slow network
lighthouse https://example.com --throttling-method=simulate

# DevTools throttling
lighthouse https://example.com --throttling-method=devtools
```

## Chrome Configuration

### Custom Chrome Settings

```bash
# Headless mode (faster, no visual)
lighthouse https://example.com --chrome-flags="--headless" --output=json

# Disable sandbox (for containers/CI)
lighthouse https://example.com --chrome-flags="--no-sandbox"

# Combine flags
lighthouse https://example.com \
  --chrome-flags="--headless --no-sandbox --disable-gpu"

# Specific Chrome location
lighthouse https://example.com --chrome-path=/usr/bin/google-chrome
```

## Advanced Report Generation

### Multi-Format Reports

```bash
# Generate all formats
mkdir -p reports
lighthouse https://example.com \
  --output=html \
  --output=json \
  --output=csv \
  --output-path=./reports/audit

# HTML for viewing
open ./reports/audit.html

# JSON for analysis
jq . ./reports/audit.json

# CSV for spreadsheets
cat ./reports/audit.csv
```

### Save Report Assets

```bash
# Generate report with embedded assets
lighthouse https://example.com \
  --output=html \
  --save-assets \
  --output-path=./my-audit.html

# Report folder will contain assets
# my-audit.html
# my-audit-assets/
#   ├── resources.json
#   └── ...
```

## Production Deployment Auditing

### Pre-Production Checks

```bash
# Complete multi-category audit
lighthouse https://staging.example.com \
  --preset=desktop \
  --output=html \
  --output=json \
  --timeout=60000 \
  --output-path=./deployment-audit

# Check all critical metrics
lighthouse https://staging.example.com --output=json | \
  jq '{
    performance: .categories.performance.score,
    accessibility: .categories.accessibility.score,
    seo: .categories.seo.score,
    "best-practices": .categories["best-practices"].score
  }'
```

## Monitoring & Alerting

### Performance Regression Detection

```bash
# Audit and save with timestamp
REPORT="audits/$(date +%s).json"
lighthouse https://example.com --output=json --output-path=$REPORT

# Compare with baseline
BASELINE_SCORE=$(jq '.categories.performance.score' baseline.json)
CURRENT_SCORE=$(jq '.categories.performance.score' $REPORT)

if (( $(echo "$CURRENT_SCORE < $BASELINE_SCORE - 0.1" | bc -l) )); then
  echo "Performance regression detected!"
  echo "Baseline: $BASELINE_SCORE"
  echo "Current: $CURRENT_SCORE"
fi
```

## Troubleshooting Audits

### Debug Audit Failures

```bash
# Verbose output for debugging
lighthouse https://example.com --verbose --output=json

# Increase timeout
lighthouse https://example.com --timeout=120000 --output=json

# Check Chrome can launch
lighthouse --chrome-flags="--version"

# Test server connectivity
curl -I https://example.com
```

### Local Development Testing

```bash
# Ensure server is running
ps aux | grep "npm run dev"

# Test server responds
curl http://localhost:3000

# Audit localhost
lighthouse http://localhost:3000 --output=html

# View generated report
open ./lhreport-*.html
```
