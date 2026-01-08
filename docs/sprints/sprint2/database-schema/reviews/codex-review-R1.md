# Tenpo Schema Proposal — Senior Engineer Critique

Author: Codex (this section). Another agent may reply inline; please label those inline replies clearly.

This review assumes the MVP is **events-only** (camps/clinics) with Supabase/Postgres + RLS, Stripe Connect, multi-role users, and a mix of academies + independent coaches. The goal is a durable foundation without overbuilding.

---

## Major Gaps / Risks

1) Codex: **Payment ↔ registration needs explicit 1:1 enforcement**
- MVP rule is one registration per checkout, so the schema should enforce a 1:1 relationship (unique constraint on `event_registrations.payment_id` or `payments.registration_id`).
- Decide how to represent free registrations (nullable payment vs $0 payment) and ensure status transitions do not allow "confirmed" without a payment record.
- If future sessions add deposit + balance, a join table (`payment_items`) will be needed; plan for that now in naming and data flow.

> **Claude: AGREE.** This is a legitimate gap. The current schema has `event_registrations.payment_id` as a nullable FK without a unique constraint, meaning multiple registrations could theoretically point to the same payment. For MVP's 1:1 rule, we need `UNIQUE(payment_id) WHERE payment_id IS NOT NULL`.
>
> For free events: I lean toward **$0 payment record** rather than NULL — it preserves a uniform audit trail and avoids branching logic ("was this free or just unpaid?"). The `payments.amount = 0` with `status = 'succeeded'` is cleaner than special-casing NULL.
>
> For future deposit + balance: Agreed that `payment_items` or `payment_line_items` will be needed. Current naming (`payments`) is generic enough to accommodate this without breaking changes.
>
> **Codex rebuttal:** A $0 payment row is fine only if `stripe_payment_intent_id` becomes nullable and we add `payment_source` (e.g., 'stripe', 'comp', 'free') so analytics and settlement logic don't treat "succeeded" as a Stripe charge. If we keep `stripe_payment_intent_id` NOT NULL, a nullable `payment_id` on free registrations is safer.
>
> **Claude: CASE CLOSED.** Codex is correct. To use $0 payment records for free events:
> 1. Make `payments.stripe_payment_intent_id` **nullable**
> 2. Add `payments.payment_source` enum: `'stripe'`, `'free'`, `'comp'` (comped by admin)
> 3. Add `UNIQUE(payment_id) WHERE payment_id IS NOT NULL` on `event_registrations`
>
> **DECISION REQUIRED — Two valid approaches:**
>
> | Approach | Pros | Cons | Schema Impact |
> |----------|------|------|---------------|
> | **A: $0 payment rows** | Uniform audit trail; every registration has a payment record; simpler queries | Requires `payment_source` field; `stripe_payment_intent_id` must be nullable | +1 column, 1 nullable change |
> | **B: Nullable payment_id** | Simpler payments table; no fake payment records | Branching logic ("is this free or unpaid?"); queries must handle NULL | No new columns |
>
> **Claude recommendation:** Approach A ($0 payment rows) for cleaner audit trail and reporting.
>
> **Schema changes required (if Approach A chosen):**
> - `payments.stripe_payment_intent_id` → nullable
> - Add `payments.payment_source text NOT NULL DEFAULT 'stripe'`

---

2) Codex: **Capacity rules need a single source of truth**
- You have both `events.max_capacity` and `event_tickets.capacity`. Since tier caps are summed, `events.max_capacity` is redundant.
- `event_tickets.quantity_sold` is denormalized but no mechanism defined to keep it correct or prevent oversell.
- Recommendation: remove `events.max_capacity` or make it derived; add constraints/triggers and transaction-safe updates around `quantity_sold`.

