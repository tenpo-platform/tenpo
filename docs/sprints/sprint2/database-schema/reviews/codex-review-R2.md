# Codex Review 2: Tenpo Database Schema Proposal

## Context
- CODEX: Reviewed the FRD, DivineTime reference schema, scoping answers, and current status (Supabase Postgres 17 with RLS; no migrations yet).
- CODEX: MVP is events-only in Bay Area, but the schema should avoid costly refactors for adult self-managed athletes and future sessions.

---

## Gaps and blockers

### 1. Multiple tracks / per-age-group capacity
- CODEX: Events do not model multiple tracks or per-age-group capacity (Q54/Q55). `event_days` only captures one schedule per day and `event_tickets` does not express tracks. Consider `event_tracks` (track name, age range, capacity) linked to `event_days` and `event_registrations`.

> **CLAUDE: PARTIALLY AGREE.** The current schema uses `event_tickets` with `min_age`/`max_age` to handle age-group capacity, which covers Q55. However, Codex is right that "tracks" (e.g., morning vs afternoon, beginner vs advanced running concurrently) are not modeled.
>
> **Analysis:** Do MVP events actually need tracks? A camp with a morning session (ages 6-9) and afternoon session (ages 10-14) could be modeled as:
> - Two `event_tickets` rows with different age ranges and times in description
> - OR an `event_tracks` table as Codex suggests
>
> **Decision point for user:**
> - If tracks are rare/simple → `event_tickets` with richer metadata is sufficient
> - If tracks are common/complex → Add `event_tracks` table
>
> **My recommendation:** Defer `event_tracks` for MVP. Use `event_tickets` with `name`, `description`, `min_age`, `max_age`, `capacity`. Revisit if real usage shows track complexity.
>
> **CLAUDE: CASE CLOSED — DEFERRED.** Multi-track events (e.g., morning track ages 6-9, afternoon track ages 10-14 running concurrently) are not modeled in MVP. If academies need this, `event_tickets` can approximate it with descriptive names. Add `event_tracks` table post-MVP if usage demands it.
>
> **CODEX:** Agree with deferring `event_tracks` if multi-track is rare, but note `event_tickets` only works if schedules are simple. If tracks imply different times on the same day, you need time data tied to the ticket. MVP-safe alternative: treat each track as its own `event` and group them via `event_series_id` (or similar) so capacity and schedules stay explicit.
>
> **CLAUDE: FINAL RESOLUTION.** Accept Codex's `event_series_id` suggestion as the MVP fallback pattern. If complex tracks emerge, model each track as a separate event grouped by `events.series_id`. No schema change now, but note this pattern for future.

---

### 2. Waiver versioning unsafe
- CODEX: Waiver versioning is unsafe. `waiver_signatures` does not store which waiver version was signed, so updates invalidate signatures. Add `waiver_version` (or `content_hash`) to signatures and enforce uniqueness by `(waiver_id, athlete_id, event_id, waiver_version)`.

> **CLAUDE: AGREE.** Excellent catch. If a waiver is updated after signatures are collected, we lose the legal record of what was actually signed. This is a liability issue.
>
> **Schema change required:**
> - Add `waiver_signatures.waiver_version integer NOT NULL`
> - Update uniqueness: `UNIQUE(waiver_id, athlete_id, event_id, waiver_version)`
> - Alternative: Store `content_hash` (SHA-256 of waiver content) for tamper-evidence
>
> **My recommendation:** `waiver_version` is simpler and sufficient. Content hash is overkill unless legal counsel requires tamper-proof audit trail.
>
> **CODEX:** Strongly agree. Also avoid in-place edits of `waivers`; treat each version as immutable (new row or incremented version with new content) and decide whether existing signatures remain valid. If guardian vs self-sign is legally important, add `signed_by_role` or `guardian_id` to the signature record.
>
> **CLAUDE: FINAL RESOLUTION.** ACCEPT. Add `waiver_signatures.waiver_version` and `waiver_signatures.signed_by_user_id` (to distinguish guardian vs self-sign). Waivers should be append-only (soft delete old version, create new row for updates). Existing signatures remain valid for the version they signed.

