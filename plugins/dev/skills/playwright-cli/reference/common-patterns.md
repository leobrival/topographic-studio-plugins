# Playwright Common Patterns

Real-world patterns and workflows for common Playwright testing scenarios.

## Development Workflow

### Basic Test Development

```bash
# Run tests with browser visible for debugging
npx playwright test --headed

# Run specific test file with browser visible
npx playwright test tests/login.spec.ts --headed

# Run tests matching pattern with debug mode
npx playwright test -g "login" --headed --debug

# Watch for changes and rerun (requires plugins)
npm run test -- --watch
```

### Record and Generate Tests

```bash
# Record interaction with website
npx playwright codegen https://example.com -o tests/recorded.spec.ts

# Record with specific browser
npx playwright codegen --browser chromium https://example.com -o tests/chrome-test.spec.ts

# Record with Firefox
npx playwright codegen --browser firefox https://example.com -o tests/firefox-test.spec.ts

# Interactive recording workflow
npx playwright codegen https://example.com
# Then: interact with page, export as test file
```

## Test Organization Patterns

### Directory Structure

```bash
tests/
├── fixtures/              # Shared test data and utilities
│   ├── test-data.ts
│   └── test-helpers.ts
├── auth/
│   └── login.spec.ts
├── e2e/
│   ├── checkout.spec.ts
│   └── payment.spec.ts
├── api/
│   └── endpoints.spec.ts
└── performance/
    └── load.spec.ts
```

### Run by Category

```bash
# Run all E2E tests
npx playwright test tests/e2e/

# Run authentication tests
npx playwright test tests/auth/

# Run API tests
npx playwright test tests/api/

# Run performance tests
npx playwright test tests/performance/
```

## Cross-Browser Testing

### Test All Browsers

```bash
# Run on all configured browsers (default)
npx playwright test

# Run on specific browsers
npx playwright test --project=chromium --project=firefox --project=webkit

# Run on all browsers with verbose output
npx playwright test --reporter=verbose
```

### Browser-Specific Tests

```bash
# Run only Chrome tests
npx playwright test --project=chromium

# Run only Firefox tests
npx playwright test --project=firefox

# Run only WebKit tests
npx playwright test --project=webkit

# Skip tests on specific browser (in test code)
test.skip(browserName === 'firefox', 'Skip on Firefox');
```

## Mobile & Device Testing

### Test on Mobile Devices

```bash
# Run on iOS (iPhone)
npx playwright test --project="iPhone 12"

# Run on Android (Pixel)
npx playwright test --project="Pixel 5"

# Test multiple devices
npx playwright test --project="iPhone 12" --project="Pixel 5"

# List available devices
npx playwright test --list | grep "Device"
```

### Device-Specific Configuration

Configure in `playwright.config.ts`:

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'mobile-safari',
    use: { ...devices['iPhone 12'] },
  },
  {
    name: 'mobile-android',
    use: { ...devices['Pixel 5'] },
  },
],
```

## Visual & Artifact Capture

### Screenshot Strategies

```bash
# Capture only on failure
npx playwright test --screenshot=only-on-failure

# Always capture screenshots
npx playwright test --screenshot=on

# Generate HTML report with screenshots
npx playwright test --screenshot=on --reporter=html

# Combined with videos
npx playwright test --screenshot=on --video=on --reporter=html
```

### Video Recording

```bash
# Record video on failure
npx playwright test --video=retain-on-failure

# Record all tests
npx playwright test --video=on

# Combined screenshot and video
npx playwright test --video=on --screenshot=on --reporter=html
```

### Trace Recording

```bash
# Full trace on all tests
npx playwright test --trace on

# Trace on failure only
npx playwright test --trace retain-on-failure

# Trace with video (maximum debugging info)
npx playwright test --trace on --video=on
```

## Debugging Patterns

### Interactive Debugging

```bash
# Debug with Inspector UI
npx playwright test --debug

# Debug specific test
npx playwright test -g "should create account" --debug

# Debug with visible browser
npx playwright test --debug --headed

# Sequential execution with debug
npx playwright test --debug --workers=1
```

### Logging & Inspection

```bash
# Verbose output for debugging
npx playwright test --reporter=verbose

# Debug environment variable
PWDEBUG=1 npx playwright test

# Combine verbose reporter with debug
npx playwright test --reporter=verbose --debug

