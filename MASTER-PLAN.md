# MASTER PLAN — Servicimmo Pilote

> **Version** : 1.0 (22 avril 2026)
> **Repo** : `lyestriki-29/servicimmo` (même repo que la refonte du site, on greffe l'app dessus)
> **Équipe** : Lyes Triki (Propul'seo) + Etienne Guimbard
> **Client** : SERVICIMMO (cabinet diagnostic immobilier, Tours)
> **Ordre de priorité** : App 100% avant de toucher au site vitrine

---

## 0 — État des lieux

### Ce qui existe déjà (à conserver / réutiliser)

Le repo `servicimmo-v2` contient :

- Une base Next.js propre (route groups `(public)` et `(admin)` en place)
- **Un moteur de règles métier** dans `lib/diagnostics/rules.ts` qui calcule les diagnostics obligatoires selon la configuration d'un bien (`calculateRequiredDiagnostics`) — ⭐ **réutilisable tel quel** pour l'app Pilote
- **Un moteur de pricing** dans `lib/diagnostics/pricing.ts` — même remarque ⭐
- **Un questionnaire public 6 étapes** (déjà maquetté) qui remplace le formulaire de devis actuel — pattern UX équivalent au wizard de création de dossier de l'app
- **Le schéma Supabase de `quote_requests`** qui couvre le funnel public de demande de devis
- Des docs déjà structurés : `AUDIT.md`, `PRD.md`, `QUESTIONNAIRE_FLOW.md`, `CLAUDE.md`, `CLAUDE_DESIGN_BRIEF.md`, `AGENTS.md`
- Configuration complète : ESLint, Prettier, Vitest, Tailwind v4, shadcn/ui

### Ce qui reste à faire (sujet du MASTER PLAN)

- Greffer l'**app Pilote** (l'ERP métier interne) sur ce repo
- Refactorer `lib/diagnostics/` pour l'isoler dans la couche `core/` + créer `clients/servicimmo/` (isolation pour duplication future)
- Livrer les 27 features du PRD Phase 1 (voir `PRD-PHASE-1.md` livré séparément)
- Finaliser le site vitrine V2 (Phase 2, après mise en prod de l'app)

### Stack confirmée (depuis `package.json`)

| Couche | Version |
|--------|---------|
| Next.js | **16.2.4** (App Router) |
| React | **19.2.4** |
| TypeScript | 5.x strict + `noUncheckedIndexedAccess` |
| Tailwind CSS | **v4** (syntaxe sans config JS) |
| shadcn/ui | primitives Radix |
| Supabase | ssr 0.5 + js 2.46 |
| Resend + React Email | 4.0 |
| Zustand | 5.0 |
| Framer Motion | 11.15 |
| Tests | Vitest 2.1 + Testing Library |
| pnpm | 10.33 |

**À ajouter** pour l'app Pilote : `stripe`, `@react-pdf/renderer` (ou `pdf-lib`), `date-fns`, `@dnd-kit/core` (Kanban), `recharts` (stats).

> Le `CLAUDE.md` du repo indique "Next 14 + Tailwind v3" — c'est **obsolète**, le `package.json` est la source de vérité. À corriger en Sprint 0.

---

## 1 — Décisions architecturales actées

| # | Décision | Choix | Justification |
|---|----------|-------|---------------|
| D1 | Repo | **Single repo `servicimmo-v2`** | Validé. On ajoute l'app en route groups |
| D2 | Isolation pour duplication SaaS future | **Option A : `lib/core` + `lib/features` + `lib/clients/servicimmo`** | Simple à mettre en place, zero overhead, migration facile vers monorepo plus tard si besoin |
| D3 | Ordre d'exécution | **App 100% avant site vitrine** | Priorité client confirmée |
| D4 | Stack | Next 16 + React 19 + Tailwind v4 + shadcn/ui + Supabase + Resend + Stripe | Confirmée via `package.json` |
| D5 | Mono-tenant d'abord | Tout scopé par `organization_id` dès le départ (1 seul org "Servicimmo") mais schéma prêt pour multi-tenant | Coût négligeable maintenant, énorme gain si SaaS un jour |
| D6 | Auth admin | Supabase Auth (email + password + magic link fallback) | Déjà en place |
| D7 | Portail client/prescripteur | Magic link JWT signé, pas de compte à créer | UX supérieure, pas de friction |
| D8 | Paiements | Stripe Checkout + webhooks | Standard de marché, SCA / 3DS inclus |
| D9 | Déploiement | Vercel (front) + Supabase cloud (backend) | Déjà en place, zéro ops |

---

## 2 — Architecture cible du repo

```
servicimmo-v2/
├── app/                                 # Next.js App Router
│   ├── (marketing)/                     # Site vitrine public (Phase 2)
│   │   ├── page.tsx                     # accueil
│   │   ├── services/[slug]/
│   │   ├── zones/[city]/                # pages SEO villes (migration 301 obligatoire)
│   │   ├── actualites/
│   │   ├── devis/                       # ← questionnaire public 6 étapes (déjà commencé)
│   │   └── contact/
│   │
│   ├── (auth)/                          # Login / reset / magic link
│   │   ├── login/
│   │   └── reset/
│   │
│   ├── (app)/                           # 🆕 App Pilote (Phase 1 PRIORITAIRE)
│   │   ├── dashboard/
│   │   ├── dossiers/
│   │   │   ├── page.tsx                 # liste + Kanban
│   │   │   ├── new/                     # wizard 10 étapes
│   │   │   └── [id]/                    # vue détail
│   │   ├── agenda/
│   │   ├── facturation/                 # devis, factures, FEC
│   │   ├── contacts/
│   │   ├── statistiques/
│   │   └── parametres/
│   │
│   ├── (portail)/                       # 🆕 Portail clients/prescripteurs
│   │   └── [token]/
│   │       ├── devis/[id]/              # accepter un devis
│   │       ├── factures/[id]/           # payer une facture
│   │       ├── documents/[id]/          # fournir les docs demandés
│   │       └── dossier/                 # vue du dossier (lecture)
│   │
│   └── api/                             # Routes API + webhooks
│       ├── stripe/webhook/
│       ├── resend/webhook/
│       ├── pappers/[siret]/
│       ├── ban/search/                  # proxy API BAN
│       └── calculate/                   # moteur de règles (déjà existant)
│
├── components/
│   ├── ui/                              # shadcn primitives
│   ├── marketing/                       # Hero, Certifications, FAQ
│   ├── questionnaire/                   # 6 étapes public (déjà commencé)
│   ├── wizard/                          # 🆕 10 étapes interne (app)
│   ├── agenda/                          # 🆕 Calendrier, modal RDV
│   ├── facturation/                     # 🆕 Éditeur devis, factures, PDF preview
│   ├── demande-docs/                    # 🆕 Modal demande documents
│   ├── layout/                          # Header, Footer, AppSidebar, MarketingNav
│   └── shared/
│
├── lib/
│   ├── core/                            # 🆕 RÉUTILISABLE — dépend de RIEN du projet
│   │   ├── diagnostics/
│   │   │   ├── rules.ts                 # ← déplacé depuis lib/diagnostics/
│   │   │   ├── pricing.ts               # ← déplacé
│   │   │   ├── types.ts
│   │   │   └── __tests__/
│   │   ├── types/                       # Dossier, Devis, Facture, Contact, ...
│   │   ├── utils/
│   │   ├── fec/                         # format FEC (pur)
│   │   └── signature/                   # tokens magic link JWT
│   │
│   ├── features/                        # 🆕 RÉUTILISABLE côté DOMAINE — dépend de core
│   │   ├── dossiers/                    # CRUD + règles métier
│   │   ├── devis/
│   │   ├── factures/
│   │   ├── paiements/                   # Stripe integration abstraite
│   │   ├── agenda/
│   │   ├── demande-documents/
│   │   ├── contacts/
│   │   ├── demandes-devis-public/       # quote_requests (questionnaire)
│   │   ├── tarification/                # grille + règles de majoration
│   │   └── statistiques/
│   │
│   ├── clients/                         # 🆕 SPÉCIFIQUE — dépend de core + features
│   │   └── servicimmo/
│   │       ├── config.ts                # nom, SIRET, adresse, IBAN, contact
│   │       ├── branding.ts              # couleurs, logo, polices
│   │       ├── pricing-grid.ts          # LES prix réels de Servicimmo
│   │       ├── business-rules.ts        # overrides : termites 37, etc.
│   │       ├── email-templates/         # signature, footer
│   │       └── legal/                   # mentions légales, CGV
│   │
│   ├── supabase/
│   │   ├── client.ts                    # browser client
│   │   ├── server.ts                    # server client
│   │   ├── admin.ts                     # service role
│   │   └── types.ts                     # `supabase gen types` output
│   │
│   ├── stripe/
│   ├── resend/
│   ├── pappers/
│   ├── ban/                             # autocomplete adresse
│   └── validation/                      # schémas Zod partagés
│
├── hooks/
├── supabase/
│   ├── migrations/
│   └── functions/                       # Edge Functions (cron relances)
│
├── public/
├── scripts/
│   ├── migrate-articles.ts              # Phase 2
│   └── generate-redirects.ts            # Phase 2
│
├── middleware.ts                        # redirects 301 + auth + route guards
│
├── .planning/                           # notes de planification
├── AGENTS.md
├── CLAUDE.md                            # ← à mettre à jour (stack réelle)
├── PRD.md                               # site vitrine
├── PRD-APP.md                           # 🆕 app Pilote (notre PRD 27 features)
├── QUESTIONNAIRE_FLOW.md
├── AUDIT.md
├── MASTER-PLAN.md                       # ← ce fichier
└── README.md
```

### Règle d'or d'imports

```
clients/servicimmo → peut importer features + core
features          → peut importer core
core              → n'importe rien du projet (100% pur TypeScript)
app/(app)         → peut importer clients/servicimmo + features + core + supabase + components
app/(marketing)   → idem
```

**Linter rule à ajouter** : ESLint `import/no-restricted-paths` pour enforcer ces règles automatiquement. Configuration en Sprint 0.

---

## 3 — Roadmap de A à Z

### 📍 Sprint 0 — Refactor & Setup (semaine 1, 5 j)

**Objectif** : poser les fondations de l'app sur le repo existant sans casser ce qui fonctionne.

- [ ] Mettre à jour `CLAUDE.md` avec la stack réelle (Next 16 / React 19 / Tailwind v4)
- [ ] Créer le fichier `MASTER-PLAN.md` + `PRD-APP.md` à la racine
- [ ] Refactorer `lib/diagnostics/` → `lib/core/diagnostics/` (déplacement pur, pas de changement de logique)
- [ ] Créer `lib/clients/servicimmo/` avec `config.ts`, `branding.ts`, `pricing-grid.ts`, `business-rules.ts`
- [ ] Ajouter ESLint rule `import/no-restricted-paths` pour enforcer les règles d'imports
- [ ] Créer la route group `(app)/` avec layout authentifié (skeleton seulement)
- [ ] Créer la route group `(portail)/[token]/` (skeleton)
- [ ] Ajouter les deps : `stripe`, `@react-pdf/renderer`, `date-fns`, `@dnd-kit/core`, `recharts`
- [ ] Créer le projet Supabase cloud
- [ ] Setup Stripe compte test + webhook secret
- [ ] Variables `.env.local` complètes

**Critères de sortie** : `pnpm dev` tourne, le questionnaire public continue de marcher, on peut accéder à `/app` vide après login.

---

### 📍 Sprint 1 — Fondations DB + Auth + Contacts (semaine 2-3, 10 j)

**Features** : F-01, F-02, F-03, F-04 du `PRD-APP.md`

- [ ] Migrations Supabase : `organizations`, `users`, `contacts`, `diagnostic_types`
- [ ] Seed : Servicimmo organization, catalogue des 15 types de diagnostics
- [ ] RLS policies initiales (admin total, diagnostiqueur scope, portail par token)
- [ ] Auth admin : login email/password + magic link + reset
- [ ] Auth portail : middleware qui vérifie les magic links
- [ ] CRUD contacts avec Pappers API
- [ ] Import CSV contacts (pour migration depuis leur outil actuel)
- [ ] Layout `(app)` avec sidebar + header cohérents
- [ ] Invitation utilisateurs (admin only)

**Critères de sortie** : Lyes et Etienne peuvent se connecter à `/app`, créer/modifier des contacts, importer un CSV de test.

---

### 📍 Sprint 2 — Dossiers + Wizard + Kanban (semaine 4-5, 10 j)

**Features** : F-05, F-06, F-07, F-08, F-09

- [ ] Migrations : `dossiers`, `dossier_diagnostics`, règles Recalculer
- [ ] **Wizard création dossier 10 étapes** (c'est LA pièce maîtresse UX)
  - Auto-save en brouillon debounce 500ms
  - Autocomplétion adresse API BAN
  - Breadcrumb, navigation back/forward
  - Appel du moteur `core/diagnostics/rules.ts` pour "Recalculer"
- [ ] Liste dossiers : vue tableau + colonnes customizables
- [ ] Vue Kanban (drag & drop via dnd-kit)
- [ ] Vue détail dossier (tabs : Dossier / Infos / Devis / Documents / Journal / Notes / Demande / Export)
- [ ] Taux de complétion calculé

**Critères de sortie** : un utilisateur peut créer un dossier complet en moins de 3 min via le wizard, le voir dans la liste et le Kanban, modifier les infos, voir le taux de complétion.

---

### 📍 Sprint 3 — Agenda + RDV + Documents (semaine 6-7, 10 j)

**Features** : F-10, F-11, F-22, F-12 (préparation devis)

- [ ] Migrations : `rendez_vous`, `documents_dossier`
- [ ] Vue agenda 4 modes (Mois/Semaine/Jour/Planning) — lib `react-big-calendar` ou `fullcalendar`
- [ ] Modal création/édition RDV (y compris création dossier automatique si pas de dossier lié)
- [ ] Upload fichiers (3 catégories : annexes / DDT / consentement) via Supabase Storage
- [ ] Prévisualisation inline PDF / images
- [ ] Préparation tables devis + factures

**Critères de sortie** : gestion complète des RDV et fichiers opérationnelle.

---

### 📍 Sprint 4 — Devis + Facturation + Moteur de tarification (semaine 8-9, 10 j)

**Features** : F-12, F-13, F-14, F-15, F-16, F-17, F-18

- [ ] Migrations : `devis`, `devis_lignes`, `factures`, `facture_lignes`, `grille_tarifaire`, `regles_majoration`
- [ ] **Moteur de tarification** dans `lib/features/tarification/` :
  - Grille tarifaire (paramétrable UI)
  - Règles de majoration (TRAVEL_FEE, AREA_ABOVE_HAB, URGENT_DELAY)
  - Fonction `computeQuote(dossier, grille, rules) → QuoteResult`
- [ ] Création devis depuis dossier (auto-rempli) + standalone
- [ ] Génération PDF devis avec template paramétrable
- [ ] Envoi email devis via Resend (template React Email)
- [ ] Portail acceptation devis (magic link)
- [ ] Création facture depuis devis accepté
- [ ] Facture immuable + système d'avoirs
- [ ] Numérotation séquentielle légale (`DV-YYYY-NNNNN`, `FA-YYYY-NNNNN`)

**Critères de sortie** : workflow commercial complet devis → facture → portail client opérationnel.

---

### 📍 Sprint 5 — Stripe + Relances + Export FEC (semaine 10, 5 j)

**Features** : F-19, F-20, F-21

- [ ] Migration : `paiements`
- [ ] Stripe Checkout par facture
- [ ] Webhook Stripe → update statut
- [ ] Réconciliation manuelle (virement, chèque)
- [ ] Cron job quotidien (Edge Function Supabase) pour relances J+7, J+15, J+30
- [ ] **Export FEC** (Fichier des Écritures Comptables) — format légal 18 colonnes

**Critères de sortie** : paiement en ligne fonctionnel, relances automatiques, export FEC conforme pour le comptable.

---

### 📍 Sprint 6 — Demande de documents (semaine 11, 5 j)

**Feature majeure** : F-23, F-24

- [ ] Migrations : `demandes_documents`, `demande_items`, `modeles_demande`
- [ ] Modal "Demander des documents" (avec catalogue complet des ~40 items)
- [ ] Portail destinataire (upload docs + réponse aux questions)
- [ ] Modèles réutilisables (CRUD admin + 3 presets livrés)
- [ ] Email via Resend + notification retour

**Critères de sortie** : le cabinet peut envoyer une demande documentaire au client en 2 min, le client peut la compléter sans compte, tout revient tagué dans le dossier.

---

### 📍 Sprint 7 — Dashboard + Statistiques (semaine 12, 5 j)

**Features** : F-25, F-26

- [ ] Dashboard admin : Mes RDV du jour/semaine, chiffres clés 12 mois, à faire aujourd'hui
- [ ] Page statistiques V1 Must-Have :
  - 6 KPI avec évolution
  - CA 12 mois (recharts)
  - Top diagnostics demandés
  - Lead times funnel (4 tuiles)
  - Performance technicien
  - Récap mensuel + export CSV

**Critères de sortie** : Lyes peut présenter à Servicimmo un dashboard business fonctionnel.

---

### 📍 Sprint 8 — Paramètres + Polish + QA (semaine 13, 5 j)

**Feature** : F-27

- [ ] Paramètres cabinet (infos, design, utilisateurs, catalogue prestations, grille tarifaire, modèles)
- [ ] Tests E2E Playwright sur les 3 parcours critiques :
  - Création dossier complet → envoi devis → acceptation → facture → paiement
  - Demande documentaire → remplissage client → retour
  - Export FEC
- [ ] Audit accessibilité (contraste, clavier, ARIA)
- [ ] Audit perfs (Lighthouse, bundle size)
- [ ] Doc utilisateur minimale (quelques Loom de parcours-clé)
- [ ] Recette avec Servicimmo + corrections
- [ ] **Mise en prod** avec monitoring (Vercel Analytics + Supabase logs)

**Critères de sortie** : app en prod, Servicimmo l'utilise en quotidien.

---

### 📍 Phase 2 (plus tard) — Site vitrine V2

Hors scope immédiat. À attaquer après stabilisation de l'app :

- Finalisation pages marketing (`(marketing)/`)
- Migration des 100+ articles
- Migration des 40 pages villes SEO
- Redirections 301 (193 URLs à mapper)
- Mise en prod site V2 (remplacer l'actuel servicimmo.fr)

---

## 4 — Jour J : checklist de démarrage

**Avant de lancer Claude Code sur le premier sprint**, valider les points suivants :

### Comptes et accès
- [ ] Compte **Supabase** créé, projet `servicimmo-prod` + `servicimmo-dev` provisionnés
- [ ] Compte **Stripe** en test, clés API récupérées
- [ ] Compte **Resend** actif, domaine `servicimmo.fr` DKIM validé
- [ ] Compte **Vercel** lié au repo GitHub, deployment auto activé
- [ ] Compte **Pappers API** (clé API existante réutilisable ?)
- [ ] **GitHub** : branches `main` protégée, branche `dev` pour merger les features

### Décisions client en attente
- [ ] Confirmation Servicimmo : l'app Pilote remplace-t-elle totalement cloudimpartial.com (leur espace client actuel) ?
- [ ] Validation des règles métier par un diagnostiqueur de Servicimmo (cas limites diagnostics)
- [ ] Validation de la grille tarifaire exacte (prix réels)
- [ ] Logo + charte graphique Servicimmo actualisée (si refresh souhaité)
- [ ] Accès au fichier comptable existant pour validation format FEC
- [ ] Contact IBAN + compte Stripe Servicimmo pour les encaissements

### Design
- [ ] Lire `CLAUDE_DESIGN_BRIEF.md` existant → décider si on conserve la direction ou on repositionne
- [ ] Choisir la typo finale (suggestions : Bricolage Grotesque + Commissioner, ou Söhne + Söhne Mono)
- [ ] Palette finale : accent Servicimmo (si pas de charte existante : bleu de Prusse `#1F3A5F` ou bleu Loire plus doux, pour évoquer sérieux + territoire)

### Tech
- [ ] Fixer Node >= 20, pnpm 10.33
- [ ] Vérifier que le questionnaire public existant ne casse pas pendant le refactor Sprint 0
- [ ] Mettre à jour le `CLAUDE.md` avec la stack réelle

---

## 5 — Gouvernance du projet

### Cadence proposée

- **Sprints de 1 semaine** (sauf Sprint 1 et 2 sur 2 semaines chacun, car plus lourds)
- **Standup quotidien** Lyes + Etienne (15 min, texte ou visio)
- **Démo hebdo** avec Servicimmo à la fin de chaque sprint
- **Branche par feature** : `feat/f-05-wizard-dossier`, PR review (même rapide) avant merge sur `dev`
- **Merge vers `main`** uniquement quand un sprint est intégralement validé → trigger auto Vercel prod

### Qui fait quoi

À définir entre Lyes et Etienne. Suggestion :
- **Lyes** : lead technique, architecture, features critiques (wizard, moteur tarification, FEC)
- **Etienne** : features transversales (auth, design system, emails), QA, déploiements
- **Les deux** : revue mutuelle, démos client

### Communication avec Servicimmo

- **Un contact référent** chez Servicimmo (si pas encore désigné, demander)
- **Canal Slack ou WhatsApp** pour questions rapides
- **Email formel** pour validations et arbitrages
- **Démo preview Vercel** à chaque sprint

---

## 6 — Risques & mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| **Scope creep Servicimmo** ("et si on ajoutait aussi le DPE ?") | Haute | Élevé | Périmètre Phase 1 écrit noir sur blanc dans contrat + `PRD-APP.md`. Tout ajout = Phase 2 ou avenant |
| **Validation grille tarifaire qui traîne** | Moyenne | Moyen | Demander dès J1. Livrer avec valeurs placeholder qu'on remplace en Sprint 4 |
| **Stripe KYC / mise en prod bancaire longue** | Moyenne | Élevé (bloque encaissements) | Lancer le compte Stripe Servicimmo en Sprint 0. Si blocage : mode "lien paiement manuel" (envoi lien par email hors Stripe) en fallback |
| **Bugs réglementaires (mauvais calcul de diagnostic obligatoire)** | Faible mais critique | Très élevé (responsabilité Servicimmo) | Tests unitaires ≥ 15 cas sur `rules.ts` dès Sprint 0. Validation formelle par Servicimmo avant prod. Disclaimer clair dans l'UI : "Calcul indicatif, à valider par le diagnostiqueur" |
| **Migration des dossiers existants de leur outil actuel** | Inconnue | Moyen | Scope import CSV prévu Sprint 1. S'ils ont des exports exotiques : adapter au cas par cas |
| **Next 16 + React 19 + Tailwind v4 instabilités** | Faible | Moyen | Stack récente mais en GA. Monitoring Sentry/Vercel. Si bug bloquant : pin versions intermédiaires |
| **Refactor `lib/diagnostics` → `lib/core` casse le questionnaire public** | Moyenne | Moyen | Sprint 0 : déplacement + alias d'imports + tests verts avant commit |

---

## 7 — Budget & timeline récapitulatifs

**Effort estimé** : ~13 semaines de dev pour Phase 1 (app complète en prod).

Avec 2 développeurs à mi-temps sur ce projet : **~13 semaines réelles**. Avec 1 développeur à plein temps : idem. Avec 2 à plein temps : **6-7 semaines**.

**Livrables** :
- Fin Sprint 2 : démo du wizard + dossiers (preuve de concept UX)
- Fin Sprint 5 : alpha utilisable en interne par Servicimmo (sans demande docs ni stats)
- Fin Sprint 8 : prod, Servicimmo bascule 100%

**Coût indicatif** (à ajuster avec le taux Propul'seo) : à calibrer selon le modèle commercial avec Servicimmo (forfait, régie, ou mix).

---

## 8 — Prochaines étapes immédiates

Dans cet ordre, aujourd'hui / demain :

1. **Valider ce MASTER PLAN** avec Etienne et Servicimmo
2. **Créer le projet Supabase** (dev + prod)
3. **Créer les comptes Stripe, Resend, Vercel** (ou vérifier l'existant)
4. **Exécuter le prompt Claude Code Sprint 0** (voir `KICKOFF-PROMPT-SPRINT-0.md` livré séparément)
5. **Planifier la première démo** client (proposer fin Sprint 2, ~3 semaines)

---

## Annexes

- `PRD-APP.md` — détail des 27 features de l'app Pilote (équivalent du `PRD-PHASE-1.md` produit précédemment)
- `ANALYSE-DIAG-PILOTE.md` + `ANALYSE-DIAG-PILOTE-PART2.md` — observations du benchmark Diag Pilote
- `KICKOFF-PROMPT-SPRINT-0.md` — prompt Claude Code prêt à coller pour démarrer le Sprint 0
- `CLAUDE.md` — brief technique (à mettre à jour avec stack réelle + architecture lib/core)
