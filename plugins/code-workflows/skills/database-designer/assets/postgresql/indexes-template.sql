-- Index Optimization Templates
-- Best practices for PostgreSQL index design

-- ============================================
-- Basic Index Types
-- ============================================

-- B-tree (default, most common)
-- Best for: equality, range queries, sorting
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- Unique index (enforces uniqueness)
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Partial index (index subset of rows)
-- Best for: filtering frequently queried subsets
CREATE INDEX idx_posts_published
    ON posts(published_at)
    WHERE status = 'published' AND deleted_at IS NULL;

CREATE INDEX idx_users_active
    ON users(email)
    WHERE deleted_at IS NULL;

-- Covering index (include columns for index-only scans)
CREATE INDEX idx_posts_author_covering
    ON posts(author_id)
    INCLUDE (title, status, published_at);

-- ============================================
-- Composite Indexes
-- ============================================

-- Order matters: most selective first, then by query pattern
CREATE INDEX idx_posts_status_author
    ON posts(status, author_id);

-- For queries like: WHERE status = 'published' AND author_id = ?
-- Also works for: WHERE status = 'published' (left prefix)
-- Does NOT work for: WHERE author_id = ? (skips first column)

-- Multi-column with sorting
CREATE INDEX idx_posts_author_date
    ON posts(author_id, created_at DESC);

-- ============================================
-- Specialized Index Types
-- ============================================

-- Hash index (equality only, smaller than B-tree)
-- Use sparingly - B-tree usually better
CREATE INDEX idx_sessions_token_hash
    ON sessions USING hash(token);

-- GIN index (for JSONB, arrays, full-text)
CREATE INDEX idx_users_metadata_gin
    ON users USING gin(metadata);

-- Search within JSONB
CREATE INDEX idx_users_metadata_path
    ON users USING gin((metadata -> 'preferences'));

-- GiST index (for geometric, range types)
-- CREATE INDEX idx_locations_point ON locations USING gist(coordinates);

-- BRIN index (for large tables with natural ordering)
-- Much smaller than B-tree, good for append-only data
CREATE INDEX idx_audit_logs_created_brin
    ON audit_logs USING brin(created_at);

-- ============================================
-- Full-Text Search Indexes
-- ============================================

-- Create tsvector column for FTS
ALTER TABLE posts ADD COLUMN search_vector tsvector;

-- Update search vector
UPDATE posts SET search_vector =
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C');

-- Create GIN index on tsvector
CREATE INDEX idx_posts_search ON posts USING gin(search_vector);

-- Trigger to keep search_vector updated
CREATE OR REPLACE FUNCTION posts_search_trigger()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.excerpt, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.content, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_search_update
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION posts_search_trigger();

-- ============================================
-- Index Analysis Queries
-- ============================================

-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find unused indexes
SELECT
    schemaname || '.' || relname AS table,
    indexrelname AS index,
    pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
    idx_scan as index_scans
FROM pg_stat_user_indexes ui
JOIN pg_index i ON ui.indexrelid = i.indexrelid
WHERE NOT indisunique
    AND idx_scan < 50
    AND pg_relation_size(relid) > 5 * 8192
ORDER BY pg_relation_size(i.indexrelid) DESC;

-- Find missing indexes (sequential scans on large tables)
SELECT
    schemaname,
    relname,
    seq_scan,
    seq_tup_read,
    idx_scan,
    n_live_tup,
    pg_size_pretty(pg_relation_size(relid)) as table_size
FROM pg_stat_user_tables
WHERE seq_scan > 0
    AND n_live_tup > 10000
ORDER BY seq_tup_read DESC
LIMIT 20;

-- Check index bloat
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan,
    idx_tup_read
FROM pg_stat_user_indexes
WHERE pg_relation_size(indexrelid) > 1024 * 1024  -- > 1MB
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================
-- Index Maintenance
-- ============================================

-- Rebuild bloated indexes
REINDEX INDEX CONCURRENTLY idx_posts_author_id;

-- Rebuild all indexes on a table
REINDEX TABLE CONCURRENTLY posts;

-- Analyze table to update statistics
ANALYZE posts;

-- ============================================
-- Best Practices
-- ============================================

/*
1. Index foreign keys
   - Always index FK columns used in JOINs
   - Example: posts.author_id should be indexed

2. Index WHERE clause columns
   - Columns frequently used in WHERE conditions
   - Most selective columns first in composite indexes

3. Consider covering indexes
   - Include columns from SELECT to enable index-only scans
   - Trades disk space for query performance

4. Use partial indexes
   - When queries filter to specific subsets
   - Saves space and improves performance

5. Monitor and remove unused indexes
   - Unused indexes slow down writes
   - Run analysis queries regularly

6. Order composite index columns wisely
   - Most selective first
   - Consider query patterns (left-prefix rule)

7. Use appropriate index types
   - B-tree: default, works for most cases
   - GIN: JSONB, arrays, full-text search
   - BRIN: large, naturally ordered tables
   - Hash: equality-only, rarely better than B-tree

8. Don't over-index
   - Each index slows down INSERT/UPDATE/DELETE
   - Balance read vs write performance
*/
