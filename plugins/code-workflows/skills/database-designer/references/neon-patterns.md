# Neon Design Patterns

Common patterns for Neon serverless PostgreSQL.

## Overview

Neon is a serverless PostgreSQL platform with unique features:

- **Scale-to-zero**: No compute charges when idle
- **Database branching**: Instant copies for dev/preview
- **Serverless driver**: HTTP-based queries, no persistent connections
- **Autoscaling**: Automatic compute scaling
- **Point-in-time recovery**: Branch from any point in history

## Connection Patterns

### HTTP Driver (Serverless)

Best for: Edge functions, serverless, low-frequency queries.

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// Simple queries
const users = await db.select().from(users);
```

### WebSocket Pooling

Best for: High-frequency queries, long-running processes.

```typescript
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

// Cleanup on shutdown
process.on("SIGTERM", () => pool.end());
```

### Connection String Types

```bash
# Direct connection (for migrations)
postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/dbname

# Pooled connection (for application queries)
postgresql://user:pass@ep-cool-name-123456-pooler.us-east-2.aws.neon.tech/dbname
```

## Branching Patterns

### Development Branches

```bash
# Create dev branch via CLI
neonctl branches create --name dev/feature-xyz --project-id $PROJECT_ID

# Get connection string
neonctl connection-string dev/feature-xyz --project-id $PROJECT_ID
```

### Preview Environments

```typescript
// Create branch for PR
async function createPreviewBranch(prNumber: number) {
  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${PROJECT_ID}/branches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NEON_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        branch: { name: `preview/pr-${prNumber}` },
        endpoints: [{ type: "read_write" }],
      }),
    }
  );

  return response.json();
}
```

### GitHub Actions Integration

```yaml
name: Preview Database
on:
  pull_request:
    types: [opened, synchronize, closed]

jobs:
  create-db:
    if: github.event.action != 'closed'
    runs-on: ubuntu-latest
    steps:
      - uses: neondatabase/create-branch-action@v5
        id: branch
        with:
          project_id: ${{ secrets.NEON_PROJECT_ID }}
          api_key: ${{ secrets.NEON_API_KEY }}
          branch_name: preview/pr-${{ github.event.number }}

      - name: Run migrations
        run: DATABASE_URL="${{ steps.branch.outputs.db_url }}" npx drizzle-kit migrate

  delete-db:
    if: github.event.action == 'closed'
    runs-on: ubuntu-latest
    steps:
      - uses: neondatabase/delete-branch-action@v3
        with:
          project_id: ${{ secrets.NEON_PROJECT_ID }}
          api_key: ${{ secrets.NEON_API_KEY }}
          branch: preview/pr-${{ github.event.number }}
```

### Point-in-Time Recovery

```typescript
// Create branch from specific timestamp
async function restoreFromPoint(timestamp: Date, branchName: string) {
  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${PROJECT_ID}/branches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NEON_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        branch: {
          name: branchName,
          parent_id: "main-branch-id",
          parent_timestamp: timestamp.toISOString(),
        },
      }),
    }
  );

  return response.json();
}
```

## Framework Integration

### Next.js App Router

```typescript
// app/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql);
}

// app/users/page.tsx
import { getDb } from "@/app/db";
import { users } from "@/db/schema";

export default async function UsersPage() {
  const db = getDb();
  const allUsers = await db.select().from(users);
  return <UserList users={allUsers} />;
}
```

### Vercel Edge Functions

```typescript
// app/api/users/route.ts
export const runtime = "edge";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const users = await db.select().from(users);
  return Response.json(users);
}
```

### Cloudflare Workers

```typescript
// src/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const sql = neon(env.DATABASE_URL);
    const db = drizzle(sql);

    const users = await db.select().from(users);
    return Response.json(users);
  },
};
```

## Migration Patterns

### Safe Migration Workflow

```typescript
async function safeMigration() {
  // 1. Create test branch
  const testBranch = await createBranch("migration-test");

  try {
    // 2. Run migrations on test branch
    await runMigrations(testBranch.connectionString);

    // 3. Verify
    await verifySchema(testBranch.connectionString);

    // 4. Run on main
    await runMigrations(process.env.DATABASE_URL);
  } finally {
    // 5. Cleanup
    await deleteBranch(testBranch.id);
  }
}
```

### Drizzle Migrations

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

```bash
# Generate migration
npx drizzle-kit generate

