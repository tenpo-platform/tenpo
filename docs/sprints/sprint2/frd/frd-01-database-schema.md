# FRD 1: Database Schema

## Overview
Multi-tenant database schema supporting organizations, users, camps, registrations, and payments.

## Tables

### organizations
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| name | text | NOT NULL | Display name |
| slug | text | UNIQUE, NOT NULL | URL-friendly identifier |
| logo_url | text | nullable | Logo image URL |
| contact_email | text | NOT NULL | Primary contact email |
| contact_phone | text | nullable | Contact phone |
| stripe_account_id | text | nullable | Stripe Connect account ID |
| created_at | timestamptz | NOT NULL, default now() | Record creation |
| updated_at | timestamptz | NOT NULL, default now() | Last update |

### profiles
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, references auth.users(id) ON DELETE CASCADE | Links to Supabase auth |
| email | text | NOT NULL | User email (denormalized from auth) |
| full_name | text | NOT NULL | Display name |
| phone | text | nullable | Phone number |
| roles | text[] | NOT NULL, default '{}' | Array: 'parent', 'org_admin', 'org_owner' |
| organization_id | uuid | nullable, references organizations(id) | Org membership (for admins) |
| created_at | timestamptz | NOT NULL, default now() | Record creation |
| updated_at | timestamptz | NOT NULL, default now() | Last update |

### camps
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| organization_id | uuid | NOT NULL, references organizations(id) | Owning org |
| title | text | NOT NULL | Camp name |
| description | text | NOT NULL | Full description |
| start_date | date | NOT NULL | First day |
| end_date | date | NOT NULL | Last day |
| location | text | NOT NULL | Address/location text |
| capacity | integer | NOT NULL, CHECK (capacity > 0) | Max participants |
| price_cents | integer | NOT NULL, CHECK (price_cents >= 0) | Price in cents |
| status | text | NOT NULL, default 'draft' | 'draft', 'published', 'cancelled' |
| created_at | timestamptz | NOT NULL, default now() | Record creation |
| updated_at | timestamptz | NOT NULL, default now() | Last update |

### players
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| parent_id | uuid | NOT NULL, references profiles(id) ON DELETE CASCADE | Parent who owns this player |
| full_name | text | NOT NULL | Child's name |
| date_of_birth | date | NOT NULL | DOB for age calculation |
| medical_notes | text | nullable | Allergies, conditions, etc. |
| created_at | timestamptz | NOT NULL, default now() | Record creation |
| updated_at | timestamptz | NOT NULL, default now() | Last update |

### registrations
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| camp_id | uuid | NOT NULL, references camps(id) | Camp being registered for |
| player_id | uuid | NOT NULL, references players(id) | Child being registered |
| parent_id | uuid | NOT NULL, references profiles(id) | Parent who registered |
| emergency_contact_name | text | NOT NULL | Emergency contact name |
| emergency_contact_phone | text | NOT NULL | Emergency contact phone |
| waiver_accepted_at | timestamptz | NOT NULL | When waiver was accepted |
| status | text | NOT NULL, default 'pending' | 'pending', 'confirmed', 'cancelled', 'refunded' |
| created_at | timestamptz | NOT NULL, default now() | Record creation |
| updated_at | timestamptz | NOT NULL, default now() | Last update |

**Unique constraint:** (camp_id, player_id) — prevents duplicate registration

### transactions
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| registration_id | uuid | NOT NULL, references registrations(id) | Associated registration |
| stripe_checkout_session_id | text | nullable | Stripe session ID |
| stripe_payment_intent_id | text | nullable | Stripe payment intent ID |
| amount_cents | integer | NOT NULL | Total amount charged |
| platform_fee_cents | integer | NOT NULL | Tenpo's cut |
| status | text | NOT NULL, default 'pending' | 'pending', 'succeeded', 'failed', 'refunded' |
| created_at | timestamptz | NOT NULL, default now() | Record creation |
| updated_at | timestamptz | NOT NULL, default now() | Last update |

## Indexes

