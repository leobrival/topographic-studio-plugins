# Documentation Generation

Guide to generating documentation from source code using JSDoc, TypeDoc, and other tools.

## Overview

Documentation generators extract JSDoc/TSDoc comments from code and produce readable output in various formats (HTML, Markdown, JSON).

## Popular Tools

| Tool | Language | Output | Best For |
|------|----------|--------|----------|
| TypeDoc | TypeScript | HTML, Markdown, JSON | TypeScript projects |
| JSDoc | JavaScript | HTML | JavaScript projects |
| API Extractor | TypeScript | API reports, .d.ts | Large libraries |
| Docusaurus | Any | Website | Full documentation sites |
| Storybook | React | Interactive UI | Component libraries |

## TypeDoc Setup

### Installation

```bash
# Install TypeDoc
pnpm add -D typedoc

# Optional plugins
pnpm add -D typedoc-plugin-markdown
pnpm add -D typedoc-plugin-mdn-links
```

### Basic Configuration

```json
// typedoc.json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["src/index.ts"],
  "out": "docs",
  "name": "My Library",
  "readme": "README.md",
  "includeVersion": true
}
```

### Full Configuration

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["src/index.ts"],
  "entryPointStrategy": "expand",
  "out": "docs",

  "name": "My Library",
  "readme": "README.md",
  "includeVersion": true,

  "categorizeByGroup": true,
  "categoryOrder": ["Services", "Utilities", "Types", "*"],
  "sort": ["source-order", "alphabetical"],

  "exclude": [
    "**/node_modules/**",
    "**/*.test.ts",
    "**/*.spec.ts"
  ],
  "excludePrivate": true,
  "excludeInternal": true,

  "plugin": ["typedoc-plugin-markdown"],
  "theme": "default",

  "validation": {
    "notExported": true,
    "invalidLink": true,
    "notDocumented": false
  }
}
```

### NPM Scripts

```json
{
  "scripts": {
    "docs": "typedoc",
    "docs:watch": "typedoc --watch",
    "docs:serve": "typedoc && npx serve docs"
  }
}
```

### Command Line

```bash
# Generate docs
npx typedoc

# Watch mode
npx typedoc --watch

# Custom config
npx typedoc --options ./custom-typedoc.json

# Override options
npx typedoc --out ./api-docs --name "Custom Name"
```

## JSDoc Setup

### Installation

```bash
pnpm add -D jsdoc
```

### Configuration

```json
// jsdoc.json
{
  "source": {
    "include": ["src"],
    "includePattern": "\\.(jsx|js)$",
    "excludePattern": "(node_modules|test)"
  },
  "opts": {
    "destination": "./docs",
    "recurse": true,
    "readme": "./README.md"
  },
  "plugins": ["plugins/markdown"],
  "templates": {
    "cleverLinks": true,
    "monospaceLinks": true
  }
}
```

### NPM Scripts

```json
{
  "scripts": {
    "docs": "jsdoc -c jsdoc.json"
  }
}
```

## API Extractor

For large TypeScript libraries that need API reports and rollup .d.ts files.

### Installation

```bash
pnpm add -D @microsoft/api-extractor
```

### Configuration

```json
// api-extractor.json
{
  "$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
  "mainEntryPointFilePath": "./dist/index.d.ts",
  "bundledPackages": [],
  "apiReport": {
    "enabled": true,
    "reportFolder": "./api-reports/"
  },
  "docModel": {
    "enabled": true,
    "apiJsonFilePath": "./api-docs/<unscopedPackageName>.api.json"
  },
  "dtsRollup": {
    "enabled": true,
    "untrimmedFilePath": "./dist/<unscopedPackageName>.d.ts"
  },
  "tsdocMetadata": {
    "enabled": true
  }
}
```

### Usage

```bash
# Initialize config
npx api-extractor init

# Run extraction
npx api-extractor run --local

# CI mode (fails on warnings)
npx api-extractor run
```

## Documentation Themes

### TypeDoc Themes

```bash
# Install theme
pnpm add -D typedoc-theme-hierarchy

# Use in config
{
  "theme": "hierarchy"
}
```

Popular themes:

- `default` - Built-in theme
- `typedoc-theme-hierarchy` - Tree navigation
- `typedoc-material-theme` - Material design
- Custom themes via plugins

### Custom CSS

```json
{
  "customCss": "./docs-theme.css"
}
```

```css
/* docs-theme.css */
:root {
  --color-background: #ffffff;
  --color-primary: #0066cc;
}