# Apply migration
npx drizzle-kit migrate

# Push changes (dev only)
npx drizzle-kit push
```

### Zero-Downtime Migrations

```sql
-- 1. Expand: Add new column (nullable)
ALTER TABLE users ADD COLUMN display_name TEXT;

-- 2. Backfill
UPDATE users SET display_name = name WHERE display_name IS NULL;

-- 3. Deploy code that uses both columns

-- 4. Contract: Remove old column (separate migration)
ALTER TABLE users DROP COLUMN name;
```

## Performance Optimization

### Connection Pooling

```typescript
// Use pooled connection string for applications
const pooledUrl = process.env.DATABASE_URL!.replace(
  /(@ep-[^.]+)(\.)/, // Find endpoint
  "$1-pooler$2"      // Add -pooler
);

const pool = new Pool({ connectionString: pooledUrl });
```

### Query Optimization

```typescript
// Batch queries in single request
const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: {
    // Cache for read-heavy queries
    cache: "force-cache",
  },
});

// Use transactions for multiple writes
await db.transaction(async (tx) => {
  await tx.insert(users).values({ name: "Alice" });
  await tx.insert(profiles).values({ userId: "...", bio: "..." });
});
```

### Caching Strategies

```typescript
// Next.js caching
import { unstable_cache } from "next/cache";

const getUsers = unstable_cache(
  async () => {
    const db = getDb();
    return db.select().from(users);
  },
  ["users"],
  { revalidate: 60 } // Cache for 60 seconds
);
```

## Cost Optimization

### Scale-to-Zero

- Neon automatically scales compute to zero after inactivity
- First query after idle has ~500ms cold start
- Use connection pooling to minimize cold starts

### Compute Hours

```typescript
// Monitor usage
async function getProjectUsage() {
  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${PROJECT_ID}/consumption`,
    {
      headers: { Authorization: `Bearer ${NEON_API_KEY}` },
    }
  );

  return response.json();
}
```

### Branch Cleanup

```typescript
// Cleanup old preview branches
async function cleanupOldBranches(maxAgeDays: number = 7) {
  const { branches } = await listBranches();

  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

  for (const branch of branches) {
    if (
      branch.name.startsWith("preview/") &&
      new Date(branch.created_at).getTime() < cutoff
    ) {
      await deleteBranch(branch.id);
    }
  }
}
```

## Monitoring

### Health Check

```typescript
async function healthCheck() {
  const start = Date.now();
  const sql = neon(process.env.DATABASE_URL!);

  try {
    await sql`SELECT 1`;
    return {
      healthy: true,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
    };
  }
}
```

### Query Logging

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: {
    // Add request timing
  },
});

// Log slow queries
async function queryWithLogging<T>(
  query: () => Promise<T>,
  label: string
): Promise<T> {
  const start = Date.now();
  const result = await query();
  const duration = Date.now() - start;

  if (duration > 1000) {
    console.warn(`Slow query [${label}]: ${duration}ms`);
  }

  return result;
}
```

## Best Practices

| Do | Don't |
|----|-------|
| Use pooled connections for apps | Open new connections per query |
| Create branches for previews | Run migrations on production directly |
| Use HTTP driver for serverless | Use pg driver in edge functions |
| Clean up old branches | Leave preview branches indefinitely |
| Cache read-heavy queries | Fetch same data repeatedly |
| Use transactions for writes | Make multiple round trips |

## Comparison with Other Platforms

| Feature | Neon | Supabase | Railway |
|---------|------|----------|---------|
| Scale-to-zero | Yes | No | No |
| Branching | Yes | No | No |
| Serverless driver | Yes | No | No |
| Built-in auth | No | Yes | No |
| Realtime | No | Yes | No |
| Storage | No | Yes | No |
| Cold start | ~500ms | N/A | N/A |
| Free tier | Generous | Generous | Limited |
