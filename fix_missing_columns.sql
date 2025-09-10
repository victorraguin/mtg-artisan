-- Correction des colonnes manquantes dans le schéma

-- 1. Ajouter la colonne phone à la table profiles (si elle n'existe pas)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone text;
        COMMENT ON COLUMN public.profiles.phone IS 'Numéro de téléphone de l\'utilisateur';
    END IF;
END $$;

-- 2. Ajouter des colonnes d'adresse à profiles pour les livraisons
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'shipping_address') THEN
        ALTER TABLE public.profiles ADD COLUMN shipping_address text;
        ALTER TABLE public.profiles ADD COLUMN shipping_city text;
        ALTER TABLE public.profiles ADD COLUMN shipping_postal_code text;
        ALTER TABLE public.profiles ADD COLUMN shipping_country text;
        
        COMMENT ON COLUMN public.profiles.shipping_address IS 'Adresse de livraison par défaut';
        COMMENT ON COLUMN public.profiles.shipping_city IS 'Ville de livraison par défaut';
        COMMENT ON COLUMN public.profiles.shipping_postal_code IS 'Code postal de livraison par défaut';
        COMMENT ON COLUMN public.profiles.shipping_country IS 'Pays de livraison par défaut';
    END IF;
END $$;

-- 3. Ajouter une colonne external_reference aux wallet_transactions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'wallet_transactions' AND column_name = 'external_reference') THEN
        ALTER TABLE public.wallet_transactions ADD COLUMN external_reference text;
        COMMENT ON COLUMN public.wallet_transactions.external_reference IS 'Référence externe (ex: ID PayPal)';
    END IF;
END $$;

-- 4. Ajouter des index pour améliorer les performances
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id_status ON public.orders(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_escrows_order_id ON public.escrows(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallet_transactions_wallet_id_created_at ON public.wallet_transactions(wallet_id, created_at DESC);

-- 5. Mettre à jour les contraintes pour s'assurer de la cohérence
-- Vérifier que les escrows ont des montants cohérents
ALTER TABLE public.escrows ADD CONSTRAINT check_escrow_amounts 
    CHECK (gross_amount = commission_platform + commission_ambassador + net_amount);

-- 6. Créer une fonction pour calculer automatiquement les commissions
CREATE OR REPLACE FUNCTION calculate_commission_amounts(
    gross_amount numeric,
    platform_rate numeric DEFAULT 0.05,
    ambassador_rate numeric DEFAULT 0.0
) RETURNS TABLE (
    commission_platform numeric,
    commission_ambassador numeric,
    net_amount numeric
) AS $$
BEGIN
    commission_platform := gross_amount * platform_rate;
    commission_ambassador := gross_amount * ambassador_rate;
    net_amount := gross_amount - commission_platform - commission_ambassador;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- 7. Créer une fonction pour générer des codes de parrainage uniques
CREATE OR REPLACE FUNCTION generate_referral_code(user_display_name text DEFAULT 'USER')
RETURNS text AS $$
DECLARE
    base_code text;
    final_code text;
    counter integer := 0;
BEGIN
    -- Nettoyer le nom d'utilisateur et prendre les 4 premiers caractères
    base_code := upper(substring(regexp_replace(user_display_name, '[^a-zA-Z0-9]', '', 'g') from 1 for 4));
    
    -- Si trop court, compléter avec des caractères aléatoires
    IF length(base_code) < 4 THEN
        base_code := base_code || upper(substring(md5(random()::text) from 1 for 4 - length(base_code)));
    END IF;
    
    -- Ajouter un timestamp court
    base_code := base_code || upper(substring(extract(epoch from now())::text from -4));
    
    -- Vérifier l'unicité et ajuster si nécessaire
    final_code := base_code;
    WHILE EXISTS (SELECT 1 FROM ambassadors WHERE referral_code = final_code) LOOP
        counter := counter + 1;
        final_code := base_code || counter::text;
    END LOOP;
    
    RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- 8. Créer des triggers pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux tables qui ont une colonne updated_at
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name
        WHERE t.table_schema = 'public' 
        AND c.column_name = 'updated_at'
        AND t.table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', table_name, table_name);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', table_name, table_name);
    END LOOP;
END
$$;

COMMENT ON SCRIPT IS 'Script de correction des colonnes manquantes et amélioration du schéma';
