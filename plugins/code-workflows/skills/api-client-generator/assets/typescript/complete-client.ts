/**
 * Complete API client with all features
 * - Type-safe requests/responses with Zod
 * - Retry with exponential backoff
 * - Rate limiting respect
 * - Request/response logging
 * - Authentication (API key, Bearer, OAuth)
 * - Request caching
 * - Interceptors
 */

import ky, { type KyInstance, type BeforeRequestHook, type AfterResponseHook } from "ky";
import { z } from "zod";

// ============================================================================
// Types & Schemas
// ============================================================================

export interface ClientConfig {
	baseUrl: string;
	auth?: AuthConfig;
	timeout?: number;
	retries?: number;
	cache?: CacheConfig;
	logging?: LoggingConfig;
	interceptors?: InterceptorConfig;
}

export interface AuthConfig {
	type: "apiKey" | "bearer" | "oauth";
	apiKey?: string;
	apiKeyHeader?: string;
	token?: string;
	refreshToken?: () => Promise<string>;
}

export interface CacheConfig {
	enabled: boolean;
	ttl: number; // milliseconds
	methods?: ("GET" | "HEAD")[];
}

export interface LoggingConfig {
	enabled: boolean;
	onRequest?: (method: string, url: string, body?: unknown) => void;
	onResponse?: (status: number, url: string, duration: number) => void;
	onError?: (error: Error, url: string) => void;
}

export interface InterceptorConfig {
	beforeRequest?: BeforeRequestHook[];
	afterResponse?: AfterResponseHook[];
}

// ============================================================================
// Errors
// ============================================================================

export const ApiErrorSchema = z.object({
	code: z.string(),
	message: z.string(),
	details: z.unknown().optional(),
});

export type ApiErrorBody = z.infer<typeof ApiErrorSchema>;

export class ApiError extends Error {
	constructor(
		public status: number,
		public code: string,
		message: string,
		public details?: unknown,
		public retryAfter?: number,
	) {
		super(message);
		this.name = "ApiError";
	}

	static fromResponse(status: number, body: unknown): ApiError {
		const parsed = ApiErrorSchema.safeParse(body);
		if (parsed.success) {
			return new ApiError(status, parsed.data.code, parsed.data.message, parsed.data.details);
		}
		return new ApiError(status, "UNKNOWN", "An unknown error occurred", body);
	}

	get isRetryable(): boolean {
		return [408, 429, 500, 502, 503, 504].includes(this.status);
	}

	get isAuthError(): boolean {
		return [401, 403].includes(this.status);
	}
}

export class ValidationError extends Error {
	constructor(
		message: string,
		public zodError: z.ZodError,
		public path: "request" | "response",
	) {
		super(message);
		this.name = "ValidationError";
	}
}

// ============================================================================
// Result Type
// ============================================================================

export type Result<T, E = ApiError | ValidationError> =
	| { ok: true; data: T; headers: Headers }
	| { ok: false; error: E };

// ============================================================================
// Cache Implementation
// ============================================================================

class RequestCache {
	private cache = new Map<string, { data: unknown; expires: number }>();

	constructor(private ttl: number) {}

	get<T>(key: string): T | undefined {
		const entry = this.cache.get(key);
		if (!entry) return undefined;
		if (Date.now() > entry.expires) {
			this.cache.delete(key);
			return undefined;
		}
		return entry.data as T;
	}

	set(key: string, data: unknown): void {
		this.cache.set(key, { data, expires: Date.now() + this.ttl });
	}

	invalidate(pattern?: string): void {
		if (!pattern) {
			this.cache.clear();
			return;
		}
		for (const key of this.cache.keys()) {
			if (key.includes(pattern)) {
				this.cache.delete(key);
			}
		}
	}
}

// ============================================================================
// Client Factory
// ============================================================================

