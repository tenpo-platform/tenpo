# Tenpo Schema Proposal — Consolidated Changelog

> **Summary:** All agreed schema changes from Codex Review Round 1 and Round 2, ready for implementation.

---

## New Tables

### `invites`
**Why:** The original schema described an invite flow (academy admins invite coaches via unique links) but had no table to store the invite tokens, track who sent them, or enforce expiration.

**Before:** Invite links were conceptual only. No way to generate, validate, or expire invite tokens. No audit trail of who invited whom.

**After:** New `invites` table stores invite tokens with expiration dates, tracks which admin sent the invite, and records when/if the invite was accepted.

```
invites (id, type, token, email, invited_by, academy_id, expires_at, accepted_at, created_at)
```

| Source | R1 #4 |

---

### `coach_sports`
**Why:** Coaches can work with multiple sports, but the only way to associate a coach with a sport was through specialties. A "general soccer coach" with no specialty had no way to indicate they coach soccer at all.

**Before:** `coach_specialties` linked coaches to specialties (which belong to sports). A coach without specialties couldn't be associated with any sport.

**After:** New `coach_sports` junction table directly links coaches to sports. A coach can be a "Soccer specialist in goalkeeping" AND a "Basketball generalist" (no specialties).

```
coach_sports (coach_id FK, sport_id FK, created_at) — PK: (coach_id, sport_id)
```

| Source | R1 #8 |

---

### `athlete_medical`
**Why:** Medical information (conditions, allergies, emergency contacts) is sensitive PII that requires stricter access control than general athlete profiles. Mixing PII with regular profile data makes it hard to enforce different RLS policies.

**Before:** `athletes` table contained `medical_conditions`, `allergies`, and `emergency_contact` columns alongside general profile info. Anyone who could read an athlete's profile could see their medical data.

**After:** Medical/emergency data moves to a separate `athlete_medical` table with stricter RLS. Only guardians and event staff (during active events) can access this data. General athlete profiles become more widely visible without leaking PII.

```
athlete_medical (id, athlete_id FK, medical_conditions JSONB, allergies text[], emergency_contact JSONB, created_at, updated_at)
```

| Source | R2 #4 |

---

## New ENUMs

### `user_role`
**Why:** Roles were described as an enum in documentation but stored as free text. Nothing prevented typos like `'COASH'` or `'admin'` from being inserted.

**Before:** `user_roles.role` was a text column. Any string could be inserted.

**After:** Postgres ENUM type enforces only valid roles can be stored.

```sql
CREATE TYPE user_role AS ENUM ('PARENT', 'ATHLETE', 'COACH', 'ACADEMY_ADMIN', 'SUPER_ADMIN', 'STAFF');
```

| Source | R2 #7 |

---

### `event_status`
**Why:** Event statuses were stored as text with no validation. Different spellings (`cancelled` vs `canceled`) could cause bugs.

**Before:** `events.status` was text. Any value could be inserted.

**After:** Postgres ENUM with American spelling (`canceled`) to match Stripe's conventions.

```sql
CREATE TYPE event_status AS ENUM ('draft', 'published', 'canceled', 'completed');
```

| Source | R2 #14 |

---

### `registration_status`
**Why:** Same as above — no validation on status values. Also missing `completed` status which is needed to determine when athletes are eligible to leave reviews.

**Before:** `event_registrations.status` was text.

**After:** ENUM with `completed` status added for review eligibility tracking.

```sql
CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'canceled', 'refunded', 'completed');
```

| Source | R2 #14 |

---

### `payment_status`
**Why:** Payment statuses should align with Stripe's terminology to reduce confusion and mapping logic.

**Before:** Text column with application-defined values.

**After:** ENUM aligned with Stripe status names.

```sql
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
```

| Source | R2 #14 |

---

### `refund_status`
**Why:** Refund workflow has distinct states that should be enforced at the database level.

**Before:** Text column.

**After:** ENUM with workflow states.

```sql
CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
```

| Source | R2 #14 |

---

### `approval_status`
**Why:** Coach and academy approval was a simple boolean (`is_approved`), but we need to distinguish between "pending review," "approved," and "rejected" states. Rejected accounts may appeal or reapply.

