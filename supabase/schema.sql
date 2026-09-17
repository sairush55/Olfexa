-- ==============================================================================
-- OLFEXA: Supabase Database Schema & RLS Security Migration
-- Fragrance Intelligence Platform
-- ==============================================================================

-- 1. Profiles Table (User metadata linked directly to Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  fragrance_experience text default 'enthusiast',
  sensitivities text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Scans Table (Analysis Dossiers, OCR Text, Provenance, and Ingredient Data)
create table if not exists public.scans (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  perfume_name text not null,
  brand_name text,
  image_url text,
  alcohol_status text,
  transparency_rating text default 'HIGH',
  allergen_count integer default 0,
  irritant_count integer default 0,
  watchlist_match_count integer default 0,
  full_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Watchlist Table (Personalized Ingredient Avoidance / Sensitivity List)
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  ingredient_name text not null,
  reason text,
  sensitivity_level text default 'moderate' check (sensitivity_level in ('mild', 'moderate', 'strict')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Indexes for High-Performance Queries
create index if not exists idx_scans_user_id on public.scans(user_id);
create index if not exists idx_scans_created_at on public.scans(created_at desc);
create index if not exists idx_watchlist_user_id on public.watchlist(user_id);

-- 5. Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.scans enable row level security;
alter table public.watchlist enable row level security;

-- 6. Row Level Security Policies: Profiles
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 7. Row Level Security Policies: Scans
drop policy if exists "Users can view their own scans or public demo scans" on public.scans;
create policy "Users can view their own scans or public demo scans"
  on public.scans for select
  using (auth.uid() = user_id or user_id is null);

drop policy if exists "Users can insert their own scans" on public.scans;
create policy "Users can insert their own scans"
  on public.scans for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own scans" on public.scans;
create policy "Users can update their own scans"
  on public.scans for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own scans" on public.scans;
create policy "Users can delete their own scans"
  on public.scans for delete
  using (auth.uid() = user_id);

-- 8. Row Level Security Policies: Watchlist
drop policy if exists "Users can view their own watchlist" on public.watchlist;
create policy "Users can view their own watchlist"
  on public.watchlist for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert into their own watchlist" on public.watchlist;
create policy "Users can insert into their own watchlist"
  on public.watchlist for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own watchlist" on public.watchlist;
create policy "Users can update their own watchlist"
  on public.watchlist for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete from their own watchlist" on public.watchlist;
create policy "Users can delete from their own watchlist"
  on public.watchlist for delete
  using (auth.uid() = user_id);

-- 9. Automatic Profile Creation Trigger on Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid conflicts upon re-running
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 10. Ingredients Table (Canonical INCI Knowledge Base)
create table if not exists public.ingredients (
  id text primary key,
  inci_name text not null unique,
  common_names text[] default '{}',
  synonyms text[] default '{}',
  cas_number text,
  ec_number text,
  category text not null,
  functions text[] default '{}',
  is_alcohol boolean default false,
  alcohol_type text,
  is_eu_allergen boolean default false,
  is_potential_irritant boolean default false,
  description text not null,
  potential_concerns text,
  sources jsonb not null default '[]',
  regional_regulations jsonb not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Ingredient Evidence Table (Authoritative regulatory citations)
create table if not exists public.ingredient_evidence (
  id text primary key,
  ingredient_id text references public.ingredients(id) on delete cascade,
  organization text not null,
  title text not null,
  citation_url text,
  publication_year integer,
  key_findings text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_ingredients_inci_name on public.ingredients(inci_name);
create index if not exists idx_ingredients_cas_number on public.ingredients(cas_number);
create index if not exists idx_ingredient_evidence_ingredient_id on public.ingredient_evidence(ingredient_id);

alter table public.ingredients enable row level security;
alter table public.ingredient_evidence enable row level security;

-- RLS: Read-only public access to verified scientific knowledge base
drop policy if exists "Public read access for verified ingredients" on public.ingredients;
create policy "Public read access for verified ingredients" on public.ingredients for select using (true);

drop policy if exists "Public read access for ingredient evidence" on public.ingredient_evidence;
create policy "Public read access for ingredient evidence" on public.ingredient_evidence for select using (true);

