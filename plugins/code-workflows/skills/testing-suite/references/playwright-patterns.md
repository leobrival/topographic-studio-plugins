# Playwright Testing Patterns

## Installation

```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

## Project Structure

```
e2e/
├── fixtures/
│   ├── index.ts          # Custom fixtures
│   └── auth.setup.ts     # Auth state setup
├── pages/
│   ├── BasePage.ts       # Base page object
│   ├── LoginPage.ts      # Login page object
│   └── DashboardPage.ts  # Dashboard page object
├── tests/
│   ├── auth.spec.ts      # Authentication tests
│   ├── dashboard.spec.ts # Dashboard tests
│   └── api.spec.ts       # API tests
├── global-setup.ts       # Global setup
├── global-teardown.ts    # Global teardown
└── playwright.config.ts  # Configuration
```

## Page Object Model

```typescript
// e2e/pages/BasePage.ts
import type { Page, Locator } from "@playwright/test";

export abstract class BasePage {
  constructor(protected page: Page) {}

  abstract get url(): string;

  async goto() {
    await this.page.goto(this.url);
  }

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  protected getByTestId(id: string): Locator {
    return this.page.getByTestId(id);
  }
}
```

```typescript
// e2e/pages/LoginPage.ts
import { BasePage } from "./BasePage";
import { expect } from "@playwright/test";

export class LoginPage extends BasePage {
  get url() { return "/login"; }

  get emailInput() { return this.page.getByLabel("Email"); }
  get passwordInput() { return this.page.getByLabel("Password"); }
  get submitButton() { return this.page.getByRole("button", { name: "Sign in" }); }
  get errorAlert() { return this.page.getByRole("alert"); }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorAlert).toContainText(message);
  }
}
```

## Custom Fixtures

```typescript
// e2e/fixtures/index.ts
import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";

interface Fixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: "e2e/.auth/user.json",
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
```

## Authentication Setup

```typescript
// e2e/fixtures/auth.setup.ts
import { test as setup, expect } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/dashboard");

  await page.context().storageState({ path: authFile });
});
```

```typescript
// playwright.config.ts
projects: [
  { name: "setup", testMatch: /.*\.setup\.ts/ },
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
    dependencies: ["setup"],
  },
]
```

## API Testing

```typescript
// e2e/tests/api.spec.ts
import { test, expect } from "@playwright/test";

test.describe("API Tests", () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    const response = await request.post("/api/auth/login", {
      data: { email: "test@example.com", password: "password123" },
    });
    const body = await response.json();
    token = body.token;
  });

  test("GET /api/users returns list", async ({ request }) => {
    const response = await request.get("/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.ok()).toBeTruthy();
    const users = await response.json();
    expect(users).toBeInstanceOf(Array);
  });

  test("POST /api/users creates user", async ({ request }) => {
    const response = await request.post("/api/users", {
      headers: { Authorization: `Bearer ${token}` },
      data: { email: "new@example.com", name: "New User" },
    });

    expect(response.status()).toBe(201);
  });
});
```

## Mocking API Responses

```typescript
test("handles API error", async ({ page }) => {
  await page.route("**/api/users", (route) => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: "Server Error" }),
    });
  });

  await page.goto("/users");
  await expect(page.getByText("Error loading users")).toBeVisible();
});

test("mocks successful response", async ({ page }) => {
  await page.route("**/api/users", (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
      ]),
    });
  });

  await page.goto("/users");
  await expect(page.getByText("John")).toBeVisible();
});
```

## Visual Testing

```typescript
test("visual regression", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("homepage.png", {
    fullPage: true,
    maxDiffPixels: 100,
  });
});

test("component screenshot", async ({ page }) => {
  await page.goto("/components");
  const card = page.getByTestId("feature-card").first();
  await expect(card).toHaveScreenshot("feature-card.png");
});
```

## Tracing and Debugging

```bash
# Run with trace
pnpm exec playwright test --trace on

# Open trace viewer
pnpm exec playwright show-trace trace.zip

# Debug mode
pnpm exec playwright test --debug

# UI mode
pnpm exec playwright test --ui
```

## Parallel Execution

```typescript
// playwright.config.ts
{
  workers: process.env.CI ? 1 : undefined,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
}
```

## Test Tags and Annotations

```typescript
test("critical feature @smoke", async ({ page }) => {
  // This test is tagged with @smoke
});

test.describe("Feature", () => {
  test.slow(); // Triples timeout
  test.skip(process.env.CI, "Skipped on CI");
  test.fixme("Known bug, needs fixing");
});
```

```bash
# Run only smoke tests
pnpm exec playwright test --grep @smoke
```
