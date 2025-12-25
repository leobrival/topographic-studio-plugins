---
title: Playwright CLI
description: Playwright CLI commands for browser automation, testing, and debugging
allowed-tools: [Bash(npx playwright *), Bash(playwright *)]
---

Comprehensive cheat-sheet for Playwright CLI commands to automate browser testing, debugging, and web scraping.

## Installation & Configuration

```bash
# Install via npm
npm install -D @playwright/test

# Install via pnpm
pnpm add -D @playwright/test

# Install via yarn
yarn add -D @playwright/test

# Install browsers
npx playwright install

# Install specific browser
npx playwright install chromium

# Install multiple browsers
npx playwright install chromium firefox webkit

# Check Playwright version
npx playwright --version
```

## Browser Management

### Install Browsers

```bash
# Install all supported browsers
npx playwright install

# Install specific browser
npx playwright install chromium

# Install Firefox
npx playwright install firefox

# Install WebKit
npx playwright install webkit

# Install with system dependencies
npx playwright install-deps

# Show installed browsers
npx playwright install --help
```

### Test Execution

```bash
# Run all tests
npx playwright test

# Run tests in current directory
npx playwright test

# Run specific test file
npx playwright test tests/login.spec.ts

# Run tests matching a pattern
npx playwright test login

# Run a specific test by name
npx playwright test -g "should log in successfully"

# Run tests in a specific directory
npx playwright test tests/e2e/

# Run tests on specific browser
npx playwright test --project=chromium

# Run on multiple browsers
npx playwright test --project=chromium --project=firefox
```

## Debug Mode

### Debugging Tests

```bash
# Run tests in debug mode with Playwright Inspector
npx playwright test --debug

# Debug a specific test file
npx playwright test tests/login.spec.ts --debug

# Debug with Inspector UI
npx playwright test --debug --headed

# Debug single test
npx playwright test -g "test name" --debug
```

## Test Recording

### Record Tests

```bash
# Record test interaction
npx playwright codegen https://example.com

# Record to specific file
npx playwright codegen https://example.com -o tests/recorded.spec.ts

# Record with specific browser
npx playwright codegen --browser chromium https://example.com

# Record with Firefox
npx playwright codegen --browser firefox https://example.com

# Record with WebKit
npx playwright codegen --browser webkit https://example.com

# Record with all browsers
npx playwright codegen --browser chromium --browser firefox --browser webkit https://example.com
```

## Browser Modes

### Run in Different Modes

```bash
# Run tests headless (default)
npx playwright test

# Run with visible browser (headed)
npx playwright test --headed

# Run with specific browser visible
npx playwright test --headed --project=chromium

# Run in slow-motion (useful for debugging)
npx playwright test --headed --debug

# Run with trace (records all interactions)
npx playwright test --trace on
```

## Test Configuration

### Configure Test Behavior

```bash
# Run tests with specific timeout
npx playwright test --timeout=10000

# Set test workers (parallel execution)
npx playwright test --workers=4

# Run single-threaded (sequential)
npx playwright test --workers=1

# Show test reporter details
npx playwright test --reporter=verbose

# Generate HTML test report
npx playwright test --reporter=html

# Generate JSON report
npx playwright test --reporter=json > results.json

# Show test list without running
npx playwright test --list

# Dry run (show test names)
npx playwright test --list
```

## Reporter Options

### Different Output Formats

```bash
# Verbose reporter
npx playwright test --reporter=verbose

# HTML reporter (generates HTML report)
npx playwright test --reporter=html

# Open HTML report
npx playwright show-report

# JSON reporter
npx playwright test --reporter=json

# JUnit XML reporter
npx playwright test --reporter=junit

# GitHub reporter (for CI/CD)
npx playwright test --reporter=github

# Line reporter (minimal)
npx playwright test --reporter=line

# Combine reporters
npx playwright test --reporter=verbose --reporter=html
```

## Trace Recording

### Record Test Traces

```bash
# Record traces for all tests
npx playwright test --trace on

# Record traces on failure only
npx playwright test --trace on-first-retry

# Record traces on demand
npx playwright test --trace retain-on-failure

# Disable trace recording
npx playwright test --trace off
```

### View Traces

```bash
# Open trace viewer
npx playwright show-trace trace.zip

# Trace location (in test artifacts)
# Typically: test-results/*/trace.zip
```

## Headed Mode & Debugging

### Interactive Debugging

```bash
# Run tests in headed mode
npx playwright test --headed

# Run with Playwright Inspector
npx playwright test --debug

# Run specific test in debug mode
npx playwright test tests/specific.spec.ts --debug

# Run with visual debugging (headed + debug)
npx playwright test --headed --debug

# Show browser for all tests
npx playwright test --headed --workers=1
```

## Test Filtering & Selection

### Run Specific Tests

```bash
# Run test matching pattern
npx playwright test -g "login"

# Run tests with exact name
npx playwright test -g "^should log in successfully$"

# Skip tests matching pattern
npx playwright test --grep-invert "skip-in-ci"

# Run tests in specific file
npx playwright test tests/auth/login.spec.ts

# Run tests in directory
npx playwright test tests/e2e/

# List available tests
npx playwright test --list

# List tests matching pattern
npx playwright test --list -g "login"
```

