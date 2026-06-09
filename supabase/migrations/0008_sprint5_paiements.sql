-- ============================================================================
-- Sprint 5 — paiements (Stripe + manuels)
-- Migration 0008
-- ============================================================================

create table public.paiements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  facture_id uuid not null references public.factures(id) on delete cascade,
  created_at timestamptz not null default now(),

  method text not null check (method in ('stripe', 'virement', 'cheque', 'especes')),
  amount numeric not null check (amount >= 0),
  paid_at timestamptz not null default now(),

  -- Stripe
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  stripe_charge_id text,

  -- Manuel
  reference_manual text,
  notes text
);

create index idx_paiements_org_facture on public.paiements (organization_id, facture_id);
create index idx_paiements_stripe_pi on public.paiements (stripe_payment_intent_id) where stripe_payment_intent_id is not null;

alter table public.paiements enable row level security;

create policy "paiements_crud_own_org"
  on public.paiements for all to authenticated
  using (organization_id in (select organization_id from public.users_profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from public.users_profiles where id = auth.uid()));

-- ────────────────────────────────────────────────────────────────────────────
-- Trigger : recalculer amount_paid + status de la facture après paiement
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.refresh_facture_payment_status()
returns trigger
language plpgsql
as $$
declare
  total_paid numeric;
  fac_total numeric;
  target_id uuid;
begin
  target_id := coalesce(new.facture_id, old.facture_id);

  select coalesce(sum(amount), 0) into total_paid
  from public.paiements where facture_id = target_id;

  select total_ttc into fac_total from public.factures where id = target_id;

  update public.factures
  set amount_paid = total_paid,
      status = case
        when total_paid >= fac_total then 'payee'
        when total_paid > 0 then 'payee_partiel'
        else status
      end
  where id = target_id;

  return new;
end;
$$;

create trigger paiements_refresh_facture_after_insert
  after insert on public.paiements
  for each row execute function public.refresh_facture_payment_status();

create trigger paiements_refresh_facture_after_delete
  after delete on public.paiements
  for each row execute function public.refresh_facture_payment_status();

-- ============================================================================
-- Fin migration 0008
-- ============================================================================
