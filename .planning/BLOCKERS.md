# Blockers — livraison finale (fin de Sprint 8)

Liste consolidée des **dépendances externes** à lever par Lyes / Servicimmo
avant mise en prod. Le code est prêt — ces blockers sont des actions humaines
ou des accès à provisionner.

## Catégorisation

- 🔴 **Critique** — bloque la mise en prod
- 🟠 **Important** — bloque une feature mais pas le déploiement
- 🟡 **Nice-to-have** — dégrade l'UX si non résolu

---

## 🔴 Provisionnement et accès externes (ORDRE DE DÉMARRAGE)

1. **Créer les projets Supabase** `servicimmo-dev` + `servicimmo-prod` (supabase.com, région `eu-west-1`). Récupérer `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. **Appliquer les 9 migrations** dans l'ordre (0001 → 0009) via SQL Editor Supabase ou CLI `supabase db push`. Elles sont dans `supabase/migrations/` et s'appliquent séquentiellement sans intervention.
3. **Créer 3 buckets Supabase Storage** (privés) :
   - `quote-attachments` (uploads questionnaire public, existant)
   - `dossier-documents` (uploads admin côté cabinet, Sprint 3)
   - `demande-uploads` (portail client, Sprint 6)
4. **Créer le premier utilisateur admin** dans Supabase Auth (Lyes + Etienne). Insérer la ligne `users_profiles` avec `role='admin'` et `organization_id` = id de l'organisation Servicimmo (seedée par 0004).
5. **Compléter les infos cabinet** dans la table `organizations` : SIRET, IBAN, TVA intracommunautaire, adresse postale complète. Le seed 0004 contient des stubs.
6. **Compte Stripe Servicimmo** : finaliser KYC, récupérer `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_WEBHOOK_SECRET` (créer un webhook ciblant `/api/stripe/webhook`, sélectionner event `checkout.session.completed`).
7. **Domaine email Resend** : valider `servicimmo.fr` avec DKIM + SPF, créer `RESEND_API_KEY`.
8. **Grille tarifaire réelle** à saisir dans la table `grille_tarifaire` via SQL Editor. Questions à poser à Servicimmo listées dans le plan pricing V2 (10 questions — tarifs DPE maison/appart, DPE collectif forfait/devis, amiante par type, pack, urgence, distance…).
9. **Déployer l'Edge Function cron relances** : `supabase functions deploy relances` puis `supabase functions schedule relances --schedule "0 8 * * *"` pour 8h UTC chaque jour.
10. **Plan comptable FEC** : vérifier avec le comptable de Servicimmo que le schéma simplifié (411/706/445710/512/531) lui convient. Sinon adapter `lib/features/fec/export.ts`.

---

## 🟠 Features câblées DB/API mais UI admin à construire

- **Panneau grille tarifaire** (`/app/parametres/grille`) — édition des prix par diagnostic/contexte. Table `grille_tarifaire` prête, RLS OK. Pour l'instant : édition via SQL Editor.
- **Panneau règles de majoration** (`/app/parametres/regles`) — édition TRAVEL_FEE / URGENT_DELAY / COLLECTIVE_HEATING / etc. Table `regles_majoration` prête.
- **Panneau modèles de demande** (`/app/parametres/modeles`) — CRUD des presets `modeles_demande` (3 seedés).
- **Invitations utilisateurs** (`/app/parametres/utilisateurs`) — admin-only, création comptes diagnostiqueur/assistant.
- **Enregistrement paiement manuel** (UI) — Server Action `recordManualPayment` prête, formulaire à construire sur la page facture détail.
- **Portail de paiement `/portail/pay/[factureId]`** — page de redirection Stripe success/cancel à styler.
- **Upload portail client** (`/api/portail/upload`) — signed-upload Supabase Storage depuis le portail magic link. Remplacera le message "envoyer par email" actuel.
- **Vue agenda semaine/jour** — seule la vue mois est livrée. À arbitrer avec Servicimmo.
- **DnD Kanban interactif** — version actuelle statique. Backend `updateDossierStatus` prêt, manque l'intégration `@dnd-kit` (Client Component).
- **Éditeur de lignes de devis** — UI affichage OK, ajout/suppression/modification à livrer.
- **Génération PDF devis/facture** — `@react-pdf/renderer` installé, colonnes `pdf_storage_path` prêtes. Template PDF à écrire.
- **Email devis avec PDF joint** — une fois le PDF généré, attacher au mail Resend.
- **Step-by-step linéaire wizard dossier** — actuellement accordéons. À arbitrer avec Servicimmo selon feedback power-users.
- **Autocompletion adresse BAN dans le wizard dossier** — existe sur le questionnaire public, à porter côté wizard admin.

---

## 🟠 Tests E2E à étendre

Les smoke tests Playwright (5 cas) sont là. Les **3 parcours critiques** du MASTER-PLAN §8 nécessitent un Supabase dev + seed de test :

1. Wizard dossier complet → devis → acceptation portail → facture → paiement Stripe (test mode)
2. Demande documentaire → remplissage portail client → retour cabinet
3. Export FEC fin d'exercice

À écrire dans `e2e/parcours-*.spec.ts` après provisionnement.

---

## 🟡 Nice-to-have

- **Pappers API** (`PAPPERS_API_KEY`) : enrichissement SIRET automatique des contacts prescripteurs.
- **UI signature électronique** dans le portail demandes (stub actuel → canvas ou service tiers type Yousign).
- **Prévisualisation PDF/image inline** des documents dossier (actuellement téléchargement).
- **Filtres de période** sur `/app/statistiques` (actuellement 12 mois fixes).
- **Export CSV récap mensuel** (F-26).
- **Bouton "Exporter FEC"** visible dans le menu paramètres (déjà sur la page Paramètres, à évidenter si besoin).
- **Logo + charte définitifs** : `lib/clients/servicimmo/branding.ts` contient des valeurs provisoires. Remplacer avec les assets finaux Servicimmo.
- **Audit accessibilité WCAG AA** (outil : axe DevTools).
- **Audit perf** (Lighthouse, bundle analyzer).
- **Doc utilisateur** : Loom de parcours-clé avec Servicimmo (à enregistrer pendant la phase de recette).
- **Monitoring** : brancher Sentry ou Vercel Analytics sur les erreurs prod.

---

## 🟡 Dette technique consciente

- **Cast `supabase.rpc(...) as unknown as ...`** dans `lib/features/devis/actions.ts` : les fonctions plpgsql (generate_devis_reference etc.) ne sont pas déclarées dans `Database.Functions`. À ajouter quand on aura `supabase gen types` branché.
- **Client pricing.ts** fait un import dynamique de `@/lib/supabase/server` : rompt techniquement le principe "core pur" mais fallback garantit aucune dépendance runtime si Supabase absent. À corriger en déplaçant `loadPricingGrid` vers `lib/features/tarification/`.

---

## Récapitulatif par sprint

| Sprint | Livré (code) | Bloquant prod |
|---|---|---|
| 0 | Architecture | — |
| 1 | DB + auth + contacts | Supabase provisioning |
| 2 | Dossiers + wizard + Kanban | Migration 0005 |
| 3 | Agenda + documents | Bucket Storage |
| 4 | Devis + factures + tarification | Grille tarifaire réelle |
| 5 | Stripe + relances + FEC + Resend | Stripe + Resend + Edge Function |
| 6 | Demandes de documents | Bucket `demande-uploads` |
| 7 | Dashboard + stats | — |
| 8 | Paramètres + E2E smoke | UI admin éditables |
