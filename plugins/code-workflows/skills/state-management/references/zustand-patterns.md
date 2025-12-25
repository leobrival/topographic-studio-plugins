# Zustand Patterns Reference

## Installation

```bash
pnpm add zustand immer
```

## Basic Store

```typescript
import { create } from "zustand";

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

## Middleware Stack

### DevTools + Persist + Immer

```typescript
import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const useStore = create<State>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set) => ({
          // state and actions
        }))
      ),
      { name: "store-name" }
    ),
    { name: "StoreName" }
  )
);
```

### Persist Options

```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    name: "storage-key",

    // Partial persistence
    partialize: (state) => ({
      user: state.user,
      settings: state.settings,
    }),

    // Custom storage
    storage: createJSONStorage(() => sessionStorage),

    // Migration
    version: 1,
    migrate: (persistedState, version) => {
      if (version === 0) {
        // Migrate from v0 to v1
      }
      return persistedState as State;
    },
  }
)
```

## Immer Updates

```typescript
import { immer } from "zustand/middleware/immer";

const useStore = create(
  immer<State>((set) => ({
    user: { name: "John", settings: { theme: "light" } },

    // Direct mutation with Immer
    updateName: (name) =>
      set((state) => {
        state.user.name = name;
      }),

    // Nested updates
    updateTheme: (theme) =>
      set((state) => {
        state.user.settings.theme = theme;
      }),

    // Array updates
    items: [],
    addItem: (item) =>
      set((state) => {
        state.items.push(item);
      }),

    removeItem: (id) =>
      set((state) => {
        const index = state.items.findIndex((i) => i.id === id);
        if (index !== -1) state.items.splice(index, 1);
      }),
  }))
);
```

## Selectors

### Basic Selectors

```typescript
// In store file
export const selectUser = (state: State) => state.user;
export const selectIsAuthenticated = (state: State) => state.isAuthenticated;

// In component
const user = useStore(selectUser);
const isAuth = useStore(selectIsAuthenticated);
```

### Derived/Computed Values

```typescript
export const selectFullName = (state: State) =>
  `${state.user.firstName} ${state.user.lastName}`;

export const selectCompletedTodos = (state: State) =>
  state.todos.filter((todo) => todo.completed);

export const selectTodoStats = (state: State) => ({
  total: state.todos.length,
  completed: state.todos.filter((t) => t.completed).length,
  pending: state.todos.filter((t) => !t.completed).length,
});
```

### Multiple Values with Shallow

```typescript
import { shallow } from "zustand/shallow";

// Prevents re-renders if object reference changes but values don't
const { user, posts } = useStore(
  (state) => ({ user: state.user, posts: state.posts }),
  shallow
);
```

## Subscriptions

```typescript
// Subscribe with selector middleware
const useStore = create(
  subscribeWithSelector<State>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
  }))
);

// Subscribe to specific state changes
useStore.subscribe(
  (state) => state.user,
  (user, previousUser) => {
    console.log("User changed:", previousUser, "->", user);
    // Analytics, side effects, etc.
  }
);

// Unsubscribe
const unsubscribe = useStore.subscribe(/* ... */);
unsubscribe();
```

## Store Slices

```typescript
// Create slice
const createUserSlice = (set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
});

const createCartSlice = (set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  clearCart: () => set({ items: [] }),
});

// Combine slices
const useStore = create<UserSlice & CartSlice>()(
  devtools(
    immer((...args) => ({
      ...createUserSlice(...args),
      ...createCartSlice(...args),
    }))
  )
);
```

## Actions with get()

```typescript
const useStore = create<State>((set, get) => ({
  items: [],
  selectedId: null,

  // Access current state with get()
  getSelectedItem: () => {
    const { items, selectedId } = get();
    return items.find((item) => item.id === selectedId);
  },

  // Conditional updates
  toggleItem: (id) => {
    const item = get().items.find((i) => i.id === id);
    if (item) {
      set((state) => ({
        items: state.items.map((i) =>
          i.id === id ? { ...i, selected: !i.selected } : i
        ),
      }));
    }
  },
}));
```

## Async Actions

```typescript
const useStore = create<State>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/users");
      const users = await response.json();
      set({ users, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

## TypeScript Best Practices

```typescript
// Define state and actions separately
interface UserState {
  user: User | null;
  isLoading: boolean;
}

interface UserActions {
  setUser: (user: User) => void;
  logout: () => void;
}

type UserStore = UserState & UserActions;

// Use with create
const useUserStore = create<UserStore>()(/* ... */);
```

## Testing

```typescript
import { act, renderHook } from "@testing-library/react";

describe("useStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useStore.setState({ count: 0 });
  });

  it("increments count", () => {
    const { result } = renderHook(() => useStore());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```
