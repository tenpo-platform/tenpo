# Phased Schema — Sprint 2

This document maps the V2 schema elements to Sprint 2 checklist phases. Only implement what's needed for each phase; defer the rest.

**Source:** `schema-proposal-V2.md`
**Sprint Timeline:** January 5–18, 2026

---

## Phase Legend

| Tag | Phase | Checklist Section |
|-----|-------|-------------------|
| `[DB]` | Database Schema | Core migration, must exist first |
| `[AUTH]` | Auth | Login, signup, password reset |
| `[ADMIN]` | Admin Dashboard | Camp CRUD, roster view |
| `[PUBLIC]` | Public Marketplace | Browse, register, parent dashboard |
| `[STRIPE]` | Stripe Integration | Payments (stretch goal) |
| `[DEFER]` | Deferred | Not needed in Sprint 2 |

---

## 1. ENUM Types

ENUMs are created in the same phase as the first table that uses them. This ensures each phase is self-contained and can be deployed independently.

```sql
-- [DB] Required for user_roles.role
CREATE TYPE user_role AS ENUM ('PARENT', 'ATHLETE', 'COACH', 'ACADEMY_ADMIN', 'SUPER_ADMIN', 'STAFF');

-- [ADMIN] Required for events.status
CREATE TYPE event_status AS ENUM ('draft', 'published', 'canceled', 'completed');

-- [ADMIN] Required for locations.visibility
CREATE TYPE location_visibility AS ENUM ('public', 'private');

-- [PUBLIC] Required for event_registrations.status
CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'canceled', 'refunded', 'completed');

-- [STRIPE] Required for payments.status
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- [STRIPE] Required for refunds.status
CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- [STRIPE] Required for payments.payment_source
CREATE TYPE payment_source AS ENUM ('stripe', 'free', 'comp');

-- [DEFER] Not needed until coach/academy approval workflow
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
```

**Summary:**
- `[DB]`: `user_role`
- `[ADMIN]`: `event_status`, `location_visibility`
- `[PUBLIC]`: `registration_status`
- `[STRIPE]`: `payment_status`, `refund_status`, `payment_source`
- `[DEFER]`: `approval_status`

---

## 2. Tables by Phase

### `[DB]` — Database Schema (Core Foundation)

These tables must exist before anything else. Created in the initial migration.

| Table | Why Needed |
|-------|------------|
| `profiles` | Extends auth.users; all features depend on this |
| `user_roles` | Role-based routing after login |
| `sports` | Lookup table; events require sport_id |

**Minimal `profiles`:**
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
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
```

**Minimal `user_roles`:**
```sql
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES profiles(id),
  UNIQUE (user_id, role)
);
```

**Minimal `sports`:**
```sql
CREATE TABLE sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  icon_url text,
  is_active boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_sports_slug ON sports(slug) WHERE deleted_at IS NULL;
```

---

### `[AUTH]` — Auth

No additional tables required. Auth uses:
- `profiles` — created in `[DB]`
- `user_roles` — created in `[DB]`
- `auth.users` — managed by Supabase

**Auth Flow Dependencies:**
- Signup → create profile + user_role (PARENT for now)
- Login → fetch profile + roles for routing
- Password reset → uses Supabase auth, no custom tables

---

### `[ADMIN]` — Admin Dashboard

Tables needed for organizer dashboard, camp list, camp create/edit, and roster view.

| Table | Why Needed |
|-------|------------|
| `academies` | DivineTime is an academy; events belong to academies |
| `academy_admins` | Links Luca to DivineTime as owner |
| `locations` | Events need a location |
| `events` | Core: camp list, create, edit |
| `event_days` | Multi-day camps need day breakdown |
| `event_tickets` | Ticket tiers with capacity |

**Table: `academies`**
```sql
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
  stripe_account_id text,                          -- [STRIPE] can be NULL initially
  stripe_onboarding_complete boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  -- DEFER: approval_status, approved_by, approved_at, rejected_by, rejected_at, review_notes
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_academies_slug ON academies(slug) WHERE deleted_at IS NULL;
```

**Table: `academy_admins`**
```sql
CREATE TABLE academy_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL, -- 'owner', 'admin', 'manager'
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (academy_id, user_id)
);
```

**Table: `locations`**
```sql
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
```

**Table: `events`**
```sql
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

