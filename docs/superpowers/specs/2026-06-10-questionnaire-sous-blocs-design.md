# Spec — Questionnaire sans scroll : sous-blocs repliables intra-étape

**Date** : 2026-06-10
**Statut** : validé (design), à transformer en plan
**Périmètre** : `components/questionnaire/screens/FillingScreen.tsx` (remplissage du devis public)

## 1. Contexte & problème

Le questionnaire de devis s'affiche dans une modale (`QuestionnaireModal`, hauteur
désormais adaptative jusqu'à `94vh`). Le remplissage (`FillingScreen`) est découpé
en **5 étapes** rendues comme accordéons (Le bien · Technique · Diagnostics ·
Délai · Contact). Au niveau étape, la collapse-en-résumé existe déjà.

`FillingScreen` fait **déjà de la révélation progressive** champ par champ
(`hasPropType ? … : null`, `hasAddress ? … : null`, …) : les groupes de champs
apparaissent au fur et à mesure. **Mais une fois révélés, ils restent dépliés et
s'empilent.** Sur l'étape « Le bien » en appartement (Type · Adresse ·
Surface/Pièces · Copropriété · Précisions appartement · Dépendances · Cadastre),
ça déborde et oblige à scroller.

## 2. Objectif / critère de succès

À l'intérieur d'une étape ouverte, **un seul groupe de champs est déplié à la
fois** ; les groupes remplis se replient en résumé d'une ligne. Conséquence :
hauteur visible ≈ quelques lignes de résumé + 1 groupe déplié → l'étape tient
**sans scroll** sur ordinateur (mobile : scroll réduit, pas forcément nul —
acceptable). La logique conditionnelle métier est **conservée à l'identique**.

## 3. Modèle d'interaction

Chaque **sous-bloc** (= un groupe de champs : Type, Adresse, Surface…) a un état
parmi :

- **Actif** → déplié, éditable. C'est le **premier sous-bloc incomplet** visible
  (ou un sous-bloc ré-ouvert manuellement).
- **Rempli** (et non actif) → **résumé d'une ligne** `Titre — valeur` + bouton ✎.
  Clic → ré-ouverture pour corriger.
- **À remplir** (incomplet, non actif — cas rare après ré-ouverture d'un bloc
  antérieur) → ligne condensée grisée « à remplir », cliquable.
- **À venir** (condition de visibilité non remplie) → non rendu (comme aujourd'hui).

Règles :
- Quand le sous-bloc actif devient complet, il se replie en résumé et le suivant
  incomplet s'ouvre (remplace l'« auto-open » actuel, au niveau sous-bloc).
- Les sous-blocs **optionnels** (Dépendances, Cadastre, Notes, Accès, Syndic, Date
  d'achat) sont « complets » par défaut : ils s'affichent en résumé dès qu'ils sont
  visibles (« — » / « Ajouter »), **ne bloquent jamais** l'avancement, et s'éditent
  au clic.
- Tout ceci vit **dans le panneau de l'accordéon d'étape** existant. Le niveau
  étape (5 accordéons + auto-open prop→tech) ne change pas.

```
1  Le bien
   ───────────────────────────────────────
   ✓ Type de bien      Appartement        ✎
   ✓ Adresse           Paris 33880…       ✎
   ✓ Surface & pièces  25 m² · 5 pièces   ✎
   ▼ Copropriété ?                            ← actif (1er incomplet)
       [ Oui ]  [ Non ]  [ ? ]
   (Précisions appartement, Dépendances… → après)
```

## 4. Architecture

### 4.1 Moteur de séquencement (pur, testable)

Fonction pure `computeStepFlow(descriptors, data, branch, editingKey)` :
1. `visible = descriptors.filter(d => d.isVisible(data, branch))`
2. `firstIncomplete = visible.find(d => !d.isComplete(data, branch))?.key`
3. `activeKey = (editingKey && visible.some(d => d.key === editingKey)) ? editingKey : firstIncomplete`
4. Retourne pour chaque descripteur un état : `expanded` (key === activeKey) /
   `summary` (complet, non actif) / `placeholder` (incomplet, non actif) / `hidden`
   (non visible).

`editingKey` (state React local par étape) : positionné au clic sur un résumé /
placeholder ; **remis à `null`** dès que le bloc édité devient complet (la séquence
naturelle reprend). Recalcul à chaque changement de `data` → robuste aux conditions
qui apparaissent/disparaissent (ex. appartement→maison masque « Précisions
appartement » : `activeKey` retombe sur `firstIncomplete`).

### 4.2 Descripteur de sous-bloc

```ts
type SubBlockDescriptor = {
  key: string;
  title: string;
  isVisible: (data: QuoteData, branch: ProjectType) => boolean;
  isComplete: (data: QuoteData, branch: ProjectType) => boolean; // optionnel → () => true
  summary: (data: QuoteData) => string | undefined; // ligne de résumé
  render: () => ReactNode; // les champs actuels, inchangés
};
```

### 4.3 Composant `<SubBlock>`

Présentational, cousin léger de `Accordion` : selon l'état (`expanded` / `summary`
/ `placeholder`), affiche soit `render()`, soit la ligne `Titre — résumé ✎`. A11y :
le résumé est un `<button>` (`aria-expanded`), le panneau `role="region"`.

