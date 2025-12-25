# Database Indexes

Comprehensive guide to index design and optimization.

## Index Types

### B-tree (Default)

Best for: equality, range queries, sorting, LIKE prefix.

```sql
-- Simple index
CREATE INDEX idx_users_email ON users(email);

-- Range queries
CREATE INDEX idx_orders_date ON orders(created_at);

-- Supports: =, <, >, <=, >=, BETWEEN, IN, LIKE 'prefix%'
SELECT * FROM users WHERE email = 'user@example.com';
SELECT * FROM orders WHERE created_at > '2024-01-01';
SELECT * FROM users WHERE name LIKE 'John%';
```

### Hash

Best for: equality comparisons only (rarely better than B-tree).

```sql
CREATE INDEX idx_sessions_token ON sessions USING hash(token);

-- Only supports: =
SELECT * FROM sessions WHERE token = 'abc123';
```

### GIN (Generalized Inverted Index)

Best for: JSONB, arrays, full-text search.

```sql
-- JSONB index
CREATE INDEX idx_users_metadata ON users USING gin(metadata);

-- Query JSONB
SELECT * FROM users WHERE metadata @> '{"plan": "pro"}';

-- Array index
CREATE INDEX idx_posts_tags ON posts USING gin(tags);

-- Full-text search
CREATE INDEX idx_posts_search ON posts USING gin(to_tsvector('english', content));
```

### GiST (Generalized Search Tree)

Best for: geometric data, range types, full-text (less precise than GIN).

```sql
-- PostGIS geometry
CREATE INDEX idx_locations_geom ON locations USING gist(geometry);

-- Range types
CREATE INDEX idx_bookings_period ON bookings USING gist(period);
```

### BRIN (Block Range Index)

Best for: large tables with naturally ordered data (timestamps, sequences).

```sql
-- Huge audit log table
CREATE INDEX idx_audit_created ON audit_logs USING brin(created_at);

-- Very small index size, good for append-only tables
```

## Index Strategies

### Composite Indexes

Order matters: most selective column first.

```sql
-- Good: filters on status first (more selective)
CREATE INDEX idx_posts_status_date ON posts(status, created_at);

-- Supports:
-- WHERE status = 'published'
-- WHERE status = 'published' AND created_at > '...'

-- Does NOT support efficiently:
-- WHERE created_at > '...'  (can't skip first column)
```

### Covering Indexes

Include columns to enable index-only scans.

```sql
-- Query: SELECT id, title, status FROM posts WHERE author_id = ?
CREATE INDEX idx_posts_author_covering
    ON posts(author_id)
    INCLUDE (title, status);

-- All needed columns in index = no table lookup
```

### Partial Indexes

Index only relevant rows.

```sql
-- Only index published posts
CREATE INDEX idx_posts_published
    ON posts(published_at)
    WHERE status = 'published' AND deleted_at IS NULL;

-- Only index active users
CREATE INDEX idx_users_active_email
    ON users(email)
    WHERE deleted_at IS NULL;

-- Smaller index, faster queries on filtered data
```

### Unique Indexes

Enforce uniqueness and improve lookups.

```sql
-- Unique constraint creates index automatically
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Or create directly
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Conditional uniqueness
CREATE UNIQUE INDEX idx_users_active_email
    ON users(email)
    WHERE deleted_at IS NULL;
```

### Expression Indexes

Index computed values.

```sql
-- Case-insensitive search
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- Query: WHERE LOWER(email) = 'user@example.com'

-- JSONB path
CREATE INDEX idx_users_plan ON users((metadata->>'plan'));

-- Date part
CREATE INDEX idx_orders_year ON orders(EXTRACT(YEAR FROM created_at));
```

## Common Patterns

### Foreign Keys

Always index foreign keys for JOINs.

```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    author_id UUID REFERENCES users(id),
    category_id UUID REFERENCES categories(id)
);

-- Index foreign keys
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
```

### Soft Delete

Partial indexes for active records.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT,
    deleted_at TIMESTAMPTZ
);

-- Only index active users
CREATE INDEX idx_users_email_active
    ON users(email)
    WHERE deleted_at IS NULL;
```

### Full-Text Search

```sql
-- Add search vector column
ALTER TABLE posts ADD COLUMN search_vector tsvector;

-- Populate and maintain with trigger
CREATE INDEX idx_posts_fts ON posts USING gin(search_vector);

-- Query
SELECT * FROM posts
WHERE search_vector @@ to_tsquery('english', 'database & design');
```

### Pagination

```sql
-- Cursor-based pagination (better than OFFSET)
CREATE INDEX idx_posts_cursor ON posts(created_at DESC, id DESC);

-- Query
SELECT * FROM posts
WHERE (created_at, id) < ($last_created_at, $last_id)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

## Analysis & Monitoring

### Check Index Usage

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Find Unused Indexes

```sql
SELECT
    schemaname || '.' || relname as table,
    indexrelname as index,
    pg_size_pretty(pg_relation_size(i.indexrelid)) as size,
    idx_scan as scans
FROM pg_stat_user_indexes ui
JOIN pg_index i ON ui.indexrelid = i.indexrelid
WHERE NOT indisunique
  AND idx_scan < 50
ORDER BY pg_relation_size(i.indexrelid) DESC;
```

### Find Missing Indexes

```sql
SELECT
    relname as table,
    seq_scan,
    seq_tup_read,
    idx_scan,
    n_live_tup as rows
FROM pg_stat_user_tables
WHERE seq_scan > 1000
  AND n_live_tup > 10000
ORDER BY seq_tup_read DESC;
```

### Explain Analyze

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM posts
WHERE status = 'published'
  AND author_id = 'uuid-here'
ORDER BY created_at DESC
LIMIT 20;
```

## Maintenance

```sql
-- Rebuild bloated index
REINDEX INDEX CONCURRENTLY idx_posts_author;

-- Rebuild all indexes on table
REINDEX TABLE CONCURRENTLY posts;

-- Update statistics
ANALYZE posts;
```

## Best Practices

| Do | Don't |
|----|-------|
| Index foreign keys | Index every column |
| Use partial indexes | Create overlapping indexes |
| Monitor usage regularly | Ignore bloated indexes |
| Start with fewer indexes | Over-index initially |
| Profile before adding | Guess at needed indexes |
| Consider write impact | Forget write overhead |

## Decision Matrix

| Query Pattern | Recommended Index |
|--------------|-------------------|
| `WHERE col = value` | B-tree (default) |
| `WHERE col > value` | B-tree |
| `WHERE col LIKE 'prefix%'` | B-tree |
| `WHERE col LIKE '%suffix'` | GIN trigram |
| `WHERE jsonb @> '{}'` | GIN |
| `WHERE array && ARRAY[]` | GIN |
| `WHERE tsv @@ query` | GIN |
| Large table, ordered data | BRIN |
| Geometry/spatial | GiST |