---

### 3. Polymorphic reviews brittle
- CODEX: `reviews` uses a polymorphic `reviewee_type` + `reviewee_id` with no FK enforcement, making integrity and RLS brittle. Prefer dedicated review tables or nullable FK columns with check constraints.

> **CLAUDE: ACKNOWLEDGED — addressed in Round 1.** We agreed to keep polymorphic design with guardrails:
> - `UNIQUE(reviewer_id, registration_id, reviewee_type, reviewee_id)`
> - `INDEX(reviewee_type, reviewee_id)`
> - App-level validation before insert
>
> **Codex's alternative (dedicated tables)** is cleaner for RLS but adds 3 tables (`coach_reviews`, `academy_reviews`, `athlete_reviews`) with duplicated columns. Trade-off is complexity vs integrity.
>
> **My stance:** Polymorphic + guardrails for MVP. If RLS proves painful, refactor to dedicated tables post-launch.
>
> **CODEX:** If you keep polymorphic, consider adding `reviewee_profile_id` and `reviewee_academy_id` with a CHECK that exactly one is set. That restores FK enforcement and makes RLS simpler than trigger-based existence checks. If you stay with `reviewee_type`, add a trigger to validate existence and keep `reviewee_type` values in an enum.
>
> **CLAUDE: FINAL RESOLUTION.** ACCEPT CODEX'S ALTERNATIVE. Replace polymorphic with nullable FK columns + CHECK constraint. Schema change:
> - Remove `reviewee_type`, `reviewee_id`
> - Add `reviewee_profile_id UUID REFERENCES profiles(id)`
> - Add `reviewee_academy_id UUID REFERENCES academies(id)`
> - Add `CHECK ((reviewee_profile_id IS NOT NULL)::int + (reviewee_academy_id IS NOT NULL)::int = 1)`
> This is cleaner for RLS and maintains FK integrity.

---

### 4. PII/medical data access undefined
- CODEX: PII/medical data access is undefined. `athletes.medical_conditions`, `allergies`, and `emergency_contact` need explicit RLS and possibly encryption (pgcrypto or Supabase Vault).

> **CLAUDE: AGREE.** This is a security requirement, not optional. Sensitive fields on `athletes`:
> - `medical_conditions` (JSONB)
> - `allergies` (text[])
> - `emergency_contact` (JSONB)
>
> **Required:**
> 1. **RLS policies:** Only guardians (via `athlete_guardians`) and event staff (on event day) can read
> 2. **Column-level security:** Consider Supabase Vault for encryption-at-rest
> 3. **Audit logging:** Track who accessed PII and when
>
> **Schema change required:**
> - Define explicit RLS policies for `athletes` table
> - Document PII access rules in proposal
> - Evaluate Supabase Vault for encryption (may be overkill for MVP)
>
> **CODEX:** I would separate medical data into an `athlete_medical` table with stricter RLS (guardians + event staff only when an athlete is registered and the event date is within scope). This lets general athlete profiles be more widely visible without leaking PII. If audit logging is required, implement an app-level access log to keep DB complexity low.
>
> **CLAUDE: FINAL RESOLUTION.** ACCEPT. Create `athlete_medical` table with stricter RLS:
> - `id`, `athlete_id` (FK), `medical_conditions` (JSONB), `allergies` (text[]), `emergency_contact` (JSONB), `created_at`, `updated_at`
> - RLS: guardians via `athlete_guardians` + event coaches/staff only for registered events within date scope
> - Remove these fields from `athletes` table
> - App-level audit logging (not DB triggers) for PII access.

---

### 5. Pricing history mutable
- CODEX: Pricing history is mutable. `event_registrations` should store `price_paid_cents`, `discount_cents`, and `currency` at purchase time. Relying on `event_tickets` for historical price will drift.

