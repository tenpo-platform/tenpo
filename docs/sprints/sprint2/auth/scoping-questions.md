# Auth Implementation Scoping Questions

**Status:** All questions answered
**Last Updated:** 2026-01-08

---

## Current State Analysis

### What's Already Built

| Component | Status | Location |
|-----------|--------|----------|
| Supabase browser client | Ready | `src/utils/supabase/client.ts` |
| Supabase server client | Ready | `src/utils/supabase/server.ts` |
| Session refresh middleware | Ready | `src/utils/supabase/middleware.ts` |
| Password complexity (12+ chars, symbols) | Configured | `supabase/config.toml` |
| Email confirmation required | Configured | `supabase/config.toml` |
| Turnstile captcha | Configured (needs env) | `supabase/config.toml` |
| Local email testing (Inbucket) | Ready | `localhost:54324` |
| UI component library (30 components) | Ready | `src/components/ui/*` |
| Form validation (react-hook-form + zod) | Ready | Dependencies installed |
| `handle_new_user` trigger | Ready | Creates profile on signup |
| `user_roles` table | Ready | Stores role assignments |
| `profiles` table | Ready | User profile data |
| `academies` table | Ready | Academy records |
| `academy_admins` table | Ready | User-academy links |

### What Needs to Be Built

| Component | Required | Notes |
|-----------|----------|-------|
| `/login` page | Yes | Email/password + Google OAuth |
| `/signup` page | Yes | Parent signup (B2C) |
| `/forgot-password` page | Yes | Request password reset |
| `/reset-password` page | Yes | Set new password |
| `/auth/callback` route | Yes | OAuth + email confirmation handler |
| `/invite/[token]` page | Yes | Academy admin invite acceptance |
| `/onboarding/academy` page | Yes | Academy admin setup (protected) |
| Protected route middleware | Yes | Role-based access control |
| `/dashboard` page shell | Yes | Parent dashboard placeholder |
| `/organizer` page shell | Yes | Academy admin dashboard placeholder |
| Custom email templates | Yes | Branded auth emails |
| `invites` table | Yes | Invite token storage |
| RPC functions | Yes | Role assignment, invite acceptance |

---

## Architecture Decision

**Decision:** Use **RPC Functions (SECURITY DEFINER)** for DB-only privileged operations, **Next.js API Routes** for external integrations.

See: [Backend Architecture Decision](../../decisions/backend-architecture-rpc-vs-edge-functions.md)

**Mental Model:**

| Operation Type | Use | Example |
|---------------|-----|---------|
| Authentication | Supabase Auth | Login, signup, password reset, Google OAuth |
| DB-only, needs atomicity | RPC Function | Accept invite, assign role |
| Calls external API | API Route | Send email via Resend (future) |
| Receives external webhook | API Route | Stripe webhooks (future) |
| File generation | API Route | Excel export (future) |

---

## Answered Questions

### 1. Parent Signup Path ✅ ANSWERED

**Question:** How do parents create accounts?

**Answer:** Two flows, both needed:
1. **Standalone signup** from landing page/nav - Standard signup form
2. **Checkout signup** - Prompted during registration, redirected back to checkout after

Both flows use the same signup form component. The redirect destination is contextual.

---

### 2. Email Confirmation UX ✅ ANSWERED

**Question:** What happens after signup?

**Answer:** Redirect is contextual based on where they signed up:
- Standalone signup → "Check your email" page → After confirm → Dashboard
- Checkout signup → Continue checkout immediately → Confirm email before accessing dashboard later

**Key decision:** Users can complete checkout without email confirmation. Confirmation required before accessing dashboard or future purchases.

---

### 3. Onboarding Flow ✅ ANSWERED

**Question:** Is there an onboarding flow after first login?

**Answer:** Defer for parents. Set `onboarding_completed = true` after first successful login.

Academy admins DO have an onboarding flow (see invite system below).

---

### 4. Multi-Role User Routing ✅ ANSWERED

**Question:** Which dashboard for multi-role users?

