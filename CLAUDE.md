# CLAUDE.md — Brief technique pour Claude Code

Ce fichier est la **source de vérité technique** du projet. Lis-le en entier avant de coder. Tu peux t'y référer à tout moment pour les conventions, patterns et décisions d'architecture.

---

## Projet

**Nom :** `servicimmo-v2`
**Client final :** SERVICIMMO (cabinet de diagnostic immobilier, Tours — Indre-et-Loire)
**Prestataire :** Propul'seo
**Repo :** `propulseo/servicimmo-v2` (privé)
**Déploiement :** Vercel (prod + preview) + Supabase (db)
**Langue du site :** français uniquement

## Contexte produit

Refonte complète du site servicimmo.fr avec pour cœur un **questionnaire intelligent multi-étapes** qui remplace le formulaire de devis actuel. Le questionnaire calcule automatiquement les diagnostics obligatoires et donne une estimation de prix en temps réel.

**Lis OBLIGATOIREMENT avant de commencer :**
1. `PRD.md` — spec produit
2. `QUESTIONNAIRE_FLOW.md` — flow détaillé + règles métier (cœur du projet)
3. `AUDIT.md` — contexte de l'existant

---

## Stack technique imposée

| Couche | Techno | Version |
|---|---|---|
| Framework | Next.js | 14+ (App Router, **pas** Pages Router) |
| Langage | TypeScript | strict mode |
| Styling | Tailwind CSS | v3 |
| UI components | shadcn/ui | dernière version |
| Icons | Lucide React | — |
| Forms | React Hook Form + Zod | — |
| Database | Supabase (Postgres) | — |
| Auth admin | Supabase Auth (magic link) | — |
| Storage | Supabase Storage | — |
| Email | Resend + React Email | — |
| Analytics | Plausible | — |
| Maps | Leaflet + OpenStreetMap | — |
| Address autocomplete | API BAN (adresse.data.gouv.fr) | gratuite |
| Animations | Framer Motion | usage modéré |
| State questionnaire | Zustand ou useReducer + localStorage | — |

**Interdits :**
- ❌ Bootstrap, MUI, Chakra, autre UI lib
- ❌ Redux, Recoil (overkill)
- ❌ jQuery ou librairies jQuery-like
- ❌ CSS-in-JS (styled-components, emotion) — Tailwind uniquement
- ❌ tRPC (pas nécessaire, Server Actions suffisent)
- ❌ Prisma (Supabase client direct)

---

## Structure du projet

```
servicimmo-v2/
├── app/
│   ├── (public)/                  # pages publiques grand public
│   │   ├── page.tsx               # accueil
│   │   ├── devis/
│   │   │   └── page.tsx           # questionnaire (CŒUR)
│   │   ├── services/
│   │   │   ├── [slug]/page.tsx    # pages services dynamiques
│   │   │   └── page.tsx           # index services
│   │   ├── actualites/
│   │   │   ├── page.tsx           # liste articles
│   │   │   └── [slug]/page.tsx    # article individuel
│   │   ├── zones/
│   │   │   └── [city]/page.tsx    # pages SEO locales
│   │   ├── contact/page.tsx
│   │   ├── mentions-legales/page.tsx
│   │   └── cgv/page.tsx
│   ├── (admin)/                   # back-office protégé
│   │   ├── layout.tsx             # layout auth-gated
│   │   ├── dashboard/page.tsx     # accueil admin
│   │   ├── demandes/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── login/page.tsx
│   ├── api/
│   │   ├── calculate/route.ts     # POST : moteur de règles + estimation
│   │   ├── quote-request/route.ts # POST : création/update demandes
│   │   ├── upload/route.ts        # POST : upload documents
│   │   └── webhook/resend/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                        # shadcn components
│   ├── questionnaire/             # tous composants form
│   │   ├── Step1Project.tsx
│   │   ├── Step2Property.tsx
│   │   ├── Step3Email.tsx
│   │   ├── Step4Details.tsx
│   │   ├── Step5Timeline.tsx
│   │   ├── Step6Recap.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── QuestionnaireLayout.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Nav.tsx
│   ├── marketing/                 # composants pages marketing
│   │   ├── Hero.tsx
│   │   ├── Certifications.tsx
│   │   ├── Testimonials.tsx
│   │   ├── FAQ.tsx
│   │   └── ...
│   └── shared/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts               # types générés depuis DB
│   ├── diagnostics/
│   │   ├── rules.ts               # moteur de règles métier
│   │   ├── pricing.ts             # estimation tarifaire
│   │   └── types.ts
│   ├── email/
│   │   ├── templates/
│   │   │   ├── QuoteConfirmation.tsx
│   │   │   ├── InternalNotification.tsx
│   │   │   └── AbandonRelance.tsx
│   │   └── send.ts
│   ├── validation/
│   │   └── schemas.ts             # schémas Zod
│   ├── ban-api.ts                 # autocomplete adresse
│   └── utils.ts
├── content/
│   ├── articles/                  # migration articles en MDX (optionnel)
│   └── services/
├── public/
│   ├── images/
│   └── logos/
├── scripts/
│   ├── migrate-articles.ts        # import des 100 articles
│   ├── migrate-cities.ts          # import pages villes
│   └── generate-sitemap.ts
├── styles/
├── middleware.ts                  # redirects 301 + auth admin
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
├── README.md
├── PRD.md
├── QUESTIONNAIRE_FLOW.md
├── AUDIT.md
├── CLAUDE.md                      # ce fichier
└── redirects.json                 # mapping 301 anciennes URLs → nouvelles
```

