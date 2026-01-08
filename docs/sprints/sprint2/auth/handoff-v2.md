# Authentication System - Implementation Handoff V2

**Sprint:** 2
**Status:** Ready for Implementation (Post-Review)
**Last Updated:** 2026-01-08
**Review:** Codex review completed, all critical issues resolved

---

## Review Status

This document incorporates all resolutions from the Codex review. See [codex-review.md](./codex-review.md) for the full review dialogue.

### Resolved Issues

| Issue | Resolution |
|-------|------------|
| Checkout-without-confirmation | Disable Supabase confirmations, gate at app layer |
| Remember me TTL | Client-side session expiry (UX workaround) |
| Invite validation security | Login-first approach, no public RPC |
| Account linking | Document Supabase auto-linking behavior |
| Trigger PARENT assignment | Conditional based on pending invite |
| Expired invite edge case | Show "contact support" screen (no PARENT fallback) |

### Sign-off Status

| Decision | Status | Notes |
|----------|--------|-------|
| Email Confirmation Strategy | ✅ **APPROVED** | Risk accepted: some fake emails in exchange for smoother checkout |
| Expired Invite Handling | ✅ **APPROVED** | Show "contact support" screen (do NOT assign PARENT fallback) |

---

## Overview

This document provides everything needed to implement the Tenpo authentication system. Read this document fully before starting implementation.

### What We're Building

1. **Parent Authentication (B2C)** - Self-service signup, login, password reset
2. **Academy Admin Authentication (B2B)** - Invite-only with onboarding flow
3. **Google OAuth** - Social login option
4. **Protected Routes** - Role-based access control with email confirmation gates
5. **Branded Email Templates** - Custom auth emails

### Key Architecture Decision

Use **RPC Functions** for privileged database operations, **API Routes** for external integrations.

See: [Backend Architecture Decision](../../decisions/backend-architecture-rpc-vs-edge-functions.md)

---

## What Already Exists

This section documents existing infrastructure you should reuse. Do NOT recreate these.

### Supabase Client Utilities

Three client utilities exist in `src/utils/supabase/`:

| File | Purpose | Use In |
|------|---------|--------|
| `client.ts` | Browser-side Supabase client | Client components (`"use client"`) |
| `server.ts` | Server-side client with cookie handling | Server components, route handlers, server actions |
| `middleware.ts` | Session refresh for middleware | `src/middleware.ts` |

**Usage Examples:**

```typescript
// Client component
"use client";
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();

// Server component or route handler
import { createClient } from "@/utils/supabase/server";
const supabase = await createClient();

// Middleware
import { updateSession } from "@/utils/supabase/middleware";
const response = await updateSession(request);
```

### Middleware

`src/middleware.ts` already exists and calls `updateSession()`. Currently gates showcase routes behind `NEXT_PUBLIC_SHOWCASE_MODE`. Extend this file for auth route protection—do not create a new middleware file.

### UI Components

Full Radix UI component library available in `src/components/ui/`:

**Form Components (use these):**
- `form.tsx` - React Hook Form integration with `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- `input.tsx` - Styled text input
- `label.tsx` - Accessible label
- `checkbox.tsx` - For "Remember me"
- `button.tsx` - Variants: default, destructive, secondary, tertiary, ghost, link

**Layout Components:**
- `card.tsx` - Card container with header/footer
- `dialog.tsx` - Modal dialog
- `alert-dialog.tsx` - Confirmation dialogs

**Available but less common:**
accordion, avatar, badge, breadcrumb, calendar, dropdown-menu, popover, progress, separator, sheet, skeleton, tabs, tooltip

### Form Infrastructure

These packages are already installed and configured:

| Package | Purpose |
|---------|---------|
| `react-hook-form@^7.70.0` | Form state management |
| `zod@^4.3.5` | Schema validation |
| `@hookform/resolvers@^5.2.2` | Connect Zod to react-hook-form |
| `sonner@^2.0.7` | Toast notifications (already in layout) |

### Environment Variables

`.env.local` already configured with:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configured]
NEXT_PUBLIC_ENABLE_CAPTCHA=false
```

