-- ============================================================================
-- [PUBLIC] Phase - Registration Flow
-- Sprint 2 Database Schema Migration
-- ============================================================================
-- Tables: athletes, athlete_guardians, athlete_medical, waivers, event_waivers,
--         waiver_signatures, event_registrations
-- ENUMs: registration_status
-- Triggers: athletes, athlete_medical, event_registrations, waivers
-- RLS: All tables
-- RPCs: reserve_ticket
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENUM Types
-- ----------------------------------------------------------------------------

CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'canceled', 'refunded', 'completed');

-- ----------------------------------------------------------------------------
-- 2. Tables
-- ----------------------------------------------------------------------------

-- athletes: children/players managed by parents
CREATE TABLE athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id), -- NULL for parent-managed athletes
  first_name text NOT NULL,
  last_name text NOT NULL,
  birthdate date NOT NULL,
  skill_level text,
  team text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- athlete_guardians: links athletes to their guardians (parents)
CREATE TABLE athlete_guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  guardian_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship text,
  is_primary boolean NOT NULL DEFAULT false,
  can_book boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (athlete_id, guardian_id)
);

-- athlete_medical: sensitive PII with stricter access (emergency contacts, allergies)
CREATE TABLE athlete_medical (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL UNIQUE REFERENCES athletes(id) ON DELETE CASCADE,
  allergies text[],
  medical_conditions jsonb,
  emergency_contact jsonb NOT NULL, -- {first_name, last_name, phone, relationship}
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- waivers: liability waivers with versioning
CREATE TABLE waivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES academies(id) ON DELETE CASCADE,
  coach_id uuid, -- FK added in future phase
  name text NOT NULL,
  content text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- event_waivers: links waivers to events
CREATE TABLE event_waivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  waiver_id uuid NOT NULL REFERENCES waivers(id) ON DELETE CASCADE,
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, waiver_id)
);

-- waiver_signatures: tracks who signed what waiver
CREATE TABLE waiver_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  waiver_id uuid NOT NULL REFERENCES waivers(id),
  waiver_version integer NOT NULL,
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  signed_by_user_id uuid NOT NULL REFERENCES profiles(id),
  event_id uuid REFERENCES events(id),
  ip_address text,
  user_agent text,
  signature_method text NOT NULL, -- 'checkbox' or 'document'
  document_url text,
  signed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (waiver_id, athlete_id, event_id, waiver_version)
);

-- event_registrations: tracks athlete registrations for events
CREATE TABLE event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  event_ticket_id uuid NOT NULL REFERENCES event_tickets(id),
  athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  registered_by uuid NOT NULL REFERENCES profiles(id),
  payment_id uuid, -- FK added in STRIPE phase
  status registration_status NOT NULL DEFAULT 'pending',
  price_paid_cents integer NOT NULL,
  ticket_price_cents integer NOT NULL,
  discount_cents integer NOT NULL DEFAULT 0,
  fees_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  promo_code_id uuid, -- FK added later if promo codes enabled
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, athlete_id)
);

-- ----------------------------------------------------------------------------
-- 3. Triggers
-- ----------------------------------------------------------------------------

CREATE TRIGGER trg_athletes_updated_at
  BEFORE UPDATE ON athletes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_athlete_medical_updated_at
  BEFORE UPDATE ON athlete_medical
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_event_registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_waivers_updated_at
  BEFORE UPDATE ON waivers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Indexes
-- ----------------------------------------------------------------------------

CREATE INDEX idx_registrations_event ON event_registrations(event_id, status);
CREATE INDEX idx_registrations_athlete ON event_registrations(athlete_id);
CREATE INDEX idx_registrations_created ON event_registrations(created_at);

-- ----------------------------------------------------------------------------
-- 5. Row Level Security (RLS)
-- ----------------------------------------------------------------------------

ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_medical ENABLE ROW LEVEL SECURITY;
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiver_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- athletes: INSERT allowed for parent-managed or self-managed
-- Note: App must immediately create guardian link after INSERT
CREATE POLICY athletes_insert ON athletes
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- athletes: SELECT only if you're a guardian
CREATE POLICY athletes_select ON athletes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM athlete_guardians
      WHERE athlete_id = athletes.id
        AND guardian_id = auth.uid()
    )
  );

-- athletes: UPDATE only if you're a guardian
CREATE POLICY athletes_update ON athletes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM athlete_guardians
      WHERE athlete_id = athletes.id
        AND guardian_id = auth.uid()
    )
  );

-- athletes: DELETE only if you're a guardian
CREATE POLICY athletes_delete ON athletes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM athlete_guardians
      WHERE athlete_id = athletes.id
        AND guardian_id = auth.uid()
    )
  );

-- athlete_guardians: full CRUD for guardian themselves
CREATE POLICY athlete_guardians_select ON athlete_guardians
  FOR SELECT USING (guardian_id = auth.uid());

CREATE POLICY athlete_guardians_insert ON athlete_guardians
  FOR INSERT WITH CHECK (guardian_id = auth.uid());