---

## Schéma Supabase

### Tables principales

```sql
-- Demandes de devis (cœur)
create table quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Statut du parcours
  status text not null default 'draft' check (status in (
    'draft', 'email_captured', 'submitted', 'quoted', 'accepted', 'rejected', 'archived'
  )),

  -- Étape 1
  project_type text check (project_type in ('sale', 'rental', 'works', 'coownership', 'other')),

  -- Étape 2
  property_type text,
  address text,
  postal_code text,
  city text,
  surface numeric,
  rooms_count integer,
  is_coownership boolean,

  -- Étape 3
  email text,
  email_captured_at timestamptz,

  -- Étape 4
  permit_date_range text check (permit_date_range in (
    'before_1949', '1949_to_1997', 'after_1997', 'unknown'
  )),
  heating_type text,
  gas_installation text,
  gas_over_15_years boolean,
  electric_over_15_years boolean,

  -- Étape 5
  urgency text,
  notes text,
  attachments jsonb default '[]'::jsonb,  -- array d'URLs

  -- Étape 6
  civility text,
  last_name text,
  first_name text,
  phone text,

  -- Calculs
  required_diagnostics jsonb,  -- array d'IDs diagnostics
  price_min numeric,
  price_max numeric,

  -- Consentement
  consent_rgpd boolean default false,
  consent_at timestamptz,

  -- Tracking
  source text,  -- utm_source
  medium text,  -- utm_medium
  campaign text,
  referer text,
  user_agent text
);

-- Services proposés
create table services (
  id serial primary key,
  slug text unique not null,
  name text not null,
  category text not null,  -- 'particulier', 'pro', 'amiante'
  short_description text,
  content text,  -- markdown
  price_min numeric,
  price_max numeric,
  duration_minutes integer,
  validity_months integer,  -- validité du diag
  is_active boolean default true,
  order_index integer default 0,
  seo_title text,
  seo_description text
);

-- Articles de veille (migration depuis ancien site)
create table articles (
  id serial primary key,
  legacy_id integer unique,  -- a1, a2, etc. de l'ancien site
  slug text unique not null,
  title text not null,
  content text not null,  -- markdown
  excerpt text,
  cover_image_url text,
  category text,  -- 'dpe', 'amiante', 'reglementation', etc.
  published_at timestamptz,
  updated_at timestamptz,
  seo_title text,
  seo_description text,
  is_published boolean default true
);

-- Villes / zones d'intervention
create table cities (
  id serial primary key,
  slug text unique not null,  -- 'tours', 'amboise', etc.
  name text not null,
  postal_code text,
  department text default '37',
  latitude numeric,
  longitude numeric,
  is_primary_zone boolean default true,
  seo_content text,  -- markdown spécifique par ville
  is_active boolean default true
);

-- Admin users (managé par Supabase Auth, ce sont les emails autorisés)
-- on utilise la table auth.users native

-- Notes internes sur demandes
create table quote_notes (
  id serial primary key,
  quote_request_id uuid references quote_requests(id) on delete cascade,
  author_id uuid references auth.users(id),
  content text not null,
  created_at timestamptz default now()
);

-- Logs d'actions (audit trail simple)
create table action_logs (
  id serial primary key,
  entity_type text,
  entity_id text,
  action text,
  author_id uuid references auth.users(id),
  metadata jsonb,
  created_at timestamptz default now()
);
```