**Before:** `coaches.is_approved` and `academies.is_approved` were booleans. No way to represent "rejected" or track rejection history.

**After:** ENUM with three states replaces boolean.

```sql
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
```

| Source | R2 #17 |

---

### `location_visibility`
**Why:** Locations needed explicit visibility rules. The requirement says creators can edit their locations while others can select from "available" ones, but "available" wasn't defined.

**Before:** All locations were implicitly public with no visibility setting.

**After:** Explicit visibility setting. Public locations can be used by anyone; private locations only by their creator.

```sql
CREATE TYPE location_visibility AS ENUM ('public', 'private');
```

| Source | R2 #12 |

---

### `payment_source`
**Why:** Free events need payment records for a uniform audit trail, but we can't require a Stripe payment intent ID for free registrations. We need to distinguish "real" Stripe payments from free or comped registrations.

**Before:** Every payment was assumed to be a Stripe charge. Free events would either have no payment record (inconsistent) or a fake Stripe ID (wrong).

**After:** `payment_source` indicates how the "payment" was made: actual Stripe charge, free event ($0), or admin comp.

```sql
CREATE TYPE payment_source AS ENUM ('stripe', 'free', 'comp');
```

| Source | R1 #1 |

---

## Column Additions

### On `payments`

#### `payment_source`
**Why:** See `payment_source` ENUM above. Allows $0 payment records for free events.

**Before:** All payments assumed to be Stripe charges.

**After:** Can distinguish Stripe payments from free/comped registrations.

| Source | R1 #1 |

---

### On `events`

#### `timezone`
**Why:** Events inherit timezone from their location, but if someone edits a location's timezone later, all past events would retroactively shift times. This is confusing and potentially wrong.

**Before:** Event times were interpreted using `locations.timezone`. Changing a location's timezone affected all events at that location, past and future.

**After:** `events.timezone` is copied from the location when the event is created. Each event has its own frozen timezone that doesn't change if the location is edited.

| Source | R1 #5 |

#### `created_by`
**Why:** For RLS policies and audit trails, we need to know which user created each event. "Who made this?" is a common support question.

**Before:** Events were owned by academies (`academy_id`) but we didn't track which admin created them.

**After:** `created_by` records the user who created the event.

| Source | R1 #6 |

---

### On `waivers`

#### `created_by`
**Why:** Same audit trail reasoning as events.

**Before:** Waivers had `academy_id` or `coach_id` for ownership but no record of who created them.

**After:** `created_by` tracks the creator.

| Source | R1 #6 |

---

### On `waiver_signatures`

#### `waiver_version`
**Why:** If a waiver is edited after someone signs it, we need to know what version they actually signed. Without this, updating a typo in a waiver could invalidate all existing signatures from a legal perspective.

**Before:** Signatures linked to waivers but didn't record which version was signed. Editing a waiver meant existing signatures were for content that no longer exists.

**After:** Each signature records the waiver version that was signed. Waivers become append-only (new version = new row).

| Source | R2 #2 |

#### `signed_by_user_id`
**Why:** For minors, a guardian signs the waiver on their behalf. For adults (future), they sign themselves. We need to distinguish who actually signed.

**Before:** Signatures recorded which athlete the waiver was for but not who performed the signing action.

**After:** `signed_by_user_id` records the actual signer (guardian or self).

| Source | R2 #2 |

---

### On `event_registrations`

#### `price_paid_cents`, `ticket_price_cents`, `discount_cents`, `fees_cents`, `currency`
**Why:** If ticket prices change after someone registers, we need to know what they actually paid. Looking up the current ticket price would give wrong answers for refunds, receipts, and financial reporting.

**Before:** Registration linked to a ticket tier, and we'd look up `event_tickets.price` to know what they paid. If the price changed, historical records were wrong.

**After:** Price information is captured at purchase time. We know exactly what was charged regardless of future price changes.

| Source | R2 #5 |

#### `promo_code_id`
**Why:** To track which promo code was used for a registration (for analytics and to prevent reuse if limited).

**Before:** Discounts weren't tracked at the registration level.

**After:** Link to the promo code that was applied.

| Source | R2 #5 |

---

### On `promo_codes`

#### `created_by`
**Why:** Audit trail — who created this promo code?

**Before:** Promo codes had `academy_id` for ownership but no creator tracking.

