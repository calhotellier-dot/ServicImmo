# Portage home.html → vitrine Next.js — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduire fidèlement la maquette `Template LP/servicimmo-lp/home.html` dans le site vitrine Next.js (`app/(marketing)`), avec le questionnaire existant hébergé dans un modal premium « stepper compact ».

**Architecture:** Réécriture des composants `components/marketing/*` (l'actuel est une autre DA « D3 »), contenu **statique** mirroring `home.html`, animations en **Framer Motion + CSS**, tokens couleur déjà présents (`--color-home-*`) + ajout polices Sora/Inter/Fredoka scopées au marketing. Le modal réutilise `QuestionnaireApp` via une prop `embedded`.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind v4 (`@theme`), Framer Motion, next/font, next/image. Package manager **pnpm via corepack**.

**Source de vérité visuelle :** la maquette. Chemins :
- HTML : `Template LP/servicimmo-lp/home.html`
- CSS sections : `Template LP/servicimmo-lp/css/labs-variants.css`
- CSS header/footer : `Template LP/servicimmo-lp/css/home.css`
- Tokens DA : `Template LP/servicimmo-lp/css/labs.css` (`:root`)

**Commandes :** `corepack pnpm dev` (serveur), `corepack pnpm typecheck` (tsc --noEmit), `corepack pnpm lint`.
**Vérif visuelle :** l'utilisateur la fait lui-même dans son navigateur (ne PAS lancer Playwright). À chaque palier : annoncer l'URL `http://localhost:3000/` et attendre son OK.

**Mapping lignes home.html → sections :**
| Section | home.html | CSS (labs-variants.css) |
|---|---|---|
| Hero `v-hero-3` | 90–121 | `.v-hero-3` 58–91 |
| Pourquoi `v-about-1` | 123–151 | `.v-about-1` 248–268 |
| Clients `v-references-2` | 153–187 | `.v-references-2` 417–438 |
| Services `v-services-2` | 189–246 | `.v-services-2` 164–190 |
| Témoignages `v-testimonials-1` | 248–272 | `.v-testimonials-1` 478–497 |
| Équipe `v-team-3` | 274–304 | `.v-team-3` 568–596 |
| Actualités `v-actualites-1` | 306–360 | `.v-actualites-1` 634+ |
| Contact `v-contact-4` + footer | 361–fin | `.v-contact-4` 818+ |

---

## Task 0 : Fondation

### 0.1 — Vérifier Framer Motion installé

**Files:** `package.json`

- [ ] **Step 1 : vérifier la présence**

Run: `cd ServicImmo && node -e "console.log(require('./package.json').dependencies['framer-motion'] ?? 'ABSENT')"`
Expected: une version (ex. `^11.15.0`). Si `ABSENT` :

- [ ] **Step 2 : installer**

Run: `corepack pnpm add framer-motion`

- [ ] **Step 3 : commit** (si install)

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: ensure framer-motion dependency"
```

### 0.2 — Polices Sora / Inter / Fredoka scopées au marketing

**Files:** Modify `app/(marketing)/layout.tsx`, `app/globals.css`

- [ ] **Step 1 : charger les polices dans le layout marketing**

Remplacer le contenu de `app/(marketing)/layout.tsx` par (en conservant les imports d'éléments existants — Header/Footer seront branchés en 0.6) :

```tsx
import type { ReactNode } from "react";
import { Sora, Inter, Fredoka } from "next/font/google";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["600"], display: "swap" });

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${sora.variable} ${inter.variable} ${fredoka.variable} font-[family-name:var(--font-inter)] text-[color:var(--color-home-ink)] [background:var(--color-home-bg)]`}>
      {children}
    </div>
  );
}
```

> Note : pas de token `@theme` à ajouter pour les polices — les composants référencent directement la variable `next/font` via `font-[family-name:var(--font-sora)]` (idem inter/fredoka). Ajouter un token `@theme` ici créerait une référence circulaire.