## Browser & Device Options

### Target Specific Platforms

```bash
# Run on Chromium
npx playwright test --project=chromium

# Run on Firefox
npx playwright test --project=firefox

# Run on WebKit
npx playwright test --project=webkit

# Run on all configured browsers
npx playwright test

# Mobile Chrome
npx playwright test --project="Pixel 5"

# Mobile Safari
npx playwright test --project="iPhone 12"
```

## Screenshot & Video Recording

### Capture Media

```bash
# Take screenshots of each test
npx playwright test --screenshot=only-on-failure

# Always take screenshots
npx playwright test --screenshot=on

# Record videos on failure
npx playwright test --video=retain-on-failure

# Always record videos
npx playwright test --video=on

# No screenshots/videos
npx playwright test --screenshot=off --video=off
```

## Performance & Resource Management

### Optimize Test Execution

```bash
# Run tests with multiple workers
npx playwright test --workers=8

# Single worker (sequential)
npx playwright test --workers=1

# Use all available cores
npx playwright test --workers=auto

# Retry failed tests 3 times
npx playwright test --retries=3

# Don't retry
npx playwright test --retries=0

# Set maximum failures before stop
npx playwright test --max-failures=5
```

## Report Generation

### Generate Test Reports

```bash
# Generate HTML report
npx playwright test --reporter=html

# View HTML report
npx playwright show-report

# View specific report
npx playwright show-report path/to/report

# Generate HTML with screenshots
npx playwright test --screenshot=on --reporter=html

# Generate HTML with videos
npx playwright test --video=on --reporter=html

# Generate JSON report
npx playwright test --reporter=json > report.json
```

## Continuous Integration

### CI/CD Integration

```bash
# Run tests in CI mode
npx playwright test --reporter=github

# Set test timeout for CI
npx playwright test --timeout=30000

# Run with specific workers for CI
npx playwright test --workers=1

# Generate artifacts for CI
npx playwright test --reporter=html --reporter=json

# Run with retries for CI
npx playwright test --retries=2

# Run tests matching CI requirement
npx playwright test -g "ci-enabled"
```

## Local Development Server

### Test with Local Server

```bash
# Start local dev server and run tests
npx playwright test

# Use specific base URL
npx playwright test --base-url=http://localhost:3000

# Update snapshots
npx playwright test --update-snapshots

# Update visual snapshots
npx playwright test --update-snapshots
```

## Command Line Options Reference

### Global Options

```bash
# Show all available options
npx playwright test --help

# Show version
npx playwright --version

# Show help for specific command
npx playwright codegen --help

# Verbose output
npx playwright test --reporter=verbose

# Quiet output
npx playwright test --quiet
```

## Common Usage Examples

```bash
# Basic test run
npx playwright test

# Run all tests with HTML report
npx playwright test --reporter=html && npx playwright show-report

# Debug specific test with browser visible
npx playwright test -g "login" --headed --debug

# Record new test
npx playwright codegen https://example.com -o tests/new-test.spec.ts

# Run tests on mobile devices
npx playwright test --project="iPhone 12" --project="Pixel 5"

# Run tests with video and screenshot capture
npx playwright test --video=on --screenshot=on --reporter=html

# Run tests with full debugging output
npx playwright test tests/auth.spec.ts --reporter=verbose --debug --headed

# Generate comprehensive report
npx playwright test --reporter=html --reporter=json --video=on --screenshot=on

# Run tests with specific timeout and retries
npx playwright test --timeout=20000 --retries=2

# Test across all browsers with detailed reporting
npx playwright test --reporter=verbose --reporter=html --headed

# Performance testing
npx playwright test --workers=1 --timeout=30000 --reporter=verbose

# CI/CD pipeline run
npx playwright test --reporter=json --reporter=github --reporter=html --retries=2
```

## Environment Setup

### Configuration Options

```bash
# Set custom config file
npx playwright test --config=playwright-ci.config.ts

# Set test directory
npx playwright test ./e2e/

# Base URL for all tests
npx playwright test --base-url=https://staging.example.com

# Custom test match pattern
npx playwright test "**/*-test.ts"
```

## Browser Context Options

### Advanced Browser Settings

```bash
# Locale for tests
# Set in playwright.config.ts:
# use: { locale: 'fr-FR' }

# Timezone
# Set in playwright.config.ts:
# use: { timezoneId: 'Europe/Paris' }

# Geolocation
# Set in playwright.config.ts:
# use: { geolocation: { latitude: 48.8566, longitude: 2.3522 } }

# Permissions
# Set in playwright.config.ts:
# use: { permissions: ['camera'] }
```

## Troubleshooting

### Common Commands

```bash
# Reinstall browsers if issues occur
npx playwright install --with-deps

# Clear browser cache
rm -rf ~/.cache/ms-playwright/

# Show browser installation info
npx playwright install --help

# Check system requirements
npx playwright install-deps

# Run with system dependencies installed
npx playwright install-deps chromium
```