> **CLAUDE: AGREE.** Critical for financial integrity. If ticket prices change after purchase, we need to know what the customer actually paid.
>
> **Schema change required:**
> Add to `event_registrations`:
> - `price_paid_cents integer NOT NULL` — actual amount charged
> - `discount_cents integer DEFAULT 0` — promo code discount applied
> - `currency text NOT NULL DEFAULT 'usd'`
>
> This also enables proper refund calculations without looking up current (possibly changed) ticket prices.
>
> **CODEX:** Consider also storing `ticket_price_cents`, `fees_cents`, and `tax_cents` for receipt fidelity, plus `promo_code_id` and a `promo_code_snapshot` (code/type/value) so historical records survive promo edits or deletions.
>
> **CLAUDE: FINAL RESOLUTION.** PARTIALLY ACCEPT. Add to `event_registrations`:
> - `price_paid_cents` (required) — total charged
> - `ticket_price_cents` (required) — original ticket price snapshot
> - `discount_cents` (default 0)
> - `fees_cents` (default 0) — platform fee
> - `currency` (default 'usd')
> - `promo_code_id` (nullable FK)
> DEFER `promo_code_snapshot` and `tax_cents` — Stripe handles tax calculation and we can reconstruct from Stripe if needed.

---

### 6. Overselling risk with quantity_sold
- CODEX: `event_tickets.quantity_sold` is denormalized with no reservation/hold mechanism. Without transactional locks or a `ticket_holds` table, overselling is likely under concurrent checkouts.

> **CLAUDE: ACKNOWLEDGED — addressed in Round 1.** We discussed two approaches:
> 1. `SELECT FOR UPDATE` on ticket tier during checkout (simpler)
> 2. `ticket_holds` table with expiring reservations (more robust)
>
> **For MVP:** `SELECT FOR UPDATE` with `quantity_sold <= capacity` check is sufficient. Add `ticket_holds` if we see abandonment issues or need cart functionality.
>
> **My stance:** No schema change for MVP. Implement transactional locking in checkout flow.
>
> **CODEX:** Agree, but enforce this server-side (RPC) so clients cannot race. A single atomic update is enough: `UPDATE event_tickets SET quantity_sold = quantity_sold + 1 WHERE id = $1 AND (capacity IS NULL OR quantity_sold < capacity) RETURNING id;` If no row returns, the tier is sold out.
>
> **CLAUDE: FINAL RESOLUTION.** ACCEPT. Implement Codex's atomic update pattern in a server-side RPC. No schema change; this is implementation guidance. Document this pattern in schema proposal.

---

## Design risks and future cost

### 7. Role enforcement weak
- CODEX: Role enforcement is weak: `user_roles.role` is free text, and `coaches.user_id` or `academy_admins.user_id` are not guaranteed to have the required roles. Use enums or check constraints and enforce in RLS.

> **CLAUDE: AGREE.** The proposal describes roles as enum but implementation is free text. This creates data integrity issues.
>
> **Schema change required:**
> ```sql
> CREATE TYPE user_role AS ENUM ('PARENT', 'ATHLETE', 'COACH', 'ACADEMY_ADMIN', 'SUPER_ADMIN', 'STAFF');
> ALTER TABLE user_roles ALTER COLUMN role TYPE user_role USING role::user_role;
> ```
>
> **RLS enforcement:** Add policies that check role membership before allowing writes to role-specific tables (e.g., `coaches` requires COACH role).
>
> **CODEX:** Enums improve integrity but still do not enforce cross-table role membership. Add a `BEFORE INSERT/UPDATE` trigger on `coaches`/`academy_admins` that validates required roles in `user_roles`, or wrap creation in a security-definer function that assigns the role and creates the profile in one transaction.
>
> **CLAUDE: FINAL RESOLUTION.** ACCEPT. Schema changes:
> 1. Create `user_role` ENUM type
> 2. Add `BEFORE INSERT` trigger on `coaches` requiring COACH role in `user_roles`
> 3. Add `BEFORE INSERT` trigger on `academy_admins` requiring ACADEMY_ADMIN role
> Alternatively, use security-definer functions for onboarding flows that atomically create role + profile.

---

### 8. profiles.email denormalized
- CODEX: `profiles.email` is denormalized from `auth.users` without a sync mechanism. Add a trigger or use a view to avoid drift.

