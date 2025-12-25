/**
 * Base Exception Class
 * Inspired by AdonisJS Exception pattern
 *
 * Features:
 * - Static status and code defaults
 * - Self-handling (handle method)
 * - Self-reporting (report method)
 * - Fluent interface for building exceptions
 */

import type { ExceptionContext, HttpError } from "./exception-handler";
import { logger } from "../logging/logger";

/**
 * Base Exception class
 * Extend this to create custom exceptions
 */
export class Exception extends Error implements HttpError {
	/**
	 * Default HTTP status code
	 */
	static status = 500;

	/**
	 * Default error code
	 */
	static code = "E_EXCEPTION";

	/**
	 * HTTP status code
	 */
	status: number;

	/**
	 * Error code for programmatic handling
	 */
	code: string;

	/**
	 * Additional error details
	 */
	errors?: unknown[];

	constructor(
		message: string,
		options?: {
			status?: number;
			code?: string;
			cause?: Error;
		},
	) {
		super(message, { cause: options?.cause });

		this.name = this.constructor.name;

		// Use instance options or static defaults
		const ctor = this.constructor as typeof Exception;
		this.status = options?.status ?? ctor.status;
		this.code = options?.code ?? ctor.code;

		// Capture stack trace
		Error.captureStackTrace(this, this.constructor);
	}

	/**
	 * Handle the exception (convert to HTTP response)
	 * Override in subclasses for custom handling
	 */
	async handle(error: this, ctx: ExceptionContext): Promise<Response> {
		return Response.json(
			{
				error: {
					message: error.message,
					code: error.code,
					...(error.errors && { errors: error.errors }),
				},
			},
			{ status: error.status },
		);
	}

	/**
	 * Report the exception (logging, external services)
	 * Override in subclasses for custom reporting
	 */
	async report(error: this, ctx: ExceptionContext): Promise<void> {
		ctx.logger.error({ err: error }, error.message);
	}
}

// ============================================================
// Pre-built Exception Classes
// ============================================================

/**
 * 400 Bad Request
 */
export class BadRequestException extends Exception {
	static status = 400;
	static code = "E_BAD_REQUEST";
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedException extends Exception {
	static status = 401;
	static code = "E_UNAUTHORIZED";

	async report(): Promise<void> {
		// Don't log auth failures by default (too noisy)
	}
}

/**
 * 403 Forbidden
 */
export class ForbiddenException extends Exception {
	static status = 403;
	static code = "E_FORBIDDEN";
}

/**
 * 404 Not Found
 */
export class NotFoundException extends Exception {
	static status = 404;
	static code = "E_NOT_FOUND";

	async report(): Promise<void> {
		// Don't log 404s by default
	}
}

/**
 * 409 Conflict
 */
export class ConflictException extends Exception {
	static status = 409;
	static code = "E_CONFLICT";
}

/**
 * 422 Unprocessable Entity (Validation Error)
 */
export class ValidationException extends Exception {
	static status = 422;
	static code = "E_VALIDATION_ERROR";

	constructor(
		message: string,
		errors: Array<{ field: string; message: string; rule?: string }>,
	) {
		super(message);
		this.errors = errors;
	}

	async handle(error: this): Promise<Response> {
		return Response.json(
			{
				error: {
					message: error.message,
					code: error.code,
					errors: error.errors,
				},
			},
			{ status: error.status },
		);
	}

	async report(): Promise<void> {
		// Don't log validation errors by default
	}
}

/**
 * 429 Too Many Requests
 */
export class RateLimitException extends Exception {
	static status = 429;
	static code = "E_RATE_LIMIT";

	retryAfter?: number;

	constructor(message: string, retryAfter?: number) {
		super(message);
		this.retryAfter = retryAfter;
	}

	async handle(error: this): Promise<Response> {
		const headers: HeadersInit = {};
		if (error.retryAfter) {
			headers["Retry-After"] = error.retryAfter.toString();
		}

		return Response.json(
			{
				error: {
					message: error.message,
					code: error.code,
					retryAfter: error.retryAfter,
				},
			},
			{ status: error.status, headers },
		);
	}
}

/**
 * 500 Internal Server Error
 */
export class InternalServerException extends Exception {
	static status = 500;
	static code = "E_INTERNAL_SERVER_ERROR";
}

/**
 * 502 Bad Gateway
 */
export class BadGatewayException extends Exception {
	static status = 502;
	static code = "E_BAD_GATEWAY";
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableException extends Exception {
	static status = 503;
	static code = "E_SERVICE_UNAVAILABLE";

	async handle(error: this): Promise<Response> {
		return Response.json(
			{
				error: {
					message: error.message,
					code: error.code,
				},
			},
			{
				status: error.status,
				headers: {
					"Retry-After": "60",
				},
			},
		);
	}
}

/**
 * 504 Gateway Timeout
 */
export class GatewayTimeoutException extends Exception {
	static status = 504;
	static code = "E_GATEWAY_TIMEOUT";
}

// ============================================================
// Domain-Specific Exceptions
// ============================================================

/**
 * Database row not found
 */
export class RowNotFoundException extends Exception {
	static status = 404;
	static code = "E_ROW_NOT_FOUND";

	model?: string;

	constructor(message: string, model?: string) {
		super(message);
		this.model = model;
	}

	async handle(error: this): Promise<Response> {
		return Response.json(
			{
				error: {
					message: error.message,
					code: error.code,
					model: error.model,
				},
			},
			{ status: error.status },
		);
	}
}

/**
 * Payment failed
 */
export class PaymentException extends Exception {
	static status = 402;
	static code = "E_PAYMENT_FAILED";

	paymentId?: string;
	reason?: string;

	constructor(
		message: string,
		options?: { paymentId?: string; reason?: string },
	) {
		super(message);
		this.paymentId = options?.paymentId;
		this.reason = options?.reason;
	}

	async report(error: this, ctx: ExceptionContext): Promise<void> {
		// Always log payment failures
		ctx.logger.error(
			{
				err: error,
				paymentId: error.paymentId,
				reason: error.reason,
			},
			`Payment failed: ${error.message}`,
		);
	}
}

/**
 * External service error
 */
export class ExternalServiceException extends Exception {
	static status = 502;
	static code = "E_EXTERNAL_SERVICE";

	service: string;
	originalError?: Error;

	constructor(
		message: string,
		service: string,
		originalError?: Error,
	) {
		super(message, { cause: originalError });
		this.service = service;
		this.originalError = originalError;
	}

	async report(error: this, ctx: ExceptionContext): Promise<void> {
		ctx.logger.error(
			{
				err: error,
				service: error.service,
				originalError: error.originalError?.message,
			},
			`External service error: ${error.service}`,
		);
	}
}

// ============================================================
// Factory Functions
// ============================================================

/**
 * Create an HTTP exception with fluent interface
 */
export function createException(
	message: string,
	status: number,
	code: string,
): Exception {
	return new Exception(message, { status, code });
}

/**
 * Throw if condition is true
 */
export function throwIf(
	condition: boolean,
	exception: Exception | (() => Exception),
): void {
	if (condition) {
		throw typeof exception === "function" ? exception() : exception;
	}
}

/**
 * Throw if value is null/undefined
 */
export function throwIfNull<T>(
	value: T | null | undefined,
	exception: Exception | (() => Exception),
): T {
	if (value === null || value === undefined) {
		throw typeof exception === "function" ? exception() : exception;
	}
	return value;
}
