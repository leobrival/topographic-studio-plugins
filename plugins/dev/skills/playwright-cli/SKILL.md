---
name: playwright-cli
description: Playwright CLI expert for E2E testing and browser automation. Use when users need to record tests, debug issues, generate reports, or test across multiple browsers and devices.
allowed-tools: Bash(npx playwright:*), Bash(bunx playwright:*)
---

# Playwright CLI Guide

Playwright is a testing framework for automating browser interactions across multiple browsers (Chrome, Firefox, WebKit) and devices. This guide provides essential workflows and quick references for test execution, debugging, and debugging.

## Quick Start

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Run your first tests
npx playwright test

# Run with visible browser
npx playwright test --headed

# Debug with Inspector UI
npx playwright test --debug

# View test report
npx playwright show-report
```

## Common Workflows

### Workflow 1: Record and Test

```bash
# Record interaction with website
npx playwright codegen https://example.com -o tests/recorded.spec.ts

# Run the recorded test
npx playwright test tests/recorded.spec.ts

# Run with browser visible
npx playwright test tests/recorded.spec.ts --headed

# Update and verify
npx playwright test tests/recorded.spec.ts --debug
```

### Workflow 2: Debug Failing Test

```bash
# Run failing test with browser visible
npx playwright test -g "test name" --headed

# Open debugger Inspector
npx playwright test -g "test name" --debug

# Capture screenshot for inspection
npx playwright test --screenshot=on

# Record trace for detailed analysis
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### Workflow 3: Test Across Browsers

```bash
# Run on all configured browsers
npx playwright test

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run on mobile devices
npx playwright test --project="iPhone 12"
npx playwright test --project="Pixel 5"
```

### Workflow 4: Generate Comprehensive Report

```bash
# Run tests with multiple reports
npx playwright test --reporter=html --reporter=json --reporter=verbose

# View HTML report
npx playwright show-report

# Generate CI-compatible reports
npx playwright test --reporter=github --reporter=json --retries=2
```

### Workflow 5: Performance Testing

```bash
# Run sequentially for consistent timing
npx playwright test --workers=1

# With extended timeout
npx playwright test --workers=1 --timeout=30000

# Record traces for analysis
npx playwright test --workers=1 --trace on

# View performance insights
npx playwright show-trace trace.zip
```

## Decision Tree

**When to use which command:**

- **To record test interactions**: Use `npx playwright codegen URL`
- **To run tests**: Use `npx playwright test` (all) or `npx playwright test -g "pattern"` (specific)
- **To debug**: Use `npx playwright test --debug` (Inspector) or `--headed` (visible browser)
- **To test across browsers**: Use `--project=chromium`, `--project=firefox`, or `--project=webkit`
- **To capture media**: Use `--screenshot=on` or `--video=on`
- **To analyze failures**: Use `--trace on` or `--reporter=html`
- **To handle flaky tests**: Use `--retries=3` or run with `--workers=1`
- **For exact command syntax**: See [Commands Reference](./reference/commands-reference.md)
- **For complex workflows**: See [Common Patterns](./reference/common-patterns.md)
- **For troubleshooting**: See [Troubleshooting Guide](./reference/troubleshooting.md)

## Common Patterns

### Browser & Device Targeting

```bash
# Run on specific browser
npx playwright test --project=chromium

# Run on multiple browsers
npx playwright test --project=chromium --project=firefox

# Run on mobile
npx playwright test --project="iPhone 12" --project="Pixel 5"

# Override base URL for environment
npx playwright test --base-url=https://staging.example.com
```

### Debugging & Inspection

```bash
# Visual debugging with browser visible
npx playwright test --headed --workers=1

# Interactive debugging with Inspector
npx playwright test --debug

# Detailed trace recording
npx playwright test --trace on
npx playwright show-trace trace.zip

# Full debugging output
npx playwright test --reporter=verbose --headed --debug
```

### Artifacts & Reports

```bash
# Screenshots on failure
npx playwright test --screenshot=only-on-failure

# Always record videos
npx playwright test --video=on

# Multiple report formats
npx playwright test --reporter=html --reporter=json --reporter=junit

# View HTML report
npx playwright show-report
```

### Performance & Reliability

```bash
# Parallel execution (faster)
npx playwright test --workers=4

# Sequential execution (deterministic)
npx playwright test --workers=1

# Retry flaky tests
npx playwright test --retries=2

# Extended timeout for slow networks
npx playwright test --timeout=30000
```

## Troubleshooting

**Common Issues:**

1. **Browser won't start**
   - Solution: Reinstall with `npx playwright install --with-deps`
   - See: [Browser Launch Issues](./reference/troubleshooting.md#browser-launch-issues)

2. **Tests time out**
   - Solution: Increase timeout with `npx playwright test --timeout=30000`
   - See: [Tests Timeout](./reference/troubleshooting.md#tests-timeout)

3. **Tests are flaky**
   - Solution: Run with `npx playwright test --retries=3` or `--workers=1`
   - See: [Tests Are Flaky](./reference/troubleshooting.md#tests-are-flaky)

4. **Page won't load**
   - Solution: Verify base URL and check server is running
   - See: [Page Won't Load](./reference/troubleshooting.md#page-wont-load)

5. **Element not found**
   - Solution: Use robust selectors like `getByRole()` or `getByTestId()`
   - See: [Element Not Found](./reference/troubleshooting.md#element-not-found)

For detailed troubleshooting steps, see the [Troubleshooting Guide](./reference/troubleshooting.md).

## Reference Files

**Load as needed for detailed information:**

- **[Commands Reference](./reference/commands-reference.md)** - Complete CLI command documentation with all flags and options. Use when you need exact syntax, flag combinations, or comprehensive command information.

- **[Common Patterns](./reference/common-patterns.md)** - Real-world patterns and workflows for development, cross-browser testing, mobile devices, visual testing, CI/CD, performance testing, and debugging. Use for implementing specific workflows or integrations.

- **[Troubleshooting Guide](./reference/troubleshooting.md)** - Detailed error messages, diagnosis steps, and resolution strategies for installation, browser issues, test failures, selectors, reports, CI/CD, and debugging techniques. Use when encountering errors or unexpected behavior.

**When to use each reference:**

- Use **Commands Reference** when you need exact command syntax, all available flags, or options for any Playwright CLI command
- Use **Common Patterns** for implementing test workflows, cross-browser testing, mobile testing, CI/CD pipelines, or performance testing
- Use **Troubleshooting** when browsers won't start, tests timeout, elements aren't found, or you need debugging strategies

## Resources

- Official Docs: https://playwright.dev
- Test Generator: `npx playwright codegen`
- Locator Inspector: `npx playwright test --debug`
- Community: https://github.com/microsoft/playwright
- API Reference: https://playwright.dev/docs/api/class-playwright