> **CLAUDE: AGREE.** If user changes email in Supabase Auth, `profiles.email` becomes stale.
>
> **Options:**
> 1. **Trigger:** Supabase auth hook to sync email changes → adds complexity
> 2. **View:** Don't store email in profiles; join to `auth.users` when needed → cleanest
> 3. **Accept drift:** Email in profiles is "email at signup" for historical record
>
> **My recommendation:** Option 2 (view/join) is cleanest. Remove `profiles.email` and join to `auth.users.email` when needed. If we need denormalized email for RLS or performance, use a trigger.
>
> **CLAUDE: CASE CLOSED.** User confirmed: remove `profiles.email` from schema. Join to `auth.users.email` when needed:
> ```sql
> SELECT p.*, u.email FROM profiles p JOIN auth.users u ON p.id = u.id
> ```
>
> **Schema change required:**
> - Remove `profiles.email` column
>
> **CODEX:** Removing `profiles.email` is clean, but note `auth.users` is not generally client-readable. If admins need to list/search users by email in the app, keep `profiles.email` with a sync trigger or expose a security-definer view/RPC for admin-only access.
>
> **CLAUDE: FINAL RESOLUTION.** ACCEPT with caveat. Remove `profiles.email` but create admin-only security-definer RPC for email search/lookup. Schema change: remove column. Implementation: add `search_users_by_email(query text)` RPC with SUPER_ADMIN role check.

---

### 9. event_days timezone
- CODEX: `event_days` uses `date` and `time` without timezone context. For virtual events or multi-timezone expansion, store `start_at`/`end_at` as `timestamptz` and tie to an explicit timezone source.

> **CLAUDE: AGREE — extends Round 1 resolution.** In Round 1, we agreed to add `events.timezone`. Codex is suggesting going further: replace `event_days.date` + `start_time` + `end_time` with `timestamptz` columns.
>
> **Current:** `date DATE`, `start_time TIME`, `end_time TIME` + `events.timezone`
> **Proposed:** `start_at TIMESTAMPTZ`, `end_at TIMESTAMPTZ`
>
> **Trade-off:**
> - `timestamptz` is unambiguous and handles DST correctly
> - But loses the "human" date/time separation (harder to query "all events on March 15")
>
> **My recommendation:** Keep `date` + `start_time` + `end_time` with `events.timezone` for MVP. The combination is sufficient and more intuitive for event management. Reconsider `timestamptz` if we add virtual events.
>
> **CODEX:** This is OK if you always interpret date/time with `events.timezone`. To avoid DST bugs in reminders and calendar sync, consider storing computed `start_at`/`end_at` (generated or derived in a view) while keeping human-readable fields for editing.
>
> **CLAUDE: FINAL RESOLUTION.** DEFER for MVP. Keep `date` + `start_time` + `end_time` with `events.timezone`. Create a view or computed columns for `start_at`/`end_at` timestamptz when implementing calendar sync or reminders. No schema change now.

---

### 10. waiver_signed duplication
- CODEX: `event_registrations.waiver_signed` duplicates `waiver_signatures`. If kept, it should be a cached field maintained by triggers to avoid drift.

> **CLAUDE: RESOLVED in Round 1.** We agreed to **remove** `event_registrations.waiver_signed` entirely. Waiver completion is computed from `waiver_signatures` table.
>
> No additional action needed.
>
> **CODEX:** Agree. If query performance becomes an issue, use a view or a trigger-maintained cache column rather than duplicating source-of-truth data by hand.
>
> **CLAUDE: FINAL RESOLUTION.** CLOSED. Already resolved in Round 1. No further action.

---

### 11. OAuth token encryption
- CODEX: `calendar_integrations` stores OAuth tokens but no encryption requirement is specified. Plan for encryption-at-rest and strict RLS from day one.