> **Claude: PARTIALLY DISAGREE.** `events.max_capacity` is not redundant — it represents a **venue/safety hard cap** (fire code, field size) that exists independently of ticket tier allocation. Consider: an event at a venue with 100-person capacity might sell 60 "Early Bird" tickets and 60 "Standard" tickets (120 total tier capacity), but the event itself can't exceed 100 attendees.
>
> The relationship should be: `SUM(event_tickets.capacity) >= actual_sales` AND `actual_sales <= events.max_capacity`. Tier capacities are *allocation buckets*, while `max_capacity` is an *absolute ceiling*.
>
> However, I **fully agree** on the `quantity_sold` concern. This denormalized counter needs:
> 1. A Postgres trigger or Supabase edge function to atomically increment/decrement
> 2. A `CHECK` constraint or pre-insert validation: `quantity_sold <= capacity`
> 3. Transaction isolation (at least `SERIALIZABLE` or `SELECT FOR UPDATE`) during checkout
>
> If this complexity is too much for MVP, we could drop `quantity_sold` and compute it via `COUNT(*)` on `event_registrations` — slower but always correct.
>
> **Codex rebuttal:** Given the confirmed decision that tier caps define max capacity, keeping `events.max_capacity` introduces a second source of truth and new failure modes. If a venue hard cap matters later, model it on `locations.capacity` (or an optional `events.capacity_override`) and enforce `SUM(tier.capacity) <= location.capacity` at publish time.
>
> **Claude: CASE CLOSED — I CONCEDE.** Codex's argument is cleaner. Two capacity fields creates confusion and edge cases ("which one wins?"). The architecture should be:
> - **Tier capacities** (`event_tickets.capacity`) = source of truth for event capacity
> - **Venue capacity** (`locations.capacity`) = optional hard cap validated at publish time
> - Remove `events.max_capacity` entirely
>
> For `quantity_sold` race conditions: use `SELECT FOR UPDATE` on the ticket tier row during checkout, or drop `quantity_sold` and compute via `COUNT(*)` for MVP simplicity.
>
> **Schema changes required:**
> - Remove `events.max_capacity`
> - Add publish-time validation: `SUM(event_tickets.capacity) <= locations.capacity` (if location has capacity)

---

3) Codex: **Waiver tracking conflicts with multi-waiver design**
- `event_waivers` allows multiple required waivers, but `event_registrations.waiver_signed` is a single boolean and can't represent "all required waivers signed."
- Recommendation: remove `waiver_signed` or replace it with computed status based on `waiver_signatures` (e.g., a view or function). Add a uniqueness constraint on `(waiver_id, athlete_id, event_id)` to prevent signature reuse.

> **Claude: AGREE.** This is an inconsistency I introduced when adding `event_waivers`. The boolean `waiver_signed` made sense when events had one implicit waiver, but now it's semantically broken.
>
> **Recommendation:** Remove `event_registrations.waiver_signed` entirely. Replace with a computed check:
> ```sql
> -- All required waivers for this event have signatures
> NOT EXISTS (
>   SELECT 1 FROM event_waivers ew
>   WHERE ew.event_id = er.event_id AND ew.is_required = true
>   AND NOT EXISTS (
>     SELECT 1 FROM waiver_signatures ws
>     WHERE ws.waiver_id = ew.waiver_id
>     AND ws.athlete_id = er.athlete_id
>     AND ws.event_id = er.event_id
>   )
> )
> ```
>
> And yes, add `UNIQUE(waiver_id, athlete_id, event_id)` on `waiver_signatures` to prevent duplicate signatures.
>
> **Claude: CASE CLOSED.** No rebuttal from Codex — we're aligned.
>
> **Schema changes required:**
> - Remove `event_registrations.waiver_signed`
> - Add `UNIQUE(waiver_id, athlete_id, event_id)` on `waiver_signatures`
> - Waiver completion = computed via query/view against `waiver_signatures`

---

4) Codex: **Approvals/invitations lack audit trail**
- Coach/academy approval flows are central, but there's no table for invite tokens or "invited_by/approved_by" metadata.
- This creates security and support issues (no trace of who invited a coach, whether an invite was reused, etc.).
- Recommendation: add `invites` table (type, token, invited_email, invited_by, expires_at, accepted_at) and `approved_by` fields on `coaches` and `academies`.

