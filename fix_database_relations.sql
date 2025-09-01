-- Script pour corriger les relations de base de données manquantes

-- 1. Créer la vue product_statistics si elle n'existe pas
CREATE OR REPLACE VIEW product_statistics AS
SELECT 
    p.id as product_id,
    p.shop_id,
    p.title,
    p.price,
    p.stock,
    p.status,
    p.type,
    p.created_at,
    p.updated_at,
    
    -- Statistiques de vues
    COALESCE(pv.total_views, 0) as total_views,
    COALESCE(pv.unique_users_viewed, 0) as unique_users_viewed,
    COALESCE(pv.views_last_30_days, 0) as views_last_30_days,
    
    -- Statistiques de panier
    COALESCE(ca.times_added_to_cart, 0) as times_added_to_cart,
    COALESCE(ca.currently_in_carts, 0) as currently_in_carts,
    
    -- Statistiques de ventes
    COALESCE(oi.total_sales, 0) as total_sales,
    COALESCE(oi.total_quantity_sold, 0) as total_quantity_sold,
    COALESCE(oi.total_revenue, 0) as total_revenue,
    COALESCE(oi.revenue_last_30_days, 0) as revenue_last_30_days,
    
    -- Taux de conversion
    CASE 
        WHEN COALESCE(pv.total_views, 0) > 0 
        THEN ROUND((COALESCE(oi.total_sales, 0)::float / pv.total_views * 100)::numeric, 2)
        ELSE 0 
    END as conversion_rate_percent

FROM products p

-- Jointure avec les vues
LEFT JOIN (
    SELECT 
        product_id,
        COUNT(*) as total_views,
        COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_users_viewed,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as views_last_30_days
    FROM product_views 
    GROUP BY product_id
) pv ON p.id = pv.product_id

-- Jointure avec les paniers
LEFT JOIN (
    SELECT 
        product_id,
        COUNT(*) as times_added_to_cart,
        SUM(CASE WHEN removed_at IS NULL AND converted_to_order = false THEN quantity ELSE 0 END) as currently_in_carts
    FROM cart_analytics 
    GROUP BY product_id
) ca ON p.id = ca.product_id

-- Jointure avec les ventes
LEFT JOIN (
    SELECT 
        item_id as product_id,
        COUNT(*) as total_sales,
        SUM(qty) as total_quantity_sold,
        SUM(unit_price * qty) as total_revenue,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN unit_price * qty ELSE 0 END) as revenue_last_30_days
    FROM order_items 
    WHERE item_type = 'product'
    GROUP BY item_id
) oi ON p.id = oi.product_id;

-- 2. Créer la table product_views si elle n'existe pas
CREATE TABLE IF NOT EXISTS product_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table cart_analytics si elle n'existe pas
CREATE TABLE IF NOT EXISTS cart_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    removed_at TIMESTAMP WITH TIME ZONE,
    converted_to_order BOOLEAN DEFAULT false,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL
);

-- 4. La table order_items existe déjà, ajouter les colonnes manquantes si nécessaire
DO $$ 
BEGIN
    -- Ajouter product_id si elle n'existe pas (pour les produits)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_items' AND column_name = 'product_id') THEN
        ALTER TABLE order_items ADD COLUMN product_id UUID REFERENCES products(id);
    END IF;
    
    -- Ajouter title si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_items' AND column_name = 'title') THEN
        ALTER TABLE order_items ADD COLUMN title TEXT;
    END IF;
END $$;

-- 5. Ajouter les colonnes manquantes à la table orders si elles n'existent pas
DO $$ 
BEGIN
    -- Ajouter shipping_cost si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'shipping_cost') THEN
        ALTER TABLE orders ADD COLUMN shipping_cost DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Ajouter shipping_profile_id si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'shipping_profile_id') THEN
        ALTER TABLE orders ADD COLUMN shipping_profile_id UUID REFERENCES shipping_profiles(id);
    END IF;
    
    -- Ajouter shipping_zone_id si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'shipping_zone_id') THEN
        ALTER TABLE orders ADD COLUMN shipping_zone_id UUID REFERENCES shipping_zones(id);
    END IF;
END $$;

-- 6. Créer la table shipping_profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS shipping_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    base_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    free_shipping_threshold DECIMAL(10,2),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. La table shipping_zones existe déjà, pas besoin de la recréer

-- 8. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON product_views(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_analytics_product_id ON cart_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_analytics_user_id ON cart_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_analytics_session_id ON cart_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_shop_id ON order_items(shop_id);
CREATE INDEX IF NOT EXISTS idx_order_items_created_at ON order_items(created_at);

-- 9. Activer RLS sur les nouvelles tables
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;

-- 10. Créer les politiques RLS
-- Product views - lecture publique, écriture authentifiée
CREATE POLICY "Product views are publicly readable" ON product_views FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert product views" ON product_views FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Cart analytics - lecture/écriture pour le propriétaire
CREATE POLICY "Users can manage their own cart analytics" ON cart_analytics 
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Order items - lecture pour le propriétaire de la boutique
CREATE POLICY "Shop owners can view their order items" ON order_items 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shops 
            WHERE shops.id = order_items.shop_id 
            AND shops.owner_id = auth.uid()
        )
    );

-- Shipping profiles - gestion par le propriétaire de la boutique
CREATE POLICY "Shop owners can manage their shipping profiles" ON shipping_profiles 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shops 
            WHERE shops.id = shipping_profiles.shop_id 
            AND shops.owner_id = auth.uid()
        )
    );

-- Shipping zones - gestion par le propriétaire de la boutique
CREATE POLICY "Shop owners can manage their shipping zones" ON shipping_zones 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shops 
            JOIN shipping_profiles ON shipping_profiles.id = shipping_zones.profile_id
            WHERE shops.id = shipping_profiles.shop_id 
            AND shops.owner_id = auth.uid()
        )
    );

-- 11. Créer les fonctions RPC si elles n'existent pas
CREATE OR REPLACE FUNCTION increment_product_view(
    p_product_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO product_views (product_id, user_id, session_id, ip_address, user_agent)
    VALUES (p_product_id, p_user_id, p_session_id, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION track_cart_addition(
    p_product_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_quantity INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO cart_analytics (product_id, user_id, session_id, quantity)
    VALUES (p_product_id, p_user_id, p_session_id, p_quantity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION track_cart_removal(
    p_product_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE cart_analytics 
    SET removed_at = NOW()
    WHERE product_id = p_product_id 
    AND (user_id = p_user_id OR (user_id IS NULL AND session_id = p_session_id))
    AND removed_at IS NULL
    AND converted_to_order = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Créer un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shipping_profiles_updated_at 
    BEFORE UPDATE ON shipping_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Message de confirmation
SELECT 'Base de données mise à jour avec succès !' as message;
