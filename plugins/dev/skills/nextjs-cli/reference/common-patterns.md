# Next.js Common Patterns

Real-world patterns and workflows for common Next.js development scenarios.

## Development Workflow

### Basic App Development

```bash
# Create new project
npx create-next-app@latest my-app

# Navigate to project
cd my-app

# Start development server
npm run dev

# Or with custom options
npm run dev -- -p 3001 --turbopack
```

### Development with Custom Server

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

## App Router Patterns

### File-Based Routing

```bash
# Route structure
app/
├── page.tsx              # / route
├── about/
│   └── page.tsx          # /about route
├── blog/
│   ├── page.tsx          # /blog route
│   └── [slug]/
│       └── page.tsx      # /blog/:slug route
└── api/
    └── users/
        └── route.ts      # /api/users API route
```

### Dynamic Routes

```typescript
// app/blog/[slug]/page.tsx
export default function BlogPost({ params }: { params: { slug: string } }) {
  return <h1>Blog Post: {params.slug}</h1>
}

// Generate static paths
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}
```

### Route Groups

```bash
# Organize routes without affecting URL
app/
├── (marketing)/
│   ├── about/
│   │   └── page.tsx      # /about
│   └── pricing/
│       └── page.tsx      # /pricing
└── (shop)/
    ├── products/
    │   └── page.tsx      # /products
    └── cart/
        └── page.tsx      # /cart
```

## Data Fetching Patterns

### Server Components (Default)

```typescript
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'force-cache', // SSG
  })
  return res.json()
}

export default async function PostsPage() {
  const posts = await getPosts()
  return <div>{/* Render posts */}</div>
}
```

### Dynamic Data Fetching

```typescript
// Revalidate every 60 seconds (ISR)
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 }
  })
  return res.json()
}

// No caching (SSR)
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'no-store'
  })
  return res.json()
}
```

### Client Components

```typescript
'use client'

import { useState, useEffect } from 'react'

export default function ClientComponent() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
  }, [])

  return <div>{/* Render data */}</div>
}
```

## API Routes Patterns

### Basic API Route

```typescript
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

### Dynamic API Routes

```typescript
// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser(params.id)
  return NextResponse.json(user)
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const user = await updateUser(params.id, body)
  return NextResponse.json(user)
}
```

### Error Handling

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const users = await getUsers()
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
```

## Configuration Patterns

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
    return config
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
    ]
  },

  // Headers
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ]
  },

  // Image optimization
  images: {
    domains: ["example.com"],
    formats: ["image/avif", "image/webp"],
  },

  // Output configuration
  output: "standalone", // For Docker
}

module.exports = nextConfig
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

## Deployment Patterns

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

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# next.config.js: output: 'standalone'

# Build Docker image
docker build -t my-nextjs-app .

# Run container
docker run -p 3000:3000 my-nextjs-app
```

### Static Export

```javascript
// next.config.js
module.exports = {
  output: 'export',
}
```

```bash
# Build static files
npm run build

# Output in 'out' directory
# Deploy to any static hosting
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

### Code Splitting

```typescript
// Dynamic imports for code splitting
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('../components/Heavy'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable SSR for this component
})

export default function Page() {
  return <DynamicComponent />
}
```

## TypeScript Patterns

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

### Typed Routes

```typescript
// Use generated types
import Link from 'next/link'
import type { Route } from 'next'

export default function Navigation() {
  return (
    <Link href={"/blog/hello-world" as Route}>
      Blog Post
    </Link>
  )
}
```

## CI/CD Patterns

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

### Environment Variables

```bash
# .env.local (development)
DATABASE_URL=postgresql://localhost:5432/mydb
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# .env.production (production)
DATABASE_URL=${DATABASE_URL}
NEXT_PUBLIC_API_URL=https://api.example.com
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

## Debugging Patterns

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
