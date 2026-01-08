# Testing Strategy

This document outlines the testing approach for Tenpo, with emphasis on validating RLS policies and database interactions during feature development.

---

## Overview

The database schema includes 19 tables with Row Level Security (RLS) policies that enforce multi-tenant isolation and role-based access. Testing must verify these policies work correctly as features are built.

**Core principle:** Every feature that touches the database should include tests that verify RLS behaves as expected for all relevant user roles.

**Status note:** This guide is a plan. The repo does not yet include test deps or scripts, so treat tool choices and setup steps here as future work.

## Prerequisites (when you add tests)

- Add test dependencies (e.g., `vitest`, `@playwright/test`) and any helpers you choose to use.
- Add `test` and `test:e2e` scripts to `package.json` once tests exist.
- Prefer `yarn` commands in CI since this repo uses `yarn.lock` (replace with npm if you switch package managers).

---

## Tooling Decisions (Committed)

- **Unit/Integration runner:** Vitest (1.x).
- **E2E runner:** Playwright (1.x).
- **Coverage:** `@vitest/coverage-v8` (1.x).
- **Node:** 24.x (matches Vercel runtime).
- **Supabase CLI:** 2.67.x (current local toolchain).
- **Vercel CLI:** 50.1.x (current local toolchain).
- **CI:** GitHub Actions (separate jobs for unit, integration, and e2e).

### Expected Scripts

- `yarn test` → unit + fast integration
- `yarn test:integration` → integration only (longer timeouts)
- `yarn test:watch` → local dev loop
- `yarn test:e2e` → Playwright (staging/preview only)

### Expected Config/Env Files

- `vitest.config.ts` (unit/integration)
- `playwright.config.ts` (e2e)
- `.env.test` (local integration tests)
- `.env.e2e` (preview/staging e2e)
- `tests/setup/` helpers for auth + seed data

---

## Testing Layers

### 1. Unit Tests
**Scope:** Pure functions, utilities, helpers
**Tools:** Vitest
**Location:** `src/**/*.test.ts` (colocated) or `tests/unit/`

Examples:
- Date formatting utilities
- Price calculation helpers
- Form validation logic
- Age calculation from birthdate

### 2. Integration Tests
**Scope:** API routes, Supabase client operations, server actions
**Tools:** Vitest + Supabase test client
**Location:** `tests/integration/`

Examples:
- Creating a user and verifying profile auto-creation
- CRUD operations with RLS verification
- Webhook handlers

### 3. E2E Tests
**Scope:** Full user flows through the UI
**Tools:** Playwright
**Location:** `tests/e2e/`

Examples:
- Complete registration flow (browse → select → checkout → confirmation)
- Admin creating and publishing a camp
- Parent managing athlete profiles

---

## Long-Term Strategy (Scaling)

- Keep a clear pyramid: fast unit tests, focused integration tests for RLS, and a small set of critical E2E flows.
- Avoid shared mutable state: use isolated test data or a reset database between suites.
- Split CI by layer (unit/integration/e2e) and run E2E on fewer branches or nightly until UI stabilizes.
- Add performance/regression tests for high-risk queries and `reserve_ticket` concurrency as load grows.
- Treat RLS tests as contract tests: they should only change when policies change, not with UI changes.

---

## Environments (Local, Staging, Prod)

- **Local:** Supabase CLI + local Docker. Run unit and integration tests here by default.
- **Staging:** Vercel Preview deployments pointing at `tenpo-staging`. Run a limited set of integration and E2E smoke tests.
- **Production:** No destructive tests. Use read-only checks, monitoring, and alerting only.

**Safety guardrail:** local work should stay unlinked from staging/prod by default. Only link to a remote Supabase project when you intentionally need to push or inspect it, then unlink afterward.

---

## RLS Testing Approach

### Test User Personas

Create test users for each role to verify RLS policies:

| Persona | Role(s) | Purpose |
|---------|---------|---------|
| `super_admin@test.com` | SUPER_ADMIN | Platform administration |
| `academy_owner@test.com` | ACADEMY_ADMIN | DivineTime owner |
| `academy_staff@test.com` | ACADEMY_ADMIN | DivineTime staff (not owner) |
| `parent_one@test.com` | PARENT | Parent with athletes |
| `parent_two@test.com` | PARENT | Different parent (isolation tests) |
| `anonymous` | (none) | Unauthenticated user |

