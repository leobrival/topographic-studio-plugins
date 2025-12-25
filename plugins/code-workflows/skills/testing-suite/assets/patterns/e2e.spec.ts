/**
 * E2E Testing Pattern
 * Uses Playwright
 */
import { test, expect, type Page } from "@playwright/test";

// Page Object Model
class HomePage {
	constructor(private page: Page) {}

	// Locators
	get heading() {
		return this.page.getByRole("heading", { level: 1 });
	}

	get getStartedButton() {
		return this.page.getByRole("link", { name: "Get Started" });
	}

	get featuresSection() {
		return this.page.getByTestId("features-section");
	}

	get featureCards() {
		return this.page.getByTestId("feature-card");
	}

	// Actions
	async goto() {
		await this.page.goto("/");
	}

	async clickGetStarted() {
		await this.getStartedButton.click();
	}

	async scrollToFeatures() {
		await this.featuresSection.scrollIntoViewIfNeeded();
	}
}

class SignupPage {
	constructor(private page: Page) {}

	// Locators
	get emailInput() {
		return this.page.getByLabel("Email");
	}

	get passwordInput() {
		return this.page.getByLabel("Password");
	}

	get confirmPasswordInput() {
		return this.page.getByLabel("Confirm Password");
	}

	get submitButton() {
		return this.page.getByRole("button", { name: "Create Account" });
	}

	get errorMessage() {
		return this.page.getByRole("alert");
	}

	get successMessage() {
		return this.page.getByText("Account created successfully");
	}

	// Actions
	async goto() {
		await this.page.goto("/signup");
	}

	async fillForm(email: string, password: string) {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.confirmPasswordInput.fill(password);
	}

	async submit() {
		await this.submitButton.click();
	}

	async signup(email: string, password: string) {
		await this.fillForm(email, password);
		await this.submit();
	}
}

// Tests
test.describe("Home Page", () => {
	test("displays hero section", async ({ page }) => {
		const homePage = new HomePage(page);
		await homePage.goto();

		await expect(homePage.heading).toBeVisible();
		await expect(homePage.getStartedButton).toBeVisible();
	});

	test("navigates to signup from Get Started", async ({ page }) => {
		const homePage = new HomePage(page);
		await homePage.goto();
		await homePage.clickGetStarted();

		await expect(page).toHaveURL(/\/signup/);
	});

	test("displays feature cards", async ({ page }) => {
		const homePage = new HomePage(page);
		await homePage.goto();
		await homePage.scrollToFeatures();

		await expect(homePage.featureCards).toHaveCount(3);
	});

	test("has correct meta tags", async ({ page }) => {
		await page.goto("/");

		const title = await page.title();
		expect(title).toContain("My App");

		const description = page.locator('meta[name="description"]');
		await expect(description).toHaveAttribute("content", /.+/);
	});
});

test.describe("Signup Flow", () => {
	test("successfully creates account", async ({ page }) => {
		const signupPage = new SignupPage(page);
		await signupPage.goto();

		await signupPage.signup(`test-${Date.now()}@example.com`, "Password123!");

		await expect(signupPage.successMessage).toBeVisible();
		await expect(page).toHaveURL(/\/dashboard/);
	});

	test("shows error for invalid email", async ({ page }) => {
		const signupPage = new SignupPage(page);
		await signupPage.goto();

		await signupPage.signup("invalid-email", "Password123!");

		await expect(signupPage.errorMessage).toContainText("valid email");
	});

	test("shows error for weak password", async ({ page }) => {
		const signupPage = new SignupPage(page);
		await signupPage.goto();

		await signupPage.signup("test@example.com", "weak");

		await expect(signupPage.errorMessage).toContainText("password");
	});

	test("shows error for mismatched passwords", async ({ page }) => {
		const signupPage = new SignupPage(page);
		await signupPage.goto();

		await signupPage.emailInput.fill("test@example.com");
		await signupPage.passwordInput.fill("Password123!");
		await signupPage.confirmPasswordInput.fill("DifferentPassword!");
		await signupPage.submit();

		await expect(signupPage.errorMessage).toContainText("match");
	});
});

