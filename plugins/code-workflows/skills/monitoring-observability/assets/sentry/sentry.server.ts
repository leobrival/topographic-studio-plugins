/**
 * Sentry Server Configuration
 * For Node.js server-side error tracking
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

Sentry.init({
	dsn: SENTRY_DSN,

	// Environment configuration
	environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
	release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT,

	// Performance Monitoring
	tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

	// Profiling
	profilesSampleRate: 0.1, // Profile 10% of transactions

	// Integrations
	integrations: [
		// Database query tracking
		Sentry.prismaIntegration(),

		// HTTP request tracking
		Sentry.httpIntegration({
			tracing: true,
		}),

		// Node.js specific
		Sentry.onUncaughtExceptionIntegration({
			exitEvenIfOtherHandlersAreRegistered: false,
		}),
		Sentry.onUnhandledRejectionIntegration({
			mode: "warn",
		}),

		// Request data
		Sentry.requestDataIntegration({
			include: {
				cookies: false, // Don't include cookies
				data: true,
				headers: true,
				ip: false, // Don't include IP
				query_string: true,
				url: true,
				user: true,
			},
		}),
	],

	// Filtering
	beforeSend(event, hint) {
		const error = hint.originalException;

		// Skip expected errors
		if (error instanceof Error) {
			// Skip validation errors
			if (error.name === "ValidationError") {
				return null;
			}

			// Skip auth errors (expected)
			if (error.message.includes("Unauthorized")) {
				return null;
			}

			// Skip rate limiting
			if (error.message.includes("Too Many Requests")) {
				return null;
			}
		}

		// Scrub sensitive data from request
		if (event.request) {
			// Remove auth headers
			if (event.request.headers) {
				delete event.request.headers.authorization;
				delete event.request.headers.cookie;
				delete event.request.headers["x-api-key"];
			}

			// Redact sensitive body fields
			if (event.request.data && typeof event.request.data === "object") {
				const data = event.request.data as Record<string, unknown>;
				const sensitiveFields = ["password", "token", "secret", "apiKey", "creditCard"];

				for (const field of sensitiveFields) {
					if (field in data) {
						data[field] = "[REDACTED]";
					}
				}
			}
		}

		// Scrub user data
		if (event.user) {
			// Keep only ID, redact email if present
			event.user = {
				id: event.user.id,
				email: event.user.email ? "[REDACTED]" : undefined,
			};
		}

		return event;
	},

	// Before sending transaction
	beforeSendTransaction(event) {
		// Filter out health check transactions
		if (event.transaction === "GET /api/health") {
			return null;
		}

		// Filter out static file requests
		if (event.transaction?.startsWith("GET /_next/")) {
			return null;
		}

		return event;
	},

	// Ignore specific errors
	ignoreErrors: [
		// Expected HTTP errors
		"ECONNREFUSED",
		"ECONNRESET",
		"ETIMEDOUT",
		// Rate limiting
		"Too Many Requests",
		// Auth expected errors
		"JsonWebTokenError",
		"TokenExpiredError",
	],
});

// Export for manual usage
export { Sentry };

// Helper to add request context
export function withRequestContext<T>(
	request: Request,
	fn: () => Promise<T>,
): Promise<T> {
	return Sentry.withScope(async (scope) => {
		// Add request data
		scope.setSDKProcessingMetadata({
			request: {
				url: request.url,
				method: request.method,
				headers: Object.fromEntries(request.headers.entries()),
			},
		});

		// Extract and set trace context if present
		const traceHeader = request.headers.get("sentry-trace");
		const baggageHeader = request.headers.get("baggage");

		if (traceHeader) {
			const traceData = Sentry.extractTraceparentData(traceHeader);
			if (traceData) {
				scope.setContext("trace", traceData);
			}
		}

		return fn();
	});
}

// Helper to capture API errors with context
export function captureApiError(
	error: Error,
	context: {
		endpoint: string;
		method: string;
		userId?: string;
		requestId?: string;
		statusCode?: number;
		extra?: Record<string, unknown>;
	},
) {
	Sentry.withScope((scope) => {
		scope.setTag("endpoint", context.endpoint);
		scope.setTag("method", context.method);

		if (context.statusCode) {
			scope.setTag("status_code", context.statusCode.toString());
		}

		if (context.requestId) {
			scope.setTag("request_id", context.requestId);
		}

		if (context.userId) {
			scope.setUser({ id: context.userId });
		}

		if (context.extra) {
			for (const [key, value] of Object.entries(context.extra)) {
				scope.setExtra(key, value);
			}
		}

		scope.setLevel("error");
		Sentry.captureException(error);
	});
}

// Helper to track database operations
export function trackDatabaseOperation<T>(
	operation: string,
	table: string,
	fn: () => Promise<T>,
): Promise<T> {
	return Sentry.startSpan(
		{
			name: `db.${operation}`,
			op: "db.query",
			attributes: {
				"db.operation": operation,
				"db.table": table,
			},
		},
		fn,
	);
}

// Helper to track external API calls
export function trackExternalApi<T>(
	service: string,
	endpoint: string,
	fn: () => Promise<T>,
): Promise<T> {
	return Sentry.startSpan(
		{
			name: `${service}.${endpoint}`,
			op: "http.client",
			attributes: {
				"http.service": service,
				"http.endpoint": endpoint,
			},
		},
		fn,
	);
}
