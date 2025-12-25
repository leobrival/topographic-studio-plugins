# Structured Logging Reference

## Why Structured Logging

- **Searchable**: JSON logs are easily queryable
- **Parseable**: Machine-readable format
- **Contextual**: Rich metadata attached to each log
- **Traceable**: Correlation IDs link related logs

## Pino Setup

### Installation

```bash
pnpm add pino pino-pretty
```

### Basic Configuration

```typescript
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  timestamp: pino.stdTimeFunctions.isoTime,

  // Base context
  base: {
    service: "my-app",
    env: process.env.NODE_ENV,
  },

  // Pretty print in development
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss.l",
          },
        }
      : undefined,
});
```

### Log Levels

| Level | Value | Usage |
|-------|-------|-------|
| `trace` | 10 | Detailed debugging |
| `debug` | 20 | Development debugging |
| `info` | 30 | Normal operations |
| `warn` | 40 | Warning conditions |
| `error` | 50 | Error conditions |
| `fatal` | 60 | Critical failures |

## Logging Patterns

### Basic Usage

```typescript
// Simple messages
logger.info("Server started");
logger.warn("Cache miss");
logger.error("Database connection failed");

// With context
logger.info({ userId: "123", action: "login" }, "User logged in");
logger.error({ err: error, orderId: "456" }, "Payment failed");
```

### Child Loggers

```typescript
// Create scoped logger
const requestLogger = logger.child({
  requestId: "abc-123",
  path: "/api/users",
});

requestLogger.info("Processing request");
// Output includes requestId and path
```

### Error Logging

```typescript
// Log error with stack trace
try {
  await riskyOperation();
} catch (error) {
  logger.error(
    {
      err: error,
      operation: "riskyOperation",
      input: sanitizedInput,
    },
    "Operation failed"
  );
}

// Pino automatically serializes Error objects
// err.message, err.stack, err.name are extracted
```

### Request Logging

```typescript
// Log incoming request
logger.info(
  {
    method: req.method,
    url: req.url,
    headers: {
      "user-agent": req.headers["user-agent"],
      "content-type": req.headers["content-type"],
    },
  },
  "Incoming request"
);

// Log response
logger.info(
  {
    statusCode: res.statusCode,
    durationMs: Date.now() - startTime,
  },
  "Request completed"
);
```

## Redaction

### Configure Redaction

```typescript
const logger = pino({
  redact: {
    paths: [
      "password",
      "*.password",
      "token",
      "*.token",
      "apiKey",
      "secret",
      "authorization",
      "req.headers.authorization",
      "req.headers.cookie",
      "user.email",
    ],
    censor: "[REDACTED]",
  },
});
```

### Custom Redaction

```typescript
const logger = pino({
  redact: {
    paths: ["creditCard"],
    censor: (value) => {
      if (typeof value === "string" && value.length > 4) {
        return `****${value.slice(-4)}`;
      }
      return "[REDACTED]";
    },
  },
});
```

## Serializers

### Custom Serializers

```typescript
const logger = pino({
  serializers: {
    // Serialize Error objects
    err: pino.stdSerializers.err,

    // Custom request serializer
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        "user-agent": req.headers["user-agent"],
      },
    }),

    // Custom user serializer
    user: (user) => ({
      id: user.id,
      role: user.role,
      // Exclude sensitive fields
    }),
  },
});
```

## Transport Configuration

### File Output

```typescript
const logger = pino(
  pino.transport({
    targets: [
      // Console output
      {
        target: "pino-pretty",
        options: { colorize: true },
        level: "info",
      },
      // File output
      {
        target: "pino/file",
        options: { destination: "./logs/app.log" },
        level: "warn",
      },
    ],
  })
);
```

### Log Rotation

```bash
# Using logrotate
pnpm add rotating-file-stream
```

```typescript
import { createStream } from "rotating-file-stream";

const stream = createStream("app.log", {
  size: "10M",
  interval: "1d",
  compress: "gzip",
  path: "./logs",
});

const logger = pino(stream);
```

## Correlation IDs

### Generate and Propagate

