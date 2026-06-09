-- ============================================================================
-- Fix Sprint 1 — RLS récursive sur users_profiles
-- Migration 0010
-- ----------------------------------------------------------------------------
-- Problème : la policy `users_profiles_read_own_org` référence
--   (select organization_id from users_profiles where id = auth.uid())
-- qui boucle (il faut lire users_profiles pour décider si on peut le lire).
--
-- Fix : scinder en 2 policies, la plus permissive en premier (OR logique
-- via PERMISSIVE) :
--   1. users_profiles_read_self : id = auth.uid() (non-récursive)
--   2. users_profiles_read_same_org : via une fonction SECURITY DEFINER
--      qui court-circuite RLS pour lire l'organization_id de l'utilisateur.
-- ============================================================================

-- 1. Fonction SECURITY DEFINER pour récupérer l'org_id de l'utilisateur courant
create or replace function public.current_user_organization_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select organization_id from public.users_profiles where id = auth.uid() limit 1;
$$;

grant execute on function public.current_user_organization_id() to authenticated;

-- 2. Drop + recréer la policy récursive
drop policy if exists "users_profiles_read_own_org" on public.users_profiles;

-- Self-read : toujours permis sur son propre profil
create policy "users_profiles_read_self"
  on public.users_profiles for select
  to authenticated
  using (id = auth.uid());

-- Org-read : passe par la fonction SECURITY DEFINER pour éviter la récursion
create policy "users_profiles_read_same_org"
  on public.users_profiles for select
  to authenticated
  using (organization_id = public.current_user_organization_id());

-- 3. Pareil pour les autres policies qui font le même pattern (contacts,
--    dossiers, rendez_vous, devis, factures, ...) — on les simplifie toutes
--    pour utiliser la fonction au lieu du sous-select récursif.

-- contacts
drop policy if exists "contacts_select_own_org" on public.contacts;
drop policy if exists "contacts_insert_own_org" on public.contacts;
drop policy if exists "contacts_update_own_org" on public.contacts;
drop policy if exists "contacts_delete_own_org" on public.contacts;

create policy "contacts_select_own_org" on public.contacts for select to authenticated
  using (organization_id = public.current_user_organization_id());
create policy "contacts_insert_own_org" on public.contacts for insert to authenticated
  with check (organization_id = public.current_user_organization_id());
create policy "contacts_update_own_org" on public.contacts for update to authenticated
  using (organization_id = public.current_user_organization_id());
create policy "contacts_delete_own_org" on public.contacts for delete to authenticated
  using (organization_id = public.current_user_organization_id());

-- organizations
drop policy if exists "organizations_read_own" on public.organizations;
drop policy if exists "organizations_update_admin" on public.organizations;
create policy "organizations_read_own" on public.organizations for select to authenticated
  using (id = public.current_user_organization_id());
create policy "organizations_update_admin" on public.organizations for update to authenticated
  using (id = public.current_user_organization_id()
    and exists (select 1 from public.users_profiles where id = auth.uid() and role = 'admin'));

-- dossiers
drop policy if exists "dossiers_crud_own_org" on public.dossiers;
create policy "dossiers_crud_own_org" on public.dossiers for all to authenticated
  using (organization_id = public.current_user_organization_id())
  with check (organization_id = public.current_user_organization_id());

-- rendez_vous
drop policy if exists "rendez_vous_crud_own_org" on public.rendez_vous;
create policy "rendez_vous_crud_own_org" on public.rendez_vous for all to authenticated
  using (organization_id = public.current_user_organization_id())
  with check (organization_id = public.current_user_organization_id());

-- devis
drop policy if exists "devis_crud_own_org" on public.devis;
create policy "devis_crud_own_org" on public.devis for all to authenticated
  using (organization_id = public.current_user_organization_id())
  with check (organization_id = public.current_user_organization_id());

-- factures
drop policy if exists "factures_crud_own_org" on public.factures;
create policy "factures_crud_own_org" on public.factures for all to authenticated
  using (organization_id = public.current_user_organization_id())
  with check (organization_id = public.current_user_organization_id());

-- grille_tarifaire
drop policy if exists "grille_tarifaire_crud_own_org" on public.grille_tarifaire;
create policy "grille_tarifaire_crud_own_org" on public.grille_tarifaire for all to authenticated
  using (organization_id = public.current_user_organization_id())
  with check (organization_id = public.current_user_organization_id());

-- regles_majoration
drop policy if exists "regles_majoration_crud_own_org" on public.regles_majoration;
create policy "regles_majoration_crud_own_org" on public.regles_majoration for all to authenticated
  using (organization_id = public.current_user_organization_id())
  with check (organization_id = public.current_user_organization_id());

-- paiements
drop policy if exists "paiements_crud_own_org" on public.paiements;
create policy "paiements_crud_own_org" on public.paiements for all to authenticated
  using (organization_id = public.current_user_organization_id())
  with check (organization_id = public.current_user_organization_id());

-- modeles_demande
drop policy if exists "modeles_demande_crud_own_org" on public.modeles_demande;
create policy "modeles_demande_crud_own_org" on public.modeles_demande for all to authenticated
  using (organization_id = public.current_user_organization_id())
  with check (organization_id = public.current_user_organization_id());

-- demandes_documents
drop policy if exists "demandes_docs_crud_own_org" on public.demandes_documents;
create policy "demandes_docs_crud_own_org" on public.demandes_documents for all to authenticated
  using (organization_id = public.current_user_organization_id())
  with check (organization_id = public.current_user_organization_id());

-- users_profiles insert/update : scope admin
drop policy if exists "users_profiles_insert_admin" on public.users_profiles;
drop policy if exists "users_profiles_update_self_or_admin" on public.users_profiles;

create policy "users_profiles_insert_admin" on public.users_profiles for insert to authenticated
  with check (
    organization_id = public.current_user_organization_id()
    and exists (select 1 from public.users_profiles where id = auth.uid() and role = 'admin')
  );

create policy "users_profiles_update_self_or_admin" on public.users_profiles for update to authenticated
  using (
    id = auth.uid()
    or (organization_id = public.current_user_organization_id()
        and exists (select 1 from public.users_profiles where id = auth.uid() and role = 'admin'))
  );

-- ============================================================================
-- Fin migration 0010
-- ============================================================================
