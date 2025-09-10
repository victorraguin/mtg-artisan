-- Fonctions pour l'analytics

-- Fonction pour tracker les vues de produits
CREATE OR REPLACE FUNCTION increment_product_view(
  product_uuid uuid,
  user_uuid uuid DEFAULT NULL,
  session_uuid text DEFAULT NULL,
  user_ip inet DEFAULT NULL,
  user_agent_string text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insérer dans product_views
  INSERT INTO product_views (
    product_id,
    user_id,
    session_id,
    ip_address,
    user_agent
  ) VALUES (
    product_uuid,
    user_uuid,
    session_uuid,
    user_ip,
    user_agent_string
  );
END;
$$;

-- Fonction pour tracker les ajouts au panier
CREATE OR REPLACE FUNCTION track_cart_addition(
  product_uuid uuid,
  user_uuid uuid DEFAULT NULL,
  session_uuid text DEFAULT NULL,
  qty integer DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insérer dans cart_analytics
  INSERT INTO cart_analytics (
    product_id,
    user_id,
    session_id,
    quantity
  ) VALUES (
    product_uuid,
    user_uuid,
    session_uuid,
    qty
  );
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION increment_product_view TO authenticated, anon;
GRANT EXECUTE ON FUNCTION track_cart_addition TO authenticated, anon;
