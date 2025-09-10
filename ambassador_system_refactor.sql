-- Refactoring du système d'ambassadeurs pour ManaShop
-- Nouveau système automatisé avec liens de parrainage

-- 1. Modifier la table ambassadors pour simplifier
DROP TABLE IF EXISTS ambassadors;

-- 2. Créer la table des ambassadeurs avec système de liens
CREATE TABLE ambassadors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code text NOT NULL UNIQUE, -- Code unique de parrainage (ex: "VICTOR2024")
  commission_rate numeric NOT NULL DEFAULT 0.05, -- Taux géré par admin
  is_active boolean NOT NULL DEFAULT true,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz, -- Date de fin optionnelle gérée par admin
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Créer la table des parrainages (qui a parrainé qui)
CREATE TABLE referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_date timestamptz DEFAULT now(),
  first_sale_date timestamptz, -- Quand le parrainé a fait sa première vente
  total_earned numeric DEFAULT 0, -- Total gagné par l'ambassadeur grâce à ce parrainé
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 4. Créer le système de wallet
CREATE TABLE wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  balance numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Créer l'historique des transactions wallet
CREATE TABLE wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('credit', 'debit', 'withdrawal', 'deposit')),
  amount numeric NOT NULL,
  description text NOT NULL,
  reference_id uuid, -- Référence vers commande, paiement, etc.
  reference_type text, -- 'order', 'referral', 'deposit', 'withdrawal'
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- 6. Mettre à jour la table payouts pour inclure les commissions d'ambassadeur
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS ambassador_id uuid REFERENCES ambassadors(id);
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS referral_id uuid REFERENCES referrals(id);

-- Index pour optimiser les performances
CREATE INDEX idx_ambassadors_referral_code ON ambassadors(referral_code);
CREATE INDEX idx_ambassadors_user_id ON ambassadors(user_id);
CREATE INDEX idx_referrals_ambassador_id ON referrals(ambassador_id);
CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);

-- Politiques RLS

-- Ambassadors : utilisateurs peuvent voir/gérer leur propre profil ambassadeur
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs gèrent leur profil ambassadeur"
  ON ambassadors
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins gèrent tous les ambassadeurs"
  ON ambassadors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Referrals : ambassadeurs voient leurs parrainés, parrainés voient leur ambassadeur
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadeurs voient leurs parrainés"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ambassadors a 
      WHERE a.id = referrals.ambassador_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Parrainés voient leur ambassadeur"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (referred_user_id = auth.uid());

CREATE POLICY "Admins voient tous les parrainages"
  ON referrals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Wallets : utilisateurs gèrent leur propre wallet
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs gèrent leur wallet"
  ON wallets
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins voient tous les wallets"
  ON wallets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Wallet transactions : utilisateurs voient leurs transactions
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs voient leurs transactions"
  ON wallet_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wallets w 
      WHERE w.id = wallet_transactions.wallet_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins voient toutes les transactions"
  ON wallet_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Fonctions utilitaires

-- Fonction pour générer un code de parrainage unique
CREATE OR REPLACE FUNCTION generate_referral_code(user_display_name text)
RETURNS text AS $$
DECLARE
  base_code text;
  final_code text;
  counter int := 0;
BEGIN
  -- Créer un code de base à partir du nom d'utilisateur
  base_code := UPPER(REGEXP_REPLACE(COALESCE(user_display_name, 'USER'), '[^A-Z0-9]', '', 'g'));
  base_code := LEFT(base_code, 6);
  
  -- Ajouter l'année
  base_code := base_code || EXTRACT(YEAR FROM now());
  
  -- Vérifier l'unicité et ajouter un suffixe si nécessaire
  final_code := base_code;
  
  WHILE EXISTS (SELECT 1 FROM ambassadors WHERE referral_code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || counter;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer automatiquement un wallet lors de la création d'un profil
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, balance, currency)
  VALUES (NEW.id, 0, 'EUR');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer automatiquement un wallet
DROP TRIGGER IF EXISTS create_wallet_trigger ON profiles;
CREATE TRIGGER create_wallet_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_wallet_for_new_user();

-- Fonction pour traiter une commission d'ambassadeur
CREATE OR REPLACE FUNCTION process_ambassador_commission(
  p_order_id uuid,
  p_shop_owner_id uuid,
  p_commission_amount numeric
)
RETURNS void AS $$
DECLARE
  v_referral referrals%ROWTYPE;
  v_ambassador ambassadors%ROWTYPE;
  v_wallet_id uuid;
BEGIN
  -- Trouver si le propriétaire de la boutique a été parrainé
  SELECT r.* INTO v_referral
  FROM referrals r
  JOIN ambassadors a ON r.ambassador_id = a.id
  WHERE r.referred_user_id = p_shop_owner_id
    AND r.is_active = true
    AND a.is_active = true
    AND (a.end_date IS NULL OR a.end_date > now());
  
  IF FOUND THEN
    SELECT * INTO v_ambassador FROM ambassadors WHERE id = v_referral.ambassador_id;
    
    -- Calculer la commission
    DECLARE
      commission_earned numeric := p_commission_amount * v_ambassador.commission_rate;
    BEGIN
      -- Mettre à jour le total gagné par ce parrainage
      UPDATE referrals 
      SET total_earned = total_earned + commission_earned,
          first_sale_date = COALESCE(first_sale_date, now())
      WHERE id = v_referral.id;
      
      -- Créditer le wallet de l'ambassadeur
      SELECT id INTO v_wallet_id FROM wallets WHERE user_id = v_ambassador.user_id;
      
      UPDATE wallets 
      SET balance = balance + commission_earned,
          updated_at = now()
      WHERE id = v_wallet_id;
      
      -- Enregistrer la transaction
      INSERT INTO wallet_transactions (
        wallet_id, type, amount, description, reference_id, reference_type, status
      ) VALUES (
        v_wallet_id, 
        'credit', 
        commission_earned, 
        'Commission ambassadeur - Commande #' || p_order_id, 
        p_order_id, 
        'referral', 
        'completed'
      );
    END;
  END IF;
END;
$$ LANGUAGE plpgsql;
