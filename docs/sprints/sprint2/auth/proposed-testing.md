# Authentication Testing Strategy

**Sprint:** 2
**Last Updated:** 2026-01-08

---

## Overview

This document outlines the testing strategy for the authentication system. UI testing alone is insufficient - we need multiple layers to ensure reliability.

## Testing Layers

| Layer | What to Test | Tool |
|-------|--------------|------|
| Database | Triggers, RPC functions, RLS policies | SQL scripts / pgTAP |
| API | Auth callback, middleware | Jest / Vitest |
| Components | Forms, validation, UI states | React Testing Library |
| E2E | Full user flows | Playwright |
| Manual | Email flows, OAuth | Inbucket + Browser |

---

## 1. Database Tests (SQL)

Test RPC functions and triggers directly in Postgres.

### Location
```
tests/database/test_auth.sql
```

### Example Tests

```sql
-- Test 1: handle_new_user trigger populates profile
BEGIN;
  -- Simulate auth.users insert (what Supabase does on signUp)
  INSERT INTO auth.users (id, email, raw_user_meta_data)
  VALUES (
    'test-user-1',
    'test@example.com',
    '{"first_name": "John", "last_name": "Doe", "phone_number": "555-1234"}'::jsonb
  );

  -- Verify profile was created with metadata
  SELECT assert_equals(
    (SELECT first_name FROM profiles WHERE id = 'test-user-1'),
    'John',
    'Profile first_name should be populated from metadata'
  );

  -- Verify PARENT role was assigned
  SELECT assert_equals(
    (SELECT role FROM user_roles WHERE user_id = 'test-user-1'),
    'PARENT',
    'PARENT role should be auto-assigned'
  );
ROLLBACK;

-- Test 2: accept_invite creates academy
BEGIN;
  -- Setup: Create user and invite
  -- ... setup code ...

  -- Call RPC
  SELECT accept_invite('valid-token', 'Test Academy', 'Description');

  -- Verify academy created
  SELECT assert_true(
    EXISTS (SELECT 1 FROM academies WHERE name = 'Test Academy'),
    'Academy should be created'
  );

  -- Verify slug generated correctly
  SELECT assert_equals(
    (SELECT slug FROM academies WHERE name = 'Test Academy'),
    'test-academy',
    'Slug should be lowercase hyphenated'
  );
ROLLBACK;

-- Test 3: Slug collision returns error
BEGIN;
  -- Setup: Create existing academy with slug 'test-academy'
  INSERT INTO academies (name, slug) VALUES ('Existing', 'test-academy');

  -- Setup: Create invite
  -- ...

  -- Call RPC - should return error
  SELECT assert_equals(
    (SELECT (accept_invite('token', 'Test Academy', NULL))::json->>'error'),
    'Academy URL already taken. Please choose a different name.',
    'Should return slug collision error'
  );
ROLLBACK;
```

### Run Command

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f tests/database/test_auth.sql
```

---

## 2. API / Integration Tests (Vitest)

Test API routes and middleware logic.

### Location
```
tests/integration/
├── auth-callback.test.ts
└── middleware.test.ts
```

### Auth Callback Tests

```typescript
// tests/integration/auth-callback.test.ts
import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/auth/callback/route';

describe('Auth Callback', () => {
  it('redirects to /reset-password for recovery type', async () => {
    const request = new Request(
      'http://localhost:3000/auth/callback?code=valid&type=recovery'
    );

    // Mock Supabase
    vi.mock('@/utils/supabase/server', () => ({
      createServerClient: () => ({
        auth: {
          exchangeCodeForSession: () => ({ error: null }),
        },
      }),
    }));

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/reset-password');
  });

  it('redirects to /organizer for ACADEMY_ADMIN', async () => {
    // ... test implementation
  });

  it('redirects to /dashboard for PARENT', async () => {
    // ... test implementation
  });

  it('handles missing code with error redirect', async () => {
    const request = new Request('http://localhost:3000/auth/callback');
    const response = await GET(request);

    expect(response.headers.get('location')).toContain('error=no_code');
  });
});
```

### Middleware Tests

```typescript
// tests/integration/middleware.test.ts
import { describe, it, expect } from 'vitest';
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

