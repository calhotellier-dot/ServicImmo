-- ============================================================================
-- Sprint 2 — Dossiers : table pivot + diagnostics rattachés
-- Migration 0005
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. dossiers — entité pivot de l'app (F-05)
-- ────────────────────────────────────────────────────────────────────────────
create table public.dossiers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Numérotation humaine (DO-YYYY-NNNNN, séquentielle par an/org)
  reference text unique,

  -- Statut workflow (Kanban)
  status text not null default 'brouillon' check (status in (
    'brouillon', 'a_planifier', 'planifie', 'en_cours', 'realise',
    'en_facturation', 'facture', 'paye', 'archive', 'annule'
  )),

  -- Projet (même champs que le funnel public quote_requests pour cohérence)
  project_type text check (project_type in ('sale', 'rental', 'works', 'coownership', 'other')),
  property_type text,

  -- Bien
  address text,
  address_line2 text,
  postal_code text,
  city text,
  surface numeric,
  rooms_count integer,
  is_coownership boolean,
  permit_date_range text check (permit_date_range in (
    'before_1949', '1949_to_1997', 'after_1997', 'unknown'
  )),
  heating_type text,
  heating_mode text check (heating_mode in ('individual', 'collective', 'unknown')),
  ecs_type text,
  gas_installation text,
  gas_over_15_years boolean,
  electric_over_15_years boolean,
  rental_furnished text,
  works_type text,

  -- Appartement
  residence_name text,
  floor integer,
  is_top_floor boolean,
  door_number text,
  is_duplex boolean,

  -- Dépendances + divers
  dependencies text[],
  dependencies_converted boolean,
  cadastral_reference text,
  purchase_date date,
  cooktop_connection text,
  commercial_activity text,
  heated_zones_count integer,
  configuration_notes text,

  -- Accès / locataires
  tenants_in_place boolean,
  access_notes text,
  syndic_contact text,

  -- Parties prenantes (FK contacts)
  proprietaire_id uuid references public.contacts(id) on delete set null,
  prescripteur_id uuid references public.contacts(id) on delete set null,
  -- Technicien assigné (users_profiles)
  technicien_id uuid references public.users_profiles(id) on delete set null,

  -- Diagnostics existants valides (pour filtrage du recalcul)
  existing_valid_diagnostics text[],
  existing_diagnostics_files jsonb not null default '[]'::jsonb,

  -- Résultat moteur (figé après wizard)
  required_diagnostics jsonb,
  diagnostics_to_clarify jsonb,
  price_min numeric,
  price_max numeric,
  applied_modulators jsonb,

  -- Planif
  urgency text,
  notes text,
  requested_date date,

  -- Quality-of-life
  completion_rate integer not null default 0 check (completion_rate between 0 and 100),
  tags text[],

  -- Source (origin tracking)
  source_quote_request_id uuid references public.quote_requests(id) on delete set null
);

create trigger dossiers_set_updated_at
  before update on public.dossiers
  for each row execute function public.set_updated_at();

create index idx_dossiers_org_status on public.dossiers (organization_id, status);
create index idx_dossiers_org_created on public.dossiers (organization_id, created_at desc);
create index idx_dossiers_proprietaire on public.dossiers (proprietaire_id);
create index idx_dossiers_prescripteur on public.dossiers (prescripteur_id);
create index idx_dossiers_technicien on public.dossiers (technicien_id);
create index idx_dossiers_reference on public.dossiers (reference);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. dossier_diagnostics — diagnostics rattachés à un dossier (après recalcul)
-- ────────────────────────────────────────────────────────────────────────────
create table public.dossier_diagnostics (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  diagnostic_type_id integer not null references public.diagnostic_types(id),
  status text not null default 'a_realiser' check (status in (
    'a_realiser', 'realise', 'annule'
  )),
  report_url text,
  completed_at timestamptz,
  price_override numeric, -- override manuel du prix (sinon = grille)
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dossier_id, diagnostic_type_id)
);

create trigger dossier_diagnostics_set_updated_at
  before update on public.dossier_diagnostics
  for each row execute function public.set_updated_at();

create index idx_dossier_diagnostics_dossier on public.dossier_diagnostics (dossier_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. RLS policies
-- ────────────────────────────────────────────────────────────────────────────
alter table public.dossiers enable row level security;
alter table public.dossier_diagnostics enable row level security;

create policy "dossiers_crud_own_org"
  on public.dossiers for all
  to authenticated
  using (
    organization_id in (
      select organization_id from public.users_profiles where id = auth.uid()
    )
  )
  with check (
    organization_id in (
      select organization_id from public.users_profiles where id = auth.uid()
    )
  );

create policy "dossier_diagnostics_crud_via_dossier"
  on public.dossier_diagnostics for all
  to authenticated
  using (
    dossier_id in (
      select id from public.dossiers
      where organization_id in (
        select organization_id from public.users_profiles where id = auth.uid()
      )
    )
  )
  with check (
    dossier_id in (
      select id from public.dossiers
      where organization_id in (
        select organization_id from public.users_profiles where id = auth.uid()
      )
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Fonction de numérotation (DO-YYYY-NNNNN, séquentielle par an et par org)
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.generate_dossier_reference(org_id uuid)
returns text
language plpgsql
as $$
declare
  year_prefix text := 'DO-' || to_char(now(), 'YYYY') || '-';
  next_seq integer;
  ref text;
begin
  select coalesce(max(
    cast(substring(reference from '^DO-\d{4}-(\d+)$') as integer)
  ), 0) + 1
  into next_seq
  from public.dossiers
  where organization_id = org_id
    and reference like year_prefix || '%';
  ref := year_prefix || lpad(next_seq::text, 5, '0');
  return ref;
end;
$$;

-- ============================================================================
-- Fin migration 0005
-- ============================================================================
