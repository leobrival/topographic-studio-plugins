# Next.js CLI Commands Reference

Complete reference for all Next.js CLI commands with detailed options and flags.

## Installation & Project Creation

### `create-next-app`

Creates a new Next.js application with interactive setup.

```bash
# Interactive setup (recommended)
npx create-next-app@latest

# Create with specific name
npx create-next-app@latest my-app

# With pnpm
pnpm create next-app

# With yarn
yarn create next-app

# With bun
bunx create-next-app
```

## Project Creation Options

### Basic Options

```bash
# Show help
npx create-next-app --help

# Show version
npx create-next-app --version

# Use previous preferences (skip prompts)
npx create-next-app my-app --yes
```

### Language & Framework

```bash
# TypeScript project (default)
npx create-next-app my-app --typescript

# JavaScript project
npx create-next-app my-app --javascript

# Negate default options
npx create-next-app my-app --no-ts
```

### Styling & Linting

```bash
# With Tailwind CSS (default)
npx create-next-app my-app --tailwind

# Without Tailwind
npx create-next-app my-app --no-tailwind

# With ESLint
npx create-next-app my-app --eslint

# With Biome linter
npx create-next-app my-app --biome

# No linter
npx create-next-app my-app --no-linter
```

### Project Structure

```bash
# App Router (default)
npx create-next-app my-app --app

# API-only project (route handlers only)
npx create-next-app my-app --api

# Initialize inside src/ directory
npx create-next-app my-app --src-dir

# Empty project
npx create-next-app my-app --empty
```

### Build Tool

```bash
# With Turbopack (default)
npx create-next-app my-app --turbopack

# Force Webpack
npx create-next-app my-app --webpack
```

### React Features

```bash
# Enable React Compiler
npx create-next-app my-app --react-compiler
```

### Import Alias

```bash
# Custom import alias (default: @/*)
npx create-next-app my-app --import-alias "~/\*"

# No import alias
npx create-next-app my-app --import-alias ""
```

### Package Manager

```bash
# Use npm
npx create-next-app my-app --use-npm

# Use pnpm
npx create-next-app my-app --use-pnpm

# Use yarn
npx create-next-app my-app --use-yarn

# Use bun
npx create-next-app my-app --use-bun
```

### Examples & Templates

```bash
# Bootstrap with example
npx create-next-app my-app --example with-tailwindcss

# Bootstrap with GitHub URL
npx create-next-app my-app --example https://github.com/vercel/next.js/tree/canary/examples/with-typescript

# Specify example path
npx create-next-app my-app --example blog-starter --example-path cms-contentful
```

### Additional Options

```bash
# Skip package installation
npx create-next-app my-app --skip-install

# Disable git initialization
npx create-next-app my-app --disable-git

# Reset stored preferences
npx create-next-app --reset-preferences
```

### Complete Example

```bash
# Full custom setup
npx create-next-app my-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --turbopack \
  --import-alias "@/*" \
  --use-pnpm
```

## Core CLI Commands

### `next dev`

Starts the development server with Hot Module Reloading (HMR).

```bash
# Start dev server (default port 3000)
next dev

# Custom port
next dev -p 3001
next dev --port 4000

# Custom hostname
next dev -H localhost
next dev --hostname 192.168.1.100

# Enable Turbopack
next dev --turbopack

# Force Webpack
next dev --webpack

# HTTPS with self-signed certificate
next dev --experimental-https

# Combine options
next dev -p 3001 --turbopack
```

### `next build`

Creates an optimized production build.

```bash
# Build for production
next build

# Enable verbose build output
next build --debug
next build -d

# Enable production profiling for React
next build --profile

# Disable linting during build
next build --no-lint

# Debug prerender errors
next build --debug-prerender

# Build only specific routes
next build --debug-build-paths="/blog/**,/about"
next build --debug-build-paths="**/*"
```

### `next start`

Starts the production server (requires `next build` first).

```bash
# Start production server (default port 3000)
next start

# Custom port
next start -p 8080
next start --port 3001

# Custom hostname
next start -H 0.0.0.0
next start --hostname localhost

# Set keep-alive timeout (for downstream proxies)
next start --keepAliveTimeout 70000
```

## Utility Commands

### `next lint`

Runs ESLint for all files in the project.

```bash
# Lint entire project
next lint

# Lint specific directories
next lint --dir pages --dir utils

# Lint specific files
next lint --file pages/index.js

# Enable caching (faster subsequent runs)
next lint --cache

# Fix auto-fixable issues
next lint --fix

# Show error details
next lint --debug

# Suppress warnings
next lint --quiet

# Specify max warnings
next lint --max-warnings 10

# Output format
next lint --format json
next lint --format stylish
```

### `next info`

Prints system information for bug reporting.

```bash
# Display system info
next info

# Output includes:
# - Operating System
# - Binaries (Node, npm, yarn, pnpm)
# - Relevant packages (next, react, typescript)
```

### `next telemetry`

Manages anonymous telemetry collection.

```bash
# Enable telemetry
next telemetry enable

# Disable telemetry
next telemetry disable

# Check telemetry status
next telemetry status
```

### `next typegen`

Generates TypeScript definitions for routes.

```bash
# Generate route types
next typegen

# Types are written to .next/types or .next/dev/types

# Use with TypeScript validation
next typegen && tsc --noEmit
```

### `next upgrade`

Upgrades Next.js to the latest version.

```bash
# Upgrade to latest version
next upgrade

# Upgrade to specific version
next upgrade 14.0.0

# Check for available updates
next upgrade --check
```

## Environment Variables

### Setting Environment Variables

Next.js loads environment variables from `.env*` files:

```bash
# .env.local (local development, gitignored)
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=secret_key

# .env.development (development)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# .env.production (production)
NEXT_PUBLIC_API_URL=https://api.example.com

# .env.test (testing)
NODE_ENV=test
```

### Public Variables

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser:

```bash
# Accessible in browser
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX

# Server-only (not prefixed)
DATABASE_PASSWORD=secret
```

## Advanced Commands

### Custom Node Options

```bash
# Increase memory limit
NODE_OPTIONS='--max-old-space-size=4096' next build

# Enable inspector
NODE_OPTIONS='--inspect' next dev

# Multiple options
NODE_OPTIONS='--max-old-space-size=8192 --inspect' next dev
```

### Environment-Specific Builds

```bash
# Development build
NODE_ENV=development next build

# Production build
NODE_ENV=production next build

# Test build
NODE_ENV=test next build
```

### Migration Commands

#### Upgrading Next.js

```bash
# Check current version
next info

# Upgrade to latest
next upgrade

# Upgrade to specific version
npm install next@14.0.0 react@latest react-dom@latest

# Run codemods for breaking changes
npx @next/codemod@latest
```

## Global Options

All Next.js commands support these environment variables:

- `NODE_ENV` — Set environment (development/production/test)
- `PORT` — Set default port for dev/start
- `HOSTNAME` — Set hostname for server binding
- `NEXT_TELEMETRY_DISABLED` — Disable telemetry (set to 1)
- `NEXT_SOURCE_MAPS` — Enable source maps in production
