# Security Review Report #2 — Tenpo Repository

**Date:** December 30, 2025
**Reviewed by:** Claude Code Security Audit (Independent Verification)
**Repository:** Tenpo (Next.js 16 + Supabase + Sentry)
**Previous Review:** security-review-1.md (December 29, 2025)

---

## Executive Summary

This is an independent security audit verifying the claims made in the previous security review and identifying any new issues. The codebase remains a minimal "Coming Soon" page with Supabase auth infrastructure and Sentry error tracking configured.

**Overall Assessment:** The codebase is in good security posture for an early-stage application. Most items from the previous review have been properly implemented. A few new issues and recommendations are noted below.

---

## Verification of Previous Review Fixes

| Item | Claimed Status | Verified | Notes |
|------|----------------|----------|-------|
| Password Policy (12 chars, complex) | Fixed | **YES** | `supabase/config.toml:169-172` confirmed |
| Security Headers | Fixed | **YES** | `next.config.ts:5-21` confirmed - all 5 headers present |
| CAPTCHA Enabled | Fixed | **YES** | `supabase/config.toml:191-194` - Turnstile configured |
| Email Confirmations | Fixed | **YES** | `supabase/config.toml:203` - `enable_confirmations = true` |
| Secure Password Change | Fixed | **YES** | `supabase/config.toml:205` - `secure_password_change = true` |
| Sentry Sample Rate | Fixed | **YES** | All 3 config files use `0.1` in production |
| Environment Variable Validation | Fixed | **YES** | `getEnvVar()` helper used in all 3 Supabase client files |
| Rate Limits Tightened | Fixed | **YES** | `supabase/config.toml:174-188` confirmed |
| Sentry Example Page | Removed | **YES** | Not present in `src/app/` |

---

## Positive Findings (No Issues)

| Area | Status | Evidence |
|------|--------|----------|
| **XSS/Injection vulnerabilities** | Clean | No `dangerouslySetInnerHTML`, `eval()`, `innerHTML` patterns found |
| **Hardcoded secrets** | Clean | No API keys, tokens, or passwords in source code |
| **Environment files** | Clean | `.env*` files properly git-ignored |
| **Git history** | Clean | No leaked secrets in commit history |
| **Dependency vulnerabilities** | Clean | `yarn npm audit` returns no issues |
| **Console logging** | Clean | No `console.log` statements that could leak data |
| **Static content** | Clean | No user input forms, minimal attack surface |

---

## New Issues Identified

### 1. Incorrect Redirect URL Configuration

**Severity:** Medium
**Location:** `supabase/config.toml:150`

```toml
additional_redirect_urls = ["https://127.0.0.1:3000"]
```

**Problem:** This URL is incorrect:
- Uses HTTPS for localhost (typically HTTP)
- Uses `127.0.0.1` instead of `localhost`
- Missing production domain `app.jointenpo.com`
- Missing staging domain `app-staging.jointenpo.com`

**Risk:** OAuth callbacks and auth redirects may fail in production.

**Recommendation:** Update to include all valid redirect URLs:
```toml
additional_redirect_urls = [
  "http://localhost:3000",
  "https://app.jointenpo.com",
  "https://app-staging.jointenpo.com"
]
```

---

### 2. Local TLS Enabled Without Certificates

**Severity:** Low
**Location:** `supabase/config.toml:20-25`

```toml
[api.tls]
enabled = true
# cert_path = "../certs/my-cert.pem"
# key_path = "../certs/my-key.pem"
```

**Problem:** TLS is enabled but certificate paths are commented out.

**Risk:** Local development may fail or behave unexpectedly.

**Recommendation:** Either:
- Disable TLS for local dev: `enabled = false`
- Or configure valid self-signed certificates

---

### 3. Hardcoded Supabase Project References in Scripts

**Severity:** Low (Informational)
**Location:** `scripts/restore-local.sh:19`, `scripts/restore-staging.sh:19-20`

```bash
PROD_REF="ifsjdiuheciwxuwrjsst"
STAGING_REF="zqyjrsjjdmiapyablbzv"
```

**Problem:** Supabase project references are hardcoded in public scripts.

**Risk:** While not secrets, these reveal infrastructure details. Combined with other info, could assist targeted attacks.

**Recommendation:** Move to environment variables:
```bash
PROD_REF="${SUPABASE_PROD_REF:-ifsjdiuheciwxuwrjsst}"
```

---

### 4. Insecure Temporary File Handling in Scripts

**Severity:** Low
**Location:** `scripts/restore-local.sh:39`, `scripts/restore-staging.sh:39`

```bash
SNAPSHOT_FILE="/tmp/tenpo-prod-snapshot.sql"
```

**Problem:**
- `/tmp` is world-readable on most systems
- No cleanup on script failure (only on success)
- Predictable filename enables race conditions

**Risk:** Database dump could be read by other users on shared systems.

