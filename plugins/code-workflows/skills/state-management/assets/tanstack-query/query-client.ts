import { QueryClient } from "@tanstack/react-query";

// Create query client with sensible defaults
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Data is fresh for 1 minute
			staleTime: 60 * 1000,

			// Cache for 5 minutes after all subscribers unmount
			gcTime: 5 * 60 * 1000,

			// Retry failed requests once
			retry: 1,
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

			// Don't refetch on window focus by default
			refetchOnWindowFocus: false,

			// Don't refetch on reconnect by default
			refetchOnReconnect: false,

			// Keep previous data while fetching
			placeholderData: (previousData) => previousData,
		},
		mutations: {
			// Don't retry mutations by default
			retry: false,
		},
	},
});

// Provider setup in _app.tsx or layout.tsx:
// import { QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
//
// <QueryClientProvider client={queryClient}>
//   {children}
//   <ReactQueryDevtools initialIsOpen={false} />
// </QueryClientProvider>

// Query key factory pattern
export const queryKeys = {
	// Users
	users: {
		all: ["users"] as const,
		lists: () => [...queryKeys.users.all, "list"] as const,
		list: (filters: Record<string, unknown>) =>
			[...queryKeys.users.lists(), filters] as const,
		details: () => [...queryKeys.users.all, "detail"] as const,
		detail: (id: string) => [...queryKeys.users.details(), id] as const,
	},

	// Posts
	posts: {
		all: ["posts"] as const,
		lists: () => [...queryKeys.posts.all, "list"] as const,
		list: (filters: Record<string, unknown>) =>
			[...queryKeys.posts.lists(), filters] as const,
		details: () => [...queryKeys.posts.all, "detail"] as const,
		detail: (id: string) => [...queryKeys.posts.details(), id] as const,
		comments: (postId: string) =>
			[...queryKeys.posts.detail(postId), "comments"] as const,
	},

	// Organizations
	orgs: {
		all: ["organizations"] as const,
		lists: () => [...queryKeys.orgs.all, "list"] as const,
		detail: (id: string) => [...queryKeys.orgs.all, "detail", id] as const,
		members: (id: string) =>
			[...queryKeys.orgs.detail(id), "members"] as const,
	},
} as const;

// Usage:
// queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
// queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
// queryClient.setQueryData(queryKeys.users.detail(userId), updatedUser);
