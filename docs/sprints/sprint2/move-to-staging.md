# Move to Staging Guide

**Sprint:** 2
**Created:** 2026-01-07

This guide covers deploying Sprint 2 work to the `tenpo-staging` Supabase project.

---

## Prerequisites

- [ ] All local testing complete
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
# See what's pending
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
```

### Push Migrations

```bash
# Apply all pending migrations to staging
supabase db push
```

This creates:
- 19 tables
- 7 ENUMs
- 66 RLS policies
- 12 indexes
- 11 triggers
- 1 RPC (`reserve_ticket`)

### Verify Deployment

```bash
# Should show checkmarks in Remote column
supabase migration list
```

---

## 2. Seed Data

Seed data does NOT run automatically with `db push`. Run manually:

### Option A: Via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/zqyjrsjjdmiapyablbzv
2. Navigate to SQL Editor
3. Paste contents of `supabase/seed.sql`
4. Run

### Option B: Via CLI

```bash
# Connect to staging database and run seed
supabase db remote execute -f supabase/seed.sql
```

### Option C: Direct psql

```bash
# Get connection string from dashboard, then:
psql "postgresql://postgres:[PASSWORD]@db.zqyjrsjjdmiapyablbzv.supabase.co:5432/postgres" -f supabase/seed.sql
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

If you need types from the remote schema:

```bash
npx supabase gen types typescript --project-id zqyjrsjjdmiapyablbzv > src/types/database.types.ts
```

---

## 5. Environment Variables

Ensure your app has staging Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zqyjrsjjdmiapyablbzv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from-dashboard>
```

---

## Rollback (If Needed)

Supabase migrations are one-way. To rollback:

1. **Minor fix:** Create a new migration with `ALTER` statements
2. **Major issue:** Reset staging database (destructive):
   ```bash
   # WARNING: This deletes all data
   supabase db reset --linked
   ```

---

## Checklist

Before pushing to staging:

- [ ] `supabase db reset` works locally without errors
- [ ] All RLS policies tested
- [ ] TypeScript types generate correctly
- [ ] Seed data verified

After pushing to staging:

- [ ] `supabase migration list` shows all migrations applied
- [ ] Seed data loaded (sports, DivineTime academy)
- [ ] Can access tables in Supabase Dashboard
- [ ] App can connect with staging credentials

---

## Related Docs

- `database-schema/summary.md` — What was implemented
- `database-schema/changelog.md` — Detailed changes
- `database-schema/handoff.md` — Original spec

---

*Guide created: 2026-01-07*
