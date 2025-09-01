-- Table pour tracker les vues de produits
CREATE TABLE IF NOT EXISTS product_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT, -- Pour les utilisateurs anonymes
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes de statistiques
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON product_views(created_at);
CREATE INDEX IF NOT EXISTS idx_product_views_user_session ON product_views(user_id, session_id);

-- Table pour les profils de livraison (gestion des frais par boutique)
CREATE TABLE IF NOT EXISTS shipping_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    base_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    free_shipping_threshold DECIMAL(10,2), -- Livraison gratuite au-dessus de ce montant
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les profils de livraison
CREATE INDEX IF NOT EXISTS idx_shipping_profiles_shop_id ON shipping_profiles(shop_id);

-- Table pour les zones de livraison (par pays/région)
CREATE TABLE IF NOT EXISTS shipping_zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES shipping_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- ex: "France", "Europe", "International"
    countries TEXT[] NOT NULL, -- Array des codes pays ISO
    additional_cost DECIMAL(10,2) NOT NULL DEFAULT 0, -- Coût supplémentaire pour cette zone
    estimated_days_min INTEGER DEFAULT 3,
    estimated_days_max INTEGER DEFAULT 7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les zones de livraison
CREATE INDEX IF NOT EXISTS idx_shipping_zones_profile_id ON shipping_zones(profile_id);

-- Ajouter les frais de livraison aux commandes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_profile_id UUID REFERENCES shipping_profiles(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_zone_id UUID REFERENCES shipping_zones(id);

-- Table pour tracker les éléments dans les paniers (pour les statistiques)
CREATE TABLE IF NOT EXISTS cart_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    removed_at TIMESTAMP WITH TIME ZONE, -- NULL si encore dans le panier
    converted_to_order BOOLEAN DEFAULT FALSE, -- TRUE si l'achat a été finalisé
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL
);

-- Index pour les analytics de panier
CREATE INDEX IF NOT EXISTS idx_cart_analytics_product_id ON cart_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_analytics_user_session ON cart_analytics(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_cart_analytics_added_at ON cart_analytics(added_at);

-- Vue pour les statistiques de produits
CREATE OR REPLACE VIEW product_statistics AS
SELECT 
    p.id as product_id,
    p.title,
    p.price,
    -- Statistiques des vues
    COUNT(DISTINCT pv.id) as total_views,
    COUNT(DISTINCT pv.user_id) as unique_users_viewed,
    COUNT(DISTINCT CASE WHEN pv.created_at >= NOW() - INTERVAL '30 days' THEN pv.id END) as views_last_30_days,
    
    -- Statistiques des paniers
    COUNT(DISTINCT ca.id) as times_added_to_cart,
    COUNT(DISTINCT CASE WHEN ca.added_at >= NOW() - INTERVAL '30 days' AND ca.removed_at IS NULL THEN ca.id END) as currently_in_carts,
    
    -- Statistiques des ventes
    COUNT(DISTINCT oi.id) as total_sales,
    COALESCE(SUM(CASE WHEN oi.id IS NOT NULL THEN oi.qty END), 0) as total_quantity_sold,
    COALESCE(SUM(CASE WHEN oi.id IS NOT NULL THEN oi.unit_price * oi.qty END), 0) as total_revenue,
    COALESCE(SUM(CASE WHEN oi.created_at >= NOW() - INTERVAL '30 days' THEN oi.unit_price * oi.qty END), 0) as revenue_last_30_days,
    
    -- Taux de conversion
    CASE 
        WHEN COUNT(DISTINCT pv.id) > 0 
        THEN ROUND((COUNT(DISTINCT oi.id)::DECIMAL / COUNT(DISTINCT pv.id) * 100), 2)
        ELSE 0 
    END as conversion_rate_percent
    
FROM products p
LEFT JOIN product_views pv ON p.id = pv.product_id
LEFT JOIN cart_analytics ca ON p.id = ca.product_id
LEFT JOIN order_items oi ON p.id = oi.item_id AND oi.item_type = 'product'
GROUP BY p.id, p.title, p.price;

-- RLS (Row Level Security) pour les nouvelles tables
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_analytics ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour product_views (tout le monde peut ajouter des vues, seuls les propriétaires peuvent voir les stats)
CREATE POLICY "Anyone can insert product views" ON product_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Shop owners can view their product statistics" ON product_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products p 
            JOIN shops s ON p.shop_id = s.id 
            WHERE p.id = product_views.product_id 
            AND s.owner_id = auth.uid()
        )
    );

-- Politiques RLS pour shipping_profiles
CREATE POLICY "Shop owners can manage their shipping profiles" ON shipping_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shops 
            WHERE shops.id = shipping_profiles.shop_id 
            AND shops.owner_id = auth.uid()
        )
    );

-- Politiques RLS pour shipping_zones
CREATE POLICY "Shop owners can manage their shipping zones" ON shipping_zones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shipping_profiles sp
            JOIN shops s ON sp.shop_id = s.id
            WHERE sp.id = shipping_zones.profile_id 
            AND s.owner_id = auth.uid()
        )
    );

-- Politiques RLS pour cart_analytics
CREATE POLICY "Users can manage their own cart analytics" ON cart_analytics
    FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Shop owners can view cart analytics for their products" ON cart_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products p 
            JOIN shops s ON p.shop_id = s.id 
            WHERE p.id = cart_analytics.product_id 
            AND s.owner_id = auth.uid()
        )
    );

-- Fonction pour incrémenter les vues de produit
CREATE OR REPLACE FUNCTION increment_product_view(
    product_uuid UUID,
    user_uuid UUID DEFAULT NULL,
    session_uuid TEXT DEFAULT NULL,
    user_ip INET DEFAULT NULL,
    user_agent_string TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Éviter les vues multiples de la même session dans un court délai (5 minutes)
    IF NOT EXISTS (
        SELECT 1 FROM product_views 
        WHERE product_id = product_uuid 
        AND (
            (user_uuid IS NOT NULL AND user_id = user_uuid) OR
            (session_uuid IS NOT NULL AND session_id = session_uuid)
        )
        AND created_at > NOW() - INTERVAL '5 minutes'
    ) THEN
        INSERT INTO product_views (product_id, user_id, session_id, ip_address, user_agent)
        VALUES (product_uuid, user_uuid, session_uuid, user_ip, user_agent_string);
    END IF;
END;
$$;

-- Fonction pour tracker l'ajout au panier
CREATE OR REPLACE FUNCTION track_cart_addition(
    product_uuid UUID,
    user_uuid UUID DEFAULT NULL,
    session_uuid TEXT DEFAULT NULL,
    qty INTEGER DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO cart_analytics (product_id, user_id, session_id, quantity)
    VALUES (product_uuid, user_uuid, session_uuid, qty);
END;
$$;

-- Fonction pour tracker la suppression du panier
CREATE OR REPLACE FUNCTION track_cart_removal(
    product_uuid UUID,
    user_uuid UUID DEFAULT NULL,
    session_uuid TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE cart_analytics 
    SET removed_at = NOW()
    WHERE product_id = product_uuid 
    AND (
        (user_uuid IS NOT NULL AND user_id = user_uuid) OR
        (session_uuid IS NOT NULL AND session_id = session_uuid)
    )
    AND removed_at IS NULL;
END;
$$;