- [ ] **Step 2 : type check**

Run: `corepack pnpm typecheck`
Expected: PASS (0 erreur).

- [ ] **Step 3 : commit**

```bash
git add "app/(marketing)/layout.tsx"
git commit -m "feat(marketing): scope Sora/Inter/Fredoka fonts to marketing layout"
```

### 0.3 — Tokens manquants (splash crème/pétrole)

**Files:** Modify `app/globals.css`

- [ ] **Step 1 : ajouter les tokens splash dans `@theme inline`** (sous le bloc `--color-home-*`)

```css
  --color-si-creme: #f4f1e8;
  --color-si-petrole: #00585f;
  --color-si-lime: #e6e900;
```

- [ ] **Step 2 : commit**

```bash
git add app/globals.css
git commit -m "feat(marketing): add splash color tokens"
```

### 0.4 — Copier les assets images

**Files:** Create `public/img/si/*`, `public/img/logos/*`

- [ ] **Step 1 : copier**

Run (PowerShell) :
```powershell
$src="Template LP/servicimmo-lp/img"; $dst="ServicImmo/public/img"
New-Item -ItemType Directory -Force "$dst/si","$dst/logos" | Out-Null
Copy-Item "$src/si/*" "$dst/si/" -Force
Copy-Item "$src/logos/*" "$dst/logos/" -Force
```

- [ ] **Step 2 : vérifier**

Run: `ls ServicImmo/public/img/si | wc -l` (≥ 18 fichiers) et `ls ServicImmo/public/img/logos | wc -l` (≥ 11).

- [ ] **Step 3 : commit**

```bash
git add public/img/si public/img/logos
git commit -m "chore(marketing): import maquette images into public"
```

### 0.5 — Composant `<Reveal>`

**Files:** Create `components/marketing/Reveal.tsx`

- [ ] **Step 1 : créer le composant** (code complet)

```tsx
"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "left" | "right" | "zoom";

const FROM: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 28 },
  left: { x: -32 },
  right: { x: 32 },
  zoom: { scale: 0.94 },
};

type RevealProps = {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
};

/** Apparition au scroll — reproduit les `data-reveal` de la maquette. */
export function Reveal({ children, direction = "up", delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, ...(reduce ? {} : FROM[direction]) },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.22, 0.61, 0.36, 1], delay },
    },
  };
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2 : type check** — Run: `corepack pnpm typecheck` → PASS

- [ ] **Step 3 : commit**

```bash
git add components/marketing/Reveal.tsx
git commit -m "feat(marketing): add Reveal scroll-animation primitive"
```

### 0.6 — Hook `useCountUp`

**Files:** Create `hooks/useCountUp.ts`

- [ ] **Step 1 : créer le hook** (code complet)

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

/** Compteur animé déclenché à l'entrée en viewport (easing ease-out cubique). */
export function useCountUp(target: number, durationMs = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / durationMs);
            setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, durationMs]);

  return { ref, value };
}
```

- [ ] **Step 2 : type check** → PASS
- [ ] **Step 3 : commit**

```bash
git add hooks/useCountUp.ts
git commit -m "feat(marketing): add useCountUp hook"
```

### 0.7 — Header (nav) + Footer shell