Add these for auth:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Feature Flags

`src/config/features.ts` exports `captcha` and `analytics` flags. Use `captcha` to conditionally render Turnstile widget.

### Database Types

`src/types/database.types.ts` - Auto-generated TypeScript types from Supabase schema. Regenerate after migrations with:

```bash
supabase gen types typescript --linked > src/types/database.types.ts
```

### Utility Functions

`src/lib/utils.ts` exports `cn()` for combining Tailwind classes:

```typescript
import { cn } from "@/lib/utils";
<div className={cn("base-class", conditional && "conditional-class")} />
```

### Icons

100+ icons available in `src/icons/components/`. Import like:

```typescript
import { IconName } from "@/icons/components";
```

### Root Layout

`src/app/layout.tsx` already includes:
- Custom fonts (Host Grotesk, Seriously Nostalgic)
- Toast provider (Sonner)
- Theme provider setup

### Existing Documentation

- `docs/supabase/supabase-guide.md` - Supabase setup and usage
- `docs/supabase/supabase-config.md` - Security configuration (password policy, rate limits)
- `docs/sprints/sprint2/auth/google-oauth-setup.md` - Google OAuth step-by-step

---

## Critical Configuration: Email Confirmation Strategy

> **IMPORTANT:** This section documents a key security/UX trade-off.

### Decision

**Disable email confirmation at Supabase level, enforce at application layer.**

### Why

Supabase's default requires email confirmation before issuing a session. This breaks the checkout flow where users need to complete a purchase immediately after signup.

### Configuration

In `supabase/config.toml`:

```toml
[auth.email]
# CHANGED: Disable confirmation at Supabase level
# We enforce confirmation gates at the application layer instead
enable_confirmations = false
```

### Security Trade-offs

| Risk | Mitigation |
|------|------------|
| Unverified emails in database | Gate `/dashboard` and future purchases on `email_confirmed_at` |
| Spam/bot signups | Turnstile captcha on signup form + Supabase rate limiting |
| Account enumeration via signup | Acceptable per scoping decision #15 |
| Abandoned unverified accounts | Future: cleanup job for unverified accounts > 30 days old |

### Application-Layer Gates

**Routes requiring `email_confirmed_at IS NOT NULL`:**
- `/dashboard` (parent dashboard)
- `/organizer` (academy admin dashboard)
- Future purchases (after initial checkout)
- Profile editing
- Sensitive account actions

**Routes NOT requiring confirmation (allow unverified):**
- `/checkout/*` (initial purchase flow)
- `/onboarding/academy` (admin onboarding - confirmed via invite email)

### Fraud Escalation Path (Future)

If fraud becomes an issue post-launch:
1. Email verification before high-value purchases
2. Phone verification for suspicious accounts
3. Manual review queue

---

## User Flows

### Flow 1: Parent Signup (Standalone)

```
User clicks "Sign Up" in nav
        ↓
/signup page with form:
  - First Name, Last Name
  - Email, Phone
  - Password (with strength indicator)
  - Google OAuth button
  - Turnstile captcha
        ↓
On submit: supabase.auth.signUp() with metadata
        ↓
Trigger creates profile + assigns PARENT role
(Conditional: only if no pending invite for email)
        ↓
"Check your email" confirmation page
(User has session but email_confirmed_at is NULL)
        ↓
User clicks email link → /auth/callback
        ↓
email_confirmed_at is set
        ↓
Redirect to /dashboard
```

### Flow 2: Parent Signup (During Checkout)

```
User browsing camps, clicks "Register"
        ↓
Enters athlete details
        ↓
Prompted to create account (if not logged in)
        ↓
/signup?redirectTo=/checkout/[eventId]
        ↓
Same signup form
        ↓
After signup: User has session immediately
(email_confirmed_at is NULL - that's OK for checkout)
        ↓
Continue to checkout, complete purchase
        ↓
Email confirmation required before:
  - Accessing /dashboard
  - Making future purchases
```

