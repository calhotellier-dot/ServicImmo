# Blockers — livraison finale

Fichier de tracking interne des dépendances externes à lever par Lyes/Servicimmo
avant mise en prod. À lire à la toute fin, après le Sprint 8.

## Catégorisation

- 🔴 **Critique** — bloque la mise en prod
- 🟠 **Important** — bloque une feature mais pas le déploiement
- 🟡 **Nice-to-have** — dégrade l'UX si non résolu

## Liste (remplie au fil des sprints)

### Sprint 2 — Dossiers + wizard + Kanban

- 🔴 **Appliquer migration 0005** (dossiers + dossier_diagnostics + fonction `generate_dossier_reference`).
- 🟠 **DnD Kanban interactif** : version Sprint 2 est statique (colonnes SSR). Réintégrer `@dnd-kit` en Client Component pour drag & drop des cartes (Sprint 2.1 ou fin Sprint 2 en polish). Backend `updateDossierStatus` déjà prêt.
- 🟡 **Autocompletion adresse BAN** dans le wizard : non câblée (existe sur le questionnaire public, à porter).
- 🟡 **Step-by-step linéaire** (10 étapes PRD) : pour l'instant un formulaire à sections. À arbitrer avec Servicimmo en Sprint 8 selon feedback power-users.

### Sprint 1 — DB + auth + contacts

- 🔴 **Provisionner projets Supabase** `servicimmo-dev` + `servicimmo-prod` sur supabase.com, remplir `.env.local` avec URL + anon_key + service_role.
- 🔴 **Appliquer migrations 0001→0004** sur Supabase (SQL Editor ou CLI).
- 🟠 **Infos cabinet Servicimmo à remplir dans `organizations`** : SIRET, IBAN, TVA intracommunautaire, adresse complète. Stub pour l'instant (cf. seed migration 0004).
- 🟠 **Créer le premier utilisateur admin** dans Supabase Auth (Lyes et/ou Etienne) puis insérer la ligne `users_profiles` avec `role='admin'` et `organization_id` = id de Servicimmo.
- 🟡 **`PAPPERS_API_KEY`** — nécessaire pour l'enrichissement SIRET automatique des prescripteurs (UX nice-to-have, fallback saisie manuelle).

