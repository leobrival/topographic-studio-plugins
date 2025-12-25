# Exception Handling Reference

Inspired by AdonisJS exception handling patterns.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Request                                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  withErrorHandling                               │
│  - Creates ExceptionContext (requestId, logger)                  │
│  - Wraps handler in try/catch                                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
        ┌──────────┐          ┌──────────────┐
        │ Success  │          │    Error     │
        └──────────┘          └──────┬───────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                          ▼                     ▼
                   ┌────────────┐       ┌────────────────┐
                   │   report   │       │     handle     │
                   │  (logging) │       │   (response)   │
                   └────────────┘       └────────────────┘
```

## Base Exception Class

### Creating Custom Exceptions

```typescript
import { Exception } from "@/lib/exceptions/exception";

// Simple exception with static defaults
export class UnauthorizedException extends Exception {
  static status = 401;
  static code = "E_UNAUTHORIZED";
}

// Throw it
throw new UnauthorizedException("Invalid credentials");

// Override defaults at throw time
throw new UnauthorizedException("Token expired", {
  status: 401,
  code: "E_TOKEN_EXPIRED",
});
```

### Self-Handling Exceptions

Define how the exception converts to an HTTP response:

```typescript
export class ValidationException extends Exception {
  static status = 422;
  static code = "E_VALIDATION_ERROR";

  errors: Array<{ field: string; message: string }>;

  constructor(message: string, errors: Array<{ field: string; message: string }>) {
    super(message);
    this.errors = errors;
  }

  // Custom response format
  async handle(error: this): Promise<Response> {
    return Response.json(
      {
        error: {
          message: error.message,
          code: error.code,
          errors: error.errors,
        },
      },
      { status: error.status }
    );
  }
}
```

### Self-Reporting Exceptions

Define how the exception is logged:

```typescript
export class PaymentException extends Exception {
  static status = 402;
  static code = "E_PAYMENT_FAILED";

  paymentId?: string;

  constructor(message: string, paymentId?: string) {
    super(message);
    this.paymentId = paymentId;
  }

  // Custom logging
  async report(error: this, ctx: ExceptionContext): Promise<void> {
    ctx.logger.error(
      {
        err: error,
        paymentId: error.paymentId,
        severity: "critical",
      },
      `Payment failed: ${error.message}`
    );

    // Send to external service
    await Sentry.captureException(error, {
      tags: { payment_id: error.paymentId },
    });
  }
}
```

## Exception Handler

### Default Configuration

```typescript
import { ExceptionHandler } from "@/lib/exceptions/exception-handler";

class HttpExceptionHandler extends ExceptionHandler {
  // Disable stack traces in production
  protected debug = process.env.NODE_ENV !== "production";

  // Don't log these status codes
  protected ignoreStatuses = [400, 401, 403, 404, 422];

  // Don't log these error codes
  protected ignoreCodes = [
    "E_VALIDATION_ERROR",
    "E_UNAUTHORIZED",
    "E_NOT_FOUND",
  ];
}
```

### Custom Status Pages

```typescript
class HttpExceptionHandler extends ExceptionHandler {
  protected statusPages = {
    // Exact match
    "404": (error, ctx) => {
      return Response.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    },

    // Range match
    "500..599": (error, ctx) => {
      return Response.json(
        {
          error: "Internal server error",
          requestId: ctx.requestId,
        },
        { status: error.status }
      );
    },
  };
}
```

### Context Enrichment

Add custom context to all log messages:

```typescript
class HttpExceptionHandler extends ExceptionHandler {
  protected context(ctx: ExceptionContext) {
    return {
      requestId: ctx.requestId,
      url: ctx.request.url,
      method: ctx.request.method,
      // Add auth context if available
      userId: ctx.auth?.user?.id,
      // Add IP for security logging
      ip: ctx.request.headers.get("x-forwarded-for"),
    };
  }
}
```

## Route Handler Integration

### Next.js App Router

```typescript
// app/api/users/route.ts
import { createHandler } from "@/lib/exceptions/with-error-handling";
import { NotFoundException, ValidationException } from "@/lib/exceptions/exception";

export const GET = createHandler(async (request, ctx) => {
  ctx.logger.info("Fetching users");

  const users = await db.users.findMany();
  return Response.json(users);
});

export const POST = createHandler(async (request, ctx) => {
  const body = await parseJsonBody(request);

  // Validation
  const errors = validateUser(body);
  if (errors.length > 0) {
    throw new ValidationException("Invalid user data", errors);
  }

  const user = await db.users.create({ data: body });

  ctx.logger.info({ userId: user.id }, "User created");
  return Response.json(user, { status: 201 });
});
```

### Dynamic Routes

```typescript
// app/api/users/[id]/route.ts
import { createHandler, getRouteParam } from "@/lib/exceptions/with-error-handling";
import { NotFoundException } from "@/lib/exceptions/exception";

