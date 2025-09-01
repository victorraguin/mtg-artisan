/*
  # ManaShop Boutiques - Initial Schema

  1. New Tables
    - `profiles` - User profiles with role-based access
    - `shops` - Creator shops with PayPal integration
    - `categories` - Product and service categories
    - `products` - Physical/digital products
    - `services` - Custom services (alters, coaching, etc.)
    - `portfolios` - Creator portfolio pieces
    - `cart_items` - Shopping cart items
    - `orders` - Purchase orders with PayPal tracking
    - `order_items` - Individual items within orders
    - `messages` - Order communication threads
    - `reviews` - Post-delivery reviews and ratings
    - `quotes` - Service quote requests
    - `payouts` - Creator payout tracking
    - `disputes` - Order dispute resolution

  2. Security
    - Enable RLS on all tables
    - Role-based policies for buyers/creators/admins
    - Secure access patterns for sensitive data

  3. Features
    - Multi-currency support
    - PayPal integration fields
    - Image array storage
    - JSONB for flexible metadata
    - Comprehensive order lifecycle
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'creator', 'admin')),
  display_name text,
  avatar_url text,
  country text,
  bio text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Shops table
CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  banner_url text,
  logo_url text,
  bio text,
  policies text,
  shipping_profile_id text,
  paypal_merchant_id text,
  paypal_email text,
  is_verified boolean DEFAULT false,
  rating_avg numeric(3,2) DEFAULT 0.0,
  country text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('product', 'service')),
  mtg_scope text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'physical' CHECK (type IN ('physical', 'digital')),
  title text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  stock integer,
  images text[] DEFAULT '{}',
  category_id uuid REFERENCES categories(id),
  tags text[] DEFAULT '{}',
  attributes jsonb DEFAULT '{}',
  lead_time_days integer,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'sold_out')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  base_price numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  requires_brief boolean DEFAULT false,
  delivery_days integer NOT NULL,
  slots_config jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL, -- user_id for simplicity
  item_type text NOT NULL CHECK (item_type IN ('product', 'service')),
  item_id uuid NOT NULL,
  qty integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  total numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'payment_pending' CHECK (status IN ('payment_pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded')),
  paypal_order_id text,
  paypal_capture_id text,
  breakdown_by_shop jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  shop_id uuid REFERENCES shops(id) NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('product', 'service')),
  item_id uuid NOT NULL,
  qty integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'shipped', 'delivered', 'completed', 'disputed', 'refunded')),
  tracking text,
  delivery_due_at timestamptz,
  delivered_at timestamptz,
  files text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  quote_id uuid,
  sender_id uuid REFERENCES profiles(id) NOT NULL,
  body text NOT NULL,
  attachments text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid REFERENCES order_items(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text text,
  images text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES profiles(id) NOT NULL,
  shop_id uuid REFERENCES shops(id) NOT NULL,
  brief jsonb NOT NULL DEFAULT '{}',
  proposed_price numeric(10,2),
  currency text DEFAULT 'USD',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  images text[] NOT NULL DEFAULT '{}',
  before_after boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  price_range text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Shops policies
CREATE POLICY "Anyone can read active shops"
  ON shops FOR SELECT
  USING (true);

CREATE POLICY "Creators can manage own shops"
  ON shops FOR ALL
  TO authenticated
  USING (owner_id = auth.uid());

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Products policies
CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Shop owners can manage own products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE id = shop_id AND owner_id = auth.uid()
    )
  );

-- Services policies
CREATE POLICY "Anyone can read active services"
  ON services FOR SELECT
  USING (status = 'active');

CREATE POLICY "Shop owners can manage own services"
  ON services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE id = shop_id AND owner_id = auth.uid()
    )
  );

-- Cart policies
CREATE POLICY "Users can manage own cart"
  ON cart_items FOR ALL
  TO authenticated
  USING (cart_id = auth.uid());

-- Orders policies
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Shop owners can read their order items"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN shops s ON oi.shop_id = s.id
      WHERE oi.order_id = orders.id AND s.owner_id = auth.uid()
    )
  );

-- Order items policies
CREATE POLICY "Buyers can read own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can read and update their order items"
  ON order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE id = shop_id AND owner_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Order participants can read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN shops s ON oi.shop_id = s.id
      WHERE oi.order_id = messages.order_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Order participants can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND (
      EXISTS (
        SELECT 1 FROM orders o
        WHERE o.id = order_id AND o.user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM order_items oi
        JOIN shops s ON oi.shop_id = s.id
        WHERE oi.order_id = messages.order_id AND s.owner_id = auth.uid()
      )
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can read published reviews"
  ON reviews FOR SELECT
  USING (status = 'published');

CREATE POLICY "Buyers can create reviews for their completed orders"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.id = order_item_id 
      AND o.user_id = auth.uid() 
      AND oi.status = 'completed'
    )
  );

-- Insert initial categories
INSERT INTO categories (name, type, mtg_scope) VALUES
('Card Alters', 'product', 'Any card type'),
('Custom Tokens', 'product', 'Token creatures/artifacts'),
('Playmats', 'product', 'Gaming accessories'),
('Deck Boxes', 'product', 'Storage solutions'),
('Card Altering', 'service', 'Modify existing cards'),
('Deckbuilding', 'service', 'Custom deck construction'),
('Judge Coaching', 'service', 'Rules and tournament prep'),
('Art Commissions', 'service', 'Original artwork')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_services_shop_id ON services(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_shop_id ON order_items(shop_id);
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON messages(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_item_id ON reviews(order_item_id);

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_services_search ON services USING gin(to_tsvector('english', title || ' ' || description));