**Files:** Modify `components/marketing/Header.tsx`, Create `components/marketing/Footer.tsx` (ou modifier l'existant)

Source : header dans `home.html` (chercher `si-h` / nav, début du body) + CSS `home.css` lignes ~5–25. Footer : `home.html` fin de page (`v-contact-4` + footer).

- [ ] **Step 1 : réécrire `Header.tsx`** — nav fidèle maquette : logo « Servic**immo** » (span vert sur `immo`), liens (Accueil, Services, Équipe, Actualités, Contact), tel `02 47 47 01 23`, CTA « Commencer mon devis ». Classes Tailwind mappées sur tokens `--color-home-*`, police titres `font-[family-name:var(--font-sora)]`. Sticky top, fond `--color-home-bg`, bordure basse `--color-home-line`. Le CTA appellera `useQuoteModal().open()` (branché en Task 9 ; pour l'instant `href="/devis"`).

- [ ] **Step 2 : créer `Footer.tsx`** — pied de page maquette (coordonnées, liens, mentions). Statique.

- [ ] **Step 3 : monter Header/Footer dans le layout** — dans `app/(marketing)/layout.tsx`, encadrer `{children}` par `<Header />` et `<Footer />`.

- [ ] **Step 4 : type check** → PASS

- [ ] **Step 5 : vérif visuelle** — `corepack pnpm dev`, ouvrir `http://localhost:3000/`. **Attendre OK utilisateur** : header + footer ressemblent à la maquette.

- [ ] **Step 6 : commit**

```bash
git add "app/(marketing)/layout.tsx" components/marketing/Header.tsx components/marketing/Footer.tsx
git commit -m "feat(marketing): rewrite header nav + footer to match maquette"
```

---

## Task 1 : Hero (`v-hero-3`) — section de référence

**Files:** Modify `components/marketing/Hero.tsx`, Modify `app/(marketing)/page.tsx`

> Cette tâche sert de **patron** pour toutes les sections suivantes : porter le markup de `home.html`, mapper les classes CSS de `labs-variants.css` en utilitaires Tailwind sur tokens `--color-home-*`, envelopper les blocs animés (`data-reveal`) dans `<Reveal>`, images en `next/image`.

- [ ] **Step 1 : lire la source** — `home.html:90–121` + CSS `.v-hero-3` (labs-variants.css:58–91).

- [ ] **Step 2 : réécrire `Hero.tsx`** (patron ci-dessous, à compléter fidèlement) :

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";

import { Reveal } from "./Reveal";
import { useCountUp } from "@/hooks/useCountUp";

export function Hero() {
  const years = useCountUp(28);
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-home-bg)]">
      <div className="relative z-[1] mx-auto max-w-[1200px] px-6 pt-10 pb-16 md:px-12">
        <div className="grid items-center gap-12 md:grid-cols-[1.05fr_.95fr]">
          <Reveal direction="left">
            <span className="font-[family-name:var(--font-sora)] text-[13px] font-semibold tracking-[0.04em] text-[color:var(--color-home-saf-dark)]">
              Diagnostic immobilier · Tours depuis 1998
            </span>
            <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[clamp(40px,5.4vw,76px)] leading-[1.02] font-extrabold tracking-[-0.03em] text-[color:var(--color-home-ink)]">
              Vos diagnostics<br />obligatoires <em className="not-italic text-[color:var(--color-home-saf-dark)]">identifiés</em><br />en 2&nbsp;minutes
            </h1>
            {/* lead, CTA (Commencer mon devis → /devis pour l'instant), tel, meta badges : porter depuis home.html:97-106 */}
          </Reveal>
          <Reveal direction="right">
            {/* visual : photo clippée hero1.jpg + tag count-up */}
            <div className="relative">
              <Image src="/img/si/hero1.jpg" alt="Bien immobilier diagnostiqué à Tours" width={1600} height={1063} priority className="h-[560px] w-full rounded-[32px] object-cover [clip-path:polygon(14%_0,100%_0,100%_100%,0_100%)]" />
              <div className="absolute bottom-12 -left-6 rounded-[24px] bg-[color:var(--color-home-ink)] px-7 py-5 text-white">
                <span ref={years.ref} className="font-[family-name:var(--font-sora)] text-[42px] font-extrabold text-[color:var(--color-home-saf)]">{years.value}</span>
                <em className="block not-italic text-[13px] text-white/80">ans en Indre-et-Loire</em>
              </div>
            </div>
          </Reveal>
        </div>
        {/* certs strip : porter home.html:113-119 (Qualixpert/Allianz/FNAIM/iCert) */}
      </div>
    </section>
  );
}
```

- [ ] **Step 3 : rendre le Hero dans la page** — `app/(marketing)/page.tsx` : importer et placer `<Hero />` en premier (retirer l'ancien composant D3 correspondant).

- [ ] **Step 4 : type check** → PASS

- [ ] **Step 5 : vérif visuelle** — `http://localhost:3000/`. **Attendre OK utilisateur** : héros identique à `home.html` (titre, CTA, certs, photo clippée, compteur 28).

