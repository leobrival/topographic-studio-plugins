---
description: Research logging best practices for the current stack, create AdonisJS-style structured logger files, integrate them, and test
allowed-tools: Bash, Read, Write, Edit, WebSearch, WebFetch, Glob, Grep
---

# Setup Logger

Research and implement production-ready structured logging inspired by AdonisJS architecture.

## Workflow

### 1. Detect the Stack

- Check `package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, etc.
- Identify language and framework (Node.js/TypeScript, Python, Go, Rust, etc.)
- Check existing dependencies for logging libraries

### 2. Research Best Practices

Use **parallel WebSearch calls** to find:

- "best logging practices [language] [framework] [current year]"
- "structured logging [language] production"
- "[framework] logging best practices pino winston bunyan"
- "multiple logger instances [language]"

Focus on:

- Structured logging (JSON/NDJSON format)
- Multiple named logger configurations
- Log levels (trace, debug, info, warn, error, fatal)
- Environment-based configuration
- Context enrichment (request IDs, user IDs)
- Transport targets (file, stdout, external services)
- Sensitive data redaction
- Performance considerations

### 3. Choose Logger Library

Based on research, select the best library:

- **Node.js/TypeScript**: Pino (AdonisJS uses this - high performance)
- **Python**: structlog or loguru
- **Go**: zerolog or zap
- **Rust**: tracing or slog
- **PHP**: Monolog
- **Java**: Logback or Log4j2

Prioritize:

1. Performance (NDJSON format)
2. Structured logging support
3. Multiple logger instances
4. Active maintenance
5. Strong ecosystem adoption

### 4. Create Logger Files (AdonisJS-Style Architecture)

#### For Node.js/TypeScript projects:

Create these files:

- `config/logger.ts` - Main configuration with multiple loggers
- `src/services/logger.ts` - Logger service with instance management
- Update `.env.example` with `LOG_LEVEL=info` and `NODE_ENV=development`

**config/logger.ts:**

```typescript
import { pino } from "pino";

export interface LoggerConfig {
  default: string;
  loggers: {
    [name: string]: {
      enabled: boolean;
      name: string;
      level: string;
      redact?: {
        paths: string[];
        censor?: string;
        remove?: boolean;
      };
      transport?: {
        targets: Array<{
          target: string;
          level?: string;
          options?: Record<string, any>;
        }>;
      };
    };
  };
}

// Helper functions for transport targets (AdonisJS pattern)
export const targets = {
  pretty: (options: Record<string, any> = {}) => ({
    target: "pino-pretty",
    level: "trace",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss Z",
      ignore: "pid,hostname",
      ...options,
    },
  }),

  file: (options: { destination: string; level?: string }) => ({
    target: "pino/file",
    level: options.level || "info",
    options: {
      destination: options.destination,
      mkdir: true,
    },
  }),
};

// defineConfig wrapper (AdonisJS pattern)
export function defineConfig(config: LoggerConfig): LoggerConfig {
  return config;
}

export default defineConfig({
  default: "app",
  loggers: {
    app: {
      enabled: true,
      name: "app",
      level: process.env.LOG_LEVEL || "info",
      redact: {
        paths: ["password", "*.token", "apiKey", "secret", "authorization"],
        censor: "[REDACTED]",
      },
      transport: {
        targets: [
          ...(process.env.NODE_ENV === "development" ? [targets.pretty()] : []),
          ...(process.env.NODE_ENV === "production"
            ? [
                targets.file({ destination: "./logs/app.log" }),
                {
                  target: "pino/file",
                  level: "info",
                  options: { destination: 1 },
                },
              ]
            : []),
        ],
      },
    },
  },
});
```

**src/services/logger.ts:**

```typescript
import { pino } from "pino";
import loggerConfig from "../config/logger";

const loggers = new Map<string, pino.Logger>();