### 4.4 Découpage fichiers (le 993-lignes éclaté)

- `components/questionnaire/components/SubBlock.tsx` — présentational.
- `screens/filling/types.ts` — `SubBlockDescriptor`, types de flow.
- `screens/filling/computeStepFlow.ts` — moteur pur.
- `screens/filling/useStepFlow.ts` — hook fin (state `editingKey` + reset auto).
- `screens/filling/steps/{LeBien,Technique,Diagnostics,Delai,Contact}.tsx` — chacun
  exporte son tableau de descripteurs (les champs actuels y sont **déplacés tels
  quels** dans `render()`).
- `screens/FillingScreen.tsx` — orchestrateur allégé : rend les 5 accordéons
  d'étape, chacun délègue au module d'étape + au moteur.
- `screens/filling/__tests__/computeStepFlow.test.ts` — Vitest.

### 4.5 Décomposition réelle des sous-blocs (référence)

- **Le bien** : `type` · `address` · `surface` · `coownership` · (`apartment` si
  appartement | `commercial` si local) · `dependencies`◦ · `cadastre`◦
- **Technique** : (`bail` si location | `worksType` si travaux) · `permit` ·
  `heatingMode` · `heating` · `ecs` · `gas` · (`cooktop` si gaz) · `gasAge` ·
  `elecAge` · `purchaseDate`◦
- **Diagnostics déjà valides** : un seul bloc (multi-select), optionnel — inchangé.
- **Délai** : `urgency` · `notes`◦ · `referral`◦
- **Contact** : `phone` · `tenants`◦ · `access`◦ · (`syndic`◦ si chauffage collectif)

(◦ = optionnel → `isComplete: () => true`.) Les prédicats `isVisible`/`isComplete`
reprennent **à l'identique** les flags actuels (`hasAddress`, `hasGas`,
`propDone`-éléments, etc.).

## 5. Préservé / hors scope

- **Préservé** : store Zustand, validation Zod, `QuestionnaireModal`, écrans
  `entry`/`recap`/`thanks`, le `Continuer` global, le bouton retour, les couleurs
  de branche.
- **Hors scope** : modale (déjà agrandie), refonte des questions/champs eux-mêmes,
  zéro-scroll garanti sur mobile.

## 6. Complétion d'étape

Le `done` d'étape (aujourd'hui `propDone`/`techDone`…) = « tous les sous-blocs
**requis** de l'étape sont complets ». Recommandation : le **dériver** des
descripteurs (tous les `isComplete` des non-optionnels) pour éviter la duplication ;
au pire, conserver les flags actuels et les réutiliser. Décision finale au plan.

## 7. Cas limites

- Changer une réponse antérieure qui masque des blocs suivants → recalcul, `activeKey`
  retombe sur le 1er incomplet.
- Rendre incomplet un bloc déjà rempli (ex. vider la surface) → il redevient actif.
- Ré-ouverture manuelle d'un bloc rempli (`editingKey`) puis complétion → reset auto.
- Bloc optionnel jamais « actif » automatiquement ; édité uniquement au clic.

## 8. Tests (Vitest)

`computeStepFlow.test.ts` couvre : data vide → 1er actif / reste hidden ; remplir le
1er → 1er en summary, 2e actif ; bloc optionnel visible → summary (pas actif) ;
`editingKey` → override expand ; condition qui masque un bloc → fallback `activeKey` ;
bloc rempli rendu incomplet → redevient actif. Plus un smoke-test de chaque étape
(branche sale/rental/works, type appartement/commercial) garantissant que la
séquence de visibilité est identique à l'actuel.

## 9. Risques & mitigations

- **Casser une condition d'affichage** → moteur pur testé + QA manuelle par branche
  et par type de bien.
- **Sémantique `is_coownership`** : `hasCoownership = is_coownership !== undefined`
  veut dire « répondu », pas « est en copropriété » — conserver tel quel.
- **Double bloc déplié** → règle « un seul `activeKey` » + reset auto d'`editingKey`.
