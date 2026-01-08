-- ============================================================================
-- [ADMIN] Phase - Academy & Event Management
-- Sprint 2 Database Schema Migration
-- ============================================================================
-- Tables: academies, academy_admins, locations, events, event_days, event_tickets
-- ENUMs: event_status, location_visibility
-- Triggers: academies, events, locations, event_tickets
-- RLS: academies, locations, events
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENUM Types
-- ----------------------------------------------------------------------------

CREATE TYPE event_status AS ENUM ('draft', 'published', 'canceled', 'completed');
CREATE TYPE location_visibility AS ENUM ('public', 'private');

-- ----------------------------------------------------------------------------
-- 2. Tables
-- ----------------------------------------------------------------------------

-- academies: multi-tenant organizations (e.g., DivineTime)
CREATE TABLE academies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  logo_url text,
  cover_image_url text,
  website text,
  email text,
  phone text,
  stripe_account_id text,
  stripe_onboarding_complete boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- academy_admins: links users to academies with role
CREATE TABLE academy_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL, -- 'owner', 'admin', 'manager'
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (academy_id, user_id)
);

-- locations: venues for events
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'US',
  latitude decimal(10,8),
  longitude decimal(11,8),
  facility_type text,
  is_indoor boolean,
  capacity integer,
  amenities text[],
  photos text[],
  timezone text,
  visibility location_visibility NOT NULL DEFAULT 'public',
  created_by uuid REFERENCES profiles(id),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- events: camps and clinics
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  sport_id uuid NOT NULL REFERENCES sports(id),
  location_id uuid REFERENCES locations(id),
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  event_type text NOT NULL, -- 'CAMP' or 'CLINIC'
  image_url text,
  min_age integer,
  max_age integer,
  skill_levels text[],
  is_virtual boolean NOT NULL DEFAULT false,
  timezone text NOT NULL,
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  cancellation_policy_hours integer NOT NULL DEFAULT 48,
  status event_status NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES profiles(id),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- event_days: individual days for multi-day events
CREATE TABLE event_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- event_tickets: ticket tiers with pricing and capacity
CREATE TABLE event_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price integer NOT NULL, -- cents
  capacity integer,       -- NULL = unlimited
  quantity_sold integer NOT NULL DEFAULT 0,
  min_age integer,
  max_age integer,
  sales_start_at timestamptz,
  sales_end_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. Triggers
-- ----------------------------------------------------------------------------

CREATE TRIGGER trg_academies_updated_at
  BEFORE UPDATE ON academies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_event_tickets_updated_at
  BEFORE UPDATE ON event_tickets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Indexes
-- ----------------------------------------------------------------------------

CREATE UNIQUE INDEX idx_academies_slug ON academies(slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_events_slug ON events(academy_id, slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_discovery ON events(academy_id, status, sport_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_location ON events(location_id) WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- 5. Row Level Security (RLS)
-- ----------------------------------------------------------------------------

ALTER TABLE academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tickets ENABLE ROW LEVEL SECURITY;

-- academies: public can view active academies
CREATE POLICY academies_select ON academies
  FOR SELECT USING (deleted_at IS NULL);

-- academies: only SUPER_ADMIN can create academies
CREATE POLICY academies_insert ON academies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'SUPER_ADMIN'
    )
  );

-- academies: academy admins can update, SUPER_ADMIN can update any
CREATE POLICY academies_update ON academies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM academy_admins
      WHERE academy_id = academies.id
        AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'SUPER_ADMIN'
    )
  );

-- academies: owners can delete their academy, SUPER_ADMIN can delete any
CREATE POLICY academies_delete ON academies
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM academy_admins
      WHERE academy_id = academies.id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'SUPER_ADMIN'
    )
  );

-- academy_admins: admins can view their own academy's admins, SUPER_ADMIN can view all
CREATE POLICY academy_admins_select ON academy_admins
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM academy_admins aa
      WHERE aa.academy_id = academy_admins.academy_id
        AND aa.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'SUPER_ADMIN'
    )
  );

-- academy_admins: owners can add admins, SUPER_ADMIN can bootstrap first owner
CREATE POLICY academy_admins_insert ON academy_admins
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM academy_admins aa
      WHERE aa.academy_id = academy_admins.academy_id
        AND aa.user_id = auth.uid()
        AND aa.role = 'owner'
    )
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'SUPER_ADMIN'
    )
  );

-- academy_admins: owners can remove admins, SUPER_ADMIN can fix mistakes
CREATE POLICY academy_admins_delete ON academy_admins
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM academy_admins aa
      WHERE aa.academy_id = academy_admins.academy_id
        AND aa.user_id = auth.uid()
        AND aa.role = 'owner'
    )
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'SUPER_ADMIN'
    )
  );

-- locations: public visible to all, private only to creator
CREATE POLICY locations_select ON locations
  FOR SELECT USING (visibility = 'public' OR created_by = auth.uid());

CREATE POLICY locations_insert ON locations
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY locations_update ON locations
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY locations_delete ON locations
  FOR DELETE USING (created_by = auth.uid());

-- events: public can view published events
CREATE POLICY events_select_public ON events
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

-- events: academy admins can view all their events (any status)
CREATE POLICY events_select_admin ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM academy_admins
      WHERE academy_id = events.academy_id
        AND user_id = auth.uid()
    )
  );

-- events: academy admins can create events
CREATE POLICY events_insert ON events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM academy_admins
      WHERE academy_id = events.academy_id
        AND user_id = auth.uid()
    )
  );

-- events: academy admins can update their events
CREATE POLICY events_update ON events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM academy_admins
      WHERE academy_id = events.academy_id
        AND user_id = auth.uid()
    )
  );

-- events: academy admins can delete their events
CREATE POLICY events_delete ON events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM academy_admins
      WHERE academy_id = events.academy_id
        AND user_id = auth.uid()
    )
  );

-- event_days: same access as parent event
CREATE POLICY event_days_select ON event_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_days.event_id
        AND (
          (e.status = 'published' AND e.deleted_at IS NULL)
          OR EXISTS (
            SELECT 1 FROM academy_admins aa
            WHERE aa.academy_id = e.academy_id
              AND aa.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY event_days_insert ON event_days
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = event_days.event_id
        AND aa.user_id = auth.uid()
    )
  );

CREATE POLICY event_days_update ON event_days
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = event_days.event_id
        AND aa.user_id = auth.uid()
    )
  );

CREATE POLICY event_days_delete ON event_days
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = event_days.event_id
        AND aa.user_id = auth.uid()
    )
  );

-- event_tickets: same access as parent event
CREATE POLICY event_tickets_select ON event_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_tickets.event_id
        AND (
          (e.status = 'published' AND e.deleted_at IS NULL)
          OR EXISTS (
            SELECT 1 FROM academy_admins aa
            WHERE aa.academy_id = e.academy_id
              AND aa.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY event_tickets_insert ON event_tickets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = event_tickets.event_id
        AND aa.user_id = auth.uid()
    )
  );

CREATE POLICY event_tickets_update ON event_tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = event_tickets.event_id
        AND aa.user_id = auth.uid()
    )
  );

CREATE POLICY event_tickets_delete ON event_tickets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = event_tickets.event_id
        AND aa.user_id = auth.uid()
    )
  );