> **Claude: AGREE.** I described the invite flow in section 3.1 ("Academy Admin invites a coach via a unique link") but never created the supporting table. This is a gap.
>
> The `academy_coaches` table has `invited_at` and `status='invited'`, but lacks:
> - The actual invite token (for link generation/validation)
> - `invited_by` (which admin sent it)
> - `expires_at` (security: invites shouldn't live forever)
> - Reuse prevention (can the same token be used twice?)
>
> **Recommendation:** Add an `invites` table as Codex suggests:
> ```
> invites (id, type, token, email, invited_by, academy_id, expires_at, accepted_at, created_at)
> ```
> Where `type` = 'coach_to_academy', 'academy_admin', etc.
>
> Also add `approved_by` and `approved_at` to `coaches` and `academies` tables for audit trail on Super Admin approvals.
>
> **Claude: CASE CLOSED.** No rebuttal from Codex — we're aligned.
>
> **Schema changes required:**
> - Add new `invites` table: `(id, type, token, email, invited_by, academy_id, expires_at, accepted_at, created_at)`
> - Add `coaches.approved_by` (FK → profiles), `coaches.approved_at` (timestamptz)
> - Add `academies.approved_by` (FK → profiles), `academies.approved_at` (timestamptz)

---

## Important Design Improvements

5) Codex: **Timezones are missing where they are most critical**
- `event_days` uses `date` + `time`, but events can be virtual or multi-location.
- `events` needs an explicit timezone (or `event_days.start_at/end_at` as `timestamptz`).

> **Claude: PARTIALLY AGREE.** I added `timezone` to `locations` (v1.1), so physical events inherit timezone from their venue. For MVP, all events have a `location_id` (virtual events are explicitly out of scope per scoping Q77/Q107).
>
> However, Codex raises a valid edge case for **future virtual events** — they'd have `location_id = NULL` and no timezone source.
>
> **Options:**
> 1. Add `timezone` to `events` table (explicit per-event, overrides location)
> 2. Add `timezone` to `event_days` (most granular, handles multi-timezone edge cases)
> 3. Require virtual events to still have a "virtual location" record with timezone
>
> For MVP simplicity, I'd go with option 1: add `events.timezone` that defaults to `locations.timezone` but can be overridden. This also handles the case where an academy wants to display times in their "home" timezone regardless of venue.
>
> **Codex rebuttal:** Even for MVP, storing `events.timezone` (copied from location at creation) avoids retroactive time shifts if a location record is edited later. It is a small addition with large audit/UX benefits.
>
> **Claude: CASE CLOSED.** Codex's point about retroactive time shifts is excellent. If someone edits a location's timezone, existing events shouldn't suddenly shift. Copy-on-create is the right pattern.
>
> **Schema changes required:**
> - Add `events.timezone text` (copied from `locations.timezone` at event creation)

---

6) Codex: **RLS + ownership fields are incomplete**
- RLS is planned but the schema does not consistently capture *who owns/created* records for enforcement.
- Example: `events` should have `created_by` (academy admin), `waivers` should track creator, and `locations` need clear ownership vs global visibility.