### Flow 3: Login

```
User clicks "Log In" in nav
        ↓
/login page with form:
  - Email
  - Password
  - "Remember me" checkbox
  - "Forgot password?" link
  - Google OAuth button
        ↓
On submit: supabase.auth.signInWithPassword()
        ↓
Store session expiry in localStorage:
  - Without "Remember me": now + 7 days
  - With "Remember me": now + 30 days
        ↓
Query user_roles to determine redirect:
  - ACADEMY_ADMIN or SUPER_ADMIN → /organizer
  - PARENT → /dashboard
        ↓
Middleware checks email_confirmed_at for protected routes
```

### Flow 4: Password Reset

```
User clicks "Forgot password?" on /login
        ↓
/forgot-password page with email input
        ↓
On submit: supabase.auth.resetPasswordForEmail()
        ↓
Always show: "If your email is tied to an account,
             you should receive an email"
        ↓
User clicks email link → /auth/callback?type=recovery
        ↓
Redirect to /reset-password (user now has session)
        ↓
User enters new password
        ↓
On submit: supabase.auth.updateUser({ password })
        ↓
Redirect to /login with success message
```

### Flow 5: Academy Admin Invite (Login-First)

> **CHANGED:** Now uses login-first approach. No public RPC for token validation.

```
SUPER_ADMIN creates invite in Supabase Studio:
  INSERT INTO invites (email, type, created_by, ...)
        ↓
Invite link sent (manually for MVP):
  https://tenpo.com/invite/[token]
        ↓
Invitee clicks link → /invite/[token]
        ↓
If not logged in:
  - Show message: "Please sign in to accept your invite"
  - Redirect to /login?redirectTo=/invite/[token]
  - DO NOT validate token yet (prevents enumeration)
        ↓
After login → redirect back to /invite/[token]
        ↓
Now authenticated, page queries invites table via RLS:
  - RLS allows users to see invites sent to their email
  - Query: SELECT * FROM invites WHERE token = [token]
        ↓
If valid invite found:
  - Redirect to /onboarding/academy?token=[token]
        ↓
If no valid invite (expired, used, wrong email):
  - Show "Invite Expired" screen with:
    - Message: "This invite has expired or is no longer valid"
    - Instructions: "Please contact support@tenpo.com to request a new invite"
  - Do NOT assign any role (user must get new invite)
        ↓
/onboarding/academy (protected route):
  - Form: Academy name, description
  - Slug auto-generated (show "taken" error if collision)
        ↓
On submit: RPC accept_invite()
  - Creates academy record
  - Links user as owner via academy_admins
  - Assigns ACADEMY_ADMIN role
  - Marks invite as used
        ↓
Redirect to /organizer
```

### Flow 6: Google OAuth

```
User clicks "Continue with Google" button
        ↓
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: '/auth/callback' }
})
        ↓
User authenticates with Google
        ↓
Redirect to /auth/callback with code
        ↓
Exchange code for session
        ↓
If new user:
  - Trigger creates profile (from Google metadata)
  - Trigger assigns PARENT role (if no pending invite)
  - email_confirmed_at is set (Google verifies email)
        ↓
If existing user with same email:
  - Supabase auto-links identities (if email verified)
        ↓
Query user_roles → redirect to appropriate dashboard
```

---

## "Remember Me" Implementation

> **LIMITATION:** This is a UX convenience feature, not a security boundary. Server sessions always live for 7 days regardless of this setting.

### How It Works

Supabase's `jwt_expiry` is global (set to 7 days). We cannot vary it per-user. Instead, we implement "Remember me" as a client-side session expiry.

### Implementation

