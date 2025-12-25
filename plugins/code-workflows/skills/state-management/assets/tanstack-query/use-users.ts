import {
	useQuery,
	useMutation,
	useQueryClient,
	useInfiniteQuery,
	type UseQueryOptions,
} from "@tanstack/react-query";
import { queryKeys } from "./query-client";

// Types
interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	createdAt: string;
}

interface CreateUserInput {
	email: string;
	name: string;
}

interface UpdateUserInput {
	name?: string;
	avatar?: string;
}

interface UsersListParams {
	page?: number;
	limit?: number;
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
}

// API functions (replace with actual implementation)
const api = {
	getUsers: async (params: UsersListParams): Promise<PaginatedResponse<User>> => {
		const response = await fetch(`/api/users?${new URLSearchParams(params as Record<string, string>)}`);
		if (!response.ok) throw new Error("Failed to fetch users");
		return response.json();
	},

	getUser: async (id: string): Promise<User> => {
		const response = await fetch(`/api/users/${id}`);
		if (!response.ok) throw new Error("Failed to fetch user");
		return response.json();
	},

	createUser: async (data: CreateUserInput): Promise<User> => {
		const response = await fetch("/api/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!response.ok) throw new Error("Failed to create user");
		return response.json();
	},

	updateUser: async (id: string, data: UpdateUserInput): Promise<User> => {
		const response = await fetch(`/api/users/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!response.ok) throw new Error("Failed to update user");
		return response.json();
	},

	deleteUser: async (id: string): Promise<void> => {
		const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
		if (!response.ok) throw new Error("Failed to delete user");
	},
};

// Hooks

/**
 * Fetch paginated users list
 */
export function useUsers(
	params: UsersListParams = {},
	options?: Omit<UseQueryOptions<PaginatedResponse<User>>, "queryKey" | "queryFn">,
) {
	return useQuery({
		queryKey: queryKeys.users.list(params),
		queryFn: () => api.getUsers(params),
		...options,
	});
}

/**
 * Fetch infinite users list
 */
export function useInfiniteUsers(params: Omit<UsersListParams, "page"> = {}) {
	return useInfiniteQuery({
		queryKey: queryKeys.users.list({ ...params, infinite: true }),
		queryFn: ({ pageParam = 1 }) =>
			api.getUsers({ ...params, page: pageParam }),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.hasMore ? lastPage.page + 1 : undefined,
		getPreviousPageParam: (firstPage) =>
			firstPage.page > 1 ? firstPage.page - 1 : undefined,
	});
}

/**
 * Fetch single user
 */
export function useUser(
	id: string,
	options?: Omit<UseQueryOptions<User>, "queryKey" | "queryFn">,
) {
	return useQuery({
		queryKey: queryKeys.users.detail(id),
		queryFn: () => api.getUser(id),
		enabled: !!id,
		...options,
	});
}

/**
 * Create user mutation
 */
export function useCreateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateUserInput) => api.createUser(data),
		onSuccess: (newUser) => {
			// Invalidate users list to refetch
			queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

			// Optionally add to cache immediately
			queryClient.setQueryData(queryKeys.users.detail(newUser.id), newUser);
		},
	});
}

/**
 * Update user mutation with optimistic update
 */
export function useUpdateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
			api.updateUser(id, data),

		// Optimistic update
		onMutate: async ({ id, data }) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(id) });

			// Snapshot previous value
			const previousUser = queryClient.getQueryData<User>(
				queryKeys.users.detail(id),
			);

			// Optimistically update
			if (previousUser) {
				queryClient.setQueryData(queryKeys.users.detail(id), {
					...previousUser,
					...data,
				});
			}

			return { previousUser };
		},

		// Rollback on error
		onError: (err, { id }, context) => {
			if (context?.previousUser) {
				queryClient.setQueryData(
					queryKeys.users.detail(id),
					context.previousUser,
				);
			}
		},

		// Refetch after success or error
		onSettled: (_, __, { id }) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
			queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
		},
	});
}

/**
 * Delete user mutation
 */
export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => api.deleteUser(id),

		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: queryKeys.users.lists() });

			// Remove from list optimistically
			const previousLists = queryClient.getQueriesData<PaginatedResponse<User>>({
				queryKey: queryKeys.users.lists(),
			});

			queryClient.setQueriesData<PaginatedResponse<User>>(
				{ queryKey: queryKeys.users.lists() },
				(old) =>
					old
						? {
								...old,
								data: old.data.filter((user) => user.id !== id),
								total: old.total - 1,
							}
						: old,
			);

			return { previousLists };
		},

		onError: (err, id, context) => {
			// Restore previous lists
			context?.previousLists.forEach(([queryKey, data]) => {
				queryClient.setQueryData(queryKey, data);
			});
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
		},
	});
}

// Usage example:
// const { data, isLoading, error } = useUsers({ page: 1, limit: 10 });
// const { data: user } = useUser(userId);
// const createUser = useCreateUser();
// createUser.mutate({ email: 'new@example.com', name: 'New User' });
