-- Correction des relations manquantes dans la base de données
-- Ce script ajoute les clés étrangères manquantes et améliore les relations

-- 1. Vérifier et ajouter les contraintes de clés étrangères manquantes

-- Pour order_items -> products (via item_id quand item_type = 'product')
-- Note: On ne peut pas créer une FK directe car item_id peut pointer vers products OU services
-- Mais on peut créer des index pour améliorer les performances

-- Créer des index pour améliorer les performances des jointures
CREATE INDEX IF NOT EXISTS idx_order_items_item_id_product ON order_items(item_id) WHERE item_type = 'product';
CREATE INDEX IF NOT EXISTS idx_order_items_item_id_service ON order_items(item_id) WHERE item_type = 'service';
CREATE INDEX IF NOT EXISTS idx_order_items_shop_id ON order_items(shop_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);
CREATE INDEX IF NOT EXISTS idx_order_items_created_at ON order_items(created_at);

-- Index pour les produits
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Index pour les services  
CREATE INDEX IF NOT EXISTS idx_services_shop_id ON services(shop_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);

-- Index pour cart_analytics
CREATE INDEX IF NOT EXISTS idx_cart_analytics_product_id ON cart_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_analytics_removed_at ON cart_analytics(removed_at);

-- Index pour les commandes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 2. Créer des vues pour simplifier les requêtes complexes

-- Vue pour les détails des order_items avec produits
CREATE OR REPLACE VIEW order_items_with_products AS
SELECT 
  oi.*,
  p.title as product_title,
  p.price as product_price,
  p.images as product_images,
  p.type as product_type
FROM order_items oi
LEFT JOIN products p ON oi.item_id = p.id AND oi.item_type = 'product';

-- Vue pour les détails des order_items avec services
CREATE OR REPLACE VIEW order_items_with_services AS
SELECT 
  oi.*,
  s.title as service_title,
  s.base_price as service_price,
  s.delivery_days as service_delivery_days
FROM order_items oi
LEFT JOIN services s ON oi.item_id = s.id AND oi.item_type = 'service';

-- Vue complète des order_items avec tous les détails
CREATE OR REPLACE VIEW order_items_detailed AS
SELECT 
  oi.*,
  o.user_id,
  o.total as order_total,
  o.status as order_status,
  o.created_at as order_created_at,
  p.display_name as customer_name,
  p.shipping_address,
  p.shipping_city,
  p.shipping_postal_code,
  p.shipping_country,
  CASE 
    WHEN oi.item_type = 'product' THEN prod.title
    WHEN oi.item_type = 'service' THEN serv.title
  END as item_title,
  CASE 
    WHEN oi.item_type = 'product' THEN prod.images
    ELSE NULL
  END as item_images
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN profiles p ON o.user_id = p.id
LEFT JOIN products prod ON oi.item_id = prod.id AND oi.item_type = 'product'
LEFT JOIN services serv ON oi.item_id = serv.id AND oi.item_type = 'service';

-- 3. Créer des fonctions utilitaires

-- Fonction pour obtenir les statistiques d'un shop
CREATE OR REPLACE FUNCTION get_shop_stats(shop_uuid uuid)
RETURNS TABLE (
  products_count bigint,
  services_count bigint,
  orders_count bigint,
  revenue numeric,
  products_in_carts bigint
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    (SELECT count(*) FROM products WHERE shop_id = shop_uuid),
    (SELECT count(*) FROM services WHERE shop_id = shop_uuid),
    (SELECT count(*) FROM order_items WHERE shop_id = shop_uuid),
    (SELECT COALESCE(sum(unit_price * qty), 0) FROM order_items WHERE shop_id = shop_uuid AND status IN ('completed', 'delivered')),
    (SELECT COALESCE(sum(ca.quantity), 0) 
     FROM cart_analytics ca 
     JOIN products p ON ca.product_id = p.id 
     WHERE p.shop_id = shop_uuid AND ca.removed_at IS NULL)
$$;

-- Fonction pour obtenir les top produits d'un shop
CREATE OR REPLACE FUNCTION get_top_products(shop_uuid uuid, limit_count int DEFAULT 3)
RETURNS TABLE (
  product_id uuid,
  product_title text,
  product_price numeric,
  product_images text[],
  sales_count bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.title,
    p.price,
    p.images,
    COALESCE(sales.total_qty, 0) as sales_count
  FROM products p
  LEFT JOIN (
    SELECT 
      item_id,
      sum(qty) as total_qty
    FROM order_items 
    WHERE shop_id = shop_uuid 
      AND item_type = 'product' 
      AND status IN ('completed', 'delivered')
    GROUP BY item_id
  ) sales ON p.id = sales.item_id
  WHERE p.shop_id = shop_uuid
  ORDER BY sales_count DESC NULLS LAST
  LIMIT limit_count
$$;

-- 4. Permissions pour les vues et fonctions

-- Permissions pour les vues
GRANT SELECT ON order_items_with_products TO authenticated;
GRANT SELECT ON order_items_with_services TO authenticated;
GRANT SELECT ON order_items_detailed TO authenticated;

-- Permissions pour les fonctions
GRANT EXECUTE ON FUNCTION get_shop_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_products(uuid, int) TO authenticated;

-- 5. Politiques RLS pour les vues

-- RLS pour order_items_detailed
ALTER VIEW order_items_detailed SET (security_invoker = true);

-- Notification de succès
DO $$ 
BEGIN
  RAISE NOTICE 'Relations et index créés avec succès !';
  RAISE NOTICE 'Vues disponibles: order_items_detailed, order_items_with_products, order_items_with_services';
  RAISE NOTICE 'Fonctions disponibles: get_shop_stats(shop_id), get_top_products(shop_id, limit)';
END $$;