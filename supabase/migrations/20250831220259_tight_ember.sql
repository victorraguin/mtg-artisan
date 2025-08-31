/*
  # Create cart items enriched view

  1. New Views
    - `cart_items_enriched`
      - Joins cart_items with products and services
      - Provides title, image_url, shop_name, shop_id directly
      - Handles polymorphic relationship between cart_items and products/services

  2. Purpose
    - Solves the foreign key relationship issue for cart queries
    - Simplifies frontend data fetching
    - Improves performance by pre-joining data
*/

CREATE OR REPLACE VIEW public.cart_items_enriched AS
SELECT
  ci.id,
  ci.cart_id,
  ci.item_type,
  ci.item_id,
  ci.qty,
  ci.unit_price,
  ci.currency,
  ci.metadata,
  ci.created_at,
  COALESCE(p.title, s.title) AS title,
  COALESCE(p.images[1], NULL) AS image_url,
  COALESCE(ps.name, ss.name) AS shop_name,
  COALESCE(p.shop_id, s.shop_id) AS shop_id
FROM
  public.cart_items ci
LEFT JOIN
  public.products p ON ci.item_id = p.id AND ci.item_type = 'product'
LEFT JOIN
  public.services s ON ci.item_id = s.id AND ci.item_type = 'service'
LEFT JOIN
  public.shops ps ON p.shop_id = ps.id
LEFT JOIN
  public.shops ss ON s.shop_id = ss.id;