### Indexes importants

```sql
create index idx_quote_requests_status on quote_requests(status);
create index idx_quote_requests_email on quote_requests(email);
create index idx_quote_requests_created_at on quote_requests(created_at desc);
create index idx_articles_published on articles(is_published, published_at desc);
create index idx_articles_legacy on articles(legacy_id);
```

### Row Level Security (RLS)

- `quote_requests` : insert autorisé publiquement (via anon key), lecture/update uniquement via service role (API routes backend)
- `services` et `articles` : lecture publique, écriture admin seulement
- `quote_notes` et `action_logs` : admin only

---

## Conventions de code

### Général

- **Commentaires en français** pour la logique métier, **anglais** pour la technique
- Noms de variables en anglais, libellés UI en français
- Pas de `any` TypeScript, jamais
- Server Components par défaut, Client Components (`"use client"`) uniquement si interactivité nécessaire
- Server Actions pour les mutations simples, API routes pour flux complexes ou publics

### Nommage

- Composants React : PascalCase, un composant par fichier
- Hooks : `useCamelCase` dans `/hooks`
- Utilitaires : camelCase
- Constantes : SCREAMING_SNAKE_CASE
- Types/Interfaces : PascalCase, préférer `type` à `interface` sauf héritage

### Gestion d'état du questionnaire

Utiliser Zustand pour l'état global du questionnaire + persist middleware pour localStorage.

```ts
// lib/stores/questionnaire.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type QuestionnaireState = {
  currentStep: number;
  data: Partial<QuoteFormData>;
  setStep: (step: number) => void;
  updateData: (data: Partial<QuoteFormData>) => void;
  reset: () => void;
};

export const useQuestionnaireStore = create<QuestionnaireState>()(
  persist(
    (set) => ({
      currentStep: 1,
      data: {},
      setStep: (step) => set({ currentStep: step }),
      updateData: (data) => set((state) => ({ data: { ...state.data, ...data } })),
      reset: () => set({ currentStep: 1, data: {} }),
    }),
    { name: 'servicimmo-quote' }
  )
);
```

### Validation

Tous les schémas Zod dans `lib/validation/schemas.ts`. Partagés entre client (React Hook Form) et serveur (API routes).

### Accessibilité

- Tous les inputs ont un `<label>` associé
- Focus visible partout
- Navigation clavier complète
- Attributs ARIA sur composants custom
- Contraste AAA sur les textes importants

### Performance

- Images via `next/image` systématiquement
- `priority` sur hero uniquement
- Pages articles et services : ISR avec `revalidate: 3600`
- Pages villes : statique au build
- Questionnaire : 100% client après hydration

---

## Moteur de règles — implémentation

Voir `QUESTIONNAIRE_FLOW.md` section 4 pour les règles complètes.

Implémenter dans `lib/diagnostics/rules.ts` une fonction pure :

