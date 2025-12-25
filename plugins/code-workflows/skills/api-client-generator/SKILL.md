---
name: api-client-generator
description: Generate type-safe API clients from OpenAPI/Swagger specifications or API documentation. Use when users need to create TypeScript or Python API clients with Zod/Pydantic validation, retry logic, error handling, and proper typing. Supports REST APIs, generates from OpenAPI specs or manual endpoint definitions.
---

# API Client Generator

Generate production-ready, type-safe API clients for TypeScript or Python.

## Decision Tree

```
User request → What source?
    │
    ├─ OpenAPI/Swagger spec → Auto-generate from spec
    │   ├─ TypeScript → openapi-typescript + zod
    │   └─ Python → openapi-python-client
    │
    ├─ API documentation URL → Fetch and analyze
    │   └─ Extract endpoints → Generate manually
    │
    └─ Manual endpoint list → Generate from scratch
        ├─ TypeScript → See assets/typescript/
        └─ Python → See assets/python/

What HTTP client?
    │
    ├─ TypeScript
    │   ├─ fetch (native) → Recommended for browser/edge
    │   ├─ ky → Fetch wrapper with retry
    │   └─ axios → Node.js with interceptors
    │
    └─ Python
        ├─ httpx → Async + sync, recommended
        ├─ aiohttp → Async only
        └─ requests → Sync only, legacy
```

## Quick Start

### From OpenAPI Spec (TypeScript)

```bash
# Install generators
pnpm add -D openapi-typescript openapi-fetch

# Generate types
pnpm openapi-typescript ./openapi.yaml -o ./src/api/schema.d.ts

# Use with openapi-fetch
pnpm add openapi-fetch
```

```typescript
import createClient from "openapi-fetch";
import type { paths } from "./schema";

const client = createClient<paths>({ baseUrl: "https://api.example.com" });

const { data, error } = await client.GET("/users/{id}", {
  params: { path: { id: "123" } },
});
```

### From OpenAPI Spec (Python)

```bash
# Install generator
pip install openapi-python-client

# Generate client
openapi-python-client generate --url https://api.example.com/openapi.json
```

### Manual Generation

Use templates from `assets/` directory and customize:

1. Copy base client template
2. Define endpoints and types
3. Add authentication
4. Configure retry logic

## Template Selection Guide

### TypeScript

| Use Case | Template | HTTP Client |
|----------|----------|-------------|
| Browser/Edge | `fetch-client.ts` | Native fetch |
| Node.js | `ky-client.ts` | ky |
| Legacy/Interceptors | `axios-client.ts` | axios |
| Full-featured | `complete-client.ts` | ky + zod |

### Python

| Use Case | Template | HTTP Client |
|----------|----------|-------------|
| Modern async/sync | `httpx-client.py` | httpx |
| Async only | `aiohttp-client.py` | aiohttp |
| Simple sync | `requests-client.py` | requests |
| Full-featured | `complete-client.py` | httpx + pydantic |

## Features to Include

### Required

- Type-safe request/response
- Error handling with typed errors
- Authentication (API key, Bearer, OAuth)
- Base URL configuration

### Recommended

- Retry logic with exponential backoff
- Request/response logging
- Timeout configuration
- Rate limiting

### Optional

- Request caching
- Request deduplication
- Offline support
- Metrics/telemetry

## Client Architecture

```
api/
├── client.ts              # Main client class
├── types.ts               # Request/response types
├── schemas.ts             # Zod/Pydantic schemas
├── errors.ts              # Custom error classes
├── endpoints/
│   ├── users.ts           # /users endpoints
│   ├── posts.ts           # /posts endpoints
│   └── index.ts           # Export all
└── utils/
    ├── retry.ts           # Retry logic
    ├── auth.ts            # Auth helpers
    └── logger.ts          # Request logging
```

## Reference Files

- **OpenAPI Parsing**: See [references/openapi.md](references/openapi.md)
- **Retry Patterns**: See [references/retry-patterns.md](references/retry-patterns.md)
- **Error Handling**: See [references/error-handling.md](references/error-handling.md)
- **Authentication**: See [references/authentication.md](references/authentication.md)

## Best Practices

1. **Validate responses**: Use Zod/Pydantic even with OpenAPI types
2. **Type errors**: Create specific error classes per API error
3. **Retry idempotent**: Only retry GET, PUT, DELETE (not POST)
4. **Log requests**: In development, optionally in production
5. **Handle rate limits**: Respect Retry-After headers
6. **Version clients**: Match API versions
7. **Test with mocks**: Use MSW (TS) or responses (Python)
