-- Correction complète des problèmes RLS - À exécuter dans Supabase SQL Editor

-- 1. Désactiver RLS sur TOUTES les tables
ALTER TABLE public.cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops DISABLE ROW LEVEL SECURITY;

-- 2. Vérifier que RLS est désactivé sur toutes les tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '❌ RLS ACTIVÉ' 
    ELSE '✅ RLS DÉSACTIVÉ' 
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'cart_items', 'categories', 'messages', 'order_items', 
  'orders', 'portfolios', 'products', 'profiles', 
  'quotes', 'reviews', 'services', 'shops'
)
ORDER BY tablename;

-- 3. Nettoyer toutes les politiques existantes (optionnel)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.services;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.categories;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.shops;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.order_items;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.cart_items;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.quotes;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.reviews;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.messages;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.portfolios;

-- 4. Message de confirmation
SELECT 'RLS désactivé sur toutes les tables. L''application devrait maintenant fonctionner.' as message;