export function createClient(config: ClientConfig) {
	const {
		baseUrl,
		auth,
		timeout = 30000,
		retries = 3,
		cache: cacheConfig,
		logging,
		interceptors,
	} = config;

	// Initialize cache
	const cache = cacheConfig?.enabled ? new RequestCache(cacheConfig.ttl) : null;
	const cacheMethods = cacheConfig?.methods || ["GET"];

	// Build auth headers
	function getAuthHeaders(): Record<string, string> {
		if (!auth) return {};

		switch (auth.type) {
			case "apiKey":
				return { [auth.apiKeyHeader || "X-API-Key"]: auth.apiKey! };
			case "bearer":
				return { Authorization: `Bearer ${auth.token}` };
			case "oauth":
				return { Authorization: `Bearer ${auth.token}` };
			default:
				return {};
		}
	}

	// Create ky instance
	const client: KyInstance = ky.create({
		prefixUrl: baseUrl,
		timeout,
		retry: {
			limit: retries,
			methods: ["get", "put", "delete", "head", "options"],
			statusCodes: [408, 429, 500, 502, 503, 504],
			backoffLimit: 30000,
			delay: (attemptCount) => Math.min(1000 * 2 ** attemptCount, 30000),
		},
		headers: {
			"Content-Type": "application/json",
			...getAuthHeaders(),
		},
		hooks: {
			beforeRequest: [
				// Logging
				...(logging?.enabled
					? [
							((request) => {
								logging.onRequest?.(request.method, request.url, undefined);
							}) as BeforeRequestHook,
						]
					: []),
				// Custom interceptors
				...(interceptors?.beforeRequest || []),
			],
			afterResponse: [
				// Logging
				...(logging?.enabled
					? [
							((request, _options, response) => {
								logging.onResponse?.(response.status, request.url, 0);
								return response;
							}) as AfterResponseHook,
						]
					: []),
				// Handle 401 with token refresh
				...(auth?.type === "oauth" && auth.refreshToken
					? [
							(async (request, options, response) => {
								if (response.status === 401 && auth.refreshToken) {
									const newToken = await auth.refreshToken();
									auth.token = newToken;
									request.headers.set("Authorization", `Bearer ${newToken}`);
									return ky(request, options);
								}
								return response;
							}) as AfterResponseHook,
						]
					: []),
				// Custom interceptors
				...(interceptors?.afterResponse || []),
			],
			beforeRetry: [
				async ({ request, error, retryCount }) => {
					console.log(`[Retry ${retryCount}] ${request.method} ${request.url}`);

					// Respect Retry-After header
					if (error instanceof ky.HTTPError) {
						const retryAfter = error.response.headers.get("Retry-After");
						if (retryAfter) {
							const delay = Number.parseInt(retryAfter, 10) * 1000;
							await new Promise((resolve) => setTimeout(resolve, delay));
						}
					}
				},
			],
		},
	});

	// Request function
	async function request<TResponse, TRequest = unknown>(
		method: "get" | "post" | "put" | "patch" | "delete",
		path: string,
		options: {
			json?: TRequest;
			searchParams?: Record<string, string | number | boolean>;
			requestSchema?: z.ZodType<TRequest>;
			responseSchema?: z.ZodType<TResponse>;
			skipCache?: boolean;
		} = {},
	): Promise<Result<TResponse>> {
		const { json, searchParams, requestSchema, responseSchema, skipCache } = options;

		// Validate request body
		if (json && requestSchema) {
			const result = requestSchema.safeParse(json);
			if (!result.success) {
				return {
					ok: false,
					error: new ValidationError("Request validation failed", result.error, "request"),
				};
			}
		}

		// Check cache for GET requests
		const cacheKey = `${method}:${path}:${JSON.stringify(searchParams || {})}`;
		if (cache && cacheMethods.includes(method.toUpperCase() as "GET" | "HEAD") && !skipCache) {
			const cached = cache.get<TResponse>(cacheKey);
			if (cached) {
				return { ok: true, data: cached, headers: new Headers() };
			}
		}

		try {
			const startTime = Date.now();
			const response = await client[method](path, {
				json,
				searchParams: searchParams as Record<string, string>,
			});

			const data = await response.json<TResponse>();
			const duration = Date.now() - startTime;

			logging?.onResponse?.(response.status, path, duration);

			// Validate response
			if (responseSchema) {
				const result = responseSchema.safeParse(data);
				if (!result.success) {
					return {
						ok: false,
						error: new ValidationError("Response validation failed", result.error, "response"),
					};
				}

				// Cache successful GET responses
				if (cache && cacheMethods.includes(method.toUpperCase() as "GET" | "HEAD")) {
					cache.set(cacheKey, result.data);
				}

				return { ok: true, data: result.data, headers: response.headers };
			}

			return { ok: true, data, headers: response.headers };
		} catch (err) {
			if (err instanceof ky.HTTPError) {
				const body = await err.response.json().catch(() => ({}));
				const apiError = ApiError.fromResponse(err.response.status, body);

				// Check for rate limit
				const retryAfter = err.response.headers.get("Retry-After");
				if (retryAfter) {
					apiError.retryAfter = Number.parseInt(retryAfter, 10);
				}

				logging?.onError?.(apiError, path);
				return { ok: false, error: apiError };
			}

			const error = err instanceof Error ? err : new Error(String(err));
			logging?.onError?.(error, path);
			return { ok: false, error: new ApiError(0, "NETWORK_ERROR", error.message) };
		}
	}

	return {
		// Raw client
		raw: client,

		// Cache management
		cache: {
			invalidate: (pattern?: string) => cache?.invalidate(pattern),
		},

		// HTTP methods
		get: <T>(path: string, options?: Omit<Parameters<typeof request>[2], "json">) =>
			request<T>("get", path, options),

		post: <TRes, TReq = unknown>(
			path: string,
			json: TReq,
			options?: Parameters<typeof request>[2],
		) => request<TRes, TReq>("post", path, { ...options, json }),

		put: <TRes, TReq = unknown>(
			path: string,
			json: TReq,
			options?: Parameters<typeof request>[2],
		) => request<TRes, TReq>("put", path, { ...options, json }),

		patch: <TRes, TReq = unknown>(
			path: string,
			json: TReq,
			options?: Parameters<typeof request>[2],
		) => request<TRes, TReq>("patch", path, { ...options, json }),

		delete: <T>(path: string, options?: Omit<Parameters<typeof request>[2], "json">) =>
			request<T>("delete", path, options),
	};
}

