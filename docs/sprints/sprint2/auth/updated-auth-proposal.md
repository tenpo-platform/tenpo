# Unified Embeddable Auth System

**Sprint:** 2
**Created:** 2026-01-10
**Status:** Proposal

---

## Overview

A unified authentication system that can be embedded anywhere in the app. Two display modes:

- **Inline**: Part of the page itself (static login/signup pages)
- **Modal**: Overlays on top with blurred background, user must complete before continuing (checkout, invite acceptance)

All authentication methods support both email/password and Google OAuth.

**Implementation Decisions**
- **Invite tokens stored in plaintext** (current approach, simpler). Tokens remain high-entropy and single-use.
- **Keep `/login` and `/signup` as static pages** that embed the same Auth UI used by modals (cleaner UX, familiar URLs).
- **Single AuthWidget component** powers inline pages and modal flows (consistent behavior, fewer edge cases).

---

## User Stories

### Parent: Static Signup

**As a** parent discovering Tenpo,
**I want to** create an account on the signup page,
**So that** I can book camps for my children.

**Flow:**
1. I visit the signup page
2. I see a form asking for my name, email, phone, and password
3. I can alternatively click "Continue with Google" to use my Google account
4. If I use email/password, I receive a 6-digit code to verify my email
5. After verification, I'm taken to my dashboard

---

### Parent: Static Login

**As a** returning parent,
**I want to** log in on the login page,
**So that** I can access my account and bookings.

**Flow:**
1. I visit the login page
2. I enter my email and password, or click "Continue with Google"
3. After successful login, I'm taken to my dashboard

---

### Parent: Checkout

**As a** parent booking a camp,
**I want to** create an account or sign in during checkout without leaving the page,
**So that** I can complete my purchase smoothly.

**Flow:**
1. I'm on the checkout page, ready to pay
2. If I'm not logged in, a modal appears over the page (background is blurred)
3. The modal asks me to sign in or create an account
4. I can use email/password or Google OAuth
5. If creating an account with email, I verify with a 6-digit code
6. After authentication, the modal closes and I continue my checkout

---

### Academy Admin: Static Signup/Login

**As a** potential academy admin,
**I want to** create an account or log in on the static pages,
**So that** I can access the platform.

**Flow:**
Same as parent static signup/login. Academy admin role is assigned separately via invite.

---

### Academy Admin: Invite Acceptance

**As someone** who received an invite to create an academy,
**I want to** set up my account directly from the invite link,
**So that** I can start managing my academy quickly.

**Flow:**
1. I click the invite link in my email
2. I see a page that says "You've been invited!" with the inviter's name
3. My email is already shown (from the invite) - I don't need to verify it since I received the email
4. I choose how to secure my account:
   - **Option A:** Create a password (enter password, confirm password)
   - **Option B:** Continue with Google
5. After securing my account, I'm shown a form to name my academy
6. After creating my academy, I'm taken to the organizer dashboard


---

## Modal Behavior

When authentication is required during an action (like checkout):

- Background content is visible but blurred and non-interactive
- Auth modal appears centered on screen
- User cannot interact with the page until they complete authentication or cancel
- Clicking outside the modal or pressing Escape cancels and returns to the page
- After successful auth, modal closes and the original action continues

---

## Email Verification Rules

| Scenario | Email Verification |
|----------|-------------------|
| Parent signup (static page) | Required - 6-digit OTP |
| Parent signup (checkout) | Required - 6-digit OTP |
| Academy admin (invite link) | Not required - receiving the invite email IS verification |
| Google OAuth (any context) | Not required - Google verifies the email |

---

## UX & Routing Notes

- **Static pages remain**: `/login` and `/signup` are the default entry points for users who find auth via nav or deep links.
- **Same UI everywhere**: The inline pages and modals render the same AuthWidget (context-aware header/subtext and behavior).
- **Invite token entry**: `/invite/[token]` shows invite context first, then embeds AuthWidget with invite mode.

---

# Technical Architecture (Implementation Plan)

This section translates the product proposal into a clean, modular auth architecture. It is the source of truth for implementation.

