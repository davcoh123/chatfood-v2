-- Create restaurant_settings table
create table public.restaurant_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  chatbot_name text not null default 'ChatFood Bot',
  chatbot_active boolean not null default true,
  address text,
  opening_hours jsonb not null default '[
    {"day": "lundi", "slot1": "", "slot2": ""},
    {"day": "mardi", "slot1": "", "slot2": ""},
    {"day": "mercredi", "slot1": "", "slot2": ""},
    {"day": "jeudi", "slot1": "", "slot2": ""},
    {"day": "vendredi", "slot1": "", "slot2": ""},
    {"day": "samedi", "slot1": "", "slot2": ""},
    {"day": "dimanche", "slot1": "", "slot2": ""}
  ]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.restaurant_settings enable row level security;

-- RLS Policies
create policy "Users can view their own restaurant settings"
  on public.restaurant_settings
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own restaurant settings"
  on public.restaurant_settings
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own restaurant settings"
  on public.restaurant_settings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can view all restaurant settings"
  on public.restaurant_settings
  for select
  using (is_admin());

create policy "Admins can update all restaurant settings"
  on public.restaurant_settings
  for update
  using (is_admin());

create policy "Block anonymous access to restaurant settings"
  on public.restaurant_settings
  for all
  using (false);

-- Trigger pour updated_at
create trigger update_restaurant_settings_updated_at
  before update on public.restaurant_settings
  for each row
  execute function public.update_updated_at_column();

-- Créer des settings par défaut pour les utilisateurs existants
insert into public.restaurant_settings (user_id, chatbot_name, chatbot_active, opening_hours)
select 
  user_id, 
  'ChatFood Bot',
  true,
  '[
    {"day": "lundi", "slot1": "", "slot2": ""},
    {"day": "mardi", "slot1": "", "slot2": ""},
    {"day": "mercredi", "slot1": "", "slot2": ""},
    {"day": "jeudi", "slot1": "", "slot2": ""},
    {"day": "vendredi", "slot1": "", "slot2": ""},
    {"day": "samedi", "slot1": "", "slot2": ""},
    {"day": "dimanche", "slot1": "", "slot2": ""}
  ]'::jsonb
from profiles
where not exists (
  select 1 from restaurant_settings where restaurant_settings.user_id = profiles.user_id
);