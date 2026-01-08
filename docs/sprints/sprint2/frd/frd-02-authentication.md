# FRD 2: Authentication System

**Last Updated:** 2026-01-08
**Status:** Revised after scoping

---

## Database Tables Used

| Table | Purpose |
|-------|---------|
| `auth.users` | Supabase managed auth |
| `profiles` | User profile data (auto-created on signup via trigger) |
| `user_roles` | Role assignments (PARENT, ACADEMY_ADMIN, etc.) |
| `academies` | Academy/organization records |
| `academy_admins` | Links users to academies with role (owner/admin/manager) |
| `invites` | Invite tokens for academy admin onboarding (NEW) |

---

## Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| /login | GET | Public | Login page (email/password + Google OAuth) |
| /signup | GET | Public | Parent signup form |
| /forgot-password | GET | Public | Request password reset |
| /reset-password | GET | Public | Reset password form (requires session from callback) |
| /auth/callback | GET | Public | Supabase auth callback handler |
| /invite/[token] | GET | Public | Invite validation, redirects to login or onboarding |
| /onboarding/academy | GET | Protected | Academy setup form for invited admins |
| /dashboard | GET | Protected | Parent dashboard |
| /organizer | GET | Protected (Admin) | Academy admin dashboard |

**Removed routes:**
- ~~/signup/parent~~ - Replaced by single /signup route
- ~~/signup/academy~~ - Replaced by invite-only flow
- ~~/auth/confirm~~ - Consolidated into /auth/callback

---

## Components

### LoginForm

```typescript
interface LoginFormProps {
  redirectTo?: string; // Where to redirect after login
}

// Fields
- email: string (required, email format)
- password: string (required)
- rememberMe: boolean (default false)

// Actions
- onSubmit: Call supabase.auth.signInWithPassword()
- onGoogleSignIn: Call supabase.auth.signInWithOAuth({ provider: 'google' })
- onForgotPassword: Navigate to /forgot-password

// States
- idle, loading, error, success

// Session duration
- rememberMe false: 7 days (default)
- rememberMe true: 30 days

// Error messages
- "Invalid email or password" (generic for security)
- "Too many attempts, please try again later. Contact support if this persists."
```

### SignupForm

```typescript
interface SignupFormProps {
  redirectTo?: string; // Where to redirect after signup (e.g., checkout)
}

// Fields
- firstName: string (required)
- lastName: string (required)
- email: string (required, email format)
- phone: string (required)
- password: string (required, 12+ chars with complexity)
- confirmPassword: string (required, must match)

// Validation (real-time for password)
- PasswordStrengthIndicator component showing:
  □ At least 12 characters
  □ One uppercase letter
  □ One lowercase letter
  □ One number
  □ One symbol

// Captcha
- Turnstile widget (disabled in local dev via NEXT_PUBLIC_ENABLE_CAPTCHA)

// Actions
- onSubmit:
  1. Validate captcha token
  2. Call supabase.auth.signUp({
       email,
       password,
       options: {
         data: { first_name, last_name, phone_number },
         emailRedirectTo: `${origin}/auth/callback?redirectTo=${redirectTo}`
       }
     })
  3. Trigger auto-creates profile + assigns PARENT role
  4. Show "Check your email" confirmation page

- onGoogleSignIn: Call supabase.auth.signInWithOAuth({ provider: 'google' })

// Post-signup behavior
- Standalone: Show confirmation page, wait for email verification
- Checkout flow: Continue to checkout immediately (verification deferred)
```

### ForgotPasswordForm

```typescript
// Fields
- email: string (required)

// Actions
- onSubmit: Call supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?type=recovery`
  })

// Always show success message:
"If your email is tied to an account, you should receive an email"
```

### ResetPasswordForm

```typescript
// Prerequisite: User must have session (from /auth/callback)

// Fields
- password: string (required, 12+ chars with complexity)
- confirmPassword: string (required, must match)

// Validation
- Same PasswordStrengthIndicator as signup

// Actions
- onSubmit: Call supabase.auth.updateUser({ password })
- On success: Redirect to /login with success toast
```

### GoogleOAuthButton

```typescript
interface GoogleOAuthButtonProps {
  redirectTo?: string;
  label?: string; // "Continue with Google" or "Sign in with Google"
}

// Actions
- onClick: Call supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?redirectTo=${redirectTo}`
    }
  })
```

### InviteAcceptPage

```typescript
// Route: /invite/[token]

// On mount:
1. Query invites table for token
2. Validate:
   - Token exists
   - Token not expired (expires_at > now)
   - Token not used (accepted_at IS NULL)
3. If invalid:
   - Show error: "This invite link is invalid or has expired."
   - Show support contact
4. If valid but not logged in:
   - Store token in URL param
   - Redirect to /login?redirectTo=/invite/[token]
5. If valid and logged in:
   - Verify email matches invite email (optional security check)
   - Redirect to /onboarding/academy?token=[token]
```

### AcademyOnboardingForm