**Recommendation:**
```bash
SNAPSHOT_FILE=$(mktemp -t tenpo-snapshot-XXXXXX.sql)
trap "rm -f '$SNAPSHOT_FILE'" EXIT
```

---

### 5. Shell Script Environment Variable Parsing

**Severity:** Low
**Location:** `scripts/*.sh:14-16`

```bash
export $(grep -v '^#' .env.scripts | xargs)
```

**Problem:** This parsing method can break with:
- Values containing spaces
- Values containing special characters
- Multi-line values

**Recommendation:** Use a more robust parser or source the file properly:
```bash
set -a
source .env.scripts
set +a
```

---

### 6. Missing Content Security Policy (CSP)

**Severity:** Low
**Location:** `next.config.ts`

**Status:** Still pending from previous review

**Risk:** Without CSP, the app is more vulnerable to XSS when user input is added.

**Recommendation:** Implement CSP before adding forms or user-generated content:
```typescript
{
  key: "Content-Security-Policy",
  value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
}
```

---

### 7. Vercel Project Metadata in Repository

**Severity:** Informational
**Location:** `.vercel/project.json`

```json
{"projectId":"prj_S8gtfnD5UPRjesDr7dYvJ0KO6OT7","orgId":"team_JFrxTDz5JHE0NL9tJpR7nRHx"}
```

**Problem:** While these are not secrets, they identify your specific Vercel project.

**Recommendation:** Add `.vercel/` to `.gitignore` (it's already in the default Next.js gitignore but currently tracked).

---

## Dependency Analysis

### Current Dependencies

| Package | Version | Security Notes |
|---------|---------|----------------|
| `next` | 16.1.1 | Latest stable, no known CVEs |
| `react` | 19.2.3 | Latest stable, no known CVEs |
| `@sentry/nextjs` | ^10.32.1 | Latest, no known CVEs |
| `@supabase/ssr` | ^0.8.0 | Latest, no known CVEs |
| `@supabase/supabase-js` | ^2.89.0 | Latest, no known CVEs |

### Audit Results

```
yarn npm audit --all
➤ YN0001: No audit suggestions
```

**Note:** Using caret (`^`) version ranges allows automatic updates. Consider pinning versions for reproducible builds.

---

## Files Reviewed

### Source Code
- `src/app/page.tsx` - Static page, no vulnerabilities
- `src/app/layout.tsx` - Font loading only, no vulnerabilities
- `src/app/global-error.tsx` - Error boundary, properly sanitized
- `src/middleware.ts` - Session refresh only
- `src/utils/supabase/client.ts` - Proper env validation
- `src/utils/supabase/server.ts` - Proper env validation
- `src/utils/supabase/middleware.ts` - Proper env validation
- `src/config/features.ts` - Feature flags, no vulnerabilities
- `src/instrumentation.ts` - Sentry init, no vulnerabilities
- `src/instrumentation-client.ts` - Sentry init, no vulnerabilities

### Configuration
- `next.config.ts` - Security headers verified
- `supabase/config.toml` - Auth settings verified
- `sentry.server.config.ts` - Sample rate verified
- `sentry.edge.config.ts` - Sample rate verified
- `package.json` - Dependencies reviewed
- `eslint.config.mjs` - Standard config, no disabled rules

### Scripts
- `scripts/restore-local.sh` - Issues noted above
- `scripts/restore-staging.sh` - Issues noted above

### Git
- `.gitignore` - Properly excludes `.env*` files
- `supabase/.gitignore` - Properly excludes local secrets
- Git history - No leaked secrets found

---

## Recommendations Summary

| Priority | Issue | Action |
|----------|-------|--------|
| **Medium** | Incorrect redirect URLs | Update `supabase/config.toml` with production domains |
| **Low** | Local TLS misconfiguration | Disable TLS or configure certificates |
| **Low** | Hardcoded project refs | Move to environment variables |
| **Low** | Insecure temp files | Use `mktemp` with trap for cleanup |
| **Low** | Env parsing in scripts | Use `source` instead of grep/xargs |
| **Low** | No CSP | Add when user input is introduced |
| **Info** | Vercel metadata tracked | Add `.vercel/` to `.gitignore` |

---

## Conclusion

The Tenpo repository demonstrates good security practices for an early-stage application:

1. **Strong authentication defaults** - Password complexity, email verification, CAPTCHA
2. **Proper secret management** - No hardcoded secrets, env files gitignored
3. **Defense in depth** - Security headers, rate limiting, session management
4. **Clean codebase** - No dangerous patterns, no vulnerable dependencies

The issues identified are minor and appropriate to address before adding user-facing features. The most actionable item is fixing the redirect URL configuration to ensure auth flows work correctly in all environments.

---

## Next Steps Before User Features

1. Fix redirect URL configuration in `supabase/config.toml`
2. Verify auth flow works in production and staging
3. Add CSP headers before implementing forms
4. Consider implementing RLS (Row Level Security) in Supabase before adding data features
