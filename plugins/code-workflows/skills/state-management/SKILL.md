---
name: state-management
description: Setup state management for React applications using Zustand, TanStack Query, and React Hook Form. Use when users need to manage client state, server state, or form state. Covers store patterns, caching strategies, and form validation.
---

# State Management

Modern state management patterns for React applications.

## Decision Tree

```
User request → What type of state?
    │
    ├─ Client State (UI, local)
    │   ├─ Zustand → Simple, minimal boilerplate
    │   ├─ Jotai → Atomic, fine-grained
    │   ├─ Valtio → Proxy-based, mutable API
    │   └─ Context → Built-in, simple cases
    │
    ├─ Server State (API data)
    │   ├─ TanStack Query → Caching, background sync
    │   ├─ SWR → Lightweight, stale-while-revalidate
    │   └─ RTK Query → Redux ecosystem
    │
    ├─ Form State
    │   ├─ React Hook Form → Performance, validation
    │   ├─ Formik → Mature, feature-rich
    │   └─ Conform → Progressive enhancement
    │
    └─ URL State
        ├─ nuqs → Type-safe URL params
        └─ useSearchParams → Built-in Next.js
```

## Quick Start

### Zustand Setup

```bash
pnpm add zustand
```

```typescript
// stores/useUserStore.ts
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        setUser: (user) => set({ user, isAuthenticated: true }),
        logout: () => set({ user: null, isAuthenticated: false }),
      }),
      { name: "user-storage" }
    )
  )
);
```

### TanStack Query Setup

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

```typescript
// lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.get("/users"),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => api.get(`/users/${id}`),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) => api.post("/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

### React Hook Form + Zod

```bash
pnpm add react-hook-form @hookform/resolvers zod
```

```typescript
// components/UserForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(2, "Name too short"),
  password: z.string().min(8, "Password must be 8+ characters"),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserForm({ onSubmit }: { onSubmit: (data: UserFormData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register("name")} placeholder="Name" />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register("password")} type="password" placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

## State Type Comparison

| State Type | Solution | Persistence | Sync |
|------------|----------|-------------|------|
| UI State | Zustand | Optional | No |
| Server State | TanStack Query | Cache | Background |
| Form State | React Hook Form | No | No |
| URL State | nuqs | URL | Browser |
| Auth State | Zustand + persist | LocalStorage | No |

## Reference Files

- **Zustand Patterns**: See [references/zustand-patterns.md](references/zustand-patterns.md)
- **TanStack Query**: See [references/tanstack-query.md](references/tanstack-query.md)
- **Form Patterns**: See [references/form-patterns.md](references/form-patterns.md)

## Best Practices

1. **Separate concerns**: UI state vs server state vs form state
2. **Colocate state**: Keep state close to where it's used
3. **Derive don't duplicate**: Compute values from source of truth
4. **Normalize server data**: Avoid nested structures
5. **Optimistic updates**: Instant feedback, rollback on error
6. **Persist wisely**: Only what's necessary
7. **Type everything**: Full TypeScript support
8. **DevTools**: Use in development for debugging
