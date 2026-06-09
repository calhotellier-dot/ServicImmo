# Servicimmo V2

Refonte du site [servicimmo.fr](https://www.servicimmo.fr) — cabinet de diagnostic immobilier à Tours (Indre-et-Loire).

> **Propul'seo × SERVICIMMO** — projet privé. Cœur du produit : un questionnaire intelligent de devis qui calcule automatiquement les diagnostics obligatoires et donne une estimation de prix en temps réel.

---

## Documents de référence

Lis ces 4 documents dans l'ordre avant tout développement :

1. [`AUDIT.md`](./AUDIT.md) — audit du site actuel, problèmes et opportunités
2. [`PRD.md`](./PRD.md) — spec produit, personas, scope V1 / V2, planning
3. [`QUESTIONNAIRE_FLOW.md`](./QUESTIONNAIRE_FLOW.md) — **cœur métier** : 6 étapes + règles diagnostics + grille tarifaire
4. [`CLAUDE.md`](./CLAUDE.md) — brief technique : stack, schéma Supabase, conventions

---

## Stack technique

| Couche | Techno |
|---|---|
| Framework | Next.js 16 (App Router) |
| Langage | TypeScript strict (`noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS v4 |
| UI kit | shadcn/ui (New York, base neutral) |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| State | Zustand (+ persist middleware pour questionnaire) |
| DB | Supabase (Postgres + Auth + Storage) |
| Email | Resend + React Email |
| Tests | Vitest + jsdom + Testing Library |
| Hosting | Vercel |

---

## Setup local

### Prérequis

- Node.js ≥ 20 (LTS recommandé)
- pnpm ≥ 10 (`npm i -g pnpm`)

### Installation

```bash
# 1. Installer les dépendances
pnpm install

# 2. Copier le template d'env et le remplir
cp .env.local.example .env.local
# → renseigner Supabase, Resend, etc.

# 3. Lancer le serveur de dev
pnpm dev
# → http://localhost:3000
```

---

## Scripts disponibles

| Commande | Effet |
|---|---|
| `pnpm dev` | Démarre le serveur de développement (Turbopack) |
| `pnpm build` | Build de production |
| `pnpm start` | Lance le build de production en local |
| `pnpm lint` | Lint le projet (ESLint + Next.js config) |
| `pnpm lint:fix` | Lint avec corrections automatiques |
| `pnpm typecheck` | Vérifie les types sans émettre de fichiers |
| `pnpm test` | Lance la suite Vitest (run one-shot) |
| `pnpm test:watch` | Vitest en mode watch |
| `pnpm test:ui` | Vitest UI (navigateur) |
| `pnpm format` | Formate tout le projet (Prettier) |
| `pnpm format:check` | Vérifie le formatage sans modifier |

---

## Structure du projet

```
servicimmo-v2/
├── app/
│   ├── (public)/            # Pages publiques (accueil, devis, services, actualités)
│   ├── (admin)/             # Back-office protégé (dashboard, demandes, login)
│   ├── api/                 # Routes API (calculate, quote-request, upload, webhook)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                  # Composants shadcn/ui
│   ├── questionnaire/       # Composants form multi-étapes
│   ├── layout/              # Header, Footer, Nav
│   ├── marketing/           # Hero, Certifications, FAQ, …
│   └── shared/
├── lib/
│   ├── diagnostics/         # Moteur de règles + pricing (cœur métier)
│   │   ├── rules.ts
│   │   ├── pricing.ts
│   │   ├── types.ts
│   │   └── __tests__/
│   ├── supabase/            # Clients Supabase + types générés
│   ├── email/templates/     # Templates React Email
│   ├── validation/          # Schémas Zod partagés
│   └── utils.ts
├── hooks/
├── supabase/
│   ├── migrations/
│   └── functions/
├── public/
├── scripts/                 # Scripts de migration / utilitaires
└── middleware.ts            # Redirections 301 + auth admin (à créer)
```

---

## Conventions

- **Langue** : UI en français, commentaires métier en français, commentaires techniques en anglais
- **TypeScript** : `strict` + `noUncheckedIndexedAccess`, jamais de `any`
- **Composants** : Server Components par défaut, `"use client"` uniquement si interactivité
- **Fichiers** : < 300 lignes sauf exception justifiée
- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, …)
- **Tests obligatoires** : `lib/diagnostics/rules.ts` (≥ 15 cas) et `lib/diagnostics/pricing.ts` (≥ 10 cas)

---

## État d'avancement (sessions)

- [x] **Session 1 — Fondations** : setup Next.js + TS strict + shadcn + moteurs rules/pricing (tests Vitest)
- [ ] **Session 2 — Questionnaire UI** : 6 étapes + Zustand store + validation Zod + API calculate/quote-request
- [ ] **Session 3 — Emails + Admin + Pages marketing** : Resend templates, back-office, pages services/actualités
- [ ] **Session 4 — Migration contenu + SEO** : 100 articles, 40 pages villes, redirections 301, sitemap
- [ ] **Session 5 — QA + livraison** : E2E Playwright, preview Vercel, mise en prod

---

## Notes d'exploitation

- **Les tarifs du moteur de pricing sont indicatifs.** Ils doivent être validés et calibrés avec Servicimmo avant mise en production (cf. `QUESTIONNAIRE_FLOW.md` §5 et §8).
- **Aucune URL legacy ne doit casser.** Le fichier `redirects.json` et `middleware.ts` seront livrés en session 4.
