# PRD 1: Authentication System

**Last Updated:** 2026-01-08
**Status:** Revised after scoping

---

## Overview

Users can create accounts and log in to access role-specific features. Parents (B2C) create accounts via self-service signup or during checkout. Academy admins (B2B) are invited by SUPER_ADMIN and complete an onboarding flow.

## Database Context

- `profiles` table auto-created on signup (via `handle_new_user` trigger)
- Roles stored in `user_roles` table (not on profiles)
- Role ENUM values: `PARENT`, `ATHLETE`, `COACH`, `ACADEMY_ADMIN`, `SUPER_ADMIN`, `STAFF`
- Academy ownership via `academy_admins` table (role: 'owner', 'admin', 'manager')
- `invites` table for academy admin invitations

## User Stories

**As a parent**, I want to create an account so I can register my child for camps and track my bookings.

**As a parent**, I want to sign in with Google so I can get started quickly without creating a password.

**As an invited academy admin**, I want to accept my invite and set up my academy so I can start listing camps.

**As a returning user**, I want to stay logged in for a week so I don't have to sign in every time.

**As a user who forgot my password**, I want to reset it via email so I can regain access to my account.

---

## Flows

### Parent Account Creation (Standalone)

```
1. User clicks "Sign Up" in navigation
2. Signup form: first name, last name, email, phone, password
   - OR "Continue with Google" button
3. System creates:
   - auth.user (via supabase.auth.signUp or OAuth)
   - profiles row (auto via handle_new_user trigger with metadata)
   - user_roles row (role: PARENT, auto via trigger)
4. "Check your email" confirmation page shown
5. User clicks email link → /auth/callback
6. Redirected to /dashboard
```

### Parent Account Creation (During Checkout)

```
1. Parent browsing camps, clicks "Register" on camp detail page
2. Enters athlete details
3. If not logged in → Prompted to create account
4. Redirect to /signup?redirectTo=/checkout/[eventId]
5. Same signup form as standalone
6. After signup: Continue to checkout immediately
   - Email confirmation NOT required to complete purchase
   - Confirmation required before accessing /dashboard later
7. Complete checkout → Confirmation page
```

### Academy Admin Invite & Onboarding (NEW)

```
1. SUPER_ADMIN creates invite in Supabase Studio:
   - INSERT INTO invites (email, type, created_by)
   - type = 'academy_owner'
2. Invite link sent to invitee (manually for MVP)
   - https://tenpo.com/invite/[token]
3. Invitee clicks link → /invite/[token]
4. If not logged in:
   - Redirect to /login (or /signup) with redirectTo=/invite/[token]
   - Create account or sign in
5. If logged in:
   - Redirect to /onboarding/academy?token=[token]
6. Onboarding form: academy name, description
   - Slug auto-generated from name
   - "Already taken" error if slug collision
7. System creates (via RPC):
   - academies row (name, slug)
   - academy_admins row (user_id, academy_id, role='owner')
   - user_roles row (role: ACADEMY_ADMIN)
   - Marks invite as used
8. Redirected to /organizer
```

### Login

```
1. User visits /login
2. Form: email, password, "Remember me" checkbox
   - OR "Continue with Google" button
3. On success:
   - Query user_roles table for user's roles
   - If roles include ACADEMY_ADMIN or SUPER_ADMIN → /organizer
   - If role is PARENT only → /dashboard
4. On failure:
   - Show "Invalid email or password" (generic for security)
```

### Password Reset

```
1. User clicks "Forgot password" on /login
2. Enters email → System sends reset link via Supabase
3. Always show: "If your email is tied to an account, you should receive an email"
4. User clicks link → /auth/callback?type=recovery
5. Redirected to /reset-password (user now has session)
6. User enters new password (12+ chars, complexity enforced)
7. On success → Redirected to /login with success message
```

### Google OAuth

```
1. User clicks "Continue with Google" on login or signup page
2. Redirected to Google consent screen
3. After consent → /auth/callback with code
4. System exchanges code for session
5. If new user:
   - Trigger creates profile from Google data
   - Trigger assigns PARENT role
6. Redirect based on roles (same as regular login)
```

---

## Behavior Rules

### Authentication
- Email must be unique across all users
- Password: min 12 chars, must include upper, lower, digit, symbol
- Google OAuth supported from day 1
- Captcha (Turnstile) enabled on signup forms

### Sessions
- Default session: 7 days
- With "Remember me" checked: 30 days
- Refresh token rotation enabled

### Email Confirmation
- Required before accessing /dashboard
- NOT required to complete checkout (allows purchase first)
- Branded email templates with Tenpo logo

### Role Assignment
- Parents (B2C): PARENT role auto-assigned via trigger
- Academy admins (B2B): ACADEMY_ADMIN role assigned via invite acceptance RPC
- Academy admins do NOT automatically get PARENT role

### Protected Routes
- /dashboard requires authentication
- /organizer requires ACADEMY_ADMIN or SUPER_ADMIN role
- /onboarding/academy requires authentication + valid invite token
- Unauthenticated users redirected to /login with redirectTo param

### Error Messages
- Login: Generic "Invalid email or password"
- Signup: Can reveal if email already exists
- Forgot password: Always show success message
- Rate limits: Generic message with support contact

---

## Success Criteria

- [ ] Parent can create account via standalone signup form
- [ ] Parent can create account during checkout and complete purchase
- [ ] Parent can sign up/login with Google OAuth
- [ ] Academy admin can accept invite and complete onboarding
- [ ] User can log in and is routed to correct dashboard based on roles
- [ ] User can reset password via email
- [ ] "Remember me" extends session to 30 days
- [ ] Protected routes reject unauthenticated users
- [ ] Role-based routing works correctly
- [ ] Password complexity is enforced
- [ ] Email confirmation works (with branded templates)
- [ ] Profile auto-created on signup with metadata
- [ ] PARENT role auto-assigned for B2C signups

---

## Out of Scope (Sprint 2)

- SUPER_ADMIN dashboard UI for creating invites (use Supabase Studio)
- Academy admin inviting other team members (future sprint)
- Social login providers other than Google
- MFA / 2FA
- Account deletion / GDPR flows

---

## Related Documents

- [FRD: Authentication](../frd/frd-02-authentication.md)
- [Implementation Handoff](../auth/handoff.md)
- [Scoping Questions](../auth/scoping-questions.md)
- [Backend Architecture Decision](../../decisions/backend-architecture-rpc-vs-edge-functions.md)
