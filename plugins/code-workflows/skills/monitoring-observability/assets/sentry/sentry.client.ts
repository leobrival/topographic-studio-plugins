/**
 * Sentry Client Configuration
 * For browser/client-side error tracking
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
	dsn: SENTRY_DSN,

	// Environment configuration
	environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
	release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

	// Performance Monitoring
	tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

	// Session Replay
	replaysSessionSampleRate: 0.1, // 10% of sessions
	replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

	// Integrations
	integrations: [
		Sentry.replayIntegration({
			// Mask all text content
			maskAllText: false,
			// Block media elements
			blockAllMedia: false,
			// Mask specific inputs
			maskAllInputs: true,
		}),
		Sentry.browserTracingIntegration({
			// Trace propagation targets
			tracePropagationTargets: ["localhost", /^https:\/\/.*\.vercel\.app/],
		}),
		Sentry.feedbackIntegration({
			colorScheme: "system",
			buttonLabel: "Report a Bug",
			submitButtonLabel: "Send Report",
			formTitle: "Report a Bug",
			messagePlaceholder: "What happened?",
		}),
	],

	// Filtering
	beforeSend(event, hint) {
		// Filter out specific errors
		const error = hint.originalException;

		if (error instanceof Error) {
			// Ignore network errors
			if (error.message.includes("NetworkError")) {
				return null;
			}

			// Ignore cancelled requests
			if (error.message.includes("AbortError")) {
				return null;
			}

			// Ignore extension errors
			if (error.stack?.includes("chrome-extension://")) {
				return null;
			}
		}

		// Scrub sensitive data
		if (event.request?.headers) {
			delete event.request.headers.Authorization;
			delete event.request.headers.Cookie;
		}

		return event;
	},

	// Breadcrumbs filtering
	beforeBreadcrumb(breadcrumb) {
		// Filter out noisy breadcrumbs
		if (breadcrumb.category === "console" && breadcrumb.level === "debug") {
			return null;
		}

		// Redact sensitive URLs
		if (breadcrumb.data?.url?.includes("/api/auth")) {
			breadcrumb.data.url = "[REDACTED]";
		}

		return breadcrumb;
	},

	// Ignore specific errors
	ignoreErrors: [
		// Browser extensions
		"top.GLOBALS",
		"originalCreateNotification",
		"canvas.contentDocument",
		"MyApp_RemoveAllHighlights",
		"http://tt.teletrader.net/",
		"atomicFindClose",
		// Facebook borance
		/fb_xd_fragment/,
		// Chrome extensions
		/extensions\//i,
		/^chrome:\/\//i,
		// Common network issues
		"Failed to fetch",
		"NetworkError",
		"Load failed",
		// User-generated
		"ResizeObserver loop",
	],

	// Deny URLs
	denyUrls: [
		// Chrome extensions
		/extensions\//i,
		/^chrome:\/\//i,
		/^chrome-extension:\/\//i,
		// Firefox extensions
		/^moz-extension:\/\//i,
		// Safari extensions
		/^safari-extension:\/\//i,
		// Third-party scripts
		/gtm\.js/i,
		/analytics/i,
	],
});

// Export for manual usage
export { Sentry };

// Helper to capture with context
export function captureError(
	error: Error,
	context?: {
		tags?: Record<string, string>;
		extra?: Record<string, unknown>;
		user?: { id: string; email?: string };
		level?: Sentry.SeverityLevel;
	},
) {
	Sentry.withScope((scope) => {
		if (context?.tags) {
			for (const [key, value] of Object.entries(context.tags)) {
				scope.setTag(key, value);
			}
		}

		if (context?.extra) {
			for (const [key, value] of Object.entries(context.extra)) {
				scope.setExtra(key, value);
			}
		}

		if (context?.user) {
			scope.setUser(context.user);
		}

		if (context?.level) {
			scope.setLevel(context.level);
		}

		Sentry.captureException(error);
	});
}

// Helper for user feedback
export function showReportDialog(eventId?: string) {
	Sentry.showReportDialog({
		eventId: eventId || Sentry.lastEventId(),
		title: "It looks like we're having issues.",
		subtitle: "Our team has been notified.",
		subtitle2: "If you'd like to help, tell us what happened below.",
	});
}
