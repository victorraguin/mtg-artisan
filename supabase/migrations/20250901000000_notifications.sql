-- Notifications system tables

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  category text not null check (category in ('orders','messages','reviews','shop','system')),
  event_name text not null,
  title text not null,
  body text,
  action_url text,
  icon text,
  payload jsonb,
  seen_at timestamptz,
  read_at timestamptz,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "select own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- Events table for ingress queue
create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  actor_id uuid,
  target_user_ids uuid[] not null,
  shop_id uuid,
  order_id uuid,
  payload jsonb,
  occurred_at timestamptz default now(),
  idempotency_key text unique
);

alter table public.notification_events enable row level security;
create policy "service role access" on public.notification_events
  for all using (auth.role() = 'service_role');

-- Deliveries table
create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid references public.notifications(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  channel text not null check (channel in ('email','push','webhook')),
  status text not null check (status in ('queued','sending','sent','failed','suppressed')),
  attempts int not null default 0,
  last_error text,
  provider_message_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.notification_deliveries enable row level security;
create policy "service role only" on public.notification_deliveries
  for all using (auth.role() = 'service_role');

-- Preferences table
create table if not exists public.notification_preferences (
  user_id uuid not null references auth.users(id),
  category text not null,
  channel text not null,
  enabled boolean not null default true,
  digest_frequency text not null default 'immediate' check (digest_frequency in ('immediate','daily','weekly')),
  primary key (user_id, category, channel)
);

alter table public.notification_preferences enable row level security;
create policy "manage own prefs" on public.notification_preferences
  for all using (auth.uid() = user_id);

-- Templates table
create table if not exists public.notification_templates (
  key text,
  lang text,
  subject text,
  html text,
  text text,
  primary key (key, lang)
);

alter table public.notification_templates enable row level security;
create policy "service role templates" on public.notification_templates
  for all using (auth.role() = 'service_role');

-- Push subscriptions
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

alter table public.push_subscriptions enable row level security;
create policy "manage own subscriptions" on public.push_subscriptions
  for all using (auth.uid() = user_id);

-- Shop webhooks
create table if not exists public.shop_webhooks (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id),
  url text not null,
  secret text not null,
  events text[] not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.shop_webhooks enable row level security;
create policy "service role webhooks" on public.shop_webhooks
  for all using (auth.role() = 'service_role');