```ts
export type QuoteFormData = {
  project_type: 'sale' | 'rental' | 'works' | 'coownership' | 'other';
  property_type: string;
  surface: number;
  rooms_count: number;
  is_coownership: boolean;
  permit_date_range: 'before_1949' | '1949_to_1997' | 'after_1997' | 'unknown';
  heating_type: string;
  gas_installation: string;
  gas_over_15_years: boolean;
  electric_over_15_years: boolean;
  postal_code: string;
  // ...
};

export type RequiredDiagnostic = {
  id: string;
  name: string;
  reason: string;  // pourquoi obligatoire (pédagogie)
  validityMonths: number;
};

export function calculateRequiredDiagnostics(data: QuoteFormData): RequiredDiagnostic[] {
  const diagnostics: RequiredDiagnostic[] = [];

  // DPE
  if ((data.project_type === 'sale' || data.project_type === 'rental')
      && isLogement(data.property_type)) {
    diagnostics.push({
      id: 'dpe',
      name: 'DPE — Diagnostic de Performance Énergétique',
      reason: 'Obligatoire pour toute vente ou location de logement',
      validityMonths: 120,
    });
  }

  // Plomb
  if (data.permit_date_range === 'before_1949'
      && (data.project_type === 'sale' || data.project_type === 'rental')
      && isLogement(data.property_type)) {
    diagnostics.push({
      id: 'lead',
      name: 'CREP — Constat de Risque d\'Exposition au Plomb',
      reason: 'Permis de construire antérieur au 1er janvier 1949',
      validityMonths: data.project_type === 'sale' ? 12 : 72,
    });
  }

  // Amiante
  if ((data.permit_date_range === 'before_1949' || data.permit_date_range === '1949_to_1997')
      && data.project_type === 'sale') {
    diagnostics.push({
      id: 'asbestos',
      name: 'Amiante',
      reason: 'Permis de construire antérieur au 1er juillet 1997',
      validityMonths: -1,  // illimité si négatif, sinon 3 ans
    });
  }

  // Termites
  if (data.project_type === 'sale' && data.postal_code.startsWith('37')) {
    diagnostics.push({
      id: 'termites',
      name: 'Termites',
      reason: 'L\'Indre-et-Loire est déclarée zone à risque termites par arrêté préfectoral',
      validityMonths: 6,
    });
  }

  // Gaz
  if (data.gas_over_15_years
      && (data.project_type === 'sale' || data.project_type === 'rental')) {
    diagnostics.push({
      id: 'gas',
      name: 'État de l\'installation Gaz',
      reason: 'Installation gaz de plus de 15 ans',
      validityMonths: data.project_type === 'sale' ? 36 : 72,
    });
  }

  // Électricité
  if (data.electric_over_15_years
      && (data.project_type === 'sale' || data.project_type === 'rental')) {
    diagnostics.push({
      id: 'electric',
      name: 'État de l\'installation Électrique',
      reason: 'Installation électrique de plus de 15 ans',
      validityMonths: data.project_type === 'sale' ? 36 : 72,
    });
  }

  // Loi Carrez
  if (data.project_type === 'sale' && data.is_coownership) {
    diagnostics.push({
      id: 'carrez',
      name: 'Loi Carrez',
      reason: 'Vente d\'un lot en copropriété',
      validityMonths: -1,
    });
  }

  // Loi Boutin
  if (data.project_type === 'rental' && isLogement(data.property_type)) {
    diagnostics.push({
      id: 'boutin',
      name: 'Loi Boutin',
      reason: 'Location de logement vide à usage de résidence principale',
      validityMonths: -1,
    });
  }

  // ERP — toujours obligatoire
  if (data.project_type === 'sale' || data.project_type === 'rental') {
    diagnostics.push({
      id: 'erp',
      name: 'ERP — État des Risques et Pollutions',
      reason: 'Obligatoire pour toute vente ou location',
      validityMonths: 6,
    });
  }

  // TODO: travaux, démolition, cas tertiaire, audit énergétique, DPE collectif...

  return diagnostics;
}

function isLogement(type: string): boolean {
  return ['house', 'apartment', 'building'].includes(type);
}
```

**Tests unitaires requis** sur ce fichier : minimum 15 cas représentatifs (voir section tests).

---

## Pricing — implémentation

Dans `lib/diagnostics/pricing.ts`, fonction pure qui prend la liste des diagnostics obligatoires + context (surface, zone, urgence) et retourne `{ min, max }`.

Voir `QUESTIONNAIRE_FLOW.md` section 5 pour grille tarifaire et modulateurs.

---

## Emails

Utiliser React Email pour les templates, Resend pour l'envoi.

Templates à créer :

1. **`QuoteConfirmation.tsx`** — envoyé au client après soumission finale
   - Récap des diagnostics calculés
   - Estimation de prix
   - Prochaine étape : "notre équipe vous contacte sous 2h"

2. **`InternalNotification.tsx`** — envoyé à l'équipe Servicimmo
   - Toutes les infos du formulaire
   - Lien vers la fiche admin
   - Précisions ajoutées par le client

