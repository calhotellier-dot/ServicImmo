# CLAUDE.md — Brief technique

> **Source de vérité technique** du projet `servicimmo-v2`. Lis ce fichier en entier avant toute session de dev. Remplace l'ancienne version.

---

## Projet

- **Nom** : `servicimmo-v2`
- **Client final** : SERVICIMMO (cabinet de diagnostic immobilier, Tours — Indre-et-Loire)
- **Prestataire** : Propul'seo (Lyes Triki + Etienne Guimbard)
- **Repo** : `lyestriki-29/servicimmo`
- **Déploiement** : Vercel (prod + preview) + Supabase Cloud
- **Langue UI** : français uniquement

---

## Deux applications dans un seul repo

Ce projet contient **deux applications** greffées sur le même codebase :

### 1. Site vitrine public (Phase 2 — en cours)

Refonte du site `servicimmo.fr` actuel avec un **questionnaire intelligent 6 étapes** qui remplace le formulaire de devis classique. Pages : accueil, services, zones SEO par ville, actualités, contact, questionnaire.

Route group : `app/(marketing)/`.

### 2. App Pilote interne (Phase 1 — PRIORITAIRE)

ERP métier interne pour Servicimmo (équivalent de Diag Pilote / Liciel). Gère : dossiers, contacts, devis, factures, paiements Stripe, agenda, demande de documents, statistiques, portail clients/prescripteurs.

Route group : `app/(app)/` + `app/(portail)/` + `app/(auth)/`.

**Ordre d'exécution validé** : on livre l'app Pilote complète avant de finaliser le site vitrine. Le site actuel `servicimmo.fr` reste en prod pendant ce temps.

---

## Lectures obligatoires avant toute session

1. `MASTER-PLAN.md` — roadmap complète, décisions architecturales, risques
2. `PRD-APP.md` — 27 features détaillées de l'app Pilote (Phase 1)
3. `PRD.md` — spec du site vitrine (Phase 2)
4. `QUESTIONNAIRE_FLOW.md` — cœur métier : règles diagnostics + grille tarifaire
5. `AUDIT.md` — contexte du site actuel
6. `CLAUDE.md` — ce fichier (conventions + architecture)

---

## Stack technique (vérité = `package.json`)

| Couche | Techno | Version |
|--------|--------|---------|
| Framework | Next.js | **16.2.4** (App Router) |
| Runtime | React | **19.2.4** |
| Langage | TypeScript | 5.x strict + `noUncheckedIndexedAccess` |
| Styling | Tailwind CSS | **v4** (syntaxe sans config JS) |
| UI components | shadcn/ui (New York neutral) via Radix primitives | dernière |
| Icons | Lucide React | 0.468 |
| Forms | React Hook Form + Zod | 7.54 + 3.24 |
| State questionnaire | Zustand + persist localStorage | 5.0 |
| Animations | Framer Motion | 11.15 (usage modéré) |
| Database | Supabase Postgres | — |
| Auth | Supabase Auth (email+password, magic link) | — |
| Storage | Supabase Storage | — |
| Email | Resend + React Email | 4.0 |
| Paiements | **Stripe Checkout + Webhooks** | à ajouter |
| PDF | **@react-pdf/renderer** ou pdf-lib | à ajouter |
| Agenda UI | **react-big-calendar** ou fullcalendar | à ajouter |
| Kanban DnD | **@dnd-kit/core** | à ajouter |
| Charts | **recharts** | à ajouter |
| Adresse autocomplete | API BAN (adresse.data.gouv.fr — gratuite) | — |
| SIRET enrichment | API Pappers | — |
| Maps | Leaflet + OpenStreetMap | si besoin |
| Analytics | Plausible | — |
| Tests | Vitest + Testing Library + jsdom | 2.1 |
| E2E | Playwright | à ajouter en fin de Phase 1 |
| Package manager | pnpm | 10.33 |
| Node | >= 20 | — |

### Interdits stricts

- ❌ Autres UI lib : Bootstrap, MUI, Chakra, Mantine
- ❌ Autres state managers : Redux, Recoil, Jotai (Zustand suffit)
- ❌ CSS-in-JS : styled-components, emotion (Tailwind uniquement)
- ❌ tRPC (Server Actions Next.js 16 suffisent)
- ❌ Prisma (client Supabase direct, types générés)
- ❌ jQuery ou dérivés

---

## Architecture : `core` / `features` / `clients`

Cette architecture permet de **réutiliser la logique métier** pour d'autres cabinets de diagnostic immobilier à l'avenir, sans dupliquer le code entier.

### Trois couches avec règles d'import strictes

