-- ============================================================================
-- Sprint 3 — Agenda (rendez_vous) + documents_dossier
-- Migration 0006
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. rendez_vous — F-10, F-11
-- ────────────────────────────────────────────────────────────────────────────
create table public.rendez_vous (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  dossier_id uuid references public.dossiers(id) on delete cascade,
  technicien_id uuid references public.users_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  address text,
  city text,
  postal_code text,

  status text not null default 'planifie' check (status in (
    'planifie', 'confirme', 'en_cours', 'realise', 'annule', 'reporte'
  )),

  -- Rappel email (1h avant par défaut)
  reminder_sent_at timestamptz,
  notes text
);

create trigger rendez_vous_set_updated_at
  before update on public.rendez_vous
  for each row execute function public.set_updated_at();

create index idx_rendez_vous_org_start on public.rendez_vous (organization_id, starts_at);
create index idx_rendez_vous_dossier on public.rendez_vous (dossier_id);
create index idx_rendez_vous_technicien on public.rendez_vous (technicien_id, starts_at);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. documents_dossier — F-22
-- ────────────────────────────────────────────────────────────────────────────
create table public.documents_dossier (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  uploaded_by uuid references public.users_profiles(id) on delete set null,
  created_at timestamptz not null default now(),

  -- Catégorisation (annexes / DDT / consentement / rapport / autre)
  category text not null check (category in ('annexe', 'ddt', 'consentement', 'rapport', 'autre')),
  -- Nom d'affichage
  name text not null,
  -- Chemin Supabase Storage (bucket dossier-documents)
  storage_path text not null,
  -- Méta technique
  mime_type text,
  size_bytes bigint,
  -- Source : 'admin' (cabinet) ou 'portail' (client via magic link) ou 'public' (questionnaire)
  source text not null default 'admin' check (source in ('admin', 'portail', 'public')),
  notes text
);

create index idx_documents_dossier_dossier on public.documents_dossier (dossier_id, created_at desc);
create index idx_documents_dossier_category on public.documents_dossier (dossier_id, category);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. RLS
-- ────────────────────────────────────────────────────────────────────────────
alter table public.rendez_vous enable row level security;
alter table public.documents_dossier enable row level security;

create policy "rendez_vous_crud_own_org"
  on public.rendez_vous for all
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

create policy "documents_dossier_crud_via_dossier"
  on public.documents_dossier for all
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

-- ============================================================================
-- Fin migration 0006
-- ============================================================================
