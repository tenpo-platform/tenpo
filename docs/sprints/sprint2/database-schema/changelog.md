# Database Schema — Implementation Changelog

**Sprint:** 2
**Implemented:** 2026-01-07
**Branch:** `feature/database-schema`

---

## Summary

Implemented the full Sprint 2 database schema as specified in `phased-schema.md`. All 4 checklist items from `handoff.md` are complete.

---

## Files Created

```
supabase/
  migrations/
    20260107000000_db_phase.sql      # [DB] Core foundation
    20260107000001_admin_phase.sql   # [ADMIN] Academy & event management
    20260107000002_public_phase.sql  # [PUBLIC] Registration flow
    20260107000003_stripe_phase.sql  # [STRIPE] Payments (stretch)
  seed.sql                           # Sports + DivineTime academy

src/types/
  database.types.ts                  # Generated TypeScript types
```

---

## Schema Statistics

| Element | Count |
|---------|-------|
| Tables | 19 |
| ENUMs | 7 |
| Triggers | 11 |
| Indexes | 12 |
| RLS Policies | 66 |
| RPCs | 1 |

---

## Tables by Phase

### [DB] Phase (3 tables)
- `profiles` — Extends auth.users with app-specific fields
- `user_roles` — Multi-role support (PARENT, ATHLETE, COACH, ACADEMY_ADMIN, SUPER_ADMIN, STAFF)
- `sports` — Lookup table for event categorization

### [ADMIN] Phase (6 tables)
- `academies` — Multi-tenant organizations
- `academy_admins` — Links users to academies with role (owner/admin/manager)
- `locations` — Event venues with coordinates
- `events` — Camps and clinics
- `event_days` — Multi-day event schedules
- `event_tickets` — Ticket tiers with pricing and capacity

### [PUBLIC] Phase (7 tables)
- `athletes` — Children/players managed by parents
- `athlete_guardians` — Parent-athlete relationships
- `athlete_medical` — Emergency contacts, allergies (strict RLS)
- `waivers` — Liability waivers with versioning
- `event_waivers` — Links waivers to events
- `waiver_signatures` — Signature records with IP/user-agent
- `event_registrations` — Registration records with pricing snapshots

### [STRIPE] Phase (3 tables)
- `payments` — Payment records with Stripe integration
- `refunds` — Refund requests and processing
- `payouts` — Stripe Connect transfers to academies

---

## ENUMs

| ENUM | Values |
|------|--------|
| `user_role` | PARENT, ATHLETE, COACH, ACADEMY_ADMIN, SUPER_ADMIN, STAFF |
| `event_status` | draft, published, canceled, completed |
| `location_visibility` | public, private |
| `registration_status` | pending, confirmed, canceled, refunded, completed |
| `payment_status` | pending, succeeded, failed, refunded |
| `refund_status` | pending, approved, rejected, completed |
| `payment_source` | stripe, free, comp |

---

## RLS Policy Highlights

### SUPER_ADMIN Privileges
- Can create academies (only role allowed)
- Can update/delete any academy
- Can view all academy admins
- Can bootstrap academy admins (add first owner)
- Can remove academy admins (fix mistakes)
- Can manage sports (insert/update/delete)

### Academy Owner Privileges
- Can update their academy
- Can delete their academy
- Can add/remove academy admins

### Guardian Privileges
- Full CRUD on their athletes
- Full CRUD on athlete_guardians links
- Full CRUD on athlete_medical for their athletes
- Can register athletes for events
- Can sign waivers for athletes

### Public Access
- Can view published events
- Can view active academies
- Can view public locations
- Can view active waivers (for signing)

---

## Additions Beyond Spec

These items were added to improve the implementation:

1. **`handle_new_user()` trigger**
   Auto-creates profile row when user signs up via Supabase Auth.
   Supports testing checklist: "Can create a user via Supabase Auth → profile auto-created"

2. **`ON DELETE CASCADE` on profiles FK**
   Prevents orphan profiles if auth.users row is deleted.

3. **Comprehensive RLS on all tables**
   Added policies to `sports`, `academy_admins`, `event_days`, `event_tickets`, `payments`, `refunds`, `payouts` beyond the 12 tables specified in phased-schema.md.

4. **SUPER_ADMIN override clauses**
   Added to `academies_update`, `academies_delete`, `academy_admins_select`, `academy_admins_insert`, `academy_admins_delete` per review feedback.

5. **SUPER_ADMIN sports management**
   Added insert/update/delete policies for `sports` table so SUPER_ADMIN can manage sports from the app.

6. **Soft-delete protection on event children**
   Added `e.deleted_at IS NULL` check to `event_days_select` and `event_tickets_select` policies to prevent exposing days/tickets of soft-deleted events.

---

## Seed Data

### Sports (8 records)
Soccer, Basketball, Baseball, Football, Tennis, Swimming, Volleyball, Lacrosse

### DivineTime Academy
- Name: `DivineTime Training`
- Slug: `divinetime`
- Email: `info@joindivinetime.com`

### Luca Admin Link
Commented out in `seed.sql` with instructions. Run manually after Luca signs up:

```sql
-- Option 1: If you have Luca's user ID
INSERT INTO academy_admins (academy_id, user_id, role)
SELECT a.id, '<LUCA_USER_ID>'::uuid, 'owner'
FROM academies a WHERE a.slug = 'divinetime';

INSERT INTO user_roles (user_id, role, is_primary)
VALUES ('<LUCA_USER_ID>'::uuid, 'ACADEMY_ADMIN', true);

-- Option 2: Lookup by email (if already signed up)
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

---

## Testing Commands

```bash
# Reset database (applies migrations + seed)
supabase db reset

# Access Supabase Studio
open http://127.0.0.1:54323

# Regenerate TypeScript types
npx supabase gen types typescript --local > src/types/database.types.ts

# Connect to database directly
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

---

## Verification Checklist

- [x] 19 tables created
- [x] 7 ENUMs with correct values
- [x] 11 triggers for updated_at
- [x] 12 indexes for performance
- [x] RLS enabled on all tables
- [x] `reserve_ticket()` RPC for atomic reservations
- [x] `handle_new_user()` trigger for auto-profile creation
- [x] Sports seeded (8 records)
- [x] DivineTime academy seeded
- [x] TypeScript types generated

---

## Known Limitations

1. **Luca admin link**
   Must be run manually after Luca signs up via auth.

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `handoff.md` | Implementation instructions |
| `phased-schema.md` | Canonical schema specification |
| `schema-proposal-V2.md` | Full northstar schema (34 tables) |

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-07 | Initial implementation of all 4 phases |
| 1.1 | 2026-01-07 | Added SUPER_ADMIN to academies_insert, academies_update, academies_delete, academy_admins_insert, academy_admins_delete |
| 1.2 | 2026-01-07 | Added SUPER_ADMIN to academy_admins_select; added soft-delete check to event_days_select/event_tickets_select; added sports insert/update/delete for SUPER_ADMIN |

---

*Changelog created: 2026-01-07*
*Last updated: 2026-01-07 (v1.2)*
