-- Fix pour les tables du système d'ambassadeurs
-- Ce script corrige les politiques RLS et crée les tables manquantes

-- Supprimer les tables existantes si elles existent (pour reset)
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS ambassadors CASCADE;

-- Créer la table ambassadors
CREATE TABLE ambassadors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  commission_rate DECIMAL(5,4) DEFAULT 0.05 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Créer la table referrals
CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  referral_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  first_sale_date TIMESTAMPTZ,
  total_earned DECIMAL(10,2) DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Contrainte unique : un utilisateur ne peut être parrainé qu'une seule fois
  UNIQUE(referred_user_id)
);

-- Créer la table wallets
CREATE TABLE wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0 NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Créer la table wallet_transactions
CREATE TABLE wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit', 'withdrawal', 'deposit')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  reference_type VARCHAR(50) NOT NULL,
  reference_id UUID,
  status VARCHAR(20) DEFAULT 'completed' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Activer RLS sur toutes les tables
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour ambassadors
CREATE POLICY "Ambassadors can view their own data" ON ambassadors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create ambassador profiles" ON ambassadors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Ambassadors can update their own data" ON ambassadors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ambassadors" ON ambassadors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour referrals
CREATE POLICY "Ambassadors can view their referrals" ON referrals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ambassadors 
      WHERE id = referrals.ambassador_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own referral info" ON referrals
  FOR SELECT USING (auth.uid() = referred_user_id);

CREATE POLICY "System can create referrals" ON referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update referrals" ON referrals
  FOR UPDATE USING (true);

CREATE POLICY "Admins can manage all referrals" ON referrals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour wallets
CREATE POLICY "Users can view their own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallet" ON wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all wallets" ON wallets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour wallet_transactions
CREATE POLICY "Users can view their wallet transactions" ON wallet_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wallets 
      WHERE id = wallet_transactions.wallet_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transactions for their wallet" ON wallet_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM wallets 
      WHERE id = wallet_transactions.wallet_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all transactions" ON wallet_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Fonction pour générer des codes de parrainage uniques
CREATE OR REPLACE FUNCTION generate_referral_code(user_display_name TEXT DEFAULT 'USER')
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INTEGER := 1;
BEGIN
    -- Nettoyer le nom d'utilisateur et prendre les 4 premiers caractères
    base_code := UPPER(SUBSTRING(REGEXP_REPLACE(user_display_name, '[^A-Za-z0-9]', '', 'g') FROM 1 FOR 4));
    
    -- Si trop court, compléter avec des caractères
    IF LENGTH(base_code) < 2 THEN
        base_code := 'USER';
    END IF;
    
    -- Ajouter un timestamp pour l'unicité
    final_code := base_code || TO_CHAR(NOW(), 'YYMMDDHH24MI');
    
    -- Vérifier l'unicité et ajouter un compteur si nécessaire
    WHILE EXISTS (SELECT 1 FROM ambassadors WHERE referral_code = final_code) LOOP
        final_code := base_code || TO_CHAR(NOW(), 'YYMMDDHH24MI') || counter::TEXT;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_code;
END;
$$;

-- Fonction pour traiter les commissions d'ambassadeur
CREATE OR REPLACE FUNCTION process_ambassador_commission(
    p_referred_user_id UUID,
    p_order_amount DECIMAL,
    p_commission_rate DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_referral_record RECORD;
    v_commission_amount DECIMAL;
    v_wallet_id UUID;
BEGIN
    -- Récupérer les informations de parrainage
    SELECT r.*, a.commission_rate, a.user_id as ambassador_user_id
    INTO v_referral_record
    FROM referrals r
    JOIN ambassadors a ON r.ambassador_id = a.id
    WHERE r.referred_user_id = p_referred_user_id 
    AND r.is_active = true
    AND a.is_active = true;
    
    -- Si pas de parrainage actif, sortir
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Calculer la commission
    v_commission_amount := p_order_amount * COALESCE(p_commission_rate, v_referral_record.commission_rate);
    
    -- Mettre à jour le total gagné du parrainage
    UPDATE referrals 
    SET 
        total_earned = total_earned + v_commission_amount,
        first_sale_date = COALESCE(first_sale_date, NOW()),
        updated_at = NOW()
    WHERE id = v_referral_record.id;
    
    -- Récupérer ou créer le wallet de l'ambassadeur
    SELECT id INTO v_wallet_id
    FROM wallets 
    WHERE user_id = v_referral_record.ambassador_user_id;
    
    IF NOT FOUND THEN
        INSERT INTO wallets (user_id, balance, currency)
        VALUES (v_referral_record.ambassador_user_id, 0, 'EUR')
        RETURNING id INTO v_wallet_id;
    END IF;
    
    -- Ajouter la commission au wallet de l'ambassadeur
    UPDATE wallets 
    SET 
        balance = balance + v_commission_amount,
        updated_at = NOW()
    WHERE id = v_wallet_id;
    
    -- Créer la transaction dans l'historique
    INSERT INTO wallet_transactions (
        wallet_id,
        type,
        amount,
        description,
        reference_type,
        reference_id,
        status
    ) VALUES (
        v_wallet_id,
        'credit',
        v_commission_amount,
        'Commission de parrainage - ' || v_commission_amount::TEXT || '€',
        'referral',
        v_referral_record.id,
        'completed'
    );
END;
$$;

-- Créer des index pour les performances
CREATE INDEX idx_ambassadors_user_id ON ambassadors(user_id);
CREATE INDEX idx_ambassadors_referral_code ON ambassadors(referral_code);
CREATE INDEX idx_referrals_ambassador_id ON referrals(ambassador_id);
CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);

COMMIT;
