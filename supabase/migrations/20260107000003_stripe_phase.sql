-- ============================================================================
-- [STRIPE] Phase - Payments (Stretch Goal)
-- Sprint 2 Database Schema Migration
-- ============================================================================
-- Tables: payments, refunds, payouts
-- ENUMs: payment_status, refund_status, payment_source
-- Triggers: payments, payouts
-- Foreign Keys: event_registrations.payment_id -> payments(id)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENUM Types
-- ----------------------------------------------------------------------------

CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
CREATE TYPE payment_source AS ENUM ('stripe', 'free', 'comp');

-- ----------------------------------------------------------------------------
-- 2. Tables
-- ----------------------------------------------------------------------------

-- payments: records successful payments
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

-- refunds: handles refund requests
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

-- payouts: tracks payouts to academies via Stripe Connect
CREATE TABLE payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES academies(id),
  coach_id uuid, -- FK added in future phase
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

-- ----------------------------------------------------------------------------
-- 3. Foreign Key: Link registrations to payments
-- ----------------------------------------------------------------------------

ALTER TABLE event_registrations
  ADD CONSTRAINT fk_registrations_payment
  FOREIGN KEY (payment_id) REFERENCES payments(id);

-- ----------------------------------------------------------------------------
-- 4. Indexes
-- ----------------------------------------------------------------------------

CREATE INDEX idx_payments_user ON payments(user_id, status);
CREATE INDEX idx_payments_event ON payments(event_id);
CREATE INDEX idx_payments_created ON payments(created_at);
CREATE UNIQUE INDEX idx_registrations_payment ON event_registrations(payment_id) WHERE payment_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 5. Triggers
-- ----------------------------------------------------------------------------

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payouts_updated_at
  BEFORE UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 6. Row Level Security (RLS)
-- ----------------------------------------------------------------------------

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- payments: users can see their own payments
CREATE POLICY payments_select_own ON payments
  FOR SELECT USING (user_id = auth.uid());

-- payments: academy admins can see payments for their events
CREATE POLICY payments_select_admin ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM academy_admins aa
      WHERE aa.academy_id = payments.academy_id
        AND aa.user_id = auth.uid()
    )
  );

-- payments: users can create payments (for checkout)
CREATE POLICY payments_insert ON payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- payments: only system can update (via webhooks, handled by service role)
-- No user-facing update policy needed

-- refunds: users can see their own refunds
CREATE POLICY refunds_select_own ON refunds
  FOR SELECT USING (requested_by = auth.uid());

-- refunds: academy admins can see refunds for their events
CREATE POLICY refunds_select_admin ON refunds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payments p
      JOIN academy_admins aa ON aa.academy_id = p.academy_id
      WHERE p.id = refunds.payment_id
        AND aa.user_id = auth.uid()
    )
  );

-- refunds: users can request refunds
CREATE POLICY refunds_insert ON refunds
  FOR INSERT WITH CHECK (requested_by = auth.uid());

-- refunds: academy admins can process refunds
CREATE POLICY refunds_update_admin ON refunds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM payments p
      JOIN academy_admins aa ON aa.academy_id = p.academy_id
      WHERE p.id = refunds.payment_id
        AND aa.user_id = auth.uid()
    )
  );

-- payouts: academy admins can see their payouts
CREATE POLICY payouts_select ON payouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM academy_admins aa
      WHERE aa.academy_id = payouts.academy_id
        AND aa.user_id = auth.uid()
    )
  );

-- payouts: system-managed (created via webhooks with service role)
