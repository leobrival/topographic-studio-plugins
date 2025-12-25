# PostgreSQL Design Patterns

Common patterns for PostgreSQL database design.

## Table Design

### Standard Table Template

```sql
CREATE TABLE resource_name (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core fields
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    -- Foreign keys
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_resource_owner ON resource_name(owner_id);
CREATE INDEX idx_resource_slug ON resource_name(slug);
CREATE INDEX idx_resource_created ON resource_name(created_at);

-- Updated_at trigger
CREATE TRIGGER update_resource_updated_at
    BEFORE UPDATE ON resource_name
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### UUID vs Serial

```sql
-- UUID (recommended for most cases)
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Serial (legacy, use for specific cases)
id SERIAL PRIMARY KEY

-- ULID (sortable UUID alternative)
-- Requires extension or application-generated
```

## Soft Delete Pattern

```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- Partial index for active records
CREATE INDEX idx_posts_active ON posts(id) WHERE deleted_at IS NULL;

-- View for active records
CREATE VIEW active_posts AS
SELECT * FROM posts WHERE deleted_at IS NULL;

-- Soft delete function
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    NEW.deleted_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Audit Trail Pattern

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_changed_at ON audit_logs(changed_at);

-- Generic audit trigger
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END,
        current_setting('app.current_user_id', TRUE)::UUID
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply to table
CREATE TRIGGER audit_posts
    AFTER INSERT OR UPDATE OR DELETE ON posts
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

## Versioning Pattern

```sql
-- Main table (current version)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    version INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Version history
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version INT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE (document_id, version)
);

-- Auto-version trigger
CREATE OR REPLACE FUNCTION version_document()
RETURNS TRIGGER AS $$
BEGIN
    -- Save current version to history
    INSERT INTO document_versions (document_id, version, title, content, created_by)
    VALUES (OLD.id, OLD.version, OLD.title, OLD.content, current_setting('app.current_user_id', TRUE)::UUID);

    -- Increment version
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER version_documents
    BEFORE UPDATE ON documents
    FOR EACH ROW
    WHEN (OLD.content IS DISTINCT FROM NEW.content)
    EXECUTE FUNCTION version_document();
```

## Multi-Tenancy Patterns

### Schema-per-Tenant

```sql
-- Create tenant schema
CREATE SCHEMA tenant_acme;

-- Create tables in schema
CREATE TABLE tenant_acme.users (...);
CREATE TABLE tenant_acme.posts (...);

-- Set search path per request
SET search_path TO tenant_acme, public;
```

### Row-Level Security

```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    title TEXT NOT NULL
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON posts
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- Set tenant context
SET app.tenant_id = 'tenant-uuid';
```

### Discriminator Column

```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    title TEXT NOT NULL
);

CREATE INDEX idx_posts_org ON posts(organization_id);

-- Always filter by org
SELECT * FROM posts WHERE organization_id = $1;
```

## JSONB Patterns

### Flexible Metadata

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    attributes JSONB DEFAULT '{}'
);

-- GIN index for queries
CREATE INDEX idx_products_attrs ON products USING gin(attributes);

-- Query JSONB
SELECT * FROM products WHERE attributes @> '{"color": "red"}';
SELECT * FROM products WHERE attributes->>'size' = 'large';
SELECT * FROM products WHERE attributes ? 'warranty';
```

### Settings Storage

```sql
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    settings JSONB DEFAULT '{}'
);

-- Merge settings
UPDATE user_settings
SET settings = settings || '{"theme": "dark"}'
WHERE user_id = $1;

-- Get with defaults
SELECT COALESCE(settings->>'theme', 'light') as theme
FROM user_settings
WHERE user_id = $1;
```

## Tree/Hierarchy Patterns

### Adjacency List

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES categories(id)
);

-- Recursive query
WITH RECURSIVE tree AS (
    SELECT id, name, parent_id, 0 as depth
    FROM categories WHERE parent_id IS NULL
    UNION ALL
    SELECT c.id, c.name, c.parent_id, t.depth + 1
    FROM categories c
    JOIN tree t ON c.parent_id = t.id
)
SELECT * FROM tree;
```

### Materialized Path

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL  -- '/root/parent/child'
);

CREATE INDEX idx_categories_path ON categories USING btree(path);

-- Find descendants
SELECT * FROM categories WHERE path LIKE '/electronics/%';

-- Find ancestors
SELECT * FROM categories
WHERE '/electronics/phones/iphone' LIKE path || '%'
ORDER BY path;
```

### Nested Sets

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    lft INT NOT NULL,
    rgt INT NOT NULL
);

CREATE INDEX idx_categories_nested ON categories(lft, rgt);

-- Find descendants
SELECT * FROM categories
WHERE lft > $parent_lft AND rgt < $parent_rgt;

-- Find ancestors
SELECT * FROM categories
WHERE lft < $child_lft AND rgt > $child_rgt;
```

## Full-Text Search

```sql
CREATE TABLE articles (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT,
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(body, '')), 'B')
    ) STORED
);

CREATE INDEX idx_articles_search ON articles USING gin(search_vector);

-- Search
SELECT id, title,
       ts_rank(search_vector, query) as rank
FROM articles,
     plainto_tsquery('english', 'database design') query
WHERE search_vector @@ query
ORDER BY rank DESC;
```

## Temporal Data

### Event Sourcing

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type TEXT NOT NULL,
    aggregate_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    version INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (aggregate_id, version)
);

CREATE INDEX idx_events_aggregate ON events(aggregate_type, aggregate_id, version);
```

### Bi-temporal Tables

```sql
CREATE TABLE prices (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Current price
SELECT * FROM prices
WHERE product_id = $1
  AND valid_from <= CURRENT_DATE
  AND (valid_to IS NULL OR valid_to > CURRENT_DATE);
```
