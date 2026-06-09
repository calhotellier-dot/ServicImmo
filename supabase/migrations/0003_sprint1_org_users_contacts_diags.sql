-- ============================================================================
-- Sprint 1 — Fondations DB : organizations, users, contacts, diagnostic_types
-- Migration 0003 — avril 2026
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. organizations — préparé multi-tenant (1 seul cabinet pour l'instant)
-- ────────────────────────────────────────────────────────────────────────────
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text unique not null,
  name text not null,
  siret text,
  iban text,
  tva_intra text,
  address_line1 text,
  address_line2 text,
  postal_code text,
  city text,
  country text not null default 'France',
  phone text,
  email text,
  logo_url text,
  settings jsonb not null default '{}'::jsonb
);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. users_profiles — étend auth.users (Supabase Auth) avec le métier
-- ────────────────────────────────────────────────────────────────────────────
create table public.users_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text,
  last_name text,
  role text not null default 'diagnostiqueur' check (role in ('admin', 'diagnostiqueur', 'assistant')),
  phone text,
  avatar_url text,
  is_active boolean not null default true
);

create trigger users_profiles_set_updated_at
  before update on public.users_profiles
  for each row execute function public.set_updated_at();

create index idx_users_profiles_org on public.users_profiles (organization_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. contacts — particuliers + prescripteurs unifiés
-- ────────────────────────────────────────────────────────────────────────────
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Type unifie particulier + prescripteurs
  type text not null check (type in ('particulier', 'agence', 'notaire', 'syndic', 'autre')),
  -- Identité
  civility text check (civility in ('mr', 'mme', 'other')),
  first_name text,
  last_name text,
  -- Pour les prescripteurs (agence/notaire/syndic) :
  company_name text,
  siret text,
  -- Contact
  email text,
  phone text,
  phone_alt text,
  -- Adresse
  address_line1 text,
  address_line2 text,
  postal_code text,
  city text,
  country text default 'France',
  -- Enrichissement Pappers
  pappers_data jsonb,
  pappers_enriched_at timestamptz,
  -- Notes libres
  notes text,
  -- Tags libres (dédup, segmentation)
  tags text[],
  -- Soft delete
  archived_at timestamptz
);

create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

create index idx_contacts_org on public.contacts (organization_id);
create index idx_contacts_type on public.contacts (type);
create index idx_contacts_email on public.contacts (email);
create index idx_contacts_name on public.contacts (last_name, first_name);
create index idx_contacts_company on public.contacts (company_name);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. diagnostic_types — catalogue des 15 types (DPE, Amiante, Plomb, ...)
-- ────────────────────────────────────────────────────────────────────────────
create table public.diagnostic_types (
  id serial primary key,
  slug text unique not null,
  name text not null,
  short_name text,
  category text not null check (category in ('logement', 'tertiaire', 'travaux', 'copropriete', 'mesurage', 'etat')),
  description text,
  validity_months integer, -- -1 = illimité
  is_active boolean not null default true,
  order_index integer not null default 0
);

create index idx_diagnostic_types_active on public.diagnostic_types (is_active, order_index);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. RLS policies initiales
-- ────────────────────────────────────────────────────────────────────────────
alter table public.organizations    enable row level security;
alter table public.users_profiles   enable row level security;
alter table public.contacts         enable row level security;
alter table public.diagnostic_types enable row level security;

-- organizations : lecture pour les membres de l'org, écriture admin only
create policy "organizations_read_own"
  on public.organizations for select
  to authenticated
  using (
    id in (
      select organization_id from public.users_profiles where id = auth.uid()
    )
  );

create policy "organizations_update_admin"
  on public.organizations for update
  to authenticated
  using (
    id in (
      select organization_id from public.users_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- users_profiles : chacun voit son org, admin peut CRUD les profils de son org
create policy "users_profiles_read_own_org"
  on public.users_profiles for select
  to authenticated
  using (
    organization_id in (
      select organization_id from public.users_profiles where id = auth.uid()
    )
  );

create policy "users_profiles_insert_admin"
  on public.users_profiles for insert
  to authenticated
  with check (
    organization_id in (
      select organization_id from public.users_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "users_profiles_update_self_or_admin"
  on public.users_profiles for update
  to authenticated
  using (
    id = auth.uid()
    or organization_id in (
      select organization_id from public.users_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- contacts : CRUD scopé à l'organisation de l'utilisateur
create policy "contacts_select_own_org"
  on public.contacts for select
  to authenticated
  using (
    organization_id in (
      select organization_id from public.users_profiles where id = auth.uid()
    )
  );

create policy "contacts_insert_own_org"
  on public.contacts for insert
  to authenticated
  with check (
    organization_id in (
      select organization_id from public.users_profiles where id = auth.uid()
    )
  );

create policy "contacts_update_own_org"
  on public.contacts for update
  to authenticated
  using (
    organization_id in (
      select organization_id from public.users_profiles where id = auth.uid()
    )
  );

create policy "contacts_delete_own_org"
  on public.contacts for delete
  to authenticated
  using (
    organization_id in (
      select organization_id from public.users_profiles where id = auth.uid()
    )
  );

-- diagnostic_types : lecture publique (catalogue statique)
create policy "diagnostic_types_read_public"
  on public.diagnostic_types for select
  to anon, authenticated
  using (is_active = true);

-- ============================================================================
-- Fin de la migration 0003
-- ============================================================================
