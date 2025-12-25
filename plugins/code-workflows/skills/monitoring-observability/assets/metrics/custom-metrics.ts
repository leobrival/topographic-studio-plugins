/**
 * Custom Metrics Definitions
 * Application-specific metrics using OpenTelemetry
 */

import { getMeter } from "./otel-config";
import type { Attributes, Counter, Histogram, UpDownCounter } from "@opentelemetry/api";

// Initialize meter
const meter = getMeter("app-metrics");

// ============================================================
// HTTP Metrics
// ============================================================

// Request counter
const httpRequestsTotal = meter.createCounter("http_requests_total", {
	description: "Total number of HTTP requests",
	unit: "requests",
});

// Request duration histogram
const httpRequestDuration = meter.createHistogram("http_request_duration_ms", {
	description: "HTTP request duration in milliseconds",
	unit: "ms",
});

// Active requests gauge
const httpActiveRequests = meter.createUpDownCounter("http_active_requests", {
	description: "Number of active HTTP requests",
	unit: "requests",
});

export const httpMetrics = {
	recordRequest(method: string, path: string, statusCode: number, durationMs: number) {
		const attributes: Attributes = {
			method,
			path,
			status_code: statusCode,
			status_class: `${Math.floor(statusCode / 100)}xx`,
		};

		httpRequestsTotal.add(1, attributes);
		httpRequestDuration.record(durationMs, attributes);
	},

	incrementActiveRequests(method: string, path: string) {
		httpActiveRequests.add(1, { method, path });
	},

	decrementActiveRequests(method: string, path: string) {
		httpActiveRequests.add(-1, { method, path });
	},
};

// ============================================================
// Database Metrics
// ============================================================

const dbQueriesTotal = meter.createCounter("db_queries_total", {
	description: "Total number of database queries",
	unit: "queries",
});

const dbQueryDuration = meter.createHistogram("db_query_duration_ms", {
	description: "Database query duration in milliseconds",
	unit: "ms",
});

const dbConnectionPool = meter.createUpDownCounter("db_connection_pool", {
	description: "Number of database connections in pool",
	unit: "connections",
});

export const dbMetrics = {
	recordQuery(operation: string, table: string, durationMs: number, success: boolean) {
		const attributes: Attributes = {
			operation,
			table,
			success: String(success),
		};

		dbQueriesTotal.add(1, attributes);
		dbQueryDuration.record(durationMs, attributes);
	},

	setConnectionPoolSize(size: number, state: "active" | "idle") {
		dbConnectionPool.add(size, { state });
	},
};

// ============================================================
// Cache Metrics
// ============================================================

const cacheOperationsTotal = meter.createCounter("cache_operations_total", {
	description: "Total number of cache operations",
	unit: "operations",
});

const cacheHitRatio = meter.createHistogram("cache_hit_ratio", {
	description: "Cache hit ratio",
	unit: "ratio",
});

export const cacheMetrics = {
	recordOperation(operation: "get" | "set" | "delete", hit: boolean, cacheName?: string) {
		cacheOperationsTotal.add(1, {
			operation,
			result: hit ? "hit" : "miss",
			cache: cacheName || "default",
		});
	},

	recordHitRatio(hits: number, total: number, cacheName?: string) {
		if (total > 0) {
			cacheHitRatio.record(hits / total, {
				cache: cacheName || "default",
			});
		}
	},
};

// ============================================================
// Business Metrics
// ============================================================

const userActionsTotal = meter.createCounter("user_actions_total", {
	description: "Total number of user actions",
	unit: "actions",
});

const activeUsers = meter.createUpDownCounter("active_users", {
	description: "Number of currently active users",
	unit: "users",
});

const revenueTotal = meter.createCounter("revenue_total", {
	description: "Total revenue",
	unit: "currency",
});

export const businessMetrics = {
	recordUserAction(action: string, userId?: string, metadata?: Attributes) {
		userActionsTotal.add(1, {
			action,
			...metadata,
		});
	},

	incrementActiveUsers(segment?: string) {
		activeUsers.add(1, { segment: segment || "default" });
	},

	decrementActiveUsers(segment?: string) {
		activeUsers.add(-1, { segment: segment || "default" });
	},

	recordRevenue(amount: number, currency: string, plan?: string) {
		revenueTotal.add(amount, {
			currency,
			plan: plan || "unknown",
		});
	},
};

// ============================================================
// Queue Metrics
// ============================================================

const queueJobsTotal = meter.createCounter("queue_jobs_total", {
	description: "Total number of queue jobs",
	unit: "jobs",
});

const queueJobDuration = meter.createHistogram("queue_job_duration_ms", {
	description: "Queue job processing duration",
	unit: "ms",
});

const queueSize = meter.createUpDownCounter("queue_size", {
	description: "Current queue size",
	unit: "jobs",
});

export const queueMetrics = {
	recordJob(queueName: string, status: "completed" | "failed" | "retried", durationMs: number) {
		const attributes: Attributes = {
			queue: queueName,
			status,
		};

		queueJobsTotal.add(1, attributes);
		queueJobDuration.record(durationMs, attributes);
	},

	updateQueueSize(queueName: string, delta: number) {
		queueSize.add(delta, { queue: queueName });
	},
};

// ============================================================
// External API Metrics
// ============================================================

const externalApiCallsTotal = meter.createCounter("external_api_calls_total", {
	description: "Total number of external API calls",
	unit: "calls",
});

const externalApiDuration = meter.createHistogram("external_api_duration_ms", {
	description: "External API call duration",
	unit: "ms",
});

export const externalApiMetrics = {
	recordCall(
		service: string,
		endpoint: string,
		statusCode: number,
		durationMs: number,
	) {
		const attributes: Attributes = {
			service,
			endpoint,
			status_code: statusCode,
			success: String(statusCode >= 200 && statusCode < 300),
		};

		externalApiCallsTotal.add(1, attributes);
		externalApiDuration.record(durationMs, attributes);
	},
};

// ============================================================
// Feature Flag Metrics
// ============================================================

const featureFlagEvaluations = meter.createCounter("feature_flag_evaluations_total", {
	description: "Total number of feature flag evaluations",
	unit: "evaluations",
});

export const featureFlagMetrics = {
	recordEvaluation(flagName: string, value: boolean | string, reason?: string) {
		featureFlagEvaluations.add(1, {
			flag: flagName,
			value: String(value),
			reason: reason || "unknown",
		});
	},
};

// ============================================================
// Custom Metric Factory
// ============================================================

export function createCounter(
	name: string,
	description: string,
	unit?: string,
): Counter {
	return meter.createCounter(name, { description, unit });
}

export function createHistogram(
	name: string,
	description: string,
	unit?: string,
): Histogram {
	return meter.createHistogram(name, { description, unit });
}

export function createGauge(
	name: string,
	description: string,
	unit?: string,
): UpDownCounter {
	return meter.createUpDownCounter(name, { description, unit });
}
