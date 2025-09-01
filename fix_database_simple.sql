-- Script simplifié pour corriger les relations de base de données

-- 1. Créer la vue product_statistics compatible avec votre schéma
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

-- Jointure avec les ventes (utilise item_id et item_type)
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

-- 2. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON product_views(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_analytics_product_id ON cart_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_analytics_user_id ON cart_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_analytics_session_id ON cart_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_id ON order_items(item_id);
CREATE INDEX IF NOT EXISTS idx_order_items_shop_id ON order_items(shop_id);
CREATE INDEX IF NOT EXISTS idx_order_items_created_at ON order_items(created_at);

-- 3. Activer RLS sur les tables si ce n'est pas déjà fait
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_analytics ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
-- Product views - lecture publique, écriture authentifiée
DROP POLICY IF EXISTS "Product views are publicly readable" ON product_views;
CREATE POLICY "Product views are publicly readable" ON product_views FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert product views" ON product_views;
CREATE POLICY "Authenticated users can insert product views" ON product_views FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Cart analytics - lecture/écriture pour le propriétaire
DROP POLICY IF EXISTS "Users can manage their own cart analytics" ON cart_analytics;
CREATE POLICY "Users can manage their own cart analytics" ON cart_analytics 
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- 5. Créer les fonctions RPC
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

-- Message de confirmation
SELECT 'Base de données mise à jour avec succès !' as message;