```
┌────────────────────────────────────────────────────────┐
│  lib/clients/servicimmo/                               │
│  SPÉCIFIQUE — peut importer core + features            │
│                                                        │
│  - config.ts, branding.ts                              │
│  - pricing-grid.ts, business-rules.ts (overrides)      │
│  - email-templates/, legal/, content/                  │
└────────────────────────────────────────────────────────┘
              ↓ importe
┌────────────────────────────────────────────────────────┐
│  lib/features/                                         │
│  DOMAINE — peut importer core UNIQUEMENT               │
│  NE DOIT PAS importer clients/                         │
│                                                        │
│  - dossiers/, devis/, factures/, paiements/            │
│  - agenda/, demande-documents/, contacts/              │
│  - tarification/, statistiques/                        │
└────────────────────────────────────────────────────────┘
              ↓ importe
┌────────────────────────────────────────────────────────┐
│  lib/core/                                             │
│  PUR — n'importe RIEN du projet                        │
│  Pas d'appels Supabase / Resend / Stripe ici           │
│                                                        │
│  - diagnostics/rules.ts, pricing.ts                    │
│  - types/ (Dossier, Devis, Facture, Contact...)        │
│  - fec/ (format FEC), signature/ (JWT magic link)      │
│  - utils/                                              │
└────────────────────────────────────────────────────────┘
```

### Règles d'imports enforce via ESLint

Configuration `eslint.config.mjs` avec `import/no-restricted-paths` :

```js
{
  "import/no-restricted-paths": ["error", {
    "zones": [
      // core ne peut rien importer du projet
      { "from": "./lib/features", "target": "./lib/core" },
      { "from": "./lib/clients", "target": "./lib/core" },
      { "from": "./app",         "target": "./lib/core" },
      // features ne peut pas importer clients
      { "from": "./lib/clients", "target": "./lib/features" },
    ]
  }]
}
```

### Comment injecter le spécifique Servicimmo

Les fonctions `core/` prennent les config/overrides en paramètre, pas en import direct :

```ts
// lib/core/diagnostics/rules.ts
export function calculateRequiredDiagnostics(
  data: QuoteFormData,
  overrides?: BusinessRuleOverrides
): RequiredDiagnostic[] { ... }

// lib/clients/servicimmo/business-rules.ts
export const servicimmoOverrides: BusinessRuleOverrides = {
  termitesZones: ['37'],
  extraMandatoryRules: [...],
};

// app/(app)/dossiers/new/page.tsx
import { calculateRequiredDiagnostics } from '@/lib/core/diagnostics/rules';
import { servicimmoOverrides } from '@/lib/clients/servicimmo/business-rules';

const diagnostics = calculateRequiredDiagnostics(data, servicimmoOverrides);
```

---

## Structure du repo (cible)

Voir `MASTER-PLAN.md` §2 pour l'arbre complet. Résumé :

```
app/
├── (marketing)/           # site vitrine (Phase 2)
├── (app)/                 # app Pilote (Phase 1 PRIORITAIRE)
├── (portail)/[token]/     # portail clients/prescripteurs
├── (auth)/                # login
└── api/                   # webhooks Stripe/Resend, proxies BAN/Pappers

components/
├── ui/                    # shadcn primitives
├── marketing/             # Hero, FAQ, etc.
├── questionnaire/         # 6 étapes public
├── wizard/                # 10 étapes interne app
├── agenda/, facturation/, demande-docs/, layout/

lib/
├── core/                  # métier pur, réutilisable
├── features/              # logique applicative, réutilisable
├── clients/servicimmo/    # spécifique Servicimmo
├── supabase/              # clients DB
├── stripe/, resend/, pappers/, ban/
└── validation/            # schémas Zod partagés

supabase/migrations/
```

---

## Schéma Supabase

Voir `PRD-APP.md` §5 pour le détail. Tables principales :