### RLS Test Pattern

For each database operation, test these scenarios:
- SELECT allowed for the right role and blocked for others.
- INSERT allowed only when ownership/role checks pass.
- UPDATE limited to owner/guardian/admin as defined.
- DELETE limited to owner/admin as defined.
- Cross-tenant isolation always enforced.


### Critical RLS Scenarios

These scenarios MUST be tested as they're security-critical:

#### 1. Cross-Tenant Academy Isolation
- Academy admins can only see their own academies/events.
- SUPER_ADMIN can view all as needed.

#### 2. Guardian-Athlete Boundary
- Guardians can access their own athletes and medical data.
- Other parents and academy admins cannot access those records.

#### 3. SUPER_ADMIN Academy Bootstrap
- SUPER_ADMIN can create academies and add the first owner/admin.

#### 4. Registration Visibility
- Parents see their own registrations only.
- Academy admins see registrations for their events only.

#### 5. Medical Data Isolation
- Medical data is visible only to guardians; admins should not see it.

---

## Security Testing Beyond RLS

- **Auth edge cases:** email confirmation required, password reset, change email, refresh token rotation.
- **Rate limits:** sign-in/signup throttling, OTP/magic link limits, password reset abuse.
- **Captcha:** Turnstile required for public forms, verify blocking on invalid/absent token.
- **Session handling:** token expiry, revoked sessions, concurrent sessions.
- **Service role usage:** ensure service role keys never run in client contexts.
- **PII protection:** verify no cross-tenant access to `athlete_medical` and guardian data.

---

## Testing by Feature (FRD Mapping)

### FRD-02: Authentication

**Tables:** `profiles`, `user_roles`

| Test | Type | Priority |
|------|------|----------|
| Signup creates profile automatically | Integration | P0 |
| Profile has correct default values | Integration | P0 |
| User can update own profile | Integration | P0 |
| User cannot update other profiles | Integration | P0 |
| Role assignment works correctly | Integration | P1 |
| Role-based redirect after login | E2E | P1 |


### FRD-03: Camp Management (Admin)

**Tables:** `academies`, `academy_admins`, `events`, `event_days`, `event_tickets`, `locations`

| Test | Type | Priority |
|------|------|----------|
| SUPER_ADMIN can create academy | Integration | P0 |
| Academy owner can create events | Integration | P0 |
| Academy staff can create events | Integration | P0 |
| Non-admin cannot create events | Integration | P0 |
| Draft events not visible to public | Integration | P0 |
| Published events visible to public | Integration | P0 |
| Event with tickets and days | Integration | P1 |
| Cannot modify other academy's events | Integration | P0 |


### FRD-04: Registration Roster (Admin)

**Tables:** `event_registrations`, `athletes`, `athlete_guardians`

| Test | Type | Priority |
|------|------|----------|
| Admin can view all registrations for their event | Integration | P0 |
| Admin cannot view other academy's registrations | Integration | P0 |
| Registration includes athlete info | Integration | P1 |
| Can filter by status | Integration | P2 |
| Admin can update registration status | Integration | P1 |

### FRD-05: Camp Discovery (Public)

**Tables:** `events`, `sports`, `locations`, `academies`

| Test | Type | Priority |
|------|------|----------|
| Unauthenticated can view published events | Integration | P0 |
| Unauthenticated cannot view draft events | Integration | P0 |
| Can filter events by sport | Integration | P1 |
| Can filter events by location | Integration | P1 |
| Event detail page loads correctly | E2E | P1 |


### FRD-06: Registration Flow (Public)

**Tables:** `athletes`, `athlete_guardians`, `athlete_medical`, `event_registrations`, `waivers`, `waiver_signatures`, `event_tickets`

| Test | Type | Priority |
|------|------|----------|
| Parent can create athlete | Integration | P0 |
| Guardian link created correctly | Integration | P0 |
| Parent can add medical info | Integration | P0 |
| reserve_ticket() prevents overselling | Integration | P0 |
| Can register athlete for event | Integration | P0 |
| Cannot register same athlete twice | Integration | P1 |
| Waiver signature recorded correctly | Integration | P1 |
| Full registration flow | E2E | P0 |


### FRD-07: Parent Dashboard

**Tables:** `profiles`, `athletes`, `event_registrations`

