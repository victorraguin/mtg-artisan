-- Configuration du stockage Supabase pour les bannières de boutique
-- À exécuter dans la console SQL de Supabase

-- 1. Créer le bucket pour les assets de boutique
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'shop-assets',
  'shop-assets',
  true,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  5242880
) ON CONFLICT (id) DO NOTHING;

-- 2. Politique pour permettre la lecture publique des assets
CREATE POLICY "Allow public read access to shop assets" ON storage.objects
FOR SELECT USING (bucket_id = 'shop-assets');

-- 3. Politique pour permettre aux propriétaires de boutique d'uploader
CREATE POLICY "Allow shop owners to upload assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'shop-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Politique pour permettre aux propriétaires de modifier leurs assets
CREATE POLICY "Allow shop owners to update their assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'shop-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Politique pour permettre aux propriétaires de supprimer leurs assets
CREATE POLICY "Allow shop owners to delete their assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'shop-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Vérification
SELECT 
  'Bucket créé avec succès' as status,
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE id = 'shop-assets';
