-- Système de résolution collaborative des litiges

-- La table disputes utilise déjà une contrainte CHECK, pas un ENUM
-- Modifier la contrainte de la table disputes pour inclure les nouveaux statuts
ALTER TABLE disputes DROP CONSTRAINT IF EXISTS disputes_status_check;
ALTER TABLE disputes ADD CONSTRAINT disputes_status_check 
CHECK (status IN ('open', 'resolved', 'refunded', 'rejected', 'pending_buyer_closure', 'pending_seller_closure', 'pending_admin_review'));

-- Table pour les actions de résolution de litiges
CREATE TABLE IF NOT EXISTS dispute_resolution_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid REFERENCES disputes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('request_closure', 'approve_closure', 'reject_closure', 'escalate_to_admin', 'admin_resolve')),
  resolution_type text CHECK (resolution_type IN ('refund_buyer', 'pay_seller', 'split_payment', 'custom')),
  message text,
  created_at timestamptz DEFAULT now()
);

-- RLS pour dispute_resolution_actions
ALTER TABLE dispute_resolution_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their dispute actions" ON dispute_resolution_actions 
  FOR SELECT USING (
    user_id = auth.uid() OR 
    auth.uid() IN (
      SELECT buyer_id FROM escrows e 
      JOIN disputes d ON d.escrow_id = e.id 
      WHERE d.id = dispute_id
    ) OR
    auth.uid() IN (
      SELECT seller_id FROM escrows e 
      JOIN disputes d ON d.escrow_id = e.id 
      WHERE d.id = dispute_id
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create dispute actions" ON dispute_resolution_actions 
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Ajouter des colonnes pour tracking des accords
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS buyer_approved_closure boolean DEFAULT false;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS seller_approved_closure boolean DEFAULT false;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS resolution_deadline timestamptz;

-- Fonction pour obtenir le vendeur d'un litige
CREATE OR REPLACE FUNCTION get_dispute_seller_id(dispute_uuid uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT e.seller_id 
  FROM disputes d 
  JOIN escrows e ON d.escrow_id = e.id 
  WHERE d.id = dispute_uuid;
$$;

-- Fonction pour vérifier si un utilisateur peut agir sur un litige
CREATE OR REPLACE FUNCTION can_user_act_on_dispute(dispute_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    -- L'utilisateur est l'acheteur qui a ouvert le litige
    SELECT 1 FROM disputes WHERE id = dispute_uuid AND opened_by = user_uuid
  ) OR EXISTS (
    -- L'utilisateur est le vendeur de l'escrow
    SELECT 1 FROM disputes d 
    JOIN escrows e ON d.escrow_id = e.id 
    WHERE d.id = dispute_uuid AND e.seller_id = user_uuid
  ) OR EXISTS (
    -- L'utilisateur est admin
    SELECT 1 FROM profiles WHERE id = user_uuid AND role = 'admin'
  );
$$;

-- Permissions pour les nouvelles fonctions
GRANT EXECUTE ON FUNCTION get_dispute_seller_id TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_act_on_dispute TO authenticated;
