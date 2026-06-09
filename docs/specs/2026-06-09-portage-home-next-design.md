# Spec — Portage de la home (`home.html`) vers le site vitrine Next.js

> Statut : à valider. Auteur : session du 2026-06-09.
> Contexte : voir `CLAUDE.md`, `QUESTIONNAIRE_FLOW.md`, et la maquette `Template LP/servicimmo-lp/home.html`.

## 1. Objectif

Reproduire **fidèlement** la maquette `home.html` (direction artistique validée) dans le site vitrine Next.js (`app/(marketing)/`), et intégrer le questionnaire de devis **existant** via un **modal premium**. Sert de support de présentation client et de base de la V2.

## 2. Périmètre

**Inclus :**
- Page d'accueil `(marketing)/page.tsx` : 8 sections fidèles à `home.html`.
- Système de tokens + polices (ajout **Fredoka**, **Sora**, **Inter** scopés au marketing).
- Primitives partagées : `<Reveal>` (anim au scroll), `<SplashIntro>`, count-up, marquee CSS.
- Modal questionnaire (**Variante 5 — stepper compact**) hébergeant `QuestionnaireApp`.
- Contenu **statique** (mirroring `home.html`), assets copiés dans `public/`.

**Hors périmètre (lots ultérieurs) :**
- Branchement Supabase + seed (`services`/`articles`/`cities`).
- Détail des autres pages (services, zones, actualités, contact).
- Déploiement Coolify.
- Refactor interne des écrans questionnaire (`FillingScreen` 993 l., `RecapScreen` 470 l.).

## 3. Mapping sections `home.html` → composants Next

| Section maquette | Composant (`components/marketing/`) | Action |
|---|---|---|
| `v-hero-3` | `Hero.tsx` | réécriture (héros clair, photo clippée, certs, count-up 28) |
| `v-about-1` (Pourquoi) | `Why.tsx` → `About.tsx` | réécriture (média + float 28 ans + 4 points) |
| `v-references-2` (Clients) | `ClientsMarquee.tsx` | nouveau (marquee CSS logos) |
| `v-services-2` | `Services.tsx` | réécriture (3 lignes numérotées + foot CTA) |
| `v-testimonials-1` | `Testimonials.tsx` | nouveau (carte + avatars éparpillés) |
| `v-team-3` | `Team.tsx` | nouveau (photo feature + roster cliquable) |
| `v-actualites-1` | `Actualites.tsx` | réécriture |
| `v-contact-4` + footer | `Contact.tsx` / `Footer.tsx` | réécriture |
| header/nav | `Header.tsx` | réécriture (nav maquette) |

Chaque composant **< 200 lignes**. Les composants « D3 » actuels (autre DA) sont remplacés, pas conservés en double.

## 4. Tokens & polices

- **Couleurs** : réutiliser les `--color-home-*` existants (valeurs identiques à `--si-*` de la maquette). Ajouter les tokens manquants au besoin (crème/pétrole du splash) dans `app/globals.css` `@theme`. **Ne pas** réintroduire un second jeu `--si-*` (éviter deux systèmes).
- **Polices** : ajouter **Sora** (titres), **Inter** (corps), **Fredoka** (logo/splash) via `next/font`, exposées en `--font-sora` / `--font-inter` / `--font-fredoka`. **Scopées au layout marketing** (`(marketing)/layout.tsx`) pour ne pas toucher l'app/admin (qui garde Geist).
- Le questionnaire conserve sa palette `--color-devis-*` (crème/lime/sage).

## 5. Animations (Framer Motion + CSS)

- `<Reveal direction="up|left|right|zoom">` : client component, Framer Motion `whileInView` (`once: true`), mappe les `data-reveal` de la maquette. Respecte `prefers-reduced-motion`.
- **Marquee** clients : keyframes CSS (pas de JS).
- **Count-up** : hook `useCountUp`, déclenché à l'entrée en vue.
- **Splash** : `<SplashIntro>` client, port de `servicimmo-splash.js` (build SVG + portes), monté dans le layout marketing, joué une fois/session (`sessionStorage`).

## 6. Contenu (statique)

- Copy + images codés en dur dans chaque composant, **identiques à `home.html`**.
- **Assets** : copier `Template LP/servicimmo-lp/img/si/*` et `img/logos/*` vers `ServicImmo/public/img/si/` et `public/img/logos/`. Servis via `next/image`.

## 7. Modal questionnaire (Variante 5)

- Nouveau `QuestionnaireModal.tsx` (client) : overlay assombri + carte crème large + **stepper vertical compact (1–6)** à gauche + zone contenu hébergeant `<QuestionnaireApp embedded />`.
- **Refactor `QuestionnaireApp`** : prop `embedded?: boolean` → masque son `QuestionnaireHeader` propre et retire `min-h-[100dvh]`. Le modal fournit la croix + le stepper (qui lit `currentScreen` du store Zustand pour l'état actif).
- **Déclenchement** : provider léger (contexte React ou event custom) ; les CTA (« Commencer mon devis », « Demander un devis ») ouvrent le modal. **Route `/devis` conservée** en deep-link / fallback (rend `QuestionnaireApp` pleine page, non-embedded).
- Scroll-lock + ESC + clic overlay pour fermer. Persistance localStorage déjà gérée par le store.

## 8. Séquence de build (tranches verticales)

Chaque palier = build + **type check** + **vérif visuelle par l'utilisateur** avant de continuer.

0. **Fondation** : polices scopées marketing + tokens manquants + copie assets + `<Reveal>` + shell (Header nav + Footer). *Critère : header/footer maquette OK, une section témoin révèle au scroll.*
1. **Hero** — *identique à `home.html` à l'œil : CTA, certs, photo clippée, count-up.*
2. **Pourquoi** (about).
3. **Clients** (marquee).
4. **Services** (lignes numérotées).
5. **Témoignages**.
6. **Équipe** (roster cliquable).
7. **Actualités + Contact + Footer**.
8. **Splash intro**.
9. **Modal questionnaire** (Variante 5) + refactor `embedded` + branchement CTAs. *Critère : parcours entry→filling→recap→thanks dans le modal, fermeture, reprise localStorage.*

## 9. Risques & garde-fous

- **Fidélité** (clip-path, marquee, splash) → vérif à l'œil de l'utilisateur à chaque palier (il fait ses vérifs runtime lui-même).
- **Polices** → scoper au marketing pour ne pas casser app/admin.
- **`/devis`** → ne pas casser la route en rendant `QuestionnaireApp` encastrable (prop optionnelle, défaut = non-embedded).
- **Tokens** → un seul système (`--color-home-*`).

## 10. Tests

- `pnpm` type check après chaque tranche (pas de `any`).
- Pas de tests UI ajoutés ; vérif visuelle utilisateur.
- Moteur questionnaire (`lib/core/diagnostics/*`) **inchangé** → ses tests Vitest restent verts.
