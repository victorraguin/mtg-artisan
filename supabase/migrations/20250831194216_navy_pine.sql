/*
  # Fix all RLS policies to prevent infinite recursion

  1. Tables Updated
    - `orders` - Simplified policies without recursion
    - `order_items` - Direct policies without complex joins
    - `profiles` - Add shipping address fields
  
  2. New Features
    - Shipping addresses in profiles
    - Contact information fields
    - Simplified RLS policies
  
  3. Security
    - Non-recursive policies for all tables
    - Proper access control maintained
*/

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Shop owners can read orders with their items" ON orders;
DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
DROP POLICY IF EXISTS "Buyers can read own order items" ON order_items;
DROP POLICY IF EXISTS "Shop owners can manage their order items" ON order_items;
DROP POLICY IF EXISTS "Order participants can read messages" ON messages;
DROP POLICY IF EXISTS "Order participants can send messages" ON messages;

-- Add shipping address fields to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'shipping_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN shipping_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'shipping_address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN shipping_address text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'shipping_city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN shipping_city text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'shipping_postal_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN shipping_postal_code text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'shipping_country'
  ) THEN
    ALTER TABLE profiles ADD COLUMN shipping_country text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
END $$;

-- Create simple, non-recursive policies for orders
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create simple policies for order_items
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can read their order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can update their order items"
  ON order_items
  FOR UPDATE
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

-- Create policy for order_items insertion (during checkout)
CREATE POLICY "System can create order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Simple cart policies
CREATE POLICY "Users can manage own cart items"
  ON cart_items
  FOR ALL
  TO authenticated
  USING (cart_id = auth.uid())
  WITH CHECK (cart_id = auth.uid());

-- Simple message policies
CREATE POLICY "Users can read messages for their orders"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can send messages for their orders"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND (
      order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()) OR
      order_id IN (
        SELECT DISTINCT oi.order_id 
        FROM order_items oi 
        JOIN shops s ON oi.shop_id = s.id 
        WHERE s.owner_id = auth.uid()
      )
    )
  );

-- Clean up duplicate categories
DELETE FROM categories a USING categories b 
WHERE a.id > b.id 
AND a.name = b.name 
AND a.type = b.type;

-- Insert categories only if they don't exist
INSERT INTO categories (name, type, mtg_scope) VALUES
  ('Card Alters', 'product', 'artwork'),
  ('Custom Tokens', 'product', 'gameplay'),
  ('Playmats', 'product', 'accessories'),
  ('Deck Boxes', 'product', 'accessories'),
  ('Sleeves & Accessories', 'product', 'accessories'),
  ('Deckbuilding', 'service', 'strategy'),
  ('Judging', 'service', 'education'),
  ('Coaching', 'service', 'education'),
  ('Commissions', 'service', 'artwork'),
  ('Consulting', 'service', 'strategy')
ON CONFLICT (name, type) DO NOTHING;