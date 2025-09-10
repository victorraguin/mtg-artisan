-- Correction des politiques RLS pour permettre les opérations normales

-- Politiques pour escrows
DROP POLICY IF EXISTS "ecriture_service_escrows" ON escrows;
CREATE POLICY "ecriture_service_escrows" ON escrows 
  FOR ALL USING (
    auth.role() = 'service_role' OR 
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id
  );

-- Permettre l'insertion d'escrows par les utilisateurs authentifiés
CREATE POLICY "insertion_escrows" ON escrows 
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id OR 
    auth.role() = 'service_role'
  );

-- Politiques pour notifications
DROP POLICY IF EXISTS "Utilisateurs lisent leurs notifications" ON notifications;
CREATE POLICY "Utilisateurs lisent leurs notifications" ON notifications 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insertion_notifications" ON notifications 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

-- Politiques pour payouts
DROP POLICY IF EXISTS "Propriétaires lisent leurs payouts" ON payouts;
CREATE POLICY "Propriétaires lisent leurs payouts" ON payouts 
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM shops WHERE id = shop_id
    ) OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "insertion_payouts" ON payouts 
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM shops WHERE id = shop_id
    ) OR 
    auth.role() = 'service_role'
  );

-- Politiques pour product_views (analytics)
CREATE POLICY "Tout le monde peut tracker les vues" ON product_views 
  FOR INSERT WITH CHECK (true);

-- Politiques pour cart_analytics
CREATE POLICY "Tout le monde peut tracker le panier" ON cart_analytics 
  FOR INSERT WITH CHECK (true);
