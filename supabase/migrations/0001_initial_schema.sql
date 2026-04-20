-- ============================================================================
-- Servicimmo v2 — Schema initial
-- Migration 0001 — avril 2026
-- ----------------------------------------------------------------------------
-- Tables : quote_requests, services, articles, cities, quote_notes, action_logs
-- Indexes : voir CLAUDE.md §Schéma Supabase
-- RLS : quote_requests public-insert, admin-read ; services/articles public-read
-- ============================================================================

-- Extension nécessaire pour gen_random_uuid() sur anciennes versions Postgres.
-- Sur Supabase (Postgres 15+) c'est déjà inclus, on le met quand même pour le local.
create extension if not exists "pgcrypto";

-- ============================================================================
-- Trigger helper : updated_at auto
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 1. quote_requests — demandes de devis (cœur métier)
-- ============================================================================
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Statut du parcours
  status text not null default 'draft' check (status in (
    'draft', 'email_captured', 'submitted', 'quoted', 'accepted', 'rejected', 'archived'
  )),

  -- Étape 1 — projet
  project_type text check (project_type in ('sale', 'rental', 'works', 'coownership', 'other')),

  -- Étape 2 — bien
  property_type text,
  address text,
  postal_code text,
  city text,
  surface numeric,
  rooms_count integer,
  is_coownership boolean,

  -- Étape 3 — email (capture progressive)
  email text,
  email_captured_at timestamptz,

  -- Étape 4 — caractéristiques techniques
  permit_date_range text check (permit_date_range in (
    'before_1949', '1949_to_1997', 'after_1997', 'unknown'
  )),
  heating_type text,
  gas_installation text,
  gas_over_15_years boolean,
  electric_over_15_years boolean,
  -- Spécifique location : logement vide ou meublé (impact Loi Boutin)
  rental_furnished text check (rental_furnished in ('vide', 'meuble', 'saisonnier', 'unknown')),
  -- Spécifique travaux
  works_type text check (works_type in ('renovation', 'demolition', 'voirie', 'other', 'unknown')),

  -- Étape 5 — délai et précisions
  urgency text,
  notes text,
  attachments jsonb not null default '[]'::jsonb, -- array d'URLs Storage

  -- Étape 6 — coordonnées
  civility text check (civility in ('mr', 'mme', 'other')),
  last_name text,
  first_name text,
  phone text,

  -- Calculs (figés au submit)
  required_diagnostics jsonb,  -- array d'objets RequiredDiagnostic
  diagnostics_to_clarify jsonb, -- array (option B "je ne sais pas")
  price_min numeric,
  price_max numeric,
  applied_modulators jsonb, -- array de labels ("surface 80-150 +10%", "pack 3+ -15%")

  -- Consentement RGPD
  consent_rgpd boolean not null default false,
  consent_at timestamptz,

  -- Tracking marketing
  source text,
  medium text,
  campaign text,
  referer text,
  user_agent text
);

create trigger quote_requests_set_updated_at
  before update on public.quote_requests
  for each row
  execute function public.set_updated_at();

-- Indexes de requêtes fréquentes
create index idx_quote_requests_status       on public.quote_requests (status);
create index idx_quote_requests_email        on public.quote_requests (email);
create index idx_quote_requests_created_at   on public.quote_requests (created_at desc);

-- ============================================================================
-- 2. services — offre catalogue Servicimmo
-- ============================================================================
create table public.services (
  id serial primary key,
  slug text unique not null,
  name text not null,
  category text not null check (category in ('particulier', 'pro', 'amiante', 'autre')),
  short_description text,
  content text,                    -- markdown
  price_min numeric,
  price_max numeric,
  duration_minutes integer,
  validity_months integer,         -- validité du diagnostic
  is_active boolean not null default true,
  order_index integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger services_set_updated_at
  before update on public.services
  for each row
  execute function public.set_updated_at();

create index idx_services_active_order on public.services (is_active, order_index);

-- ============================================================================
-- 3. articles — blog / veille réglementaire (migrés depuis l'ancien site)
-- ============================================================================
create table public.articles (
  id serial primary key,
  legacy_id integer unique,                 -- ex: 123 pour l'URL /a123.html ancienne
  slug text unique not null,
  title text not null,
  content text not null,                    -- markdown
  excerpt text,
  cover_image_url text,
  category text,                            -- 'dpe', 'amiante', 'reglementation', etc.
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  seo_title text,
  seo_description text,
  is_published boolean not null default true
);

create trigger articles_set_updated_at
  before update on public.articles
  for each row
  execute function public.set_updated_at();

create index idx_articles_published on public.articles (is_published, published_at desc);
create index idx_articles_legacy    on public.articles (legacy_id);
create index idx_articles_category  on public.articles (category);

-- ============================================================================
-- 4. cities — zones d'intervention + pages SEO locales
-- ============================================================================
create table public.cities (
  id serial primary key,
  slug text unique not null,       -- 'tours', 'amboise', 'joue-les-tours', …
  name text not null,
  postal_code text,
  department text not null default '37',
  latitude numeric,
  longitude numeric,
  is_primary_zone boolean not null default true,
  seo_content text,                -- markdown spécifique ville
  is_active boolean not null default true
);

create index idx_cities_active_dept on public.cities (is_active, department);

-- ============================================================================
-- 5. quote_notes — notes internes admin sur une demande
-- ============================================================================
create table public.quote_notes (
  id serial primary key,
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_quote_notes_request on public.quote_notes (quote_request_id, created_at desc);

-- ============================================================================
-- 6. action_logs — audit trail simple (admin actions)
-- ============================================================================
create table public.action_logs (
  id serial primary key,
  entity_type text,
  entity_id text,
  action text,
  author_id uuid references auth.users(id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_action_logs_entity on public.action_logs (entity_type, entity_id);
create index idx_action_logs_date   on public.action_logs (created_at desc);

-- ============================================================================
-- Row Level Security
-- ----------------------------------------------------------------------------
-- Règle générale : les routes API Next.js utilisent SUPABASE_SERVICE_ROLE_KEY
-- (bypass RLS) pour les opérations sensibles (update, lecture admin).
-- La clé anon publique ne peut faire qu'INSERT sur quote_requests et SELECT
-- sur services/articles/cities.
-- ============================================================================

alter table public.quote_requests enable row level security;
alter table public.services       enable row level security;
alter table public.articles       enable row level security;
alter table public.cities         enable row level security;
alter table public.quote_notes    enable row level security;
alter table public.action_logs    enable row level security;

-- quote_requests : INSERT public (anon) pour création du draft / submit final.
-- Pas de SELECT, UPDATE, DELETE public → passera par service_role côté serveur.
create policy "quote_requests_public_insert"
  on public.quote_requests
  for insert
  to anon, authenticated
  with check (true);

-- services : lecture publique des services actifs.
create policy "services_public_read_active"
  on public.services
  for select
  to anon, authenticated
  using (is_active = true);

-- articles : lecture publique des articles publiés.
create policy "articles_public_read_published"
  on public.articles
  for select
  to anon, authenticated
  using (is_published = true);

-- cities : lecture publique des villes actives.
create policy "cities_public_read_active"
  on public.cities
  for select
  to anon, authenticated
  using (is_active = true);

-- quote_notes + action_logs : aucune policy → accès uniquement via service_role.

-- ============================================================================
-- Fin de la migration 0001
-- ============================================================================