# Detailed trace analysis
npx playwright test --trace on
npx playwright show-trace trace.zip
```

## Performance & Optimization

### Performance Testing

```bash
# Single-threaded for consistent timing
npx playwright test --workers=1

# Increased timeout for slow environments
npx playwright test --timeout=30000

# Performance test workflow
npx playwright test tests/performance/ --workers=1 --timeout=30000 --reporter=verbose
```

### Parallel Execution

```bash
# Run with maximum parallelization
npx playwright test --workers=8

# Use all available cores
npx playwright test --workers=auto

# Reduce parallelization to prevent race conditions
npx playwright test --workers=2

# Monitor execution with verbose reporter
npx playwright test --workers=4 --reporter=verbose
```

## Flaky Test Management

### Retry Strategy

```bash
# Retry failed tests once
npx playwright test --retries=1

# Retry failed tests three times
npx playwright test --retries=3

# No retries (strict mode)
npx playwright test --retries=0

# Stop after first failure
npx playwright test --max-failures=1
```

### Debugging Flaky Tests

```bash
# Run flaky tests with debug mode
npx playwright test -g "flaky-test" --debug --headed --retries=3

# Run with traces to analyze failures
npx playwright test -g "flaky-test" --trace retain-on-failure

# Run sequentially to eliminate race conditions
npx playwright test -g "flaky-test" --workers=1

# Run with verbose reporting
npx playwright test -g "flaky-test" --reporter=verbose --retries=3
```

## CI/CD Integration Patterns

### GitHub Actions Workflow

```bash
# Standard CI run
npx playwright test --reporter=github

# With retries and JSON report
npx playwright test --reporter=github --reporter=json > results.json --retries=2

# Full CI configuration
npx playwright test --reporter=html --reporter=json --reporter=github --retries=2 --workers=1
```

### CI/CD Best Practices

```bash
# Single worker (deterministic)
npx playwright test --workers=1

# Generate all reports
npx playwright test --reporter=html --reporter=json --reporter=junit

# Timeout appropriate for CI environment
npx playwright test --timeout=30000

# Full workflow
npx playwright test \
  --workers=1 \
  --retries=2 \
  --timeout=30000 \
  --reporter=html \
  --reporter=json \
  --reporter=github
```

## Configuration Patterns

### Test Configuration by Environment

```bash
# Development
npx playwright test --headed --workers=1

# Staging
npx playwright test --base-url=https://staging.example.com --reporter=html

# Production (read-only)
npx playwright test --base-url=https://example.com --reporter=json

# Local development
npx playwright test --base-url=http://localhost:3000 --headed
```

### Dynamic Configuration

```bash
# Override base URL
npx playwright test --base-url=http://localhost:3000

# Update test snapshots
npx playwright test --update-snapshots

# Timezone testing
# Set in config: use: { timezoneId: 'Europe/Paris' }
npx playwright test

# Locale testing
# Set in config: use: { locale: 'fr-FR' }
npx playwright test
```

## Snapshot Testing

### Visual Regression Testing

```bash
# Compare against snapshots
npx playwright test

# Update snapshots
npx playwright test --update-snapshots

# Update specific test snapshots
npx playwright test -g "button" --update-snapshots

# Review changed snapshots
npx playwright test --reporter=html
npx playwright show-report
```

## Continuous Testing

### Watch Mode (if configured)

```bash
# Watch tests (requires configuration)
npm run test -- --watch

# Run specific test in watch mode
npm run test -- -g "login" --watch
```

### Incremental Testing

```bash
# Run recently changed tests
npx playwright test --only-changed

# Run failed tests from last run
npx playwright test --failed
```

## Report Analysis

### Generate Comprehensive Reports

```bash
# All report formats
npx playwright test \
  --reporter=html \
  --reporter=json \
  --reporter=junit \
  --reporter=verbose

# View reports
npx playwright show-report

# JSON for parsing/analysis
npx playwright test --reporter=json > results.json
# Parse with: cat results.json | jq .
```

## Authentication & Data Setup

### Test Data Management

```bash
# Run setup tests first
npx playwright test --project=setup

# Then run actual tests
npx playwright test --project=chromium

# Complete auth setup workflow
npx playwright test tests/auth/ --workers=1
npx playwright test tests/e2e/ --workers=2
```

### State Management

```bash
# Tests run in isolation
npx playwright test

# Clear state between tests
# (Configured in playwright.config.ts)

# Preserve state for debugging
npx playwright test --headed --workers=1
```