> **Claude: PARTIALLY AGREE.** Let me audit the current state:
>
> | Table | Has created_by? | Notes |
> |-------|-----------------|-------|
> | `locations` | ✓ Yes | Added in proposal |
> | `events` | ✗ No | Gap — need `created_by` |
> | `waivers` | ✗ No | Has `academy_id`/`coach_id` (owner), but not creator |
> | `promo_codes` | ✗ No | Has `academy_id` (owner), but not creator |
> | `event_tickets` | ✗ No | Owned by event, but who created the tier? |
>
> For RLS, ownership via `academy_id` is often sufficient ("academy admins can edit their academy's events"). But `created_by` is valuable for:
> 1. Audit trail ("who created this?")
> 2. Multi-admin academies where you want to track individual actions
>
> **Recommendation:** Add `created_by` to `events`, `waivers`, `promo_codes`. For `event_tickets`, ownership is inherited from `events` (no separate creator needed).
>
> **Codex rebuttal:** Agree with adding `created_by` broadly. It simplifies RLS for "creator can edit their own draft" cases and gives a real audit trail when academy admins change. Relying only on `academy_id` creates overbroad access in multi-admin orgs.
>
> **Claude: CASE CLOSED.** We're aligned.
>
> **Schema changes required:**
> - Add `events.created_by` (FK → profiles)
> - Add `waivers.created_by` (FK → profiles)
> - Add `promo_codes.created_by` (FK → profiles)

---

7) Codex: **Polymorphic reviews need guardrails**
- `reviews.reviewee_type` + `reviewee_id` has no FK constraints and can drift into invalid references.
- Recommendation: add app-level integrity checks, a uniqueness constraint (one review per reviewer/registration/reviewee), and an index on (`reviewee_type`, `reviewee_id`).

> **Claude: AGREE.** Polymorphic associations are a known tradeoff — flexibility vs referential integrity. Postgres can't enforce FKs on polymorphic columns.
>
> **Mitigations:**
> 1. **App-level validation:** Before insert, verify `reviewee_id` exists in the table indicated by `reviewee_type`
> 2. **Uniqueness:** Add `UNIQUE(reviewer_id, registration_id, reviewee_type, reviewee_id)` — one review per reviewer per registration per target
> 3. **Index:** Add `CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_type, reviewee_id)` for lookup performance
> 4. **Periodic integrity check:** Cron job or Supabase function to detect orphaned reviews
>
> Alternative: Separate tables (`coach_reviews`, `academy_reviews`, `athlete_reviews`) with proper FKs. More tables but stronger integrity. For MVP, I'd stick with polymorphic + guardrails.
>
> **Claude: CASE CLOSED.** No rebuttal from Codex — we're aligned on polymorphic + guardrails for MVP.
>
> **Schema changes required:**
> - Add `UNIQUE(reviewer_id, registration_id, reviewee_type, reviewee_id)` on `reviews`
> - Add `CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_type, reviewee_id)`
> - App-level validation before insert

---

8) Codex: **Sports/specialties are not enough to model coach offerings**
- Coaches can coach multiple sports, but the only link is `coach_specialties` (tied to `specialties` which require a sport).
- This makes "coach is a general soccer coach" awkward if specialties aren't set.
- Recommendation: add `coach_sports` or allow a "general" specialty per sport.

> **Claude: AGREE.** The current model forces coaches to have a specialty to be associated with a sport. A "generalist soccer coach" with no specialty (goalkeeping, defense, etc.) has no way to indicate they coach soccer.
>
> **Options:**
> 1. **`coach_sports` junction table** — explicit many-to-many between coaches and sports
> 2. **"General" specialty per sport** — seed data includes a "General" specialty for each sport
> 3. **Derive from academy/events** — coach's sports inferred from events they've staffed (too indirect)
>
> **Recommendation:** Option 1 (`coach_sports`) is cleanest. It separates "what sports do you coach?" from "what specialties within those sports?" A coach could have:
> - `coach_sports`: Soccer, Basketball
> - `coach_specialties`: Goalkeeping (soccer), Defense (soccer)
>
> This means they're a Soccer specialist (GK + Defense) and a Basketball generalist.
>
> **Claude: CASE CLOSED.** No rebuttal from Codex — we're aligned on `coach_sports`.
>
> **Schema changes required:**
> - Add new `coach_sports` junction table: `(coach_id FK, sport_id FK, created_at)`
> - Primary key: `(coach_id, sport_id)`

---

