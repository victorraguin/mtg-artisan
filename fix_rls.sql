-- Correction des problèmes RLS - À exécuter dans Supabase SQL Editor

-- 1. Désactiver temporairement RLS sur les tables problématiques
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE shops DISABLE ROW LEVEL SECURITY;

-- 2. Vérifier que RLS est désactivé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('order_items', 'orders', 'profiles', 'products', 'services', 'categories', 'shops');

-- 3. Nettoyer les politiques problématiques (optionnel)
-- DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
-- DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
-- etc.

-- 4. Recréer des politiques RLS simples (à faire plus tard)
-- CREATE POLICY "Enable read access for authenticated users" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Enable read access for authenticated users" ON products FOR SELECT USING (auth.role() = 'authenticated');
-- etc.
