/**
 * PostHog Client Utilities
 * Server-side and utility functions for PostHog
 */

import { PostHog } from "posthog-node";

// Server-side PostHog client (singleton)
let posthogServerClient: PostHog | null = null;

export function getPostHogServer(): PostHog {
	if (!posthogServerClient) {
		posthogServerClient = new PostHog(process.env.POSTHOG_API_KEY!, {
			host: process.env.POSTHOG_HOST || "https://app.posthog.com",
			flushAt: 1, // Flush immediately in serverless
			flushInterval: 0,
		});
	}
	return posthogServerClient;
}

// Capture event from server
export async function captureServerEvent(
	distinctId: string,
	event: string,
	properties?: Record<string, unknown>,
) {
	const posthog = getPostHogServer();

	posthog.capture({
		distinctId,
		event,
		properties: {
			...properties,
			$lib: "posthog-node",
			source: "server",
		},
	});

	// Flush in serverless environment
	await posthog.flush();
}

// Identify user from server
export async function identifyUser(
	distinctId: string,
	properties: Record<string, unknown>,
) {
	const posthog = getPostHogServer();

	posthog.identify({
		distinctId,
		properties,
	});

	await posthog.flush();
}

// Alias user (link anonymous to identified)
export async function aliasUser(distinctId: string, alias: string) {
	const posthog = getPostHogServer();

	posthog.alias({
		distinctId,
		alias,
	});

	await posthog.flush();
}

// Group analytics
export async function groupIdentify(
	groupType: string,
	groupKey: string,
	properties: Record<string, unknown>,
) {
	const posthog = getPostHogServer();

	posthog.groupIdentify({
		groupType,
		groupKey,
		properties,
	});

	await posthog.flush();
}

// Check feature flag server-side
export async function isFeatureEnabled(
	distinctId: string,
	flag: string,
	options?: {
		groups?: Record<string, string>;
		personProperties?: Record<string, unknown>;
		groupProperties?: Record<string, Record<string, unknown>>;
	},
): Promise<boolean> {
	const posthog = getPostHogServer();

	const result = await posthog.isFeatureEnabled(flag, distinctId, {
		groups: options?.groups,
		personProperties: options?.personProperties,
		groupProperties: options?.groupProperties,
	});

	return result ?? false;
}

// Get all feature flags for user
export async function getAllFlags(
	distinctId: string,
	options?: {
		groups?: Record<string, string>;
		personProperties?: Record<string, unknown>;
		groupProperties?: Record<string, Record<string, unknown>>;
	},
): Promise<Record<string, boolean | string>> {
	const posthog = getPostHogServer();

	const flags = await posthog.getAllFlags(distinctId, {
		groups: options?.groups,
		personProperties: options?.personProperties,
		groupProperties: options?.groupProperties,
	});

	return flags;
}

// Get feature flag payload
export async function getFeatureFlagPayload<T = unknown>(
	distinctId: string,
	flag: string,
): Promise<T | undefined> {
	const posthog = getPostHogServer();

	const payload = await posthog.getFeatureFlagPayload(flag, distinctId);

	return payload as T | undefined;
}

// Shutdown client (for cleanup)
export async function shutdownPostHog() {
	if (posthogServerClient) {
		await posthogServerClient.shutdown();
		posthogServerClient = null;
	}
}

// Helper for Next.js API routes
export function withPostHogTracking<T>(
	handler: (
		req: Request,
		context: { userId?: string },
	) => Promise<T>,
) {
	return async (req: Request): Promise<T> => {
		const startTime = Date.now();
		const userId = req.headers.get("x-user-id") || "anonymous";

		try {
			const result = await handler(req, { userId });

			// Track successful API call
			await captureServerEvent(userId, "api_call", {
				endpoint: new URL(req.url).pathname,
				method: req.method,
				duration_ms: Date.now() - startTime,
				success: true,
			});

			return result;
		} catch (error) {
			// Track failed API call
			await captureServerEvent(userId, "api_call", {
				endpoint: new URL(req.url).pathname,
				method: req.method,
				duration_ms: Date.now() - startTime,
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			});

			throw error;
		}
	};
}