**Answer:** Admin roles take precedence. Defer dashboard switcher to future sprint.
- ACADEMY_ADMIN or SUPER_ADMIN → `/organizer`
- PARENT only → `/dashboard`

---

### 5. Academy Admin Flow ✅ DECIDED (CHANGED FROM FRD)

**Original FRD:** Public `/signup/academy` form for self-service academy creation.

**Corrected Flow:** Invite-only system.

```
SUPER_ADMIN creates invite
        ↓
Email with invite link sent
        ↓
Invitee clicks /invite/[token]
        ↓
If not logged in → signup/login → return to invite
        ↓
/onboarding/academy (protected)
        ↓
Complete academy setup → ACADEMY_ADMIN role assigned
        ↓
Redirect to /organizer
```

**Sprint 2 Scope (Option B - Minimal):**
- Invite table + RPC functions
- `/invite/[token]` route
- `/onboarding/academy` flow
- SUPER_ADMIN creates invites via Supabase Studio (no UI yet)
- Defer: SUPER_ADMIN dashboard UI, email sending integration

---

### 6. Email Provider ✅ ANSWERED

**Question:** Supabase vs Resend for emails?

**Answer:**
- **Supabase** for auth emails (confirmation, password reset)
- **Resend** for custom transactional emails (future)
- **Custom branding** for auth emails from day 1

---

### 7. Captcha Integration ✅ ANSWERED

**Question:** Enable captcha for MVP?

**Answer:** Enable on signup forms only. Use existing `NEXT_PUBLIC_ENABLE_CAPTCHA` flag for local dev bypass.

---

### 8. Password Reset Token Handling ✅ ANSWERED

**Question:** How to handle password reset flow?

**Answer:** Follow Supabase standard SSR flow:
1. User requests reset → email with link
2. User clicks link → `/reset-password` with code
3. Page exchanges code for session
4. User enters new password → `updateUser({ password })`

---

### 9. Session Persistence ✅ ANSWERED

**Question:** How long should sessions last?

**Answer:**
- **Default:** 7 days
- **With "Remember me" checked:** 30 days

Update `supabase/config.toml`:
```toml
jwt_expiry = 604800  # 7 days in seconds
```

---

### 10. Protected Route Implementation ✅ ANSWERED

**Question:** How to check roles in middleware?

**Answer:** Option A for MVP - Query `user_roles` in middleware on each request.

**Future improvement:** Store roles in JWT claims via Supabase hook for better performance.

---

### 11. handle_new_user Trigger Enhancement ✅ ANSWERED

**Question:** Should trigger populate profile from metadata?

**Answer:** Yes (Option B). Enhance trigger to:
- Extract `first_name`, `last_name`, `phone_number` from `raw_user_meta_data`
- Auto-assign PARENT role for B2C signups

**Migration needed.**

---

### 12. Parent Signup Form Fields ✅ ANSWERED

**Question:** What fields for parent signup?

**Answer:** Standard fields (Option B):
- Email (required)
- Password (required)
- Full Name (required) - split into first_name, last_name
- Phone (required)

Same form reused for standalone and checkout signup.

---

### 13. Slug Generation for Academies ✅ ANSWERED

**Question:** How to handle academy slugs?

**Answer:**
- Auto-generate from academy name during onboarding
- Show "already taken" error if collision (no silent suffix)
- Customization available later in academy settings (not MVP)

---

### 14. Login "Remember Me" Feature ✅ ANSWERED

**Question:** Implement "Remember me"?

**Answer:** Yes.
- Unchecked: 7-day session (default)
- Checked: 30-day session

---

### 15. Error Message Security ✅ ANSWERED

**Question:** What error messages to show?

**Answer:**
- **Login:** Generic "Invalid email or password"
- **Signup:** Can reveal if email exists
- **Forgot password:** "If your email is tied to an account, you should receive an email"

---

### 16. Form Validation UX ✅ ANSWERED

**Question:** How to present password validation?

**Answer:** Option D - Hybrid approach:
- Real-time checklist for password requirements
- Submit validation for other fields

---

### 17. OAuth/Social Login ✅ ANSWERED

