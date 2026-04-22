-- ============================================================================
-- Sprint 6 — Demandes de documents (F-23 / F-24)
-- Migration 0009
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. modeles_demande — presets réutilisables (F-24)
-- ────────────────────────────────────────────────────────────────────────────
create table public.modeles_demande (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  description text,
  -- Liste d'items demandés (format : [{ type, label, required }])
  items jsonb not null default '[]'::jsonb,
  is_active boolean not null default true
);

create trigger modeles_demande_set_updated_at
  before update on public.modeles_demande
  for each row execute function public.set_updated_at();

create index idx_modeles_demande_org on public.modeles_demande (organization_id, is_active);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. demandes_documents — instances envoyées aux clients
-- ────────────────────────────────────────────────────────────────────────────
create table public.demandes_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  dossier_id uuid references public.dossiers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  reference text unique, -- DM-YYYY-NNNNN
  status text not null default 'brouillon' check (status in (
    'brouillon', 'envoye', 'en_cours', 'complete', 'expire', 'annule'
  )),

  -- Destinataire (peut être client_id de contacts ou email libre)
  recipient_contact_id uuid references public.contacts(id) on delete set null,
  recipient_email text,
  recipient_name text,

  -- Magic link
  access_token text unique,
  access_token_expires_at timestamptz,

  -- Message accompagnement
  message text,

  -- Dates
  sent_at timestamptz,
  completed_at timestamptz,
  due_date date
);

create trigger demandes_documents_set_updated_at
  before update on public.demandes_documents
  for each row execute function public.set_updated_at();

create index idx_demandes_docs_org_status on public.demandes_documents (organization_id, status);
create index idx_demandes_docs_dossier on public.demandes_documents (dossier_id);
create index idx_demandes_docs_token on public.demandes_documents (access_token) where access_token is not null;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. demande_items — items individuels (avec réponse + upload)
-- ────────────────────────────────────────────────────────────────────────────
create table public.demande_items (
  id uuid primary key default gen_random_uuid(),
  demande_id uuid not null references public.demandes_documents(id) on delete cascade,
  order_index integer not null default 0,
  -- Type d'item
  item_type text not null check (item_type in ('document', 'question', 'signature')),
  label text not null,
  description text,
  required boolean not null default true,
  -- Réponse
  status text not null default 'pending' check (status in ('pending', 'completed', 'skipped')),
  -- Pour document : URL Storage du fichier uploadé par le client
  file_storage_path text,
  file_name text,
  file_size_bytes bigint,
  file_mime text,
  -- Pour question texte : réponse
  answer_text text,
  -- Pour signature : URL PDF signé ou base64 (à définir avec Servicimmo)
  signature_data text,
  answered_at timestamptz
);

create index idx_demande_items_demande on public.demande_items (demande_id, order_index);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Fonction numérotation
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.generate_demande_reference(org_id uuid)
returns text
language plpgsql
as $$
declare
  year_prefix text := 'DM-' || to_char(now(), 'YYYY') || '-';
  next_seq integer;
begin
  select coalesce(max(
    cast(substring(reference from '^DM-\d{4}-(\d+)$') as integer)
  ), 0) + 1
  into next_seq
  from public.demandes_documents
  where organization_id = org_id
    and reference like year_prefix || '%';
  return year_prefix || lpad(next_seq::text, 5, '0');
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. RLS
-- ────────────────────────────────────────────────────────────────────────────
alter table public.modeles_demande enable row level security;
alter table public.demandes_documents enable row level security;
alter table public.demande_items enable row level security;

create policy "modeles_demande_crud_own_org"
  on public.modeles_demande for all to authenticated
  using (organization_id in (select organization_id from public.users_profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from public.users_profiles where id = auth.uid()));

create policy "demandes_docs_crud_own_org"
  on public.demandes_documents for all to authenticated
  using (organization_id in (select organization_id from public.users_profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from public.users_profiles where id = auth.uid()));

create policy "demande_items_crud_via_demande"
  on public.demande_items for all to authenticated
  using (demande_id in (select id from public.demandes_documents where organization_id in (select organization_id from public.users_profiles where id = auth.uid())))
  with check (demande_id in (select id from public.demandes_documents where organization_id in (select organization_id from public.users_profiles where id = auth.uid())));

-- ────────────────────────────────────────────────────────────────────────────
-- 6. Seed 3 modèles presets (F-24)
-- ────────────────────────────────────────────────────────────────────────────
insert into public.modeles_demande (organization_id, name, description, items)
select id, 'Vente maison — complet',
  'Tout ce qu''il faut pour un dossier vente maison.',
  jsonb_build_array(
    jsonb_build_object('item_type', 'document', 'label', 'Titre de propriété', 'required', true),
    jsonb_build_object('item_type', 'document', 'label', 'Dernière taxe foncière', 'required', true),
    jsonb_build_object('item_type', 'document', 'label', 'Permis de construire', 'required', false),
    jsonb_build_object('item_type', 'document', 'label', 'Plans cadastraux', 'required', false),
    jsonb_build_object('item_type', 'question', 'label', 'Le logement a-t-il fait l''objet de travaux récents ?', 'required', true),
    jsonb_build_object('item_type', 'question', 'label', 'Y a-t-il une citerne ou cuve enterrée ?', 'required', true)
  )
from public.organizations where slug = 'servicimmo'
on conflict do nothing;

insert into public.modeles_demande (organization_id, name, description, items)
select id, 'Location appartement',
  'Pack location appartement (incl. règlement copro).',
  jsonb_build_array(
    jsonb_build_object('item_type', 'document', 'label', 'Règlement de copropriété', 'required', true),
    jsonb_build_object('item_type', 'document', 'label', 'Dernier relevé de charges', 'required', false),
    jsonb_build_object('item_type', 'question', 'label', 'Location vide ou meublée ?', 'required', true)
  )
from public.organizations where slug = 'servicimmo'
on conflict do nothing;

insert into public.modeles_demande (organization_id, name, description, items)
select id, 'Copropriété syndic',
  'Documents pour diagnostic parties communes.',
  jsonb_build_array(
    jsonb_build_object('item_type', 'document', 'label', 'Règlement de copropriété', 'required', true),
    jsonb_build_object('item_type', 'document', 'label', 'DTA en cours de validité', 'required', false),
    jsonb_build_object('item_type', 'question', 'label', 'Nombre de lots dans la copropriété', 'required', true),
    jsonb_build_object('item_type', 'question', 'label', 'Date de construction', 'required', true)
  )
from public.organizations where slug = 'servicimmo'
on conflict do nothing;

-- ============================================================================
-- Fin migration 0009
-- ============================================================================
