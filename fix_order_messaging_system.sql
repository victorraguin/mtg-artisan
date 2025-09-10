-- Correction du système de messagerie des commandes
-- Ce script ajoute les politiques RLS manquantes pour les messages

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;

-- Créer les politiques RLS pour les messages
-- Les utilisateurs peuvent voir les messages des commandes où ils sont soit l'acheteur soit le vendeur
CREATE POLICY "messages_select_policy" ON messages
FOR SELECT USING (
  -- L'utilisateur est l'acheteur de la commande
  auth.uid() IN (
    SELECT user_id FROM orders WHERE id = messages.order_id
  )
  OR
  -- L'utilisateur est le vendeur (propriétaire du shop) de la commande
  auth.uid() IN (
    SELECT shops.owner_id 
    FROM orders
    JOIN order_items ON orders.id = order_items.order_id
    JOIN shops ON order_items.shop_id = shops.id
    WHERE orders.id = messages.order_id
  )
  OR
  -- L'utilisateur est l'expéditeur du message
  auth.uid() = messages.sender_id
);

-- Les utilisateurs peuvent insérer des messages dans les commandes où ils sont impliqués
CREATE POLICY "messages_insert_policy" ON messages
FOR INSERT WITH CHECK (
  -- L'utilisateur est l'acheteur de la commande
  auth.uid() IN (
    SELECT user_id FROM orders WHERE id = messages.order_id
  )
  OR
  -- L'utilisateur est le vendeur (propriétaire du shop) de la commande
  auth.uid() IN (
    SELECT shops.owner_id 
    FROM orders
    JOIN order_items ON orders.id = order_items.order_id
    JOIN shops ON order_items.shop_id = shops.id
    WHERE orders.id = messages.order_id
  )
);

-- Ajouter une fonction pour obtenir l'ID du vendeur d'une commande
CREATE OR REPLACE FUNCTION get_order_seller_id(order_uuid uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT shops.owner_id 
  FROM orders
  JOIN order_items ON orders.id = order_items.order_id
  JOIN shops ON order_items.shop_id = shops.id
  WHERE orders.id = order_uuid
  LIMIT 1;
$$;

-- Ajouter une fonction pour vérifier si un utilisateur peut accéder à une commande
CREATE OR REPLACE FUNCTION can_access_order(order_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    -- L'utilisateur est l'acheteur
    SELECT 1 FROM orders WHERE id = order_uuid AND user_id = user_uuid
    UNION
    -- L'utilisateur est le vendeur
    SELECT 1 FROM orders
    JOIN order_items ON orders.id = order_items.order_id
    JOIN shops ON order_items.shop_id = shops.id
    WHERE orders.id = order_uuid AND shops.owner_id = user_uuid
  );
$$;

-- Vérifier que les tables nécessaires existent et ont les bonnes colonnes
DO $$ 
BEGIN
  -- Vérifier que la table messages existe
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
    RAISE EXCEPTION 'La table messages n''existe pas. Veuillez d''abord exécuter les migrations de base.';
  END IF;
  
  -- Vérifier que la table order_items existe
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
    RAISE EXCEPTION 'La table order_items n''existe pas. Veuillez d''abord exécuter les migrations de base.';
  END IF;
  
  RAISE NOTICE 'Système de messagerie configuré avec succès !';
END $$;
