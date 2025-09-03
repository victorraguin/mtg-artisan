-- Système d'escrow et litige

-- Table des escrows
create table escrows (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  buyer_id uuid references profiles(id),
  seller_id uuid references profiles(id),
  gross_amount numeric not null,
  commission_platform numeric not null,
  commission_ambassador numeric not null,
  net_amount numeric not null,
  currency text not null,
  status text not null check (status in ('held','delivered','released','refunded','dispute')),
  created_at timestamptz default now(),
  released_at timestamptz,
  auto_release_at timestamptz
);

alter table escrows enable row level security;
create policy "lire_ses_escrows" on escrows for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "ecriture_service_escrows" on escrows for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Table des litiges
create table disputes (
  id uuid primary key default gen_random_uuid(),
  escrow_id uuid references escrows(id),
  opened_by uuid references profiles(id),
  reason text,
  status text not null check (status in ('open','resolved','refunded','rejected')) default 'open',
  created_at timestamptz default now(),
  resolved_at timestamptz
);

alter table disputes enable row level security;
create policy "lire_ses_litiges" on disputes for select using (
  auth.uid() = opened_by or auth.uid() in (select seller_id from escrows where id = escrow_id)
);
create policy "ecriture_service_disputes" on disputes for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Messages de litige
create table dispute_messages (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid references disputes(id),
  sender_id uuid references profiles(id),
  message text not null,
  created_at timestamptz default now()
);

alter table dispute_messages enable row level security;
create policy "lire_messages_litige" on dispute_messages for select using (
  auth.uid() in (
    select opened_by from disputes where id = dispute_id
  ) or auth.uid() in (
    select seller_id from escrows where id in (select escrow_id from disputes where id = dispute_id)
  )
);
create policy "ecriture_service_messages" on dispute_messages for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Paramètres de plateforme
create table platform_settings (
  id uuid primary key default gen_random_uuid(),
  platform_commission_rate numeric,
  ambassador_commission_rate numeric,
  auto_release_days integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table platform_settings enable row level security;
create policy "lecture_parametres" on platform_settings for select using (true);
create policy "ecriture_service_parametres" on platform_settings for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