- [ ] **Step 6 : commit**

```bash
git add components/marketing/Hero.tsx "app/(marketing)/page.tsx"
git commit -m "feat(marketing): rewrite hero to match home.html (v-hero-3)"
```

---

## Tasks 2–7 : sections suivantes (même patron que Task 1)

Pour **chaque** section ci-dessous, répéter les 6 steps de la Task 1 : lire la source (lignes indiquées) → créer/réécrire le composant en mappant `labs-variants.css` sur Tailwind + tokens `--color-home-*` → blocs `data-reveal` dans `<Reveal>` → images `next/image` (depuis `/img/si|logos`) → rendre dans `page.tsx` → typecheck → **vérif visuelle (attendre OK)** → commit.

### Task 2 : Pourquoi Servicimmo (`About.tsx`)
- Source : `home.html:123–151`, CSS `.v-about-1` 248–268.
- Spécifs : grille média/copy, encart flottant « 28 ans » (réutiliser `useCountUp`), badge « Certifiés & assurés », liste 4 points, 2 CTA.
- Create `components/marketing/About.tsx` ; rendre après Hero.
- Commit : `feat(marketing): add About section (v-about-1)`.

### Task 3 : Clients marquee (`ClientsMarquee.tsx`)
- Source : `home.html:153–187`, CSS `.v-references-2` 417–438 (incluant le keyframe du marquee).
- Spécifs : bandeau « Nos clients » + double piste de logos en défilement **CSS** (porter le keyframe dans `app/globals.css` `@keyframes marquee` + masque dégradé latéral). Logos depuis `/img/logos/*`.
- Commit : `feat(marketing): add clients marquee (v-references-2)`.

### Task 4 : Services (`Services.tsx`)
- Source : `home.html:189–246`, CSS `.v-services-2` 164–190.
- Spécifs : 3 lignes numérotées (01/02/03) alternées (`rev`), tag, icône, plus de détail, foot CTA « Obtenir mon devis complet ». **Images** : 01 = `proj2.jpg` (déjà corrigé dans la maquette), 02 = `proj3.jpg`, 03 = `proj1.jpg`.
- Commit : `feat(marketing): add Services section (v-services-2)`.

### Task 5 : Témoignages (`Testimonials.tsx`)
- Source : `home.html:248–272`, CSS `.v-testimonials-1` 478–497.
- Spécifs : carte centrée (avatar, 5 étoiles, citation, nom « Maître Laurent D. ») + avatars éparpillés (`scatter`, positionnés en absolute — porter les positions depuis le CSS). `min-height` réduit déjà calé dans la maquette (430px).
- Commit : `feat(marketing): add Testimonials section (v-testimonials-1)`.

### Task 6 : Équipe (`Team.tsx`)
- Source : `home.html:274–304`, CSS `.v-team-3` 568–596.
- Spécifs : photo feature (figcaption rôle + nom + citation) + roster cliquable (liste de personnes ; au clic, mettre à jour la photo/nom/rôle/citation). **Client component** (état sélection). Noms = ceux de la maquette (Julien Moreau = Responsable technique, Camille Rousseau, Thomas Lefèvre, Laura Petit, Nicolas Faure, Sarah Benoît). Photos `/img/si/team1..6.jpg`.
- Commit : `feat(marketing): add Team section (v-team-3)`.

