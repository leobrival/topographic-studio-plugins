# OpenTelemetry Reference

## Overview

OpenTelemetry provides a unified standard for:
- **Traces**: Request flow across services
- **Metrics**: Quantitative measurements
- **Logs**: Event records (coming soon)

## Installation

```bash
# Core packages
pnpm add @opentelemetry/api @opentelemetry/sdk-node

# Auto-instrumentation
pnpm add @opentelemetry/auto-instrumentations-node

# Exporters
pnpm add @opentelemetry/exporter-trace-otlp-http
pnpm add @opentelemetry/exporter-metrics-otlp-http

# For Next.js
pnpm add @vercel/otel
```

## Basic Setup

### Node.js SDK

```typescript
// instrumentation.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: "my-service",
    [ATTR_SERVICE_VERSION]: "1.0.0",
  }),
  traceExporter: new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

// Graceful shutdown
process.on("SIGTERM", () => {
  sdk.shutdown().finally(() => process.exit(0));
});
```

### Next.js Setup

```typescript
// instrumentation.ts
import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "my-next-app",
  });
}
```

```javascript
// next.config.js
module.exports = {
  experimental: {
    instrumentationHook: true,
  },
};
```

## Tracing

### Creating Spans

```typescript
import { trace, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("my-service");

// Basic span
async function doWork() {
  return tracer.startActiveSpan("doWork", async (span) => {
    try {
      const result = await someOperation();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### Span Attributes

```typescript
tracer.startActiveSpan("processOrder", async (span) => {
  // Set attributes
  span.setAttribute("order.id", orderId);
  span.setAttribute("order.total", total);
  span.setAttribute("customer.id", customerId);

  // Add event
  span.addEvent("payment_processed", {
    "payment.method": "card",
    "payment.amount": total,
  });

  await processOrder();
  span.end();
});
```

### Nested Spans

```typescript
async function handleRequest() {
  return tracer.startActiveSpan("handleRequest", async (parentSpan) => {
    // Child span for database
    await tracer.startActiveSpan("db.query", async (dbSpan) => {
      dbSpan.setAttribute("db.system", "postgresql");
      dbSpan.setAttribute("db.statement", "SELECT * FROM users");

      await queryDatabase();
      dbSpan.end();
    });

    // Child span for external API
    await tracer.startActiveSpan("http.request", async (httpSpan) => {
      httpSpan.setAttribute("http.method", "POST");
      httpSpan.setAttribute("http.url", "https://api.example.com");

      await callExternalApi();
      httpSpan.end();
    });

    parentSpan.end();
  });
}
```

### Context Propagation

```typescript
import { context, propagation } from "@opentelemetry/api";

// Inject context into headers (outgoing request)
const headers = {};
propagation.inject(context.active(), headers);

// Extract context from headers (incoming request)
const extractedContext = propagation.extract(
  context.active(),
  incomingHeaders
);

// Run with extracted context
context.with(extractedContext, () => {
  // Code here runs in the extracted context
  tracer.startActiveSpan("processRequest", (span) => {
    // This span is linked to the parent trace
    span.end();
  });
});
```

## Metrics

### Creating Metrics

```typescript
import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("my-service");

// Counter
const requestCounter = meter.createCounter("http_requests_total", {
  description: "Total HTTP requests",
  unit: "requests",
});

requestCounter.add(1, {
  method: "GET",
  path: "/api/users",
  status_code: 200,
});

// Histogram
const requestDuration = meter.createHistogram("http_request_duration_ms", {
  description: "HTTP request duration",
  unit: "ms",
});

requestDuration.record(150, {
  method: "GET",
  path: "/api/users",
});

// Up/Down Counter (Gauge-like)
const activeConnections = meter.createUpDownCounter("active_connections", {
  description: "Number of active connections",
});

activeConnections.add(1);  // Connection opened
activeConnections.add(-1); // Connection closed

// Observable Gauge
meter.createObservableGauge("system_memory_usage", {
  description: "System memory usage",
  unit: "bytes",
}, (result) => {
  result.observe(process.memoryUsage().heapUsed);
});
```

### Metric Views

```typescript
import { View, Aggregation, InstrumentType } from "@opentelemetry/sdk-metrics";

const views = [
  // Create histogram with custom buckets
  new View({
    instrumentName: "http_request_duration_ms",
    instrumentType: InstrumentType.HISTOGRAM,
    aggregation: Aggregation.ExplicitBucketHistogram([
      5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000,
    ]),
  }),

  // Drop specific metric
  new View({
    instrumentName: "internal_metric",
    aggregation: Aggregation.Drop(),
  }),
];
```

## Exporters

### OTLP (Default)

```typescript
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";

// HTTP exporter
const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",
  headers: {
    Authorization: "Bearer token",
  },
});

