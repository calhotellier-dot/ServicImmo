-- ============================================================================
-- Sprint 4 — Devis, factures, moteur tarification
-- Migration 0007
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Devis (F-12 à F-14) — immuables une fois envoyés (sauf duplication)
-- ────────────────────────────────────────────────────────────────────────────
create table public.devis (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  dossier_id uuid references public.dossiers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  reference text unique, -- DV-YYYY-NNNNN
  status text not null default 'brouillon' check (status in (
    'brouillon', 'envoye', 'accepte', 'refuse', 'expire', 'annule'
  )),

  -- Cible
  client_id uuid references public.contacts(id) on delete set null,
  client_snapshot jsonb, -- copie des infos client au moment de l'envoi

  -- Données de tarification (figées à l'envoi)
  subtotal_ht numeric not null default 0,
  vat_rate numeric not null default 0.20, -- 20% par défaut
  vat_amount numeric not null default 0,
  total_ttc numeric not null default 0,
  applied_modulators jsonb,

  -- Acceptation portail (magic link)
  accept_token text unique,
  accept_token_expires_at timestamptz,
  accepted_at timestamptz,
  refused_at timestamptz,
  refusal_reason text,

  -- PDF
  pdf_storage_path text,

  -- Validity
  valid_until date,
  notes text, -- notes internes
  commentary text, -- commentaire client (affiché sur le PDF)

  -- Envoi email
  sent_at timestamptz,
  sent_to_email text
);

create trigger devis_set_updated_at
  before update on public.devis
  for each row execute function public.set_updated_at();

create index idx_devis_org_status on public.devis (organization_id, status);
create index idx_devis_dossier on public.devis (dossier_id);
create index idx_devis_client on public.devis (client_id);
create index idx_devis_accept_token on public.devis (accept_token) where accept_token is not null;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Lignes de devis (ordered)
-- ────────────────────────────────────────────────────────────────────────────
create table public.devis_lignes (
  id uuid primary key default gen_random_uuid(),
  devis_id uuid not null references public.devis(id) on delete cascade,
  order_index integer not null default 0,
  diagnostic_type_id integer references public.diagnostic_types(id),
  label text not null,
  description text,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  line_total numeric not null default 0
);

create index idx_devis_lignes_devis on public.devis_lignes (devis_id, order_index);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Factures (F-15, F-16, F-17) — immuables, avoirs via factures de type 'avoir'
-- ────────────────────────────────────────────────────────────────────────────
create table public.factures (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  dossier_id uuid references public.dossiers(id) on delete set null,
  devis_id uuid references public.devis(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  reference text unique, -- FA-YYYY-NNNNN ou AV-YYYY-NNNNN
  invoice_type text not null default 'facture' check (invoice_type in ('facture', 'avoir')),
  status text not null default 'emise' check (status in (
    'emise', 'payee_partiel', 'payee', 'en_relance', 'litige', 'annule'
  )),

  client_id uuid references public.contacts(id) on delete set null,
  client_snapshot jsonb,

  subtotal_ht numeric not null default 0,
  vat_rate numeric not null default 0.20,
  vat_amount numeric not null default 0,
  total_ttc numeric not null default 0,
  amount_paid numeric not null default 0, -- total réglé (Stripe + manuel)

  issued_at timestamptz not null default now(),
  due_at date,

  pdf_storage_path text,

  -- Pour avoir : référence à la facture originelle
  credit_of_invoice_id uuid references public.factures(id) on delete restrict,

  sent_at timestamptz,
  sent_to_email text,
  notes text,
  commentary text
);

create trigger factures_set_updated_at
  before update on public.factures
  for each row execute function public.set_updated_at();

create index idx_factures_org_status on public.factures (organization_id, status);
create index idx_factures_dossier on public.factures (dossier_id);
create index idx_factures_client on public.factures (client_id);
create index idx_factures_due_at on public.factures (due_at) where status in ('emise', 'payee_partiel', 'en_relance');

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Lignes de factures (figées au moment de l'émission)
-- ────────────────────────────────────────────────────────────────────────────
create table public.facture_lignes (
  id uuid primary key default gen_random_uuid(),
  facture_id uuid not null references public.factures(id) on delete cascade,
  order_index integer not null default 0,
  diagnostic_type_id integer references public.diagnostic_types(id),
  label text not null,
  description text,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  line_total numeric not null default 0
);

create index idx_facture_lignes_facture on public.facture_lignes (facture_id, order_index);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Grille tarifaire paramétrable (F-18) — au niveau cabinet
-- ────────────────────────────────────────────────────────────────────────────
create table public.grille_tarifaire (
  id serial primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  diagnostic_type_id integer not null references public.diagnostic_types(id),
  -- Contexte : 'house' | 'apartment' | 'tertiary' | 'default' | ...
  context text not null default 'default',
  price_min numeric not null,
  price_max numeric not null,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (organization_id, diagnostic_type_id, context)
);

create trigger grille_tarifaire_set_updated_at
  before update on public.grille_tarifaire
  for each row execute function public.set_updated_at();

create index idx_grille_tarifaire_org on public.grille_tarifaire (organization_id, is_active);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. Règles de majoration (F-18)
-- ────────────────────────────────────────────────────────────────────────────
create table public.regles_majoration (
  id serial primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  rule_type text not null check (rule_type in ('TRAVEL_FEE', 'AREA_ABOVE_HAB', 'URGENT_DELAY', 'COLLECTIVE_HEATING', 'CUSTOM')),
  label text not null,
  -- Critères (jsonb libre selon rule_type)
  criteria jsonb not null default '{}'::jsonb,
  -- Action : flat amount OR percentage
  amount_flat numeric,
  amount_percent numeric,
  is_active boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_regles_majoration_org on public.regles_majoration (organization_id, is_active, order_index);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. Fonctions de numérotation
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.generate_devis_reference(org_id uuid)
returns text
language plpgsql
as $$
declare
  year_prefix text := 'DV-' || to_char(now(), 'YYYY') || '-';
  next_seq integer;
begin
  select coalesce(max(
    cast(substring(reference from '^DV-\d{4}-(\d+)$') as integer)
  ), 0) + 1
  into next_seq
  from public.devis
  where organization_id = org_id
    and reference like year_prefix || '%';
  return year_prefix || lpad(next_seq::text, 5, '0');
end;
$$;

create or replace function public.generate_facture_reference(org_id uuid, inv_type text)
returns text
language plpgsql
as $$
declare
  prefix text := case when inv_type = 'avoir' then 'AV-' else 'FA-' end;
  year_prefix text := prefix || to_char(now(), 'YYYY') || '-';
  next_seq integer;
begin
  select coalesce(max(
    cast(substring(reference from '^(?:FA|AV)-\d{4}-(\d+)$') as integer)
  ), 0) + 1
  into next_seq
  from public.factures
  where organization_id = org_id
    and reference like year_prefix || '%';
  return year_prefix || lpad(next_seq::text, 5, '0');
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 8. RLS
-- ────────────────────────────────────────────────────────────────────────────
alter table public.devis enable row level security;
alter table public.devis_lignes enable row level security;
alter table public.factures enable row level security;
alter table public.facture_lignes enable row level security;
alter table public.grille_tarifaire enable row level security;
alter table public.regles_majoration enable row level security;

create policy "devis_crud_own_org"
  on public.devis for all to authenticated
  using (organization_id in (select organization_id from public.users_profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from public.users_profiles where id = auth.uid()));

create policy "devis_lignes_crud_via_devis"
  on public.devis_lignes for all to authenticated
  using (devis_id in (select id from public.devis where organization_id in (select organization_id from public.users_profiles where id = auth.uid())))
  with check (devis_id in (select id from public.devis where organization_id in (select organization_id from public.users_profiles where id = auth.uid())));

create policy "factures_crud_own_org"
  on public.factures for all to authenticated
  using (organization_id in (select organization_id from public.users_profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from public.users_profiles where id = auth.uid()));

create policy "facture_lignes_crud_via_facture"
  on public.facture_lignes for all to authenticated
  using (facture_id in (select id from public.factures where organization_id in (select organization_id from public.users_profiles where id = auth.uid())))
  with check (facture_id in (select id from public.factures where organization_id in (select organization_id from public.users_profiles where id = auth.uid())));

create policy "grille_tarifaire_crud_own_org"
  on public.grille_tarifaire for all to authenticated
  using (organization_id in (select organization_id from public.users_profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from public.users_profiles where id = auth.uid()));

create policy "regles_majoration_crud_own_org"
  on public.regles_majoration for all to authenticated
  using (organization_id in (select organization_id from public.users_profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from public.users_profiles where id = auth.uid()));

-- ============================================================================
-- Fin migration 0007
-- ============================================================================
