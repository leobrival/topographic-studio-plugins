# Error Handling Patterns

Design robust error handling for API clients.

## Error Types Hierarchy

### TypeScript

```typescript
// Base error
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Network errors
export class NetworkError extends ApiError {
  constructor(message: string, cause?: Error) {
    super(0, "NETWORK_ERROR", message);
    this.name = "NetworkError";
    this.cause = cause;
  }
}

export class TimeoutError extends NetworkError {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = "TimeoutError";
  }
}

// HTTP errors
export class BadRequestError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(400, "BAD_REQUEST", message, details);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, "UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, "FORBIDDEN", message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, "NOT_FOUND", `${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }>,
  ) {
    super(422, "VALIDATION_ERROR", message, errors);
    this.name = "ValidationError";
  }
}

export class RateLimitError extends ApiError {
  constructor(
    public retryAfter?: number,
  ) {
    super(429, "RATE_LIMITED", "Too many requests");
    this.name = "RateLimitError";
  }
}

export class ServerError extends ApiError {
  constructor(status: number, message: string) {
    super(status, "SERVER_ERROR", message);
    this.name = "ServerError";
  }
}
```

### Python

```python
from dataclasses import dataclass, field
from typing import Any

class ApiError(Exception):
    """Base API error"""

    def __init__(
        self,
        status: int,
        code: str,
        message: str,
        details: Any = None,
    ) -> None:
        self.status = status
        self.code = code
        self.message = message
        self.details = details
        super().__init__(f"[{status}] {code}: {message}")


class NetworkError(ApiError):
    def __init__(self, message: str) -> None:
        super().__init__(0, "NETWORK_ERROR", message)


class TimeoutError(NetworkError):
    def __init__(self, timeout: float) -> None:
        super().__init__(f"Request timed out after {timeout}s")


class BadRequestError(ApiError):
    def __init__(self, message: str, details: Any = None) -> None:
        super().__init__(400, "BAD_REQUEST", message, details)


class UnauthorizedError(ApiError):
    def __init__(self, message: str = "Unauthorized") -> None:
        super().__init__(401, "UNAUTHORIZED", message)


class ForbiddenError(ApiError):
    def __init__(self, message: str = "Forbidden") -> None:
        super().__init__(403, "FORBIDDEN", message)


class NotFoundError(ApiError):
    def __init__(self, resource: str) -> None:
        super().__init__(404, "NOT_FOUND", f"{resource} not found")


@dataclass
class FieldError:
    field: str
    message: str


class ValidationError(ApiError):
    def __init__(self, message: str, errors: list[FieldError]) -> None:
        super().__init__(422, "VALIDATION_ERROR", message, errors)
        self.errors = errors


class RateLimitError(ApiError):
    def __init__(self, retry_after: int | None = None) -> None:
        super().__init__(429, "RATE_LIMITED", "Too many requests")
        self.retry_after = retry_after


class ServerError(ApiError):
    def __init__(self, status: int, message: str) -> None:
        super().__init__(status, "SERVER_ERROR", message)
```

## Error Factory

```typescript
function createErrorFromResponse(
  status: number,
  body: unknown,
): ApiError {
  const { code, message, details } = parseErrorBody(body);

  switch (status) {
    case 400:
      return new BadRequestError(message, details);
    case 401:
      return new UnauthorizedError(message);
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError(message);
    case 422:
      return new ValidationError(message, details as Array<{ field: string; message: string }>);
    case 429:
      return new RateLimitError();
    default:
      if (status >= 500) {
        return new ServerError(status, message);
      }
      return new ApiError(status, code, message, details);
  }
}

function parseErrorBody(body: unknown): {
  code: string;
  message: string;
  details?: unknown;
} {
  if (typeof body === "object" && body !== null) {
    const obj = body as Record<string, unknown>;
    return {
      code: String(obj.code || obj.error || "UNKNOWN"),
      message: String(obj.message || obj.error_description || "Unknown error"),
      details: obj.details || obj.errors,
    };
  }
  return { code: "UNKNOWN", message: String(body) };
}
```

## Result Type Pattern

Avoid throwing errors, return Result types instead.

### TypeScript

```typescript
type Result<T, E = ApiError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

// Usage
async function getUser(id: string): Promise<Result<User>> {
  try {
    const response = await fetch(`/users/${id}`);

    if (!response.ok) {
      return {
        ok: false,
        error: createErrorFromResponse(response.status, await response.json()),
      };
    }

    return { ok: true, data: await response.json() };
  } catch (error) {
    return {
      ok: false,
      error: new NetworkError("Request failed", error as Error),
    };
  }
}

// Consumer
const result = await getUser("123");

if (result.ok) {
  console.log(result.data.name);
} else {
  if (result.error instanceof NotFoundError) {
    console.log("User not found");
  } else if (result.error instanceof UnauthorizedError) {
    console.log("Please login");
  } else {
    console.error("Error:", result.error.message);
  }
}
```

### Python

```python
from dataclasses import dataclass
from typing import Generic, TypeVar

T = TypeVar("T")
E = TypeVar("E", bound=ApiError)

@dataclass
class Ok(Generic[T]):
    data: T

    @property
    def ok(self) -> bool:
        return True


@dataclass
class Err(Generic[E]):
    error: E

    @property
    def ok(self) -> bool:
        return False


Result = Ok[T] | Err[E]

# Usage
async def get_user(id: str) -> Result[User, ApiError]:
    try:
        response = await client.get(f"/users/{id}")
        if response.is_success:
            return Ok(User.model_validate(response.json()))
        return Err(create_error_from_response(response))
    except Exception as e:
        return Err(NetworkError(str(e)))

# Consumer
result = await get_user("123")

if result.ok:
    print(result.data.name)
elif isinstance(result.error, NotFoundError):
    print("User not found")
elif isinstance(result.error, UnauthorizedError):
    print("Please login")
else:
    print(f"Error: {result.error.message}")
```

## Error Display

```typescript
function getUserFriendlyMessage(error: ApiError): string {
  switch (error.code) {
    case "UNAUTHORIZED":
      return "Please sign in to continue";
    case "FORBIDDEN":
      return "You don't have permission to do this";
    case "NOT_FOUND":
      return "The requested item was not found";
    case "VALIDATION_ERROR":
      return "Please check your input and try again";
    case "RATE_LIMITED":
      return "Too many requests. Please wait a moment.";
    case "NETWORK_ERROR":
      return "Connection error. Please check your internet.";
    default:
      if (error.status >= 500) {
        return "Something went wrong. Please try again later.";
      }
      return error.message;
  }
}
```

## Logging Errors

```typescript
function logApiError(error: ApiError, context?: Record<string, unknown>): void {
  const logData = {
    error: {
      name: error.name,
      status: error.status,
      code: error.code,
      message: error.message,
      details: error.details,
    },
    context,
    timestamp: new Date().toISOString(),
  };

  if (error.status >= 500) {
    console.error("[API Error]", JSON.stringify(logData));
    // Send to error tracking (Sentry, etc.)
  } else if (error.status >= 400) {
    console.warn("[API Warning]", JSON.stringify(logData));
  } else {
    console.info("[API Info]", JSON.stringify(logData));
  }
}
```

## Best Practices

1. **Use typed errors**: Catch specific error types
2. **Include context**: Add request details to errors
3. **User-friendly messages**: Translate codes to readable text
4. **Log appropriately**: Error level by severity
5. **Don't expose internals**: Hide sensitive details from users
6. **Preserve stack traces**: Keep original error as cause
