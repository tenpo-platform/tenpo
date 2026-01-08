# Database Schema — Summary

**Status:** Complete
**Sprint:** 2
**Completed:** 2026-01-07

---

## Outcome

All 4 checklist items from the sprint are complete:

| Task | Status |
|------|--------|
| Create core schema migration | Done |
| Implement RLS policies | Done |
| Generate TypeScript types | Done |
| Seed DivineTime org + Luca admin | Done* |

*Luca admin link requires manual execution after he signs up via auth. SQL is ready in `seed.sql`.

---

## What Was Built

**19 tables** across 4 migration phases:

| Phase | Tables | Purpose |
|-------|--------|---------|
| DB | 3 | profiles, user_roles, sports |
| ADMIN | 6 | academies, academy_admins, locations, events, event_days, event_tickets |
| PUBLIC | 7 | athletes, athlete_guardians, athlete_medical, waivers, event_waivers, waiver_signatures, event_registrations |
| STRIPE | 3 | payments, refunds, payouts |

**66 RLS policies** with:
- SUPER_ADMIN overrides for platform management
- Multi-tenant isolation via academy_admins
- Guardian-based athlete access control
- Soft-delete protection

**1 RPC** for atomic ticket reservation (`reserve_ticket`)

**1 Auth trigger** for auto-profile creation on signup

---

## Files Created

```
supabase/
  migrations/
    20260107000000_db_phase.sql
    20260107000001_admin_phase.sql
    20260107000002_public_phase.sql
    20260107000003_stripe_phase.sql
  seed.sql

src/types/
  database.types.ts
```

---

## Seed Data

| Data | Status |
|------|--------|
| 8 sports | Seeded |
| DivineTime academy | Seeded |
| Luca as owner | Manual step after signup |

---

## Next Steps

1. **Link Luca as DivineTime owner** after he signs up:
   ```sql
   -- Run in Supabase Studio SQL editor or psql
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
     END IF;
   END $$;
   ```

2. **Verify with Auth task** — The auth implementation can now use `profiles` and `user_roles` tables.

3. **Verify with Admin Dashboard task** — Camp CRUD can now use `events`, `event_tickets`, `academies` tables.

---

## Quick Reference

```bash
# Reset database (applies migrations + seed)
supabase db reset

# Regenerate types after schema changes
npx supabase gen types typescript --local > src/types/database.types.ts

# Access Supabase Studio
open http://127.0.0.1:54323

# Direct database access
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| `handoff.md` | Original implementation instructions |
| `phased-schema.md` | Canonical schema specification |
| `changelog.md` | Detailed implementation log with revisions |
| `schema-proposal-V2.md` | Full northstar schema (34 tables) |

---

*Database Schema task complete. Ready for Auth and Admin Dashboard integration.*
