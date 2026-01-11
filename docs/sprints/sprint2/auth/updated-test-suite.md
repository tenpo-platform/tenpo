# Updated Auth QA Test Suite

**Sprint:** 2  
**Updated:** 2026-01-10  
**Purpose:** Manual QA for the unified AuthWidget + token-first invite flow

---

## Preconditions (Must Have)

Before testing, ensure the new invite context RPC and OTP templates are active:

- `supabase/migrations/20260108000000_auth_enhancements.sql` applied
- `supabase/templates/confirmation.html` and `supabase/templates/recovery.html` in place
- Supabase local running with a fresh reset

If any of the above are not true, run the reset steps below before QA.

---

## Fresh Start Commands (Local)

```bash
# 1) Start Supabase (Docker)
supabase start

# 2) Reset DB and reapply migrations + seed data
supabase db reset

# 3) Install deps and run the app
npm install
npm run dev
```

**Useful URLs**

- App: `http://localhost:3000`
- Supabase Studio: `http://localhost:54323`
- Inbucket (email testing): `http://localhost:54324`

**Optional Checks**

```bash
# Confirm migrations applied
supabase migration list
```

**Notes**

- CAPTCHA is disabled locally if `NEXT_PUBLIC_ENABLE_CAPTCHA=false`.
- Google OAuth requires valid credentials in `.env.local` and Supabase config. Skip OAuth tests if not configured.

---

## Manual QA Checklist

### Flow 1: Parent Signup (Email/Password + OTP) (DONE, PASSED)

**Steps**

1. Go to `http://localhost:3000/signup`
2. Enter new user details (e.g., `parent1@test.com`)
3. Submit the form
4. Open Inbucket, copy 6-digit code
5. Enter code, verify

**Expected**

- OTP screen appears after signup
- Verification succeeds, user lands on `/dashboard`
- `user_roles` contains `PARENT` (primary)
- `profiles.parent_onboarding_completed = false`

---

### Flow 2: Parent Login (DONE, PASSED)

**Steps**

1. Go to `http://localhost:3000/login`
2. Enter `parent1@test.com` + password

**Expected**

- Redirect to `/dashboard`

**Invalid Login**

1. Use wrong password or non-existent email

**Expected**

- Error: “Invalid email or password”

---

### Flow 3: Unconfirmed Email Login -> OTP (DONE, PASSED)

**Steps**

1. Sign up with `parent2@test.com` but do NOT verify
2. Attempt login

**Expected**

- Redirect to OTP screen with email prefilled
- OTP verification completes login

---

### Flow 4: Password Reset (OTP) (DONE, PASSED)

**Steps**

1. From login, click “Forgot password?”
2. Submit email `parent1@test.com`
3. Open Inbucket and copy the 6-digit code
4. Enter code on OTP screen
5. Set new password

**Expected**

- OTP verification succeeds
- New password is accepted
- Login works with new password, old password fails

---

### Flow 5: Google OAuth (Optional) (DONE, PASSED)

**Prereq:** Valid Google OAuth config in Supabase.

**Steps**

1. Go to `/signup`
2. Click “Continue with Google”

**Expected**

- OAuth completes
- User lands on `/dashboard`
- Email is auto-confirmed

---

### Flow 6: Invite Acceptance (New Academy Admin) (DONE, PASSED)

**Create Invite**

Use Supabase Studio → Table Editor → `invites`:

- `email`: `newadmin@test.com`
- `type`: `academy_owner`
- `academy_id`: `NULL`
- `created_by`: `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` (seeded super admin)
- `expires_at`: default

Copy the `token`.

**Steps**

1. Go to `http://localhost:3000/invite/[TOKEN]`
2. Confirm inviter name and invite email shown
3. Set password and continue
4. On onboarding, create academy

**Expected**

- No OTP required for invite flow
- Redirect to `/onboarding/academy?token=...`
- Academy created
- User has `ACADEMY_ADMIN` role (primary)
- Redirect to `/organizer`

---

### Flow 7: Invite Acceptance (Existing Parent)

**Steps**

1. Create a parent account for `parent1@test.com` (email or Google OAuth)
2. Create an invite for that same email
3. Visit `/invite/[TOKEN]`
4. If already signed in, confirm you are sent to onboarding; if not signed in, use “Sign in”
5. Complete onboarding

**Expected**

- Invite page defaults to **Sign in** (no “create password” prompt)
- If already signed in, auto-redirects to `/onboarding/academy?token=...`
- Parent becomes `ACADEMY_ADMIN` (primary)
- `PARENT` role remains with `is_primary = false`
- Redirect to `/organizer`

---

### Flow 8: Expired/Invalid Invite (DONE, PASSED)

**Steps**

1. Use an invalid token or set `expires_at` in the past
2. Go to `/invite/[TOKEN]`

**Expected**

- “Invite Expired” screen with support CTA

---

### Flow 9: Role-Based Access (DONE, PASSED)

**Expected Behavior**

- PARENT-only → `/dashboard`
- ACADEMY_ADMIN → `/organizer`
- SUPER_ADMIN → `/admin`
- Unverified email → `/confirm-email` (protected routes only)

---

### Flow 10: Checkout Auth Modal (Mock)

**Steps**

1. Visit `/checkout`
2. Check the agreement checkbox
3. Click “Continue to payment”
4. When prompted, sign in or create an account

**Expected**

- If logged out, the Auth modal opens (no redirect)
- After successful auth, modal closes and checkout continues
- If OAuth is used, user returns to `/checkout` and can proceed

---

## Quick DB Checks

```sql
-- Verify roles
SELECT * FROM user_roles WHERE user_id = '<USER_ID>';

-- Verify profile onboarding flags
SELECT parent_onboarding_completed, academy_admin_onboarding_completed
FROM profiles WHERE id = '<USER_ID>';

-- Verify invite status
SELECT token, email, accepted_at, expires_at
FROM invites WHERE email = 'newadmin@test.com';
```
