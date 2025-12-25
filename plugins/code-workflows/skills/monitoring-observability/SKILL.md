---
name: monitoring-observability
description: Setup monitoring and observability for applications with Sentry, PostHog, Pino logging, and OpenTelemetry. Use when users need error tracking, product analytics, structured logging, metrics, or centralized exception handling. Covers AdonisJS-inspired error patterns.
---

# Monitoring & Observability

Complete observability stack for modern applications: error tracking, analytics, structured logging, metrics, and exception handling.

## Decision Tree

```
User request → What type of observability?
    │
    ├─ Error Tracking
    │   ├─ Sentry → Full-featured, session replay
    │   ├─ BugSnag → Simpler, good stability
    │   └─ Rollbar → Real-time monitoring
    │
    ├─ Product Analytics
    │   ├─ PostHog → Open source, feature flags
    │   ├─ Mixpanel → Event tracking
    │   └─ Amplitude → Product analytics
    │
    ├─ Logging
    │   ├─ Pino → Fast, structured JSON
    │   ├─ Winston → Feature-rich
    │   └─ Bunyan → JSON logging
    │
    ├─ Metrics & Tracing
    │   ├─ OpenTelemetry → Standard, vendor-agnostic
    │   ├─ Datadog → All-in-one APM
    │   └─ New Relic → Traditional APM
    │
    └─ Exception Handling
        ├─ AdonisJS pattern → Self-handling exceptions
        ├─ Centralized handler → One place for all errors
        └─ Status pages → Custom error responses
```

## Recommended Stack

- **Error Tracking**: Sentry
- **Product Analytics**: PostHog
- **Logging**: Pino (structured logging)
- **Metrics**: OpenTelemetry
- **Exception Handling**: AdonisJS-inspired pattern

## Quick Start

### Exception Handling (AdonisJS Pattern)

```typescript
// Create custom exception
import { Exception } from "@/lib/exceptions/exception";

export class PaymentException extends Exception {
  static status = 402;
  static code = "E_PAYMENT_FAILED";

  // Self-handling: converts to HTTP response
  async handle(error: this, ctx: ExceptionContext) {
    return Response.json(
      { error: { message: error.message, code: error.code } },
      { status: error.status }
    );
  }

  // Self-reporting: defines how to log
  async report(error: this, ctx: ExceptionContext) {
    ctx.logger.error({ err: error, paymentId: this.paymentId }, error.message);
  }
}
```

### Route Handler with Error Handling

```typescript
import { createHandler } from "@/lib/exceptions/with-error-handling";
import { NotFoundException } from "@/lib/exceptions/exception";

export const GET = createHandler(async (request, ctx) => {
  const user = await db.users.findUnique({ where: { id } });

  if (!user) {
    throw new NotFoundException(`User ${id} not found`);
  }

  return Response.json(user);
});
```

### Sentry Setup

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.captureException(error, {
  tags: { feature: "checkout" },
  extra: { userId, orderId }
});
```

### PostHog Analytics

```typescript
import { posthog } from "@/lib/posthog";

posthog.capture("purchase_completed", {
  amount: 99.99,
  currency: "EUR"
});
```

### Pino Logging

```typescript
import { logger } from "@/lib/logger";

logger.info({ userId, action: "login" }, "User logged in");
```

## Asset Structure

```
assets/
├── exceptions/
│   ├── exception-handler.ts  # Centralized handler (AdonisJS-inspired)
│   ├── exception.ts          # Exception classes with self-handle/report
│   └── with-error-handling.ts # Wrapper for API routes
├── sentry/
│   ├── sentry.client.ts      # Client-side configuration
│   ├── sentry.server.ts      # Server-side configuration
│   └── sentry.edge.ts        # Edge runtime configuration
├── posthog/
│   ├── posthog-provider.tsx  # React provider
│   ├── posthog-client.ts     # PostHog client
│   └── events.ts             # Event definitions
├── logging/
│   ├── logger.ts             # Configured Pino logger
│   └── middleware.ts         # HTTP logging middleware
└── metrics/
    ├── otel-config.ts        # OpenTelemetry configuration
    └── custom-metrics.ts     # Custom metrics
```

## Pre-built Exceptions

| Exception | Status | Code |
|-----------|--------|------|
| `BadRequestException` | 400 | E_BAD_REQUEST |
| `UnauthorizedException` | 401 | E_UNAUTHORIZED |
| `ForbiddenException` | 403 | E_FORBIDDEN |
| `NotFoundException` | 404 | E_NOT_FOUND |
| `ConflictException` | 409 | E_CONFLICT |
| `ValidationException` | 422 | E_VALIDATION_ERROR |
| `RateLimitException` | 429 | E_RATE_LIMIT |
| `InternalServerException` | 500 | E_INTERNAL_SERVER_ERROR |
| `BadGatewayException` | 502 | E_BAD_GATEWAY |
| `ServiceUnavailableException` | 503 | E_SERVICE_UNAVAILABLE |
| `RowNotFoundException` | 404 | E_ROW_NOT_FOUND |
| `PaymentException` | 402 | E_PAYMENT_FAILED |
| `ExternalServiceException` | 502 | E_EXTERNAL_SERVICE |

## Reference Files

- **Exception Handling**: See [references/exception-handling.md](references/exception-handling.md)
- **Sentry Setup**: See [references/sentry-setup.md](references/sentry-setup.md)
- **PostHog Analytics**: See [references/posthog-analytics.md](references/posthog-analytics.md)
- **Structured Logging**: See [references/structured-logging.md](references/structured-logging.md)
- **OpenTelemetry**: See [references/opentelemetry.md](references/opentelemetry.md)

## Core Principles

1. **Observability as code**: All configuration versioned
2. **Self-handling exceptions**: Each exception knows how to convert to HTTP response
3. **Self-reporting exceptions**: Each exception knows how to log itself
4. **Correlation IDs**: End-to-end request traceability
5. **Structured logging**: JSON logs for analysis
6. **Privacy-first**: Sensitive data anonymization
7. **Performance**: Smart sampling to avoid performance impact

## Best Practices

1. **Use specific exceptions**: `NotFoundException` vs generic `Error`
2. **Include context**: Helpful error messages with IDs
3. **Don't log expected errors**: Skip 400, 401, 403, 404, 422
4. **Self-handle domain exceptions**: Custom response formats
5. **Preserve error chain**: Use `cause` for original errors
6. **Redact sensitive data**: Passwords, tokens, PII
7. **Use correlation IDs**: Track requests across services
8. **Sample in production**: 10-20% for traces, 100% for errors
