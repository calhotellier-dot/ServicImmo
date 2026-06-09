# Brief Claude Design — Questionnaire de devis /devis

**À coller dans [Claude Design](https://claude.ai) (Pro / Max / Team). L'objectif est d'itérer avec toi sur le canevas, puis cliquer "Transférer à Claude Code" → agent local.**

---

## 🎯 Objectif unique

Remplacer un questionnaire de devis de diagnostic immobilier **en 6 étapes** par un parcours **en 1 ou 2 pages maximum**, fluide, sans live-reveal des diagnostics (le récap est une **surprise de fin**), avec une bifurcation visuelle claire entre les 5 scénarios : **Vente / Location / Travaux / Copropriété / Autre**.

**→ Produis 3 variantes visuelles distinctes pour qu'on choisisse.**

---

## 📋 Contexte produit

**Client :** Servicimmo, cabinet de diagnostic immobilier à Tours (Indre-et-Loire), 28 ans d'existence.

**Situation actuelle :** formulaire PHP legacy en un seul bloc, 30+ champs visibles d'un coup, taux d'abandon estimé >70 %. Aucune personnalisation selon le type de projet (vente vs location).

**Nouvelle proposition de valeur :** 2 minutes pour identifier ses diagnostics obligatoires + fourchette de prix + être rappelé sous 2 h ouvrées.

**Cible principale :** particulier 45-70 ans qui vend ou loue sa maison / appartement en Indre-et-Loire. Non-tech. Doit pouvoir faire son devis depuis son canapé avec un iPhone en 2 minutes.

**Ton :** professionnel, chaleureux, pédagogique, rassurant. **Pas corporate froid**. Pas "dashboard SaaS générique IA".

---

## 🔑 Contrainte UX la plus importante

> **1 ou 2 pages maximum. Zéro étapes 3-4-5-6 distinctes.**

L'actuelle implémentation a 6 étapes avec une progress bar. On **abandonne ce modèle**. Options à explorer :

- **Variante A — Single-page** : toutes les questions sur un écran, sections accordéon ou cartes, progressive disclosure selon le projet.
- **Variante B — 2 pages** : page 1 "Votre bien" (toutes les questions produit) + page 2 "Votre contact + récap" (email, coordonnées, diagnostics calculés, prix estimé, submit).

Tu choisis la meilleure approche par variante visuelle, en justifiant.

---

## 🔀 Les 5 bifurcations produit (point critique)

Le parcours change fortement selon le choix initial. **Je veux que ça se voie dès l'entrée** — probablement via 5 grandes cards cliquables en ouverture.

### Branche 1 — Vente (cas le plus fréquent, ~60 %)
- Questions : type de bien, adresse, surface, pièces, copropriété, date permis, chauffage, gaz +15 ans, élec +15 ans, installation gaz présente, urgence, notes
- Diagnostics calculés en backend : DPE, Plomb (si <1949), Amiante (si <1997), Termites (si 37), Gaz (si +15), Élec (si +15), Carrez (si copro), ERP

### Branche 2 — Location (~20 %)
- Questions identiques à Vente **+ vide/meublé/saisonnier** (impact Loi Boutin)
- Diagnostics : DPE, DAPP (si <1997, remplace Amiante), Gaz, Élec, Boutin (si vide), ERP, **État des Lieux entrant/sortant**
- **Pas de Termites** (vente only), **pas de Carrez**

### Branche 3 — Travaux / Rénovation (~5 %)
- Questions : type de bien, adresse, surface, **type de travaux (rénovation / démolition / voirie)**, date permis
- Diagnostics : Amiante avant travaux (RAT) si <1997, Plomb avant travaux si <1949
- **Pas de DPE, pas d'ERP, pas de gaz/élec**

### Branche 4 — Gestion copropriété / syndic (~5 %)
- Questions : adresse immeuble, date permis, nombre de lots (nouveau champ à ajouter)
- Diagnostics : DTA parties communes, DPE collectif

### Branche 5 — Autre (~10 %)
- Champ libre (textarea) + email + téléphone → traitement humain

**👉 La différentiation doit être VISIBLE dès le premier écran.** Peut-être 5 cards avec icône + micro-description + (optionnel) chiffre "3 diagnostics en moyenne" pour créer de la confiance.

---

## 📝 Liste exhaustive des questions à collecter

### Bloc A — Le projet (choix branche)
| Champ | Type | Options |
|---|---|---|
| project_type | Sélecteur visuel 5 cards | `sale` / `rental` / `works` / `coownership` / `other` |

### Bloc B — Le bien (tous projets sauf "other")
| Champ | Type | Options |
|---|---|---|
| property_type | Radio cards | Maison / Appartement / Immeuble entier / Local commercial / Parties communes copropriété / Terrain / Cave-garage-dépendance / Autre |
| address | Input avec autocomplete BAN (API `api-adresse.data.gouv.fr/search/`) | Remplit automatiquement code postal + ville |
| postal_code | Input 5 chiffres | Auto depuis BAN, éditable |
| city | Input texte | Auto depuis BAN, éditable |
| surface | Input number + suffixe `m²` | Entier positif |
| rooms_count | Select | 1 (studio) / 2 / 3 / 4 / 5 / 6 / 7+ |
| is_coownership | Radio | Oui / Non / Je ne sais pas |

**Alerte à afficher si `postal_code` hors 37 / 41 / 36 / 72 / 49 / 86** : *"Nous intervenons principalement en Indre-et-Loire. Continuez quand même, nous vérifierons notre disponibilité dans votre secteur."*

### Bloc C — Caractéristiques techniques (sale / rental / works / coownership)
| Champ | Type | Options |
|---|---|---|
| permit_date_range | Radio cards | Avant janvier 1949 / Entre 1949 et juillet 1997 / Après juillet 1997 / Je ne sais pas |
| heating_type | Select | Gaz / Électrique / Bois / Fioul / Pompe à chaleur / Autre ou mixte / Je ne sais pas |
| gas_installation | Select | Aucune / Gaz de ville / Citerne extérieure / Bouteilles / Compteur sans abo / **Autre** / Je ne sais pas |
| gas_over_15_years | Radio | Oui / Non / Je ne sais pas |
| electric_over_15_years | Radio | Oui / Non / Je ne sais pas |

### Bloc C-bis — Spécifique location
| Champ | Type | Options |
|---|---|---|
| rental_furnished | Radio | Logement vide / Meublé / Saisonnier / Je ne sais pas |

### Bloc C-ter — Spécifique travaux
| Champ | Type | Options |
|---|---|---|
| works_type | Radio cards | Rénovation / Démolition / Voirie-enrobés / Autre / Je ne sais pas |

### Bloc D — Délai et notes
| Champ | Type | Options |
|---|---|---|
| urgency | Radio | Dès que possible (<48 h) / Sous une semaine / Sous deux semaines / Dans le mois / Pas pressé |
| notes | Textarea facultatif | Max 2000 caractères |
| attachments | **Zone visible mais DÉSACTIVÉE** avec label "Bientôt disponible" | Prochaine version |

### Bloc E — Email (capture progressive)
| Champ | Type | Contexte |
|---|---|---|
| email | Input email | Dès qu'il est saisi, déclenche un POST qui crée un draft en base pour relance si abandon. Micro-copie RGPD : *"Pas de spam. Vos données restent chez nous."* |

### Bloc F — Coordonnées finales
| Champ | Type | Options |
|---|---|---|
| civility | Radio | M. / Mme / Autre |
| first_name | Input | Requis |
| last_name | Input | Requis |
| phone | Input tel | **Optionnel** (mais micro-copie "recommandé pour accélérer la prise de RDV") |
| consent_rgpd | Checkbox | Requis pour soumettre |

### Bloc G — Récap de fin (surprise, pas en live)
- **Liste des diagnostics obligatoires calculés** (4 à 7 cards avec nom + raison pédagogique)
- **Bloc "À valider sur place"** si certaines questions ont été répondues "Je ne sais pas" (séparé visuellement)
- **Fourchette de prix** mise en avant : *"Entre 340 € et 520 € TTC"* + badges des modulateurs appliqués ("Surface 80-150 m² +10 %", "Pack ≥3 diags −15 %")
- **Disclaimer** : *"Estimation indicative basée sur les tarifs en vigueur au 01/01/2026. Devis définitif sous 2 h ouvrées après validation."*
- **Coordonnées finales + RGPD + CTA "Envoyer ma demande"**

---

## 🪄 Petits plus UX à intégrer

- **Auto-save localStorage** : l'utilisateur qui ferme reviendra sur la même page en l'état (déjà codé côté Zustand persist).
- **Indicateur "2 minutes"** visible en haut pour rassurer sur la durée.
- **Micro-copie pédagogique** sur les champs techniques (ex: date du permis → "Pourquoi ? Cette date détermine les risques plomb et amiante.")
- **Mobile-first obligatoire** : 60 % du trafic vient de mobile. Chaque interaction doit marcher au doigt sur iPhone.

---

## 🚫 Ce qu'on ne veut PAS

- ❌ **Pas** de live-reveal des diagnostics pendant la saisie (checkbox qui se cochent au fur et à mesure comme le legacy). Le récap est **une surprise pédagogique à la fin**.
- ❌ **Pas** de progress bar numérique "1/6 → 6/6" (on sort de ce modèle).
- ❌ **Pas** de logos image externes (Qualixpert, Allianz, FNAIM, I.Cert) — seulement des badges texte stylisés.
- ❌ **Pas** d'images / photos stock (pas de banque d'images dispo).
- ❌ **Pas** de création de compte.
- ❌ **Pas** de paiement en ligne (Session ultérieure).

