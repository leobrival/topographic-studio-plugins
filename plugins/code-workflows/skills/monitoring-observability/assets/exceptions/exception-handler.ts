/**
 * HTTP Exception Handler
 * Inspired by AdonisJS exception handling pattern
 *
 * Centralized error handling with:
 * - Self-handling exceptions
 * - Custom reporting logic
 * - Status pages support
 * - Debug mode toggle
 * - Context enrichment
 */

import type { NextRequest } from "next/server";
import { logger } from "../logging/logger";

// HTTP Error interface
export interface HttpError extends Error {
	status: number;
	code: string;
	errors?: unknown[];
}

// Context for exception handling
export interface ExceptionContext {
	request: NextRequest;
	requestId: string;
	logger: typeof logger;
	// Add more context as needed (auth, session, etc.)
}

// Status page renderer type
type StatusPageRenderer = (
	error: HttpError,
	ctx: ExceptionContext,
) => Response | Promise<Response>;

// Status page range (e.g., '404', '500..599')
type StatusPageRange = string;

/**
 * Base Exception Handler
 * Override this class in your application
 */
export class ExceptionHandler {
	/**
	 * Enable/disable debug mode
	 * Set to false in production to hide stack traces
	 */
	protected debug = process.env.NODE_ENV !== "production";

	/**
	 * Status codes to ignore when reporting
	 * These are expected errors that don't need logging
	 */
	protected ignoreStatuses: number[] = [400, 401, 403, 404, 422];

	/**
	 * Error codes to ignore when reporting
	 */
	protected ignoreCodes: string[] = [
		"E_ROUTE_NOT_FOUND",
		"E_VALIDATION_ERROR",
		"E_UNAUTHORIZED",
	];

	/**
	 * Status pages for custom error responses
	 */
	protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {};

	/**
	 * Handle the exception and return a response
	 */
	async handle(error: unknown, ctx: ExceptionContext): Promise<Response> {
		const httpError = this.normalizeError(error);

		// Check if exception has its own handle method
		if (this.hasSelfHandle(error)) {
			return (error as { handle: (e: HttpError, ctx: ExceptionContext) => Promise<Response> }).handle(httpError, ctx);
		}

		// Check for status page
		const statusPageHandler = this.findStatusPage(httpError.status);
		if (statusPageHandler) {
			return statusPageHandler(httpError, ctx);
		}

		// Default JSON response
		return this.makeErrorResponse(httpError);
	}

	/**
	 * Report the exception (logging, external services)
	 */
	async report(error: unknown, ctx: ExceptionContext): Promise<void> {
		const httpError = this.normalizeError(error);

		// Check if exception has its own report method
		if (this.hasSelfReport(error)) {
			return (error as { report: (e: HttpError, ctx: ExceptionContext) => Promise<void> }).report(httpError, ctx);
		}

		// Check if should report
		if (!this.shouldReport(httpError)) {
			return;
		}

		// Get context for logging
		const context = this.context(ctx);

		// Log the error
		ctx.logger.error(
			{
				err: httpError,
				...context,
			},
			httpError.message,
		);
	}

	/**
	 * Determine if exception should be reported
	 */
	protected shouldReport(error: HttpError): boolean {
		// Skip ignored status codes
		if (this.ignoreStatuses.includes(error.status)) {
			return false;
		}

		// Skip ignored error codes
		if (this.ignoreCodes.includes(error.code)) {
			return false;
		}

		return true;
	}

	/**
	 * Get context to include in log messages
	 */
	protected context(ctx: ExceptionContext): Record<string, unknown> {
		return {
			requestId: ctx.requestId,
			url: ctx.request.url,
			method: ctx.request.method,
		};
	}

	/**
	 * Normalize any error to HttpError
	 */
	protected normalizeError(error: unknown): HttpError {
		if (this.isHttpError(error)) {
			return error;
		}

		if (error instanceof Error) {
			return {
				name: error.name,
				message: error.message,
				stack: error.stack,
				status: 500,
				code: "E_INTERNAL_ERROR",
			};
		}

		return {
			name: "UnknownError",
			message: String(error),
			status: 500,
			code: "E_UNKNOWN_ERROR",
		};
	}

	/**
	 * Check if error is HttpError
	 */
	protected isHttpError(error: unknown): error is HttpError {
		return (
			error instanceof Error &&
			typeof (error as HttpError).status === "number" &&
			typeof (error as HttpError).code === "string"
		);
	}

	/**
	 * Check if error has self-handle method
	 */
	protected hasSelfHandle(error: unknown): boolean {
		return (
			error !== null &&
			typeof error === "object" &&
			"handle" in error &&
			typeof (error as { handle: unknown }).handle === "function"
		);
	}

	/**
	 * Check if error has self-report method
	 */
	protected hasSelfReport(error: unknown): boolean {
		return (
			error !== null &&
			typeof error === "object" &&
			"report" in error &&
			typeof (error as { report: unknown }).report === "function"
		);
	}

	/**
	 * Find status page handler for given status
	 */
	protected findStatusPage(status: number): StatusPageRenderer | undefined {
		// Exact match
		if (this.statusPages[status.toString()]) {
			return this.statusPages[status.toString()];
		}

		// Range match (e.g., '500..599')
		for (const range of Object.keys(this.statusPages)) {
			if (range.includes("..")) {
				const [start, end] = range.split("..").map(Number);
				if (status >= start && status <= end) {
					return this.statusPages[range];
				}
			}
		}

		return undefined;
	}

	/**
	 * Create JSON error response
	 */
	protected makeErrorResponse(error: HttpError): Response {
		const body: Record<string, unknown> = {
			error: {
				message: error.message,
				code: error.code,
			},
		};

		// Include errors array if present
		if (error.errors) {
			body.error = { ...body.error as object, errors: error.errors };
		}

		// Include stack trace in debug mode
		if (this.debug && error.stack) {
			body.error = { ...body.error as object, stack: error.stack };
		}

		return Response.json(body, { status: error.status });
	}
}

// Export singleton instance
export const exceptionHandler = new ExceptionHandler();

// Export types
export type { StatusPageRenderer, StatusPageRange, ExceptionContext };
