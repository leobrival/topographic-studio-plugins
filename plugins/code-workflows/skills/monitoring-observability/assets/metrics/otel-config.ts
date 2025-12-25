/**
 * OpenTelemetry Configuration
 * Distributed tracing and metrics collection
 */

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
	ATTR_DEPLOYMENT_ENVIRONMENT,
} from "@opentelemetry/semantic-conventions";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import {
	BatchSpanProcessor,
	ConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-node";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { trace, metrics, context, SpanStatusCode } from "@opentelemetry/api";

// Configuration options
interface OTelConfig {
	serviceName: string;
	serviceVersion?: string;
	environment?: string;
	exporterEndpoint?: string;
	enableConsoleExport?: boolean;
	samplingRatio?: number;
}

// Initialize OpenTelemetry SDK
export function initOpenTelemetry(config: OTelConfig): NodeSDK {
	const {
		serviceName,
		serviceVersion = "1.0.0",
		environment = process.env.NODE_ENV || "development",
		exporterEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318",
		enableConsoleExport = environment === "development",
		samplingRatio = environment === "production" ? 0.1 : 1.0,
	} = config;

	// Create resource
	const resource = new Resource({
		[ATTR_SERVICE_NAME]: serviceName,
		[ATTR_SERVICE_VERSION]: serviceVersion,
		[ATTR_DEPLOYMENT_ENVIRONMENT]: environment,
	});

	// Create trace exporter
	const traceExporter = new OTLPTraceExporter({
		url: `${exporterEndpoint}/v1/traces`,
	});

	// Create metric exporter
	const metricExporter = new OTLPMetricExporter({
		url: `${exporterEndpoint}/v1/metrics`,
	});

	// Create metric reader
	const metricReader = new PeriodicExportingMetricReader({
		exporter: metricExporter,
		exportIntervalMillis: 60000, // Export every minute
	});

	// Span processors
	const spanProcessors = [new BatchSpanProcessor(traceExporter)];

	if (enableConsoleExport) {
		spanProcessors.push(new BatchSpanProcessor(new ConsoleSpanExporter()));
	}

	// Initialize SDK
	const sdk = new NodeSDK({
		resource,
		traceExporter,
		metricReader,
		textMapPropagator: new W3CTraceContextPropagator(),
		instrumentations: [
			getNodeAutoInstrumentations({
				// Customize instrumentations
				"@opentelemetry/instrumentation-http": {
					ignoreIncomingPaths: ["/health", "/ready", "/metrics"],
				},
				"@opentelemetry/instrumentation-fs": {
					enabled: false, // Disable fs instrumentation (too noisy)
				},
			}),
		],
		sampler: {
			shouldSample: () => ({
				decision: Math.random() < samplingRatio ? 1 : 0,
				attributes: {},
			}),
		},
	});

	// Start SDK
	sdk.start();

	// Graceful shutdown
	process.on("SIGTERM", () => {
		sdk.shutdown().then(
			() => console.log("OpenTelemetry SDK shut down successfully"),
			(err) => console.error("Error shutting down OpenTelemetry SDK", err),
		);
	});

	return sdk;
}

// Get tracer for manual instrumentation
export function getTracer(name: string) {
	return trace.getTracer(name);
}

// Get meter for custom metrics
export function getMeter(name: string) {
	return metrics.getMeter(name);
}

// Helper to create a span
export async function withSpan<T>(
	name: string,
	fn: () => Promise<T>,
	options?: {
		attributes?: Record<string, string | number | boolean>;
		kind?: "internal" | "server" | "client" | "producer" | "consumer";
	},
): Promise<T> {
	const tracer = getTracer("app");

	return tracer.startActiveSpan(name, async (span) => {
		try {
			// Set attributes
			if (options?.attributes) {
				for (const [key, value] of Object.entries(options.attributes)) {
					span.setAttribute(key, value);
				}
			}

			const result = await fn();

			span.setStatus({ code: SpanStatusCode.OK });
			return result;
		} catch (error) {
			span.setStatus({
				code: SpanStatusCode.ERROR,
				message: error instanceof Error ? error.message : "Unknown error",
			});

			if (error instanceof Error) {
				span.recordException(error);
			}

			throw error;
		} finally {
			span.end();
		}
	});
}

// Helper to add event to current span
export function addSpanEvent(
	name: string,
	attributes?: Record<string, string | number | boolean>,
) {
	const currentSpan = trace.getActiveSpan();
	if (currentSpan) {
		currentSpan.addEvent(name, attributes);
	}
}

// Helper to set span attributes
export function setSpanAttributes(
	attributes: Record<string, string | number | boolean>,
) {
	const currentSpan = trace.getActiveSpan();
	if (currentSpan) {
		for (const [key, value] of Object.entries(attributes)) {
			currentSpan.setAttribute(key, value);
		}
	}
}

// Get current trace context
export function getTraceContext(): {
	traceId: string;
	spanId: string;
} | null {
	const currentSpan = trace.getActiveSpan();
	if (!currentSpan) return null;

	const spanContext = currentSpan.spanContext();
	return {
		traceId: spanContext.traceId,
		spanId: spanContext.spanId,
	};
}

// Propagate context to downstream services
export function injectTraceContext(headers: Record<string, string>) {
	const propagator = new W3CTraceContextPropagator();
	const currentContext = context.active();

	propagator.inject(currentContext, headers, {
		set: (carrier, key, value) => {
			carrier[key] = value;
		},
	});

	return headers;
}

// Extract context from incoming request
export function extractTraceContext(
	headers: Record<string, string | string[] | undefined>,
) {
	const propagator = new W3CTraceContextPropagator();

	return propagator.extract(context.active(), headers, {
		get: (carrier, key) => {
			const value = carrier[key];
			return Array.isArray(value) ? value[0] : value;
		},
		keys: (carrier) => Object.keys(carrier),
	});
}
