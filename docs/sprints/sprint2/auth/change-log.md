# Authentication Implementation Change Log

**Scope:** Verified against `docs/sprints/sprint2/auth/handoff-v2.md` and the current codebase.

---

## Confirmed Deviations From Handoff V2

### 1. Email Confirmation Is Enabled + OTP-Based
**Handoff:** Disable confirmations in Supabase and gate in the app layer.
**Current:** `enable_confirmations = true` and signup/login uses 6‑digit OTP verification.
**Impact:** Users must verify via OTP before they can sign in with email/password (including during checkout).
**Files:** `supabase/config.toml`, `supabase/templates/confirmation.html`, `src/components/auth/auth-widget.tsx`, `src/app/(auth)/confirm-email/page.tsx`

### 2. Invite Flow Is Token-First (Public Context) Instead of Login-First
**Handoff:** Login-first, no public token validation.
**Current:** Invite context is fetched first via `get_invite_context`, and `/invite/[token]` renders the invite before auth. Existing-account invites default to sign-in; signed-in matching emails auto-redirect to onboarding.
**Files:** `supabase/migrations/20260108000000_auth_enhancements.sql`, `src/app/invite/[token]/page.tsx`

### 3. Invited Signups Receive ACADEMY_ADMIN Immediately
**Handoff:** Pending invite → no role until `accept_invite()`.
**Current:** `handle_new_user()` auto-confirms invited emails and grants `ACADEMY_ADMIN` as primary on signup. `accept_invite()` still demotes other roles and ensures `ACADEMY_ADMIN` is primary.
**Files:** `supabase/migrations/20260108000000_auth_enhancements.sql`

### 4. Sessions Are 30 Days; “Remember Me” Removed
**Handoff:** 7‑day server session + localStorage “remember me” UX.
**Current:** `jwt_expiry = 2592000` (30 days). No client-side session expiry utilities or remember‑me checkbox.
**Files:** `supabase/config.toml`, `src/components/auth/auth-widget.tsx`

### 5. Unified Auth UI (Single Widget + Modal)
**Handoff:** Separate Login/Signup/Forgot/Reset components.
**Current:** A single `AuthWidget` handles login, signup, OTP verification, reset, and invite modes; `AuthModal` wraps it for modal use.
**Files:** `src/components/auth/auth-widget.tsx`, `src/components/auth/auth-modal.tsx`, `src/components/auth/use-auth-flow.ts`

### 6. Checkout Auth Is UI-Gated, Not Middleware-Gated
**Handoff:** `/checkout/*` requires auth (unverified OK) and redirects via `redirectTo`.
**Current:** `/checkout` is public and uses a modal gate before proceeding; the mock checkout flow is client-driven.
**Files:** `src/app/checkout/page.tsx`, `src/middleware.ts`

### 7. SUPER_ADMIN `/admin` Route Added
**Handoff:** Only `/dashboard` and `/organizer` protected routes.
**Current:** `/admin` exists, gated to `SUPER_ADMIN` in middleware, with a seeded local SUPER_ADMIN user.
**Files:** `src/app/admin/page.tsx`, `src/middleware.ts`, `supabase/seed.sql`

### 8. Back-Button Protection After Logout
**Handoff:** Not specified.
**Current:** Protected pages use `SessionGuard` + forced dynamic rendering to re-check session on `pageshow` and prevent bfcache access post-logout.
**Files:** `src/components/auth/session-guard.tsx`, `src/app/dashboard/page.tsx`, `src/app/organizer/page.tsx`, `src/app/admin/page.tsx`

### 9. Invite Acceptance Uses Server API Route
**Handoff:** Client calls `accept_invite()` directly.
**Current:** `/api/auth/invite/accept` handles the RPC server-side; onboarding calls the API route.
**Files:** `src/app/api/auth/invite/accept/route.ts`, `src/app/onboarding/academy/page.tsx`

### 10. Invites RLS Uses JWT Email Instead of `auth.users`
**Handoff:** `SELECT email FROM auth.users WHERE id = auth.uid()`.
**Current:** Policy uses `auth.jwt() ->> 'email'` to avoid permissions on `auth.users`.
**Files:** `supabase/migrations/20260108000000_auth_enhancements.sql`

### 11. Local Dev Auth Config Adjustments
**Handoff:** Not specified.
**Current:** TLS disabled locally, `site_url` set to `http://localhost:3000`, and `/auth/callback` added to redirect allow-list.
**Files:** `supabase/config.toml`

---

## Status Quo (Quick Reference)

- **Auth pages:** `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/confirm-email` (all use `AuthWidget`).
- **Invite flow:** `/invite/[token]` → onboarding → `/organizer`.
- **Protected routes:** `/dashboard`, `/organizer`, `/admin` (role gated + email confirmation required).
- **Public routes:** `/`, `/camps`, `/invite/*`, `/auth/*`, `/checkout` (UI-gated).
- **Password reset:** OTP-based flow with redirect back to `/login` after update.