export const GET = createHandler(async (request, ctx) => {
  const id = getRouteParam(ctx.params, "id");

  const user = await db.users.findUnique({ where: { id } });

  if (!user) {
    throw new NotFoundException(`User ${id} not found`);
  }

  return Response.json(user);
});
```

## Error Codes Convention

Use consistent error code format:

| Code | Description |
|------|-------------|
| `E_VALIDATION_ERROR` | Input validation failed |
| `E_UNAUTHORIZED` | Authentication required |
| `E_FORBIDDEN` | Permission denied |
| `E_NOT_FOUND` | Resource not found |
| `E_ROW_NOT_FOUND` | Database record not found |
| `E_CONFLICT` | Resource conflict |
| `E_RATE_LIMIT` | Too many requests |
| `E_PAYMENT_FAILED` | Payment processing error |
| `E_EXTERNAL_SERVICE` | Third-party service error |
| `E_INTERNAL_ERROR` | Unexpected server error |

## Pre-built Exceptions

```typescript
import {
  // Client errors
  BadRequestException,      // 400
  UnauthorizedException,    // 401
  ForbiddenException,       // 403
  NotFoundException,        // 404
  ConflictException,        // 409
  ValidationException,      // 422
  RateLimitException,       // 429

  // Server errors
  InternalServerException,  // 500
  BadGatewayException,      // 502
  ServiceUnavailableException, // 503
  GatewayTimeoutException,  // 504

  // Domain-specific
  RowNotFoundException,     // 404 with model info
  PaymentException,         // 402 with payment context
  ExternalServiceException, // 502 with service info
} from "@/lib/exceptions/exception";
```

## Utility Functions

### throwIf

```typescript
import { throwIf, ForbiddenException } from "@/lib/exceptions/exception";

// Throw if condition is true
throwIf(
  !user.isAdmin,
  new ForbiddenException("Admin access required")
);

// With lazy exception creation
throwIf(
  !user.isAdmin,
  () => new ForbiddenException(`User ${user.id} is not admin`)
);
```

### throwIfNull

```typescript
import { throwIfNull, NotFoundException } from "@/lib/exceptions/exception";

// Get value or throw
const user = throwIfNull(
  await db.users.findUnique({ where: { id } }),
  new NotFoundException(`User ${id} not found`)
);

// user is now guaranteed to be non-null
console.log(user.name);
```

## Integration with Sentry

```typescript
export class HttpExceptionHandler extends ExceptionHandler {
  async report(error: unknown, ctx: ExceptionContext): Promise<void> {
    // Call parent report (logging)
    await super.report(error, ctx);

    // Also send to Sentry for 5xx errors
    const httpError = this.normalizeError(error);
    if (httpError.status >= 500) {
      Sentry.withScope((scope) => {
        scope.setTag("request_id", ctx.requestId);
        scope.setContext("request", {
          url: ctx.request.url,
          method: ctx.request.method,
        });
        Sentry.captureException(error);
      });
    }
  }
}
```

## Best Practices

### 1. Use Specific Exception Types

```typescript
// Bad - generic error
throw new Error("User not found");

// Good - specific exception
throw new NotFoundException("User not found");
```

### 2. Include Context

```typescript
// Bad - no context
throw new NotFoundException("Not found");

// Good - helpful context
throw new NotFoundException(`User with ID ${id} not found`);
```

### 3. Don't Log Expected Errors

```typescript
class HttpExceptionHandler extends ExceptionHandler {
  // Skip logging for expected client errors
  protected ignoreStatuses = [400, 401, 403, 404, 422];
}
```

### 4. Self-Handle Domain Exceptions

```typescript
class OrderNotFoundException extends Exception {
  static status = 404;
  static code = "E_ORDER_NOT_FOUND";

  orderId: string;

  constructor(orderId: string) {
    super(`Order ${orderId} not found`);
    this.orderId = orderId;
  }

  // Domain-specific response
  async handle(error: this): Promise<Response> {
    return Response.json(
      {
        error: {
          message: error.message,
          code: error.code,
          orderId: error.orderId,
          // Helpful suggestion
          suggestion: "Check the order ID or contact support",
        },
      },
      { status: error.status }
    );
  }
}
```

### 5. Preserve Error Chain

```typescript
try {
  await externalService.call();
} catch (originalError) {
  throw new ExternalServiceException(
    "Payment gateway unavailable",
    "stripe",
    originalError // Preserve original error as cause
  );
}
```
