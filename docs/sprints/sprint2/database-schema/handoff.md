# Database Schema — Implementation Handoff

**Sprint:** 2
**Task:** Database Schema (0/4 complete)
**Status:** Design complete, ready for implementation

---

## TL;DR

The schema design is done. You have a phased implementation plan in `phased-schema.md` with 19 tables for Sprint 2. Start with the `[DB]` phase migration, then `[ADMIN]`, then `[PUBLIC]`. Stripe is stretch.

---

## Checklist Items

From `checklist.md`:

```
## Database Schema (0/4)
- [ ] Create core schema migration
- [ ] Implement RLS policies
- [ ] Generate TypeScript types from schema
- [ ] Seed DivineTime org + Luca admin
```

---

## Document Hierarchy

| Document | Purpose | Status |
|----------|---------|--------|
| `frd/frd-01-database-schema.md` | Original FRD spec (simplified schema) | Superseded |
| `divine-time-reference-schema.md` | DivineTime's existing Prisma schema | Reference |
| `scoping-questions.md` | Design decisions & constraints | Complete |
| `schema-proposal-V1.md` | First complete schema proposal (34 tables) | Superseded |
| `reviews/codex-review-R1.md` | Round 1 review feedback | Resolved |
| `reviews/codex-review-R2.md` | Round 2 review feedback | Resolved |
| `reviews/schema-proposed-changelog.md` | All changes with Why/Before/After | Reference |
| `schema-proposal-V2.md` | Final northstar schema (34 tables) | Canonical |
| `phased-schema.md` | Sprint 2 minimum schema (19 tables) | **Use This** |

**Start with:** `phased-schema.md` — this is the implementation spec for Sprint 2.

---

## FRD vs Actual Schema

The original FRD (`frd-01-database-schema.md`) defined a simpler 6-table schema:
- organizations, profiles, camps, players, registrations, transactions

We expanded this based on DivineTime's existing production schema and future requirements:
- 34 tables in the full V2 schema
- 19 tables for Sprint 2 (phased approach)

**Key terminology mapping:**

| FRD Term | V2 Term | Notes |
|----------|---------|-------|
| organizations | academies | Multi-tenant org structure |
| camps | events | Supports CAMP and CLINIC types |
| players | athletes | With guardian relationships |
| registrations | event_registrations | With ticket tiers, pricing snapshots |
| transactions | payments + refunds + payouts | Separated by concern |
| profiles.roles[] | user_roles table | Join table for multi-role |

---

## What Was Designed

### V2 Schema Highlights

1. **34 MVP tables** covering:
   - User identity (profiles, user_roles)
   - Athletes & guardians (with PII separation)
   - Coaches & academies (with approval workflow)
   - Events, tickets, registrations
   - Payments, refunds, payouts (Stripe Connect)
   - Waivers with versioning
   - Reviews, notifications, analytics

2. **8 Postgres ENUM types** for type safety

3. **RLS policies** for multi-tenant security

4. **Triggers** for updated_at timestamps

5. **Security-definer RPCs** for atomic operations

### Phased Schema (Sprint 2)

The full V2 schema is too much for one sprint. `phased-schema.md` breaks it into phases matching the checklist:

| Phase | Tables | What It Enables |
|-------|--------|-----------------|
| `[DB]` | 3 | profiles, user_roles, sports — auth foundation |
| `[AUTH]` | 0 | Uses DB phase tables |
| `[ADMIN]` | 6 | academies, events, tickets — camp CRUD |
| `[PUBLIC]` | 7 | athletes, registrations, waivers — registration flow |
| `[STRIPE]` | 3 | payments, refunds, payouts — stretch goal |
| **Total** | **19** | 56% of V2 schema |

**Deferred (15 tables):** coaches, coach_*, specialties, reviews, notifications, calendar_integrations, analytics, promo_codes, etc.

---

## Implementation Steps

### Step 1: Create Core Migration (`[DB]` phase)

Create a Supabase migration with:

```sql
-- 1. ENUMs
CREATE TYPE user_role AS ENUM ('PARENT', 'ATHLETE', 'COACH', 'ACADEMY_ADMIN', 'SUPER_ADMIN', 'STAFF');

-- 2. Tables
CREATE TABLE profiles (...);  -- See phased-schema.md for full DDL
CREATE TABLE user_roles (...);
CREATE TABLE sports (...);

-- 3. Triggers
CREATE FUNCTION set_updated_at() ...;
CREATE TRIGGER trg_profiles_updated_at ...;

-- 4. Indexes
CREATE UNIQUE INDEX idx_sports_slug ON sports(slug) WHERE deleted_at IS NULL;

-- 5. RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select ON profiles FOR SELECT USING (true);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (id = auth.uid());
-- ... etc
```

### Step 2: Add Admin Tables (`[ADMIN]` phase)