```typescript
// Route: /onboarding/academy?token=[token]
// Protected route (requires authentication)

// Fields
- academyName: string (required)
- description: string (optional)
// Future: logo upload

// Slug preview
- Auto-generate slug from academyName
- Show preview: "Your academy URL: tenpo.com/academy/[slug]"

// Actions
- onSubmit: Call supabase.rpc('accept_invite', {
    p_token: token,
    p_academy_name: academyName,
    p_academy_description: description
  })

// Error handling
- "Academy URL already taken. Please choose a different name."
- "Something went wrong setting up your academy. Please try again. Contact support if this persists."

// On success:
- Redirect to /organizer
- Show success toast: "Welcome to Tenpo! Your academy is ready."
```

### PasswordStrengthIndicator

```typescript
interface PasswordStrengthIndicatorProps {
  password: string;
}

// Display checklist with visual indicators:
- [✓/✗] At least 12 characters
- [✓/✗] One uppercase letter (A-Z)
- [✓/✗] One lowercase letter (a-z)
- [✓/✗] One number (0-9)
- [✓/✗] One symbol (!@#$%^&*...)

// Styling
- Met requirement: green checkmark
- Unmet requirement: gray/red X
```

---

## Middleware Logic

```typescript
// src/middleware.ts

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

const ADMIN_ROUTES = ['/organizer'];
const ONBOARDING_ROUTES = ['/onboarding'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Update session (refresh tokens)
  const response = await updateSession(req);

  // Public routes - allow all
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return response;
  }

  // Get session
  const supabase = createServerClient(/* cookies */);
  const { data: { session } } = await supabase.auth.getSession();

  // No session - redirect to login with returnTo
  if (!session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Get user roles from user_roles table
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id);

  const roles = userRoles?.map(r => r.role) ?? [];

  // Admin routes - require ACADEMY_ADMIN or SUPER_ADMIN
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    const isAdmin = roles.includes('ACADEMY_ADMIN') || roles.includes('SUPER_ADMIN');
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Onboarding routes - just need authentication (token validation in page)

  // Parent routes (/dashboard) - any authenticated user allowed

  return response;
}
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
  const type = searchParams.get('type'); // 'recovery' for password reset
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

    // Handle password recovery - redirect to reset form
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

    // Redirect based on role
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

## Database: New `invites` Table

```sql
CREATE TABLE invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  email text NOT NULL,
  type text NOT NULL CHECK (type IN ('academy_owner', 'academy_admin', 'academy_manager')),
  academy_id uuid REFERENCES academies(id), -- NULL for new academy owners
  created_by uuid NOT NULL REFERENCES profiles(id),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invites_token ON invites(token) WHERE accepted_at IS NULL;

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- SUPER_ADMIN can create invites
CREATE POLICY invites_insert ON invites
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN')
  );

-- Users can view invites for their email
CREATE POLICY invites_select ON invites
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN')
  );
```

---

## Database: Enhanced Trigger

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile with metadata from signup
  INSERT INTO public.profiles (id, first_name, last_name, phone_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone_number'
  );

  -- Auto-assign PARENT role for B2C signups
  INSERT INTO public.user_roles (user_id, role, is_primary)
  VALUES (NEW.id, 'PARENT', true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Database: RPC `accept_invite`

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
  -- Validate invite
  SELECT * INTO v_invite FROM invites
  WHERE token = p_token AND accepted_at IS NULL AND expires_at > now();

  IF v_invite.id IS NULL THEN
    RETURN json_build_object('error', 'Invalid or expired invite');
  END IF;

  -- Verify email matches
  IF v_invite.email != (SELECT email FROM auth.users WHERE id = v_user_id) THEN
    RETURN json_build_object('error', 'Invite was sent to a different email');
  END IF;

  IF v_invite.type = 'academy_owner' THEN
    -- Creating new academy
    IF p_academy_name IS NULL THEN
      RETURN json_build_object('error', 'Academy name required');
    END IF;

    -- Generate and validate slug
    v_slug := lower(regexp_replace(trim(p_academy_name), '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := trim(both '-' from v_slug);

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

  -- Assign ACADEMY_ADMIN role
  INSERT INTO user_roles (user_id, role, is_primary)
  VALUES (v_user_id, 'ACADEMY_ADMIN', false)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Mark invite used
  UPDATE invites SET accepted_at = now() WHERE id = v_invite.id;

  RETURN json_build_object('success', true, 'academy_id', v_academy_id, 'slug', v_slug);
END;
$$;
```

---

## Configuration Changes

### supabase/config.toml

```toml
[auth]
# Session duration: 7 days default
jwt_expiry = 604800

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

## Related Documents

- [PRD: Authentication](../prd/prd-01-authentication.md)
- [Implementation Handoff](../auth/handoff.md)
- [Scoping Questions](../auth/scoping-questions.md)
- [Backend Architecture Decision](../../decisions/backend-architecture-rpc-vs-edge-functions.md)
- [Google OAuth Setup](../auth/google-oauth-setup.md)
