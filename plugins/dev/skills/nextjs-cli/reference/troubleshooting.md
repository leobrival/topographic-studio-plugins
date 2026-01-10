# Next.js Troubleshooting Guide

Common issues and solutions for Next.js applications.

## Development Server Issues

### Port Already in Use

**Symptom:** Error: "Port 3000 is already in use"

**Diagnosis:**
```bash
# Check which process is using port 3000
lsof -ti:3000

# Or on Windows
netstat -ano | findstr :3000
```

**Solutions:**
```bash
# Use different port
next dev -p 3001

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or set in package.json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

### Hot Module Reloading Not Working

**Symptom:** Changes not reflected in browser

**Solutions:**
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
next dev

# Use Turbopack (faster HMR)
next dev --turbopack

# Check file watchers limit (Linux/Mac)
# Add to ~/.bashrc or ~/.zshrc:
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Module Not Found Errors

**Symptom:** Error: "Module not found: Can't resolve 'X'"

**Solutions:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Check import paths (case-sensitive)
# Use configured import alias
import { Component } from '@/components/Component'
```

## Build Issues

### Build Fails with Memory Error

**Symptom:** "FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory"

**Solutions:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS='--max-old-space-size=4096' next build

# Add to package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}

# Use Turbopack (more memory efficient)
next dev --turbopack
```

### Build Fails with ESLint Errors

**Symptom:** Build stops due to linting errors

**Solutions:**
```bash
# Fix linting issues
next lint --fix

# Temporarily skip linting during build
next build --no-lint

# Configure ESLint to be less strict
# .eslintrc.json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "@next/next/no-html-link-for-pages": "off"
  }
}
```

### Build Fails with TypeScript Errors

**Symptom:** Type check failed

**Diagnosis:**
```bash
# Check TypeScript errors
tsc --noEmit

# Generate route types
next typegen
```

**Solutions:**
```bash
# Fix TypeScript errors
tsc --noEmit

# Temporarily skip type checking (NOT recommended)
# next.config.js
module.exports = {
  typescript: {
    ignoreBuildErrors: true,
  },
}

# Update TypeScript and types
npm install -D typescript @types/react @types/node
```

## Runtime Issues

### Hydration Errors

**Symptom:** "Text content does not match server-rendered HTML" or "Hydration failed"

**Common Causes:**
1. Different content between server and client
2. Invalid HTML nesting (e.g., `<p>` inside `<p>`)
3. Browser extensions modifying DOM
4. Using `window` or `document` in Server Components

**Solutions:**
```typescript
// Use client component for dynamic content
'use client'

import { useState, useEffect } from 'react'

export default function ClientOnly() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <div>{/* Client-only content */}</div>
}

// Or use suppressHydrationWarning (sparingly)
<div suppressHydrationWarning>
  {new Date().toLocaleDateString()}
</div>
```

### Data Fetching Errors

**Symptom:** API requests failing or data not loading

**Solutions:**
```typescript
// Server Component (recommended)
async function getData() {
  try {
    const res = await fetch('https://api.example.com/data', {
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching data:', error)
    return { error: 'Failed to load data' }
  }
}

// Client Component with error handling
'use client'

import { useState, useEffect } from 'react'

export default function ClientData() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(setError)
  }, [])

  if (error) return <div>Error: {error.message}</div>
  if (!data) return <div>Loading...</div>

  return <div>{/* Render data */}</div>
}
```

### API Route Issues

**Symptom:** API routes returning 404 or incorrect responses

**Solutions:**
```typescript
// Check file structure
// app/api/users/route.ts (correct)
// app/api/users.ts (incorrect)

// Ensure proper HTTP methods
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  return NextResponse.json({ message: 'GET request' })
}

export async function POST(request: Request) {
  const body = await request.json()
  return NextResponse.json({ message: 'POST request', body })
}

// Enable CORS if needed
export async function GET(request: Request) {
  const response = NextResponse.json({ data: 'value' })
  response.headers.set('Access-Control-Allow-Origin', '*')
  return response
}
```

## Routing Issues

### 404 on Dynamic Routes

**Symptom:** Dynamic routes returning 404

**Solutions:**
```bash
# Check file structure
app/
└── blog/
    └── [slug]/
        └── page.tsx  # Must be named page.tsx

# Ensure params are properly typed
export default function BlogPost({
  params
}: {
  params: { slug: string }
}) {
  return <h1>{params.slug}</h1>
}

