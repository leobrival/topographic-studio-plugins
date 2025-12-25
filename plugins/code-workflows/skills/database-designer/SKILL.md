---
name: database-designer
description: Design database schemas for PostgreSQL, Neon, Convex, or Supabase. Use when users need to create tables, define relationships, plan migrations, optimize indexes, or implement data models. Covers normalization, denormalization strategies, and platform-specific features.
---

# Database Designer

Design robust, scalable database schemas for modern applications.

## Decision Tree

```
User request → Which platform?
    │
    ├─ PostgreSQL (Traditional SQL)
    │   ├─ Hosting?
    │   │   ├─ Neon → Serverless, branching, scale-to-zero
    │   │   ├─ Supabase → BaaS, realtime, auth
    │   │   ├─ Railway → Simple deployment
    │   │   ├─ Vercel Postgres → Edge-optimized
    │   │   └─ Self-hosted → Full control
    │   │
    │   ├─ ORM?
    │   │   ├─ Drizzle → Type-safe, lightweight
    │   │   ├─ Prisma → Full-featured, migrations
    │   │   ├─ Kysely → Type-safe query builder
    │   │   └─ Raw SQL → Maximum control
    │   │
    │   └─ What to design?
    │       ├─ Schema → Tables, columns, types
    │       ├─ Relations → FK, joins, constraints
    │       ├─ Indexes → Performance optimization
    │       └─ Migrations → Version control
    │
    ├─ Neon (Serverless PostgreSQL)
    │   ├─ Branching → Dev/preview environments
    │   ├─ Scale-to-zero → Cost optimization
    │   ├─ Pooling → Connection management
    │   └─ Extensions → Full PostgreSQL support
    │
    ├─ Convex (Serverless NoSQL)
    │   ├─ Schema → TypeScript validators
    │   ├─ Indexes → Query optimization
    │   ├─ Relations → Document references
    │   └─ Functions → Queries, mutations
    │
    └─ Supabase (PostgreSQL + BaaS)
        ├─ Tables → SQL + Dashboard
        ├─ RLS → Row Level Security policies
        ├─ Triggers → Automatic actions
        ├─ Functions → PL/pgSQL
        └─ Realtime → Live subscriptions
```

## Quick Start

### PostgreSQL with Drizzle

```typescript
// schema.ts
import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content"),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Convex

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"]),

  posts: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    authorId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_author", ["authorId"]),
});
```

### Supabase

```sql
-- Create tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);
```

### Neon

```typescript
// drizzle.config.ts for Neon
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Neon connection string
  },
});
```

```typescript
// db.ts - Neon serverless driver
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// For connection pooling (recommended for serverless)
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

## Platform Selection Guide

| Need | Platform | Why |
|------|----------|-----|
| Type-safe serverless | Convex | Built-in TypeScript, reactive |
| Serverless PostgreSQL | Neon | Scale-to-zero, branching, fast cold starts |
| Full PostgreSQL features | Neon/Supabase | Standard SQL, extensions |
| Auth + Storage + DB | Supabase | All-in-one BaaS |
| Complex queries | PostgreSQL | JOINs, CTEs, window functions |
| Real-time sync | Convex or Supabase | Built-in subscriptions |
| Document-style data | Convex | Flexible schema |
| Relational data | PostgreSQL/Supabase/Neon | Strong consistency |
| Rapid prototyping | Convex | Zero config, instant |
| Preview environments | Neon | Database branching |
| Cost optimization | Neon | Scale-to-zero billing |

## Common Patterns

### User + Profile (1:1)

```typescript
// Drizzle
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
});

export const profiles = pgTable("profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
});
```

### Posts + Tags (M:N)

```typescript
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
});

export const postTags = pgTable("post_tags", {
  postId: uuid("post_id").references(() => posts.id).notNull(),
  tagId: uuid("tag_id").references(() => tags.id).notNull(),
}, (t) => ({
  pk: primaryKey(t.postId, t.tagId),
}));
```

### Soft Delete

```typescript
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Query active posts
const activePosts = await db
  .select()
  .from(posts)
  .where(isNull(posts.deletedAt));
```

### Audit Trail

```typescript
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tableName: text("table_name").notNull(),
  recordId: uuid("record_id").notNull(),
  action: text("action").notNull(), // INSERT, UPDATE, DELETE
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

## Reference Files

- **PostgreSQL Schemas**: See [references/postgresql-patterns.md](references/postgresql-patterns.md)
- **Neon Setup**: See [references/neon-patterns.md](references/neon-patterns.md)
- **Convex Schemas**: See [references/convex-patterns.md](references/convex-patterns.md)
- **Supabase Setup**: See [references/supabase-patterns.md](references/supabase-patterns.md)
- **Normalization**: See [references/normalization.md](references/normalization.md)
- **Indexes**: See [references/indexes.md](references/indexes.md)
- **Migrations**: See [references/migrations.md](references/migrations.md)

## Best Practices

1. **Start normalized**: Denormalize only when needed for performance
2. **Use UUIDs**: Better for distributed systems than auto-increment
3. **Add timestamps**: `created_at`, `updated_at` on every table
4. **Index foreign keys**: Always index columns used in JOINs
5. **Soft delete**: Consider `deleted_at` instead of hard deletes
6. **Naming conventions**: snake_case for SQL, camelCase for Convex
7. **Constraints**: Use CHECK, UNIQUE, NOT NULL appropriately
8. **Document relationships**: ERD diagrams for complex schemas
