# PostHog Analytics Reference

## Installation

```bash
# Client-side
pnpm add posthog-js

# Server-side
pnpm add posthog-node

# React integration
pnpm add posthog-js
```

## Setup

### Environment Variables

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
POSTHOG_API_KEY=phx_xxx  # Server-side (personal API key)
```

### Next.js App Router Setup

```tsx
// app/providers.tsx
"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false, // Manual control
  });
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

// app/layout.tsx
import { PHProvider } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PHProvider>{children}</PHProvider>
      </body>
    </html>
  );
}
```

### Page View Tracking

```tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect, Suspense } from "react";

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

export default function PostHogPageViewWrapper() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
```

## Event Tracking

### Basic Events

```typescript
import posthog from "posthog-js";

// Simple event
posthog.capture("button_clicked");

// Event with properties
posthog.capture("purchase_completed", {
  product_id: "123",
  price: 99.99,
  currency: "EUR",
});

// Event with groups
posthog.capture("feature_used", {
  feature: "export",
  $groups: { company: "acme-corp" },
});
```

### User Identification

```typescript
// Identify user
posthog.identify(user.id, {
  email: user.email,
  name: user.name,
  plan: user.plan,
  created_at: user.createdAt,
});

// Reset on logout
posthog.reset();

// Alias (link anonymous to identified)
posthog.alias(user.id);
```

### Super Properties

```typescript
// Set properties that persist across events
posthog.register({
  app_version: "1.2.0",
  platform: "web",
});

// Set once (doesn't overwrite)
posthog.register_once({
  first_visit: new Date().toISOString(),
});

// Unregister
posthog.unregister("app_version");
```

## Feature Flags

### Client-side

```typescript
import { useFeatureFlagEnabled, useFeatureFlagPayload } from "posthog-js/react";

function MyComponent() {
  // Boolean flag
  const showNewUI = useFeatureFlagEnabled("new-ui");

  // Flag with payload
  const config = useFeatureFlagPayload("feature-config");

  if (showNewUI) {
    return <NewUI config={config} />;
  }

  return <OldUI />;
}

// Imperative check
const isEnabled = posthog.isFeatureEnabled("feature-name");
const payload = posthog.getFeatureFlagPayload("feature-name");
```

### Server-side

```typescript
import { PostHog } from "posthog-node";

const posthog = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: process.env.POSTHOG_HOST,
});

// Check flag
const isEnabled = await posthog.isFeatureEnabled("feature-name", userId);

// Get all flags
const flags = await posthog.getAllFlags(userId);

// With groups
const enabled = await posthog.isFeatureEnabled("feature", userId, {
  groups: { company: "acme-corp" },
});

// Shutdown (important for serverless)
await posthog.shutdown();
```

### Feature Flag Tracking

```typescript
// Track which variant was shown
posthog.capture("$feature_flag_called", {
  $feature_flag: "experiment-name",
  $feature_flag_response: variantName,
});
```

## Group Analytics

### Define Groups

```typescript
// Associate user with group
posthog.group("company", "acme-corp", {
  name: "Acme Corporation",
  industry: "Technology",
  employee_count: 100,
  plan: "enterprise",
});

// Multiple groups
posthog.group("company", "acme-corp");
posthog.group("team", "engineering");
```

### Group Identify (Server)

```typescript
posthog.groupIdentify({
  groupType: "company",
  groupKey: "acme-corp",
  properties: {
    name: "Acme Corporation",
    mrr: 10000,
  },
});
```

## Session Replay

### Configuration

```typescript
posthog.init(POSTHOG_KEY, {
  // Enable session replay
  disable_session_recording: false,

  session_recording: {
    // Mask all text
    maskAllInputs: true,
    maskTextSelector: "[data-mask]",

    // Block specific elements
    blockSelector: ".sensitive-content",

    // Record console logs
    recordCrossOriginIframes: false,
  },
});
```

### Manual Control

```typescript
// Start recording
posthog.startSessionRecording();

// Stop recording
posthog.stopSessionRecording();