describe('Auth Middleware', () => {
  it('allows public routes without auth', async () => {
    const request = new NextRequest('http://localhost:3000/login');
    const response = await middleware(request);

    expect(response.status).not.toBe(307); // Not a redirect
  });

  it('redirects unauthenticated users from /dashboard', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard');
    // Mock no session
    const response = await middleware(request);

    expect(response.headers.get('location')).toContain('/login');
    expect(response.headers.get('location')).toContain('redirectTo=%2Fdashboard');
  });

  it('redirects PARENT from /organizer to /dashboard', async () => {
    // Mock session with PARENT role only
    const request = new NextRequest('http://localhost:3000/organizer');
    const response = await middleware(request);

    expect(response.headers.get('location')).toContain('/dashboard');
  });
});
```

---

## 3. Component Tests (React Testing Library)

Test form components, validation logic, and UI states.

### Location
```
tests/components/
├── signup-form.test.tsx
├── login-form.test.tsx
├── password-strength-indicator.test.tsx
└── academy-onboarding-form.test.tsx
```

### Signup Form Tests

```typescript
// tests/components/signup-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignupForm } from '@/components/auth/signup-form';

describe('SignupForm', () => {
  it('shows password requirements checklist', () => {
    render(<SignupForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'short' } });

    expect(screen.getByText(/at least 12 characters/i)).toHaveClass('text-red-500');
  });

  it('validates password meets all requirements', () => {
    render(<SignupForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });

    expect(screen.getByText(/at least 12 characters/i)).toHaveClass('text-green-500');
    expect(screen.getByText(/one uppercase/i)).toHaveClass('text-green-500');
    expect(screen.getByText(/one lowercase/i)).toHaveClass('text-green-500');
    expect(screen.getByText(/one number/i)).toHaveClass('text-green-500');
    expect(screen.getByText(/one symbol/i)).toHaveClass('text-green-500');
  });

  it('shows error when passwords do not match', async () => {
    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'SecurePass123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'DifferentPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('disables submit while loading', async () => {
    render(<SignupForm />);

    // Fill valid form
    // ...

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled();
  });
});
```

---

## 4. E2E Tests (Playwright)

Test complete user flows through the browser.

### Location
```
tests/e2e/
├── auth.spec.ts
└── fixtures/
    └── test-data.ts
```

### E2E Test Suite

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Parent Signup', () => {
    test('completes signup flow', async ({ page }) => {
      await page.goto('/signup');

      // Fill form
      await page.fill('[name="firstName"]', 'Test');
      await page.fill('[name="lastName"]', 'User');
      await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
      await page.fill('[name="phone"]', '555-1234');
      await page.fill('[name="password"]', 'SecurePass123!');
      await page.fill('[name="confirmPassword"]', 'SecurePass123!');

      // Submit
      await page.click('button[type="submit"]');

      // Should show confirmation page
      await expect(page.locator('text=Check your email')).toBeVisible();
    });

    test('shows validation errors for weak password', async ({ page }) => {
      await page.goto('/signup');

      await page.fill('[name="password"]', 'weak');

      await expect(page.locator('text=At least 12 characters')).toHaveClass(/red/);
    });
  });

  test.describe('Login', () => {
    test('redirects PARENT to dashboard', async ({ page }) => {
      // Use test account seeded in database
      await page.goto('/login');

      await page.fill('[name="email"]', 'parent@test.com');
      await page.fill('[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL('/dashboard');
    });

    test('redirects ACADEMY_ADMIN to organizer', async ({ page }) => {
      await page.goto('/login');

      await page.fill('[name="email"]', 'admin@test.com');
      await page.fill('[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL('/organizer');
    });

    test('shows error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.fill('[name="email"]', 'wrong@test.com');
      await page.fill('[name="password"]', 'WrongPassword123!');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Invalid email or password')).toBeVisible();
    });
  });

  test.describe('Password Reset', () => {
    test('completes password reset flow', async ({ page }) => {
      // Request reset
      await page.goto('/forgot-password');
      await page.fill('[name="email"]', 'parent@test.com');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=If your email is tied')).toBeVisible();

      // Check Inbucket for email (in real test, use API)
      // ...

      // Complete reset
      await page.goto('/reset-password'); // With valid session
      await page.fill('[name="password"]', 'NewSecurePass123!');
      await page.fill('[name="confirmPassword"]', 'NewSecurePass123!');
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Academy Invite', () => {
    test('completes invite acceptance flow', async ({ page }) => {
      // Create invite via API/SQL first
      const token = 'test-invite-token';

      await page.goto(`/invite/${token}`);

      // Should redirect to login if not authenticated
      await expect(page).toHaveURL(/\/login.*redirectTo/);

      // Login
      await page.fill('[name="email"]', 'invited@test.com');
      await page.fill('[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');

      // Should land on onboarding
      await expect(page).toHaveURL(/\/onboarding\/academy/);

      // Complete onboarding
      await page.fill('[name="academyName"]', 'Test Academy');
      await page.click('button[type="submit"]');

      // Should redirect to organizer
      await expect(page).toHaveURL('/organizer');
    });
  });
});
```