**After:** `created_by` records the creator.

| Source | R1 #6 |

---

### On `coaches`

#### `approval_status`, `approved_by`, `approved_at`, `rejected_by`, `rejected_at`, `review_notes`
**Why:** Coach approval is a critical workflow. We need to track not just whether someone is approved, but who approved/rejected them, when, and why (for appeals and audits).

**Before:** `is_approved` boolean only. No record of who approved, when, or any notes. No way to represent "rejected."

**After:** Full approval workflow tracking with status, timestamps, actors, and notes.

| Source | R1 #4, R2 #17 |

---

### On `academies`

#### `approval_status`, `approved_by`, `approved_at`, `rejected_by`, `rejected_at`, `review_notes`
**Why:** Same as coaches — academies go through a similar approval workflow.

**Before:** `is_approved` boolean only.

**After:** Full approval workflow tracking.

| Source | R1 #4, R2 #17 |

---

### On `locations`

#### `visibility`
**Why:** Control who can use a location when creating events.

**Before:** All locations implicitly public.

**After:** Explicit public/private visibility.

| Source | R2 #12 |

---

### On `calendar_integrations`

#### `vault_secret_id`
**Why:** OAuth tokens are sensitive credentials that shouldn't be stored in regular database columns where they could be exposed via queries.

**Before:** `access_token` and `refresh_token` stored directly in the table.

**After:** Tokens stored in Supabase Vault (encrypted secret storage). Table only stores a reference ID.

| Source | R2 #11 |

---

### On `payouts`

#### `event_id`, `payment_id`, `stripe_balance_transaction_id`, `platform_fee`
**Why:** For financial reconciliation, we need to trace payouts back to their source. "This $500 payout — where did it come from?"

**Before:** Payouts had amount and Stripe transfer ID but no link to the originating event or payment.

**After:** Full traceability from payout back to event and payment.

| Source | R1 #11 |

---

## Column Modifications

### `payments.stripe_payment_intent_id` → nullable
**Why:** Free events use $0 payment records for consistency, but free payments don't have Stripe payment intents.

**Before:** `stripe_payment_intent_id` was NOT NULL. Free events couldn't have payment records.

**After:** Nullable. Free/comp payments have NULL here and use `payment_source` to indicate why.

| Source | R1 #1 |

---

### Status columns → ENUMs
**Why:** Replace free-text status fields with type-safe ENUMs.

**Before:** `user_roles.role`, `events.status`, `event_registrations.status`, `payments.status`, `refunds.status` were all text.

**After:** Each uses its corresponding ENUM type.

| Source | R2 #7, R2 #14 |

---

## Column Removals

### `events.max_capacity`
**Why:** Having both `events.max_capacity` AND `event_tickets.capacity` created two sources of truth. Which one wins if they conflict?

**Before:** Events had a max capacity AND each ticket tier had a capacity. Unclear how they related.

**After:** Ticket tier capacities are the source of truth for event capacity. If a venue has a hard cap, it's stored on `locations.capacity` and validated at publish time.

| Source | R1 #2 |

---

### `event_registrations.waiver_signed`
**Why:** A single boolean can't represent "all required waivers signed" when events can have multiple waivers.

**Before:** `waiver_signed` boolean. Made sense when events had one implicit waiver, but we added multi-waiver support (`event_waivers` table) and this boolean became meaningless.

**After:** Remove the boolean. Waiver completion is computed by checking if all required waivers in `event_waivers` have corresponding signatures in `waiver_signatures`.

| Source | R1 #3 |

---

### `profiles.email`
**Why:** Email is stored in `auth.users` (Supabase Auth). Duplicating it in `profiles` means it can drift out of sync if users change their email.

**Before:** Email stored in both `auth.users` and `profiles`. If a user changed their email in Auth, `profiles.email` would be wrong.

**After:** Remove `profiles.email`. Join to `auth.users` when needed. For admin search, use a security-definer RPC.

| Source | R2 #8 |

---

### PII columns from `athletes`
**Why:** Moved to `athlete_medical` table for stricter RLS (see New Tables section).

**Before:** `medical_conditions`, `allergies`, `emergency_contact` on `athletes` table.

**After:** These columns move to `athlete_medical` with separate, stricter access policies.

