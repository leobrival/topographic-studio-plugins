# Testing Best Practices

## Test Structure

### AAA Pattern (Arrange, Act, Assert)

```typescript
it("calculates total with discount", () => {
  // Arrange
  const cart = new Cart();
  cart.addItem({ price: 100, quantity: 2 });
  const discount = 0.1;

  // Act
  const total = cart.calculateTotal(discount);

  // Assert
  expect(total).toBe(180);
});
```

### Descriptive Test Names

```typescript
// Bad
it("works", () => {});
it("test 1", () => {});

// Good
it("returns empty array when no users exist", () => {});
it("throws ValidationError when email is invalid", () => {});
it("increments counter when button is clicked", () => {});
```

### Test Organization

```typescript
describe("UserService", () => {
  describe("createUser", () => {
    it("creates user with valid data", () => {});
    it("throws error when email exists", () => {});
    it("hashes password before saving", () => {});
  });

  describe("findUser", () => {
    it("returns user by id", () => {});
    it("returns null when user not found", () => {});
  });
});
```

## Component Testing

### Query Priority

```typescript
// Priority (most accessible to least):
// 1. getByRole - accessible name
// 2. getByLabelText - form inputs
// 3. getByPlaceholderText - inputs without labels
// 4. getByText - non-interactive elements
// 5. getByDisplayValue - current input value
// 6. getByAltText - images
// 7. getByTitle - title attribute
// 8. getByTestId - last resort

// Good
screen.getByRole("button", { name: "Submit" });
screen.getByLabelText("Email");
screen.getByRole("heading", { level: 1 });

// Avoid
screen.getByTestId("submit-button"); // Use only when necessary
```

### User Event Over fireEvent

```typescript
import userEvent from "@testing-library/user-event";

// Good - simulates real user behavior
const user = userEvent.setup();
await user.click(button);
await user.type(input, "hello");

// Avoid - low-level events
fireEvent.click(button);
fireEvent.change(input, { target: { value: "hello" } });
```

### Test User Interactions

```typescript
it("shows dropdown on click", async () => {
  const { user } = render(<Dropdown options={options} />);

  // Initial state
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

  // User action
  await user.click(screen.getByRole("button"));

  // Result
  expect(screen.getByRole("listbox")).toBeVisible();
});
```

## Async Testing

### Wait for Elements

```typescript
// Use findBy for async elements
const element = await screen.findByText("Loaded");

// Use waitFor for assertions
await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument();
});

// Avoid arbitrary delays
// Bad
await new Promise(r => setTimeout(r, 1000));
```

### Handle Loading States

```typescript
it("shows loading then content", async () => {
  render(<AsyncComponent />);

  // Loading state
  expect(screen.getByRole("progressbar")).toBeInTheDocument();

  // Wait for content
  await waitFor(() => {
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  // Content visible
  expect(screen.getByText("Content loaded")).toBeInTheDocument();
});
```

## Mocking Guidelines

### Mock at the Right Level

```typescript
// Mock external dependencies, not internal logic
// Good - mock API calls
vi.mock("@/lib/api");

// Avoid - mock internal functions
vi.mock("@/lib/utils/calculateTotal"); // Too low-level
```

### Reset Mocks Properly

```typescript
beforeEach(() => {
  vi.clearAllMocks(); // Clear call history
});

afterEach(() => {
  vi.resetAllMocks(); // Reset implementations
});

// Or use vitest config
test: {
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
}
```

### Avoid Over-Mocking

```typescript
// Bad - mocking everything
vi.mock("react");
vi.mock("react-dom");

// Good - mock only external boundaries
vi.mock("@/lib/api");
vi.mock("@/lib/analytics");
```

## Coverage Guidelines

### What to Cover

- Business logic
- Edge cases
- Error handling
- User interactions
- Integration points

### What NOT to Focus On

- Simple getters/setters
- Framework code
- Third-party libraries
- Type definitions

### Coverage Thresholds

```typescript
coverage: {
  thresholds: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80,
  },
  // Exclude from coverage
  exclude: [
    "**/*.d.ts",
    "**/*.config.*",
    "**/types/**",
    "**/test/**",
  ],
}
```

## E2E Testing Guidelines

### Test Critical Paths

```typescript
// Focus on user journeys
test("complete purchase flow", async ({ page }) => {
  await page.goto("/products");
  await page.click('[data-testid="product-1"]');
  await page.click("button:has-text('Add to Cart')");
  await page.click("button:has-text('Checkout')");
  await page.fill("#email", "user@example.com");
  await page.click("button:has-text('Pay')");
  await expect(page).toHaveURL("/confirmation");
});
```

### Use Page Objects

```typescript
// Reusable, maintainable
class CheckoutPage {
  constructor(private page: Page) {}

  async fillEmail(email: string) {
    await this.page.fill("#email", email);
  }

  async submitPayment() {
    await this.page.click("button:has-text('Pay')");
  }
}
```

### Isolate Tests

```typescript
// Each test should be independent
test.beforeEach(async ({ page }) => {
  // Reset state
  await page.request.post("/api/test/reset");
});
```

## Common Mistakes

### 1. Testing Implementation Details

```typescript
// Bad - tests internal state
expect(component.state.isOpen).toBe(true);

// Good - tests visible behavior
expect(screen.getByRole("dialog")).toBeVisible();
```

### 2. Not Waiting for Updates

```typescript
// Bad - race condition
fireEvent.click(button);
expect(screen.getByText("Updated")).toBeInTheDocument();

// Good - wait for update
await user.click(button);
await waitFor(() => {
  expect(screen.getByText("Updated")).toBeInTheDocument();
});
```

### 3. Snapshot Abuse

```typescript
// Bad - snapshots everything
expect(component).toMatchSnapshot();

// Good - targeted snapshots
expect(component.find(".card")).toMatchSnapshot();
```

### 4. Fragile Selectors

```typescript
// Bad - depends on DOM structure
page.locator("div > ul > li:nth-child(2) > span");

// Good - semantic selectors
page.getByRole("listitem").filter({ hasText: "Item 2" });
```

## Performance Tips

1. **Parallelize tests**: Use `fullyParallel: true`
2. **Share browser context**: Use `storageState`
3. **Mock slow APIs**: Use MSW for API calls
4. **Use forks pool**: Better isolation with `pool: 'forks'`
5. **Optimize setup**: Minimize `beforeAll` work
