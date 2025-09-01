/*
  # Clean duplicate categories

  1. Remove duplicate categories
    - Delete any duplicate entries based on name and type
    - Keep only one instance of each category
  
  2. Insert missing categories safely
    - Use INSERT ... ON CONFLICT DO NOTHING to avoid duplicates
    - Add standard MTG boutique categories
  
  3. Security
    - Maintain existing RLS policies
*/

-- First, remove any potential duplicates (keep the oldest one)
DELETE FROM categories 
WHERE id NOT IN (
  SELECT DISTINCT ON (name, type) id 
  FROM categories 
  ORDER BY name, type, created_at ASC
);

-- Now safely insert categories without duplicates
INSERT INTO categories (name, type, mtg_scope) VALUES
  ('Card Alters', 'product', 'artwork'),
  ('Custom Tokens', 'product', 'gameplay'),
  ('Playmats', 'product', 'accessories'),
  ('Deck Boxes', 'product', 'accessories'),
  ('Sleeves & Accessories', 'product', 'accessories'),
  ('Deckbuilding', 'service', 'strategy'),
  ('Judging', 'service', 'rules'),
  ('Coaching', 'service', 'improvement'),
  ('Commissions', 'service', 'artwork'),
  ('Consulting', 'service', 'strategy')
ON CONFLICT (name, type) DO NOTHING;