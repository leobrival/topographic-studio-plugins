# Database Normalization

Guide to normalizing database schemas for data integrity and efficiency.

## Normal Forms

### First Normal Form (1NF)

**Rule**: Eliminate repeating groups; each cell contains a single value.

**Before (violates 1NF):**

```sql
CREATE TABLE orders (
    id INT,
    customer_name TEXT,
    products TEXT  -- "Product A, Product B, Product C"
);
```

**After (1NF):**

```sql
CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_name TEXT
);

CREATE TABLE order_items (
    id INT PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    product_name TEXT
);
```

### Second Normal Form (2NF)

**Rule**: Meet 1NF + remove partial dependencies (all non-key attributes depend on entire primary key).

**Before (violates 2NF):**

```sql
-- Composite key: (order_id, product_id)
-- customer_name depends only on order_id, not product_id
CREATE TABLE order_details (
    order_id INT,
    product_id INT,
    customer_name TEXT,  -- Partial dependency
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);
```

**After (2NF):**

```sql
CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_name TEXT
);

CREATE TABLE order_items (
    order_id INT REFERENCES orders(id),
    product_id INT REFERENCES products(id),
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);
```

### Third Normal Form (3NF)

**Rule**: Meet 2NF + remove transitive dependencies (non-key attributes depend only on the primary key).

**Before (violates 3NF):**

```sql
CREATE TABLE employees (
    id INT PRIMARY KEY,
    name TEXT,
    department_id INT,
    department_name TEXT,  -- Depends on department_id, not employee id
    department_location TEXT  -- Transitive dependency
);
```

**After (3NF):**

```sql
CREATE TABLE departments (
    id INT PRIMARY KEY,
    name TEXT,
    location TEXT
);

CREATE TABLE employees (
    id INT PRIMARY KEY,
    name TEXT,
    department_id INT REFERENCES departments(id)
);
```

### Boyce-Codd Normal Form (BCNF)

**Rule**: Meet 3NF + every determinant is a candidate key.

**Rarely needed** beyond 3NF for most applications.

## When to Denormalize

### Performance Optimization

Denormalize when read performance is critical:

```sql
-- Normalized (2 queries or JOIN)
SELECT p.title, u.name as author_name
FROM posts p
JOIN users u ON p.author_id = u.id;

-- Denormalized (single query, but data duplication)
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    title TEXT,
    author_id UUID,
    author_name TEXT,  -- Duplicated from users
    author_avatar TEXT
);
```

### Common Denormalization Patterns

**1. Cached Counts:**

```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    title TEXT,
    comment_count INT DEFAULT 0,  -- Denormalized count
    like_count INT DEFAULT 0
);

-- Keep updated with triggers
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

**2. Computed Fields:**

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    subtotal DECIMAL(10,2),
    tax DECIMAL(10,2),
    total DECIMAL(10,2),  -- Could be computed, but stored for speed
    item_count INT
);
```

**3. JSON Aggregates:**

```sql
-- Store frequently accessed related data as JSON
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    title TEXT,
    tags JSONB DEFAULT '[]',  -- Instead of join table for reads
    author JSONB  -- Cached author data
);
```

## Relationship Patterns

### One-to-One (1:1)

```sql
-- Option 1: Same table (preferred for always-present data)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT,
    bio TEXT,          -- Profile data
    website TEXT
);

-- Option 2: Separate table (for optional/large data)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT
);

CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    bio TEXT,
    website TEXT
);
```

### One-to-Many (1:N)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name TEXT
);

CREATE TABLE posts (
    id UUID PRIMARY KEY,
    title TEXT,
    author_id UUID REFERENCES users(id)  -- FK to parent
);
```

### Many-to-Many (M:N)

```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    title TEXT
);

CREATE TABLE tags (
    id UUID PRIMARY KEY,
    name TEXT
);

-- Junction table
CREATE TABLE post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);
```

### Self-Referencing

```sql
-- Hierarchical data (comments with replies)
CREATE TABLE comments (
    id UUID PRIMARY KEY,
    content TEXT,
    parent_id UUID REFERENCES comments(id)
);

-- Manager relationship
CREATE TABLE employees (
    id UUID PRIMARY KEY,
    name TEXT,
    manager_id UUID REFERENCES employees(id)
);
```

### Polymorphic Relationships

```sql
-- Option 1: Separate tables (type-safe)
CREATE TABLE post_comments (
    id UUID PRIMARY KEY,
    post_id UUID REFERENCES posts(id),
    content TEXT
);

CREATE TABLE photo_comments (
    id UUID PRIMARY KEY,
    photo_id UUID REFERENCES photos(id),
    content TEXT
);

-- Option 2: Single table (flexible)
CREATE TABLE comments (
    id UUID PRIMARY KEY,
    commentable_type TEXT,  -- 'post', 'photo'
    commentable_id UUID,
    content TEXT
);
CREATE INDEX idx_comments_target ON comments(commentable_type, commentable_id);
```

## Decision Guide

| Scenario | Recommendation |
|----------|----------------|
| Data integrity critical | Normalize (3NF) |
| Read-heavy workload | Consider denormalization |
| Write-heavy workload | Normalize |
| Real-time analytics | Denormalize or use views |
| Audit requirements | Normalize + audit tables |
| Simple queries | Normalize |
| Complex JOINs | Consider denormalization |

## Best Practices

1. **Start normalized**: Denormalize only when needed
2. **Measure first**: Profile queries before optimizing
3. **Use views**: Create denormalized views for reads
4. **Document decisions**: Note why denormalization was chosen
5. **Maintain consistency**: Use triggers for denormalized data
6. **Consider materialized views**: For complex aggregations