## Goals
- Single, reusable auth UI for inline pages and modal contexts.
- Clear separation of concerns: UI, flow orchestration, server auth endpoints, database logic.
- Consistent verification strategy (OTP for email/password).
- Invite flow that is secure and minimal-friction.
- Role-based routing enforced by middleware with minimal business logic.

## High-Level Design

**Auth UI Layer**
- `AuthWidget` renders the form(s) and context copy.
- `AuthModal` wraps `AuthWidget` for checkout/invite flows (blurred background, blocking interactions).
- `useAuthFlow()` coordinates transitions between signup/login/verify-otp/reset steps and handles redirects or modal close.

**Auth Service Layer**
- `AuthService` wraps Supabase auth calls and normalizes errors.
- No routing or UI state in this layer.

**Server/API Layer**
- `POST /api/auth/invite/lookup` for invite context (token -> inviter name + email).
- `POST /api/auth/invite/accept` to call `accept_invite` RPC.
- `GET /auth/callback` for OAuth exchange and role-based redirects.

**Database Layer**
- `handle_new_user()` trigger to create profile, parse names, and set roles.
- `accept_invite()` RPC for academy setup + role assignment.
- `get_invite_context()` RPC for safe invite display data.

## Request Flow and Responsibilities

### Parent Signup (Inline or Modal)
1. `AuthWidget` in `signup` mode submits `signUp(email, password, metadata)`.
2. UI transitions to `verify-otp` step (6-digit code input).
3. User submits OTP -> `verifyOtp(email, token)` -> session established.
4. `useAuthFlow()` redirects to `/dashboard` or closes modal (checkout).

### Parent Login (Inline or Modal)
1. `AuthWidget` in `login` mode calls `signInWithPassword`.
2. On success: fetch roles -> route to `/dashboard` or close modal.
3. If error is "Email not confirmed", transition to `verify-otp` and resend code.

### Checkout Auth (Modal)
1. Checkout page opens `AuthModal` if user not authenticated.
2. After successful auth, modal closes and checkout continues.
3. If user cancels modal, return to checkout with no side effects.

### Invite Acceptance (Token-First)
1. `/invite/[token]` uses `POST /api/auth/invite/lookup` to show inviter name + email.
2. `AuthWidget` in `invite` mode with fixed email from invite.
3. User selects:
   - Email/password: `signUp()` then `signInWithPassword()`.
   - Google OAuth: `signInWithOAuth()` with `state` containing token.
4. After auth, call `POST /api/auth/invite/accept` which invokes `accept_invite`.
5. Redirect to `/organizer`.

### Password Reset
1. User requests reset -> `resetPasswordForEmail`.
2. Use OTP verification UI (same `verify-otp` step).
3. After verification, allow `updateUser({ password })`.

## Middleware Responsibilities

**Purpose:** Session refresh + access control only.

1. Refresh session cookies (Supabase server client).
2. If route is public -> allow.
3. If route requires auth -> redirect to `/login?redirectTo=...`.
4. If route requires verified email -> redirect to `/confirm-email`.
5. If route requires a role -> redirect to primary role destination.

**Route groups:**
- Public: `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/confirm-email`, `/auth/*`, `/invite/*`, `/checkout/*` (auth-gated in UI)
- Auth required, unverified OK: `/onboarding/*`
- Verified + role gated:
  - `/dashboard` -> PARENT
  - `/organizer` -> ACADEMY_ADMIN
  - `/admin` -> SUPER_ADMIN

## Database Schema and Relationships

### Tables (Auth-Relevant)
- `profiles` (1:1 with `auth.users`)
  - `id` = `auth.users.id` (PK)
  - `first_name`, `last_name`, `phone_number`, `avatar_url`
  - `parent_onboarding_completed`, `academy_admin_onboarding_completed`
- `user_roles`
  - `user_id`, `role`, `is_primary`
  - One user can have multiple roles; one is primary.
- `invites`
  - `token` (plaintext, high entropy), `email`, `type`, `academy_id`, `created_by`, `expires_at`, `accepted_at`

### Key Relationships
- `profiles.id` -> `auth.users.id`
- `invites.created_by` -> `profiles.id`
- `invites.academy_id` -> `academies.id`
- `academy_admins.user_id` -> `profiles.id`