```typescript
// src/lib/auth/session-expiry.ts

const SESSION_EXPIRY_KEY = 'session_expires_at';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function setSessionExpiry(rememberMe: boolean) {
  const expiresAt = rememberMe
    ? Date.now() + THIRTY_DAYS_MS
    : Date.now() + SEVEN_DAYS_MS;
  localStorage.setItem(SESSION_EXPIRY_KEY, expiresAt.toString());
}

export async function checkSessionExpiry(supabase: SupabaseClient) {
  const expiresAt = localStorage.getItem(SESSION_EXPIRY_KEY);
  if (expiresAt && Date.now() > parseInt(expiresAt)) {
    await supabase.auth.signOut();
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    return true; // Session expired
  }
  return false;
}

export function clearSessionExpiry() {
  localStorage.removeItem(SESSION_EXPIRY_KEY);
}
```

### Multi-Tab Logout Sync

```typescript
// In your auth provider or layout component

useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'session_expires_at' && e.newValue === null) {
      // Another tab logged out
      window.location.href = '/login';
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

### Usage in Login Form

```typescript
// In login form submit handler
const handleSubmit = async (data: LoginFormData) => {
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (!error) {
    setSessionExpiry(data.rememberMe); // Store expiry based on checkbox
    // ... redirect logic
  }
};
```

### Documented Limitation

> The server-side refresh token continues to exist for 7 days regardless of "Remember me" setting. If a refresh token is compromised, an attacker has access for 7 days. This is acceptable because:
> 1. Refresh tokens are httpOnly cookies (XSS-resistant)
> 2. True per-user TTL would require Redis/database sessions (overkill for MVP)
> 3. "Remember me" is a UX feature, not a security control

---

## Account Linking Behavior

Supabase automatically handles identity linking. This section documents the behavior for reference.

### Automatic Linking (Default Behavior)

When a user signs in with OAuth, Supabase looks for an existing user with the same **verified** email and automatically links the identities.

| Scenario | Behavior |
|----------|----------|
| OAuth first, then password signup | User can add password via `updateUser({ password })` |
| Password first (verified), then OAuth | Identities auto-linked |
| Password first (unverified), then OAuth | NOT linked (security measure) |

### Error Messages

**When user tries email/password signup but account exists with Google:**
```
"An account with this email already exists.
Please sign in with Google, or use 'Forgot Password' to set a password for email login."
```

**When OAuth login fails due to unverified email conflict:**
```
"Please verify your email first, or sign in with your password."
```

### "Set Password" for OAuth Users (Future Sprint)

OAuth users who want to add password auth should use Account Settings (not Forgot Password):

```typescript
// In Account Settings page (future sprint)
const handleSetPassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (!error) {
    showToast('Password set! You can now sign in with email/password.');
  }
};
```

> **WARNING:** Do NOT use "Forgot Password" flow for OAuth users - this creates a "ghost password" bug. Always use `updateUser({ password })`.

---

## Database Schema

### New Migration: `invites` Table

```sql
-- 20260108000000_auth_enhancements.sql

-- Invites table for academy admin onboarding
CREATE TABLE invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  email text NOT NULL,
  type text NOT NULL CHECK (type IN ('academy_owner', 'academy_admin', 'academy_manager')),
  academy_id uuid REFERENCES academies(id),  -- NULL for new academy owners
  created_by uuid NOT NULL REFERENCES profiles(id),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for token lookup (only active invites)
CREATE INDEX idx_invites_token ON invites(token) WHERE accepted_at IS NULL;

-- RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Only SUPER_ADMIN can create invites (for MVP)
CREATE POLICY invites_insert ON invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- Users can view invites sent to their email (login-first pattern)
CREATE POLICY invites_select ON invites
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );
```

### Enhanced `handle_new_user` Trigger

> **CHANGED:** Now conditionally assigns PARENT role based on pending invite.

```sql
-- Update existing trigger

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_has_pending_invite boolean;
BEGIN
  -- Create profile with metadata
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    phone_number
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone_number'
  );

  -- Check if user has a pending invite (B2B flow)
  SELECT EXISTS (
    SELECT 1 FROM invites
    WHERE email = NEW.email
      AND accepted_at IS NULL  -- not used
      AND expires_at > now()   -- not expired
  ) INTO v_has_pending_invite;

  -- Only auto-assign PARENT if NOT an invited admin
  IF NOT v_has_pending_invite THEN
    INSERT INTO public.user_roles (user_id, role, is_primary)
    VALUES (NEW.id, 'PARENT', true);
  END IF;
  -- If pending invite exists, user gets NO role until accept_invite is called

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### RPC: `accept_invite`

```sql
CREATE OR REPLACE FUNCTION accept_invite(
  p_token text,
  p_academy_name text DEFAULT NULL,
  p_academy_description text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite invites%ROWTYPE;
  v_user_id uuid := auth.uid();
  v_academy_id uuid;
  v_slug text;
BEGIN
  -- Get and validate invite
  SELECT * INTO v_invite FROM invites
  WHERE token = p_token
    AND accepted_at IS NULL
    AND expires_at > now();

  IF v_invite.id IS NULL THEN
    RETURN json_build_object('error', 'Invalid or expired invite');
  END IF;

  -- Check email matches
  IF v_invite.email != (SELECT email FROM auth.users WHERE id = v_user_id) THEN
    RETURN json_build_object('error', 'Invite was sent to a different email');
  END IF;

  -- Handle based on invite type
  IF v_invite.type = 'academy_owner' THEN
    -- Create new academy
    IF p_academy_name IS NULL THEN
      RETURN json_build_object('error', 'Academy name required');
    END IF;

    -- Generate slug
    v_slug := lower(regexp_replace(trim(p_academy_name), '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := trim(both '-' from v_slug);

    -- Check slug uniqueness
    IF EXISTS (SELECT 1 FROM academies WHERE slug = v_slug AND deleted_at IS NULL) THEN
      RETURN json_build_object('error', 'Academy URL already taken. Please choose a different name.');
    END IF;

    -- Create academy
    INSERT INTO academies (name, slug, description)
    VALUES (p_academy_name, v_slug, p_academy_description)
    RETURNING id INTO v_academy_id;

    -- Link as owner
    INSERT INTO academy_admins (academy_id, user_id, role)
    VALUES (v_academy_id, v_user_id, 'owner');

  ELSE
    -- Joining existing academy
    v_academy_id := v_invite.academy_id;

    INSERT INTO academy_admins (academy_id, user_id, role)
    VALUES (v_academy_id, v_user_id, v_invite.type);
  END IF;

  -- Assign ACADEMY_ADMIN role (if not already)
  INSERT INTO user_roles (user_id, role, is_primary)
  VALUES (v_user_id, 'ACADEMY_ADMIN', false)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Mark invite as used
  UPDATE invites SET accepted_at = now() WHERE id = v_invite.id;

  RETURN json_build_object(
    'success', true,
    'academy_id', v_academy_id,
    'slug', v_slug
  );
END;
$$;
```

### Supabase Config Updates

```toml
# supabase/config.toml

[auth]
# Session duration: 7 days (global)
jwt_expiry = 604800

[auth.email]
# IMPORTANT: Disabled - we gate at app layer instead
enable_confirmations = false

[auth.external.google]
enabled = true
client_id = "env(GOOGLE_CLIENT_ID)"
secret = "env(GOOGLE_CLIENT_SECRET)"

[auth.email.template.confirmation]
subject = "Confirm your Tenpo account"
content_path = "./templates/confirmation.html"

[auth.email.template.recovery]
subject = "Reset your Tenpo password"
content_path = "./templates/recovery.html"
```

---

## Middleware

> **CHANGED:** Now includes `email_confirmed_at` gate for protected routes.

### Step 1: Update Middleware Utility

First, modify `src/utils/supabase/middleware.ts` to return both the response AND the supabase client:

