# Vitest Configuration Reference

## Installation

```bash
pnpm add -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw
```

## Configuration Options

### Basic Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

### Environment Options

| Environment | Use Case |
|-------------|----------|
| `jsdom` | Browser APIs, DOM testing |
| `happy-dom` | Faster alternative to jsdom |
| `node` | Node.js APIs, backend testing |
| `edge-runtime` | Edge runtime testing |

### Coverage Configuration

```typescript
coverage: {
  provider: "v8",           // or "istanbul"
  reporter: ["text", "json", "html", "lcov"],
  reportsDirectory: "./coverage",
  exclude: [
    "node_modules/",
    "src/test/",
    "**/*.d.ts",
    "**/*.config.*",
  ],
  thresholds: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80,
  },
}
```

### Pool Options

```typescript
pool: "forks",              // "threads" | "forks" | "vmThreads"
poolOptions: {
  forks: {
    singleFork: false,      // Run tests in single process
    isolate: true,          // Isolate test files
  },
  threads: {
    singleThread: false,
    isolate: true,
  },
}
```

### Snapshot Configuration

```typescript
snapshotFormat: {
  escapeString: true,
  printBasicPrototype: true,
}
```

### TypeScript Configuration

```typescript
typecheck: {
  enabled: true,
  tsconfig: "./tsconfig.json",
  checker: "tsc",           // or "vue-tsc"
  include: ["**/*.{test,spec}.?(c|m)[jt]s?(x)"],
}
```

## Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

## Setup File Template

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

afterEach(() => {
  cleanup();
});

// Mock browser APIs
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});
```

## Common Patterns

### Skip and Focus Tests

```typescript
it.skip("skipped test", () => {});
it.only("focused test", () => {});
describe.skip("skipped suite", () => {});
describe.only("focused suite", () => {});
```

### Test Filtering

```bash
# Run specific test file
vitest src/components/Button.test.tsx

# Run tests matching pattern
vitest --testNamePattern="Button"

# Run tests in watch mode with filter
vitest --watch Button
```

### Environment Variables

```typescript
// vitest.config.ts
define: {
  "import.meta.env.TEST_API_URL": JSON.stringify("http://localhost:3000"),
}
```

## Integration with IDEs

### VS Code

```json
// .vscode/settings.json
{
  "vitest.enable": true,
  "vitest.commandLine": "pnpm vitest"
}
```

### WebStorm/IntelliJ

File > Settings > Languages & Frameworks > Node.js > Vitest