## RPCs and Triggers

### `handle_new_user()` (Trigger)
**Responsibilities**
- Create `profiles` row.
- Parse names from OAuth metadata.
- If pending invite exists:
  - Auto-confirm email (`email_confirmed_at = now()`).
  - Assign `ACADEMY_ADMIN` as primary role so invited users can proceed to onboarding immediately.
- Else:
  - Assign PARENT role as primary.

### `accept_invite(token, academy_name, academy_description)`
**Responsibilities**
- Validate token, expiry, and email match.
- If owner invite: create academy and owner relationship.
- For admin/manager: link to existing academy.
- Demote existing roles; set `ACADEMY_ADMIN` as primary.
- Set `academy_admin_onboarding_completed = false`.
- Mark invite accepted.

### `get_invite_context(token)` (New)
**Returns**
- inviter name, invite email, and invite type (only if valid/active).
**Use**
- Power `/invite/[token]` header/subtext without exposing full invite row.

## Auth UI Components (Modular)

### `AuthWidget`
Modes:
- `login`, `signup`, `verify-otp`, `reset-password`, `invite`
Inputs:
- `context` (`static`, `checkout`, `invite`)
- `returnTo` (optional)
- `inviteToken` (optional, for invite flow)

### `AuthModal`
Props:
- `open`, `onClose`, `context`, `returnTo`, `inviteToken`
Behavior:
- Blurs background, traps focus, closes on escape or outside click.

### `useAuthFlow()`
Orchestrates:
- transitions between steps
- handling OTP resend
- redirects or modal close on success

## Error Handling and Messaging

**Signup**
- Duplicate email -> "An account with this email already exists."
- Rate limit -> "Too many attempts, try again later."

**Login**
- Invalid credentials -> "Invalid email or password."
- Unconfirmed email -> send to `verify-otp`.

**Invite**
- Invalid/expired token -> "Invite expired" with support CTA.
- Email mismatch -> "Invite was sent to a different email."

## Observability
- Log unexpected auth errors server-side (do not log expected user errors).
- Add minimal analytics events:
  - `auth_signup_started`, `auth_signup_verified`, `auth_login_success`
  - `invite_viewed`, `invite_accepted`

## Security Notes
- Invite tokens are plaintext but 32-byte random; treat links as secrets.
- Enforce `accepted_at IS NULL` and `expires_at > now()` in all invite checks.
- Role checks occur in middleware and in DB policies.

## Salvage vs Rebuild

**Salvage**
- `invites` table, `accept_invite`, `handle_new_user` (with modifications above).
- Supabase client utilities (`src/utils/supabase/*`).
- Role onboarding flags in `profiles`.

**Rebuild**
- Mixed confirmation strategy (magic link vs OTP).
- Login-first invite flow.
- "Remember me" session expiry logic.
- Disjoint auth pages/components (replace with `AuthWidget` + `AuthModal`).

## Minimal File List (Target)

**New or Refactor**
- `src/components/auth/auth-widget.tsx`
- `src/components/auth/auth-modal.tsx`
- `src/components/auth/use-auth-flow.ts`
- `src/services/auth-service.ts`
- `src/app/(auth)/login/page.tsx` (embeds widget)
- `src/app/(auth)/signup/page.tsx` (embeds widget)
- `src/app/invite/[token]/page.tsx` (server lookup + widget)
- `src/app/auth/callback/route.ts` (OAuth exchange + routing)
- `src/app/api/auth/invite/lookup/route.ts`
- `src/app/api/auth/invite/accept/route.ts`

**DB**
- New RPC: `get_invite_context(token)`
- Update `handle_new_user()` and `accept_invite()` as defined above

---

## Context-Aware Messaging

The auth UI adapts its messaging based on context:

| Context | Header | Subtext |
|---------|--------|---------|
| Static signup | "Create your account" | "Join Tenpo to book camps for your family" |
| Static login | "Welcome back" | "Sign in to your account" |
| Checkout | "Sign in to continue" | "Create an account or sign in to complete your booking for {camp name}" |
| Invite | "You've been invited!" | "{Inviter name} has invited you to create an academy on Tenpo" |

---

*Proposal created: 2026-01-10*