CREATE POLICY athlete_guardians_update ON athlete_guardians
  FOR UPDATE USING (guardian_id = auth.uid())
  WITH CHECK (guardian_id = auth.uid());

CREATE POLICY athlete_guardians_delete ON athlete_guardians
  FOR DELETE USING (guardian_id = auth.uid());

-- athlete_medical: strict guardian-only access
CREATE POLICY athlete_medical_select ON athlete_medical
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM athlete_guardians ag
      WHERE ag.athlete_id = athlete_medical.athlete_id
        AND ag.guardian_id = auth.uid()
    )
  );

CREATE POLICY athlete_medical_insert ON athlete_medical
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM athlete_guardians ag
      WHERE ag.athlete_id = athlete_medical.athlete_id
        AND ag.guardian_id = auth.uid()
    )
  );

CREATE POLICY athlete_medical_update ON athlete_medical
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM athlete_guardians ag
      WHERE ag.athlete_id = athlete_medical.athlete_id
        AND ag.guardian_id = auth.uid()
    )
  );

-- waivers: anyone can read active waivers (for signing)
CREATE POLICY waivers_select ON waivers
  FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- waivers: academy admins can manage waivers
CREATE POLICY waivers_insert ON waivers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM academy_admins aa
      WHERE aa.academy_id = waivers.academy_id
        AND aa.user_id = auth.uid()
    )
  );

CREATE POLICY waivers_update ON waivers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM academy_admins aa
      WHERE aa.academy_id = waivers.academy_id
        AND aa.user_id = auth.uid()
    )
  );

CREATE POLICY waivers_delete ON waivers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM academy_admins aa
      WHERE aa.academy_id = waivers.academy_id
        AND aa.user_id = auth.uid()
    )
  );

-- event_waivers: anyone can read (to know what to sign)
CREATE POLICY event_waivers_select ON event_waivers
  FOR SELECT USING (true);

-- event_waivers: academy admins can manage
CREATE POLICY event_waivers_insert ON event_waivers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = event_waivers.event_id
        AND aa.user_id = auth.uid()
    )
  );

CREATE POLICY event_waivers_update ON event_waivers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = event_waivers.event_id
        AND aa.user_id = auth.uid()
    )
  );

CREATE POLICY event_waivers_delete ON event_waivers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = event_waivers.event_id
        AND aa.user_id = auth.uid()
    )
  );

-- waiver_signatures: guardians can sign waivers for their athletes
CREATE POLICY waiver_signatures_insert ON waiver_signatures
  FOR INSERT WITH CHECK (
    signed_by_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM athlete_guardians ag
      WHERE ag.athlete_id = waiver_signatures.athlete_id
        AND ag.guardian_id = auth.uid()
    )
  );

-- waiver_signatures: guardians can view their signatures
CREATE POLICY waiver_signatures_select_own ON waiver_signatures
  FOR SELECT USING (signed_by_user_id = auth.uid());

-- waiver_signatures: academy admins can view signatures for their events
CREATE POLICY waiver_signatures_select_admin ON waiver_signatures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = waiver_signatures.event_id
        AND aa.user_id = auth.uid()
    )
  );

-- event_registrations: users can see their own registrations
CREATE POLICY registrations_select_own ON event_registrations
  FOR SELECT USING (registered_by = auth.uid());

-- event_registrations: academy admins can see all registrations for their events
CREATE POLICY registrations_select_admin ON event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = event_registrations.event_id
        AND aa.user_id = auth.uid()
    )
  );

-- event_registrations: parents can register their athletes
CREATE POLICY registrations_insert ON event_registrations
  FOR INSERT WITH CHECK (
    registered_by = auth.uid()
    AND (
      -- Guardian registering their athlete
      EXISTS (
        SELECT 1 FROM athlete_guardians ag
        WHERE ag.athlete_id = event_registrations.athlete_id
          AND ag.guardian_id = auth.uid()
      )
      -- OR self-managed athlete
      OR EXISTS (
        SELECT 1 FROM athletes a
        WHERE a.id = event_registrations.athlete_id
          AND a.user_id = auth.uid()
      )
    )
  );

-- event_registrations: users can update their own (e.g., cancel)
CREATE POLICY registrations_update_own ON event_registrations
  FOR UPDATE USING (registered_by = auth.uid())
  WITH CHECK (registered_by = auth.uid());

-- event_registrations: academy admins can update (e.g., confirm, complete)
CREATE POLICY registrations_update_admin ON event_registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = event_registrations.event_id
        AND aa.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 6. Security-Definer RPCs
-- ----------------------------------------------------------------------------

-- Atomic ticket reservation to prevent overselling
CREATE OR REPLACE FUNCTION reserve_ticket(p_ticket_id uuid)
RETURNS uuid
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  UPDATE event_tickets
  SET quantity_sold = quantity_sold + 1
  WHERE id = p_ticket_id
    AND (capacity IS NULL OR quantity_sold < capacity)
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Ticket sold out';
  END IF;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;
