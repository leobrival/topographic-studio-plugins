# Database Migrations

Guide to managing database schema changes safely.

## Migration Tools

### Drizzle Kit

```bash
# Install
npm install drizzle-kit -D

# Generate migration
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Push changes (dev only)
npx drizzle-kit push

# Open studio
npx drizzle-kit studio
```

**drizzle.config.ts:**

```typescript
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

### Prisma Migrate

```bash
# Create migration
npx prisma migrate dev --name add_users_table

# Apply in production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Generate client
npx prisma generate
```

### Raw SQL Migrations

```bash
# Using golang-migrate
migrate create -ext sql -dir migrations -seq add_users_table

# Apply
migrate -path migrations -database $DATABASE_URL up

# Rollback
migrate -path migrations -database $DATABASE_URL down 1
```

## Migration Best Practices

### File Naming

```
migrations/
├── 0001_create_users.sql
├── 0002_add_posts_table.sql
├── 0003_add_user_email_index.sql
├── 0004_add_comments.sql
└── 0005_add_organizations.sql
```

### Migration Structure

```sql
-- migrations/0001_create_users.sql

-- UP
BEGIN;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

COMMIT;

-- DOWN (in separate file or commented)
-- DROP TABLE users;
```

### Safe Migrations

**1. Add columns as nullable first:**

```sql
-- Step 1: Add nullable column
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- Step 2: Backfill data
UPDATE users SET avatar_url = 'default.png' WHERE avatar_url IS NULL;

-- Step 3: Add NOT NULL (separate migration)
ALTER TABLE users ALTER COLUMN avatar_url SET NOT NULL;
```

**2. Add indexes concurrently:**

```sql
-- Won't lock the table
CREATE INDEX CONCURRENTLY idx_posts_author ON posts(author_id);
```

**3. Rename with caution:**

```sql
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN display_name TEXT;

-- Step 2: Copy data
UPDATE users SET display_name = name;

-- Step 3: Update application to use new column
-- Step 4: Drop old column (later migration)
ALTER TABLE users DROP COLUMN name;
```

**4. Change column type safely:**

```sql
-- Create new column
ALTER TABLE orders ADD COLUMN total_v2 DECIMAL(12,2);

-- Copy and convert data
UPDATE orders SET total_v2 = total::DECIMAL(12,2);

-- Swap columns
ALTER TABLE orders
    DROP COLUMN total,
    RENAME COLUMN total_v2 TO total;
```

## Common Operations

### Adding Tables

```sql
BEGIN;

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON posts(author_id);

COMMIT;
```

### Adding Columns

```sql
-- Simple addition
ALTER TABLE users ADD COLUMN bio TEXT;

-- With default (careful on large tables)
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'member';

-- With constraint
ALTER TABLE users ADD COLUMN age INT CHECK (age >= 0);
```

### Modifying Columns

```sql
-- Change type
ALTER TABLE products ALTER COLUMN price TYPE DECIMAL(12,2);

-- Add NOT NULL
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Remove NOT NULL
ALTER TABLE users ALTER COLUMN bio DROP NOT NULL;

-- Change default
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'guest';
```

### Dropping Objects

```sql
-- Drop column
ALTER TABLE users DROP COLUMN IF EXISTS legacy_field;

-- Drop table
DROP TABLE IF EXISTS old_table CASCADE;

-- Drop index
DROP INDEX IF EXISTS idx_old_index;

-- Drop constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_unique;
```

### Adding Constraints

```sql
-- Primary key
ALTER TABLE posts ADD PRIMARY KEY (id);

-- Foreign key
ALTER TABLE posts
    ADD CONSTRAINT fk_posts_author
    FOREIGN KEY (author_id) REFERENCES users(id);

-- Unique
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Check
ALTER TABLE products ADD CONSTRAINT products_price_positive CHECK (price > 0);
```

### Creating Enums

```sql
-- Create enum
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');

-- Use in table
ALTER TABLE posts ADD COLUMN status post_status DEFAULT 'draft';

-- Add value to enum (PostgreSQL 10+)
ALTER TYPE post_status ADD VALUE 'scheduled' AFTER 'draft';
```

## Zero-Downtime Migrations

### Expand-Contract Pattern

```
Phase 1: Expand (add new structure)
Phase 2: Migrate (copy data, update code)
Phase 3: Contract (remove old structure)
```

**Example: Rename column**

```sql
-- Phase 1: Add new column
ALTER TABLE users ADD COLUMN full_name TEXT;

-- Phase 2: Sync data (trigger or application)
UPDATE users SET full_name = name WHERE full_name IS NULL;

-- Phase 3: Remove old column (after code deployed)
ALTER TABLE users DROP COLUMN name;
```

### Online Schema Changes

For large tables, use:

- **PostgreSQL**: `pg_repack`, online ALTER
- **MySQL**: `pt-online-schema-change`, `gh-ost`

```bash
# pg_repack for bloated tables
pg_repack -d mydb -t large_table
```

## Rollback Strategies

### Forward-Only

Prefer forward migrations that fix issues:

```sql
-- Instead of rollback, create fix migration
-- 0006_fix_user_defaults.sql

ALTER TABLE users ALTER COLUMN role SET DEFAULT 'member';
UPDATE users SET role = 'member' WHERE role IS NULL;
```

### Reversible Migrations

Include down migrations for critical changes:

```sql
-- migrations/0005_add_posts_table.up.sql
CREATE TABLE posts (...);

-- migrations/0005_add_posts_table.down.sql
DROP TABLE posts;
```

## Testing Migrations

### Local Testing

```bash
# Create test database
createdb myapp_test

# Run migrations
DATABASE_URL=postgres://localhost/myapp_test npx drizzle-kit migrate

# Verify
psql myapp_test -c "\dt"

# Cleanup
dropdb myapp_test
```

### CI Pipeline

```yaml
# .github/workflows/test-migrations.yml
jobs:
  test:
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx drizzle-kit migrate
        env:
          DATABASE_URL: postgres://postgres:test@localhost/test
```

## Checklist

Before running migrations:

- [ ] Backup database
- [ ] Test on staging
- [ ] Review for locking operations
- [ ] Plan rollback strategy
- [ ] Schedule during low traffic
- [ ] Monitor after deployment

After running migrations:

- [ ] Verify schema changes
- [ ] Check application health
- [ ] Monitor query performance
- [ ] Update documentation
