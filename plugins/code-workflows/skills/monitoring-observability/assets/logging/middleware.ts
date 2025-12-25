/**
 * HTTP Logging Middleware
 * Request/Response logging for various frameworks
 */

import { logger, type RequestContext } from "./logger";
import { randomUUID } from "node:crypto";

// Request ID header name
const REQUEST_ID_HEADER = "x-request-id";

// Next.js Middleware
export function withRequestLogging(
	handler: (
		request: Request,
		context: { requestId: string; logger: typeof logger },
	) => Promise<Response>,
) {
	return async (request: Request): Promise<Response> => {
		const requestId =
			request.headers.get(REQUEST_ID_HEADER) || randomUUID();
		const startTime = Date.now();

		// Create request-scoped logger
		const requestLogger = logger.withRequest({
			requestId,
			method: request.method,
			path: new URL(request.url).pathname,
		});

		// Log request start
		requestLogger.info("Request started", {
			url: request.url,
			headers: sanitizeHeaders(request.headers),
		});

		try {
			const response = await handler(request, {
				requestId,
				logger: requestLogger,
			});

			// Log request completion
			const durationMs = Date.now() - startTime;
			requestLogger.info("Request completed", {
				statusCode: response.status,
				durationMs,
			});

			// Add request ID to response headers
			const headers = new Headers(response.headers);
			headers.set(REQUEST_ID_HEADER, requestId);

			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers,
			});
		} catch (error) {
			const durationMs = Date.now() - startTime;
			requestLogger.error("Request failed", error, { durationMs });
			throw error;
		}
	};
}

// Express-style middleware
export function expressLoggingMiddleware() {
	return (
		req: {
			method: string;
			url: string;
			headers: Record<string, string | string[] | undefined>;
			ip?: string;
		},
		res: {
			statusCode: number;
			on: (event: string, callback: () => void) => void;
			setHeader: (name: string, value: string) => void;
		},
		next: () => void,
	) => {
		const requestId =
			(req.headers[REQUEST_ID_HEADER] as string) || randomUUID();
		const startTime = Date.now();

		// Create request-scoped logger
		const requestLogger = logger.withRequest({
			requestId,
			method: req.method,
			path: req.url,
			ip: req.ip,
			userAgent: req.headers["user-agent"] as string,
		});

		// Add request ID to response
		res.setHeader(REQUEST_ID_HEADER, requestId);

		// Log request start
		requestLogger.info("Request started", {
			url: req.url,
		});

		// Log on response finish
		res.on("finish", () => {
			const durationMs = Date.now() - startTime;
			const level = res.statusCode >= 400 ? "warn" : "info";

			requestLogger[level]("Request completed", {
				statusCode: res.statusCode,
				durationMs,
			});
		});

		next();
	};
}

// Hono middleware
export function honoLoggingMiddleware() {
	return async (
		c: {
			req: {
				method: string;
				url: string;
				header: (name: string) => string | undefined;
			};
			res: {
				headers: Headers;
			};
			header: (name: string, value: string) => void;
			set: (key: string, value: unknown) => void;
		},
		next: () => Promise<void>,
	) => {
		const requestId = c.req.header(REQUEST_ID_HEADER) || randomUUID();
		const startTime = Date.now();

		const url = new URL(c.req.url);
		const requestLogger = logger.withRequest({
			requestId,
			method: c.req.method,
			path: url.pathname,
		});

		// Set request ID in context and response
		c.set("requestId", requestId);
		c.set("logger", requestLogger);
		c.header(REQUEST_ID_HEADER, requestId);

		requestLogger.info("Request started", {
			url: c.req.url,
		});

		try {
			await next();

			const durationMs = Date.now() - startTime;
			requestLogger.info("Request completed", {
				durationMs,
			});
		} catch (error) {
			const durationMs = Date.now() - startTime;
			requestLogger.error("Request failed", error, { durationMs });
			throw error;
		}
	};
}

// Helper to sanitize headers for logging
function sanitizeHeaders(headers: Headers): Record<string, string> {
	const sanitized: Record<string, string> = {};
	const sensitiveHeaders = [
		"authorization",
		"cookie",
		"x-api-key",
		"x-auth-token",
	];

	headers.forEach((value, key) => {
		if (sensitiveHeaders.includes(key.toLowerCase())) {
			sanitized[key] = "[REDACTED]";
		} else {
			sanitized[key] = value;
		}
	});

	return sanitized;
}

// Generate correlation ID
export function generateRequestId(): string {
	return randomUUID();
}

// Extract request ID from headers
export function getRequestId(headers: Headers | Record<string, string>): string {
	if (headers instanceof Headers) {
		return headers.get(REQUEST_ID_HEADER) || generateRequestId();
	}
	return headers[REQUEST_ID_HEADER] || generateRequestId();
}

// Create child logger for downstream services
export function createServiceLogger(
	requestId: string,
	serviceName: string,
): typeof logger {
	return logger.child({
		requestId,
		service: serviceName,
	});
}