CREATE UNIQUE INDEX idx_events_slug ON events(academy_id, slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_discovery ON events(academy_id, status, sport_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_location ON events(location_id) WHERE deleted_at IS NULL;
```

**Table: `event_days`**
```sql
CREATE TABLE event_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**Table: `event_tickets`**
```sql
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
```

---

### `[PUBLIC]` — Public Marketplace

Tables needed for camp browse, camp detail, registration flow, and parent dashboard.

| Table | Why Needed |
|-------|------------|
| `athletes` | Parents register athletes for camps |
| `athlete_guardians` | Links athletes to parents |
| `athlete_medical` | Emergency contact required for registration |
| `event_registrations` | Core: tracks who registered for what |
| `waivers` | Camps may require liability waivers |
| `event_waivers` | Links waivers to events |
| `waiver_signatures` | Tracks who signed what |

**Table: `athletes`**
```sql
CREATE TABLE athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id), -- NULL in MVP (parent-managed)
  first_name text NOT NULL,
  last_name text NOT NULL,
  birthdate date NOT NULL,
  skill_level text,
  team text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Table: `athlete_guardians`**
```sql
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
```

**Table: `athlete_medical`**
```sql
CREATE TABLE athlete_medical (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL UNIQUE REFERENCES athletes(id) ON DELETE CASCADE,
  allergies text[],
  medical_conditions jsonb,
  emergency_contact jsonb NOT NULL, -- {first_name, last_name, phone, relationship}
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Table: `event_registrations`**
```sql
CREATE TABLE event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  event_ticket_id uuid NOT NULL REFERENCES event_tickets(id),
  athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  registered_by uuid NOT NULL REFERENCES profiles(id),
  payment_id uuid, -- FK added in [STRIPE] phase
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

CREATE INDEX idx_registrations_event ON event_registrations(event_id, status);
CREATE INDEX idx_registrations_athlete ON event_registrations(athlete_id);
CREATE INDEX idx_registrations_created ON event_registrations(created_at);
```

**Table: `waivers`**
```sql
CREATE TABLE waivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES academies(id) ON DELETE CASCADE,
  coach_id uuid, -- FK added in [DEFER] phase
  name text NOT NULL,
  content text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Table: `event_waivers`**
```sql
CREATE TABLE event_waivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  waiver_id uuid NOT NULL REFERENCES waivers(id) ON DELETE CASCADE,
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, waiver_id)
);
```

**Table: `waiver_signatures`**
```sql
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
```

---

### `[STRIPE]` — Stripe Integration (Stretch)

Tables needed for Stripe Connect, checkout, and webhooks.

| Table | Why Needed |
|-------|------------|
| `payments` | Records successful payments |
| `refunds` | Handles refund requests |
| `payouts` | Tracks payouts to DivineTime (Stripe Connect) |

**Table: `payments`**
```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  academy_id uuid REFERENCES academies(id),
  event_id uuid REFERENCES events(id),
  payment_source payment_source NOT NULL DEFAULT 'stripe',
  stripe_payment_intent_id text,
  stripe_customer_id text,
  amount integer NOT NULL, -- cents
  platform_fee integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method text,
  receipt_email text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_user ON payments(user_id, status);
CREATE INDEX idx_payments_event ON payments(event_id);
CREATE INDEX idx_payments_created ON payments(created_at);

-- Add FK to event_registrations
ALTER TABLE event_registrations
  ADD CONSTRAINT fk_registrations_payment
  FOREIGN KEY (payment_id) REFERENCES payments(id);

CREATE UNIQUE INDEX idx_registrations_payment ON event_registrations(payment_id) WHERE payment_id IS NOT NULL;
```

**Table: `refunds`**
```sql
CREATE TABLE refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES payments(id),
  registration_id uuid REFERENCES event_registrations(id),
  stripe_refund_id text,
  amount integer NOT NULL, -- cents
  reason text,
  status refund_status NOT NULL DEFAULT 'pending',
  requested_by uuid NOT NULL REFERENCES profiles(id),
  processed_by uuid REFERENCES profiles(id),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**Table: `payouts`**
```sql
CREATE TABLE payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES academies(id),
  coach_id uuid, -- FK added in [DEFER] phase
  event_id uuid REFERENCES events(id),
  payment_id uuid REFERENCES payments(id),
  stripe_transfer_id text NOT NULL,
  stripe_balance_transaction_id text,
  amount integer NOT NULL,
  platform_fee integer,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL, -- 'pending', 'in_transit', 'paid', 'failed'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

---

### `[DEFER]` — Deferred to Future Sprints

These tables are in V2 but NOT needed for Sprint 2.

| Table | Why Deferred |
|-------|--------------|
| `coaches` | No individual sessions in Sprint 2 |
| `coach_sports` | Depends on coaches |
| `coach_specialties` | Depends on coaches |
| `specialties` | Only needed for coach filtering |
| `academy_coaches` | No coach-academy linking needed yet |
| `invites` | Could be added for coach onboarding later |
| `event_staff` | Simple camps don't need staff tracking |
| `promo_codes` | Nice-to-have, not core flow |
| `promo_code_uses` | Depends on promo_codes |
| `reviews` | Post-event feature |
| `notifications` | Can use email-only initially |
| `notification_preferences` | Depends on notifications |
| `calendar_integrations` | Calendar sync is future feature |
| `daily_analytics` | Reporting can wait |
| `monthly_analytics` | Reporting can wait |

---

## 3. Triggers & Functions by Phase

### `[DB]` — Core Triggers

```sql
-- Shared updated_at trigger
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
```

### `[ADMIN]` — Admin Triggers

```sql
CREATE TRIGGER trg_academies_updated_at BEFORE UPDATE ON academies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_event_tickets_updated_at BEFORE UPDATE ON event_tickets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### `[PUBLIC]` — Public Triggers

```sql
CREATE TRIGGER trg_athletes_updated_at BEFORE UPDATE ON athletes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_athlete_medical_updated_at BEFORE UPDATE ON athlete_medical FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_event_registrations_updated_at BEFORE UPDATE ON event_registrations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_waivers_updated_at BEFORE UPDATE ON waivers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### `[STRIPE]` — Payment Triggers

```sql
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payouts_updated_at BEFORE UPDATE ON payouts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## 4. Security-Definer RPCs by Phase

### `[PUBLIC]` — Ticket Reservation

```sql
-- Atomic ticket reservation (prevents overselling)
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
```

### `[DEFER]` — Admin Email Search

```sql
-- Only needed when admins need to search users by email
CREATE OR REPLACE FUNCTION search_users_by_email(query text)
RETURNS TABLE (id uuid, email text, first_name text, last_name text)
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT p.id, au.email, p.first_name, p.last_name
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE au.email ILIKE '%' || query || '%';
END;
$$ LANGUAGE plpgsql;
```

---

## 5. RLS Policies by Phase

### `[DB]` — Profile RLS

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles (for display names)
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (id = auth.uid());
```

### `[DB]` — User Roles RLS

```sql
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can see their own roles
CREATE POLICY user_roles_select ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Only SUPER_ADMIN can modify roles (handled via RPC)
```

### `[ADMIN]` — Location RLS

```sql
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- SELECT: Public locations visible to all; private only to creator
CREATE POLICY locations_select ON locations
  FOR SELECT USING (visibility = 'public' OR created_by = auth.uid());

-- INSERT: Any authenticated user can create (created_by must be themselves)
CREATE POLICY locations_insert ON locations
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- UPDATE: Only creator can modify
CREATE POLICY locations_update ON locations
  FOR UPDATE USING (created_by = auth.uid());

-- DELETE: Only creator can delete
CREATE POLICY locations_delete ON locations
  FOR DELETE USING (created_by = auth.uid());
```

### `[ADMIN]` — Academy RLS

```sql
ALTER TABLE academies ENABLE ROW LEVEL SECURITY;

-- Public can view active academies
CREATE POLICY academies_select ON academies
  FOR SELECT USING (deleted_at IS NULL);

-- Academy admins can modify their academy
CREATE POLICY academies_modify ON academies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM academy_admins
      WHERE academy_id = academies.id
        AND user_id = auth.uid()
    )
  );
