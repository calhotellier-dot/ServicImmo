# Brief Claude Design — Home servicimmo.fr

**À coller tel quel dans [Claude Design](https://claude.ai) (nouveau projet, onglet "Design") pour générer une home distinctive. Ensuite : bouton "Transférer à Claude Code" → agent local.**

---

## Contexte

Je refonds le site **servicimmo.fr**, cabinet de diagnostic immobilier à Tours (France) actif depuis 1998. Le site actuel est un PHP daté, sans personnalité. La cible : particuliers vendeurs/bailleurs 45-70 ans + prescripteurs B2B (notaires, syndics, agences).

Produit central : un **questionnaire intelligent** qui identifie les diagnostics obligatoires (DPE, amiante, plomb, termites…) et donne une estimation de prix sous 2 h.

## Objectif de cette home

Convaincre en 10 secondes que **Servicimmo est sérieux, expert, moderne, et que démarrer prend 2 minutes**. La home doit renvoyer vers `/devis` aussi souvent que possible sans être agressive.

## Ton et ambiance

- Professionnel mais chaleureux (pas corporate froid type Big 4)
- Pédagogique (on explique le "pourquoi" des diagnostics)
- Rassurant (28 ans d'expérience, certifications, local)
- Un peu "tech" mais accessible à un senior qui vend sa maison

## Références visuelles (inspirations)

- **[Alan](https://alan.com)** — clarté + humanité
- **[Qonto](https://qonto.com)** — sobriété B2B premium
- **[Doctolib](https://doctolib.fr)** — parcours step-by-step rassurant
- Éviter le style "dashboard SaaS générique IA"

## Contraintes techniques (à respecter pour que l'export soit utilisable)

- **Framework** : Next.js 16 (App Router), React 19, TypeScript strict
- **Styling** : **Tailwind CSS v4** uniquement (pas de CSS-in-JS)
- **UI kit** : shadcn/ui **new-york**, base-color **neutral**
  - Utiliser `var(--primary)`, `var(--foreground)`, `var(--muted-foreground)`, `var(--border)`, `var(--background)`, `var(--card)`, `var(--primary-foreground)`
- **Icônes** : **Lucide React** uniquement (`lucide-react`)
- **Fonts** : Geist (déjà configuré)
- **Animations** : Framer Motion autorisé, avec parcimonie
- **Pas d'images externes** (pas d'Unsplash, pas de photos stock) : on n'a pas encore de banque d'images.
  Utiliser des illustrations géométriques pures (SVG) ou des blocs de couleur/texture.
- **Composants existants à réutiliser** :
  - `<Button>` (variants : `default`, `outline`, `ghost`, `link` ; sizes : `sm`, `default`, `lg`)
  - Structure attendue : tous les liens internes via `next/link`

## Sections attendues (ordre)

1. **Hero**
   - Badge / overline : "Diagnostic immobilier à Tours depuis 1998"
   - H1 percutant — promesse : "identifier vos diagnostics en 2 minutes"
   - Sous-titre en 2 phrases max
   - CTA principal : "Commencer mon devis" → `/devis`
   - CTA secondaire : téléphone `02 47 47 01 23`
   - Rangée "trust" : 4 certifications (Qualixpert, Allianz, FNAIM Diagnostic, I.Cert) — en **texte stylisé** (pas de logos image)

2. **Comment ça marche** — 4 étapes horizontales
   1. Questionnaire (2 min)
   2. Diagnostics identifiés
   3. Devis sous 2h ouvrées
   4. Intervention sous 48h

3. **Pourquoi Servicimmo** — 2 colonnes
   - Gauche : récit court (28 ans, équipe locale, veille depuis 2017)
   - Droite : 4 chiffres clés ("28 ans", "10 000+ diagnostics", "48h délai moyen", "100 % tarifs annoncés")

4. **CTA final** — un dernier push vers `/devis`, centré

5. (Pas de footer — déjà géré par le layout parent)

## Copy FR à utiliser (verbatim autorisé)

### Hero
> **Identifiez vos diagnostics obligatoires en 2 minutes.**
>
> Vente, location, travaux — notre questionnaire intelligent identifie les
> diagnostics réglementaires pour votre bien et vous donne une estimation
> tarifaire immédiate. Devis définitif sous 2 h ouvrées.

### Sous-section "Pourquoi" — récit
> Cabinet indépendant basé à Tours depuis 1998, nous intervenons en
> Indre-et-Loire et départements limitrophes. Nous sommes certifiés
> Qualixpert, assurés Allianz, et membres de la FNAIM Diagnostic.
>
> Notre équipe publie une veille réglementaire depuis 2017 et accompagne
> aussi bien les particuliers que les notaires, syndics et agences
> immobilières locales.

### CTA final
> **Prêt à démarrer votre demande ?**
>
> En 2 minutes vous saurez exactement ce dont vous avez besoin et à quel prix.
> Sans engagement, sans création de compte.

## À livrer par Claude Design

- Un seul composant `HomePage` (Server Component par défaut, `"use client"` uniquement si besoin de Framer Motion)
- Contenu dans `app/(marketing)/page.tsx`
- Import de `<Button>` depuis `@/components/ui/button`
- Utilisation de `<Link>` de `next/link` pour tous les liens internes
- Classes Tailwind v4 uniquement (pas d'inline styles)

## Fallback déjà en place

Une version "fallback" propre mais moins distinctive est déjà codée dans `app/(marketing)/page.tsx`. L'export Claude Design viendra **remplacer** ce fichier.

---

**→ Clique "Transférer à Claude Code" → "Envoyer à l'agent de codage local" quand tu es prêt.**
