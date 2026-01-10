---
name: nextjs-cli
description: Next.js CLI expert for React development. Use when users need to create, develop, build, or deploy Next.js applications.
---

# Next.js CLI Guide

Next.js is a React framework for building full-stack web applications with features like file-based routing, server-side rendering, and API routes. This guide provides essential workflows and quick references for common Next.js operations.

## Quick Start

```bash
# Create new Next.js app (interactive)
npx create-next-app@latest

# Create with specific name
npx create-next-app@latest my-app

# Start development server
cd my-app
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Common Workflows

### Workflow 1: Create and Run New Application

```bash
# Create new app with TypeScript and Tailwind
npx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --app \
  --use-pnpm

# Navigate to project
cd my-app

# Start development server with Turbopack
npm run dev -- --turbopack

# Open browser to http://localhost:3000
```

### Workflow 2: Add New Pages and Routes

```bash
# Create new route (App Router)
mkdir -p app/about
touch app/about/page.tsx

# Create dynamic route
mkdir -p app/blog/[slug]
touch app/blog/[slug]/page.tsx

# Create API route
mkdir -p app/api/users
touch app/api/users/route.ts

# Development server auto-reloads changes
```

### Workflow 3: Data Fetching and API Integration

```typescript
// Server Component with data fetching
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 } // ISR: revalidate every 60s
  })
  return res.json()
}

export default async function PostsPage() {
  const posts = await getPosts()
  return <div>{/* Render posts */}</div>
}
```

```typescript
// API Route Handler
// app/api/users/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const users = await getUsers()
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const body = await request.json()
  const user = await createUser(body)
  return NextResponse.json(user, { status: 201 })
}
```

### Workflow 4: Build and Deploy Production App

```bash
# Run linting and type checking
npm run lint
npm run type-check

# Build for production
npm run build

# Test production build locally
npm run start

# Deploy to Vercel
npm i -g vercel
vercel --prod

# Or deploy with Docker
# next.config.js: output: 'standalone'
docker build -t my-app .
docker run -p 3000:3000 my-app
```

### Workflow 5: Debug and Optimize

```bash
# Check system information
next info

# Debug development server
NODE_OPTIONS='--inspect' next dev

# Debug build issues
next build --debug

# Profile React performance
next build --profile

# Analyze bundle size
ANALYZE=true next build

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## Decision Tree

**When to use which command:**

- **To create a new project**: Use `npx create-next-app@latest` with appropriate flags
- **To start development**: Use `next dev` or `next dev --turbopack` for faster HMR
- **To add routes**: Create `page.tsx` files in `app/` directory (App Router)
- **To add API endpoints**: Create `route.ts` files in `app/api/` directory
- **To fetch data**: Use async Server Components (default) or Client Components with `'use client'`
- **To build for production**: Use `next build` then `next start`
- **To fix linting issues**: Use `next lint --fix`
- **To generate route types**: Use `next typegen`
- **For detailed command syntax**: See [Commands Reference](./reference/commands-reference.md)
- **For development patterns**: See [Common Patterns](./reference/common-patterns.md)
- **For troubleshooting**: See [Troubleshooting Guide](./reference/troubleshooting.md)

## Common Patterns

### App Router Structure

```bash
app/
├── page.tsx              # Home page (/)
├── layout.tsx            # Root layout
├── loading.tsx           # Loading UI
├── error.tsx             # Error boundary
├── not-found.tsx         # 404 page
├── about/
│   └── page.tsx          # /about route
├── blog/
│   ├── page.tsx          # /blog route
│   └── [slug]/
│       └── page.tsx      # /blog/:slug route
└── api/
    └── users/
        └── route.ts      # /api/users endpoint
```

### Data Fetching Strategies

```typescript
// Static Site Generation (SSG)
const res = await fetch('https://api.example.com/data', {
  cache: 'force-cache'
})

// Incremental Static Regeneration (ISR)
const res = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }
})

// Server-Side Rendering (SSR)
const res = await fetch('https://api.example.com/data', {
  cache: 'no-store'
})
```

### Environment Variables

```bash
# .env.local (gitignored, local development)
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=secret_key

# .env.production (production)
NEXT_PUBLIC_API_URL=https://api.example.com

# Client-side (prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX

# Server-only (no prefix)
DATABASE_PASSWORD=secret
```

## Troubleshooting

**Common Issues:**

1. **Port already in use**
   - Solution: `next dev -p 3001` or kill process with `lsof -ti:3000 | xargs kill -9`
   - See: [Port Already in Use](./reference/troubleshooting.md#port-already-in-use)

2. **Hydration errors**
   - Quick fix: Use `'use client'` and `useEffect` for client-only content
   - See: [Hydration Errors](./reference/troubleshooting.md#hydration-errors)

3. **Build fails with memory error**
   - Quick fix: `NODE_OPTIONS='--max-old-space-size=4096' next build`
   - See: [Build Fails with Memory Error](./reference/troubleshooting.md#build-fails-with-memory-error)

4. **Module not found errors**
   - Quick fix: Clear cache and reinstall: `rm -rf .next node_modules && npm install`
   - See: [Module Not Found Errors](./reference/troubleshooting.md#module-not-found-errors)

5. **Environment variables not working**
   - Quick fix: Ensure `NEXT_PUBLIC_` prefix for client-side, rebuild app
   - See: [Environment Variables Not Working](./reference/troubleshooting.md#environment-variables-not-working)

For detailed troubleshooting steps, see the [Troubleshooting Guide](./reference/troubleshooting.md).

## Reference Files

**Load as needed for detailed information:**

- **[Commands Reference](./reference/commands-reference.md)** - Complete CLI command documentation with all flags and options. Use when you need exact syntax or flag details for `create-next-app`, `next dev`, `next build`, `next start`, `next lint`, and other commands.

- **[Common Patterns](./reference/common-patterns.md)** - Real-world patterns for App Router, data fetching, API routes, configuration, deployment, and performance optimization. Use for implementing routing, SSR/SSG/ISR, dynamic imports, or CI/CD pipelines.

- **[Troubleshooting Guide](./reference/troubleshooting.md)** - Detailed error messages, diagnosis steps, and resolution strategies for development, build, runtime, routing, and deployment issues. Use when encountering errors like hydration mismatches, build failures, or 404s.

**When to use each reference:**

- Use **Commands Reference** when you need exact syntax, flag combinations, or comprehensive command documentation
- Use **Common Patterns** for implementing file-based routing, data fetching strategies, API endpoints, or deployment configurations
- Use **Troubleshooting** when encountering build errors, hydration issues, port conflicts, or environment variable problems

## Resources

- Official Docs: https://nextjs.org/docs
- CLI Reference: https://nextjs.org/docs/app/api-reference/cli
- Examples: https://github.com/vercel/next.js/tree/canary/examples
- GitHub: https://github.com/vercel/next.js
- Community: https://github.com/vercel/next.js/discussions
