# Testing Strategy

This document outlines the testing approach for Tenpo, with emphasis on validating RLS policies and database interactions during feature development.

---

## Overview

The database schema includes 19 tables with Row Level Security (RLS) policies that enforce multi-tenant isolation and role-based access. Testing must verify these policies work correctly as features are built.

**Core principle:** Every feature that touches the database should include tests that verify RLS behaves as expected for all relevant user roles.

**Status note:** This guide is a plan. The repo does not yet include Vitest/Playwright deps or test scripts, so treat the config snippets as future setup steps.

## Prerequisites (when you add tests)

- Add test dependencies (e.g., `vitest`, `@playwright/test`) and any helpers you choose to use.
- Add `test` and `test:e2e` scripts to `package.json` once tests exist.
- Prefer `yarn` commands in CI since this repo uses `yarn.lock` (replace with npm if you switch package managers).

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

```typescript
describe('Table: athletes', () => {
  describe('SELECT', () => {
    it('guardian can view their own athletes', async () => {})
    it('guardian cannot view other parents athletes', async () => {})
    it('academy admin cannot view athletes directly', async () => {})
    it('unauthenticated user cannot view any athletes', async () => {})
  })

  describe('INSERT', () => {
    it('parent can create athlete with user_id = null', async () => {})
    it('cannot create athlete for another user', async () => {})
  })

  describe('UPDATE', () => {
    it('guardian can update their athlete', async () => {})
    it('guardian cannot update other athletes', async () => {})
  })

  describe('DELETE', () => {
    it('guardian can soft-delete their athlete', async () => {})
    it('guardian cannot delete other athletes', async () => {})
  })
})
```

### Critical RLS Scenarios

These scenarios MUST be tested as they're security-critical:

#### 1. Cross-Tenant Academy Isolation
```
GIVEN academy_owner@test.com owns "DivineTime"
AND another_owner@test.com owns "OtherAcademy"
WHEN academy_owner tries to view OtherAcademy's events
THEN they should see zero results
```

#### 2. Guardian-Athlete Boundary
```
GIVEN parent_one has athletes [Alice, Bob]
AND parent_two has athletes [Charlie]
WHEN parent_one queries athletes
THEN they should only see [Alice, Bob]
AND they should NOT see [Charlie]
```

#### 3. SUPER_ADMIN Academy Bootstrap
```
GIVEN super_admin@test.com has SUPER_ADMIN role
WHEN they create a new academy
THEN the insert should succeed
AND when they add an owner to that academy
THEN the insert should succeed
```

#### 4. Registration Visibility
```
GIVEN parent_one registered Alice for "Summer Camp"
AND parent_two registered Charlie for "Summer Camp"
WHEN parent_one queries event_registrations
THEN they should only see Alice's registration
AND academy_owner should see both registrations
```

#### 5. Medical Data Isolation
```
GIVEN parent_one has athlete Alice with medical info
WHEN parent_two tries to query athlete_medical
THEN they should see zero results for Alice
AND academy_admin should also NOT see Alice's medical data
```

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

```typescript
// NOTE: Email confirmations are enabled in supabase config.
// For tests, either:
// 1) use the Admin API to create confirmed users, or
// 2) run a test config that disables confirmations.
//
// Example below assumes a confirmed user (via Admin API).

// Example test
it('signup creates profile automatically', async () => {
  const { data: { user } } = await supabase.auth.admin.createUser({
    email: 'newuser@test.com',
    password: 'testpassword123',
    email_confirm: true
  })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  expect(profile).toBeDefined()
  expect(profile.onboarding_completed).toBe(false)
})
```

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

```typescript
// Example test
it('academy admin can create event', async () => {
  const supabase = createClientAsUser('academy_owner@test.com')

  const { data, error } = await supabase
    .from('events')
    .insert({
      academy_id: testAcademyId,
      sport_id: soccerSportId,
      title: 'Summer Soccer Camp',
      slug: 'summer-soccer-camp',
      event_type: 'CAMP',
      timezone: 'America/Los_Angeles',
      status: 'draft'
    })
    .select()
    .single()

  expect(error).toBeNull()
  expect(data.title).toBe('Summer Soccer Camp')
})

it('non-admin cannot create event', async () => {
  const supabase = createClientAsUser('parent_one@test.com')

  const { error } = await supabase
    .from('events')
    .insert({
      academy_id: testAcademyId,
      // ...
    })

  expect(error).toBeDefined()
  expect(error.code).toBe('42501') // RLS violation
})
```

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

```typescript
// Example test
it('anonymous user can view published events', async () => {
  const supabase = createAnonClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')

  expect(events.length).toBeGreaterThan(0)
  events.forEach(event => {
    expect(event.status).toBe('published')
  })
})

it('anonymous user cannot view draft events', async () => {
  const supabase = createAnonClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'draft')

  expect(events.length).toBe(0)
})
```

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