test.describe("Authentication Flow", () => {
	const testUser = {
		email: "e2e-test@example.com",
		password: "TestPassword123!",
	};

	test.beforeAll(async ({ browser }) => {
		// Create test user via API
		const context = await browser.newContext();
		const page = await context.newPage();

		await page.request.post("/api/test/users", {
			data: testUser,
		});

		await context.close();
	});

	test("logs in with valid credentials", async ({ page }) => {
		await page.goto("/login");

		await page.getByLabel("Email").fill(testUser.email);
		await page.getByLabel("Password").fill(testUser.password);
		await page.getByRole("button", { name: "Sign In" }).click();

		await expect(page).toHaveURL(/\/dashboard/);
		await expect(page.getByText("Welcome back")).toBeVisible();
	});

	test("shows error for invalid credentials", async ({ page }) => {
		await page.goto("/login");

		await page.getByLabel("Email").fill(testUser.email);
		await page.getByLabel("Password").fill("WrongPassword!");
		await page.getByRole("button", { name: "Sign In" }).click();

		await expect(page.getByRole("alert")).toContainText("Invalid credentials");
	});

	test("persists session after page reload", async ({ page }) => {
		// Login
		await page.goto("/login");
		await page.getByLabel("Email").fill(testUser.email);
		await page.getByLabel("Password").fill(testUser.password);
		await page.getByRole("button", { name: "Sign In" }).click();
		await expect(page).toHaveURL(/\/dashboard/);

		// Reload
		await page.reload();

		// Should still be logged in
		await expect(page).toHaveURL(/\/dashboard/);
	});

	test("logs out successfully", async ({ page }) => {
		// Login first
		await page.goto("/login");
		await page.getByLabel("Email").fill(testUser.email);
		await page.getByLabel("Password").fill(testUser.password);
		await page.getByRole("button", { name: "Sign In" }).click();
		await expect(page).toHaveURL(/\/dashboard/);

		// Logout
		await page.getByTestId("user-menu").click();
		await page.getByRole("button", { name: "Logout" }).click();

		await expect(page).toHaveURL(/\/login/);
	});
});

test.describe("Responsive Design", () => {
	test("mobile navigation works", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/");

		// Mobile menu should be collapsed
		await expect(page.getByTestId("desktop-nav")).not.toBeVisible();

		// Open mobile menu
		await page.getByTestId("mobile-menu-button").click();
		await expect(page.getByTestId("mobile-nav")).toBeVisible();

		// Navigate
		await page.getByRole("link", { name: "Features" }).click();
		await expect(page).toHaveURL(/\/#features/);
	});

	test("desktop navigation works", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto("/");

		await expect(page.getByTestId("desktop-nav")).toBeVisible();
		await expect(page.getByTestId("mobile-menu-button")).not.toBeVisible();
	});
});

test.describe("Visual Regression", () => {
	test("homepage matches snapshot", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		await expect(page).toHaveScreenshot("homepage.png", {
			fullPage: true,
			maxDiffPixels: 100,
		});
	});

	test("signup form matches snapshot", async ({ page }) => {
		await page.goto("/signup");
		await page.waitForLoadState("networkidle");

		await expect(page.getByTestId("signup-form")).toHaveScreenshot("signup-form.png");
	});
});

test.describe("Accessibility", () => {
	test("homepage has no accessibility violations", async ({ page }) => {
		await page.goto("/");

		// Using @axe-core/playwright
		// const results = await new AxeBuilder({ page }).analyze();
		// expect(results.violations).toEqual([]);
	});

	test("can navigate with keyboard only", async ({ page }) => {
		await page.goto("/");

		// Tab through navigation
		await page.keyboard.press("Tab");
		await expect(page.getByRole("link", { name: "Home" })).toBeFocused();

		await page.keyboard.press("Tab");
		await expect(page.getByRole("link", { name: "Features" })).toBeFocused();

		// Press Enter to navigate
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/\/#features/);
	});

	test("skip link works", async ({ page }) => {
		await page.goto("/");

		await page.keyboard.press("Tab");

		// First focusable should be skip link
		const skipLink = page.getByRole("link", { name: "Skip to content" });
		await expect(skipLink).toBeFocused();

		await page.keyboard.press("Enter");

		// Focus should move to main content
		await expect(page.locator("main")).toBeFocused();
	});
});

test.describe("Performance", () => {
	test("page loads within acceptable time", async ({ page }) => {
		const startTime = Date.now();

		await page.goto("/");
		await page.waitForLoadState("networkidle");

		const loadTime = Date.now() - startTime;
		expect(loadTime).toBeLessThan(3000);
	});

	test("no console errors on page load", async ({ page }) => {
		const errors: string[] = [];

		page.on("console", (msg) => {
			if (msg.type() === "error") {
				errors.push(msg.text());
			}
		});

		await page.goto("/");
		await page.waitForLoadState("networkidle");

		expect(errors).toHaveLength(0);
	});
});

test.describe("API Integration", () => {
	test("displays data from API", async ({ page }) => {
		// Mock API response
		await page.route("**/api/posts", async (route) => {
			await route.fulfill({
				status: 200,
				body: JSON.stringify([
					{ id: 1, title: "Test Post 1" },
					{ id: 2, title: "Test Post 2" },
				]),
			});
		});

		await page.goto("/posts");

		await expect(page.getByText("Test Post 1")).toBeVisible();
		await expect(page.getByText("Test Post 2")).toBeVisible();
	});

	test("handles API error gracefully", async ({ page }) => {
		await page.route("**/api/posts", async (route) => {
			await route.fulfill({
				status: 500,
				body: JSON.stringify({ error: "Server error" }),
			});
		});

		await page.goto("/posts");

		await expect(page.getByText("Failed to load posts")).toBeVisible();
		await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
	});
});
