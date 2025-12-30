# Feature Flags

Feature flags allow you to toggle functionality on/off via environment variables. This is useful for:
- Disabling features in preview deployments
- Testing without third-party services
- Gradual rollouts

---

## Available Flags

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_ENABLE_CAPTCHA` | `true` | Enable Turnstile CAPTCHA on auth forms |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `true` | Enable Sentry error tracking |

---

## Usage

### Vercel Environment Variables

Set these in **Vercel Dashboard → Project → Settings → Environment Variables**:

**Production:**
```
NEXT_PUBLIC_ENABLE_CAPTCHA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

**Preview (optional - disable if not configured):**
```
NEXT_PUBLIC_ENABLE_CAPTCHA=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

**Development (local `.env.local`):**
```
NEXT_PUBLIC_ENABLE_CAPTCHA=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

---

## In Code

Import the feature flags config:

```typescript
import { features } from "@/config/features";

if (features.captcha) {
  // Show CAPTCHA widget
}

if (features.analytics) {
  // Track event
}
```

---

## How It Works

Flags default to **enabled** (`true`). They are only disabled when explicitly set to `"false"`:

```typescript
// Enabled by default, disabled only when set to "false"
captcha: process.env.NEXT_PUBLIC_ENABLE_CAPTCHA !== "false"
```

This means:
- `undefined` → enabled
- `"true"` → enabled
- `"false"` → disabled

---

## Files

- `src/config/features.ts` - Feature flags configuration
- `src/instrumentation-client.ts` - Client-side Sentry (checks analytics flag)
- `sentry.server.config.ts` - Server-side Sentry (checks analytics flag)
- `sentry.edge.config.ts` - Edge Sentry (checks analytics flag)
