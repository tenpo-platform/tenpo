-- ============================================================================
-- [DB] Phase - Core Foundation
-- Sprint 2 Database Schema Migration
-- ============================================================================
-- Tables: profiles, user_roles, sports
-- ENUMs: user_role
-- Triggers: set_updated_at
-- RLS: profiles, user_roles
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENUM Types
-- ----------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('PARENT', 'ATHLETE', 'COACH', 'ACADEMY_ADMIN', 'SUPER_ADMIN', 'STAFF');

-- ----------------------------------------------------------------------------
-- 2. Tables
-- ----------------------------------------------------------------------------

-- profiles: extends auth.users with application-specific fields
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  phone_number text,
  avatar_url text,
  timezone text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- user_roles: supports multi-role users (e.g., PARENT + COACH)
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES profiles(id),
  UNIQUE (user_id, role)
);

-- sports: lookup table for event categorization
CREATE TABLE sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  icon_url text,
  is_active boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. Triggers & Functions
-- ----------------------------------------------------------------------------

-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Indexes
-- ----------------------------------------------------------------------------

CREATE UNIQUE INDEX idx_sports_slug ON sports(slug) WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- 5. Row Level Security (RLS)
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;

-- profiles: anyone can read (for display names), only owner can update
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (true);

CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (id = auth.uid());

-- user_roles: users can see their own roles
CREATE POLICY user_roles_select ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- sports: public read access
CREATE POLICY sports_select ON sports
  FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- sports: SUPER_ADMIN can manage sports
CREATE POLICY sports_insert ON sports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY sports_update ON sports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY sports_delete ON sports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'SUPER_ADMIN'
    )
  );

-- ----------------------------------------------------------------------------
-- 6. Auth Trigger: Auto-create profile on signup
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
