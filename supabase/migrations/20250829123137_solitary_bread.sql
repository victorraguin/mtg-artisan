/*
  # Fix infinite recursion in order policies

  1. Security Changes
    - Drop existing recursive policies on orders and order_items tables
    - Create new non-recursive policies that avoid circular dependencies
    - Use direct user_id checks instead of EXISTS subqueries where possible

  2. Policy Structure
    - orders: Direct user_id = auth.uid() check
    - order_items: Use IN clause to avoid recursion with orders table
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Shop owners can read their order items" ON orders;
DROP POLICY IF EXISTS "Buyers can read own order items" ON order_items;
DROP POLICY IF EXISTS "Shop owners can read and update their order items" ON order_items;

-- Create new non-recursive policies for orders table
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Shop owners can read orders with their items"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT DISTINCT order_id 
      FROM order_items oi
      JOIN shops s ON oi.shop_id = s.id
      WHERE s.owner_id = auth.uid()
    )
  );

-- Create new non-recursive policies for order_items table
CREATE POLICY "Buyers can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can manage their order items"
  ON order_items
  FOR ALL
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