| Source | R2 #4 |

---

### `reviews.reviewee_type` and `reviews.reviewee_id`
**Why:** Polymorphic associations (type + ID columns) can't have foreign key constraints, making it possible to have reviews pointing to non-existent records.

**Before:** `reviewee_type` ('coach', 'academy', 'athlete') + `reviewee_id` with no FK enforcement. App had to validate references manually.

**After:** Replace with nullable FK columns (`reviewee_profile_id`, `reviewee_academy_id`) with a CHECK constraint that exactly one is set. Database enforces referential integrity.

| Source | R2 #3 |

---

### `coaches.is_approved` and `academies.is_approved`
**Why:** Replaced by `approval_status` ENUM which can represent pending/approved/rejected.

**Before:** Boolean `is_approved`.

**After:** `approval_status` ENUM with richer state.

| Source | R2 #17 |

---

### `is_deleted` (all soft-delete tables)
**Why:** Having both `is_deleted` boolean AND `deleted_at` timestamp is redundant and can drift out of sync.

**Before:** Tables had both `is_deleted BOOLEAN` and `deleted_at TIMESTAMPTZ`. Had to keep them in sync.

**After:** Only `deleted_at`. A record is deleted if `deleted_at IS NOT NULL`. Simpler, no sync issues.

| Source | R2 #16 |

---

### `calendar_integrations.access_token` and `refresh_token`
**Why:** Moved to Supabase Vault for security (see `vault_secret_id` addition).

**Before:** OAuth tokens stored as plain text columns.

**After:** Tokens in Vault, only a reference ID in the table.

| Source | R2 #11 |

---

## Structural Changes

### `reviews` table refactor
**Why:** Replace brittle polymorphic design with proper foreign keys.

**Before:**
```sql
reviewee_type TEXT      -- 'coach', 'academy', 'athlete'
reviewee_id UUID        -- ID in that table (no FK constraint!)
```

**After:**
```sql
reviewee_profile_id UUID REFERENCES profiles(id)   -- for coach/athlete reviews
reviewee_academy_id UUID REFERENCES academies(id)  -- for academy reviews

CHECK ((reviewee_profile_id IS NOT NULL)::int + (reviewee_academy_id IS NOT NULL)::int = 1)
```

| Source | R2 #3 |

---

### `waivers` append-only pattern
**Why:** Edited waivers shouldn't invalidate existing signatures.

**Before:** Waivers could be edited in place. Existing signatures then pointed to different content than what was signed.

**After:** Waivers are immutable. To "edit," soft-delete the old version and create a new row. Existing signatures stay valid for their version.

| Source | R2 #2 |

---

### Soft delete simplification
**Why:** Simpler model with one field instead of two.

**Before:**
```sql
is_deleted BOOLEAN DEFAULT FALSE
deleted_at TIMESTAMPTZ
```

**After:**
```sql
deleted_at TIMESTAMPTZ  -- NULL = active, non-NULL = deleted
```

Query pattern: `WHERE deleted_at IS NULL` for active records.

| Source | R2 #16 |

---

## Constraints

### Unique payment per registration
**Why:** MVP rule is one registration per checkout. Multiple registrations shouldn't share a payment.

**Before:** `event_registrations.payment_id` could have duplicates (multiple registrations pointing to same payment).

**After:** Partial unique index ensures each payment is used by at most one registration.

```sql
CREATE UNIQUE INDEX ON event_registrations(payment_id) WHERE payment_id IS NOT NULL;
```

| Source | R1 #1 |

---

### Unique waiver signature per athlete/event/version
**Why:** Prevent duplicate signatures (signing the same waiver twice for the same event).

**Before:** No uniqueness constraint on signatures.

**After:** One signature per waiver-athlete-event-version combination.

```sql
UNIQUE(waiver_id, athlete_id, event_id, waiver_version)
```

| Source | R1 #3, R2 #2 |

---

### Partial unique indexes for soft-deleted slugs
**Why:** If an academy with slug `bay-area-soccer` is soft-deleted, we should be able to reuse that slug for a new academy.

**Before:** `UNIQUE(slug)` prevented reuse even for deleted records.

**After:** Uniqueness only enforced for active (non-deleted) records.

