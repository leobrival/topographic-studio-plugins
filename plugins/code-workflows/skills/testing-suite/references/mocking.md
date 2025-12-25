# Mocking Strategies

## Vitest Mocking

### Function Mocking

```typescript
import { vi, describe, it, expect, beforeEach } from "vitest";

// Create mock function
const mockFn = vi.fn();
const mockFnWithReturn = vi.fn(() => "default");
const mockFnWithImplementation = vi.fn((x: number) => x * 2);

describe("Function Mocks", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear call history
    // vi.resetAllMocks(); // Reset + clear implementations
    // vi.restoreAllMocks(); // Restore original implementations
  });

  it("tracks calls", () => {
    mockFn("arg1", "arg2");
    mockFn("arg3");

    expect(mockFn).toHaveBeenCalled();
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
    expect(mockFn).toHaveBeenLastCalledWith("arg3");
  });

  it("returns values", () => {
    mockFn.mockReturnValue("value");
    expect(mockFn()).toBe("value");

    mockFn.mockReturnValueOnce("first").mockReturnValueOnce("second");
    expect(mockFn()).toBe("first");
    expect(mockFn()).toBe("second");
  });

  it("resolves promises", async () => {
    mockFn.mockResolvedValue("resolved");
    await expect(mockFn()).resolves.toBe("resolved");

    mockFn.mockRejectedValue(new Error("rejected"));
    await expect(mockFn()).rejects.toThrow("rejected");
  });
});
```

### Module Mocking

```typescript
// Mock entire module
vi.mock("@/lib/api", () => ({
  fetchUsers: vi.fn(() => Promise.resolve([])),
  createUser: vi.fn(),
}));

// Mock with factory
vi.mock("@/lib/auth", () => {
  return {
    useAuth: vi.fn(() => ({
      user: { id: "1", name: "Test" },
      isAuthenticated: true,
    })),
  };
});

// Partial mock (keep original implementation)
vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>();
  return {
    ...actual,
    formatDate: vi.fn(() => "mocked date"),
  };
});

// Import mocked module
import { fetchUsers, createUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";

// Access mock functions
const mockedFetchUsers = vi.mocked(fetchUsers);
mockedFetchUsers.mockResolvedValue([{ id: "1", name: "User" }]);
```

### Spy on Methods

```typescript
import { vi, it, expect } from "vitest";

const user = {
  name: "John",
  greet() {
    return `Hello, ${this.name}`;
  },
};

it("spies on method", () => {
  const spy = vi.spyOn(user, "greet");

  user.greet();

  expect(spy).toHaveBeenCalled();
  expect(spy).toHaveReturnedWith("Hello, John");

  spy.mockReturnValue("Mocked greeting");
  expect(user.greet()).toBe("Mocked greeting");

  spy.mockRestore(); // Restore original
});

// Spy on console
it("spies on console", () => {
  const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  console.log("test");

  expect(consoleSpy).toHaveBeenCalledWith("test");

  consoleSpy.mockRestore();
});
```

### Timer Mocking

```typescript
import { vi, it, expect, beforeEach, afterEach } from "vitest";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("mocks setTimeout", () => {
  const callback = vi.fn();

  setTimeout(callback, 1000);

  expect(callback).not.toHaveBeenCalled();

  vi.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalled();
});

it("mocks setInterval", () => {
  const callback = vi.fn();

  setInterval(callback, 100);

  vi.advanceTimersByTime(350);

  expect(callback).toHaveBeenCalledTimes(3);
});

it("runs all timers", () => {
  const callback = vi.fn();

  setTimeout(callback, 5000);
  setTimeout(callback, 10000);

  vi.runAllTimers();

  expect(callback).toHaveBeenCalledTimes(2);
});

it("mocks Date", () => {
  vi.setSystemTime(new Date(2025, 0, 1));

  expect(new Date().getFullYear()).toBe(2025);
});
```

## MSW (Mock Service Worker)

### Setup

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([
      { id: "1", name: "John" },
      { id: "2", name: "Jane" },
    ]);
  }),

  http.post("/api/users", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: "3", ...body },
      { status: 201 }
    );
  }),

  http.get("/api/users/:id", ({ params }) => {
    return HttpResponse.json({ id: params.id, name: "User" });
  }),

  http.delete("/api/users/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
```

```typescript
// src/test/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

```typescript
// src/test/setup.ts
import { server } from "./mocks/server";
import { beforeAll, afterEach, afterAll } from "vitest";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Runtime Overrides

```typescript
import { server } from "./mocks/server";
import { http, HttpResponse } from "msw";

it("handles error", async () => {
  server.use(
    http.get("/api/users", () => {
      return HttpResponse.json(
        { error: "Server error" },
        { status: 500 }
      );
    })
  );

  // Test error handling...
});

it("handles network error", async () => {
  server.use(
    http.get("/api/users", () => {
      return HttpResponse.error();
    })
  );

  // Test network error handling...
});

it("handles delayed response", async () => {
  server.use(
    http.get("/api/users", async () => {
      await delay(2000);
      return HttpResponse.json([]);
    })
  );

  // Test loading state...
});
```

### Request Verification

```typescript
import { http, HttpResponse } from "msw";

it("verifies request headers", async () => {
  let capturedHeaders: Headers;

  server.use(
    http.get("/api/users", ({ request }) => {
      capturedHeaders = request.headers;
      return HttpResponse.json([]);
    })
  );

  await fetch("/api/users", {
    headers: { Authorization: "Bearer token" },
  });

  expect(capturedHeaders.get("authorization")).toBe("Bearer token");
});

it("verifies request body", async () => {
  let capturedBody: unknown;

  server.use(
    http.post("/api/users", async ({ request }) => {
      capturedBody = await request.json();
      return HttpResponse.json({ id: "1" });
    })
  );

  await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "John" }),
  });

  expect(capturedBody).toEqual({ name: "John" });
});
```

## Browser API Mocking

### Storage

```typescript
const mockStorage: Record<string, string> = {};

beforeEach(() => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(
    (key) => mockStorage[key] ?? null
  );
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(
    (key, value) => { mockStorage[key] = value; }
  );
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(
    (key) => { delete mockStorage[key]; }
  );
  vi.spyOn(Storage.prototype, "clear").mockImplementation(
    () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); }
  );
});
```

### Geolocation

```typescript
const mockGeolocation = {
  getCurrentPosition: vi.fn((success) => {
    success({
      coords: { latitude: 48.8566, longitude: 2.3522 },
    });
  }),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

Object.defineProperty(navigator, "geolocation", {
  value: mockGeolocation,
  writable: true,
});
```

### Clipboard

```typescript
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve("copied text")),
  },
});
```