- `organizations` (prêt pour multi-tenant, 1 seule "Servicimmo" pour l'instant)
- `users` (Supabase Auth + profile étendu, rôle admin/diagnostiqueur)
- `contacts` (clients + prescripteurs unifiés par `type`)
- `dossiers` (entité pivot, 10 étapes wizard)
- `diagnostic_types`, `dossier_diagnostics`
- `rendez_vous`
- `devis`, `devis_lignes` + `factures`, `facture_lignes` (immuables)
- `paiements` (Stripe + manuels)
- `documents_dossier` (Supabase Storage)
- `demandes_documents`, `demande_items`, `modeles_demande`
- `grille_tarifaire`, `regles_majoration`
- `journal_communications` (audit log)
- `quote_requests` (funnel public — **existant, à connecter avec les dossiers**)
- `services`, `articles`, `cities` (site vitrine — existants)
- `catalogue_prestations`, `parametres_cabinet`

**RLS activé partout** dès le début. Aucune table publique sans policy explicite.

---

## Conventions de code

### Général

- Commentaires en **français** pour la logique métier, **anglais** pour la technique
- Noms de variables/fonctions en anglais, libellés UI en français
- Pas de `any` TypeScript, jamais
- **Server Components par défaut**, `"use client"` uniquement si interactivité (hooks, événements)
- **Server Actions** pour mutations simples, **API routes** pour flux publics (webhooks, portail)
- Fichiers < 300 lignes, sauf exception justifiée

### Nommage

- Composants React : PascalCase (`DossierCard.tsx`)
- Hooks : `useCamelCase` dans `hooks/`
- Utilitaires : camelCase
- Constantes : SCREAMING_SNAKE_CASE
- Types/Interfaces : PascalCase, `type` préféré à `interface` sauf héritage
- Tables Supabase : `snake_case` pluriel (`dossiers`, `rendez_vous`)
- Columns : `snake_case`

### Mutations

```ts
// Server Action avec validation Zod
'use server';
import { z } from 'zod';

const CreateDossierSchema = z.object({ ... });

export async function createDossier(input: z.infer<typeof CreateDossierSchema>) {
  const validated = CreateDossierSchema.parse(input);
  const supabase = await createServerClient();
  // ...
}
```

### Fetching (Server Components)

```ts
// app/(app)/dossiers/page.tsx (Server Component)
import { createServerClient } from '@/lib/supabase/server';

export default async function DossiersPage() {
  const supabase = await createServerClient();
  const { data: dossiers } = await supabase
    .from('dossiers')
    .select('*, contacts!proprietaire_id(nom), users!technicien_id(prenom, nom)')
    .order('created_at', { ascending: false });
  // ...
}
```

### State management (Client Components)

- Questionnaire public + wizard dossier : Zustand + persist
- Pas de state global pour le reste. Re-fetch via `revalidatePath` / `revalidateTag` après mutations.

### Validation

Tous les schémas Zod dans `lib/validation/schemas.ts`, partagés client + serveur.

### Accessibilité

- Labels associés à tous les inputs
- Focus visible (`:focus-visible`)
- Navigation clavier complète
- ARIA sur composants custom
- Contraste AA minimum, AAA pour textes importants

### Performance

- Images via `next/image` systématiquement, `priority` uniquement sur hero
- ISR sur articles/services (`revalidate: 3600`)
- Pages villes : statique au build
- Questionnaire + wizard : 100% client après hydration
- Stats : SSR avec cache 5 min

---

## Moteur de règles diagnostic

Implémentation dans `lib/core/diagnostics/rules.ts`. **Fonction pure** (pas d'I/O) :

```ts
export function calculateRequiredDiagnostics(
  data: QuoteFormData,
  overrides?: BusinessRuleOverrides
): RequiredDiagnostic[]
```

Voir `QUESTIONNAIRE_FLOW.md` §4 pour les règles complètes.

**Tests obligatoires** : minimum 15 cas représentatifs (Vitest) dans `__tests__/rules.test.ts`. Cas à couvrir :
- Vente appartement construit avant 1949 (plomb obligatoire)
- Vente maison 1949-1997 (amiante obligatoire, pas de plomb)
- Location logement après 1997 (pas d'amiante ni plomb)
- Vente en copropriété (Carrez)
- Location (Boutin)
- Indre-et-Loire 37 (termites obligatoire via `servicimmoOverrides`)
- Gaz > 15 ans, élec > 15 ans
- ERP toujours pour vente/location
- Travaux / démolition (cas spécifiques amiante)
- Cas tertiaire (DPE mention tertiaire)
- etc.

---

## Pricing

Implémentation dans `lib/core/diagnostics/pricing.ts`. **Fonction pure** :

```ts
export function computeQuote(
  diagnostics: RequiredDiagnostic[],
  context: PricingContext,
  grille: PricingGrid,
  rules: MajorationRule[]
): QuoteResult
```

Voir `QUESTIONNAIRE_FLOW.md` §5 pour grille et modulateurs.

Tests : minimum 10 cas dans `__tests__/pricing.test.ts`.

---

## Supabase clients

```ts
// lib/supabase/server.ts — usage côté serveur (RSC, Server Actions, API routes)
import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(...) } }
  );
}

// lib/supabase/client.ts — usage côté client ("use client")
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// lib/supabase/admin.ts — service role (API routes privées uniquement, jamais côté client)
```

**Types générés** : `pnpm supabase gen types typescript --project-id XXX > lib/supabase/types.ts` après chaque migration.

---

## Emails (Resend + React Email)

Templates dans `lib/clients/servicimmo/email-templates/` (specific à Servicimmo pour le branding) :

- `QuoteConfirmation.tsx` — client après soumission questionnaire public
- `InternalNotification.tsx` — équipe Servicimmo (copie interne)
- `AbandonRelance.tsx` — J+1 après capture email
- `DossierCreated.tsx` — notification interne + prescripteur
- `DevisEnvoye.tsx` — devis client avec lien acceptation
- `FactureEmise.tsx` — facture + lien Stripe
- `PaiementRecu.tsx` — reçu client
- `RelancePaiement.tsx` — J+7, J+15, J+30
- `DemandeDocuments.tsx` — magic link portail demande docs
- `MagicLinkPortail.tsx` — accès portail client/prescripteur
- `RapportPublie.tsx` — notification rapport disponible

---

## Sécurité / RGPD

- **RLS Supabase activé partout** : aucune table accessible sans policy explicite
- **Hébergement EU** (Supabase région `eu-west-1`)
- **Chiffrement au repos** (natif Supabase)
- **Pas de données sensibles dans les logs**
- **Pas de Google Analytics** (Plausible : self-hosted ou EU)
- **Cookies** : minimal, pas de tracking tiers (Plausible est cookieless)
- **Magic links JWT** : expiration 30j, signature HS256, secret env var
- **Export RGPD** : à minima CSV par client depuis fiche contact (Phase 1)

---

## Tests obligatoires

| Type | Cible | Outil | Obligation |
|------|-------|-------|------------|
| Unit | `lib/core/diagnostics/rules.ts` | Vitest | ≥ 15 cas, PR bloquante |
| Unit | `lib/core/diagnostics/pricing.ts` | Vitest | ≥ 10 cas, PR bloquante |
| Unit | `lib/core/fec/*.ts` | Vitest | couverture des 18 colonnes FEC |
| Integration | Server Actions critiques (createDossier, emitFacture, registerPaiement) | Vitest + test DB | Sprint 4+ |
| E2E | 3 parcours critiques | Playwright | Sprint 8 |

Parcours E2E obligatoires :
1. Wizard dossier → devis → acceptation portail → facture → paiement Stripe
2. Demande documentaire → remplissage portail client → retour et notification
3. Export FEC fin d'exercice

---

## Variables d'environnement

`.env.local.example` (à compléter) :

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=
EMAIL_FROM=devis@servicimmo.fr
EMAIL_INTERNAL=contact@servicimmo.fr

# Pappers
PAPPERS_API_KEY=

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=servicimmo.fr

# App
NEXT_PUBLIC_APP_URL=https://servicimmo.fr
JWT_PORTAL_SECRET=   # pour signer les magic links du portail

# Client config
NEXT_PUBLIC_CLIENT=servicimmo
```

---

## Workflow de dev avec Claude Code

1. **Lire** `MASTER-PLAN.md` + `PRD-APP.md` + `CLAUDE.md` (ce fichier) avant toute session
2. **Une feature = une branche** : `feat/f-05-wizard-dossier`
3. **Commits Conventional** : `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`
4. **Migrations Supabase** : `pnpm supabase migration new feat_xxx`, nommer explicitement
5. **Types DB** : régénérer après chaque migration (`pnpm supabase gen types ...`)
6. **Tests** : écrire les tests unitaires avant de commit sur `lib/core/`
7. **PR** avant merge sur `dev`, review rapide même solo
8. **Merge sur `main`** = deploy Vercel prod (uniquement fin de sprint validé)

---

## Ressources

- Réglementation diagnostic immobilier : https://www.service-public.fr/particuliers/vosdroits/F16096
- API BAN adresse : https://adresse.data.gouv.fr/api-doc/adresse
- API Pappers (SIRET) : https://www.pappers.fr/api
- Supabase docs : https://supabase.com/docs
- Next.js 16 : https://nextjs.org/docs
- React 19 : https://react.dev
- Tailwind CSS v4 : https://tailwindcss.com/docs
- shadcn/ui : https://ui.shadcn.com
- React Email : https://react.email
- Stripe Checkout : https://stripe.com/docs/payments/checkout
- Format FEC : https://www.impots.gouv.fr/portail/node/12404

---

**Principe directeur** : le cœur du projet c'est le **moteur de règles** + le **wizard de création dossier** + le **moteur de tarification**. Tout le reste est greffé autour. Soigne ces trois zones plus que le reste.