```sql
CREATE UNIQUE INDEX ON academies(slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX ON sports(slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX ON specialties(slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX ON events(academy_id, slug) WHERE deleted_at IS NULL;
```

| Source | R1 #9 |

---

### Reviews: exactly one reviewee
**Why:** Ensure the new FK-based review design always has exactly one target.

**Before:** N/A (new constraint for new design).

**After:** CHECK constraint ensures exactly one of the nullable FKs is set.

```sql
CHECK ((reviewee_profile_id IS NOT NULL)::int + (reviewee_academy_id IS NOT NULL)::int = 1)
```

| Source | R2 #3 |

---

## Indexes

**Why:** Without indexes, RLS policies can become extremely slow as data grows. These indexes support the most common query patterns.

### Event discovery
```sql
CREATE INDEX ON events(academy_id, status, sport_id) WHERE deleted_at IS NULL;
CREATE INDEX ON events(location_id) WHERE deleted_at IS NULL;
```
Supports: "Show me published soccer events for this academy"

### Registration lookups
```sql
CREATE INDEX ON event_registrations(event_id, status);
CREATE INDEX ON event_registrations(athlete_id);
CREATE INDEX ON event_registrations(created_at);
```
Supports: "Who's registered for this event?", "What events has this athlete attended?", admin date filters

### Payment reconciliation
```sql
CREATE INDEX ON payments(user_id, status);
CREATE INDEX ON payments(event_id);
CREATE INDEX ON payments(created_at);
```
Supports: "Show this user's payment history", "Show payments for this event", date-based reports

### Reviews
```sql
CREATE INDEX ON reviews(reviewee_profile_id) WHERE reviewee_profile_id IS NOT NULL;
CREATE INDEX ON reviews(reviewee_academy_id) WHERE reviewee_academy_id IS NOT NULL;
```
Supports: "Show reviews for this coach/academy"

| Source | R1 #10, R2 #15 |

---

## RLS Policies

### `athletes` MVP constraint
**Why:** MVP doesn't support adult self-managed athletes. Enforce this at the data level to prevent bypass via direct Supabase client access.

**Before:** No enforcement — app was supposed to not set `user_id`, but nothing stopped it.

**After:** RLS policy rejects any INSERT/UPDATE where `user_id IS NOT NULL`. When we're ready for adult athletes, just remove this policy.

| Source | R1 #12 |

---

### `athletes` guardian requirement
**Why:** Every athlete must have at least one guardian (for MVP where all athletes are minors).

**Before:** Could create an orphan athlete with no guardians.

**After:** Policy or trigger ensures at least one `athlete_guardians` row exists.

| Source | R1 #12 |

---

### `athlete_medical` strict access
**Why:** Medical data should only be visible to guardians and event staff who need it.

**Before:** N/A (new table).

**After:** Access limited to:
- Guardians (via `athlete_guardians` relationship)
- Event coaches/staff (only when athlete is registered for an active event)

| Source | R2 #4 |

---

### `locations` visibility
**Why:** Enforce the visibility rules we defined.

**Before:** All locations visible to everyone.

**After:**
- SELECT: Can see public locations OR locations you created
- UPDATE/DELETE: Only creator can modify

| Source | R2 #12 |

---

### `calendar_integrations` ownership
**Why:** Users should only see their own calendar integrations.

**Before:** Assumed RLS but not specified.

**After:** Explicit policy: `auth.uid() = user_id`

| Source | R2 #11 |

---

## Triggers & Functions

### `set_updated_at()`
**Why:** Every table with `updated_at` needs it automatically updated on changes. One shared function instead of copy-pasting.

**Before:** Each table would need its own trigger (or rely on app to set it).

**After:** Shared trigger function applied to all relevant tables.