---

## 5. Manual Testing

### Using Inbucket (localhost:54324)

Access the email testing interface to verify email content and links.

**Checklist:**
- [ ] Signup sends confirmation email
- [ ] Email contains correct Tenpo branding
- [ ] Confirmation link works and redirects correctly
- [ ] Password reset sends email
- [ ] Reset link works
- [ ] Reset link expires after 1 hour

### Using Supabase Studio (localhost:54323)

Verify database state after operations.

**Checklist:**
- [ ] New signup creates profile with metadata (first_name, last_name, phone)
- [ ] New signup assigns PARENT role
- [ ] Invite acceptance creates academy with correct slug
- [ ] Invite acceptance assigns ACADEMY_ADMIN role
- [ ] Invite acceptance links user to academy as owner
- [ ] Invite marked as used (accepted_at set)

### Using Browser

**Auth Flows:**
- [ ] Parent signup (standalone from /signup)
- [ ] Parent signup (during checkout flow with redirectTo)
- [ ] Login with email/password
- [ ] Login with "Remember me" checked
- [ ] Login with Google OAuth
- [ ] Password reset flow end-to-end
- [ ] Academy invite acceptance (new user)
- [ ] Academy invite acceptance (existing user)
- [ ] Academy onboarding completion

**Protected Routes:**
- [ ] /dashboard requires authentication
- [ ] /organizer requires ACADEMY_ADMIN or SUPER_ADMIN
- [ ] Unauthenticated access redirects to /login
- [ ] /login preserves redirectTo param
- [ ] After login, redirectTo sends user to correct page
- [ ] PARENT cannot access /organizer (redirects to /dashboard)
- [ ] ACADEMY_ADMIN can access both /organizer and /dashboard

**Session:**
- [ ] Default session lasts 7 days
- [ ] "Remember me" extends session to 30 days
- [ ] Session refresh works (no unexpected logouts)
- [ ] Logout clears session completely

**Error Handling:**
- [ ] Invalid login shows "Invalid email or password"
- [ ] Rate limit shows generic error with support contact
- [ ] Expired invite shows clear error message
- [ ] Invalid invite token shows clear error message
- [ ] Slug collision shows "already taken" error

---

## Test Data Seeding

Add test accounts for E2E testing in `supabase/seed.sql`:

```sql
-- Test accounts for E2E tests (only in local/staging)
-- Password for all: TestPassword123!

-- Note: In real implementation, use Supabase's password hashing
-- This is illustrative - actual seeding may need adjustment

-- Test parent account
-- (Will be created via trigger which assigns PARENT role)

-- Test academy admin account
-- (Will need manual role assignment after creation)

-- Test invite for invite flow testing
INSERT INTO invites (token, email, type, created_by, expires_at)
SELECT
  'test-invite-token',
  'invited@test.com',
  'academy_owner',
  id,
  now() + interval '7 days'
FROM profiles
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@test.com')
LIMIT 1;
```

---

## Test Commands

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:db": "psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f tests/database/test_auth.sql",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "npm run test && npm run test:db && npm run test:e2e"
  }
}
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on:
  pull_request:
    branches: [main, dev]

jobs:
  unit-and-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase start
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
```

---

## Test Coverage Goals

| Area | Target Coverage |
|------|-----------------|
| RPC Functions | 100% |
| Auth Callback | 100% |
| Middleware | 100% |
| Form Components | 90% |
| E2E Critical Paths | 100% |

**Critical paths that must have E2E coverage:**
1. Parent signup → email confirm → dashboard
2. Login → role-based redirect
3. Password reset flow
4. Invite → login → onboarding → organizer

---

## Related Documents

- [Implementation Handoff](./handoff.md)
- [Scoping Questions](./scoping-questions.md)
- [FRD: Authentication](../frd/frd-02-authentication.md)
