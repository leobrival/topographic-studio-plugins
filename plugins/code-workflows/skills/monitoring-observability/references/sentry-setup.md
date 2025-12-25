# Sentry Setup Reference

## Installation

```bash
# Next.js
npx @sentry/wizard@latest -i nextjs

# Or manual installation
pnpm add @sentry/nextjs
```

## Configuration Files

### next.config.js

```javascript
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  // Your Next.js config
};

module.exports = withSentryConfig(nextConfig, {
  // Sentry Webpack Plugin Options
  org: "your-org",
  project: "your-project",
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Hide source maps from browser
  hideSourceMaps: true,

  // Disable telemetry
  telemetry: false,
});
```

### sentry.client.config.ts

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",

  // Performance
  tracesSampleRate: 0.1,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
  ],
});
```

### sentry.server.config.ts

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || "development",

  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
});
```

### sentry.edge.config.ts

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.05,
});
```

## Environment Variables

```bash
# .env.local
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

## Error Boundary

```tsx
"use client";

import * as Sentry from "@sentry/nextjs";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  eventId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo as unknown as Record<string, unknown>);
      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-container">
            <h1>Something went wrong</h1>
            <button
              onClick={() =>
                Sentry.showReportDialog({ eventId: this.state.eventId })
              }
            >
              Report feedback
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

## Manual Error Capture

### Basic Capture

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### With Context

```typescript
Sentry.withScope((scope) => {
  // Add tags
  scope.setTag("feature", "checkout");
  scope.setTag("plan", "pro");

  // Add extra data
  scope.setExtra("orderId", orderId);
  scope.setExtra("cartItems", cartItems);

  // Set user
  scope.setUser({
    id: user.id,
    email: user.email,
  });

  // Set level
  scope.setLevel("error");

  // Capture
  Sentry.captureException(error);
});
```

### Capture Message

```typescript
Sentry.captureMessage("Something noteworthy happened", {
  level: "info",
  tags: { feature: "billing" },
});
```

## Performance Monitoring

### Custom Transactions

```typescript
const transaction = Sentry.startTransaction({
  name: "processOrder",
  op: "task",
});

Sentry.getCurrentHub().configureScope((scope) => {
  scope.setSpan(transaction);
});

try {
  const span = transaction.startChild({
    op: "db.query",
    description: "SELECT * FROM orders",
  });

  await queryDatabase();
  span.finish();

  const apiSpan = transaction.startChild({
    op: "http.client",
    description: "POST /api/payment",
  });

  await callPaymentApi();
  apiSpan.finish();

} finally {
  transaction.finish();
}
```

### Spans with startSpan

```typescript
await Sentry.startSpan(
  {
    name: "fetchUserData",
    op: "http.client",
  },
  async (span) => {
    span?.setAttribute("user.id", userId);
    return await fetch(`/api/users/${userId}`);
  }
);
```

## Session Replay

### Configuration

```typescript
Sentry.init({
  integrations: [
    Sentry.replayIntegration({
      // Privacy
      maskAllText: false,
      maskAllInputs: true,
      blockAllMedia: false,

      // Masking selectors
      mask: [".sensitive-data", "[data-mask]"],
      block: [".password-field", "iframe"],

      // Ignore selectors
      ignore: [".cursor", ".tooltip"],

      // Network capture
      networkDetailAllowUrls: ["/api/"],
      networkRequestHeaders: ["X-Request-Id"],
      networkResponseHeaders: ["X-Request-Id"],
    }),
  ],
});
```

### Mask Specific Elements

```html
<div data-sentry-mask>This content will be masked</div>
<div data-sentry-block>This element will be blocked</div>
```

## Breadcrumbs

### Manual Breadcrumb

```typescript
Sentry.addBreadcrumb({
  category: "auth",
  message: "User logged in",
  level: "info",
  data: {
    userId: user.id,
    method: "google",
  },
});
```

### Filter Breadcrumbs

```typescript
Sentry.init({
  beforeBreadcrumb(breadcrumb, hint) {
    // Filter console breadcrumbs in production
    if (
      process.env.NODE_ENV === "production" &&
      breadcrumb.category === "console"
    ) {
      return null;
    }

    // Redact sensitive URLs
    if (breadcrumb.data?.url?.includes("password")) {
      breadcrumb.data.url = "[REDACTED]";
    }

    return breadcrumb;
  },
});
```

## User Feedback

### Feedback Widget

```typescript
Sentry.init({
  integrations: [
    Sentry.feedbackIntegration({
      colorScheme: "auto",
      buttonLabel: "Report Issue",
      formTitle: "Report an Issue",
      submitButtonLabel: "Send",
      cancelButtonLabel: "Cancel",
      messagePlaceholder: "Describe what happened...",
      successMessageText: "Thanks for the feedback!",
    }),
  ],
});
```

### Programmatic Feedback

```typescript
Sentry.showReportDialog({
  eventId: Sentry.lastEventId(),
  title: "Something went wrong",
  subtitle: "Help us fix this issue",
  labelName: "Name",
  labelEmail: "Email",
  labelComments: "What happened?",
});
```

## Filtering Events

### beforeSend

```typescript
Sentry.init({
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Filter known errors
    if (error?.message?.includes("Network request failed")) {
      return null;
    }

    // Filter by URL
    if (event.request?.url?.includes("/health")) {
      return null;
    }

    // Modify event
    if (event.user) {
      delete event.user.ip_address;
    }

    return event;
  },
});
```

### Ignore Errors

```typescript
Sentry.init({
  ignoreErrors: [
    // Browser errors
    "ResizeObserver loop",
    /^Script error\.?$/,

    // Network errors
    "Failed to fetch",
    "NetworkError",

    // Third-party
    /gtag/,
    /fbq/,
  ],

  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],
});
```

## Release Health

### Configure Release

```typescript
Sentry.init({
  release: process.env.SENTRY_RELEASE || "1.0.0",

  // Track release health
  autoSessionTracking: true,
});
```

### Deploy Tracking

```bash
# Create release
sentry-cli releases new $VERSION

# Associate commits
sentry-cli releases set-commits $VERSION --auto

# Upload source maps
sentry-cli sourcemaps upload --release=$VERSION ./dist

# Finalize
sentry-cli releases finalize $VERSION

# Create deploy
sentry-cli releases deploys $VERSION new -e production
```

## Best Practices

1. **Sample rates**: Use 0.1-0.2 for production, 1.0 for development
2. **Sensitive data**: Always redact PII and credentials
3. **Error grouping**: Use fingerprints for custom grouping
4. **Releases**: Tag releases and upload source maps
5. **Alerts**: Set up alerts for new issues and regressions
6. **Performance budgets**: Monitor key transactions
