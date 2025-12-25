import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	// Test directory
	testDir: "./e2e",

	// Test patterns
	testMatch: "**/*.spec.ts",

	// Output directory for test artifacts
	outputDir: "test-results",

	// Run tests in files in parallel
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code
	forbidOnly: !!process.env.CI,

	// Retry on CI only
	retries: process.env.CI ? 2 : 0,

	// Opt out of parallel tests on CI
	workers: process.env.CI ? 1 : undefined,

	// Reporter to use
	reporter: [
		["html", { open: "never" }],
		["json", { outputFile: "test-results/results.json" }],
		["list"],
	],

	// Shared settings for all the projects below
	use: {
		// Base URL to use in actions like `await page.goto('/')`
		baseURL: process.env.BASE_URL || "http://localhost:3000",

		// Collect trace when retrying the failed test
		trace: "on-first-retry",

		// Capture screenshot on failure
		screenshot: "only-on-failure",

		// Record video on failure
		video: "on-first-retry",

		// Maximum time each action such as `click()` can take
		actionTimeout: 10000,

		// Maximum time for navigation
		navigationTimeout: 30000,

		// Browser context options
		viewport: { width: 1280, height: 720 },
		ignoreHTTPSErrors: true,
		locale: "en-US",
		timezoneId: "Europe/Paris",
	},

	// Configure projects for major browsers
	projects: [
		// Desktop browsers
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},

		// Mobile viewports
		{
			name: "Mobile Chrome",
			use: { ...devices["Pixel 5"] },
		},
		{
			name: "Mobile Safari",
			use: { ...devices["iPhone 12"] },
		},

		// Branded browsers (optional)
		// {
		//   name: 'Microsoft Edge',
		//   use: { ...devices['Desktop Edge'], channel: 'msedge' },
		// },
		// {
		//   name: 'Google Chrome',
		//   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
		// },
	],

	// Web server configuration
	webServer: {
		command: "pnpm dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
		stdout: "pipe",
		stderr: "pipe",
	},

	// Timeout for each test
	timeout: 30000,

	// Expect configuration
	expect: {
		timeout: 5000,
		toHaveScreenshot: {
			maxDiffPixels: 100,
		},
		toMatchSnapshot: {
			maxDiffPixelRatio: 0.1,
		},
	},

	// Global setup and teardown
	// globalSetup: require.resolve('./e2e/global-setup'),
	// globalTeardown: require.resolve('./e2e/global-teardown'),
});
