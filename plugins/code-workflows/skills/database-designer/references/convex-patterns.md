# Convex Design Patterns

Common patterns for Convex database design.

## Schema Design

### Basic Table with Indexes

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),
});
```

### Timestamps Pattern

```typescript
// Use Unix milliseconds for timestamps
const now = Date.now();

// In schema
defineTable({
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
})

// In mutation
await ctx.db.insert("posts", {
  title: args.title,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Update
await ctx.db.patch(postId, {
  title: args.title,
  updatedAt: Date.now(),
});
```

### Soft Delete

```typescript
// Schema
defineTable({
  title: v.string(),
  deletedAt: v.optional(v.number()),
})

// Query active records
export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();
  },
});

// Soft delete
export const remove = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
    });
  },
});
```

## Relationship Patterns

### One-to-One

```typescript
// Schema
defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
  }),

  profiles: defineTable({
    userId: v.id("users"),
    bio: v.optional(v.string()),
    website: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});

// Query with profile
export const getUserWithProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    return { ...user, profile };
  },
});
```

### One-to-Many

```typescript
// Schema
defineSchema({
  users: defineTable({
    name: v.string(),
  }),

  posts: defineTable({
    title: v.string(),
    authorId: v.id("users"),
  }).index("by_author", ["authorId"]),
});

// Get user's posts
export const getUserPosts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .collect();
  },
});
```

### Many-to-Many

```typescript
// Schema with junction table
defineSchema({
  posts: defineTable({
    title: v.string(),
  }),

  tags: defineTable({
    name: v.string(),
    slug: v.string(),
  }).index("by_slug", ["slug"]),

  postTags: defineTable({
    postId: v.id("posts"),
    tagId: v.id("tags"),
  })
    .index("by_post", ["postId"])
    .index("by_tag", ["tagId"])
    .index("by_post_tag", ["postId", "tagId"]),
});

// Get post with tags
export const getPostWithTags = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;

    const postTags = await ctx.db
      .query("postTags")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    const tags = await Promise.all(
      postTags.map((pt) => ctx.db.get(pt.tagId))
    );

    return { ...post, tags: tags.filter(Boolean) };
  },
});
```

## Denormalization Patterns

### Cached Counts

```typescript
// Schema
defineSchema({
  posts: defineTable({
    title: v.string(),
    likeCount: v.number(), // Denormalized
    commentCount: v.number(), // Denormalized
  }),

  likes: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
  }).index("by_post", ["postId"]),
});

// Toggle like with count update
export const toggleLike = mutation({
  args: { postId: v.id("posts"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .unique();

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, {
        likeCount: Math.max(0, post.likeCount - 1),
      });
      return { liked: false };
    } else {
      await ctx.db.insert("likes", {
        postId: args.postId,
        userId: args.userId,
      });
      await ctx.db.patch(args.postId, {
        likeCount: post.likeCount + 1,
      });
      return { liked: true };
    }
  },
});
```

### Cached Author Data

```typescript
// Schema
defineSchema({
  posts: defineTable({
    title: v.string(),
    authorId: v.id("users"),
    // Cached author data for faster reads
    authorName: v.string(),
    authorAvatar: v.optional(v.string()),
  }),
});

// Create post with cached author
export const createPost = mutation({
  args: { title: v.string(), authorId: v.id("users") },
  handler: async (ctx, args) => {
    const author = await ctx.db.get(args.authorId);
    if (!author) throw new Error("Author not found");

    return await ctx.db.insert("posts", {
      title: args.title,
      authorId: args.authorId,
      authorName: author.name,
      authorAvatar: author.avatarUrl,
    });
  },
});
```

## Search Patterns

### Search Index

```typescript
// Schema with search index
defineSchema({
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    status: v.string(),
  }).searchIndex("search_content", {
    searchField: "content",
    filterFields: ["status"],
  }),
});

// Search query
export const searchPosts = query({
  args: { query: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let search = ctx.db
      .query("posts")
      .withSearchIndex("search_content", (q) => {
        let s = q.search("content", args.query);
        if (args.status) {
          s = s.eq("status", args.status);
        }
        return s;
      });

    return await search.take(20);
  },
});
```

## Pagination Patterns

### Cursor-Based Pagination

```typescript
export const listPosts = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("posts")),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let query = ctx.db.query("posts").order("desc");

    // Start after cursor
    if (args.cursor) {
      const cursorDoc = await ctx.db.get(args.cursor);
      if (cursorDoc) {
        query = query.filter((q) =>
          q.lt(q.field("_creationTime"), cursorDoc._creationTime)
        );
      }
    }

    const posts = await query.take(limit + 1);

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, -1) : posts;

    return {
      items,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]._id : null,
    };
  },
});
```

## File Storage Patterns

```typescript
// Schema with file reference
defineSchema({
  posts: defineTable({
    title: v.string(),
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
  }),
});

// Upload and attach image
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const attachImage = mutation({
  args: { postId: v.id("posts"), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);

    await ctx.db.patch(args.postId, {
      imageId: args.storageId,
      imageUrl: url,
    });
  },
});
```

## Real-Time Patterns

### Optimistic Updates

```typescript
// Client-side with React
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function LikeButton({ postId, initialLiked }) {
  const [liked, setLiked] = useState(initialLiked);
  const toggleLike = useMutation(api.posts.toggleLike);

  const handleClick = async () => {
    // Optimistic update
    setLiked(!liked);

    try {
      const result = await toggleLike({ postId });
      setLiked(result.liked);
    } catch (error) {
      // Revert on error
      setLiked(liked);
    }
  };

  return <button onClick={handleClick}>{liked ? "Unlike" : "Like"}</button>;
}
```

### Live Queries

```typescript
// Convex automatically makes queries reactive
export const getPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.postId);
  },
});

// Client automatically updates when data changes
function Post({ postId }) {
  const post = useQuery(api.posts.getPost, { postId });

  if (!post) return <Loading />;

  return <div>{post.title}</div>;
}
```

## Error Handling

```typescript
import { ConvexError } from "convex/values";

export const updatePost = mutation({
  args: { postId: v.id("posts"), title: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new ConvexError("Post not found");
    }

    if (post.authorId !== ctx.auth.getUserIdentity()?.subject) {
      throw new ConvexError("Not authorized");
    }

    await ctx.db.patch(args.postId, { title: args.title });
  },
});
```

## Best Practices

1. **Use timestamps as numbers**: `Date.now()` for consistency
2. **Index all query fields**: Every field in `.withIndex()` needs an index
3. **Denormalize for reads**: Cache frequently accessed related data
4. **Use search indexes**: For text search instead of filtering
5. **Batch operations**: Use `Promise.all()` for multiple reads
6. **Validate early**: Check permissions and data at mutation start
7. **Return minimal data**: Only return what the client needs