```

### `[ADMIN]` — Event RLS

```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public can view published events
CREATE POLICY events_select_public ON events
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

-- Academy admins can view all their events
CREATE POLICY events_select_admin ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM academy_admins
      WHERE academy_id = events.academy_id
        AND user_id = auth.uid()
    )
  );

-- Academy admins can modify their events
CREATE POLICY events_modify ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM academy_admins
      WHERE academy_id = events.academy_id
        AND user_id = auth.uid()
    )
  );
```

### `[PUBLIC]` — Athlete RLS

```sql
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_medical ENABLE ROW LEVEL SECURITY;

-- Athletes: INSERT allowed for parent-managed (user_id IS NULL) or self-managed
-- Note: After INSERT, app must immediately create guardian link to enable SELECT/UPDATE
CREATE POLICY athletes_insert ON athletes
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Athletes: SELECT only if you're a guardian
CREATE POLICY athletes_select ON athletes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM athlete_guardians
      WHERE athlete_id = athletes.id
        AND guardian_id = auth.uid()
    )
  );

-- Athletes: UPDATE/DELETE only if you're a guardian
CREATE POLICY athletes_update_delete ON athletes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM athlete_guardians
      WHERE athlete_id = athletes.id
        AND guardian_id = auth.uid()
    )
  );