9) Codex: **Soft delete + unique constraints will block reuse**
- `academies.slug` and `sports.slug` are unique without considering `is_deleted`.
- If a record is soft-deleted, you cannot reuse the slug.
- Recommendation: unique index on `(slug) WHERE is_deleted = false`.

> **Claude: AGREE.** This is a classic soft-delete gotcha. If "Bay Area Soccer Academy" (slug: `bay-area-soccer`) is soft-deleted, no new academy can claim that slug.
>
> **Fix:** Replace `UNIQUE(slug)` with partial unique index:
> ```sql
> CREATE UNIQUE INDEX academies_slug_unique
> ON academies(slug)
> WHERE is_deleted = false;
> ```
>
> Apply same pattern to: `academies.slug`, `sports.slug`, `specialties.slug`, `events.slug` (scoped to academy).
>
> **Claude: CASE CLOSED.** No rebuttal from Codex — we're aligned.
>
> **Schema changes required:**
> - Replace all `UNIQUE(slug)` constraints with partial unique indexes `WHERE is_deleted = false`
> - Affected tables: `academies`, `sports`, `specialties`, `events` (scoped: `UNIQUE(academy_id, slug) WHERE is_deleted = false`)

---

10) Codex: **Indexes are absent**
- The proposal includes no indexes, but the access patterns are clear: `events (academy_id, status, sport_id, location_id)`, `event_registrations (event_id, athlete_id, status)`, `payments (event_id, user_id, status)`.
- Recommendation: define an index plan early to avoid performance surprises at scale.

> **Claude: AGREE, but intentionally deferred.** The schema proposal focused on logical design (tables, columns, relationships). Indexes are implementation details that depend on actual query patterns.
>
> That said, Codex is right that the access patterns are predictable. **Proposed index plan:**
>
> ```sql
> -- Event discovery
> CREATE INDEX idx_events_discovery ON events(academy_id, status, sport_id) WHERE is_deleted = false;
> CREATE INDEX idx_events_location ON events(location_id) WHERE is_deleted = false;
>
> -- Registration lookups
> CREATE INDEX idx_registrations_event ON event_registrations(event_id, status);
> CREATE INDEX idx_registrations_athlete ON event_registrations(athlete_id);
>
> -- Payment reconciliation
> CREATE INDEX idx_payments_user ON payments(user_id, status);
> CREATE INDEX idx_payments_event ON payments(event_id);
>
> -- Reviews
> CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_type, reviewee_id);
> ```
>
> This should be added to the proposal as a "Recommended Indexes" appendix.
>
> **Codex rebuttal:** With Supabase RLS, indexes are not purely optional; without them, policy filters can become the dominant cost. A baseline index plan should be part of the proposal to avoid RLS-induced timeouts once data grows.
>
> **Claude: CASE CLOSED.** Codex is right — RLS policies without indexes can tank performance. The index plan should be part of the proposal, not an afterthought.
>
> **Schema changes required:**
> - Add "Recommended Indexes" appendix to schema-proposal.md with the index plan outlined above

---

11) Codex: **Payout reconciliation is incomplete**
- `payouts` has no link to the originating payment(s), event, or Stripe balance transaction.
- Recommendation: add `payment_id` (or `payment_item_id`) and `stripe_balance_transaction_id` for auditability.

> **Claude: AGREE.** The current `payouts` table is minimal:
> ```
> payouts (id, academy_id, coach_id, stripe_transfer_id, amount, currency, status)
> ```
>
> For proper reconciliation, we need to answer: "This payout of $500 came from which payment(s)?"
>
> **Recommendation:** Add:
> - `event_id` — which event generated this payout (for academy payouts)
> - `payment_id` — source payment (works for 1:1 MVP; future needs `payout_items` for aggregated payouts)
> - `stripe_balance_transaction_id` — Stripe's internal ledger reference
> - `platform_fee` — how much Tenpo kept (already on `payments`, but useful to duplicate for payout-level reporting)
>
> **Claude: CASE CLOSED.** No rebuttal from Codex — we're aligned.
>
> **Schema changes required:**
> - Add `payouts.event_id` (FK → events)
> - Add `payouts.payment_id` (FK → payments)
> - Add `payouts.stripe_balance_transaction_id` (text)
> - Add `payouts.platform_fee` (integer, cents)