```sql
CREATE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

| Source | R2 #15 |

---

### `validate_coach_role()`
**Why:** The `coaches` table should only contain users who have the COACH role. Without enforcement, you could have a coach profile for someone who isn't actually a coach.

**Before:** No validation — could INSERT into `coaches` for any user.

**After:** BEFORE INSERT trigger checks that the user has COACH role in `user_roles`.

| Source | R2 #7 |

---

### `validate_academy_admin_role()`
**Why:** Same as above, for academy admins.

**Before:** No validation.

**After:** BEFORE INSERT trigger checks for ACADEMY_ADMIN role.

| Source | R2 #7 |

---

## Security-Definer Functions (RPCs)

### `search_users_by_email(query text)`
**Why:** We removed `profiles.email` but admins still need to search users by email. `auth.users` isn't client-readable, so we need a privileged function.

**Before:** Could query `profiles.email` directly.

**After:** Admin-only RPC that joins to `auth.users` using elevated privileges.

| Source | R2 #8 |

---

### `get_calendar_tokens(integration_id uuid)`
**Why:** OAuth tokens are in Vault, not directly queryable. Server-side code needs a way to retrieve them.

**Before:** Could SELECT tokens directly from table.

**After:** Server-only function that retrieves tokens from Vault.

| Source | R2 #11 |

---

### `reserve_ticket(ticket_id uuid)`
**Why:** Ticket sales can have race conditions — two people buying the last ticket simultaneously. Need atomic reservation.

**Before:** App would read `quantity_sold`, check capacity, then update. Race condition between read and write.

**After:** Single atomic UPDATE that increments and checks capacity in one statement:
```sql
UPDATE event_tickets
SET quantity_sold = quantity_sold + 1
WHERE id = $1 AND quantity_sold < capacity
RETURNING id;
```
If no row returned, ticket is sold out.

| Source | R2 #6 |

---

## App-Level Validations

### Publish-time capacity check
**Why:** If a venue has a fire code capacity of 100, the sum of ticket tiers shouldn't exceed that.

**Before:** No validation. Could create 500 tickets for a 100-person venue.

**After:** When publishing an event, validate: `SUM(event_tickets.capacity) <= locations.capacity`

| Source | R1 #2 |

---

### Waiver completion check
**Why:** Need to know if an athlete has completed all required waivers for an event.

**Before:** Checked `event_registrations.waiver_signed` boolean (broken for multi-waiver).

**After:** Compute by checking: for every required waiver in `event_waivers`, there exists a signature in `waiver_signatures` for this athlete/event.

| Source | R1 #3 |

---

### PII access audit
**Why:** For compliance and security, track who accessed medical data and when.

**Before:** No tracking.

**After:** App-level logging when `athlete_medical` data is read.

| Source | R2 #4 |

---

## Deferred for Post-MVP

| Item | Why Deferred | Source |
|------|--------------|--------|
| `event_tracks` table | Multi-track events (morning session + afternoon session running concurrently) are rare. If needed, model as separate events grouped by `series_id`. | R2 #1 |
| `event_days` timestamptz | Current date+time+timezone approach works for MVP. Add computed timestamptz columns later for calendar sync / reminders. | R2 #9 |
| `location_shares` table | Sharing locations between academies is a future feature. | R2 #12 |
| `promo_code_snapshot` | Can reconstruct promo details from Stripe if needed for historical records. | R2 #5 |
| `tax_cents` on registrations | Stripe Tax handles calculation; we don't need to store it separately for MVP. | R2 #5 |

---

## Migration Checklist

- [ ] Create new ENUMs (8 total)
- [ ] Create `invites` table
- [ ] Create `coach_sports` table
- [ ] Create `athlete_medical` table
- [ ] Add columns to existing tables
- [ ] Migrate data from `athletes` PII columns to `athlete_medical`
- [ ] Migrate `is_approved` boolean to `approval_status` ENUM
- [ ] Migrate `is_deleted` to `deleted_at` pattern
- [ ] Remove deprecated columns
- [ ] Refactor `reviews` table structure
- [ ] Create partial unique indexes for soft-delete slugs
- [ ] Create performance indexes
- [ ] Create `set_updated_at()` trigger function and apply to all tables
- [ ] Create role validation triggers
- [ ] Create security-definer RPCs
- [ ] Configure RLS policies
- [ ] Set up Supabase Vault for OAuth tokens
- [ ] Update app code for new ENUMs and column names

---

## Change Summary

| Category | Count |
|----------|-------|
| New tables | 3 |
| New ENUMs | 8 |
| Column additions | 30+ |
| Column removals | 15+ |
| New indexes | 10+ |
| New constraints | 6+ |
| RLS policies | 6+ |
| Triggers/functions | 3 |
| Security-definer RPCs | 3 |
