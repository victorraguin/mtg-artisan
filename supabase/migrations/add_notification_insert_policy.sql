-- Politique pour permettre aux créateurs d'insérer des notifications
-- pour leurs propres commandes/boutiques

create policy "creators can insert notifications for their orders" on public.notifications
  for insert 
  with check (
    -- Vérifier que l'utilisateur est un créateur
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role in ('creator', 'admin')
    )
    -- ET que la notification concerne une de ses boutiques/commandes
    and (
      -- Pour les notifications de boutique : doit être propriétaire
      (category = 'shop' and exists (
        select 1 from shops 
        where owner_id = auth.uid()
      ))
      -- Pour les notifications de commandes : doit être vendeur de l'item
      or (category = 'orders' and exists (
        select 1 from order_items oi
        join shops s on s.id = oi.shop_id
        where s.owner_id = auth.uid()
        and oi.order_id::text = (payload->>'orderId')
      ))
      -- Pour les tests : autoriser si c'est pour soi-même
      or (event_name like 'test.%' and user_id = auth.uid())
    )
  );

-- Politique alternative plus simple pour les tests
create policy "users can create test notifications for themselves" on public.notifications
  for insert 
  with check (
    event_name like 'test.%' 
    and user_id = auth.uid()
  );