### Task 7 : Actualités + Contact + Footer (`Actualites.tsx`, `Contact.tsx`)
- Source : `home.html:306–360` (actus) + `361–fin` (contact + footer), CSS `.v-actualites-1` 634+ et `.v-contact-4` 818+.
- Spécifs : actus = grille d'articles (images `/img/si/blog1..3.jpg`) ; contact = bloc CTA final (formulaire/coordonnées). Footer déjà posé en 0.7 → compléter si besoin.
- Commit : `feat(marketing): add Actualites + Contact sections`.

À la fin de la Task 7 : la home complète est rendue, **vérif visuelle globale** (attendre OK) avant le splash.

---

## Task 8 : Splash d'intro (`SplashIntro.tsx`)

**Files:** Create `components/marketing/SplashIntro.tsx`, Modify `app/(marketing)/layout.tsx`

Source : `Template LP/servicimmo-lp/js/servicimmo-splash.js` (logique build SVG + portes) + `css/servicimmo-splash.css`.

- [ ] **Step 1 : porter la logique en composant client** — `SplashIntro.tsx` (`"use client"`) : reconstruire le SVG maison (3 paths animables) + 2 portes, variante `tracedoors`, fond crème (`--color-si-creme`). Jouer une fois par session (`sessionStorage.getItem('si-splash-seen')`). Respecter `prefers-reduced-motion`. Les keyframes (tracé + ouverture portes) vont dans `app/globals.css` (`@keyframes si-*`).

- [ ] **Step 2 : monter dans le layout** — ajouter `<SplashIntro />` en tête du `MarketingLayout` (avant Header).

- [ ] **Step 3 : type check** → PASS

- [ ] **Step 4 : vérif visuelle** — recharger `http://localhost:3000/` : le splash joue puis s'efface sur la home. **Attendre OK.**

- [ ] **Step 5 : commit**

```bash
git add components/marketing/SplashIntro.tsx app/globals.css "app/(marketing)/layout.tsx"
git commit -m "feat(marketing): port splash intro animation"
```

---

## Task 9 : Modal questionnaire (Variante 5 — stepper compact)

**Files:** Create `components/questionnaire/QuestionnaireModal.tsx`, Create `components/questionnaire/QuoteModalProvider.tsx`, Modify `components/questionnaire/QuestionnaireApp.tsx`, Modify `app/(marketing)/layout.tsx`, Modify `components/marketing/Header.tsx` (+ tout CTA « devis »)

### 9.1 — Rendre `QuestionnaireApp` encastrable

- [ ] **Step 1 : ajouter la prop `embedded`** — Modifier `components/questionnaire/QuestionnaireApp.tsx` :
  - Signature : `export function QuestionnaireApp({ embedded = false }: { embedded?: boolean } = {})`.
  - Ne pas rendre `<QuestionnaireHeader />` si `embedded`.
  - Conteneur racine : `className={embedded ? "h-full bg-[var(--color-devis-cream)] font-sans text-[var(--color-devis-ink)]" : "min-h-[100dvh] bg-[var(--color-devis-cream)] font-sans text-[var(--color-devis-ink)]"}` (et idem pour le placeholder `!mounted`).

- [ ] **Step 2 : type check** → PASS. Vérifier que `/devis` (non-embedded) fonctionne toujours.
- [ ] **Step 3 : commit** — `refactor(questionnaire): make QuestionnaireApp embeddable`.

### 9.2 — Provider d'ouverture + Modal

- [ ] **Step 1 : `QuoteModalProvider.tsx`** (client) — contexte React exposant `{ open: () => void; close: () => void; isOpen: boolean }`. Rend `<QuestionnaireModal open={isOpen} onClose={close} />`. Hook `useQuoteModal()`.

- [ ] **Step 2 : `QuestionnaireModal.tsx`** (client) — code patron :

