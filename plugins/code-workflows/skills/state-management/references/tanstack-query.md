# TanStack Query Reference

## Installation

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

## Setup

```tsx
// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## Query Basics

### useQuery

```typescript
import { useQuery } from "@tanstack/react-query";

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId, // Only run if userId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <Spinner />;
  if (isError) return <Error message={error.message} />;

  return <div>{data.name}</div>;
}
```

### Query Options

```typescript
useQuery({
  queryKey: ["posts", { page, sort }],
  queryFn: () => fetchPosts({ page, sort }),

  // Timing
  staleTime: 60 * 1000,        // Data fresh for 1 min
  gcTime: 5 * 60 * 1000,       // Cache for 5 min
  refetchInterval: 30 * 1000,   // Poll every 30 sec

  // Conditions
  enabled: isAuthenticated,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

  // Behavior
  refetchOnMount: true,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,

  // Placeholders
  placeholderData: previousData,
  initialData: () => cache.get("posts"),

  // Transformations
  select: (data) => data.filter((post) => post.published),
});
```

## Mutations

### useMutation

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newPost: CreatePostInput) => createPost(newPost),

    onMutate: async (newPost) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(["posts"]);

      // Optimistic update
      queryClient.setQueryData(["posts"], (old) => [...old, newPost]);

      return { previousPosts };
    },

    onError: (err, newPost, context) => {
      // Rollback on error
      queryClient.setQueryData(["posts"], context.previousPosts);
    },

    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },

    onSuccess: (data) => {
      // Success handler
      toast.success("Post created!");
    },
  });

  return (
    <button
      onClick={() => mutation.mutate({ title: "New Post" })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Creating..." : "Create Post"}
    </button>
  );
}
```

## Pagination

### useInfiniteQuery

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";

function InfiniteList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => fetchPosts({ cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    getPreviousPageParam: (firstPage) => firstPage.prevCursor ?? undefined,
  });

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div>
      {allPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
```

## Query Key Factory

```typescript
// keys.ts
export const queryKeys = {
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: UserFilters) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  posts: {
    all: ["posts"] as const,
    list: (filters: PostFilters) => [...queryKeys.posts.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.posts.all, "detail", id] as const,
    byAuthor: (authorId: string) =>
      [...queryKeys.posts.all, "author", authorId] as const,
  },
};

// Usage
useQuery({
  queryKey: queryKeys.users.detail(userId),
  queryFn: () => fetchUser(userId),
});

// Invalidation
queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
```

## Prefetching

```typescript
// In loader or server component
await queryClient.prefetchQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
});

// On hover
const prefetchPost = (postId: string) => {
  queryClient.prefetchQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
    staleTime: 5 * 60 * 1000,
  });
};

<Link
  href={`/posts/${post.id}`}
  onMouseEnter={() => prefetchPost(post.id)}
>
  {post.title}
</Link>
```

## Dependent Queries

```typescript
// Query B depends on Query A
const { data: user } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
});

const { data: posts } = useQuery({
  queryKey: ["posts", user?.id],
  queryFn: () => fetchUserPosts(user.id),
  enabled: !!user?.id, // Only run when user exists
});
```

## Parallel Queries

```typescript
import { useQueries } from "@tanstack/react-query";

const results = useQueries({
  queries: userIds.map((id) => ({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
  })),
});

// All loading?
const isLoading = results.some((result) => result.isLoading);

// All data
const users = results.map((result) => result.data);
```

## Cache Manipulation

```typescript
const queryClient = useQueryClient();

// Get cached data
const user = queryClient.getQueryData(["user", id]);

// Set cached data
queryClient.setQueryData(["user", id], newUser);

// Update cached data
queryClient.setQueryData(["user", id], (old) => ({
  ...old,
  name: "New Name",
}));

// Invalidate (mark stale and refetch if active)
queryClient.invalidateQueries({ queryKey: ["users"] });

// Remove from cache
queryClient.removeQueries({ queryKey: ["user", id] });

// Cancel outgoing queries
await queryClient.cancelQueries({ queryKey: ["users"] });
```

## Error Handling

```typescript
// Global error handler
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (error instanceof AuthError) {
        // Redirect to login
      }
      toast.error(`Something went wrong: ${error.message}`);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(`Mutation failed: ${error.message}`);
    },
  }),
});

// Per-query error handling
useQuery({
  queryKey: ["user"],
  queryFn: fetchUser,
  throwOnError: (error) => error.status >= 500,
});
```

## With SSR/Next.js

```typescript
// Server Component
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export default async function Page() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Posts />
    </HydrationBoundary>
  );
}
```
