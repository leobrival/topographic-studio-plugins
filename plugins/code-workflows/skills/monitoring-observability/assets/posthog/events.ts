/**
 * PostHog Event Definitions
 * Type-safe event tracking with standardized properties
 */

import posthog from "posthog-js";

// Event property types
interface BaseEventProperties {
	timestamp?: number;
	source?: "web" | "mobile" | "api";
}

// User events
interface UserEvents {
	user_signed_up: {
		method: "email" | "google" | "github";
		referrer?: string;
	};
	user_logged_in: {
		method: "email" | "google" | "github";
	};
	user_logged_out: Record<string, never>;
	user_profile_updated: {
		fields_updated: string[];
	};
	user_deleted_account: {
		reason?: string;
	};
}

// Subscription events
interface SubscriptionEvents {
	subscription_started: {
		plan: string;
		price: number;
		currency: string;
		billing_period: "monthly" | "yearly";
	};
	subscription_upgraded: {
		from_plan: string;
		to_plan: string;
		price_difference: number;
	};
	subscription_downgraded: {
		from_plan: string;
		to_plan: string;
	};
	subscription_cancelled: {
		plan: string;
		reason?: string;
		feedback?: string;
	};
	subscription_renewed: {
		plan: string;
		price: number;
	};
}

// Feature usage events
interface FeatureEvents {
	feature_used: {
		feature_name: string;
		context?: string;
	};
	feature_limit_reached: {
		feature_name: string;
		limit: number;
		current_usage: number;
	};
	feature_error: {
		feature_name: string;
		error_type: string;
		error_message: string;
	};
}

// Navigation events
interface NavigationEvents {
	page_viewed: {
		page_name: string;
		referrer?: string;
	};
	search_performed: {
		query: string;
		results_count: number;
		filters?: Record<string, unknown>;
	};
	cta_clicked: {
		cta_name: string;
		cta_location: string;
		destination?: string;
	};
}

// Onboarding events
interface OnboardingEvents {
	onboarding_started: {
		source?: string;
	};
	onboarding_step_completed: {
		step_number: number;
		step_name: string;
		time_spent_seconds?: number;
	};
	onboarding_completed: {
		total_time_seconds: number;
		steps_completed: number;
	};
	onboarding_skipped: {
		skipped_at_step: number;
		step_name: string;
	};
}

// E-commerce events
interface EcommerceEvents {
	product_viewed: {
		product_id: string;
		product_name: string;
		price: number;
		category?: string;
	};
	product_added_to_cart: {
		product_id: string;
		product_name: string;
		price: number;
		quantity: number;
	};
	cart_viewed: {
		cart_total: number;
		items_count: number;
	};
	checkout_started: {
		cart_total: number;
		items_count: number;
	};
	purchase_completed: {
		order_id: string;
		total: number;
		currency: string;
		items: Array<{
			product_id: string;
			quantity: number;
			price: number;
		}>;
	};
}

// Combined events type
type AllEvents = UserEvents &
	SubscriptionEvents &
	FeatureEvents &
	NavigationEvents &
	OnboardingEvents &
	EcommerceEvents;

// Type-safe capture function
export function capture<K extends keyof AllEvents>(
	event: K,
	properties: AllEvents[K] & BaseEventProperties,
) {
	posthog.capture(event, {
		...properties,
		timestamp: properties.timestamp || Date.now(),
	});
}

// Specialized capture functions for common patterns

// User tracking
export const trackUser = {
	signUp: (method: "email" | "google" | "github", referrer?: string) => {
		capture("user_signed_up", { method, referrer });
	},

	login: (method: "email" | "google" | "github") => {
		capture("user_logged_in", { method });
	},

	logout: () => {
		capture("user_logged_out", {});
	},

	updateProfile: (fields: string[]) => {
		capture("user_profile_updated", { fields_updated: fields });
	},
};

// Subscription tracking
export const trackSubscription = {
	start: (plan: string, price: number, currency: string, period: "monthly" | "yearly") => {
		capture("subscription_started", {
			plan,
			price,
			currency,
			billing_period: period,
		});
	},

	upgrade: (fromPlan: string, toPlan: string, priceDiff: number) => {
		capture("subscription_upgraded", {
			from_plan: fromPlan,
			to_plan: toPlan,
			price_difference: priceDiff,
		});
	},

	cancel: (plan: string, reason?: string, feedback?: string) => {
		capture("subscription_cancelled", { plan, reason, feedback });
	},
};

// Feature tracking
export const trackFeature = {
	use: (featureName: string, context?: string) => {
		capture("feature_used", { feature_name: featureName, context });
	},

	limitReached: (featureName: string, limit: number, current: number) => {
		capture("feature_limit_reached", {
			feature_name: featureName,
			limit,
			current_usage: current,
		});
	},

	error: (featureName: string, errorType: string, errorMessage: string) => {
		capture("feature_error", {
			feature_name: featureName,
			error_type: errorType,
			error_message: errorMessage,
		});
	},
};

// Navigation tracking
export const trackNavigation = {
	pageView: (pageName: string, referrer?: string) => {
		capture("page_viewed", { page_name: pageName, referrer });
	},

	search: (query: string, resultsCount: number, filters?: Record<string, unknown>) => {
		capture("search_performed", {
			query,
			results_count: resultsCount,
			filters,
		});
	},

	ctaClick: (name: string, location: string, destination?: string) => {
		capture("cta_clicked", {
			cta_name: name,
			cta_location: location,
			destination,
		});
	},
};

// Onboarding tracking
export const trackOnboarding = {
	start: (source?: string) => {
		capture("onboarding_started", { source });
	},

	stepComplete: (stepNumber: number, stepName: string, timeSpent?: number) => {
		capture("onboarding_step_completed", {
			step_number: stepNumber,
			step_name: stepName,
			time_spent_seconds: timeSpent,
		});
	},

	complete: (totalTime: number, stepsCompleted: number) => {
		capture("onboarding_completed", {
			total_time_seconds: totalTime,
			steps_completed: stepsCompleted,
		});
	},

	skip: (atStep: number, stepName: string) => {
		capture("onboarding_skipped", {
			skipped_at_step: atStep,
			step_name: stepName,
		});
	},
};

// Export types for external use
export type { AllEvents, BaseEventProperties };
