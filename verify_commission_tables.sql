-- Script de vérification des tables du système de commissions
-- À exécuter dans l'éditeur SQL de Supabase pour vérifier la migration

-- 1. Vérifier que les tables ont été créées
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('commissions', 'ambassadors', 'payouts')
ORDER BY table_name;

-- 2. Vérifier la structure de la table commissions
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'commissions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier la structure de la table ambassadors
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'ambassadors' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Vérifier la structure de la table payouts
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'payouts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Vérifier les politiques RLS créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('commissions', 'ambassadors', 'payouts')
ORDER BY tablename, policyname;

-- 6. Vérifier les règles de commission par défaut
SELECT 
  id,
  scope,
  rate,
  fixed_fee,
  currency,
  is_active,
  created_at
FROM commissions
ORDER BY scope;

-- 7. Vérifier les index créés
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('commissions', 'ambassadors', 'payouts')
ORDER BY tablename, indexname;
