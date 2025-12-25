import { test as base, expect, type Page } from "@playwright/test";

// Custom fixtures
interface CustomFixtures {
	authenticatedPage: Page;
	testUser: {
		email: string;
		password: string;
	};
}

// Extend base test with custom fixtures
export const test = base.extend<CustomFixtures>({
	// Test user credentials
	testUser: async ({}, use) => {
		await use({
			email: "test@example.com",
			password: "TestPassword123!",
		});
	},

	// Authenticated page fixture
	authenticatedPage: async ({ page, testUser }, use) => {
		// Navigate to login page
		await page.goto("/login");

		// Fill in credentials
		await page.getByLabel("Email").fill(testUser.email);
		await page.getByLabel("Password").fill(testUser.password);

		// Submit form
		await page.getByRole("button", { name: "Sign in" }).click();

		// Wait for redirect to dashboard
		await page.waitForURL("/dashboard");

		// Use the authenticated page
		await use(page);
	},
});

export { expect };

// Page Object Model base class
export abstract class BasePage {
	constructor(protected page: Page) {}

	async goto() {
		await this.page.goto(this.url);
	}

	abstract get url(): string;
}

// Example Page Object
export class DashboardPage extends BasePage {
	get url() {
		return "/dashboard";
	}

	// Locators
	get heading() {
		return this.page.getByRole("heading", { name: "Dashboard" });
	}

	get userMenu() {
		return this.page.getByTestId("user-menu");
	}

	get logoutButton() {
		return this.page.getByRole("button", { name: "Logout" });
	}

	// Actions
	async openUserMenu() {
		await this.userMenu.click();
	}

	async logout() {
		await this.openUserMenu();
		await this.logoutButton.click();
		await this.page.waitForURL("/login");
	}
}

export class LoginPage extends BasePage {
	get url() {
		return "/login";
	}

	// Locators
	get emailInput() {
		return this.page.getByLabel("Email");
	}

	get passwordInput() {
		return this.page.getByLabel("Password");
	}

	get submitButton() {
		return this.page.getByRole("button", { name: "Sign in" });
	}

	get errorMessage() {
		return this.page.getByRole("alert");
	}

	// Actions
	async login(email: string, password: string) {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.submitButton.click();
	}

	async expectErrorMessage(message: string) {
		await expect(this.errorMessage).toContainText(message);
	}
}

// Test data generators
export function generateEmail(): string {
	return `test-${Date.now()}@example.com`;
}

export function generatePassword(): string {
	return `Test${Date.now()}!`;
}

// API helpers for test setup
export async function createTestUser(
	request: import("@playwright/test").APIRequestContext,
) {
	const response = await request.post("/api/test/users", {
		data: {
			email: generateEmail(),
			password: generatePassword(),
			name: "Test User",
		},
	});
	return response.json();
}

export async function deleteTestUser(
	request: import("@playwright/test").APIRequestContext,
	userId: string,
) {
	await request.delete(`/api/test/users/${userId}`);
}

// Storage state helpers
export async function saveAuthState(page: Page, path: string) {
	await page.context().storageState({ path });
}

export async function useAuthState(
	browser: import("@playwright/test").Browser,
	path: string,
) {
	return browser.newContext({ storageState: path });
}
