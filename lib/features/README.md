# lib/features/

Couche **domaine applicatif**. Implémente la logique métier (CRUD, workflows, règles applicatives) en s'appuyant sur `lib/core/` et les clients externes (`lib/supabase/`, `lib/stripe/`, `lib/resend/`, `lib/pappers/`).

## Règles d'import

```
lib/features  ──✓──▶  lib/core
lib/features  ──✓──▶  lib/supabase, lib/stripe, lib/resend, lib/pappers, lib/ban, lib/validation
lib/features  ──✗──▶  lib/clients
lib/features  ──✗──▶  app/
```

Enforcée par ESLint (`import/no-restricted-paths`). Voir `eslint.config.mjs`.

## Structure cible (à remplir dans les sprints 1-7)

- `dossiers/` — CRUD + règles de complétion + recalcul diagnostics.
- `devis/` — création, numérotation, génération PDF, envoi, acceptation.
- `factures/` — émission (immuable), avoirs, numérotation légale.
- `paiements/` — Stripe Checkout, webhooks, réconciliation manuelle.
- `agenda/` — RDV (CRUD + conflits horaires).
- `demande-documents/` — demandes vers client, portail upload.
- `contacts/` — particuliers + prescripteurs unifiés.
- `demandes-devis-public/` — funnel `quote_requests` (existant).
- `tarification/` — moteur de tarification (grille + majorations).
- `statistiques/` — agrégats KPI dashboard.

## Principe

Aucun import de `lib/clients/servicimmo/` ici : les specifics cabinet arrivent en paramètre depuis la couche `app/` qui compose `core` + `features` + `clients`.