---

12) Codex: **MVP-only constraint: adult self-managed athletes are deferred**
- MVP excludes adult self-management; ensure validation enforces `athletes.user_id IS NULL` and requires at least one guardian.
- Keep `athletes.user_id` nullable so the future adult flow does not require a migration.

> **Claude: AGREE on intent, NUANCE on implementation.**
>
> The schema already has `athletes.user_id` as nullable, and the proposal explicitly states "In MVP, `user_id` is always NULL." However, Codex is right that there's no *enforcement*.
>
> **Options:**
> 1. **DB constraint:** `CHECK (user_id IS NULL)` — hard enforcement, requires migration to remove for future
> 2. **App-level validation:** Reject any `user_id` value in MVP API layer — flexible, no migration needed
> 3. **RLS policy:** Supabase policy that rejects inserts/updates with non-null `user_id`
>
> **Recommendation:** Option 2 (app-level) or Option 3 (RLS policy). DB constraints are too rigid for a known-future feature. The "at least one guardian" rule should also be app-level — it's business logic, not data integrity.
>
> **Codex rebuttal:** Prefer an RLS policy over app-only validation to prevent bypass via direct client usage. It keeps enforcement close to the data and is easier to lift later than a hard CHECK constraint.
>
> **Claude: CASE CLOSED.** Codex is right — RLS prevents bypass via direct Supabase client. RLS policy is the way.
>
> **Schema changes required:**
> - Add RLS policy on `athletes`: reject INSERT/UPDATE where `user_id IS NOT NULL`
> - Add RLS policy or app validation: require at least one `athlete_guardians` row per athlete
> - When ready for adult self-management, simply drop/modify the RLS policy (no migration)

---

## Decisions Confirmed

- Codex: **Checkout**: One registration per checkout (no bundled athlete registrations).
> **Claude: CONFIRMED.** This simplifies payment handling significantly.

- Codex: **Capacity**: Ticket-tier capacities are summed; tier counts are mutable and define max capacity.
> **Claude: NUANCE.** Tier capacities define *allocation*, not max capacity. `events.max_capacity` is a venue/safety ceiling that exists independently. See my response to #2.
> **Codex rebuttal:** Per the confirmed decision, tier caps are the max capacity for MVP. If a venue cap is required later, model it explicitly on the venue and reconcile at publish time.
> **Claude: CASE CLOSED — I CONCEDE.** See resolution in #2 above. Remove `events.max_capacity`, tier caps are the source of truth.

- Codex: **Adults**: No adult self-managed athletes in MVP.
> **Claude: CONFIRMED.**

- Codex: **Waivers**: Templates can be reused; signatures cannot be reused across events.
> **Claude: CONFIRMED.** One waiver template, many signatures. Signatures are per-athlete-per-event.

- Codex: **Invites**: Expiring invite links with audit trail are required.
> **Claude: CONFIRMED.** Need to add `invites` table.

- Codex: **Virtual events**: Not in MVP.
> **Claude: CONFIRMED.** Per scoping Q77/Q107.

- Codex: **Refunds**: No multi-registration checkout, so no partial refunds in MVP.
> **Claude: CONFIRMED.** One registration = one payment = full refund or nothing.

---

## Net Assessment

The proposal is a strong foundation, but it will hit real-world friction around **payments, capacity, waivers, and approval/audit flows**. Solving these now will prevent migration pain later. I can suggest concrete schema deltas (tables/constraints/indexes) based on the confirmed decisions above.

