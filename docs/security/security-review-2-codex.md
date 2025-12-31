# Security Review Report — Tenpo Repository (Codex)

Date: 2025-12-30
Reviewed by: Codex (GPT-5)
Repository: Tenpo (Next.js 16 + Supabase + Sentry)

## Scope
- Application code and configuration in the repository root.
- Supabase configuration and scripts.
- Sentry configuration and client initialization.
- Documentation that affects security posture.

Out of scope:
- Supabase project settings, RLS policies, and database contents.
- Sentry project settings and backend dashboards.
- Infrastructure, CI/CD, and deployment environment secrets.

## Methodology
- Manual code review of Next.js app, middleware, and integrations.
- Static scan for common risky patterns (eval, innerHTML, etc.).
- Secret pattern scans of tracked files and git history.
- Dependency vulnerability check via `yarn npm audit`.

## Findings

### 1) High — Secret material present in local env files
Evidence:
- `.env.scripts:7-8` contains production and staging database passwords.
- `.env.local:12` contains a Sentry auth token.

Impact:
If these files are committed, shared, or exfiltrated, production/staging database access and Sentry source-map upload access can be compromised. This is especially risky given the restore scripts connect directly to production.

Recommendations:
- Immediately rotate the exposed database passwords and Sentry auth token.
- Remove `.env.scripts` and `.env.local` from the repo workspace and load secrets from a secure manager or OS keychain.
- Add a pre-commit secret scanner and server-side secret scanning (gitleaks, trufflehog, or GitHub Advanced Security).

Status: Open

### 2) Medium — Missing CSP and HSTS headers
Evidence:
- `next.config.ts:10-18` sets basic headers but does not include `Content-Security-Policy` or `Strict-Transport-Security`.

Impact:
Without CSP, future user-input features are more exposed to XSS. Without HSTS, HTTPS downgrade attacks are possible on production domains.

Recommendations:
- Add a CSP tailored to Next.js assets and Sentry.
- Add `Strict-Transport-Security` for production deployments (with preload once verified).

Status: Open

### 3) Medium — Sentry Replay enabled without privacy masking
Evidence:
- `src/instrumentation-client.ts:12-16` enables Replay with default masking.

Impact:
Once user input or auth screens are added, session replay can capture PII. This is a privacy and compliance risk.

Recommendations:
- Configure Replay with `maskAllText: true` and `blockAllMedia: true`, or disable Replay until privacy review is complete.

Status: Open

### 4) Low — Public Sentry DSN may allow event spam
Evidence:
- `src/instrumentation-client.ts:7`, `sentry.edge.config.ts:7`, `sentry.server.config.ts:7`.

Impact:
The DSN is intentionally public for client error reporting. Attackers can submit fake events and inflate costs.

Recommendations:
- Configure Sentry allowed domains and rate limits.
- Consider routing client events through a Sentry tunnel.

Status: Open

### 5) Low — Supabase network restrictions disabled in config
Evidence:
- `supabase/config.toml:65-73` sets `db.network_restrictions.enabled = false` with wide-open CIDRs.

Impact:
Safe for local development, but risky if the same config is reused for self-hosted production.

Recommendations:
- Add explicit production config with restrictive IP allowlists.
- Document that `supabase/config.toml` is local-only.

Status: Open

## Positive Findings
- No use of `dangerouslySetInnerHTML`, `eval`, `innerHTML`, or `new Function` in `src`.
- Supabase auth has strong password rules and captcha enabled.
- Auth rate limits are tightened from defaults.
- Dependency audit reported no known vulnerabilities.

## Dependency Audit
- `yarn npm audit` (2025-12-30): No audit suggestions.

## Git History Secret Check
- Searched git history for common secret tokens and keys. Only documentation and script references were found; no historical commits with actual secrets were detected.

## Recommendations Summary
- Rotate and remove secrets present in local env files.
- Add CSP and HSTS headers for production.
- Configure Sentry Replay privacy or disable until needed.
- Separate local and production Supabase configs with network restrictions.