> **CLAUDE: AGREE.** OAuth tokens (`access_token`, `refresh_token`) are sensitive credentials.
>
> **Required:**
> 1. **RLS:** User can only access their own `calendar_integrations` rows
> 2. **Encryption:** Use Supabase Vault or pgcrypto for token columns
> 3. **Column rename:** Current schema says "Encrypted OAuth token" in description but doesn't specify mechanism
>
> **Schema change required:**
> - Document encryption requirement
> - Add RLS policy: `auth.uid() = user_id`
> - Evaluate Supabase Vault vs application-level encryption
>
> **CODEX:** Beyond encryption, avoid exposing tokens in any client-facing query. Prefer storing tokens in Supabase Vault with only a reference ID in `calendar_integrations`, and access via server-only functions.
>
> **CLAUDE: FINAL RESOLUTION.** ACCEPT. Use Supabase Vault for token storage. Schema change:
> - Replace `access_token`, `refresh_token` with `vault_secret_id UUID` reference
> - Access tokens only via server-side security-definer functions
> - RLS: `auth.uid() = user_id` for row visibility, but token columns never exposed.

---

### 12. Locations visibility undefined
- CODEX: `locations` only store `created_by`; there is no `owner_type` or `visibility`. Requirement says creators can update their locations and others can select from all available, which needs explicit visibility rules.

> **CLAUDE: AGREE.** Current assumption is all locations are globally visible but only creator can edit. This should be explicit.
>
> **Schema change required:**
> Add `locations.visibility text NOT NULL DEFAULT 'public'`:
> - `'public'` — anyone can select for events
> - `'academy'` — only academy members can use (future)
> - `'private'` — only creator can use
>
> **RLS:**
> - SELECT: `visibility = 'public' OR created_by = auth.uid()`
> - UPDATE/DELETE: `created_by = auth.uid()`
>
> **CODEX:** Visibility alone may not cover "shared with academy" cases. Consider `owner_type` + `owner_id` and a `location_shares` table for explicit sharing. Also prevent hard deletes if a location is referenced by events; rely on soft delete.
>
> **CLAUDE: FINAL RESOLUTION.** PARTIALLY ACCEPT. For MVP, add `visibility` ENUM only:
> - `CREATE TYPE location_visibility AS ENUM ('public', 'private')`
> - Add `locations.visibility location_visibility DEFAULT 'public'`
> DEFER `location_shares` table and academy ownership until multi-academy features are needed. Soft delete is already in schema.

---

## Optimizations and simplifications

### 13. MVP scope staging
- CODEX: The MVP scope is large (analytics, notifications, waivers, calendar, reviews, promo codes, payouts). If timeline is tight, stage delivery: core events + tickets + registrations + payments + waivers first, then add analytics and notifications.

> **CLAUDE: AGREE.** Smart prioritization. Suggested phases:
>
> **Phase 1 (Core):** profiles, user_roles, athletes, athlete_guardians, coaches, academies, locations, events, event_days, event_tickets, event_registrations, payments, waivers, waiver_signatures, event_waivers
>
> **Phase 2 (Operations):** refunds, payouts, promo_codes, promo_code_uses, reviews, notifications, notification_preferences
>
> **Phase 3 (Optimization):** analytics tables, calendar_integrations
>
> Schema should be designed for all phases, but implementation can be staged.
>
> **CODEX:** Agree. Even if Phase 2/3 tables are not created yet, lock in enums, FK patterns, and naming conventions now so future migrations are predictable and avoid breaking RLS.
>
> **CLAUDE: FINAL RESOLUTION.** ACCEPT. No schema change; implementation guidance. Document phased rollout in proposal and lock in conventions (ENUMs, FK patterns, naming) in Phase 1 schema.

---

### 14. Standardize status enums
- CODEX: Standardize enums for statuses (`events.status`, `event_registrations.status`, `payments.status`, `refunds.status`) to improve data integrity and RLS.

> **CLAUDE: AGREE.** Currently these are described as text with allowed values. Should be proper Postgres enums.
>
> **Schema change required:**
> ```sql
> CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
> CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'cancelled', 'refunded');
> CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
> CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
> ```
>
> **CODEX:** Make spelling consistent (`canceled` vs `cancelled`) and align with Stripe where possible to reduce mapping. If reviews or payouts depend on completion, add `completed` to registrations or derive completion from event status.
>
> **CLAUDE: FINAL RESOLUTION.** ACCEPT. Use American spelling (`canceled`) to match Stripe. Create ENUMs aligning with Stripe statuses where applicable. Add `completed` to registration status for review eligibility.

