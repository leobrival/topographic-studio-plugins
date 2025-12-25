/**
 * Type-safe API client using ky
 * Built-in retry, timeout, hooks, and better DX than fetch
 */

import ky, { type KyInstance, type Options } from "ky";
import { z } from "zod";

// ============================================================================
// Configuration
// ============================================================================

export interface ClientConfig {
	baseUrl: string;
	apiKey?: string;
	bearerToken?: string;
	timeout?: number;
	retries?: number;
	debug?: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export class ApiError extends Error {
	constructor(
		public status: number,
		public code: string,
		public details?: unknown,
	) {
		super(`API Error [${code}]: ${status}`);
		this.name = "ApiError";
	}

	static isNotFound(error: unknown): error is ApiError {
		return error instanceof ApiError && error.status === 404;
	}

	static isUnauthorized(error: unknown): error is ApiError {
		return error instanceof ApiError && error.status === 401;
	}

	static isRateLimited(error: unknown): error is ApiError {
		return error instanceof ApiError && error.status === 429;
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

export type Result<T, E = ApiError> =
	| { ok: true; data: T }
	| { ok: false; error: E };

// ============================================================================
// Base Client Factory
// ============================================================================

export function createClient(config: ClientConfig) {
	const {
		baseUrl,
		apiKey,
		bearerToken,
		timeout = 30000,
		retries = 2,
		debug = false,
	} = config;

	// Build headers
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (apiKey) {
		headers["X-API-Key"] = apiKey;
	}

	if (bearerToken) {
		headers["Authorization"] = `Bearer ${bearerToken}`;
	}

	// Create ky instance
	const client: KyInstance = ky.create({
		prefixUrl: baseUrl,
		timeout,
		retry: {
			limit: retries,
			methods: ["get", "put", "delete", "head", "options"],
			statusCodes: [408, 413, 429, 500, 502, 503, 504],
			backoffLimit: 10000,
		},
		headers,
		hooks: {
			beforeRequest: debug
				? [
						(request) => {
							console.log(`[API] ${request.method} ${request.url}`);
						},
					]
				: [],
			afterResponse: debug
				? [
						(_request, _options, response) => {
							console.log(`[API] ${response.status} ${response.url}`);
							return response;
						},
					]
				: [],
			beforeRetry: [
				async ({ request, retryCount }) => {
					console.log(`[API] Retry #${retryCount} for ${request.url}`);
				},
			],
		},
	});

	// Request wrapper with validation
	async function request<T>(
		method: "get" | "post" | "put" | "patch" | "delete",
		path: string,
		options: {
			json?: unknown;
			searchParams?: Record<string, string | number>;
			schema?: z.ZodType<T>;
			kyOptions?: Options;
		} = {},
	): Promise<Result<T>> {
		const { json, searchParams, schema, kyOptions } = options;

		try {
			const response = await client[method](path, {
				json,
				searchParams,
				...kyOptions,
			}).json<T>();

			// Validate if schema provided
			if (schema) {
				const result = schema.safeParse(response);
				if (!result.success) {
					return {
						ok: false,
						error: new ValidationError(
							"Response validation failed",
							result.error,
						) as unknown as ApiError,
					};
				}
				return { ok: true, data: result.data };
			}

			return { ok: true, data: response };
		} catch (err) {
			if (err instanceof ky.HTTPError) {
				const body = await err.response.json().catch(() => ({}));
				return {
					ok: false,
					error: new ApiError(
						err.response.status,
						(body as { code?: string }).code || "UNKNOWN_ERROR",
						body,
					),
				};
			}

			return {
				ok: false,
				error: new ApiError(0, "NETWORK_ERROR", err),
			};
		}
	}

	return {
		// Raw ky instance for advanced use
		raw: client,

		// Typed methods
		get: <T>(path: string, options?: Parameters<typeof request>[2]) =>
			request<T>("get", path, options),

		post: <T>(path: string, json: unknown, options?: Parameters<typeof request>[2]) =>
			request<T>("post", path, { ...options, json }),

		put: <T>(path: string, json: unknown, options?: Parameters<typeof request>[2]) =>
			request<T>("put", path, { ...options, json }),

		patch: <T>(path: string, json: unknown, options?: Parameters<typeof request>[2]) =>
			request<T>("patch", path, { ...options, json }),

		delete: <T>(path: string, options?: Parameters<typeof request>[2]) =>
			request<T>("delete", path, options),
	};
}

// ============================================================================
// Usage Example
// ============================================================================

/*
import { z } from "zod";

// Define schemas
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
});

const UsersResponseSchema = z.object({
  users: z.array(UserSchema),
  total: z.number(),
  page: z.number(),
});

type User = z.infer<typeof UserSchema>;
type UsersResponse = z.infer<typeof UsersResponseSchema>;

// Create client
const api = createClient({
  baseUrl: "https://api.example.com/v1",
  bearerToken: process.env.API_TOKEN,
  debug: process.env.NODE_ENV === "development",
});

// GET with validation
const usersResult = await api.get<UsersResponse>("/users", {
  searchParams: { page: 1, limit: 10 },
  schema: UsersResponseSchema,
});

if (usersResult.ok) {
  console.log(`Found ${usersResult.data.total} users`);
} else if (ApiError.isUnauthorized(usersResult.error)) {
  console.log("Please login");
} else {
  console.error(usersResult.error);
}

// POST
const createResult = await api.post<User>("/users", {
  name: "John",
  email: "john@example.com",
}, { schema: UserSchema });
*/
