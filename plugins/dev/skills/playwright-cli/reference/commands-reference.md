# Playwright CLI Commands Reference

Complete reference for all Playwright CLI commands with detailed options and flags.

## Installation & Setup

### `npx playwright install`

Install browsers and dependencies.

```bash
# Install all supported browsers (Chrome, Firefox, WebKit)
npx playwright install

# Install specific browser
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Install multiple browsers
npx playwright install chromium firefox webkit

# Install system dependencies
npx playwright install-deps

# Install specific browser dependencies
npx playwright install-deps chromium

# Show installation help
npx playwright install --help
```

## Test Execution

### `npx playwright test`

Run test suite.

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/login.spec.ts

# Run tests matching pattern
npx playwright test -g "login"

# Run exact test by name
npx playwright test -g "^should log in successfully$"

# Run tests in directory
npx playwright test tests/e2e/

# Skip tests matching pattern
npx playwright test --grep-invert "skip-in-ci"

# List tests without running
npx playwright test --list

# List tests matching pattern
npx playwright test --list -g "login"
```

### Browser & Project Selection

```bash
# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run on multiple browsers
npx playwright test --project=chromium --project=firefox

# Run on all configured browsers (default)
npx playwright test

# Run on mobile device
npx playwright test --project="Pixel 5"
npx playwright test --project="iPhone 12"
```

## Recording & Debugging

### `npx playwright codegen`

Record test scripts by interacting with browser.

```bash
# Record to specified file
npx playwright codegen https://example.com -o tests/new.spec.ts

# Record with specific browser
npx playwright codegen --browser chromium https://example.com
npx playwright codegen --browser firefox https://example.com
npx playwright codegen --browser webkit https://example.com

# Record with all browsers
npx playwright codegen --browser chromium --browser firefox --browser webkit https://example.com
```

### `npx playwright test --debug`

Debug tests with Playwright Inspector.

```bash
# Run all tests in debug mode
npx playwright test --debug

# Debug specific test file
npx playwright test tests/login.spec.ts --debug

# Debug specific test
npx playwright test -g "test name" --debug

# Debug with visible browser
npx playwright test --debug --headed
```

## Execution Modes

### `npx playwright test --headed`

Run tests with visible browser.

```bash
# Run with browser visible
npx playwright test --headed

# Run specific browser visible
npx playwright test --headed --project=chromium

# Run with visible browser and sequential execution
npx playwright test --headed --workers=1
```

### `npx playwright test --trace`

Record test execution traces.

```bash
# Enable tracing on all tests
npx playwright test --trace on

# Trace only on first retry
npx playwright test --trace on-first-retry

# Trace only on failure
npx playwright test --trace retain-on-failure

# Disable tracing
npx playwright test --trace off
```

### View Traces

```bash
# Open trace viewer
npx playwright show-trace trace.zip

# Traces saved in test-results/*/trace.zip
```

## Screenshots & Videos

### `npx playwright test --screenshot`

Capture screenshots.

```bash
# Screenshot only on failure
npx playwright test --screenshot=only-on-failure

# Always take screenshots
npx playwright test --screenshot=on

# No screenshots (default)
npx playwright test --screenshot=off
```

### `npx playwright test --video`

Record videos.

```bash
# Record videos only on failure
npx playwright test --video=retain-on-failure

# Always record videos
npx playwright test --video=on

# No videos (default)
npx playwright test --video=off
```

## Parallel Execution & Retries

### Performance Options

```bash
# Run with multiple workers (parallel)
npx playwright test --workers=4
npx playwright test --workers=8

# Single worker (sequential)
npx playwright test --workers=1

# Use all available cores
npx playwright test --workers=auto

# Retry failed tests
npx playwright test --retries=3
npx playwright test --retries=0  # No retries

# Stop after X failures
npx playwright test --max-failures=5
```

## Test Configuration

### Custom Config

```bash
# Use specific config file
npx playwright test --config=playwright-ci.config.ts

# Set test directory
npx playwright test ./e2e/

# Base URL for all tests
npx playwright test --base-url=http://localhost:3000
npx playwright test --base-url=https://staging.example.com

# Set test timeout
npx playwright test --timeout=10000
npx playwright test --timeout=30000

# Update visual snapshots
npx playwright test --update-snapshots
```

## Reporting

### `npx playwright test --reporter`

Generate test reports.

```bash
# Verbose reporter
npx playwright test --reporter=verbose

# HTML report
npx playwright test --reporter=html

# JSON report
npx playwright test --reporter=json > results.json

# JUnit XML report
npx playwright test --reporter=junit

# GitHub Actions reporter
npx playwright test --reporter=github

# Line reporter (minimal)
npx playwright test --reporter=line

# Combine multiple reporters
npx playwright test --reporter=verbose --reporter=html --reporter=json
```

### View Reports

```bash
# Open HTML report
npx playwright show-report

# Open specific report
npx playwright show-report path/to/report
```

## System Information

### `npx playwright --version`

Show version information.

```bash
# Show Playwright version
npx playwright --version

# Show help for commands
npx playwright test --help
npx playwright codegen --help
npx playwright show-report --help
```

## Environment & Logging

### Verbosity Options

```bash
# Verbose output
npx playwright test --reporter=verbose

# Quiet output
npx playwright test --quiet

# Enable debug output
PWDEBUG=1 npx playwright test
```

### Browser Context Options (via config)

Configure in `playwright.config.ts`:

```typescript
use: {
  locale: 'fr-FR',           // Set locale
  timezoneId: 'Europe/Paris', // Set timezone
  geolocation: { latitude: 48.8566, longitude: 2.3522 }, // Geolocation
  permissions: ['camera'],    // Permissions
  viewport: { width: 1280, height: 720 }, // Viewport size
}
```

## Common Command Combinations

```bash
# Full debugging workflow
npx playwright test -g "login" --headed --debug --reporter=verbose

# CI/CD pipeline run
npx playwright test --reporter=json --reporter=html --retries=2 --workers=1

# Development run with videos and screenshots
npx playwright test --video=on --screenshot=on --reporter=html

# Performance testing
npx playwright test --workers=1 --timeout=30000 --reporter=verbose

# Test specific file with all debugging
npx playwright test tests/auth.spec.ts --headed --debug --reporter=verbose --trace on
```
