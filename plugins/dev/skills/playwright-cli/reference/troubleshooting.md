# Playwright Troubleshooting Guide

Common issues and solutions for Playwright testing problems.

## Installation & Setup Issues

### Browsers Not Installed

**Symptom:** Tests fail with "browser not found" error

**Diagnosis:**

```bash
# Check installed browsers
npx playwright install --help

# Verify browser installation
ls ~/.cache/ms-playwright/
```

**Solutions:**

```bash
# Install all browsers
npx playwright install

# Install specific browser
npx playwright install chromium

# Install system dependencies
npx playwright install-deps

# Reinstall with dependencies
npx playwright install --with-deps
```

### Missing Dependencies

**Symptom:** "Error: Failed to launch browser" or library not found errors

**Solutions:**

```bash
# Install system dependencies (Linux)
npx playwright install-deps

# MacOS (usually not needed, but if required)
# Install Xcode command line tools:
xcode-select --install

# Windows (usually not needed, but if required)
# Run as Administrator or use package manager
```

## Browser Launch Issues

### Browser Won't Start

**Symptom:** "Error: Failed to launch browser process"

**Diagnosis:**

```bash
# Try launching manually with debug info
PWDEBUG=1 npx playwright test tests/single.spec.ts

# Check browser paths
npx playwright install --help
```

**Solutions:**

```bash
# Reinstall browsers
npx playwright install --with-deps

# Clear browser cache
rm -rf ~/.cache/ms-playwright/

# Reset Playwright completely
npm install @playwright/test@latest
npx playwright install
```

### Timeout on Browser Launch

**Symptom:** Test times out during browser launch

**Diagnosis:**

```bash
# Check system resources
top  # or Activity Monitor on Mac

# Test with longer timeout
npx playwright test --timeout=60000
```

**Solutions:**

```bash
# Increase launch timeout in config
use: {
  launchArgs: ['--disable-web-resources'],
  timeout: 60000,
}

# Run with verbose logging
npx playwright test --reporter=verbose

# Reduce parallel workers
npx playwright test --workers=1
```

### Browser Crashes During Tests

**Symptom:** "Browser closed" or "Session closed" errors

**Solutions:**

```bash
# Reduce memory pressure
npx playwright test --workers=1

# Disable sandbox mode (if safe)
use: {
  launchArgs: ['--disable-setuid-sandbox'],
}

# Increase memory allocation
NODE_OPTIONS=--max-old-space-size=4096 npx playwright test
```

## Test Execution Issues

### Tests Timeout

**Symptom:** Tests fail with "Test timeout" after waiting period

**Diagnosis:**

```bash
# Check which tests are timing out
npx playwright test --reporter=verbose

# Identify slow operations
npx playwright test --trace on
npx playwright show-trace trace.zip
```

**Solutions:**

```bash
# Increase global timeout
npx playwright test --timeout=30000

# Increase specific action timeout in config
use: {
  actionTimeout: 10000,
}

# Increase navigation timeout
use: {
  navigationTimeout: 30000,
}

# Identify slow selectors/operations and optimize test code
```

### Tests Are Flaky

**Symptom:** Tests pass sometimes, fail other times

**Common Causes:**

1. **Race conditions** → Use proper wait mechanisms
2. **Timing issues** → Network/system dependent
3. **Selector instability** → Element not stable
4. **Parallel execution issues** → Tests interfere with each other

**Solutions:**

```bash
# Run flaky test with retries
npx playwright test -g "flaky-test" --retries=3

# Debug with head mode
npx playwright test -g "flaky-test" --headed

# Run sequentially (eliminates parallelization issues)
npx playwright test -g "flaky-test" --workers=1

# Record trace for analysis
npx playwright test -g "flaky-test" --trace retain-on-failure

# Run multiple times to identify pattern
npx playwright test -g "flaky-test" --retries=5 --reporter=verbose
```

### Tests Run Slowly

**Symptom:** Test suite takes unexpectedly long

**Diagnosis:**

```bash
# Identify slow tests
npx playwright test --reporter=verbose

# Check resource usage
docker stats  # if using Docker
top  # or Activity Monitor

# Analyze with trace
npx playwright test --trace on
npx playwright show-trace trace.zip
```

**Solutions:**

```bash
# Parallelize execution
npx playwright test --workers=4

# Remove unnecessary waits in tests
# Replace: page.waitForTimeout(5000)
# With: page.waitForSelector('.element')

# Optimize selectors (avoid complex queries)
# Replace: page.locator('[data-test-id="foo"]')
# Check: page.locator('button:has-text("Login")')

# Use test fixtures efficiently
# Group related tests together
```

## Navigation & Loading Issues

### Page Won't Load

**Symptom:** Page fails to load or times out

**Diagnosis:**

```bash
# Check base URL
npx playwright test --base-url=http://localhost:3000

# Verify page is accessible
curl http://localhost:3000

# Check browser console errors
npx playwright test --headed --debug
```

**Solutions:**

```bash
# Increase timeout
npx playwright test --timeout=30000

# Verify base URL is correct
# In config: webServer: { url: 'http://localhost:3000' }

# Wait for specific condition
page.waitForLoadState('networkidle');

# Handle HTTPS certificate issues
use: {
  ignoreHTTPSErrors: true,
}
```

### Network Timeouts

**Symptom:** "Network timeout" or "Request timeout"

**Solutions:**

```bash
# Increase test timeout
npx playwright test --timeout=45000

# Check network connectivity
ping example.com

# Increase individual request timeout
page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

# Handle slow networks
use: {
  navigationTimeout: 45000,
  actionTimeout: 15000,
}
```

