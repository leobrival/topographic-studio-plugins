"use client";

/**
 * PostHog Provider for React/Next.js
 * Provides analytics context throughout the app
 */

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

// Initialize PostHog
if (typeof window !== "undefined") {
	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
		api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",

		// Capture settings
		capture_pageview: false, // We'll handle this manually
		capture_pageleave: true,
		autocapture: true,

		// Session recording
		disable_session_recording: false,
		session_recording: {
			maskAllInputs: true,
			maskTextSelector: "[data-mask]",
		},

		// Privacy
		respect_dnt: true,
		opt_out_capturing_by_default: false,

		// Performance
		loaded: (posthog) => {
			if (process.env.NODE_ENV === "development") {
				posthog.debug();
			}
		},

		// Feature flags
		bootstrap: {
			featureFlags: {},
		},

		// Persistence
		persistence: "localStorage+cookie",

		// Cross-subdomain tracking
		cross_subdomain_cookie: true,
	});
}

// Pageview tracker component
function PostHogPageView() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		if (pathname) {
			let url = window.origin + pathname;
			if (searchParams.toString()) {
				url = `${url}?${searchParams.toString()}`;
			}

			posthog.capture("$pageview", {
				$current_url: url,
				$pathname: pathname,
			});
		}
	}, [pathname, searchParams]);

	return null;
}

// Main provider component
export function PostHogProvider({ children }: { children: React.ReactNode }) {
	return (
		<PHProvider client={posthog}>
			<Suspense fallback={null}>
				<PostHogPageView />
			</Suspense>
			{children}
		</PHProvider>
	);
}

// Hook to identify users
export function useIdentifyUser() {
	return (user: {
		id: string;
		email?: string;
		name?: string;
		plan?: string;
		[key: string]: unknown;
	}) => {
		posthog.identify(user.id, {
			email: user.email,
			name: user.name,
			plan: user.plan,
			...user,
		});
	};
}

// Hook to reset user (on logout)
export function useResetUser() {
	return () => {
		posthog.reset();
	};
}

// Hook for feature flags
export function useFeatureFlag(flag: string): boolean | undefined {
	const [enabled, setEnabled] = useState<boolean | undefined>(undefined);

	useEffect(() => {
		// Get initial value
		setEnabled(posthog.isFeatureEnabled(flag));

		// Subscribe to changes
		return posthog.onFeatureFlags(() => {
			setEnabled(posthog.isFeatureEnabled(flag));
		});
	}, [flag]);

	return enabled;
}

// Hook for feature flag with payload
export function useFeatureFlagPayload<T = unknown>(flag: string): T | undefined {
	const [payload, setPayload] = useState<T | undefined>(undefined);

	useEffect(() => {
		setPayload(posthog.getFeatureFlagPayload(flag) as T);

		return posthog.onFeatureFlags(() => {
			setPayload(posthog.getFeatureFlagPayload(flag) as T);
		});
	}, [flag]);

	return payload;
}

// Import useState for hooks
import { useState } from "react";

// Export posthog instance
export { posthog };