// ============================================================================
// Usage Example
// ============================================================================

/*
// Define schemas
const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
});

type CreateUser = z.infer<typeof CreateUserSchema>;
type User = z.infer<typeof UserSchema>;

// Create client
const api = createClient({
  baseUrl: "https://api.example.com/v1",
  auth: {
    type: "bearer",
    token: process.env.API_TOKEN!,
  },
  cache: {
    enabled: true,
    ttl: 60000, // 1 minute
  },
  logging: {
    enabled: true,
    onRequest: (method, url) => console.log(`→ ${method} ${url}`),
    onResponse: (status, url, duration) => console.log(`← ${status} ${url} (${duration}ms)`),
    onError: (error, url) => console.error(`✕ ${url}:`, error.message),
  },
});

// Create user with validation
const result = await api.post<User, CreateUser>("/users", {
  name: "John Doe",
  email: "john@example.com",
}, {
  requestSchema: CreateUserSchema,
  responseSchema: UserSchema,
});

if (result.ok) {
  console.log("Created user:", result.data.id);
} else if (result.error instanceof ValidationError) {
  console.log("Validation failed:", result.error.zodError.issues);
} else {
  console.log("API error:", result.error.code);
}

// Invalidate cache after mutation
api.cache.invalidate("/users");
*/
