/*
  # Système de commissions et de paiements

  1. Tables
    - commissions
    - ambassadors
    - payouts

  2. Politiques RLS (basiques)
    - commissions : admin seulement
    - ambassadors : admin gèrent, ambassadeurs lisent leurs lignes
    - payouts : propriétaires de boutique lisent, admin lisent tout
*/

-- Règles de commission
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('global','product','service')),
  rate numeric NOT NULL,
  fixed_fee numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Liens d'ambassadeurs
CREATE TABLE IF NOT EXISTS ambassadors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  created_user_id uuid NOT NULL REFERENCES profiles(id),
  commission_rate numeric NOT NULL DEFAULT 0.05,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;

-- Table des paiements
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES shops(id),
  order_id uuid NOT NULL REFERENCES orders(id),
  gross_amount numeric NOT NULL,
  commission_platform numeric NOT NULL,
  commission_ambassador numeric NOT NULL,
  net_amount numeric NOT NULL,
  currency text NOT NULL,
  status text NOT NULL CHECK (status IN ('en_attente','en_traitement','paye','echec')),
  paypal_payout_batch_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS

-- Commissions : seuls les administrateurs peuvent gérer
CREATE POLICY "Administrateurs gèrent les commissions"
  ON commissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Politiques des ambassadeurs
CREATE POLICY "Administrateurs gèrent les ambassadeurs"
  ON ambassadors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Ambassadeurs lisent leurs lignes"
  ON ambassadors
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Politiques des paiements
CREATE POLICY "Administrateurs lisent tous les paiements"
  ON payouts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Propriétaires de boutique lisent leurs paiements"
  ON payouts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops s
      WHERE s.id = payouts.shop_id AND s.owner_id = auth.uid()
    )
  );