.tsd-page-title {
  border-bottom: 2px solid var(--color-primary);
}
```

## Output Formats

### HTML (Default)

Standard navigable documentation website.

```json
{
  "out": "docs",
  "theme": "default"
}
```

### Markdown

For integration with documentation sites (Docusaurus, VitePress).

```json
{
  "plugin": ["typedoc-plugin-markdown"],
  "out": "docs/api"
}
```

### JSON

For custom processing or tooling.

```json
{
  "json": "docs/api.json"
}
```

## Documentation Structure

### Recommended File Organization

```
project/
├── src/
│   ├── index.ts          # Main entry point with @packageDocumentation
│   ├── services/
│   │   └── user.ts       # @category Services
│   ├── utils/
│   │   └── string.ts     # @category Utilities
│   └── types/
│       └── common.ts     # @category Types
├── docs/
│   ├── index.html        # Generated main page
│   ├── modules.html      # Module index
│   └── classes/          # Class documentation
├── README.md             # Included as docs homepage
└── typedoc.json          # Configuration
```

### Entry Point Strategy

```json
// Single entry
{
  "entryPoints": ["src/index.ts"]
}

// Multiple entries
{
  "entryPoints": ["src/client.ts", "src/server.ts"]
}

// Expand directories
{
  "entryPoints": ["src"],
  "entryPointStrategy": "expand"
}

// Package.json exports
{
  "entryPointStrategy": "packages",
  "entryPoints": ["packages/*"]
}
```

## Categories and Groups

### Using @category

```typescript
/**
 * @category Authentication
 */
export class AuthService {}

/**
 * @category Authentication
 */
export function login() {}

/**
 * @category Utilities
 */
export function formatDate() {}
```

### Configuration

```json
{
  "categorizeByGroup": true,
  "categoryOrder": [
    "Getting Started",
    "Authentication",
    "Core",
    "Utilities",
    "*"
  ],
  "defaultCategory": "Other"
}
```

## Visibility Control

### Exclude from Documentation

```typescript
/**
 * @internal
 * Not included in public documentation.
 */
export function internalHelper() {}

/**
 * @hidden
 * Completely hidden from docs.
 */
export function hiddenFunction() {}

/**
 * @ignore
 * Ignored by documentation generator.
 */
export function ignoredFunction() {}
```

### Configuration

```json
{
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeInternal": true,
  "excludeExternals": true,
  "visibilityFilters": {
    "protected": true,
    "@alpha": false,
    "@beta": true,
    "@internal": false
  }
}
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/docs.yml
name: Documentation

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: pnpm install

      - name: Build docs
        run: pnpm run docs

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

### Validation in CI

```yaml
- name: Validate documentation
  run: |
    npx typedoc --treatWarningsAsErrors
    npx api-extractor run
```

## Best Practices

### 1. Document Public API

Focus on exports that users will consume:

```typescript
// src/index.ts

/**
 * @packageDocumentation
 * Authentication library for Node.js applications.
 *
 * @example
 * ```typescript
 * import { createAuth } from 'my-auth';
 *
 * const auth = createAuth({ secret: 'xxx' });
 * ```
 */

export { createAuth } from './auth';
export type { AuthConfig, User } from './types';
```

### 2. Include README

```json
{
  "readme": "README.md"
}
```

The README becomes the documentation homepage.

### 3. Use Examples

```typescript
/**
 * @example Basic usage
 * ```typescript
 * const user = await getUser('123');
 * ```
 *
 * @example With error handling
 * ```typescript
 * try {
 *   const user = await getUser('123');
 * } catch (error) {
 *   console.error('User not found');
 * }
 * ```
 */
```

### 4. Version Documentation

```json
{
  "includeVersion": true,
  "gitRevision": "main"
}
```

### 5. Link to Source

```json
{
  "sourceLinkTemplate": "https://github.com/org/repo/blob/{gitRevision}/{path}#L{line}"
}
```

### 6. Validate Links

```json
{
  "validation": {
    "invalidLink": true
  }
}
```

## Troubleshooting

### Missing Exports

Ensure items are exported from entry point:

```typescript
// src/index.ts
export { MyClass } from './my-class';
export type { MyType } from './types';
```

### Broken Links

Check `@link` references match actual names:

```typescript
// BAD: Broken link
/** @see {@link nonExistent} */

// GOOD: Valid reference
/** @see {@link ExistingClass} */
```

### Types Not Documented

Enable type documentation:

```json
{
  "excludeExternals": false
}
```

### Performance Issues

For large projects:

```json
{
  "skipErrorChecking": true,
  "excludeNotDocumented": true
}
```