**Question:** Include social login in MVP?

**Answer:** Google OAuth from day 1. Other providers deferred.

See: [Google OAuth Setup Instructions](./google-oauth-setup.md)

---

### 18. Rate Limiting Visibility ✅ ANSWERED

**Question:** How to display rate limit errors?

**Answer:** Generic message: "Too many attempts, please try again later. If this persists, contact support at [support email]."

---

### 19. Parent Role Assignment ✅ ANSWERED (NEW)

**Question:** How are roles assigned?

**Answer:**
- **Parents (B2C):** PARENT role auto-assigned via enhanced trigger
- **Academy admins:** ACADEMY_ADMIN role assigned when accepting invite (NOT auto-assigned PARENT)

---

### 20. Academy Signup Failure Recovery ✅ ANSWERED (NEW)

**Question:** What if onboarding RPC fails?

**Answer:** Show error with retry option and support contact: "Something went wrong setting up your academy. Please try again. If this persists, contact support at [support email]."

---

### 21. Supabase Email Branding ✅ ANSWERED (NEW)

**Question:** Custom branding for auth emails?

**Answer:** Yes, from day 1. Create custom HTML templates for:
- Email confirmation
- Password reset
- Invite email (if using Supabase invite)

---

## Implementation Order (Sprint 2)

### Phase 1: Database Migrations
1. Enhance `handle_new_user` trigger (populate profile + assign PARENT role)
2. Create `invites` table
3. Create RPC `accept_invite` (assigns role, links to academy)
4. Update session config (7-day default)

### Phase 2: Auth Routes & Callbacks
5. `/auth/callback` - OAuth + email confirmation handler
6. `/login` page with Google OAuth button
7. `/signup` page (parent signup)
8. `/forgot-password` page
9. `/reset-password` page

### Phase 3: Invite & Onboarding
10. `/invite/[token]` - Validate invite, prompt auth
11. `/onboarding/academy` - Academy setup flow (protected)

### Phase 4: Protected Routes & Shells
12. Protected route middleware (role-based)
13. `/dashboard` shell (parent)
14. `/organizer` shell (academy admin)

### Phase 5: Polish
15. Custom email templates (branded)
16. Password strength indicator component
17. Error handling & loading states

---

## Decisions Summary

| # | Question | Decision |
|---|----------|----------|
| 1 | Parent signup path | Both standalone + checkout flows |
| 2 | Email confirmation UX | Contextual redirect, checkout can defer confirmation |
| 3 | Onboarding flow | Defer for parents, set flag on first login |
| 4 | Multi-role routing | Admin precedence, defer switcher |
| 5 | Academy admin flow | **Invite-only** (changed from FRD) |
| 6 | Email provider | Supabase for auth, Resend for custom |
| 7 | Captcha | Signup forms only |
| 8 | Password reset | Supabase standard flow |
| 9 | Session duration | 7 days default, 30 with "Remember me" |
| 10 | Role checking | Middleware query for MVP |
| 11 | Trigger enhancement | Populate profile + auto-assign PARENT |
| 12 | Parent form fields | Email, password, name, phone |
| 13 | Slug generation | Auto-generate, "taken" error, customize later |
| 14 | Remember me | Yes (7 days / 30 days) |
| 15 | Error messages | Generic for security |
| 16 | Password validation | Hybrid with real-time checklist |
| 17 | OAuth | Google from day 1 |
| 18 | Rate limits | Generic message + support contact |
| 19 | Role assignment | PARENT auto, ACADEMY_ADMIN via invite |
| 20 | Failure recovery | Retry + support contact |
| 21 | Email branding | Yes, from day 1 |

---

## Related Documents

- [Backend Architecture Decision](../../decisions/backend-architecture-rpc-vs-edge-functions.md)
- [Google OAuth Setup Instructions](./google-oauth-setup.md)
- [Database Schema Summary](../database-schema/summary.md)
- [FRD: Authentication](../frd/frd-02-authentication.md) - Needs update for invite flow
- [PRD: Authentication](../prd/prd-01-authentication.md) - Needs update for invite flow
