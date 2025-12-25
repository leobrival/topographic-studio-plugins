---
name: cli-builder
description: Build interactive CLI applications using Ink (React for terminals). Use when users need to create command-line tools, terminal UIs, or developer utilities. Covers component patterns, user input, and distribution.
---

# CLI Builder

Build beautiful, interactive CLI applications with Ink (React for terminals).

## Decision Tree

```
User request → What type of CLI?
    │
    ├─ Interactive UI
    │   ├─ Ink → React components in terminal
    │   ├─ Components → Text, Box, Input, Select
    │   └─ State → useState, useEffect work!
    │
    ├─ Simple Commands
    │   ├─ Commander → Command parsing
    │   ├─ Yargs → Feature-rich parser
    │   └─ Citty → Lightweight, modern
    │
    ├─ User Input
    │   ├─ @inkjs/ui → Pre-built components
    │   ├─ Prompts → Text, select, confirm
    │   └─ Spinners → Loading states
    │
    └─ Distribution
        ├─ npm → Standard package
        ├─ npx → Run without install
        └─ Homebrew → macOS native
```

## Quick Start

### Project Setup

```bash
# Create project
mkdir my-cli && cd my-cli
pnpm init

# Install dependencies
pnpm add ink react
pnpm add -D typescript @types/react @types/node tsx

# Optional: UI components
pnpm add @inkjs/ui
```

### Package.json

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "my-cli": "./dist/cli.js"
  },
  "scripts": {
    "dev": "tsx watch src/cli.tsx",
    "build": "tsc",
    "lint": "biome check .",
    "lint:fix": "biome check --write ."
  },
  "files": ["dist"],
  "dependencies": {
    "ink": "^5.0.0",
    "react": "^18.2.0",
    "@inkjs/ui": "^2.0.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

### TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

### Basic CLI

```tsx
#!/usr/bin/env node
// src/cli.tsx
import React from "react";
import { render, Box, Text } from "ink";

function App() {
  return (
    <Box flexDirection="column" padding={1}>
      <Text color="green" bold>
        Welcome to My CLI!
      </Text>
      <Text>This is built with Ink (React for terminals)</Text>
    </Box>
  );
}

render(<App />);
```

### Interactive Example

```tsx
// src/cli.tsx
import React, { useState } from "react";
import { render, Box, Text, useInput, useApp } from "ink";
import { TextInput, Select, Spinner, ProgressBar } from "@inkjs/ui";

function App() {
  const [step, setStep] = useState<"name" | "framework" | "loading" | "done">("name");
  const [name, setName] = useState("");
  const [framework, setFramework] = useState("");
  const [progress, setProgress] = useState(0);
  const { exit } = useApp();

  // Handle keyboard shortcuts
  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === "c")) {
      exit();
    }
  });

  // Simulate installation
  React.useEffect(() => {
    if (step === "loading") {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setStep("done");
            return 100;
          }
          return p + 10;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Text color="cyan" bold>
        Create New Project
      </Text>

      {step === "name" && (
        <Box flexDirection="column">
          <Text>What is your project name?</Text>
          <TextInput
            placeholder="my-awesome-project"
            onSubmit={(value) => {
              setName(value);
              setStep("framework");
            }}
          />
        </Box>
      )}

      {step === "framework" && (
        <Box flexDirection="column">
          <Text>Select a framework:</Text>
          <Select
            options={[
              { label: "Next.js", value: "nextjs" },
              { label: "Remix", value: "remix" },
              { label: "Astro", value: "astro" },
            ]}
            onChange={(value) => {
              setFramework(value);
              setStep("loading");
            }}
          />
        </Box>
      )}

      {step === "loading" && (
        <Box flexDirection="column" gap={1}>
          <Box gap={1}>
            <Spinner label="Installing dependencies..." />
          </Box>
          <ProgressBar value={progress} />
        </Box>
      )}

      {step === "done" && (
        <Box flexDirection="column" gap={1}>
          <Text color="green">Project created successfully!</Text>
          <Box flexDirection="column" marginLeft={2}>
            <Text>
              <Text color="gray">Name:</Text> {name}
            </Text>
            <Text>
              <Text color="gray">Framework:</Text> {framework}
            </Text>
          </Box>
          <Text color="gray" dimColor>
            Run `cd {name} && pnpm dev` to start
          </Text>
        </Box>
      )}
    </Box>
  );
}

render(<App />);
```

### With Command Arguments

```tsx
// src/cli.tsx
#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import meow from "meow";
import { App } from "./App.js";

const cli = meow(
  `
  Usage
    $ my-cli <command> [options]

  Commands
    init      Create a new project
    build     Build the project
    deploy    Deploy to production

  Options
    --name, -n    Project name
    --force, -f   Force overwrite
    --verbose     Show detailed output

  Examples
    $ my-cli init --name my-project
    $ my-cli build --verbose
`,
  {
    importMeta: import.meta,
    flags: {
      name: { type: "string", shortFlag: "n" },
      force: { type: "boolean", shortFlag: "f", default: false },
      verbose: { type: "boolean", default: false },
    },
  }
);

const [command] = cli.input;

render(<App command={command} flags={cli.flags} />);
```

## Component Patterns

### Layout Component

```tsx
// components/Layout.tsx
import React from "react";
import { Box, Text } from "ink";

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

export function Layout({ title, children }: LayoutProps) {
  return (
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="round" borderColor="cyan" paddingX={2}>
        <Text bold color="cyan">
          {title}
        </Text>
      </Box>
      <Box marginTop={1}>{children}</Box>
    </Box>
  );
}
```

### Error Boundary

```tsx
// components/ErrorBoundary.tsx
import React from "react";
import { Box, Text } from "ink";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box flexDirection="column" padding={1}>
          <Text color="red" bold>
            Error occurred:
          </Text>
          <Text color="red">{this.state.error?.message}</Text>
        </Box>
      );
    }

    return this.props.children;
  }
}
```

## Distribution

### npm Publishing

```json
{
  "name": "@myorg/my-cli",
  "bin": {
    "my-cli": "./dist/cli.js"
  },
  "files": ["dist"],
  "publishConfig": {
    "access": "public"
  }
}
```

### Make Executable

```bash
# Add shebang to dist/cli.js
#!/usr/bin/env node

# Make executable
chmod +x dist/cli.js
```

## Reference Files

- **Ink Components**: See [references/ink-components.md](references/ink-components.md)
- **CLI Patterns**: See [references/cli-patterns.md](references/cli-patterns.md)
- **Distribution Guide**: See [references/distribution.md](references/distribution.md)

## Best Practices

1. **React patterns work**: useState, useEffect, components
2. **Handle exit gracefully**: useApp().exit() on Ctrl+C
3. **Show progress**: Spinners, progress bars for long tasks
4. **Clear error messages**: Help users fix issues
5. **Provide help text**: --help flag with examples
6. **Test in different terminals**: iTerm, Terminal, Windows
7. **Support piping**: Handle stdin/stdout
8. **Add colors thoughtfully**: Improve readability
