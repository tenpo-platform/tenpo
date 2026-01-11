# Authentication - How It Works

Sprint 2 authentication system overview, aligned to the current implementation.

---

## User Stories

### 1. Parent Signup (Email)
A parent signs up with name, email, phone, and a strong password (12+ chars, mixed case, number, symbol). They see a 6‑digit verification code screen and confirm via OTP. After verification, they’re routed by role (PARENT → `/dashboard`).

**30-day sessions:** JWT expiry is 30 days; refresh token rotation keeps active users signed in.

### 2. Parent Signup/Login (Google)
A parent clicks “Continue with Google.” Google verifies the email and Supabase creates the profile. If there’s no pending invite, they get PARENT and land on `/dashboard`.

### 3. Parent Login
Email/password login shows a generic error on invalid credentials. If the email isn’t confirmed, the login flow switches to OTP verification. Successful login routes by role.

### 4. Academy Admin Invite
Invites are token-first. `/invite/[token]` shows invite context and lets the user sign in or create a password. Existing accounts default to “Sign in.” If already signed in with the invited email, they’re sent straight to onboarding. Accepting the invite creates/links the academy and makes `ACADEMY_ADMIN` the primary role.

---

## Auth Flows

### Signup Flow

```mermaid
flowchart TD
    A["User visits /signup"] --> B{Form or Google?}

    B -->|Form| C[Submit name, email, phone, password]
    C --> D[signUp + handle_new_user]
    D --> E{Pending invite?}

    E -->|No| F[Assign PARENT]
    F --> G[Send OTP]
    G --> H[Verify OTP]
    H --> I[Role-based redirect]

    E -->|Yes| J[Auto-confirm + ACADEMY_ADMIN]
    J --> K[Role-based redirect]

    B -->|Google| L[Google OAuth]
    L --> D
```

### Login Flow

```mermaid
flowchart TD
    A["User visits /login"] --> B{Email/password or Google?}

    B -->|Form| C[Submit credentials]
    C --> D{Result?}
    D -->|Invalid| E[Show generic error]
    D -->|Email not confirmed| F[Show OTP verification]
    D -->|Success| G[Fetch roles]

    G --> H{Role?}
    H -->|SUPER_ADMIN| I["/admin"]
    H -->|ACADEMY_ADMIN| J["/organizer"]
    H -->|PARENT| K["/dashboard"]
    H -->|No roles| L["/login?error=no_role"]

    B -->|Google| M[Google OAuth]
    M --> G
```

### Invite Flow (Token-First)

```mermaid
flowchart TD
    A[Super Admin creates invite] --> B[Invitee clicks /invite/token]
    B --> C[Load invite context]

    C --> D{Already signed in?}
    D -->|Yes, email matches| E["/onboarding/academy?token=..."]
    D -->|Yes, mismatch| F[Show mismatch + sign out]
    D -->|No| G{Existing account?}

    G -->|Yes| H[Sign in]
    G -->|No| I[Create password or Google]

    H --> E
    I --> E

    E --> J[Accept invite]
    J --> K[Create/link academy]
    K --> L[Assign ACADEMY_ADMIN primary]
    L --> M["/organizer"]
```

### Route Protection (Middleware)

```mermaid
flowchart TD
    A[Request] --> B{Public route?}
    B -->|Yes| C[Serve page]
    B -->|No| D{Logged in?}
    D -->|No| E["/login?redirectTo=..."]
    D -->|Yes| F{Email confirmed?}
    F -->|No + protected| G["/confirm-email"]
    F -->|Yes| H{Has roles?}
    H -->|No| I["/login?error=no_role"]
    H -->|Yes| J[Role-based access]
```

Notes:
- `/checkout` is public and uses a UI modal gate.
- `/confirm-email` is public (OTP verification screen).

---

## Key Rules

| Rule | Description |
|------|-------------|
| **Default role** | New signups without an invite get PARENT |
| **Invite = verification** | Invited signups auto-confirm email |
| **Primary role** | Determines default dashboard; invite acceptance makes ACADEMY_ADMIN primary |
| **30-day sessions** | JWT expiry is 30 days; refresh tokens extend active sessions |
| **Email matching** | Invites can only be accepted by the invited email |
| **Role routing** | SUPER_ADMIN → /admin, ACADEMY_ADMIN → /organizer, PARENT → /dashboard |

---

## Onboarding Flags

Users have separate onboarding progress per role:

| Flag | Purpose |
|------|---------|
| `parent_onboarding_completed` | Parent onboarding progress |
| `academy_admin_onboarding_completed` | Academy admin onboarding progress |

`accept_invite()` resets `academy_admin_onboarding_completed` to `false`.

---

## Files (Current)

| Component | Path |
|-----------|------|
| Auth UI | `src/components/auth/auth-widget.tsx` |
| Auth modal | `src/components/auth/auth-modal.tsx` |
| Auth flow helper | `src/components/auth/use-auth-flow.ts` |
| Auth service wrapper | `src/services/auth-service.ts` |
| Auth callback | `src/app/(auth)/auth/callback/route.ts` |
| Middleware | `src/middleware.ts` |
| Invite page | `src/app/invite/[token]/page.tsx` |
| Academy onboarding | `src/app/onboarding/academy/page.tsx` |
| Invite context RPC | `supabase/migrations/20260108000000_auth_enhancements.sql` |
| Role assignment trigger | `supabase/migrations/20260108000000_auth_enhancements.sql` |
| Accept invite RPC | `supabase/migrations/20260108000000_auth_enhancements.sql` |