```typescript
// src/utils/supabase/middleware.ts

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }
  return value;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  await supabase.auth.getUser();

  // CHANGED: Return both response and client
  return { response: supabaseResponse, supabase };
}
```

### Step 2: Update Middleware

```typescript
// src/middleware.ts

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

const PUBLIC_ROUTES = [
  '/',
  '/camps',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth',
  '/invite',
];

// Routes that require email confirmation
const CONFIRMATION_REQUIRED_ROUTES = [
  '/dashboard',
  '/organizer',
];

// Routes that allow unverified users (but still require auth)
const UNVERIFIED_ALLOWED_ROUTES = [
  '/checkout',
  '/onboarding',
];

const ADMIN_ROUTES = ['/organizer'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Update session and get supabase client (reuses same client for all checks)
  const { response, supabase } = await updateSession(request);

  // Public routes - allow all
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return response;
  }

  // Get user (already refreshed by updateSession)
  const { data: { user } } = await supabase.auth.getUser();

  // No user - redirect to login
  if (!user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check email confirmation for protected routes
  if (CONFIRMATION_REQUIRED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!user.email_confirmed_at) {
      return NextResponse.redirect(new URL('/confirm-email', request.url));
    }
  }

  // Get user roles for admin route check
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  const roles = userRoles?.map(r => r.role) ?? [];
  const isAdmin = roles.includes('ACADEMY_ADMIN') || roles.includes('SUPER_ADMIN');

  // Admin routes - require admin role
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## Routes Structure

```
src/app/
├── (auth)/                    # Auth route group (no layout)
│   ├── login/
│   │   └── page.tsx          # Login form
│   ├── signup/
│   │   └── page.tsx          # Parent signup form
│   ├── forgot-password/
│   │   └── page.tsx          # Request password reset
│   ├── reset-password/
│   │   └── page.tsx          # Set new password
│   ├── confirm-email/
│   │   └── page.tsx          # "Please confirm your email" page (NEW)
│   └── auth/
│       └── callback/
│           └── route.ts      # OAuth & email callback handler
│
├── invite/
│   └── [token]/
│       └── page.tsx          # Invite acceptance (login-first)
│
├── onboarding/
│   └── academy/
│       └── page.tsx          # Academy setup (protected, unverified OK)
│
├── checkout/                  # Checkout flow (protected, unverified OK)
│   └── [eventId]/
│       └── page.tsx
│
├── dashboard/                 # Parent dashboard (protected, verified required)
│   └── page.tsx
│
└── organizer/                 # Academy admin dashboard (protected, verified required)
    └── page.tsx
```

---

## Components

### LoginForm

```typescript
interface LoginFormProps {
  redirectTo?: string;
}

// Fields
- email: string (required, email format)
- password: string (required)
- rememberMe: boolean (default false)

// Actions
- onSubmit:
  1. supabase.auth.signInWithPassword()
  2. setSessionExpiry(rememberMe) // Store in localStorage
  3. Redirect based on role
- onGoogleSignIn: supabase.auth.signInWithOAuth({ provider: 'google' })
- onForgotPassword: navigate to /forgot-password

// States
- idle, loading, error, success

// Error messages
- "Invalid email or password" (generic for security)
- "Too many attempts, please try again later" (rate limit)
```

### SignupForm

```typescript
interface SignupFormProps {
  redirectTo?: string;
}

// Fields
- firstName: string (required)
- lastName: string (required)
- email: string (required, email format)
- phone: string (required)
- password: string (required, 12+ chars with complexity)
- confirmPassword: string (required, must match)

// Validation
- Real-time password checklist (PasswordStrengthIndicator)

// Captcha
- Turnstile widget (bypass via NEXT_PUBLIC_ENABLE_CAPTCHA=false in local dev)

// Actions
- onSubmit: supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name, last_name, phone_number },
      emailRedirectTo: `${origin}/auth/callback?redirectTo=${redirectTo}`
    }
  })
- onGoogleSignIn: supabase.auth.signInWithOAuth({ provider: 'google' })