```tsx
"use client";

import { useEffect } from "react";
import { XIcon } from "lucide-react";

import { useQuestionnaireStore } from "@/lib/stores/questionnaire";
import { QuestionnaireApp } from "./QuestionnaireApp";

const STEPS = ["Projet", "Bien", "Email", "Technique", "Délai", "Récap"];
// map currentScreen → index actif (entry→0, filling→1, recap→5, thanks→5)
const SCREEN_INDEX: Record<string, number> = { entry: 0, filling: 1, recap: 5, thanks: 5 };

export function QuestionnaireModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const screen = useQuestionnaireStore((s) => s.currentScreen);
  const active = SCREEN_INDEX[screen] ?? 0;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(15,30,58,.55)] p-6 backdrop-blur-md" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative flex h-[min(680px,92vh)] w-[min(1080px,96vw)] overflow-hidden rounded-[26px] bg-[var(--color-devis-cream)] shadow-[0_40px_100px_rgba(15,30,58,.4)]">
        <button onClick={onClose} aria-label="Fermer" className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/70 text-[var(--color-devis-muted)] hover:bg-white">
          <XIcon className="h-5 w-5" />
        </button>
        <nav className="flex w-16 flex-shrink-0 flex-col items-center gap-4 border-r border-[var(--color-devis-line)] py-8">
          {STEPS.map((label, i) => (
            <span key={label} title={label} className={`grid h-[30px] w-[30px] place-items-center rounded-full border text-[13px] font-bold ${i <= active ? "border-[var(--color-devis-lime,#a4c425)] bg-[#a4c425] text-white" : "border-[var(--color-devis-line)] text-[var(--color-devis-muted)]"}`}>{i + 1}</span>
          ))}
        </nav>
        <div className="min-w-0 flex-1 overflow-y-auto">
          <QuestionnaireApp embedded />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : brancher le provider** — dans `app/(marketing)/layout.tsx`, envelopper le contenu marketing par `<QuoteModalProvider>…</QuoteModalProvider>`.

- [ ] **Step 4 : câbler les CTA** — remplacer dans `Header.tsx` (et Hero/About/Services CTAs « devis ») le `href="/devis"` par un `<button onClick={() => open()}>` via `useQuoteModal()`. Garder `/devis` accessible en direct (deep-link).

- [ ] **Step 5 : type check** → PASS

- [ ] **Step 6 : vérif visuelle** — cliquer « Commencer mon devis » : le modal s'ouvre (stepper compact à gauche, écran d'entrée à droite), avancer entry→filling, fermer (croix/ESC/overlay), rouvrir → reprise localStorage. **Attendre OK.**

- [ ] **Step 7 : commit**

```bash
git add components/questionnaire/QuestionnaireModal.tsx components/questionnaire/QuoteModalProvider.tsx "app/(marketing)/layout.tsx" components/marketing/Header.tsx
git commit -m "feat(questionnaire): mount QuestionnaireApp in compact-stepper modal"
```

---

## Self-review (couverture spec)

- §3 mapping sections → Tasks 1–7 ✓
- §4 tokens/polices → Tasks 0.2, 0.3 ✓
- §5 animations (Reveal, marquee, count-up, splash) → 0.5, 0.6, 3, 8 ✓
- §6 contenu statique + assets → 0.4 + sections ✓
- §7 modal Variante 5 + embedded + /devis fallback → Task 9 ✓
- §8 séquence verticale avec vérif par palier → Tasks 0→9 ✓
- §10 typecheck à chaque tâche, moteur questionnaire inchangé ✓

## Notes d'exécution

- **Fidélité** : la source visuelle est `home.html` — comparer à l'œil à chaque palier, ne pas inventer.
- **Pas de `any`**, path aliases `@/…`, fichiers < 200 lignes (découper un composant qui gonfle).
- **Ne pas committer `.env.local`**.
- Les composants « D3 » remplacés (`Why.tsx`, `Specialties.tsx`, `MapCard.tsx`, `Audiences.tsx`, `ServicesByCategory.tsx`, `Zones.tsx`, `TrustBar.tsx`) : retirer leurs usages de `page.tsx` au fur et à mesure ; supprimer les fichiers devenus morts en fin de Task 7 (commit `chore: remove obsolete D3 marketing components`).
