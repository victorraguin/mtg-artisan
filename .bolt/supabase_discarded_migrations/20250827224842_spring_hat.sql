/*
  # Injection des données de test pour MTG Artisans

  1. Catégories
    - 8 catégories pour produits et services
  
  2. Profils utilisateurs
    - Admin, créateurs et acheteur avec avatars
  
  3. Boutiques
    - 4 boutiques complètes avec logos et politiques
  
  4. Produits et services
    - 5 produits (alters, tokens, playmats)
    - 5 services (coaching, deckbuilding)
  
  5. Portfolios
    - 3 portfolios avec galeries d'images
  
  6. Commandes de test
    - 2 commandes avec différents statuts
  
  7. Messages et avis
    - Communication entre acheteurs/vendeurs
*/

-- Insérer les catégories
INSERT INTO categories (id, name, type, mtg_scope) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Card Alters', 'product', 'cards'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Custom Tokens', 'product', 'tokens'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Playmats', 'product', 'accessories'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Deck Boxes', 'product', 'accessories'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Card Altering', 'service', 'cards'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Deckbuilding', 'service', 'strategy'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Judge Coaching', 'service', 'education'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Art Commissions', 'service', 'art');

-- Créer des profils utilisateurs (en supposant que les utilisateurs existent déjà)
-- Vous devrez remplacer ces UUIDs par les vrais IDs des utilisateurs créés
INSERT INTO profiles (id, role, display_name, avatar_url, country, bio) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin', 'Admin User', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150', 'United States', 'Platform administrator'),
  ('22222222-2222-2222-2222-222222222222', 'creator', 'ArtMaster Alice', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=150', 'Canada', 'Professional MTG card alterer with 10+ years experience. Specializing in detailed character portraits and landscape extensions.'),
  ('33333333-3333-3333-3333-333333333333', 'creator', 'TokenCraft Bob', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=150', 'United Kingdom', 'Custom token creator and digital artist. I bring your creatures to life with unique designs.'),
  ('44444444-4444-4444-4444-444444444444', 'creator', 'Judge Sarah', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?w=150', 'Germany', 'Level 2 Judge offering coaching and rules consultation. Competitive player for 15+ years.'),
  ('55555555-5555-5555-5555-555555555555', 'creator', 'DeckBuilder Pro', 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?w=150', 'Australia', 'Professional deckbuilder and tournament grinder. Specializing in competitive EDH and Modern.'),
  ('66666666-6666-6666-6666-666666666666', 'buyer', 'MTG Collector', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=150', 'United States', 'Passionate MTG collector always looking for unique artwork and custom pieces.');

-- Créer les boutiques
INSERT INTO shops (id, owner_id, name, slug, banner_url, logo_url, bio, policies, paypal_email, is_verified, rating_avg, country) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Alice Art Studio', 'alice-art-studio', 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?w=800', 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?w=200', 'Premium MTG card alters and custom artwork. Each piece is hand-painted with professional acrylics and sealed for tournament play.', 'Returns: 30 days for defects only. Shipping: Worldwide, tracked and insured. Processing: 7-14 business days.', 'alice@artmaster.com', true, 4.9, 'Canada'),
  
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'TokenCraft Workshop', 'tokencraft-workshop', 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?w=800', 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?w=200', 'Custom creature and artifact tokens for your MTG decks. Digital art printed on premium cardstock with professional finish.', 'Digital delivery within 24-48 hours. Physical tokens ship within 3-5 business days. Custom designs welcome!', 'bob@tokencraft.com', true, 4.8, 'United Kingdom'),
  
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'Judge Academy', 'judge-academy', 'https://images.pexels.com/photos/5428833/pexels-photo-5428833.jpeg?w=800', 'https://images.pexels.com/photos/5428833/pexels-photo-5428833.jpeg?w=200', 'Professional MTG judge coaching and rules consultation. Level up your judging skills or prepare for certification exams.', 'Sessions conducted via Discord/Zoom. Materials provided digitally. Satisfaction guaranteed or full refund within 7 days.', 'sarah@judgeacademy.com', true, 5.0, 'Germany'),
  
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 'Pro Deck Solutions', 'pro-deck-solutions', 'https://images.pexels.com/photos/4691564/pexels-photo-4691564.jpeg?w=800', 'https://images.pexels.com/photos/4691564/pexels-photo-4691564.jpeg?w=200', 'Competitive deckbuilding and optimization services. From budget brews to tournament-winning lists, I help you dominate the meta.', 'Deck lists delivered within 48-72 hours. Includes sideboard guide and mulligan strategy. Revisions included for 30 days.', 'pro@decksolutions.com', true, 4.7, 'Australia');

-- Insérer des produits
INSERT INTO products (id, shop_id, type, title, description, price, currency, stock, images, category_id, tags, attributes, lead_time_days, status) VALUES
  ('p1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'physical', 'Lightning Bolt Full Art Alter', 'Stunning full-art extension of the classic Lightning Bolt. Hand-painted with acrylics, tournament legal thickness. Features dramatic lightning effects across a stormy landscape.', 45.00, 'USD', 1, ARRAY['https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?w=400', 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?w=400'], '550e8400-e29b-41d4-a716-446655440001', ARRAY['red', 'instant', 'classic', 'full-art'], '{"colors": ["red"], "cmc": 1, "format": "legacy"}', 10, 'active'),
  
  ('p2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'physical', 'Jace the Mind Sculptor Portrait', 'Detailed character portrait alter of Jace, the Mind Sculptor. Professional quality with intricate facial details and flowing robes. Sealed for protection.', 120.00, 'USD', 1, ARRAY['https://images.pexels.com/photos/8111357/pexels-photo-8111357.jpeg?w=400'], '550e8400-e29b-41d4-a716-446655440001', ARRAY['blue', 'planeswalker', 'portrait', 'premium'], '{"colors": ["blue"], "cmc": 4, "format": "legacy"}', 14, 'active'),
  
  ('p3333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'digital', 'Dragon Token Set (5 designs)', 'Collection of 5 unique dragon token designs in various colors. High-resolution digital files ready for printing. Includes red, blue, black, green, and white dragons.', 15.00, 'USD', null, ARRAY['https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?w=400'], '550e8400-e29b-41d4-a716-446655440002', ARRAY['tokens', 'dragons', 'digital', 'multicolor'], '{"token_type": "creature", "power": "various", "toughness": "various"}', 1, 'active'),
  
  ('p4444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'physical', 'Custom Commander Tokens', 'Set of 10 physical tokens customized for your commander deck. Premium cardstock with professional printing. Specify your token needs in order notes.', 25.00, 'USD', 5, ARRAY['https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?w=400'], '550e8400-e29b-41d4-a716-446655440002', ARRAY['tokens', 'commander', 'custom', 'physical'], '{"token_type": "custom", "quantity": 10}', 5, 'active'),
  
  ('p5555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'physical', 'Eldrazi Playmat', 'Large gaming playmat featuring original Eldrazi-themed artwork. High-quality fabric surface with rubber backing. Perfect for tournament play.', 35.00, 'USD', 3, ARRAY['https://images.pexels.com/photos/4691564/pexels-photo-4691564.jpeg?w=400'], '550e8400-e29b-41d4-a716-446655440003', ARRAY['playmat', 'eldrazi', 'tournament', 'fabric'], '{"size": "24x14 inches", "material": "fabric"}', 7, 'active');

-- Insérer des services
INSERT INTO services (id, shop_id, title, description, base_price, currency, requires_brief, delivery_days, category_id, status) VALUES
  ('s1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Custom Card Alter Commission', 'Professional hand-painted card alter service. I can alter any MTG card with your desired artwork, from simple border extensions to full art transformations. Tournament legal thickness guaranteed.', 50.00, 'USD', true, 14, '550e8400-e29b-41d4-a716-446655440005', 'active'),
  
  ('s2222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'MTG Judge Certification Coaching', 'One-on-one coaching sessions to help you pass your MTG judge certification exam. Covers rules, policy, and practical scenarios. Includes study materials and practice tests.', 75.00, 'USD', true, 7, '550e8400-e29b-41d4-a716-446655440007', 'active'),
  
  ('s3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Competitive Deck Optimization', 'Professional deckbuilding service for competitive play. I analyze your current list and optimize it for your local meta. Includes sideboard guide and play strategy.', 40.00, 'USD', true, 3, '550e8400-e29b-41d4-a716-446655440006', 'active'),
  
  ('s4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Budget Commander Deck Build', 'Custom commander deck built to your specifications and budget. Includes 99-card decklist, strategy guide, and upgrade path recommendations.', 25.00, 'USD', true, 5, '550e8400-e29b-41d4-a716-446655440006', 'active'),
  
  ('s5555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Custom Art Commission', 'Original digital artwork for your MTG-related needs. Can create character portraits, landscapes, or abstract pieces. High-resolution files provided.', 100.00, 'USD', true, 10, '550e8400-e29b-41d4-a716-446655440008', 'active');

-- Insérer des portfolios
INSERT INTO portfolios (id, shop_id, title, images, before_after, tags, price_range) VALUES
  ('pf111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Recent Card Alters Gallery', ARRAY['https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?w=400', 'https://images.pexels.com/photos/8111357/pexels-photo-8111357.jpeg?w=400', 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?w=400'], false, ARRAY['alters', 'hand-painted', 'tournament-legal'], '$30-150'),
  
  ('pf222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Token Design Showcase', ARRAY['https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?w=400', 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?w=400'], false, ARRAY['tokens', 'digital-art', 'creatures'], '$10-50'),
  
  ('pf333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Before & After Transformations', ARRAY['https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?w=400', 'https://images.pexels.com/photos/8111357/pexels-photo-8111357.jpeg?w=400'], true, ARRAY['transformation', 'before-after', 'restoration'], '$40-200');

-- Insérer des commandes de test
INSERT INTO orders (id, user_id, total, currency, status, breakdown_by_shop) VALUES
  ('o1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 95.25, 'USD', 'paid', '{"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa": {"shop_name": "Alice Art Studio", "subtotal": 90.25, "items": [{"title": "Lightning Bolt Full Art Alter", "qty": 1, "unit_price": 45.00}, {"title": "Eldrazi Playmat", "qty": 1, "unit_price": 35.00}]}}'),
  
  ('o2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 78.75, 'USD', 'processing', '{"dddddddd-dddd-dddd-dddd-dddddddddddd": {"shop_name": "Pro Deck Solutions", "subtotal": 75.00, "items": [{"title": "Competitive Deck Optimization", "qty": 1, "unit_price": 40.00}, {"title": "Budget Commander Deck Build", "qty": 1, "unit_price": 25.00}]}}');

-- Insérer des éléments de commande
INSERT INTO order_items (id, order_id, shop_id, item_type, item_id, qty, unit_price, currency, status, delivery_due_at) VALUES
  ('oi111111-1111-1111-1111-111111111111', 'o1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'product', 'p1111111-1111-1111-1111-111111111111', 1, 45.00, 'USD', 'in_progress', NOW() + INTERVAL '10 days'),
  
  ('oi222222-2222-2222-2222-222222222222', 'o1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'product', 'p5555555-5555-5555-5555-555555555555', 1, 35.00, 'USD', 'shipped', NOW() + INTERVAL '7 days'),
  
  ('oi333333-3333-3333-3333-333333333333', 'o2222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'service', 's3333333-3333-3333-3333-333333333333', 1, 40.00, 'USD', 'pending', NOW() + INTERVAL '3 days'),
  
  ('oi444444-4444-4444-4444-444444444444', 'o2222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'service', 's4444444-4444-4444-4444-444444444444', 1, 25.00, 'USD', 'pending', NOW() + INTERVAL '5 days');

-- Insérer des messages
INSERT INTO messages (id, order_id, sender_id, body) VALUES
  ('m1111111-1111-1111-1111-111111111111', 'o1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Hi! I just placed an order for the Lightning Bolt alter. Could you make the lightning effects more dramatic? I love bold, vibrant colors!'),
  
  ('m2222222-2222-2222-2222-222222222222', 'o1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Absolutely! I can definitely make the lightning more dramatic with brighter blues and whites. I''ll send you a sketch before I start painting. Thanks for the order!'),
  
  ('m3333333-3333-3333-3333-333333333333', 'o2222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'Thanks for your deck optimization order! Could you tell me more about your local meta? What decks do you see most often at your LGS?');

-- Insérer des avis
INSERT INTO reviews (id, order_item_id, rating, text, status) VALUES
  ('r1111111-1111-1111-1111-111111111111', 'oi222222-2222-2222-2222-222222222222', 5, 'Amazing playmat! The artwork is stunning and the quality is top-notch. Fast shipping and great communication. Will definitely order again!', 'published'),
  
  ('r2222222-2222-2222-2222-222222222222', 'oi111111-1111-1111-1111-111111111111', 5, 'Alice did an incredible job on my Lightning Bolt alter. The detail work is phenomenal and it''s tournament legal. Highly recommend her work!', 'published');

-- Insérer des devis
INSERT INTO quotes (id, service_id, buyer_id, shop_id, brief, proposed_price, currency, status) VALUES
  ('q1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"card": "Black Lotus", "style": "full art extension", "theme": "mystical forest", "colors": "green and gold", "deadline": "2 weeks"}', 200.00, 'USD', 'sent'),
  
  ('q2222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '{"level": "L1 to L2", "timeline": "3 months", "focus_areas": ["policy", "tournament_rules"], "experience": "2 years as L1"}', 300.00, 'USD', 'draft');