# For static generation
export async function generateStaticParams() {
  return [
    { slug: 'post-1' },
    { slug: 'post-2' },
  ]
}
```

### Redirects Not Working

**Symptom:** Redirects defined in next.config.js not working

**Solutions:**
```javascript
// next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true, // 301 redirect
      },
      {
        source: '/blog/:slug',
        destination: '/posts/:slug',
        permanent: false, // 302 redirect
      },
    ]
  },
}

// Restart dev server after changes
# Clear cache and rebuild
rm -rf .next
next dev
```

## Image Optimization Issues

### Image Not Loading

**Symptom:** Next.js Image component not displaying images

**Solutions:**
```typescript
// Add domain to next.config.js
module.exports = {
  images: {
    domains: ['example.com', 'cdn.example.com'],
    // Or use remotePatterns (recommended)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
    ],
  },
}

// Use correct Image component
import Image from 'next/image'

export default function Page() {
  return (
    <Image
      src="/image.jpg"
      alt="Description"
      width={500}
      height={300}
      // Or use fill for responsive
      fill
      style={{ objectFit: 'cover' }}
    />
  )
}
```

## Performance Issues

### Slow Build Times

**Diagnosis:**
```bash
# Check build output
next build --debug

# Check bundle size
next build --profile
```

**Solutions:**
```bash
# Use Turbopack
next dev --turbopack

# Enable SWC minification (default in Next.js 13+)
# next.config.js
module.exports = {
  swcMinify: true,
}

# Reduce build scope
next build --debug-build-paths="/blog/**"

# Increase memory
NODE_OPTIONS='--max-old-space-size=8192' next build
```

### Large Bundle Size

**Diagnosis:**
```bash
# Analyze bundle
ANALYZE=true next build

# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer
```

**Solutions:**
```typescript
// Use dynamic imports
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  ssr: false,
  loading: () => <p>Loading...</p>
})

// Use tree shaking
// Import only what you need
import { specific } from 'library' // Good
import * as library from 'library' // Bad

// Optimize images
import Image from 'next/image'

// Configure bundle size limits
// next.config.js
module.exports = {
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}
```

## Deployment Issues

### Environment Variables Not Working

**Symptom:** Environment variables undefined in production

**Solutions:**
```bash
# Check environment variables
next info

# Ensure proper naming
NEXT_PUBLIC_API_URL=https://api.example.com  # Client-side
DATABASE_URL=postgresql://...                 # Server-side only

# Restart after .env changes
# Environment variables are loaded at build time
npm run build
npm run start

# For Vercel
# Add environment variables in Vercel dashboard
# Project Settings > Environment Variables
```

### Build Works Locally But Fails in Production

**Solutions:**
```bash
# Test production build locally
npm run build
npm run start

# Check Node.js version
node --version
# Ensure it matches production environment

# Check for case-sensitive imports
# Linux/production is case-sensitive
import Component from './Component'  # Not './component'

# Check for missing dependencies
npm ci  # Clean install
```

## System Issues

### Clear Next.js Cache

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force

# Verify system info
next info
```

### Debugging Tools

```bash
# Enable verbose logging
next dev --debug

# Enable Node.js inspector
NODE_OPTIONS='--inspect' next dev

# Debug with breakpoints
NODE_OPTIONS='--inspect-brk' next dev

# Profile React performance
next build --profile

# Debug prerender errors
next build --debug-prerender
```

## Common Error Messages

### "Error: Text content does not match server-rendered HTML"

**Cause:** Hydration mismatch between server and client

**Solution:** Use `useEffect` for client-only rendering or `suppressHydrationWarning`

### "Error: Hydration failed because the initial UI does not match"

**Cause:** Different HTML structure between server and client

**Solution:** Ensure consistent rendering or use client components

### "Error: Objects are not valid as a React child"

**Cause:** Trying to render an object directly

**Solution:** Convert object to string or render specific properties

```typescript
// Bad
<div>{user}</div>

// Good
<div>{user.name}</div>
<div>{JSON.stringify(user)}</div>
```

### "Error: Failed to compile"

**Cause:** Syntax error or missing dependency

**Solution:** Check error message for specific line and fix syntax

### "Error: Maximum update depth exceeded"

**Cause:** Infinite render loop

**Solution:** Check `useEffect` dependencies and state updates

```typescript
// Bad - infinite loop
useEffect(() => {
  setCount(count + 1)
})

// Good - with dependency
useEffect(() => {
  // Run once on mount
}, [])
```