CREATE POLICY athletes_delete ON athletes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM athlete_guardians
      WHERE athlete_id = athletes.id
        AND guardian_id = auth.uid()
    )
  );

-- Athlete guardians: full CRUD for the guardian themselves
CREATE POLICY athlete_guardians_select ON athlete_guardians
  FOR SELECT USING (guardian_id = auth.uid());

CREATE POLICY athlete_guardians_insert ON athlete_guardians
  FOR INSERT WITH CHECK (guardian_id = auth.uid());

CREATE POLICY athlete_guardians_update ON athlete_guardians
  FOR UPDATE USING (guardian_id = auth.uid())
  WITH CHECK (guardian_id = auth.uid());

CREATE POLICY athlete_guardians_delete ON athlete_guardians
  FOR DELETE USING (guardian_id = auth.uid());

-- Medical: strict guardian-only access
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
```

### `[PUBLIC]` — Registration RLS

```sql
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can see their own registrations
CREATE POLICY registrations_select_own ON event_registrations
  FOR SELECT USING (registered_by = auth.uid());

-- SELECT: Academy admins can see all registrations for their events
CREATE POLICY registrations_select_admin ON event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = event_registrations.event_id
        AND aa.user_id = auth.uid()
    )
  );

-- INSERT: Parents can register their athletes, or athletes can self-register
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
      -- OR self-managed athlete (future)
      OR EXISTS (
        SELECT 1 FROM athletes a
        WHERE a.id = event_registrations.athlete_id
          AND a.user_id = auth.uid()
      )
    )
  );

-- UPDATE: Users can update their own registrations (e.g., add notes, cancel)
CREATE POLICY registrations_update_own ON event_registrations
  FOR UPDATE USING (registered_by = auth.uid())
  WITH CHECK (registered_by = auth.uid());

-- UPDATE: Academy admins can update registrations for their events (e.g., confirm, complete)
CREATE POLICY registrations_update_admin ON event_registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = event_registrations.event_id
        AND aa.user_id = auth.uid()
    )
  );
```

### `[PUBLIC]` — Waiver RLS

```sql
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiver_signatures ENABLE ROW LEVEL SECURITY;

-- Anyone can read active waivers (needed for signing)
CREATE POLICY waivers_select ON waivers
  FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- Academy admins can manage waivers
CREATE POLICY waivers_manage ON waivers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM academy_admins aa
      WHERE aa.academy_id = waivers.academy_id
        AND aa.user_id = auth.uid()
    )
  );

-- Anyone can read event_waivers (to know what to sign)
CREATE POLICY event_waivers_select ON event_waivers
  FOR SELECT USING (true);

-- Academy admins can manage event_waivers
CREATE POLICY event_waivers_manage ON event_waivers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = event_waivers.event_id
        AND aa.user_id = auth.uid()
    )
  );

-- Guardians can sign waivers for their athletes
CREATE POLICY waiver_signatures_insert ON waiver_signatures
  FOR INSERT WITH CHECK (
    signed_by_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM athlete_guardians ag
      WHERE ag.athlete_id = waiver_signatures.athlete_id
        AND ag.guardian_id = auth.uid()
    )
  );

-- Guardians can view their signatures
CREATE POLICY waiver_signatures_select ON waiver_signatures
  FOR SELECT USING (signed_by_user_id = auth.uid());

-- Academy admins can view signatures for their events
CREATE POLICY waiver_signatures_admin ON waiver_signatures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN academy_admins aa ON aa.academy_id = e.academy_id
      WHERE e.id = waiver_signatures.event_id
        AND aa.user_id = auth.uid()
    )
  );
```

---

## 6. Migration Order

Execute migrations in this order to respect foreign key dependencies:

```
[DB] Phase — Core Foundation
1. [DB] ENUMs: user_role
2. [DB] Tables: profiles, user_roles, sports
3. [DB] Triggers: set_updated_at function, profiles trigger
4. [DB] Indexes: sports slug
5. [DB] RLS: profiles, user_roles
6. [DB] Seed: sports lookup data

[ADMIN] Phase — Academy & Event Management
7. [ADMIN] ENUMs: event_status, location_visibility
8. [ADMIN] Tables: academies, academy_admins, locations, events, event_days, event_tickets
9. [ADMIN] Triggers: academies, events, locations, event_tickets
10. [ADMIN] Indexes: academies slug, events slug, events discovery, events location
11. [ADMIN] RLS: academies, locations, events
12. [ADMIN] Seed: DivineTime academy + Luca admin

