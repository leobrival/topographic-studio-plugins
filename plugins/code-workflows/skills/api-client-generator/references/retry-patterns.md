# Retry Patterns

Implement resilient API clients with proper retry logic.

## When to Retry

### Retryable Errors

- `408` Request Timeout
- `429` Too Many Requests (rate limited)
- `500` Internal Server Error
- `502` Bad Gateway
- `503` Service Unavailable
- `504` Gateway Timeout
- Network errors (connection reset, DNS failure)

### Non-Retryable Errors

- `400` Bad Request (client error)
- `401` Unauthorized (auth issue)
- `403` Forbidden (permission issue)
- `404` Not Found
- `422` Unprocessable Entity (validation)

### Idempotent Methods Only

Only retry idempotent methods by default:

- GET (safe)
- HEAD (safe)
- PUT (idempotent)
- DELETE (idempotent)
- OPTIONS (safe)

POST and PATCH may cause duplicate operations.

## Exponential Backoff

### Algorithm

```
delay = min(base * 2^attempt + jitter, max_delay)
```

### TypeScript Implementation

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    retryOn?: (error: unknown) => boolean;
  } = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    retryOn = () => true,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts - 1 || !retryOn(error)) {
        throw error;
      }

      // Calculate delay with jitter
      const jitter = Math.random() * 1000;
      const delay = Math.min(baseDelay * Math.pow(2, attempt) + jitter, maxDelay);

      console.log(`Retry ${attempt + 1}/${maxAttempts} in ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Usage
const result = await withRetry(
  () => fetch("/api/users"),
  {
    maxAttempts: 3,
    retryOn: (error) => {
      if (error instanceof Response) {
        return [408, 429, 500, 502, 503, 504].includes(error.status);
      }
      return true; // Retry network errors
    },
  },
);
```

### Python Implementation

```python
import asyncio
import random
from typing import Callable, TypeVar
from functools import wraps

T = TypeVar("T")

async def with_retry(
    fn: Callable[[], T],
    max_attempts: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 30.0,
    retry_on: Callable[[Exception], bool] = lambda _: True,
) -> T:
    last_error: Exception | None = None

    for attempt in range(max_attempts):
        try:
            return await fn()
        except Exception as error:
            last_error = error

            if attempt == max_attempts - 1 or not retry_on(error):
                raise

            # Calculate delay with jitter
            jitter = random.uniform(0, 1)
            delay = min(base_delay * (2 ** attempt) + jitter, max_delay)

            print(f"Retry {attempt + 1}/{max_attempts} in {delay:.2f}s")
            await asyncio.sleep(delay)

    raise last_error
```

## Respecting Rate Limits

### Retry-After Header

```typescript
async function fetchWithRateLimit(url: string): Promise<Response> {
  const response = await fetch(url);

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");

    if (retryAfter) {
      // Retry-After can be seconds or HTTP date
      const delay = Number.isNaN(Number(retryAfter))
        ? new Date(retryAfter).getTime() - Date.now()
        : Number(retryAfter) * 1000;

      console.log(`Rate limited, waiting ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));

      return fetchWithRateLimit(url);
    }
  }

  return response;
}
```

### Token Bucket Rate Limiter

```typescript
class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens: number,
    private refillRate: number, // tokens per second
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens < 1) {
      const waitTime = (1 - this.tokens) / this.refillRate * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.refill();
    }

    this.tokens -= 1;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}

// Usage
const limiter = new RateLimiter(10, 2); // 10 tokens, 2/sec refill

async function makeRequest() {
  await limiter.acquire();
  return fetch("/api/data");
}
```

## Circuit Breaker Pattern

Prevent cascading failures by stopping requests to failing services.

```typescript
enum CircuitState {
  CLOSED = "closed",
  OPEN = "open",
  HALF_OPEN = "half_open",
}

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failures = 0;
  private lastFailure: number = 0;

  constructor(
    private threshold: number = 5,
    private resetTimeout: number = 30000,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailure > this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();

    if (this.failures >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }
}
```

## Libraries

### TypeScript

- **ky** - Built-in retry with fetch
- **axios-retry** - Retry plugin for axios
- **p-retry** - Standalone retry utility
- **cockatiel** - Circuit breaker, retry, bulkhead

### Python

- **tenacity** - Comprehensive retry library
- **backoff** - Simple exponential backoff
- **aiohttp-retry** - Retry for aiohttp
- **circuitbreaker** - Circuit breaker pattern

## Best Practices

1. **Always add jitter**: Prevent thundering herd
2. **Set max delay**: Don't wait forever
3. **Log retries**: For debugging
4. **Track metrics**: Monitor retry rates
5. **Fail fast on auth**: Don't retry 401/403
6. **Use circuit breakers**: Protect downstream services