// Get session URL
const sessionUrl = posthog.get_session_replay_url();
```

### Privacy Masking

```html
<!-- Mask text content -->
<div data-ph-capture-attribute-mask>Sensitive data</div>

<!-- Completely ignore element -->
<div data-ph-no-capture>Hidden from replay</div>
```

## Surveys

### In-App Surveys

```typescript
// Surveys are automatically shown based on PostHog config

// Programmatically show survey
posthog.capture("$survey_shown", {
  $survey_id: "survey-uuid",
});

// Record response
posthog.capture("$survey_response", {
  $survey_id: "survey-uuid",
  $survey_response: "Very satisfied",
});
```

## A/B Testing

### Running Experiments

```typescript
// Get experiment variant
const variant = posthog.getFeatureFlag("pricing-experiment");

// Track exposure
useEffect(() => {
  if (variant) {
    posthog.capture("$feature_flag_called", {
      $feature_flag: "pricing-experiment",
      $feature_flag_response: variant,
    });
  }
}, [variant]);

// Render based on variant
switch (variant) {
  case "control":
    return <ControlPricing />;
  case "variant-a":
    return <VariantAPricing />;
  case "variant-b":
    return <VariantBPricing />;
  default:
    return <ControlPricing />;
}
```

### Goal Tracking

```typescript
// Track conversion goal
posthog.capture("purchase_completed", {
  experiment: "pricing-experiment",
  variant: variant,
  revenue: 99.99,
});
```

## React Hooks

```typescript
import {
  usePostHog,
  useFeatureFlagEnabled,
  useFeatureFlagPayload,
  useFeatureFlagVariantKey,
  useActiveFeatureFlags,
} from "posthog-js/react";

function MyComponent() {
  const posthog = usePostHog();

  // Feature flags
  const isEnabled = useFeatureFlagEnabled("feature");
  const payload = useFeatureFlagPayload("feature");
  const variant = useFeatureFlagVariantKey("experiment");
  const allFlags = useActiveFeatureFlags();

  const handleClick = () => {
    posthog.capture("button_clicked");
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

## Server-Side Events

```typescript
import { PostHog } from "posthog-node";

const posthog = new PostHog(POSTHOG_API_KEY, {
  host: POSTHOG_HOST,
  flushAt: 1, // Flush immediately (serverless)
  flushInterval: 0,
});

// Capture event
posthog.capture({
  distinctId: userId,
  event: "subscription_created",
  properties: {
    plan: "pro",
    price: 29.99,
  },
});

// Important: flush before function ends
await posthog.flush();
```

## Best Practices

### Event Naming

```typescript
// Use snake_case for events
posthog.capture("user_signed_up");
posthog.capture("purchase_completed");
posthog.capture("feature_activated");

// Use descriptive names
// Good
posthog.capture("checkout_started");
posthog.capture("checkout_step_completed", { step: 2 });

// Bad
posthog.capture("click");
posthog.capture("step2");
```

### Property Naming

```typescript
// Use snake_case for properties
posthog.capture("order_placed", {
  order_id: "123",
  total_amount: 99.99,
  item_count: 3,
  payment_method: "card",
});

// Use consistent types
posthog.capture("search", {
  query: "shoes",           // string
  results_count: 42,        // number
  has_filters: true,        // boolean
  filters: ["color", "size"], // array
});
```

### Avoid PII

```typescript
// Don't send PII in events
// Bad
posthog.capture("form_submitted", {
  email: user.email,
  phone: user.phone,
  ssn: user.ssn,
});

// Good - identify user separately
posthog.identify(user.id, { email: user.email });
posthog.capture("form_submitted", {
  form_type: "contact",
});
```

### Performance

```typescript
// Batch events when possible
const events = items.map((item) => ({
  event: "item_viewed",
  properties: { item_id: item.id },
}));

// Use autocapture judiciously
posthog.init(KEY, {
  autocapture: false, // Disable if too noisy
});

// Disable in development
if (process.env.NODE_ENV === "development") {
  posthog.opt_out_capturing();
}
```
