/**
 * Type-safe API client using native fetch
 * Minimal dependencies, works in browser and edge runtimes
 */

import { z } from "zod";

// ============================================================================
// Configuration
// ============================================================================

export interface ClientConfig {
	baseUrl: string;
	headers?: Record<string, string>;
	timeout?: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class ApiError extends Error {
	constructor(
		public status: number,
		public statusText: string,
		public body: unknown,
	) {
		super(`API Error: ${status} ${statusText}`);
		this.name = "ApiError";
	}
}

export class NetworkError extends Error {
	constructor(
		message: string,
		public cause?: Error,
	) {
		super(message);
		this.name = "NetworkError";
	}
}

export class ValidationError extends Error {
	constructor(
		message: string,
		public errors: z.ZodError,
	) {
		super(message);
		this.name = "ValidationError";
	}
}

// ============================================================================
// Response Types
// ============================================================================

export type ApiResponse<T> =
	| { success: true; data: T }
	| { success: false; error: ApiError | NetworkError | ValidationError };

// ============================================================================
// Base Client
// ============================================================================

export function createClient(config: ClientConfig) {
	const { baseUrl, headers: defaultHeaders = {}, timeout = 30000 } = config;

	async function request<T>(
		method: string,
		path: string,
		options: {
			params?: Record<string, string>;
			body?: unknown;
			headers?: Record<string, string>;
			schema?: z.ZodType<T>;
		} = {},
	): Promise<ApiResponse<T>> {
		const { params, body, headers, schema } = options;

		// Build URL with query params
		const url = new URL(path, baseUrl);
		if (params) {
			for (const [key, value] of Object.entries(params)) {
				url.searchParams.set(key, value);
			}
		}

		// Build request
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			const response = await fetch(url.toString(), {
				method,
				headers: {
					"Content-Type": "application/json",
					...defaultHeaders,
					...headers,
				},
				body: body ? JSON.stringify(body) : undefined,
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorBody = await response.json().catch(() => null);
				return {
					success: false,
					error: new ApiError(response.status, response.statusText, errorBody),
				};
			}

			const data = await response.json();

			// Validate response if schema provided
			if (schema) {
				const result = schema.safeParse(data);
				if (!result.success) {
					return {
						success: false,
						error: new ValidationError("Response validation failed", result.error),
					};
				}
				return { success: true, data: result.data };
			}

			return { success: true, data: data as T };
		} catch (err) {
			clearTimeout(timeoutId);

			if (err instanceof Error && err.name === "AbortError") {
				return {
					success: false,
					error: new NetworkError("Request timeout"),
				};
			}

			return {
				success: false,
				error: new NetworkError(
					"Network request failed",
					err instanceof Error ? err : undefined,
				),
			};
		}
	}

	return {
		get: <T>(path: string, options?: Parameters<typeof request>[2]) =>
			request<T>("GET", path, options),

		post: <T>(path: string, body: unknown, options?: Parameters<typeof request>[2]) =>
			request<T>("POST", path, { ...options, body }),

		put: <T>(path: string, body: unknown, options?: Parameters<typeof request>[2]) =>
			request<T>("PUT", path, { ...options, body }),

		patch: <T>(path: string, body: unknown, options?: Parameters<typeof request>[2]) =>
			request<T>("PATCH", path, { ...options, body }),

		delete: <T>(path: string, options?: Parameters<typeof request>[2]) =>
			request<T>("DELETE", path, options),
	};
}

// ============================================================================
// Usage Example
// ============================================================================

/*
// Define schemas
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;

// Create client
const api = createClient({
  baseUrl: "https://api.example.com",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Make requests
const result = await api.get<User>("/users/123", {
  schema: UserSchema,
});

if (result.success) {
  console.log(result.data.name);
} else {
  console.error(result.error);
}
*/
