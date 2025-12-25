/**
 * Error Handling Middleware / Wrapper
 * Inspired by AdonisJS exception handling flow
 *
 * Usage in Next.js API routes, middleware, or any async handler
 */

import { randomUUID } from "node:crypto";
import { ExceptionHandler, exceptionHandler } from "./exception-handler";
import type { ExceptionContext, HttpError } from "./exception-handler";
import { logger } from "../logging/logger";
import type { NextRequest } from "next/server";

// Request ID header
const REQUEST_ID_HEADER = "x-request-id";

/**
 * Wrap a Next.js API route with error handling
 */
export function withErrorHandling(
	handler: (
		request: NextRequest,
		context: ExceptionContext,
	) => Promise<Response>,
	options?: {
		exceptionHandler?: ExceptionHandler;
	},
) {
	const errorHandler = options?.exceptionHandler ?? exceptionHandler;

	return async (request: NextRequest): Promise<Response> => {
		const requestId = request.headers.get(REQUEST_ID_HEADER) ?? randomUUID();
		const requestLogger = logger.child({ requestId });

		const ctx: ExceptionContext = {
			request,
			requestId,
			logger: requestLogger,
		};

		try {
			const response = await handler(request, ctx);

			// Add request ID to response headers
			const headers = new Headers(response.headers);
			headers.set(REQUEST_ID_HEADER, requestId);

			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers,
			});
		} catch (error) {
			// Report the error
			await errorHandler.report(error, ctx);

			// Handle and return response
			const response = await errorHandler.handle(error, ctx);

			// Add request ID to error response
			const headers = new Headers(response.headers);
			headers.set(REQUEST_ID_HEADER, requestId);

			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers,
			});
		}
	};
}

/**
 * Wrap any async function with error handling
 */
export function withTryCatch<T, Args extends unknown[]>(
	fn: (...args: Args) => Promise<T>,
	options?: {
		onError?: (error: unknown) => void;
		fallback?: T;
		rethrow?: boolean;
	},
): (...args: Args) => Promise<T> {
	return async (...args: Args): Promise<T> => {
		try {
			return await fn(...args);
		} catch (error) {
			options?.onError?.(error);

			if (options?.rethrow !== false) {
				throw error;
			}

			return options?.fallback as T;
		}
	};
}

/**
 * Create a route handler with full error handling setup
 *
 * Example:
 * ```ts
 * export const GET = createHandler(async (req, ctx) => {
 *   const users = await db.users.findMany();
 *   return Response.json(users);
 * });
 * ```
 */
export function createHandler(
	handler: (
		request: NextRequest,
		context: ExceptionContext,
	) => Promise<Response>,
) {
	return withErrorHandling(handler);
}

/**
 * Create a custom exception handler for your application
 *
 * Example:
 * ```ts
 * const handler = createExceptionHandler({
 *   debug: false,
 *   ignoreStatuses: [400, 401, 403, 404, 422],
 *   ignoreCodes: ['E_VALIDATION_ERROR'],
 *   statusPages: {
 *     '404': (error, ctx) => Response.json({ error: 'Not found' }, { status: 404 }),
 *     '500..599': (error, ctx) => Response.json({ error: 'Server error' }, { status: 500 }),
 *   },
 *   context: (ctx) => ({
 *     requestId: ctx.requestId,
 *     userId: ctx.auth?.user?.id,
 *   }),
 * });
 * ```
 */
export function createExceptionHandler(config: {
	debug?: boolean;
	ignoreStatuses?: number[];
	ignoreCodes?: string[];
	statusPages?: Record<string, (error: HttpError, ctx: ExceptionContext) => Response | Promise<Response>>;
	context?: (ctx: ExceptionContext) => Record<string, unknown>;
}): ExceptionHandler {
	class CustomExceptionHandler extends ExceptionHandler {
		protected debug = config.debug ?? process.env.NODE_ENV !== "production";
		protected ignoreStatuses = config.ignoreStatuses ?? [400, 401, 403, 404, 422];
		protected ignoreCodes = config.ignoreCodes ?? ["E_VALIDATION_ERROR"];
		protected statusPages = config.statusPages ?? {};

		protected context(ctx: ExceptionContext): Record<string, unknown> {
			if (config.context) {
				return config.context(ctx);
			}
			return super.context(ctx);
		}
	}

	return new CustomExceptionHandler();
}

// ============================================================
// Utility: Safe JSON parsing
// ============================================================

import { BadRequestException } from "./exception";

/**
 * Safely parse JSON from request body
 */
export async function parseJsonBody<T>(request: NextRequest): Promise<T> {
	try {
		return await request.json();
	} catch {
		throw new BadRequestException("Invalid JSON body");
	}
}

/**
 * Safely get search param with validation
 */
export function getRequiredParam(
	request: NextRequest,
	name: string,
): string {
	const value = new URL(request.url).searchParams.get(name);
	if (!value) {
		throw new BadRequestException(`Missing required parameter: ${name}`);
	}
	return value;
}

/**
 * Safely get route param
 */
export function getRouteParam(
	params: Record<string, string | string[]>,
	name: string,
): string {
	const value = params[name];
	if (!value || Array.isArray(value)) {
		throw new BadRequestException(`Invalid route parameter: ${name}`);
	}
	return value;
}
