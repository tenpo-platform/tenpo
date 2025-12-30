# Security Review Report — Tenpo Repository

**Date:** December 29, 2025
**Reviewed by:** Claude Code Security Audit
**Repository:** Tenpo (Next.js 16 + Supabase + Sentry)

---

## Executive Summary

This is a relatively early-stage Next.js 16 application with Supabase authentication and Sentry error tracking. The codebase is minimal (essentially a "Coming Soon" page), which limits the attack surface. However, several security concerns and recommendations have been identified across configuration, dependencies, and best practices.

---

## Positive Findings (No Issues)

| Area | Status |
|------|--------|
| **XSS/Injection vulnerabilities** | No `dangerouslySetInnerHTML`, `eval()`, `innerHTML`, or command injection patterns found |
| **Hardcoded secrets** | No secrets found in source code or git history |
| **Environment files** | `.env*` files properly git-ignored |
| **Static content** | Current page has no user input, minimal attack surface |

---

## Critical Issues

### 1. Weak Password Policy - FIXED

**Location:** `supabase/config.toml:169-172`

**Status:** Resolved

**Fix Applied:**
```toml
minimum_password_length = 12
password_requirements = "lower_upper_letters_digits_symbols"
```

---

## High Priority Issues

### 2. Sentry DSN Exposed to Client

**Location:** `sentry.*.config.ts`

```typescript
dsn: process.env.NEXT_PUBLIC_SENTRY_DSN
```

**Risk:** While intentional for client-side error tracking, the DSN is publicly visible. Attackers could flood your Sentry with fake errors.

**Recommendation:**
- Enable Sentry's "Allowed Domains" feature
- Implement rate limiting in Sentry project settings
- Consider using Sentry tunnel to hide the DSN

---

### 3. 100% Trace Sample Rate in Production - FIXED

**Location:** `sentry.*.config.ts`

**Status:** Resolved

**Fix Applied:**
```typescript
tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0
```

Also added feature flag to disable Sentry entirely via `NEXT_PUBLIC_ENABLE_ANALYTICS=false`.

---

### 4. Missing Security Headers - FIXED

**Location:** `next.config.ts`

**Status:** Resolved

**Fix Applied:**
```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
```

---

### 5. No CAPTCHA Enabled - FIXED

**Location:** `supabase/config.toml:191-194`

**Status:** Resolved

**Fix Applied:**
```toml
[auth.captcha]
enabled = true
provider = "turnstile"
secret = "env(TURNSTILE_SECRET_KEY)"
```

**Note:** You must set `TURNSTILE_SECRET_KEY` environment variable with your Cloudflare Turnstile secret.

---

## Medium Priority Issues

### 6. Email Confirmation Disabled - FIXED

**Location:** `supabase/config.toml:203`

**Status:** Resolved

**Fix Applied:**
```toml
enable_confirmations = true
```

---

### 7. Secure Password Change Disabled - FIXED

**Location:** `supabase/config.toml:205`

**Status:** Resolved

**Fix Applied:**
```toml
secure_password_change = true
```

---

### 8. Non-Assertion Environment Variables - FIXED

**Location:** `src/utils/supabase/*.ts`

**Status:** Resolved

**Fix Applied:** All three Supabase client files use a helper function that validates and narrows types:
```typescript
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }
  return value;
}

// Usage
createBrowserClient(
  getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
  getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY")
);
```

---

### 9. Local API TLS Disabled - FIXED

**Location:** `supabase/config.toml:21-22`

**Status:** Resolved

**Fix Applied:**
```toml
[api.tls]
enabled = true
```

**Note:** For local development, you may need to configure self-signed certificates or disable if causing issues.

---

### 10. Sentry Example Page Present - REMOVED

**Location:** `src/app/sentry-example-page/page.tsx`

**Status:** Resolved

**Risk:** Test/example pages may expose sensitive debug info in production.

**Action:** Removed from codebase.

---

## Low Priority / Informational

### 11. Dependency Version Ranges

**Location:** `package.json`

```json
"@sentry/nextjs": "^10.32.1",
"@supabase/ssr": "^0.8.0",
```

**Note:** Using caret (`^`) allows minor/patch updates automatically.

**Recommendation:** Consider pinning exact versions and using Dependabot/Renovate for controlled updates.

---

### 12. No Content Security Policy (CSP)

**Risk:** Without CSP, the app is more vulnerable to XSS if user input is added later.

**Recommendation:** Implement a strict CSP when adding user-generated content.

---

### 13. Permissive Rate Limiting on Auth Endpoints - FIXED

**Location:** `supabase/config.toml:174-188`

**Status:** Resolved

**Fix Applied:** Tightened rate limits:
```toml
[auth.rate_limit]
email_sent = 2           # per hour
sms_sent = 10            # per hour (was 30)
anonymous_users = 10     # per hour per IP (was 30)
token_refresh = 30       # per 5 min per IP (was 150)
sign_in_sign_ups = 10    # per 5 min per IP (was 30)
token_verifications = 10 # per 5 min per IP (was 30)
web3 = 10                # per 5 min per IP (was 30)
```

---

## Pre-Production Checklist

| Task | Priority | Status |
|------|----------|--------|
| Strengthen password requirements | Critical | Done |
| Add security headers to `next.config.ts` | High | Done |
| Enable email confirmations | High | Done |
| Enable CAPTCHA for auth | High | Done |
| Enable secure password change | Medium | Done |
| Reduce Sentry trace sample rate | Medium | Done |
| Add environment variable validation | Medium | Done |
| Enable local API TLS | Medium | Done |
| Tighten auth rate limits | Medium | Done |
| Remove sentry-example-page | Medium | Done |
| Implement CSP headers | Low | Pending |
| Configure Sentry allowed domains | Low | Done (Dashboard) |

---

## Files Reviewed

- `package.json`
- `next.config.ts`
- `.gitignore`
- `src/middleware.ts`
- `src/utils/supabase/client.ts`
- `src/utils/supabase/server.ts`
- `src/utils/supabase/middleware.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/global-error.tsx`
- `src/instrumentation.ts`
- `src/instrumentation-client.ts`
- `sentry.edge.config.ts`
- `sentry.server.config.ts`
- `supabase/config.toml`
- `supabase/.gitignore`
