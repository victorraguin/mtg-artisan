/*
  # Ajouter les catégories par défaut

  1. Nouvelles catégories
    - Catégories produits : Card Alters, Custom Tokens, Playmats, Deck Boxes
    - Catégories services : Deckbuilding, Judging, Coaching, Commissions
  
  2. Sécurité
    - Politiques RLS déjà en place pour les catégories
*/

-- Supprimer les catégories existantes pour éviter les doublons
DELETE FROM categories;

-- Ajouter les catégories produits
INSERT INTO categories (name, type, mtg_scope) VALUES
  ('Card Alters', 'product', 'Individual card modifications and artwork'),
  ('Custom Tokens', 'product', 'Creature and artifact tokens'),
  ('Playmats', 'product', 'Custom gaming surfaces'),
  ('Deck Boxes', 'product', 'Storage and protection accessories'),
  ('Sleeves & Accessories', 'product', 'Card protection and gaming accessories');

-- Ajouter les catégories services
INSERT INTO categories (name, type, mtg_scope) VALUES
  ('Deckbuilding', 'service', 'Competitive deck construction and optimization'),
  ('Judging', 'service', 'Rules consultation and tournament judging'),
  ('Coaching', 'service', 'Gameplay improvement and strategy'),
  ('Commissions', 'service', 'Custom artwork and design services'),
  ('Consulting', 'service', 'Expert advice and analysis');