```typescript
// Critical: Test atomic ticket reservation
it('reserve_ticket prevents overselling', async () => {
  // Create ticket with capacity of 1
  const ticketId = await createTestTicket({ capacity: 1 })

  // Simulate concurrent reservations
  const results = await Promise.all([
    supabase.rpc('reserve_ticket', { p_ticket_id: ticketId }),
    supabase.rpc('reserve_ticket', { p_ticket_id: ticketId }),
    supabase.rpc('reserve_ticket', { p_ticket_id: ticketId }),
  ])

  const successes = results.filter(r => !r.error)
  const failures = results.filter(r => r.error)

  expect(successes.length).toBe(1)
  expect(failures.length).toBe(2)
  failures.forEach(f => {
    expect(f.error.message).toContain('sold out')
  })
})
```

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

### Approach 1: Seeded Test Database

Use a separate test database with pre-seeded data:

```typescript
// tests/setup/seed-test-data.ts
export async function seedTestData() {
  // Create test users via Supabase Auth Admin API
  const superAdmin = await createTestUser('super_admin@test.com', 'SUPER_ADMIN')
  const academyOwner = await createTestUser('academy_owner@test.com', 'ACADEMY_ADMIN')
  const parentOne = await createTestUser('parent_one@test.com', 'PARENT')
  const parentTwo = await createTestUser('parent_two@test.com', 'PARENT')

  // Create test academy
  const academy = await createTestAcademy('Test Academy', superAdmin.id)
  await linkAcademyAdmin(academy.id, academyOwner.id, 'owner')

  // Create test athletes
  const alice = await createTestAthlete('Alice', 'Smith', parentOne.id)
  const bob = await createTestAthlete('Bob', 'Smith', parentOne.id)
  const charlie = await createTestAthlete('Charlie', 'Jones', parentTwo.id)

  // Create test event
  const event = await createTestEvent(academy.id, 'Test Camp')

  return { superAdmin, academyOwner, parentOne, parentTwo, academy, alice, bob, charlie, event }
}
```

### Approach 2: Per-Test Isolation

Create and cleanup data within each test:

```typescript
describe('athlete management', () => {
  let testParent: TestUser
  let testAthlete: Athlete

  beforeEach(async () => {
    testParent = await createTestUser(`parent_${Date.now()}@test.com`, 'PARENT')
    testAthlete = await createTestAthlete('Test', 'Athlete', testParent.id)
  })

  afterEach(async () => {
    await cleanupTestData([testAthlete.id], [testParent.id])
  })

  it('parent can update their athlete', async () => {
    // test code
  })
})
```

### Test Helpers

```typescript
// tests/helpers/supabase.ts

// Create client authenticated as specific user
export function createClientAsUser(email: string): SupabaseClient {
  // Implementation using service role to get user token.
  // Also insert into user_roles for RLS (role stored in DB, not JWT).
}

// Create anonymous client
export function createAnonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

// Create service role client (bypasses RLS)
export function createServiceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}
```

---

## Test Configuration

### Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup/global-setup.ts'],
    globalSetup: ['./tests/setup/test-db-setup.ts'],
    include: [
      'src/**/*.test.ts',
      'tests/integration/**/*.test.ts',
    ],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['tests/**', '**/*.test.ts'],
    },
  },
})
```

**Setup reminder:** add the config files and corresponding `test` script only when the deps are installed.

### Playwright Config

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      supabase:
        # Use Supabase CLI in CI or connect to test project

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Start Supabase
        run: npx supabase start

      - name: Run migrations
        run: npx supabase db reset

      - name: Run unit & integration tests
        run: yarn test

      - name: Run E2E tests
        run: yarn test:e2e
```

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

```markdown
## RLS Testing Checklist for [Feature Name]

### Tables Touched
- [ ] Table 1: `table_name`
- [ ] Table 2: `table_name`

### User Roles to Test
- [ ] Unauthenticated
- [ ] PARENT
- [ ] ACADEMY_ADMIN (owner)
- [ ] ACADEMY_ADMIN (staff)
- [ ] SUPER_ADMIN

### Operations to Test
- [ ] SELECT: Can user read expected data?
- [ ] SELECT: Is user blocked from other data?
- [ ] INSERT: Can user create with valid permissions?
- [ ] INSERT: Is user blocked from invalid creates?
- [ ] UPDATE: Can user modify their own data?
- [ ] UPDATE: Is user blocked from modifying others?
- [ ] DELETE: Can user delete with valid permissions?
- [ ] DELETE: Is user blocked from invalid deletes?

### Edge Cases
- [ ] What if guardian link doesn't exist yet?
- [ ] What if user has multiple roles?
- [ ] What if entity is soft-deleted?
```

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