[PUBLIC] Phase — Registration Flow
13. [PUBLIC] ENUMs: registration_status
14. [PUBLIC] Tables: athletes, athlete_guardians, athlete_medical, waivers, event_waivers, waiver_signatures, event_registrations
15. [PUBLIC] Triggers: athletes, athlete_medical, event_registrations, waivers
16. [PUBLIC] Indexes: registrations indexes
17. [PUBLIC] RLS: athletes, athlete_guardians, athlete_medical, event_registrations, waivers, event_waivers, waiver_signatures
18. [PUBLIC] RPCs: reserve_ticket

[STRIPE] Phase — Payments (Stretch Goal)
19. [STRIPE] ENUMs: payment_status, refund_status, payment_source
20. [STRIPE] Tables: payments, refunds, payouts
21. [STRIPE] FK: event_registrations.payment_id → payments(id)
22. [STRIPE] Indexes: payments indexes
23. [STRIPE] Triggers: payments, payouts
```

---

## 7. Seed Data

### `[DB]` — Sports Lookup

```sql
INSERT INTO sports (id, name, slug, is_active) VALUES
  (gen_random_uuid(), 'Soccer', 'soccer', true),
  (gen_random_uuid(), 'Basketball', 'basketball', true),
  (gen_random_uuid(), 'Baseball', 'baseball', true),
  (gen_random_uuid(), 'Football', 'football', true),
  (gen_random_uuid(), 'Tennis', 'tennis', true),
  (gen_random_uuid(), 'Swimming', 'swimming', true),
  (gen_random_uuid(), 'Volleyball', 'volleyball', true),
  (gen_random_uuid(), 'Lacrosse', 'lacrosse', true);
```

### `[ADMIN]` — DivineTime Academy + Luca Admin

```sql
-- Create DivineTime academy (assumes Luca's profile already exists via auth)
INSERT INTO academies (id, name, slug, description, email)
VALUES (
  gen_random_uuid(),
  'DivineTime Training',
  'divinetime',
  'Elite soccer training in the Bay Area',
  'info@joindivinetime.com'
);

-- Link Luca as owner (replace with actual user_id after auth signup)
INSERT INTO academy_admins (academy_id, user_id, role)
SELECT a.id, p.id, 'owner'
FROM academies a, profiles p
WHERE a.slug = 'divinetime'
  AND p.id = '<luca-user-id>';

-- Grant ACADEMY_ADMIN role to Luca
INSERT INTO user_roles (user_id, role, is_primary)
SELECT id, 'ACADEMY_ADMIN', true
FROM profiles
WHERE id = '<luca-user-id>';
```

---

## 8. Summary Checklist

| Phase | Tables | ENUMs | Triggers | RLS Tables | RPCs | Indexes |
|-------|--------|-------|----------|------------|------|---------|
| `[DB]` | 3 | 1 | 1 | 2 | 0 | 1 |
| `[AUTH]` | 0 | 0 | 0 | 0 | 0 | 0 |
| `[ADMIN]` | 6 | 2 | 4 | 3 | 0 | 4 |
| `[PUBLIC]` | 7 | 1 | 4 | 7 | 1 | 3 |
| `[STRIPE]` | 3 | 3 | 2 | 0 | 0 | 4 |
| **Total Sprint 2** | **19** | **7** | **11** | **12** | **1** | **12** |
| `[DEFER]` | 15 | 1 | — | — | 2 | — |

**Indexes by Phase:**
- `[DB]`: idx_sports_slug
- `[ADMIN]`: idx_academies_slug, idx_events_slug, idx_events_discovery, idx_events_location
- `[PUBLIC]`: idx_registrations_event, idx_registrations_athlete, idx_registrations_created
- `[STRIPE]`: idx_payments_user, idx_payments_event, idx_payments_created, idx_registrations_payment

**RLS Tables by Phase:**
- `[DB]`: profiles, user_roles
- `[ADMIN]`: academies, locations, events
- `[PUBLIC]`: athletes, athlete_guardians, athlete_medical, event_registrations, waivers, event_waivers, waiver_signatures

**V2 Total:** 34 tables
**Sprint 2:** 19 tables (56%)
**Deferred:** 15 tables (44%)

---

*Document Version: 1.1*
*Based on: schema-proposal-V2.md, checklist.md*

**Changelog:**
- v1.1: Fixed RLS policy blockers identified by review agent
  - Added full CRUD policies for `athlete_guardians` (was missing all policies)
  - Added INSERT policy for `athletes` (chicken-and-egg fix for guardian linking)
  - Added INSERT/UPDATE policies for `event_registrations` (registration flow was blocked)
  - Added INSERT/DELETE policies for `locations` (admins couldn't create locations)
  - Clarified ENUM phasing: each phase creates its own ENUMs
  - Updated migration order to match phased ENUM approach