```sql
-- ENUMs
CREATE TYPE event_status AS ENUM ('draft', 'published', 'canceled', 'completed');
CREATE TYPE location_visibility AS ENUM ('public', 'private');

-- Tables
CREATE TABLE academies (...);
CREATE TABLE academy_admins (...);
CREATE TABLE locations (...);
CREATE TABLE events (...);
CREATE TABLE event_days (...);
CREATE TABLE event_tickets (...);

-- Triggers, indexes, RLS per phased-schema.md
```

### Step 3: Add Public Tables (`[PUBLIC]` phase)

```sql
-- ENUMs
CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'canceled', 'refunded', 'completed');

-- Tables
CREATE TABLE athletes (...);
CREATE TABLE athlete_guardians (...);
CREATE TABLE athlete_medical (...);
CREATE TABLE waivers (...);
CREATE TABLE event_waivers (...);
CREATE TABLE waiver_signatures (...);
CREATE TABLE event_registrations (...);

-- RPCs
CREATE FUNCTION reserve_ticket(p_ticket_id uuid) ...;
```

### Step 4: Generate TypeScript Types

After migrations are applied:

```bash
npx supabase gen types typescript --project-id <project-id> > src/lib/database.types.ts
```

Or if using local Supabase:

```bash
npx supabase gen types typescript --local > src/lib/database.types.ts
```

### Step 5: Seed Data

```sql
-- Sports lookup data
INSERT INTO sports (name, slug, is_active) VALUES
  ('Soccer', 'soccer', true),
  ('Basketball', 'basketball', true),
  -- ... etc

-- DivineTime academy (after Luca signs up via auth)
INSERT INTO academies (name, slug, description, email)
VALUES ('DivineTime Training', 'divinetime', 'Elite soccer training in the Bay Area', 'info@joindivinetime.com');

-- Link Luca as owner
INSERT INTO academy_admins (academy_id, user_id, role)
SELECT a.id, p.id, 'owner'
FROM academies a, profiles p
WHERE a.slug = 'divinetime' AND p.id = '<luca-user-id>';

INSERT INTO user_roles (user_id, role, is_primary)
VALUES ('<luca-user-id>', 'ACADEMY_ADMIN', true);
```

---

## Key Design Decisions

These are documented in `scoping-questions.md` and review files:

| Decision | Choice | Why |
|----------|--------|-----|
| Auth | Supabase Auth | No custom auth tables needed |
| Soft deletes | `deleted_at TIMESTAMPTZ` | No `is_deleted` boolean |
| Status fields | Postgres ENUMs | Type safety, no typos |
| Multi-role | `user_roles` join table | User can be PARENT + COACH |
| PII separation | `athlete_medical` table | Stricter RLS for sensitive data |
| Reviews | Nullable FK pattern | Not polymorphic `reviewee_type` |
| OAuth tokens | Supabase Vault | Encrypted storage |
| Ticket overselling | Atomic RPC | `reserve_ticket()` with UPDATE...RETURNING |
| Waiver versioning | Append-only | `waiver_version` in signatures |

---

## RLS Policy Notes

Critical policies that were missing in early drafts (now fixed in v1.1):

1. **athlete_guardians** — Full CRUD for guardian themselves
2. **athletes INSERT** — Allowed before guardian link exists (app creates link immediately after)
3. **event_registrations INSERT/UPDATE** — For registration flow
4. **locations INSERT** — So admins can create locations

See `phased-schema.md` Section 5 for all RLS policies.

---

## Files to Create

```
supabase/
  migrations/
    20260107000000_db_phase.sql      # profiles, user_roles, sports
    20260107000001_admin_phase.sql   # academies, events, tickets
    20260107000002_public_phase.sql  # athletes, registrations, waivers
    20260107000003_stripe_phase.sql  # payments (stretch)
  seed.sql                           # sports + divinetime + luca
```

---

## Testing Checklist

After implementing, verify:

- [ ] Can create a user via Supabase Auth → profile auto-created
- [ ] Can assign roles via user_roles
- [ ] Can create an academy and link an admin
- [ ] Can create events with tickets
- [ ] Can create athletes and guardian links
- [ ] Can register an athlete for an event
- [ ] RLS prevents cross-tenant data access
- [ ] TypeScript types generated and usable

---

## Questions / Blockers

None currently. Schema design is complete and reviewed.

If you hit issues:
1. Check `phased-schema.md` for the exact DDL
2. Check `schema-proposal-V2.md` for full table descriptions
3. Check `reviews/schema-proposed-changelog.md` for design rationale

---

## Related FRDs

The database schema supports these Sprint 2 features:

| FRD | Tables Used |
|-----|-------------|
| FRD-02 Authentication | profiles, user_roles |
| FRD-03 Camp Management | academies, academy_admins, events, event_days, event_tickets |
| FRD-04 Registration Roster | event_registrations, athletes |
| FRD-05 Camp Discovery | events (published), sports, locations |
| FRD-06 Registration Flow | athletes, athlete_guardians, athlete_medical, event_registrations, waivers, waiver_signatures |
| FRD-07 Parent Dashboard | profiles, athletes, event_registrations |

---

*Handoff created: 2026-01-07*
*Schema version: V2 / Phased v1.1*