```typescript
import { randomUUID } from "crypto";

// Middleware
function correlationMiddleware(req, res, next) {
  const correlationId = req.headers["x-correlation-id"] || randomUUID();

  req.correlationId = correlationId;
  res.setHeader("x-correlation-id", correlationId);

  // Attach to logger
  req.logger = logger.child({ correlationId });

  next();
}

// Usage in handlers
app.get("/api/users", (req, res) => {
  req.logger.info("Fetching users");
  // ...
});
```

### Async Context

```typescript
import { AsyncLocalStorage } from "async_hooks";

const asyncLocalStorage = new AsyncLocalStorage<{
  correlationId: string;
  logger: pino.Logger;
}>();

// Get logger from context
function getLogger() {
  const store = asyncLocalStorage.getStore();
  return store?.logger || logger;
}

// Middleware
function contextMiddleware(req, res, next) {
  const correlationId = req.headers["x-correlation-id"] || randomUUID();
  const childLogger = logger.child({ correlationId });

  asyncLocalStorage.run({ correlationId, childLogger }, () => {
    next();
  });
}

// Usage anywhere
function someFunction() {
  const log = getLogger();
  log.info("This log has correlation ID");
}
```

## Integration Patterns

### Next.js API Routes

```typescript
// lib/logger.ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

// With request context
export function createRequestLogger(req: Request) {
  return logger.child({
    requestId: req.headers.get("x-request-id") || randomUUID(),
    path: new URL(req.url).pathname,
    method: req.method,
  });
}

// app/api/route.ts
import { createRequestLogger } from "@/lib/logger";

export async function GET(req: Request) {
  const log = createRequestLogger(req);

  log.info("Processing request");

  try {
    const data = await fetchData();
    log.info({ count: data.length }, "Data fetched");
    return Response.json(data);
  } catch (error) {
    log.error({ err: error }, "Request failed");
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### Express Middleware

```typescript
import pino from "pino";
import pinoHttp from "pino-http";

const logger = pino();

app.use(
  pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    customSuccessMessage: (req, res) => {
      return `${req.method} ${req.url} completed`;
    },
    customErrorMessage: (req, res, err) => {
      return `${req.method} ${req.url} failed: ${err.message}`;
    },
  })
);
```

## Log Aggregation

### Datadog

```typescript
// pino-datadog transport
pnpm add pino-datadog-transport
```

```typescript
const logger = pino({
  transport: {
    target: "pino-datadog-transport",
    options: {
      apiKey: process.env.DD_API_KEY,
      service: "my-app",
      ddsource: "nodejs",
      ddtags: `env:${process.env.NODE_ENV}`,
    },
  },
});
```

### Loki (Grafana)

```typescript
pnpm add pino-loki
```

```typescript
const logger = pino(
  pino.transport({
    target: "pino-loki",
    options: {
      host: process.env.LOKI_HOST,
      labels: {
        app: "my-app",
        env: process.env.NODE_ENV,
      },
    },
  })
);
```

## Best Practices

### 1. Log at Appropriate Levels

```typescript
// DEBUG: Development only
logger.debug({ query, params }, "Database query");

// INFO: Normal operations
logger.info({ userId }, "User logged in");

// WARN: Unexpected but handled
logger.warn({ retryCount }, "Retrying operation");

// ERROR: Failures requiring attention
logger.error({ err, context }, "Operation failed");
```

### 2. Include Context

```typescript
// Bad
logger.info("User action");

// Good
logger.info(
  {
    userId: user.id,
    action: "purchase",
    amount: 99.99,
    currency: "EUR",
  },
  "User completed purchase"
);
```

### 3. Avoid Logging Sensitive Data

```typescript
// Bad
logger.info({ user }, "User data");

// Good
logger.info(
  {
    userId: user.id,
    role: user.role,
  },
  "User data"
);
```

### 4. Use Consistent Field Names

```typescript
// Define standard fields
const STANDARD_FIELDS = {
  userId: "user_id",
  requestId: "request_id",
  duration: "duration_ms",
  error: "err",
};
```

### 5. Log Timing Information

```typescript
const start = Date.now();

await operation();

logger.info(
  {
    operation: "fetchUsers",
    durationMs: Date.now() - start,
  },
  "Operation completed"
);
```
