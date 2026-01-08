-- ============================================================================
-- Seed Data for Sprint 2
-- ============================================================================
-- Run after migrations with: supabase db reset
-- ============================================================================

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
