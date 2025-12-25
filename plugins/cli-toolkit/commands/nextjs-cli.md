---
title: Next.js CLI
description: Next.js CLI commands for building React applications
allowed-tools:
  [Bash(npx create-next-app *), Bash(next *), Bash(npm *), Bash(pnpm *)]
---

Comprehensive documentation of the Next.js CLI for creating, developing, building, and deploying React applications with TypeScript.

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

## Package.json Scripts

### Standard Setup

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Advanced Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "dev:debug": "NODE_OPTIONS='--inspect' next dev",
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "build:debug": "next build --debug",
    "start": "next start -p 3000",
    "start:prod": "NODE_ENV=production next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "jest",
    "test:watch": "jest --watch",
    "clean": "rm -rf .next out"
  }
}
```

## Common Workflows

### Development Workflow

```bash
# Create new project
npx create-next-app@latest my-app

# Navigate to project
cd my-app

# Start development server
npm run dev

# Or with custom options
npm run dev -- -p 3001 --turbopack

# In another terminal: run linter
npm run lint

# In another terminal: type checking
npm run type-check
```

### Production Build Workflow

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Or with custom port
npm run start -- -p 8080
```

### Testing & Validation

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix

# Type check
npm run type-check

# Generate route types
npm run build -- --no-lint
npx next typegen
```

### Deployment Workflow

```bash
# Install dependencies
npm ci

# Build application
npm run build

# Start production server
npm run start
```

## Turbopack (Beta)

Turbopack is Next.js's new bundler (Rust-based, faster than Webpack).

```bash
# Enable in development
next dev --turbopack

# Set as default in package.json
{
  "scripts": {
    "dev": "next dev --turbopack"
  }
}

# Force Webpack instead
next dev --webpack
```

## Performance Optimization

### Build Optimization

```bash
# Enable production profiling
next build --profile

# Analyze bundle size
ANALYZE=true next build

# Build specific routes only (debugging)
next build --debug-build-paths="/api/**"
```

### Development Optimization

```bash
# Use Turbopack for faster HMR
next dev --turbopack

# Increase Node.js memory
NODE_OPTIONS='--max-old-space-size=4096' next dev

# Disable telemetry for faster builds
next telemetry disable
```

## Debugging

### Development Debugging

```bash
# Enable Node.js inspector
NODE_OPTIONS='--inspect' next dev

# Debug with breakpoints
NODE_OPTIONS='--inspect-brk' next dev

# Verbose logging
next dev --debug

# Debug prerender errors
next build --debug-prerender
```

### Production Debugging

```bash
# Enable source maps
NEXT_SOURCE_MAPS=true next build

# Verbose build output
next build --debug

# Profile React performance
next build --profile
```

## Server Actions & API Routes

### Running with Custom Server

```bash
# Using custom server.js
node server.js

# Example server.js
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000)
})
```

## Configuration

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Turbopack configuration
  experimental: {
    turbopack: {
      // Turbopack-specific options
    },
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Custom webpack config
    return config;
  },

  // Environment variables
  env: {
    CUSTOM_KEY: "value",
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/old-page",
        destination: "/new-page",
        permanent: true,
      },
    ];
  },

  // Headers
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },

  // Image optimization
  images: {
    domains: ["example.com"],
    formats: ["image/avif", "image/webp"],
  },

  // Output configuration
  output: "standalone", // For Docker
};

module.exports = nextConfig;
```

## TypeScript Support

### Type Checking

```bash
# Generate route types
next typegen

# Run TypeScript compiler
tsc --noEmit

# Combined validation
next typegen && tsc --noEmit

# Add to package.json
{
  "scripts": {
    "type-check": "next typegen && tsc --noEmit"
  }
}
```

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Docker Deployment

```bash
# Build standalone output
# next.config.js: output: 'standalone'

# Build Docker image
docker build -t my-nextjs-app .

# Run container
docker run -p 3000:3000 my-nextjs-app
```

### Static Export

```bash
# next.config.js
module.exports = {
  output: 'export',
}

# Build static files
npm run build

# Output in 'out' directory
```

## Troubleshooting

### Common Issues

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for build errors
next build --debug

# Verify system info
next info

# Check telemetry status
next telemetry status
```

### Port Already in Use

```bash
# Use different port
next dev -p 3001

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port in package.json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

## Best Practices

### Development

- Use `next dev --turbopack` for faster HMR
- Enable ESLint with `next lint`
- Use TypeScript for type safety
- Configure `.env.local` for local secrets
- Use `NEXT_PUBLIC_` prefix for client-side variables

### Production

- Always run `next build` before deployment
- Use `output: 'standalone'` for Docker
- Enable React strict mode
- Optimize images with Next.js Image component
- Use environment variables for configuration

### Performance

- Enable Turbopack in development
- Use `next build --profile` to identify bottlenecks
- Analyze bundle size regularly
- Use code splitting and dynamic imports
- Optimize fonts and images

## Resources

- **Official Docs**: <https://nextjs.org/docs>
- **CLI Reference**: <https://nextjs.org/docs/app/api-reference/cli>
- **Examples**: <https://github.com/vercel/next.js/tree/canary/examples>
- **GitHub**: <https://github.com/vercel/next.js>
- **Community**: <https://github.com/vercel/next.js/discussions>

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

### CI/CD Integration

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Type checking
npm run type-check

# Build
npm run build

# Run tests
npm test
```

## Migration Commands

### Upgrading Next.js

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

## Examples by Use Case

### Basic Blog

```bash
npx create-next-app@latest my-blog \
  --typescript \
  --tailwind \
  --app \
  --use-pnpm
```

### E-commerce Site

```bash
npx create-next-app@latest my-store \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --turbopack \
  --use-pnpm
```

### API-Only Project

```bash
npx create-next-app@latest my-api \
  --typescript \
  --api \
  --no-tailwind \
  --use-pnpm
```

### Minimal Project

```bash
npx create-next-app@latest my-minimal \
  --typescript \
  --empty \
  --no-tailwind \
  --no-linter \
  --use-pnpm
```
