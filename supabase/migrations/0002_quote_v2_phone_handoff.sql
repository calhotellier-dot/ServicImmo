-- ============================================================================
-- Servicimmo v2 — Migration 0002 : champs "rappel téléphone" + grille pricing
-- Avril 2026
-- ----------------------------------------------------------------------------
-- Objectif : étendre `quote_requests` avec les champs que la cliente collectait
-- jusqu'ici par téléphone (accès, diag existants, chauffage indiv/collectif,
-- dépendances, etc.) et créer la table `pricing_rules` éditable.
--
-- Toutes les nouvelles colonnes sont nullable → backward compat drafts v1/v2.
-- Le téléphone reste nullable en SQL (contrainte portée par Zod au submit).
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. quote_requests — nouvelles colonnes
-- ────────────────────────────────────────────────────────────────────────────

alter table public.quote_requests
  -- Contact / accès
  add column if not exists tenants_in_place  boolean,
  add column if not exists access_notes      text,

  -- Chauffage / ECS
  add column if not exists heating_mode      text check (heating_mode in (
    'individual', 'collective', 'unknown'
  )),
  add column if not exists ecs_type          text check (ecs_type in (
    'same_as_heating', 'electric', 'gas', 'solar', 'other', 'unknown'
  )),
  add column if not exists syndic_contact    text,

  -- Dépendances
  add column if not exists dependencies            text[],
  add column if not exists dependencies_converted  boolean,

  -- Diagnostics déjà valides (+ pièces jointes client)
  add column if not exists existing_valid_diagnostics text[],
  add column if not exists existing_diagnostics_files jsonb not null default '[]'::jsonb,

  -- Source prescripteur
  add column if not exists referral_source   text check (referral_source in (
    'particulier', 'agence', 'notaire', 'syndic', 'recommandation', 'autre'
  )),
  add column if not exists referral_other    text,

  -- Spécifique appartement
  add column if not exists residence_name    text,
  add column if not exists floor             integer,
  add column if not exists is_top_floor      boolean,
  add column if not exists door_number       text,
  add column if not exists is_duplex         boolean,

  -- Divers
  add column if not exists purchase_date         date,
  add column if not exists cooktop_connection    text check (cooktop_connection in (
    'souple', 'rigide', 'unknown'
  )),
  add column if not exists cadastral_reference   text,

  -- Spécifique commercial / tertiaire
  add column if not exists commercial_activity   text,
  add column if not exists heated_zones_count    integer,
  add column if not exists configuration_notes   text,

  -- Mode de règlement préféré (optionnel, info ops)
  add column if not exists preferred_payment_method text check (preferred_payment_method in (
    'cb', 'chq', 'esp', 'virt'
  )),

  -- Distance calculée au siège Servicimmo (Tours) — renseignée côté serveur
  add column if not exists distance_km numeric;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. pricing_rules — grille tarifaire éditable
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public.pricing_rules (
  id            serial primary key,
  diagnostic_id text    not null,
  context       text    not null default 'default',   -- 'house' | 'apartment' | 'default'
  price_min     numeric not null,
  price_max     numeric not null,
  notes         text,
  is_active     boolean not null default true,
  updated_at    timestamptz not null default now(),
  unique (diagnostic_id, context)
);

create trigger pricing_rules_set_updated_at
  before update on public.pricing_rules
  for each row
  execute function public.set_updated_at();

create index if not exists idx_pricing_rules_active
  on public.pricing_rules (is_active, diagnostic_id);

alter table public.pricing_rules enable row level security;

create policy "pricing_rules_public_read_active"
  on public.pricing_rules
  for select
  to anon, authenticated
  using (is_active = true);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Seed initial — reprise de BASE_PRICES (lib/diagnostics/pricing.ts)
-- ⚠️ Tarifs INDICATIFS, à valider avec Servicimmo avant prod.
-- ────────────────────────────────────────────────────────────────────────────

insert into public.pricing_rules (diagnostic_id, context, price_min, price_max, notes) values
  ('dpe',            'house',     110, 220, 'DPE logement — maison'),
  ('dpe',            'apartment',  90, 180, 'DPE logement — appartement'),
  ('dpe_tertiary',   'default',   200, 800, 'DPE tertiaire (local pro)'),
  ('dpe_collective', 'default',   600,1500, 'DPE collectif (sur devis réel)'),
  ('dta',            'default',   400, 900, 'DTA parties communes'),
  ('lead',           'default',   110, 220, 'CREP — plomb'),
  ('asbestos',       'house',      80, 150, 'Amiante vente — maison'),
  ('asbestos',       'apartment',  70, 130, 'Amiante vente — appartement'),
  ('dapp',           'house',      80, 150, 'DAPP location — maison'),
  ('dapp',           'apartment',  70, 130, 'DAPP location — appartement'),
  ('asbestos_works', 'default',   250, 600, 'Repérage amiante avant travaux (RAT)'),
  ('lead_works',     'default',   150, 400, 'Plomb avant travaux'),
  ('termites',       'default',    90, 170, 'État parasitaire — termites'),
  ('gas',            'default',    90, 130, 'État installation gaz'),
  ('electric',       'default',    90, 130, 'État installation électrique'),
  ('carrez',         'default',    60, 110, 'Loi Carrez'),
  ('boutin',         'default',    60, 110, 'Loi Boutin'),
  ('erp',            'default',    20,  40, 'État des risques et pollutions')
on conflict (diagnostic_id, context) do nothing;

-- ============================================================================
-- Fin de la migration 0002
-- ============================================================================