const metricExporter = new OTLPMetricExporter({
  url: "http://localhost:4318/v1/metrics",
});
```

### Jaeger

```typescript
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";

const exporter = new JaegerExporter({
  endpoint: "http://localhost:14268/api/traces",
});
```

### Console (Development)

```typescript
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
import { ConsoleMetricExporter } from "@opentelemetry/sdk-metrics";

// For debugging
const traceExporter = new ConsoleSpanExporter();
const metricExporter = new ConsoleMetricExporter();
```

## Sampling

### Built-in Samplers

```typescript
import {
  AlwaysOnSampler,
  AlwaysOffSampler,
  TraceIdRatioBasedSampler,
  ParentBasedSampler,
} from "@opentelemetry/sdk-trace-base";

// Always sample
new AlwaysOnSampler();

// Never sample
new AlwaysOffSampler();

// Sample 10%
new TraceIdRatioBasedSampler(0.1);

// Respect parent decision, default to 10%
new ParentBasedSampler({
  root: new TraceIdRatioBasedSampler(0.1),
});
```

### Custom Sampler

```typescript
import { Sampler, SamplingResult, SamplingDecision } from "@opentelemetry/sdk-trace-base";

class PathBasedSampler implements Sampler {
  shouldSample(context, traceId, spanName, spanKind, attributes): SamplingResult {
    const path = attributes["http.target"] as string;

    // Always sample errors
    if (attributes["error"]) {
      return { decision: SamplingDecision.RECORD_AND_SAMPLED };
    }

    // Don't sample health checks
    if (path === "/health") {
      return { decision: SamplingDecision.NOT_RECORD };
    }

    // Sample 10% of other requests
    return {
      decision: Math.random() < 0.1
        ? SamplingDecision.RECORD_AND_SAMPLED
        : SamplingDecision.NOT_RECORD,
    };
  }

  toString() {
    return "PathBasedSampler";
  }
}
```

## Auto-Instrumentation

### Available Instrumentations

```typescript
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const instrumentations = getNodeAutoInstrumentations({
  // HTTP
  "@opentelemetry/instrumentation-http": {
    ignoreIncomingPaths: ["/health", "/ready"],
    requestHook: (span, request) => {
      span.setAttribute("custom.header", request.headers["x-custom"]);
    },
  },

  // Express
  "@opentelemetry/instrumentation-express": {
    enabled: true,
  },

  // PostgreSQL
  "@opentelemetry/instrumentation-pg": {
    enhancedDatabaseReporting: true,
  },

  // Redis
  "@opentelemetry/instrumentation-redis-4": {
    enabled: true,
  },

  // Disable noisy instrumentations
  "@opentelemetry/instrumentation-fs": {
    enabled: false,
  },
});
```

## Best Practices

### 1. Semantic Conventions

```typescript
import {
  ATTR_HTTP_METHOD,
  ATTR_HTTP_URL,
  ATTR_HTTP_STATUS_CODE,
  ATTR_DB_SYSTEM,
  ATTR_DB_STATEMENT,
} from "@opentelemetry/semantic-conventions";

span.setAttribute(ATTR_HTTP_METHOD, "GET");
span.setAttribute(ATTR_HTTP_URL, "/api/users");
span.setAttribute(ATTR_HTTP_STATUS_CODE, 200);
```

### 2. Error Handling

```typescript
tracer.startActiveSpan("operation", async (span) => {
  try {
    await doWork();
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
});
```

### 3. Baggage for Cross-Service Data

```typescript
import { propagation, context } from "@opentelemetry/api";

// Set baggage
const baggage = propagation.createBaggage({
  "user.id": { value: "123" },
  "request.priority": { value: "high" },
});

const ctx = propagation.setBaggage(context.active(), baggage);

// Read baggage in downstream service
const baggage = propagation.getBaggage(context.active());
const userId = baggage?.getEntry("user.id")?.value;
```

### 4. Resource Detection

```typescript
import { Resource, detectResources } from "@opentelemetry/resources";
import { awsEc2Detector } from "@opentelemetry/resource-detector-aws";
import { gcpDetector } from "@opentelemetry/resource-detector-gcp";

const resource = await detectResources({
  detectors: [awsEc2Detector, gcpDetector],
});

const sdk = new NodeSDK({
  resource: resource.merge(
    new Resource({
      "service.name": "my-service",
    })
  ),
});
```

### 5. Shutdown Handling

```typescript
const sdk = new NodeSDK({ /* config */ });

sdk.start();

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    try {
      await sdk.shutdown();
      console.log("SDK shut down successfully");
    } catch (error) {
      console.error("Error shutting down SDK", error);
    } finally {
      process.exit(0);
    }
  });
});
```