3. **`AbandonRelance.tsx`** — envoyé J+1 après capture email sans complétion
   - "Il vous reste 2 étapes pour obtenir votre devis"
   - Lien magique pour reprendre où l'utilisateur en était

---

## SEO et migration

### Mapping des redirections 301

`redirects.json` à la racine du projet, consommé dans `middleware.ts` :

```ts
// middleware.ts (simplifié)
import redirects from './redirects.json';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const redirect = redirects[pathname];
  if (redirect) {
    return NextResponse.redirect(new URL(redirect, request.url), 301);
  }
  return NextResponse.next();
}
```

Mapping à construire à partir du fichier `servicimmo_urls.txt` :

- `/performance-energetique-...-i7.html` → `/services/dpe`
- `/expertises-immobilieres-...-a123.html` → `/actualites/[nouveau-slug]`
- `/dpe-tours-37000.html` → `/zones/tours/dpe`
- ...

**Tous les 193 liens doivent avoir une destination.** Fichier `redirects.json` sera généré par un script de migration.

### Sitemap

Généré dynamiquement dans `app/sitemap.ts` à partir de :
- pages statiques
- articles publiés
- services actifs
- villes actives

### Meta tags

Chaque page a un title + description soit :
- Hérités de l'existant (quand corrects)
- Re-générés par script migration via Claude API (quand trop génériques)

---

## Tests

**Obligatoire :**
- Tests unitaires sur `lib/diagnostics/rules.ts` (Vitest) — ≥15 cas
- Tests unitaires sur `lib/diagnostics/pricing.ts` (Vitest) — ≥10 cas
- Test E2E du questionnaire complet (Playwright) — au moins le happy path

**Optionnel mais recommandé :**
- Tests des composants critiques du questionnaire (Vitest + Testing Library)
- Tests des API routes (Vitest)

---

## Variables d'environnement

`.env.local` :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email
RESEND_API_KEY=
EMAIL_FROM=devis@servicimmo.fr
EMAIL_INTERNAL_NOTIFICATION=contact@servicimmo.fr

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=servicimmo.fr

# App
NEXT_PUBLIC_APP_URL=https://servicimmo.fr
```

---

## Workflow de développement

1. **Lis PRD.md, QUESTIONNAIRE_FLOW.md, AUDIT.md en entier**
2. Initialise Next.js + TS + Tailwind + shadcn/ui
3. Setup Supabase local (docker) + applique les migrations
4. Implémente d'abord le **moteur de règles** (rules.ts + tests) — c'est le cœur
5. Implémente le **pricing** (pricing.ts + tests)
6. Implémente le **questionnaire** étape par étape (de 1 à 6)
7. Implémente les **emails** (templates + envoi)
8. Implémente les **pages marketing** (accueil, services, actualités)
9. Implémente le **back-office admin**
10. Migration du contenu (script `migrate-articles.ts`)
11. Mapping 301 et middleware
12. Tests E2E + QA
13. Déploiement preview Vercel
14. Validation Propul'seo + Servicimmo
15. Mise en prod avec monitoring

---

## Questions à me poser avant de commencer

Si quelque chose est ambigu dans les docs, **demande à Lyes** plutôt que de supposer. Notamment :

- Tarifs de base exacts (section 5 de QUESTIONNAIRE_FLOW)
- Cas limites des règles métier (section 8 de QUESTIONNAIRE_FLOW)
- Charte graphique définitive (couleurs précises)
- Integration Calendar V1 ou V2 ?
- Format de l'export dashboard admin (CSV, Excel, autre ?)

---

## Ressources utiles

- Réglementation diagnostic immobilier : https://www.service-public.fr/particuliers/vosdroits/F16096
- API BAN adresse : https://adresse.data.gouv.fr/api-doc/adresse
- Supabase docs : https://supabase.com/docs
- shadcn/ui : https://ui.shadcn.com
- React Email : https://react.email
- Règles diagnostics (source officielle) : https://www.ecologie.gouv.fr/diagnostic-performance-energetique-dpe

---

**Bon dev Claude Code. Le cœur du projet c'est le questionnaire — soigne-le, c'est ce qui va différencier Servicimmo pendant 5 ans.**
