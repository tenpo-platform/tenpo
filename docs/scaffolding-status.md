# Scaffolding Status

**Last Updated:** 2026-01-07

This document tracks the foundational scaffolding needed before building features.

---

## Overview

```
                        DONE    NEEDED
                        ────    ──────
┌─────────────────────────────────────────────────────────┐
│  FRONTEND                                               │
│                                                         │
│  UI Components (buttons, forms, etc.)      ████████░░   │
│  App Pages (login, dashboard, etc.)        ░░░░░░░░░░   │
│  Layouts (sidebar, nav, etc.)              ░░░░░░░░░░   │
│  Auth Flow (login/signup screens)          ░░░░░░░░░░   │
└─────────────────────────────────────────────────────────┘
                          │
                          │  ← No connection yet
                          ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND                                                │
│                                                         │
│  Supabase Client (connection code)         ████████░░   │
│  Type Safety (client knows DB shape)       ░░░░░░░░░░   │
│  Auth Helpers (get current user, etc.)     ░░░░░░░░░░   │
└─────────────────────────────────────────────────────────┘
                          │
                          │  ← Connection ready
                          ▼
┌─────────────────────────────────────────────────────────┐
│  DATABASE                                               │
│                                                         │
│  Tables                                    ██████████   │
│  Security Rules (RLS)                      ██████████   │
│  TypeScript Types                          ██████████   │
└─────────────────────────────────────────────────────────┘
```

---

## Database (DB) — Complete

The database layer is fully built and ready.

| Component | Status | Notes |
|-----------|--------|-------|
| Tables | Done | 19 tables across 4 migrations |
| ENUMs | Done | 7 type-safe enums |
| RLS Policies | Done | 63 policies for row-level security |
| Triggers | Done | 11 auto-update triggers |
| Indexes | Done | 12 indexes for query performance |
| RPCs | Done | `reserve_ticket()` for atomic operations |
| TypeScript Types | Done | `src/types/database.types.ts` |
| Seed Data | Done | 8 sports + DivineTime academy |

**Files:**
- `supabase/migrations/20260107000000_db_phase.sql`
- `supabase/migrations/20260107000001_admin_phase.sql`
- `supabase/migrations/20260107000002_public_phase.sql`
- `supabase/migrations/20260107000003_stripe_phase.sql`
- `supabase/seed.sql`
- `src/types/database.types.ts`

---

## Backend (BE) — Scaffolding Only

Connection to database exists but isn't wired up properly.

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase Browser Client | Exists | `src/utils/supabase/client.ts` |
| Supabase Server Client | Exists | `src/utils/supabase/server.ts` |
| Middleware | Exists | `src/middleware.ts` |
| Type-Safe Clients | Missing | Clients don't use `Database` type yet |
| Auth Helpers | Missing | No `getCurrentUser()`, `getUserRoles()`, etc. |
| Role Guards | Missing | No `requireRole('ACADEMY_ADMIN')` helper |
| API Routes | Missing | `src/app/api/` doesn't exist |

**To complete scaffolding:**
```typescript
// Example: Type-safe client (not yet implemented)
import { Database } from '@/types/database.types'

const supabase = createClient<Database>(...)

// Now supabase.from('events') knows all columns and types
```

---

## Frontend (FE) — UI Components Only

We have the building blocks but no actual application screens.

| Component | Status | Notes |
|-----------|--------|-------|
| UI Components | Done | ~25 shadcn/ui components |
| Icons | Done | Custom icon set |
| Fonts | Done | Custom fonts configured |
| Styling | Done | Tailwind + globals.css |
| Auth Pages | Missing | Login, signup, forgot password |
| Layouts | Missing | App shell, sidebar, nav |
| Protected Routes | Missing | Auth-required page wrapper |
| App Pages | Missing | Dashboard, camp list, etc. |

**What exists:**
- `src/components/ui/` — Reusable UI primitives
- `src/app/page.tsx` — "Coming Soon" placeholder
- `src/app/ds/` — Design system preview
- `src/app/sample-landing/` — Landing page sample

---

## Scaffolding Checklist

Before building features, complete these foundational items:

### 1. Wire Up Types
- [ ] Add `Database` type to browser client
- [ ] Add `Database` type to server client
- [ ] Export typed helpers from a central location

### 2. Auth Helpers
- [ ] `getCurrentUser()` — Get logged-in user's profile
- [ ] `getUserRoles()` — Get user's roles array
- [ ] `requireAuth()` — Redirect if not logged in
- [ ] `requireRole(role)` — Check specific role

### 3. Basic Layouts
- [ ] App shell with sidebar/header
- [ ] Public layout (for marketing pages)
- [ ] Auth layout (for login/signup)

### 4. Auth Pages
- [ ] `/login` — Email/password login
- [ ] `/signup` — Create account
- [ ] `/forgot-password` — Password reset
- [ ] `/auth/callback` — OAuth callback handler

### 5. Protected Routes
- [ ] Middleware to check auth on protected paths
- [ ] Role-based route protection
- [ ] Redirect logic after login

---

## Architecture Reference

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Browser)                                         │
│  - React components render UI                               │
│  - Calls Supabase directly (RLS protects data)              │
│  - Or calls Next.js API routes for complex operations       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Next.js Server + Supabase Services)               │
│                                                             │
│  Next.js:                                                   │
│  - Server Components (fetch data server-side)               │
│  - API Routes (complex business logic)                      │
│  - Middleware (auth checks on every request)                │
│                                                             │
│  Supabase (managed):                                        │
│  - Auth — Login, signup, sessions                           │
│  - PostgREST — Auto-generated REST API                      │
│  - Realtime — Live subscriptions                            │
│  - Storage — File uploads                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  DATABASE (PostgreSQL)                                      │
│  - Tables store all application data                        │
│  - RLS policies enforce security (who sees what)            │
│  - Triggers handle auto-updates                             │
│  - Functions handle complex operations                      │
└─────────────────────────────────────────────────────────────┘
```

**Key insight:** RLS policies in the database act as backend security. The frontend can query the database directly, and RLS ensures users only access their own data.

---

## Next Steps

Once scaffolding is complete, features can be built on top:

1. **Auth Flow** (FRD-02) — Uses auth pages + helpers
2. **Camp Management** (FRD-03) — Uses layouts + typed queries
3. **Registration Flow** (FRD-06) — Uses all scaffolding pieces

See `docs/sprints/sprint2/checklist.md` for the full feature list.
