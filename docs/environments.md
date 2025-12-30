# Environments

This document describes the environment setup for Tenpo across Vercel, Supabase, Sentry, and Turnstile.

---

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│ PRODUCTION (Live users)                                      │
│  └── Vercel: app.jointenpo.com → tenpo-prod (hosted)        │
│  └── Sentry: tenpo-prod                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STAGING (Co-founder / QA testing)                            │
│  └── Vercel: app-staging.jointenpo.com → tenpo-staging      │
│  └── Sentry: tenpo-staging                                   │
│                                                              │
│  🔄 Reset from prod: ./scripts/restore-staging.sh           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ LOCAL DEV (Your machine)                                     │
│  └── Next.js: localhost:3000 → supabase start (Docker)      │
│  └── Sentry: disabled via feature flag                       │
│  └── Turnstile: disabled via feature flag                    │
│                                                              │
│  🔄 Reset from prod: ./scripts/restore-local.sh             │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Mapping

| Environment | URL | Supabase | Sentry | Turnstile |
|-------------|-----|----------|--------|-----------|
| Production | `app.jointenpo.com` | `tenpo-prod` | `tenpo-prod` | Enabled |
| Staging | `app-staging.jointenpo.com` | `tenpo-staging` | `tenpo-staging` | Disabled |
| Local | `localhost:3000` | Docker | Disabled | Disabled |

---

## Vercel Environments

### Production
- **Trigger:** Push to `main` branch
- **URL:** `app.jointenpo.com`
- **Database:** `tenpo-prod`
- **Sentry:** `tenpo-prod`
- **Feature flags:** CAPTCHA and Analytics enabled

### Preview
- **Trigger:** Any PR or branch push
- **URL:** `app-staging.jointenpo.com`
- **Database:** `tenpo-staging`
- **Sentry:** `tenpo-staging`
- **Feature flags:** CAPTCHA and Analytics disabled
- **Use case:** Share links with co-founder for testing

### Development
- **Not used** - we use local Docker instead for full isolation

---

## Service Configuration

### Supabase Projects

| Project | Purpose | Reset Strategy |
|---------|---------|----------------|
| `tenpo-prod` | Production data | Never reset |
| `tenpo-staging` | Preview deployments, QA | Restore from prod snapshot |

### Sentry Projects

| Project | Allowed Domains |
|---------|-----------------|
| `tenpo-prod` | `app.jointenpo.com` |
| `tenpo-staging` | `app-staging.jointenpo.com` |

### Turnstile (Cloudflare)

| Allowed Domains |
|-----------------|
| `app.jointenpo.com` |
| `app-staging.jointenpo.com` |

---

## Local Development

Local development uses Docker via Supabase CLI for complete isolation.

### Setup

```bash
# Start local Supabase (Postgres, Auth, Storage, etc.)
supabase start

# Run Next.js dev server
npm run dev
```

### Local URLs

| Service | URL |
|---------|-----|
| App | http://localhost:3000 |
| Supabase API | http://localhost:54321 |
| Supabase Studio | http://localhost:54323 |
| Inbucket (Email) | http://localhost:54324 |

### Stop Local Supabase

```bash
supabase stop
```

---

## Snapshot & Restore

### Restore Staging from Production

Use when co-founder needs fresh prod-like data:

```bash
./scripts/restore-staging.sh
```
Preview deployments now have fresh copy of prod data.

### Restore Local from Production

Use when you need fresh prod-like data locally:

```bash
./scripts/restore-local.sh
```
Your local Docker DB now has fresh copy of prod data.

### Prerequisites

Create `.env.scripts` with database passwords:

```bash
cp scripts/.env.scripts.example .env.scripts
# Edit .env.scripts with passwords from Supabase Dashboard
```

---

## Environment Variables

### Vercel

| Variable | Production | Preview |
|----------|------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | tenpo-prod URL | tenpo-staging URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tenpo-prod key | tenpo-staging key |
| `NEXT_PUBLIC_SENTRY_DSN` | tenpo-prod DSN | tenpo-staging DSN |
| `NEXT_PUBLIC_ENABLE_CAPTCHA` | `true` | `false` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `true` | `false` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | (set) | (set) |
| `TURNSTILE_SECRET_KEY` | (set) | (set) |

### Local (`.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
NEXT_PUBLIC_ENABLE_CAPTCHA=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

---

## Workflow Examples

### Feature Development

1. Create branch, push to GitHub
2. Vercel auto-deploys to `app-staging.jointenpo.com`
3. Share URL with co-founder
4. Co-founder tests, breaks things freely
5. Merge to main → deploys to `app.jointenpo.com`

### Co-founder Needs Fresh Data

```bash
./scripts/restore-staging.sh
```

### You Need Fresh Data Locally

```bash
./scripts/restore-local.sh
```
