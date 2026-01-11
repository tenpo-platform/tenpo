-- ============================================================================
-- Seed Data for Sprint 2
-- ============================================================================
-- Run after migrations with: supabase db reset
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Test Super Admin User
-- ----------------------------------------------------------------------------
-- Creates a test SUPER_ADMIN user for local development
-- Email: admin@tenpo.test
-- Password: TestAdmin123!

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone_change,
  phone_change_token,
  reauthentication_token
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '00000000-0000-0000-0000-000000000000',
  'admin@tenpo.test',
  crypt('TestAdmin123!', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Test", "last_name": "Admin"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
);

-- Identity record required for email/password login
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'admin@tenpo.test',
  'email',
  '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "email": "admin@tenpo.test", "email_verified": true}',
  now(),
  now(),
  now()
);

-- Profile is created by handle_new_user trigger, but we need to set SUPER_ADMIN role
-- (trigger assigns PARENT by default, so we replace it)
DELETE FROM user_roles WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
INSERT INTO user_roles (user_id, role, is_primary)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'SUPER_ADMIN', true);

-- ----------------------------------------------------------------------------
-- 1. Sports Lookup Data
-- ----------------------------------------------------------------------------

INSERT INTO sports (id, name, slug, is_active) VALUES
  (gen_random_uuid(), 'Soccer', 'soccer', true),
  (gen_random_uuid(), 'Basketball', 'basketball', true),
  (gen_random_uuid(), 'Baseball', 'baseball', true),
  (gen_random_uuid(), 'Football', 'football', true),
  (gen_random_uuid(), 'Tennis', 'tennis', true),
  (gen_random_uuid(), 'Swimming', 'swimming', true),
  (gen_random_uuid(), 'Volleyball', 'volleyball', true),
  (gen_random_uuid(), 'Lacrosse', 'lacrosse', true);

-- ----------------------------------------------------------------------------
-- 2. DivineTime Academy
-- ----------------------------------------------------------------------------

INSERT INTO academies (id, name, slug, description, email)
VALUES (
  gen_random_uuid(),
  'DivineTime Training',
  'divinetime',
  'Elite soccer training in the Bay Area',
  'info@joindivinetime.com'
);

-- ----------------------------------------------------------------------------
-- 3. Luca Admin Link
-- ----------------------------------------------------------------------------
-- NOTE: The following must be run AFTER Luca signs up via Supabase Auth.
-- Replace <LUCA_USER_ID> with his actual user ID from auth.users/profiles.
--
-- To find Luca's user ID after signup:
--   SELECT id FROM auth.users WHERE email = 'luca@joindivinetime.com';
--
-- Then run these INSERT statements manually or via a migration:
-- ----------------------------------------------------------------------------

-- Link Luca as DivineTime owner (uncomment and run after signup):
/*
INSERT INTO academy_admins (academy_id, user_id, role)
SELECT a.id, '<LUCA_USER_ID>'::uuid, 'owner'
FROM academies a
WHERE a.slug = 'divinetime';

INSERT INTO user_roles (user_id, role, is_primary)
VALUES ('<LUCA_USER_ID>'::uuid, 'ACADEMY_ADMIN', true);
*/

-- Alternative: If you know Luca's email and he has already signed up,
-- you can use this pattern to link by email lookup:
/*
DO $$
DECLARE
  luca_id uuid;
BEGIN
  -- Get Luca's user ID by email
  SELECT id INTO luca_id FROM auth.users WHERE email = 'luca@joindivinetime.com';

  IF luca_id IS NOT NULL THEN
    -- Link as academy owner
    INSERT INTO academy_admins (academy_id, user_id, role)
    SELECT a.id, luca_id, 'owner'
    FROM academies a
    WHERE a.slug = 'divinetime'
    ON CONFLICT (academy_id, user_id) DO NOTHING;

    -- Grant ACADEMY_ADMIN role
    INSERT INTO user_roles (user_id, role, is_primary)
    VALUES (luca_id, 'ACADEMY_ADMIN', true)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;
*/