---

## 🎨 À produire — 3 variantes visuelles

### Variante 1 — **Sobre / éditorial** (inspiration Alan, Qonto)
- Typo forte (Geist), beaucoup de blanc, grilles géométriques discrètes
- Palette quasi monochrome neutral + 1 accent (utiliser `var(--primary)`)
- Pictos Lucide fins
- Animations Framer Motion très subtiles (fade, no slide)

### Variante 2 — **Illustré chaleureux** (inspiration Doctolib)
- Illustrations SVG custom inline (maison, clé, marteau, immeuble, point d'interrogation) pour les 5 cards du bloc A
- Couleurs plus chaudes dans les cards (tons crème, vert tendre, brique discret)
- Typo aérée, gros padding
- Convient mieux à un senior qui vend sa maison

### Variante 3 — **Éditorial premium** (inspiration Stripe, Linear)
- Gradient subtil de fond, cards avec léger blur ou shine sur hover
- Typo premium avec tracking travaillé
- Micro-interactions Framer Motion plus riches (morph entre cards, counter animé sur le prix)
- Convient mieux à un prescripteur B2B (notaire, syndic)

**Livre les 3 sur le canevas Claude Design pour qu'on choisisse, puis on itère sur la variante retenue.**

---

## 🛠️ Contraintes techniques (pour que l'export soit utilisable côté Claude Code)

- **Next.js 16** — App Router
- **React 19** — Server Components par défaut, `"use client"` uniquement si interaction (Framer Motion, RHF, events)
- **TypeScript strict**
- **Tailwind CSS v4** — utiliser exclusivement les tokens shadcn via CSS variables :
  `var(--primary)`, `var(--primary-foreground)`, `var(--background)`, `var(--foreground)`, `var(--muted)`, `var(--muted-foreground)`, `var(--card)`, `var(--border)`, `var(--accent)`, `var(--accent-foreground)`, `var(--destructive)`
- **shadcn/ui new-york, base-color neutral** — composants déjà en place à réutiliser :
  `Button`, `Input`, `Label`, `Textarea`, `RadioGroup`, `Checkbox`, `Select`, `Card`, `Alert`, `Progress`, `Form`
- **Icônes Lucide React** exclusivement (`lucide-react`)
- **Fonts** : Geist (déjà configuré dans `app/layout.tsx` — `--font-geist-sans`, `--font-geist-mono`)
- **Framer Motion** autorisé avec parcimonie — utiliser l'import `from "framer-motion"`
- **Forms** : React Hook Form + Zod resolvers (pattern RHF `<Controller>` déjà utilisé dans le projet)
- **State** : Zustand déjà en place (`useQuestionnaireStore` dans `lib/stores/questionnaire.ts`) — peut être réutilisé ou remplacé par un formulaire "unique" RHF si single-page
- **Autocomplete adresse** : fonction `searchAddresses(query)` déjà dispo dans `lib/ban-api.ts`
- **Calcul des diagnostics** : POST `/api/calculate` avec `CalculatePayload` déjà implémenté (stateless, backend pur). Le design doit juste afficher le résultat.
- **Soumission** : POST `/api/quote-request/[id]/submit` déjà implémenté (503 si Supabase non configuré en Session 2, comportement attendu)

---

## 📂 Fichiers à livrer / remplacer

L'export Claude Design doit produire des fichiers prêts à copier dans le repo :

```
app/(public)/devis/page.tsx              ← Server Component minimal (monte le composant client)
components/questionnaire/
  QuestionnaireContainer.tsx             ← nouveau client component orchestrant la/les page(s)
  blocks/
    ProjectTypeSelector.tsx              ← les 5 cards d'entrée
    PropertyBlock.tsx                    ← bloc B
    TechnicalBlock.tsx                   ← bloc C + C-bis + C-ter (conditionnels)
    TimelineBlock.tsx                    ← bloc D
    EmailBlock.tsx                       ← bloc E (capture progressive)
    RecapBlock.tsx                       ← bloc G (surprise de fin)
    ContactBlock.tsx                     ← bloc F (coordonnées + RGPD + submit)
```

**À ne PAS toucher** (déjà en place, fonctionnels) :
- `lib/diagnostics/rules.ts` + `pricing.ts` (moteur métier testé)
- `lib/validation/schemas.ts` (schémas Zod)
- `lib/supabase/*` (clients)
- `app/api/*` (routes API)
- `components/layout/Header.tsx` + `Footer.tsx`

---

## 📝 Copy FR à reprendre / adapter (verbatim autorisé)

### Écran d'entrée
> **Quel est votre projet ?**
>
> En 2 minutes, identifiez les diagnostics obligatoires pour votre bien et recevez une estimation tarifaire. Sans engagement, sans création de compte.

### Cards de bifurcation — 5 options (suggestion)
- **🏠 Vente** — *Mise en vente d'une maison, appartement ou local.*
- **🔑 Location** — *Nouveau bail ou renouvellement de vos diagnostics.*
- **🔨 Travaux / Rénovation** — *Repérage amiante et plomb avant chantier.*
- **🏢 Gestion copropriété** — *DTA, DPE collectif, parties communes.*
- **❓ Autre projet** — *Décrivez votre besoin, on vous recontacte.*

### Étape email (capture progressive)
> **Laissez-nous votre email pour recevoir votre récapitulatif**
>
> Vous recevrez un devis définitif sous 2 h ouvrées. Pas de spam, vos données restent chez nous.

### Écran récap (bloc G)
> **Voici ce qu'il vous faut.**
>
> Nos experts ont identifié les diagnostics obligatoires pour votre bien.
> Validez vos coordonnées et nous vous rappelons sous 2 h.

### CTA final
> **Envoyer ma demande**
>
> Notre équipe vous contacte sous 2 h ouvrées pour valider votre devis et planifier l'intervention.

### Écran post-soumission (existe déjà, mais à rafraîchir)
> **Merci [Prénom], votre demande est bien reçue.**
>
> Un récapitulatif a été envoyé à [email]. Notre équipe vous contactera sous 2 h ouvrées pour valider votre devis et planifier l'intervention.

---

## 🧠 Règles de branchement (pour Claude Design)

Voici le mapping entre le choix `project_type` et les blocs à afficher :

| project_type | Bloc A | Bloc B | Bloc C | C-bis | C-ter | Bloc D | Bloc E | Bloc F | Bloc G |
|---|---|---|---|---|---|---|---|---|---|
| `sale` | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | ✅ | ✅ |
| `rental` | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| `works` | ✅ | ✅ (sauf copro + surface) | ✅ (permis seulement) | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| `coownership` | ✅ | ✅ (juste adresse + permis) | — | — | — | ✅ | ✅ | ✅ | ✅ |
| `other` | ✅ | — | — | — | — | — | ✅ | ✅ (avec message libre) | — |

---

## 🚀 Actions à la livraison

1. Tu présentes les **3 variantes** sur le canevas Claude Design.
2. Je choisis une variante ou mixe (ex: "layout Variante A + illustrations Variante B").
3. On itère sur la variante retenue (espacement, copy, interactions, responsive).
4. Tu cliques **"Transférer à Claude Code"** → **"Envoyer à l'agent de codage local"**.
5. L'agent Claude Code local intègre le JSX exporté, branche les hooks RHF / Zod / Zustand / API existants, et teste le build.

---

**→ Produis les 3 variantes. Priorité à la clarté du parcours, pas à la démo technique.**