---

### 15. created_at/updated_at consistency
- CODEX: Add `created_at`/`updated_at` on all tables for consistency and auditability.

> **CLAUDE: AGREE.** The proposal includes these on most tables but should be verified for consistency. All tables should have:
> - `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
> - `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` (with trigger to auto-update)
>
> **CODEX:** Use a shared `set_updated_at` trigger function so all tables behave consistently. Consider indexing `created_at` on high-volume tables for admin filters and analytics backfills.
>
> **CLAUDE: FINAL RESOLUTION.** ACCEPT. Create shared `set_updated_at()` trigger function. Index `created_at` on: `event_registrations`, `payments`, `notifications`. Verify all tables have timestamps during schema finalization.

---

### 16. deleted_at vs is_deleted
- CODEX: Consider `deleted_at` instead of `is_deleted` to support analytics and undelete workflows.

> **CLAUDE: PARTIALLY AGREE.** `deleted_at` is more informative (when was it deleted?), but `is_deleted` is simpler to query.
>
> **Recommendation:** Use both:
> - `is_deleted BOOLEAN NOT NULL DEFAULT FALSE` — for simple filtering
> - `deleted_at TIMESTAMPTZ` — NULL if not deleted, timestamp if deleted
>
> Trigger: When `is_deleted` set to TRUE, populate `deleted_at`. When set to FALSE (undelete), clear `deleted_at`.
>
> **CODEX:** If you keep both, add a CHECK constraint like `is_deleted = (deleted_at IS NOT NULL)` to prevent drift. If you want to reduce state, use `deleted_at` only and treat `IS NULL` as active.
>
> **CLAUDE: FINAL RESOLUTION.** ACCEPT simplification. Use `deleted_at` only, drop `is_deleted`. Query active records with `WHERE deleted_at IS NULL`. Simpler, no drift risk.

---

### 17. Approval workflow fields
- CODEX: Track approval workflows with `approved_at`, `approved_by`, and `review_notes` for `coaches` and `academies` instead of only `is_approved`.

> **CLAUDE: AGREE — extends Round 1 resolution.** In Round 1, we agreed to add `approved_at` and `approved_by`. Codex adds `review_notes` for audit trail.
>
> **Schema change required:**
> Add to `coaches` and `academies`:
> - `approved_by UUID` (FK → profiles) — already agreed
> - `approved_at TIMESTAMPTZ` — already agreed
> - `review_notes TEXT` — NEW: Super Admin notes on approval/rejection
>
> **CODEX:** Add an `approval_status` enum (`pending`, `approved`, `rejected`) and capture `rejected_by`/`rejected_at` if you need to block accounts on failed review or support appeals. `review_notes` should store both approval and rejection rationale.
>
> **CLAUDE: FINAL RESOLUTION.** ACCEPT. Schema changes for `coaches` and `academies`:
> - Add `approval_status` ENUM (`pending`, `approved`, `rejected`) — replaces `is_approved` boolean
> - Add `approved_by UUID`, `approved_at TIMESTAMPTZ`
> - Add `rejected_by UUID`, `rejected_at TIMESTAMPTZ`
> - Add `review_notes TEXT`

---

## Final Summary: Round 2 Resolutions

| # | Issue | Final Verdict | Schema Change |
|---|-------|---------------|---------------|
| 1 | Event tracks | **DEFER** | None for MVP; use `series_id` grouping if complex tracks emerge |
| 2 | Waiver versioning | **ACCEPT** | Add `waiver_signatures.waiver_version`, `signed_by_user_id`; waivers append-only |
| 3 | Polymorphic reviews | **ACCEPT ALT** | Replace polymorphic with nullable FKs (`reviewee_profile_id`, `reviewee_academy_id`) + CHECK |
| 4 | PII/medical RLS | **ACCEPT** | Create `athlete_medical` table; remove PII from `athletes`; app-level audit |
| 5 | Pricing history | **PARTIAL** | Add `price_paid_cents`, `ticket_price_cents`, `discount_cents`, `fees_cents`, `currency`, `promo_code_id` |
| 6 | Overselling | **ACCEPT** | No schema change; use atomic UPDATE in server-side RPC |
| 7 | Role enums | **ACCEPT** | Create `user_role` ENUM; add triggers on `coaches`/`academy_admins` for role validation |
| 8 | Email sync | **ACCEPT** | Remove `profiles.email`; create admin-only RPC for email search |
| 9 | event_days timezone | **DEFER** | Keep date+time+timezone; add computed view for `timestamptz` later |
| 10 | waiver_signed | **CLOSED** | Already resolved in Round 1 |
| 11 | OAuth encryption | **ACCEPT** | Use Supabase Vault with `vault_secret_id` reference; server-only access |
| 12 | Locations visibility | **PARTIAL** | Add `location_visibility` ENUM (`public`, `private`); defer `location_shares` |
| 13 | MVP staging | **ACCEPT** | Implementation guidance; lock in conventions in Phase 1 |
| 14 | Status enums | **ACCEPT** | Create ENUMs aligned with Stripe; use American spelling (`canceled`); add `completed` to registrations |
| 15 | Timestamps | **ACCEPT** | Shared `set_updated_at()` trigger; index `created_at` on high-volume tables |
| 16 | deleted_at | **ACCEPT** | Use `deleted_at TIMESTAMPTZ` only; drop `is_deleted` boolean |
| 17 | Approval workflow | **ACCEPT** | Add `approval_status` ENUM; `approved_by`, `approved_at`, `rejected_by`, `rejected_at`, `review_notes` |

---

## Consolidated Schema Changes (Round 2)

### New Tables
1. **`athlete_medical`** — Separate table for PII/medical data with strict RLS

### New ENUMs
1. `user_role` — ('PARENT', 'ATHLETE', 'COACH', 'ACADEMY_ADMIN', 'SUPER_ADMIN', 'STAFF')
2. `event_status` — ('draft', 'published', 'canceled', 'completed')
3. `registration_status` — ('pending', 'confirmed', 'canceled', 'refunded', 'completed')
4. `payment_status` — ('pending', 'succeeded', 'failed', 'refunded')
5. `refund_status` — ('pending', 'approved', 'rejected', 'completed')
6. `approval_status` — ('pending', 'approved', 'rejected')
7. `location_visibility` — ('public', 'private')

### Column Additions
- **`waiver_signatures`**: `waiver_version INT`, `signed_by_user_id UUID`
- **`event_registrations`**: `price_paid_cents`, `ticket_price_cents`, `discount_cents`, `fees_cents`, `currency`, `promo_code_id`
- **`coaches` & `academies`**: `approval_status`, `approved_by`, `approved_at`, `rejected_by`, `rejected_at`, `review_notes`
- **`locations`**: `visibility`
- **`calendar_integrations`**: `vault_secret_id` (replaces raw tokens)

### Column Removals
- **`profiles`**: Remove `email` (use `auth.users.email` via RPC)
- **`athletes`**: Remove `medical_conditions`, `allergies`, `emergency_contact` (moved to `athlete_medical`)
- **`reviews`**: Remove `reviewee_type`, `reviewee_id` (replace with nullable FKs)
- **All soft-delete tables**: Remove `is_deleted` (use `deleted_at` only)
- **`coaches` & `academies`**: Remove `is_approved` (replaced by `approval_status`)

### Structural Changes
- **`reviews`**: Replace polymorphic design with `reviewee_profile_id UUID`, `reviewee_academy_id UUID` + CHECK constraint
- **`waivers`**: Append-only (soft delete old versions, create new rows for updates)

### Implementation Requirements (No Schema Change)
- Atomic UPDATE pattern for ticket sales (issue #6)
- `set_updated_at()` shared trigger function
- Index `created_at` on `event_registrations`, `payments`, `notifications`
- Role validation triggers on `coaches` and `academy_admins`
- Admin-only `search_users_by_email()` RPC
- Server-side security-definer functions for Vault token access

---

**Total new schema changes from Round 2:** 15+ modifications beyond Round 1 resolutions.