// Post-signup behavior
// User gets session immediately (enable_confirmations = false)
// If redirectTo exists: go there (e.g., checkout)
// Otherwise: show "Check your email" page
```

### InviteAcceptPage

> **CHANGED:** Login-first approach. Expired invites show contact support screen.

```typescript
// URL: /invite/[token]

export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in - redirect to login (DO NOT validate token yet)
  if (!user) {
    redirect(`/login?redirectTo=/invite/${params.token}&message=signin_for_invite`);
  }

  // Logged in - now we can query invites (RLS allows it)
  const { data: invite } = await supabase
    .from('invites')
    .select('*')
    .eq('token', params.token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (invite) {
    // Valid invite - redirect to onboarding
    redirect(`/onboarding/academy?token=${params.token}`);
  }

  // Invalid/expired invite - show contact support screen
  // Do NOT assign any role - user must request new invite
  return <InviteExpiredError />;
}

// Component for expired invite screen
function InviteExpiredError() {
  return (
    <div className="...">
      <h1>Invite Expired</h1>
      <p>This invite has expired or is no longer valid.</p>
      <p>
        Please contact <a href="mailto:support@tenpo.com">support@tenpo.com</a> to
        request a new invite link.
      </p>
    </div>
  );
}
```

### AcademyOnboardingForm

```typescript
// URL: /onboarding/academy?token=[token]
// Protected route (requires auth, unverified email OK)

// Fields
- academyName: string (required)
- description: string (optional)

// Slug preview
- Auto-generate from name, show preview
- "tenpo.com/academy/[generated-slug]"

// Actions
- onSubmit: supabase.rpc('accept_invite', {
    p_token: token,
    p_academy_name: academyName,
    p_academy_description: description
  })

// Error handling
- "Academy URL already taken" → prompt different name
- "Invalid or expired invite" → show error with support contact
- Generic errors → show retry + support contact
```

---

## Auth Callback Handler

```typescript
// src/app/auth/callback/route.ts

import { createServerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const redirectTo = searchParams.get('redirectTo');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth/email errors
  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    return NextResponse.redirect(`${origin}/login?error=${error}`);
  }

  if (code) {
    const supabase = await createServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }

    // Handle password recovery
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/reset-password`);
    }

    // Handle explicit redirectTo (e.g., checkout, invite)
    if (redirectTo) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }

    // Default: redirect based on role
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=no_user`);
    }

    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const roles = userRoles?.map(r => r.role) ?? [];

    // Check email confirmation for dashboard access
    if (!user.email_confirmed_at) {
      // If going to dashboard/organizer, redirect to confirm-email page
      return NextResponse.redirect(`${origin}/confirm-email`);
    }

    if (roles.includes('ACADEMY_ADMIN') || roles.includes('SUPER_ADMIN')) {
      return NextResponse.redirect(`${origin}/organizer`);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // No code - redirect to login
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
```

---

## Email Templates

### Confirmation Email

```html
<!-- supabase/templates/confirmation.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { margin-bottom: 24px; }
    .button {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 24px 0;
    }
    .footer { margin-top: 40px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="[TENPO_LOGO_URL]" alt="Tenpo" height="40" />
    </div>
    <h1>Confirm your email</h1>
    <p>Thanks for signing up for Tenpo! Click the button below to confirm your email address.</p>
    <a href="{{ .ConfirmationURL }}" class="button">Confirm Email</a>
    <p>If you didn't create an account, you can safely ignore this email.</p>
    <div class="footer">
      <p>Tenpo - Sports Camp Registration Made Easy</p>
    </div>
  </div>
</body>
</html>
```

### Password Reset Email

```html
<!-- supabase/templates/recovery.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    /* Same styles as confirmation.html */
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="[TENPO_LOGO_URL]" alt="Tenpo" height="40" />
    </div>
    <h1>Reset your password</h1>
    <p>We received a request to reset your password. Click the button below to set a new password.</p>
    <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <div class="footer">
      <p>Tenpo - Sports Camp Registration Made Easy</p>
    </div>
  </div>
</body>
</html>
```

---

## Environment Variables

### Local Development

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Feature flags
NEXT_PUBLIC_ENABLE_CAPTCHA=false
```

### Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

NEXT_PUBLIC_ENABLE_CAPTCHA=true
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key
```

---

## Testing Checklist

### Parent Auth Flow
- [ ] Signup with email/password creates user + profile
- [ ] Signup with pending invite does NOT assign PARENT role
- [ ] Signup without pending invite assigns PARENT role
- [ ] User has session immediately after signup (before confirmation)
- [ ] User can access /checkout without email confirmation
- [ ] User CANNOT access /dashboard without email confirmation
- [ ] Signup with Google creates user + profile + PARENT role
- [ ] Login stores session expiry in localStorage
- [ ] "Remember me" unchecked = 7 day expiry
- [ ] "Remember me" checked = 30 day expiry
- [ ] Session expiry triggers logout and redirect
- [ ] Multi-tab logout sync works
- [ ] Password reset flow works end-to-end

### Academy Admin Flow
- [ ] Create invite via Supabase Studio
- [ ] Unauthenticated user sees "Please sign in" message (not validation error)
- [ ] After login, valid invite redirects to onboarding
- [ ] After login, expired invite shows "contact support" screen (no role assigned)
- [ ] Onboarding creates academy + assigns ACADEMY_ADMIN role
- [ ] Slug collision shows "already taken" error
- [ ] Login redirects ACADEMY_ADMIN to /organizer

### Email Confirmation Gates
- [ ] /dashboard redirects unverified users to /confirm-email
- [ ] /organizer redirects unverified users to /confirm-email
- [ ] /checkout allows unverified users
- [ ] /onboarding/academy allows unverified users

### Account Linking
- [ ] Google OAuth links to existing verified email account
- [ ] Google OAuth does NOT link to unverified email account
- [ ] Error message shown for unverified email conflict

### Error Handling
- [ ] Invalid login shows generic error
- [ ] Rate limit shows generic error with support contact
- [ ] Forgot password always shows success message
- [ ] Expired invite shows error with support contact
- [ ] Failed onboarding shows retry + support contact

---

## Files to Create/Modify

### New Files
- `supabase/migrations/20260108000000_auth_enhancements.sql`
- `supabase/templates/confirmation.html`
- `supabase/templates/recovery.html`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`
- `src/app/(auth)/confirm-email/page.tsx` (NEW)
- `src/app/(auth)/auth/callback/route.ts`
- `src/app/invite/[token]/page.tsx`
- `src/app/onboarding/academy/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/organizer/page.tsx`
- `src/components/auth/login-form.tsx`
- `src/components/auth/signup-form.tsx`
- `src/components/auth/forgot-password-form.tsx`
- `src/components/auth/reset-password-form.tsx`
- `src/components/auth/password-strength-indicator.tsx`
- `src/components/auth/google-oauth-button.tsx`
- `src/lib/auth/session-expiry.ts` (NEW)

### Files to Modify
- `src/middleware.ts` - Add email confirmation gates
- `supabase/config.toml` - Disable confirmations, set jwt_expiry, add templates

---

## Support Contact

For error messages that suggest contacting support:

**Email:** support@tenpo.com

---

## Related Documents

- [Codex Review](./codex-review.md) - Full review dialogue
- [Backend Architecture Decision](../../decisions/backend-architecture-rpc-vs-edge-functions.md)
- [Scoping Questions](./scoping-questions.md)
- [Google OAuth Setup](./google-oauth-setup.md)
- [Testing Strategy](./proposed-testing.md)

---

## Questions During Implementation

If anything is unclear, check:
1. This handoff document (V2)
2. Codex review document
3. Scoping questions document
4. Backend architecture decision

If still unclear, ask before making assumptions.