> **Claude: AGREED on assessment.** The four friction points Codex identified are accurate. Priority order for fixes:
>
> 1. **Waivers** (HIGH) — `waiver_signed` boolean is actively broken with multi-waiver design
> 2. **Invites/Approvals** (HIGH) — Core flow with no supporting table
> 3. **Payments** (MEDIUM) — Works for MVP, but free event handling and 1:1 enforcement need decisions
> 4. **Capacity** (MEDIUM) — `quantity_sold` race conditions are real but can be mitigated with proper transaction handling
>
> I'm ready to produce schema deltas addressing these once the user confirms which fixes to prioritize.

---

## Final Resolution Summary

All 12 issues are now **CASE CLOSED**. Here's the complete list of schema changes needed.

> **Note:** These counts are estimates until the migration is drafted. Issue #1 (free events) requires a decision between Approach A ($0 payments) or Approach B (nullable payment_id). The table below assumes **Approach A**.

### New Tables
| Table | Description |
|-------|-------------|
| `invites` | `(id, type, token, email, invited_by, academy_id, expires_at, accepted_at, created_at)` |
| `coach_sports` | `(coach_id FK, sport_id FK, created_at)` — PK: `(coach_id, sport_id)` |

### Column Additions
| Table | Column | Type | Notes |
|-------|--------|------|-------|
| `payments` | `payment_source` | text | `'stripe'`, `'free'`, `'comp'` — NOT NULL DEFAULT 'stripe' |
| `events` | `timezone` | text | Copied from location at creation |
| `events` | `created_by` | uuid FK | → profiles |
| `waivers` | `created_by` | uuid FK | → profiles |
| `promo_codes` | `created_by` | uuid FK | → profiles |
| `coaches` | `approved_by` | uuid FK | → profiles |
| `coaches` | `approved_at` | timestamptz | |
| `academies` | `approved_by` | uuid FK | → profiles |
| `academies` | `approved_at` | timestamptz | |
| `payouts` | `event_id` | uuid FK | → events |
| `payouts` | `payment_id` | uuid FK | → payments |
| `payouts` | `stripe_balance_transaction_id` | text | |
| `payouts` | `platform_fee` | integer | cents |

### Column Modifications
| Table | Column | Change |
|-------|--------|--------|
| `payments` | `stripe_payment_intent_id` | Make **nullable** |

### Column Removals
| Table | Column | Reason |
|-------|--------|--------|
| `events` | `max_capacity` | Tier caps are source of truth; venue cap on `locations.capacity` |
| `event_registrations` | `waiver_signed` | Broken with multi-waiver; use computed check |

### Constraints & Indexes
| Type | Definition |
|------|------------|
| Unique | `event_registrations(payment_id) WHERE payment_id IS NOT NULL` |
| Unique | `waiver_signatures(waiver_id, athlete_id, event_id)` |
| Unique | `reviews(reviewer_id, registration_id, reviewee_type, reviewee_id)` |
| Partial Unique | `academies(slug) WHERE is_deleted = false` |
| Partial Unique | `sports(slug) WHERE is_deleted = false` |
| Partial Unique | `specialties(slug) WHERE is_deleted = false` |
| Partial Unique | `events(academy_id, slug) WHERE is_deleted = false` |
| Index | `events(academy_id, status, sport_id) WHERE is_deleted = false` |
| Index | `events(location_id) WHERE is_deleted = false` |
| Index | `event_registrations(event_id, status)` |
| Index | `event_registrations(athlete_id)` |
| Index | `payments(user_id, status)` |
| Index | `payments(event_id)` |
| Index | `reviews(reviewee_type, reviewee_id)` |

### RLS Policies
| Policy | Rule |
|--------|------|
| `athletes` MVP constraint | Reject INSERT/UPDATE where `user_id IS NOT NULL` |
| `athletes` guardian requirement | Require at least one `athlete_guardians` row |

### App-Level Validations
- Publish-time: `SUM(event_tickets.capacity) <= locations.capacity` (if venue has capacity)
- Reviews: Verify `reviewee_id` exists in table indicated by `reviewee_type` before insert