## Selector & Element Issues

### Element Not Found

**Symptom:** "Locator timeout waiting for selector"

**Diagnosis:**

```bash
# Debug with headed mode
npx playwright test --headed --debug

# Take screenshot to verify page state
npx playwright test --screenshot=on

# Check selector validity
# In test: console.log(await page.locator('selector').count());
```

**Solutions:**

```bash
# Use more robust selectors
// Avoid: page.locator('button')
// Better: page.locator('button:has-text("Login")')
// Better: page.getByRole('button', { name: 'Login' })

# Increase wait time
page.locator('.element').waitFor({ timeout: 5000 });

# Wait for page to load
await page.waitForLoadState('networkidle');

# Verify element exists before interaction
if (await page.locator('.element').count() > 0) {
  // proceed
}
```

### Flaky Selectors

**Symptom:** Selector sometimes works, sometimes doesn't

**Solutions:**

```bash
# Use accessibility selectors (more stable)
page.getByRole('button', { name: 'Login' })
page.getByLabel('Username')
page.getByPlaceholder('Enter email')

# Use test IDs
page.locator('[data-testid="submit-button"]')

# Avoid CSS selector chains that change
// Bad: page.locator('div > span > button')
// Good: page.locator('button.submit-btn')

# Wait before interaction
await page.locator('button').waitFor({ state: 'visible' });
await page.locator('button').click();
```

## Screenshot & Comparison Issues

### Screenshot Mismatches

**Symptom:** Visual regression test fails with "image differs"

**Solutions:**

```bash
# Update snapshots (intentional changes)
npx playwright test --update-snapshots

# Regenerate specific snapshots
npx playwright test -g "visual-test" --update-snapshots

# Review changes
npx playwright test --reporter=html
npx playwright show-report

# Compare snapshots
npx playwright show-trace trace.zip  # includes screenshots
```

### Flaky Visual Tests

**Symptom:** Same UI produces different screenshot sometimes

**Solutions:**

```bash
# Wait for animations/transitions
await page.waitForLoadState('networkidle');
await page.locator('.element').waitFor({ state: 'stable' });

# Disable visual noise
use: {
  locale: 'en-US',
  timezoneId: 'UTC',
  // Consistent date/time
}

# Use maxDiffPixels for minor variations
expect(screenshot).toMatchSnapshot({
  maxDiffPixels: 100,
});
```

## Configuration Issues

### Config File Not Found

**Symptom:** "Could not locate playwright.config"

**Solutions:**

```bash
# Verify config exists
ls playwright.config.ts
ls playwright.config.js

# Specify custom config
npx playwright test --config=playwright-ci.config.ts

# Default location: project root
# Create if missing: touch playwright.config.ts
```

### Incorrect Configuration

**Symptom:** Tests don't run with expected settings

**Diagnosis:**

```bash
# Check config syntax
npx playwright test --help

# Verify base URL
npx playwright test --base-url=http://localhost:3000

# List configuration
npx playwright test --list
```

**Solutions:**

```bash
# Validate config file structure
// Check for: export default defineConfig({...})

// Common fixes:
// 1. Add webServer for automatic server startup
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
}

// 2. Set correct timeout
timeout: 30 * 1000,

// 3. Configure projects correctly
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
]
```

## CI/CD Issues

### Tests Pass Locally But Fail in CI

**Symptom:** "Works on my machine" problem

**Common Causes:**

1. Different base URL
2. Missing environment variables
3. Timing differences
4. Browser differences

**Solutions:**

```bash
# Use same base URL in CI
npx playwright test --base-url=http://localhost:3000

# Verify environment variables
echo $DATABASE_URL
env | grep PLAYWRIGHT

# Run with exact CI configuration
npx playwright test --workers=1 --reporter=github --timeout=30000

# Use exact same Node version
node --version
nvm use <version>
```

### Tests Fail with "Out of Memory"

**Symptom:** "JavaScript heap out of memory"

**Solutions:**

```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npx playwright test

# Reduce parallelization
npx playwright test --workers=1

# Clear browser cache between runs
rm -rf ~/.cache/ms-playwright/
```

### Docker Container Issues

**Symptom:** Tests fail in Docker container

**Solutions:**

```bash
# Install system dependencies
RUN npx playwright install-deps

# Run with proper resource limits
docker run --memory=2g --cpus=2 myapp

# Use official Playwright image
FROM mcr.microsoft.com/playwright:v1.latest
```

## Debugging Tools & Techniques

### Enable Full Debugging

```bash
# Debug mode with Inspector UI
npx playwright test --debug

# Verbose output
npx playwright test --reporter=verbose

# Debug logs
PWDEBUG=1 npx playwright test

# Browser console logs
// In test:
page.on('console', console.log);
```

### Advanced Debugging

```bash
# Record trace for analysis
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip

# Detailed inspection
npx playwright test --reporter=verbose --trace on --headed
```

## Performance Profiling

### Identify Slow Operations

```bash
# Run with traces
npx playwright test --trace on

# Analyze with Inspector
npx playwright show-trace trace.zip

# Look for:
// 1. Long page load times
// 2. Slow selector queries
// 3. Network request delays
```

### Optimization Checklist

```bash
# Parallel execution when safe
npx playwright test --workers=4

# Remove browser.pause() in production tests
// Bad: page.pause();  // removes in CI
// Good: page.pause();  // works locally only

# Optimize selectors
// Use: getByRole, getByLabel, getByTestId
// Avoid: complex CSS chains

# Batch operations
// Use: page.evaluate() for multiple actions
// Avoid: individual page.click() calls
```