function createLogger(name: string) {
  const config = loggerConfig.loggers[name];

  if (!config || !config.enabled) {
    throw new Error(`Logger "${name}" not found or disabled`);
  }

  return pino({
    name: config.name,
    level: config.level,
    redact: config.redact,
    transport: config.transport,
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}

export function useLogger(name: string = loggerConfig.default) {
  if (!loggers.has(name)) {
    loggers.set(name, createLogger(name));
  }
  return loggers.get(name)!;
}

export const logger = useLogger();

export function createChildLogger(context: Record<string, any>, name?: string) {
  const parentLogger = useLogger(name);
  return parentLogger.child(context);
}

export class Secret {
  constructor(private value: string) {}

  toString() {
    return "[REDACTED]";
  }

  toJSON() {
    return "[REDACTED]";
  }

  getValue() {
    return this.value;
  }
}
```

#### For Python projects:

```python
# config/logger.py
import structlog
import logging
import os

class LoggerConfig:
    def __init__(self):
        self.default = 'app'
        self.loggers = {
            'app': {
                'enabled': True,
                'name': 'app',
                'level': os.getenv('LOG_LEVEL', 'INFO'),
            }
        }

def setup_logger(name: str = None):
    name = name or 'app'
    config = LoggerConfig().loggers[name]

    logging.basicConfig(
        format="%(message)s",
        level=getattr(logging, config['level']),
    )

    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer()
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        logger_factory=structlog.stdlib.LoggerFactory(),
    )

    return structlog.get_logger(name)

logger = setup_logger()
```

### 5. Install Dependencies

Run appropriate install command:

- Node.js: `pnpm add pino pino-pretty` or `npm install pino pino-pretty`
- Python: `pip install structlog`
- Go: `go get github.com/rs/zerolog`

### 6. Integration Examples

**Basic logging:**

```typescript
import { logger, useLogger, createChildLogger, Secret } from "../services/logger";

// Basic logging
logger.info("Application started");
logger.warn({ userId: 123 }, "Rate limit approaching");
logger.error({ err: new Error("Connection failed") }, "Database error");

// Named logger
const paymentLogger = useLogger("payments");
paymentLogger.info({ amount: 99.99 }, "Payment processed");

// Child logger with context
const requestLogger = createChildLogger({
  requestId: "req-abc123",
  userId: 456,
});
requestLogger.info("User login");

// Sensitive data
const password = new Secret("secret");
logger.info({ password }, "User created"); // Logs: { password: '[REDACTED]' }
```

### 7. Test the Logger

```bash
# Node.js/TypeScript
NODE_ENV=development npx tsx example/logger-demo.ts

# Python
python example/logger_demo.py
```

Verify:

- Logs appear with proper formatting
- JSON structure in production mode
- Pretty format in development mode
- Timestamps are ISO format
- Log levels work
- Sensitive data is redacted

### 8. Summary Report

```
## Logger Setup Complete

**Stack detected:** [Node.js/TypeScript/Python/etc]
**Logger library:** [Pino/structlog/etc]
**Architecture:** Multi-logger AdonisJS-inspired

**Files created:**
- config/logger.ts
- src/services/logger.ts
- example/logger-demo.ts
- docs/logging.md

**Features enabled:**
- Multiple named loggers
- Environment-based configuration
- Pretty logging in dev, JSON in prod
- Child loggers with context binding
- Sensitive data redaction
- Structured logging (NDJSON)

**Next steps:**
1. Update your .env file with LOG_LEVEL
2. Replace console.log() calls with logger
3. Add request-context logging middleware
4. Set up log aggregation in production
```

## Key AdonisJS-Inspired Principles

- **Multiple named loggers**: `app`, `payments`, `notifications`
- **defineConfig wrapper**: Clean configuration pattern
- **Transport target helpers**: `targets.pretty()`, `targets.file()`
- **Child logger pattern**: Context binding for requests
- **Sensitive data handling**: Redaction config + Secret class
- **Environment-aware**: Conditional transports based on NODE_ENV
- **useLogger() pattern**: Get logger by name, lazy initialization
- **Structured first**: JSON logs are searchable and parsable

Ship production-ready logging today.
