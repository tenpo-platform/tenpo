# Sentry Error Monitoring Guide

## Overview

Sentry captures errors, exceptions, and performance data across the application. It's integrated into the Next.js app for both client and server-side error tracking.

| | |
|---|---|
| **Account** | Company-owned (sam@jointenpo.com) |
| **Org** | tenpo-hl |
| **Project** | tenpo |
| **Dashboard** | https://tenpo-hl.sentry.io |

---

## Project Structure

Next.js 16 uses Turbopack by default, which requires `instrumentation-client.ts` for client-side Sentry (not `sentry.client.config.ts`).

```
/
├── sentry.server.config.ts          # Node.js server-side Sentry init
├── sentry.edge.config.ts            # Edge runtime Sentry init
├── next.config.ts                   # Wrapped with withSentryConfig
└── src/
    ├── instrumentation.ts           # Server-side instrumentation hook
    ├── instrumentation-client.ts    # Client-side Sentry init (Turbopack)
    └── app/
        ├── global-error.tsx         # Root error boundary
        └── sentry-example-page/     # Test page (can be deleted)
```

**Important:** For Next.js 16+ with Turbopack, use `instrumentation-client.ts` in the `src/` directory for browser-side initialization. The old `sentry.client.config.ts` at root does not work with Turbopack.

---

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | `.env.local` + Vercel | Project DSN (safe for client) |
| `SENTRY_AUTH_TOKEN` | `.env.local` + Vercel | Source map uploads (secret) |

**Getting these values:**
- DSN: Sentry → Project Settings → Client Keys (DSN)
- Auth Token: Sentry → User Settings → Auth Tokens → Create with `project:releases`, `project:read`, `org:read` scopes

---

## How It Works

### Client-Side (Browser)

`src/instrumentation-client.ts` initializes Sentry in the browser with:
- **Error tracking**: Automatic exception capture
- **Session Replay**: Records user sessions on errors (10% of sessions, 100% on error)
- **Tracing**: Performance monitoring

### Server-Side (Node.js)

`sentry.server.config.ts` initializes Sentry for:
- Server Components
- API Routes
- Server Actions

### Edge Runtime

`sentry.edge.config.ts` handles errors in:
- Middleware
- Edge API routes

### Instrumentation Hook

`src/instrumentation.ts` loads server/edge configs based on runtime and captures request-level errors via `onRequestError`.

### Global Error Boundary

`src/app/global-error.tsx` catches unhandled errors at the root level and:
- Reports them to Sentry
- Shows a fallback UI with "Try again" button

---

## Common Tasks

### Manually Capture an Error

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error);
}
```

### Capture a Message (Non-Error)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.captureMessage("Something noteworthy happened");
```

### Add Context to Errors

```typescript
import * as Sentry from "@sentry/nextjs";

// Set user context (persists across errors)
Sentry.setUser({
  id: user.id,
  email: user.email,
});

// Add extra data to next error
Sentry.setExtra("orderDetails", { orderId: "123", amount: 50 });

// Add tags for filtering
Sentry.setTag("feature", "checkout");
```

---

## Adding Sentry to New Features

### For a New Page with Error Handling

```typescript
// src/app/dashboard/page.tsx
import * as Sentry from "@sentry/nextjs";

export default async function DashboardPage() {
  try {
    const data = await fetchDashboardData();
    return <Dashboard data={data} />;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { page: "dashboard" },
    });
    throw error; // Re-throw to trigger error boundary
  }
}
```

### For a Client Component with Error Boundary

```typescript
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div>
      <p>Something went wrong</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### For Server Actions

```typescript
"use server";

import * as Sentry from "@sentry/nextjs";

export async function submitForm(formData: FormData) {
  try {
    // Process form
    return { success: true };
  } catch (error) {
    Sentry.captureException(error, {
      extra: { formData: Object.fromEntries(formData) },
    });
    return { success: false, error: "Something went wrong" };
  }
}
```

---

## Configuration Reference

### Sampling Rates

In `src/instrumentation-client.ts`:

```typescript
Sentry.init({
  tracesSampleRate: 1.0,         // 100% of transactions (reduce in prod)
  replaysOnErrorSampleRate: 1.0, // 100% replay on errors
  replaysSessionSampleRate: 0.1, // 10% of all sessions
});
```

**Production recommendations:**
- `tracesSampleRate`: 0.1 - 0.2 (10-20%)
- `replaysSessionSampleRate`: 0.01 - 0.1 (1-10%)

### Source Maps

Source maps are uploaded automatically during build via `next.config.ts`:

```typescript
withSentryConfig(nextConfig, {
  org: "tenpo-hl",
  project: "tenpo",
  silent: true,
});
```

Requires `SENTRY_AUTH_TOKEN` in environment.

---

## Debugging

### Test Error Capture Locally

Visit `/sentry-example-page` and click the test buttons, or create a test route:

```typescript
// src/app/api/sentry-test/route.ts
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  Sentry.captureMessage("Test message from API");
  throw new Error("Test error from API route");
}
```

### Verify Sentry is Loading

In browser console:
```javascript
window.__SENTRY__
```

Should return the Sentry hub object. With `debug: true` in the client config, you'll see initialization logs.

### Test via CLI

```bash
SENTRY_AUTH_TOKEN="your-token" SENTRY_DSN="your-dsn" ./node_modules/.bin/sentry-cli send-event -m "Test event"
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Errors not appearing | Check DSN is set, verify with test error |
| Client errors not captured | Ensure `src/instrumentation-client.ts` exists (not `sentry.client.config.ts` at root) |
| Minified stack traces | Add `SENTRY_AUTH_TOKEN` to Vercel for source map uploads |
| Too many errors | Adjust sample rates, add filtering |
| Replay not working | Only works client-side, check `replaysOnErrorSampleRate` |
| Server errors missing | Verify `instrumentation.ts` exists and imports configs |

### Next.js 16 + Turbopack Note

Next.js 16 uses Turbopack by default. The old `sentry.client.config.ts` at project root does **not** work with Turbopack. You must use `src/instrumentation-client.ts` instead.

---

## Future: Mobile (React Native)

When adding the Expo/React Native app, use `@sentry/react-native`:

```bash
yarn add @sentry/react-native
npx @sentry/wizard -i reactNative
```

Can use the same Sentry org with a separate `tenpo-mobile` project for cleaner separation.
