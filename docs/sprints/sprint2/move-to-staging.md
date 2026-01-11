# Move to Staging Guide

**Sprint:** 2  
**Created:** 2026-01-07  
**Updated:** 2026-01-12

This guide covers moving Sprint 2 auth work to the `tenpo-staging` Supabase project. It focuses on Supabase config, auth settings, and environment variables (not app deployment).

---

## Prerequisites

- [ ] All local testing complete (see `docs/sprints/sprint2/auth/updated-test-suite.md`)
- [ ] `supabase` CLI installed and authenticated
- [ ] Project linked to staging (`supabase link --project-ref zqyjrsjjdmiapyablbzv`)

---

## Current Project Links

| Environment | Project ID | Name |
|-------------|------------|------|
| Staging | `zqyjrsjjdmiapyablbzv` | tenpo-staging |
| Production | `ifsjdiuheciwxuwrjsst` | tenpo-prod |

---

## 1. Database Schema

### Check Migration Status

```bash
supabase migration list
```

Expected output (before push):
```
 Local          | Remote | Time (UTC)
----------------|--------|---------------------
 20260107000000 |        | 2026-01-07 00:00:00   # DB phase
 20260107000001 |        | 2026-01-07 00:00:01   # ADMIN phase
 20260107000002 |        | 2026-01-07 00:00:02   # PUBLIC phase
 20260107000003 |        | 2026-01-07 00:00:03   # STRIPE phase
 20260108000000 |        | 2026-01-08 00:00:00   # AUTH (invites, roles, RPCs)
```

### Push Migrations

```bash
supabase db push
```

### Verify Deployment

```bash
supabase migration list
```

---

## 2. Seed Data

Seed data does NOT run automatically with `db push`. Run manually:

### Option A: Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/zqyjrsjjdmiapyablbzv
2. Navigate to SQL Editor
3. Paste contents of `supabase/seed.sql`
4. Run

### Option B: CLI

```bash
supabase db remote execute -f supabase/seed.sql
```

---

## 3. Link Luca as DivineTime Owner

After Luca signs up on staging, run:

```sql
DO $$
DECLARE
  luca_id uuid;
BEGIN
  SELECT id INTO luca_id FROM auth.users WHERE email = 'luca@joindivinetime.com';
  IF luca_id IS NOT NULL THEN
    INSERT INTO academy_admins (academy_id, user_id, role)
    SELECT a.id, luca_id, 'owner' FROM academies a WHERE a.slug = 'divinetime'
    ON CONFLICT DO NOTHING;
    INSERT INTO user_roles (user_id, role, is_primary)
    VALUES (luca_id, 'ACADEMY_ADMIN', true) ON CONFLICT DO NOTHING;
    RAISE NOTICE 'Luca linked as DivineTime owner';
  ELSE
    RAISE NOTICE 'Luca not found - has he signed up yet?';
  END IF;
END $$;
```

---

## 4. Generate Types for Staging

```bash
npx supabase gen types typescript --project-id zqyjrsjjdmiapyablbzv > src/types/database.types.ts
```

---

## 5. Environment Variables (App)

Ensure your app uses staging Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zqyjrsjjdmiapyablbzv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from-dashboard>

# Optional: Turnstile CAPTCHA
NEXT_PUBLIC_ENABLE_CAPTCHA=true
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<turnstile-site-key>
TURNSTILE_SECRET_KEY=<turnstile-secret-key>
```

---

## 6. Supabase Dashboard Settings (Auth)

These settings must be set in the Supabase Dashboard (not `config.toml`).

### 6.1 URL Configuration
- **Site URL**: set to your staging app URL (e.g., `https://staging.tenpo.com`).
- **Redirect URLs**: include your staging callback URL: `https://staging.tenpo.com/auth/callback`.

### 6.2 Email Confirmation + OTP Templates
- **Auth > Providers > Email**:
  - **Confirm email**: enabled.
  - **OTP length**: 6.
- **Auth > Templates**:
  - **Confirmation email**: use OTP (`{{ .Token }}`), not `{{ .ConfirmationURL }}`.
  - **Recovery email**: use OTP (`{{ .Token }}`).

> The frontend uses `verifyOtp()` for both signup and password reset; OTP emails must be configured to show the token.

### 6.3 Google OAuth
- **Auth > Providers > Google**:
  - Add Google OAuth Client ID + Secret for staging.

### 6.4 Automatic Account Linking
- **Auth > Providers**:
  - Enable **“Automatically link accounts with the same email.”**
  - Required for email+password users to later add Google sign‑in.

### 6.5 JWT Expiry
- **Auth > Configuration**:
  - Set JWT expiry to `2592000` (30 days) to match local config.

### 6.6 CAPTCHA (Turnstile)
- **Auth > Settings > Captcha**:
  - Enable CAPTCHA.
  - Provider: **Turnstile**.
  - Enter site + secret keys (must match app env vars).

### 6.7 SMTP (Optional)
If you want real emails from staging (non‑Inbucket):
- **Auth > Settings > SMTP**: configure SendGrid/Postmark/etc.

---

## Rollback (If Needed)

Supabase migrations are one‑way. To rollback:

1. **Minor fix:** create a new migration with `ALTER` statements.
2. **Major issue:** reset staging database (destructive):
   ```bash
   supabase db reset --linked
   ```

---

## Checklist

Before pushing to staging:
- [ ] `supabase db reset` works locally without errors
- [ ] Auth QA suite passed (`updated-test-suite.md`)
- [ ] RLS policies tested
- [ ] Types generate cleanly

After pushing to staging:
- [ ] `supabase migration list` shows all migrations applied
- [ ] Seed data loaded
- [ ] Staging app connects with staging env vars
- [ ] Dashboard settings configured:
  - [ ] Confirm email + OTP templates updated
  - [ ] Google OAuth configured
  - [ ] Automatic account linking enabled
  - [ ] JWT expiry set to 30 days
  - [ ] Turnstile configured (if enabled)
