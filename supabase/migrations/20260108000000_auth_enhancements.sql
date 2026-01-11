-- ============================================================================
-- [AUTH] Authentication Enhancements (Squashed)
-- Sprint 2 - Consolidated Migration
-- ============================================================================
-- Includes:
-- - Invites table + RLS
-- - Role-specific onboarding flags
-- - handle_new_user trigger function (final)
-- - accept_invite RPC (final)
-- - get_invite_context RPC (final)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Invites Table
-- ----------------------------------------------------------------------------

CREATE TABLE invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  email text NOT NULL,
  type text NOT NULL CHECK (type IN ('academy_owner', 'academy_admin', 'academy_manager')),
  academy_id uuid REFERENCES academies(id),
  created_by uuid NOT NULL REFERENCES profiles(id),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invites_token ON invites(token) WHERE accepted_at IS NULL;
CREATE INDEX idx_invites_email ON invites(email) WHERE accepted_at IS NULL;

-- ----------------------------------------------------------------------------
-- 2. Row Level Security for Invites
-- ----------------------------------------------------------------------------

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY invites_insert ON invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY invites_select ON invites
  FOR SELECT USING (
    email = (auth.jwt() ->> 'email')
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY invites_update ON invites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY invites_delete ON invites
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- ----------------------------------------------------------------------------
-- 3. Role-Specific Onboarding Flags
-- ----------------------------------------------------------------------------

ALTER TABLE profiles
ADD COLUMN parent_onboarding_completed boolean NOT NULL DEFAULT false;

ALTER TABLE profiles
ADD COLUMN academy_admin_onboarding_completed boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles.parent_onboarding_completed IS
  'Whether user has completed parent onboarding (add children, payment method, etc.)';

COMMENT ON COLUMN profiles.academy_admin_onboarding_completed IS
  'Whether user has completed academy admin onboarding (Stripe setup, first camp, etc.)';

ALTER TABLE profiles
DROP COLUMN onboarding_completed;

-- ----------------------------------------------------------------------------
-- 4. handle_new_user Trigger Function (Final)
-- ----------------------------------------------------------------------------
-- Creates profile, auto-confirms invited emails, assigns default roles.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_has_pending_invite boolean;
  v_first_name text;
  v_last_name text;
  v_full_name text;
  v_name_parts text[];
  v_avatar_url text;
BEGIN
  v_first_name := NEW.raw_user_meta_data->>'first_name';
  v_last_name := NEW.raw_user_meta_data->>'last_name';

  IF v_first_name IS NULL THEN
    v_full_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    );

    IF v_full_name IS NOT NULL AND trim(v_full_name) != '' THEN
      v_name_parts := string_to_array(trim(v_full_name), ' ');
      v_first_name := v_name_parts[1];
      IF array_length(v_name_parts, 1) > 1 THEN
        v_last_name := array_to_string(v_name_parts[2:], ' ');
      END IF;
    END IF;
  END IF;

  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'picture',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    phone_number,
    avatar_url
  ) VALUES (
    NEW.id,
    v_first_name,
    v_last_name,
    NEW.raw_user_meta_data->>'phone_number',
    v_avatar_url
  );

  SELECT EXISTS (
    SELECT 1 FROM public.invites
    WHERE email = NEW.email
      AND accepted_at IS NULL
      AND expires_at > now()
  ) INTO v_has_pending_invite;

  IF v_has_pending_invite THEN
    UPDATE auth.users
    SET email_confirmed_at = now()
    WHERE id = NEW.id AND email_confirmed_at IS NULL;

    INSERT INTO public.user_roles (user_id, role, is_primary)
    VALUES (NEW.id, 'ACADEMY_ADMIN', true)
    ON CONFLICT (user_id, role) DO UPDATE SET is_primary = true;
  ELSE
    INSERT INTO public.user_roles (user_id, role, is_primary)
    VALUES (NEW.id, 'PARENT', true);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 5. accept_invite RPC (Final)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION accept_invite(
  p_token text,
  p_academy_name text DEFAULT NULL,
  p_academy_description text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite invites%ROWTYPE;
  v_user_id uuid := auth.uid();
  v_user_email text;
  v_academy_id uuid;
  v_slug text;
BEGIN
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  SELECT * INTO v_invite FROM invites
  WHERE token = p_token
    AND accepted_at IS NULL
    AND expires_at > now();

  IF v_invite.id IS NULL THEN
    RETURN json_build_object('error', 'Invalid or expired invite');
  END IF;

  IF v_invite.email != v_user_email THEN
    RETURN json_build_object('error', 'Invite was sent to a different email');
  END IF;

  IF v_invite.type = 'academy_owner' THEN
    IF p_academy_name IS NULL OR trim(p_academy_name) = '' THEN
      RETURN json_build_object('error', 'Academy name required');
    END IF;

    v_slug := lower(regexp_replace(trim(p_academy_name), '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := trim(both '-' from v_slug);

    IF v_slug = '' THEN
      RETURN json_build_object('error', 'Invalid academy name');
    END IF;

    IF v_slug = ANY(ARRAY[
      'admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'test', 'null', 'undefined'
    ]) THEN
      RETURN json_build_object('error', 'This name is reserved. Please choose a different name.');
    END IF;

    IF EXISTS (SELECT 1 FROM academies WHERE slug = v_slug AND deleted_at IS NULL) THEN
      RETURN json_build_object('error', 'Academy URL already taken. Please choose a different name.');
    END IF;

    INSERT INTO academies (name, slug, description)
    VALUES (p_academy_name, v_slug, p_academy_description)
    RETURNING id INTO v_academy_id;

    INSERT INTO academy_admins (academy_id, user_id, role)
    VALUES (v_academy_id, v_user_id, 'owner');
  ELSE
    IF v_invite.academy_id IS NULL THEN
      RETURN json_build_object('error', 'Invite missing academy reference');
    END IF;

    v_academy_id := v_invite.academy_id;

    INSERT INTO academy_admins (academy_id, user_id, role)
    VALUES (v_academy_id, v_user_id,
      CASE v_invite.type
        WHEN 'academy_admin' THEN 'admin'
        WHEN 'academy_manager' THEN 'manager'
        ELSE 'admin'
      END
    );
  END IF;

  UPDATE user_roles
  SET is_primary = false
  WHERE user_id = v_user_id;

  INSERT INTO user_roles (user_id, role, is_primary)
  VALUES (v_user_id, 'ACADEMY_ADMIN', true)
  ON CONFLICT (user_id, role) DO UPDATE SET is_primary = true;

  UPDATE profiles
  SET academy_admin_onboarding_completed = false
  WHERE id = v_user_id;

  UPDATE invites SET accepted_at = now() WHERE id = v_invite.id;

  RETURN json_build_object(
    'success', true,
    'academy_id', v_academy_id,
    'slug', v_slug
  );
END;
$$;

GRANT EXECUTE ON FUNCTION accept_invite(text, text, text) TO authenticated;

-- ----------------------------------------------------------------------------
-- 6. get_invite_context RPC (Final)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_invite_context(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite invites%ROWTYPE;
  v_inviter_name text;
  v_has_account boolean := false;
BEGIN
  SELECT * INTO v_invite FROM invites
  WHERE token = p_token
    AND accepted_at IS NULL
    AND expires_at > now();

  IF v_invite.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT NULLIF(trim(concat_ws(' ', first_name, last_name)), '')
  INTO v_inviter_name
  FROM profiles
  WHERE id = v_invite.created_by;

  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE lower(email) = lower(v_invite.email)
  ) INTO v_has_account;

  RETURN json_build_object(
    'email', v_invite.email,
    'inviter_name', v_inviter_name,
    'type', v_invite.type,
    'has_account', v_has_account
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_invite_context(text) TO anon, authenticated;