```sql
CREATE INDEX idx_camps_organization_id ON camps(organization_id);
CREATE INDEX idx_camps_status ON camps(status);
CREATE INDEX idx_camps_start_date ON camps(start_date);
CREATE INDEX idx_players_parent_id ON players(parent_id);
CREATE INDEX idx_registrations_camp_id ON registrations(camp_id);
CREATE INDEX idx_registrations_parent_id ON registrations(parent_id);
CREATE INDEX idx_registrations_player_id ON registrations(player_id);
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_transactions_registration_id ON transactions(registration_id);
```

## RLS Policies

### organizations
```sql
-- Public can read org name/slug for published camps
CREATE POLICY "Public can view org basics" ON organizations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM camps WHERE camps.organization_id = organizations.id AND camps.status = 'published')
  );

-- Org members can read full org details
CREATE POLICY "Org members can view own org" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid())
  );

-- Org owners can update
CREATE POLICY "Org owners can update" ON organizations
  FOR UPDATE USING (
    id IN (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid() AND 'org_owner' = ANY(roles))
  );
```

### profiles
```sql
-- Users can read own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Org admins can view org members
CREATE POLICY "Org admins can view org members" ON profiles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND ('org_admin' = ANY(roles) OR 'org_owner' = ANY(roles))
    )
  );
```

### camps
```sql
-- Public can view published camps
CREATE POLICY "Public can view published camps" ON camps
  FOR SELECT USING (status = 'published');

-- Org admins can CRUD own org's camps
CREATE POLICY "Org admins can manage camps" ON camps
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND ('org_admin' = ANY(roles) OR 'org_owner' = ANY(roles))
    )
  );
```

### players
```sql
-- Parents can CRUD own children
CREATE POLICY "Parents can manage own children" ON players
  FOR ALL USING (parent_id = auth.uid());
```

### registrations
```sql
-- Parents can view own registrations
CREATE POLICY "Parents can view own registrations" ON registrations
  FOR SELECT USING (parent_id = auth.uid());

-- Parents can insert registrations
CREATE POLICY "Parents can create registrations" ON registrations
  FOR INSERT WITH CHECK (parent_id = auth.uid());

-- Org admins can view registrations for their camps
CREATE POLICY "Org admins can view camp registrations" ON registrations
  FOR SELECT USING (
    camp_id IN (
      SELECT id FROM camps WHERE organization_id IN (
        SELECT organization_id FROM profiles
        WHERE profiles.id = auth.uid()
        AND ('org_admin' = ANY(roles) OR 'org_owner' = ANY(roles))
      )
    )
  );
```

### transactions
```sql
-- Same as registrations - parents see own, admins see their camps'
CREATE POLICY "Parents can view own transactions" ON transactions
  FOR SELECT USING (
    registration_id IN (SELECT id FROM registrations WHERE parent_id = auth.uid())
  );

CREATE POLICY "Org admins can view camp transactions" ON transactions
  FOR SELECT USING (
    registration_id IN (
      SELECT r.id FROM registrations r
      JOIN camps c ON r.camp_id = c.id
      WHERE c.organization_id IN (
        SELECT organization_id FROM profiles
        WHERE profiles.id = auth.uid()
        AND ('org_admin' = ANY(roles) OR 'org_owner' = ANY(roles))
      )
    )
  );
```

## Functions

### get_camp_spots_remaining(camp_id uuid)
```sql
CREATE OR REPLACE FUNCTION get_camp_spots_remaining(camp_id uuid)
RETURNS integer AS $
  SELECT c.capacity - COUNT(r.id)::integer
  FROM camps c
  LEFT JOIN registrations r ON r.camp_id = c.id AND r.status = 'confirmed'
  WHERE c.id = camp_id
  GROUP BY c.id, c.capacity;
$ LANGUAGE sql STABLE;
```

### handle_new_user() — Trigger
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $
BEGIN
  INSERT INTO profiles (id, email, full_name, roles)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'roles')), ARRAY['parent']::text[])
  );
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Seed Data

```sql
-- DivineTime organization
INSERT INTO organizations (id, name, slug, contact_email)
VALUES (
  'divinetime-org-uuid-here',
  'DivineTime Soccer Academy',
  'divinetime',
  'luca@divinetime.space'
);

-- Luca as org owner (run after she signs up, or create auth user first)
-- This would be done via application logic or manual insert
```
