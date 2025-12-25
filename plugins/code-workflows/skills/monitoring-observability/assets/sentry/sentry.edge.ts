/**
 * Sentry Edge Configuration
 * For Edge Runtime (Middleware, Edge API Routes)
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

Sentry.init({
	dsn: SENTRY_DSN,

	// Environment configuration
	environment: process.env.VERCEL_ENV || "development",
	release: process.env.VERCEL_GIT_COMMIT_SHA,

	// Performance Monitoring (lower for edge)
	tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,

	// Edge-specific settings
	integrations: [
		Sentry.winterCGFetchIntegration(),
	],

	// Filtering for edge
	beforeSend(event, hint) {
		const error = hint.originalException;

		// Filter expected edge errors
		if (error instanceof Error) {
			// Redirect errors are expected
			if (error.message.includes("NEXT_REDIRECT")) {
				return null;
			}

			// Not found errors
			if (error.message.includes("NEXT_NOT_FOUND")) {
				return null;
			}
		}

		return event;
	},

	// Ignore edge-specific errors
	ignoreErrors: [
		"NEXT_REDIRECT",
		"NEXT_NOT_FOUND",
		"Invariant: headers() expects",
		"Invariant: cookies() expects",
	],
});

export { Sentry };

// Helper for middleware error handling
export function captureMiddlewareError(
	error: Error,
	request: Request,
	context?: {
		pathname?: string;
		matcher?: string;
	},
) {
	Sentry.withScope((scope) => {
		scope.setTag("runtime", "edge");
		scope.setTag("type", "middleware");

		if (context?.pathname) {
			scope.setTag("pathname", context.pathname);
		}

		if (context?.matcher) {
			scope.setTag("matcher", context.matcher);
		}

		scope.setContext("request", {
			url: request.url,
			method: request.method,
			headers: Object.fromEntries(request.headers.entries()),
		});

		Sentry.captureException(error);
	});
}

// Wrapper for edge functions
export function withEdgeErrorHandling<T extends (...args: unknown[]) => Promise<Response>>(
	handler: T,
	options?: {
		name?: string;
	},
): T {
	return (async (...args: Parameters<T>) => {
		return Sentry.withScope(async (scope) => {
			scope.setTag("runtime", "edge");

			if (options?.name) {
				scope.setTransactionName(options.name);
			}

			try {
				return await handler(...args);
			} catch (error) {
				if (error instanceof Error) {
					// Don't capture redirect/not-found
					if (
						!error.message.includes("NEXT_REDIRECT") &&
						!error.message.includes("NEXT_NOT_FOUND")
					) {
						Sentry.captureException(error);
					}
				}
				throw error;
			}
		});
	}) as T;
}