| Test | Type | Priority |
|------|------|----------|
| Parent sees only their athletes | Integration | P0 |
| Parent sees only their registrations | Integration | P0 |
| Can view upcoming events | Integration | P1 |
| Can view past events | Integration | P1 |
| Dashboard loads correctly | E2E | P1 |

---

## Test Data Setup

### Seed vs Factory Data (Guidance)

- **Local/integration:** prefer factories (small, targeted data per test).
- **Staging:** use minimal seed data or a small test tenant; avoid blanket resets during active QA.
- **Production:** no test data creation; only read-only checks and monitoring.
- **Snapshots:** `scripts/restore-local.sh` and `scripts/restore-staging.sh` pull from prod snapshots. Use only when you explicitly want prod-like data in non-prod.

### Approach 1: Seeded Test Database

Use a separate test database with pre-seeded data:
- Create confirmed users via the Admin API (email confirmations are enabled by default).
- Insert roles into `user_roles` (RLS uses DB roles, not JWT claims).
- Seed academies, events, and athletes needed for baseline tests.
- Reset the database between test runs to keep results deterministic.


### Approach 2: Per-Test Isolation

Create and cleanup data within each test:
- Create only the minimal entities required for the test.
- Use a service role client for setup/teardown; use authenticated clients for the actual assertions.
- Prefer cleanup by deleting created rows or resetting the DB per suite.


### Test Helpers
- Helper to create authenticated clients for a given user.
- Helper to create a service role client that bypasses RLS.
- Helper to create an anonymous client for public access tests.
- Helper to insert roles in `user_roles` when creating test users.

---

## Test Configuration

### Vitest Config
- Keep a separate config for integration tests if they need longer timeouts.
- Load Supabase connection vars from `.env.test` or CI secrets.
- Run tests against local Supabase where possible.

**Setup reminder:** add the config files and corresponding `test` script only when the deps are installed.

### Playwright Config
- Add once you have stable UI flows.
- Keep a small set of critical user journeys to limit runtime.

---

## CI/CD Integration

### GitHub Actions Workflow
- Install deps using `yarn install --frozen-lockfile` (current repo uses Yarn).
- Start Supabase locally in CI, run `supabase db reset`, then execute tests.
- Split jobs by layer to keep feedback fast.

---

## Production Monitoring & Alerting

- **Health checks:** lightweight `/api/health` (or equivalent) for uptime monitoring.
- **Error tracking:** Sentry alerts on new error spikes and release regressions.
- **Performance:** track DB latency and API response time (p95/p99).
- **Error budgets:** define thresholds for error rate and latency; trigger alerts when exceeded.
- **Read-only prod checks:** no destructive tests; only safe queries and synthetic checks.

---

## Priority Matrix

### P0 (Must have before launch)
- [ ] Profile auto-creation on signup
- [ ] Cross-tenant isolation (academies)
- [ ] Guardian-athlete access control
- [ ] SUPER_ADMIN academy creation
- [ ] reserve_ticket atomicity
- [ ] Published vs draft event visibility
- [ ] Registration creation with RLS

### P1 (Should have)
- [ ] Role-based routing
- [ ] Waiver signing flow
- [ ] Admin registration management
- [ ] Event filtering
- [ ] Medical data isolation

### P2 (Nice to have)
- [ ] Performance tests for queries
- [ ] Load testing for concurrent reservations
- [ ] Accessibility tests (E2E)

---

## Checklist for Feature Development

When building a new feature, follow this checklist:
- Identify which tables are touched and which roles should access them.
- Add RLS tests for each operation (SELECT/INSERT/UPDATE/DELETE).
- Cover at least one negative case per operation (blocked access).
- Add one cross-tenant isolation test when multi-tenant data is involved.
- Document any new policy assumptions in this file.

---

## Summary

1. **Every feature touching the database needs RLS tests**
2. **Test as multiple user roles** - don't just test the happy path
3. **Cross-tenant isolation is critical** - test that users can't see other academies' data
4. **Guardian-athlete boundary is critical** - test that parents can't see other parents' children
5. **Use service role client for setup/cleanup** - it bypasses RLS
6. **Use authenticated clients for actual tests** - they enforce RLS

---

*Document created: 2026-01-07*
*Related: `docs/sprints/sprint2/database-schema/changelog.md`*
