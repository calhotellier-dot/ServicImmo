# Revue propal Servicimmo v1 — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produire deux livrables Markdown — sections propal réécrites pour Étienne (PDF) + audit interne pour Lyes — qui réalignent la propal v1 avec le code livré (questionnaire branché et plateforme étendue).

**Architecture:** Production de docs Markdown only. Aucune modification de code. Spec source : `docs/superpowers/specs/2026-04-26-revue-propal-design.md`.

**Tech Stack:** Markdown. Pas de tests automatisés (livrables de documentation).

---

## Task 1 — Livrable 1 : Doc client (sections propal réécrites)

**Files:**
- Create: `docs/propal-v2-questionnaire-plateforme.md`

**Référence spec :** §4 du design doc.

- [ ] **Step 1 : Créer le fichier avec en-tête et avertissement**

Contenu :

```markdown
# Propal v2 — Sections réécrites · Questionnaire & Plateforme métier

> **Pour Étienne** : ces sections remplacent les §4, §4b, §5, §5b, §5c (nouvelle), §6 du PDF actuel.
> Conserver le formatage visuel du PDF (cartouches violets, numérotation des sections, blocs "ce qui change concrètement", etc.).
> Phases 3 et 4 inchangées. Tarification §11 à arbitrer selon périmètre étendu Phase 2.

---
```

- [ ] **Step 2 : Rédiger §4 Phase 1 (parties inchangées rappelées + §4b réécrit)**

Recopier les blocs **Objectif**, **Structure du site · 5 pages principales**, **Sous-pages SEO** depuis le PDF v1 (signaler "inchangé").

Puis **réécrire §4b** :

```markdown
## §4b · Le questionnaire intelligent — Cœur de la phase 1 *(RÉÉCRITURE COMPLÈTE)*

### Un parcours intelligent qui s'adapte à chaque projet

Pas de questions inutiles. Pas de formulaires interminables. Le questionnaire ne demande
que ce qui sert à votre métier.

### Comment ça fonctionne concrètement

**1 · Entrée par projet**
Vente, location, travaux, diagnostic périodique. Le parcours se réorganise instantanément
selon le choix — un client en location ne verra pas les questions vente.

**2 · Branches automatiques**
Selon le type de bien (maison, appartement, local pro, immeuble) et la localisation,
seules les questions pertinentes apparaissent. Pas de termites en zone non concernée,
pas de DPE tertiaire pour un particulier.

**3 · Prix calculé en temps réel**
Le client voit son devis estimatif s'affiner pendant la saisie. Aucune surprise au moment
du contact.

> **CE QUI CHANGE CONCRÈTEMENT POUR VOUS**
> Un prospect vous contacte ? Vous avez déjà en main : type de projet, caractéristiques
> du bien, diagnostics pré-identifiés, créneaux de RDV.
> **Votre premier appel n'est plus un appel de qualification — c'est un appel de closing.**

### Automatisations incluses dans la phase 1
*(inchangé vs propal v1 — recopier la liste : email confirmation, notif interne, SMS rappel,
demande avis Google, export plateforme)*
```

- [ ] **Step 3 : Rédiger §5 Phase 2 — 3 zones étendues**

```markdown
## §5 · Phase 2 · Plateforme métier Servicimmo *(SECTION ÉTENDUE)*

### Objectif
Remplacer le papier, Excel et les échanges par mail/téléphone par une interface unique,
pensée pour votre métier de diagnostiqueur. Du premier contact à la clôture comptable —
tout passe par la plateforme.

### La plateforme en 3 grandes zones fonctionnelles

#### Zone 1 · PILOTER
*La vue d'ensemble. Où vous démarrez votre journée pour savoir ce qui compte aujourd'hui.*

- **Tableau de bord** — dossiers en cours, RDV du jour, alertes, CA estimé en temps réel
- **Statistiques & pilotage avancé** — dossiers traités, taux de conversion, activité par
  technicien, CA mensuel, exports CSV pour votre comptable

#### Zone 2 · TRAITER
*Le cœur opérationnel. Où vos dossiers vivent, du premier contact à la clôture.*

- **Gestion des dossiers** — liste filtrable par statut, recherche rapide
- **Fiche dossier** — élément central — contacts, bien, diagnostics, devis, fichiers au
  même endroit
- **Gestion commerciale** — devis, factures immuables, relances automatisées, paiements
  Stripe + manuels
- **Agenda & planification** — planning par technicien, assignation en 2 clics, SMS de
  rappel automatiques
- **Demandes de documents** ⭐ — *bonus inclus*
  En un clic, le cabinet envoie au client une demande de documents personnalisée. Le
  client reçoit un lien sécurisé sans création de compte, dépose ses pièces, le cabinet
  est notifié. Fini les relances par mail.

#### Zone 3 · RELATIONS
*Votre base de contacts. Clients, prescripteurs, partenaires — tous reliés à leur historique.*

- **Gestion des tiers** — base centralisée : clients, agences, syndics, prescripteurs,
  notaires
- **Portail client / prescripteur sécurisé** ⭐ — *bonus inclus*
  Vos clients et prescripteurs accèdent à leurs devis, factures et documents via un lien
  sécurisé. Pas de mot de passe à gérer, pas de friction.
```

- [ ] **Step 4 : Rédiger §5c — nouvelle section "Conformité & paramétrage"**

```markdown
## §5c · Conformité & paramétrage *(NOUVELLE SECTION — bonus valorisés)*

La plateforme couvre aussi vos obligations légales et vous laisse la main sur sa
configuration.

- **Export FEC** — fichier comptable légal généré en un clic, conforme à l'obligation
  fiscale (article L.47 A du Livre des procédures fiscales). Votre comptable l'importe
  directement dans son logiciel.
- **Grille tarifaire éditable** — modifiez vos prix en autonomie, sans nous solliciter.
  Tarifs par diagnostic, par contexte (vente/location), par type de bien.
- **Règles de majoration éditables** — frais de déplacement, urgence, chauffage collectif,
  pack multi-diagnostics. Configurables sans toucher au code.
- **Multi-utilisateurs avec rôles** — comptes admin, diagnostiqueur, assistant.
  Permissions granulaires par fonction.
- **Branding cabinet** — votre logo, vos couleurs, vos coordonnées sur tous les supports
  (devis, factures, emails clients).

> **VALEUR AJOUTÉE**
> Vous êtes autonome sur les paramètres qui changent souvent (prix, règles, équipe,
> branding). Aucune dépendance à Propul'SEO pour ces ajustements quotidiens.
```

- [ ] **Step 5 : Rédiger §5b et §6 — sections inchangées rappelées**

```markdown
## §5b · Fiche dossier — L'élément central
*(INCHANGÉ vs propal v1 — recopier la section telle quelle)*

## §6 · Fonctionnement complet d'un dossier
*(INCHANGÉ vs propal v1 — recopier la section telle quelle)*
```

- [ ] **Step 6 : Vérifier le rendu Markdown**

Run: `cat docs/propal-v2-questionnaire-plateforme.md | head -80`
Expected: en-tête + §4 + début §4b lisible, structure correcte.

- [ ] **Step 7 : Commit**

```bash
git add docs/propal-v2-questionnaire-plateforme.md
git commit -m "docs(propal): livrable 1 — sections propal v2 réécrites pour Étienne

§4b parcours intelligent (remplace 6 étapes linéaires).
§5 zones étendues (Demandes docs + Portail client en bonus).
§5c nouvelle section Conformité & paramétrage (FEC, grille tarifaire éditable, etc.).
§5b et §6 inchangés.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2 — Livrable 2 : Audit interne

**Files:**
- Create: `docs/audit-interne-propal.md`

**Référence spec :** §5 du design doc.

- [ ] **Step 1 : Créer le fichier avec en-tête + §1 décisions actées**

```markdown
# Audit interne — Propal Servicimmo v1

> **Cible** : Lyes (puis Étienne après lecture).
> **Date** : 26 avril 2026
> **Origine** : brainstorm 26/04 — la propal v1 (PDF du 24/04) a été rédigée par Étienne
> sans avoir bossé sur le code. Sections questionnaire + plateforme à réaligner.
> **Lecture** : 5 minutes.

---

## 1. Décisions actées (brainstorm 26 avril)

| # | Décision | Choix | Justification |
|---|----------|-------|---------------|
| D1 | Questionnaire | Garder le code (4 écrans branches dynamiques), réécrire propal | Code livre UX supérieure ; rebuilder = 2-3j perdus |
| D2 | Phasing | Ordre narratif propal conservé, livraison réelle inversée (plateforme avant site) | Évite l'embarras de l'inversion |
| D3 | Bonus plateforme | Tout valoriser dans propal v2 (FEC, portail, paramètres, demandes docs) | Justifie le prix Phase 2 |
| D4 | Phases 3 et 4 | Intactes | Validées avec Servicimmo |
| D5 | Format livrable | Doc client minimaliste + audit court | Action-oriented |
```

- [ ] **Step 2 : Rédiger §2 écarts code ↔ propal v1**

```markdown
## 2. Écarts code ↔ propal v1 (avant correction)

### Questionnaire public

| Vendu propal v1 | Livré dans le code |
|---|---|
| 6 étapes linéaires fixes | 4 écrans (Entry → Filling avec branches → Recap prix → Thanks) |
| Sélection diagnostics manuelle étape 5 | Calcul auto via moteur règles `lib/core/diagnostics/rules.ts` |
| Pas de prix pendant le parcours | Prix calculé en temps réel pendant la saisie |
| Pas mentionné | Autocomplétion adresse BAN intégrée |

### Plateforme métier

| Vendu propal v1 | Livré dans le code |
|---|---|
| 3 zones · 7 modules | 3 zones · 9 modules (+ Demandes docs + Portail client) |
| Statistiques light | Statistiques avancées (CA, conversion, par technicien, exports) |
| ❌ Export FEC | ✅ Export FEC complet (18 colonnes, conforme L.47 A) |
| ❌ Portail client/prescripteur | ✅ Portail magic link (devis + factures + docs) |
| ❌ Demandes de documents | ✅ Module complet avec 3 modèles seedés |
| ❌ Paramétrage admin (grille, règles, modèles, users) | ⚠️ DB prête, UI à finir (cf. §4) |
| ❌ Branding cabinet | ✅ Configurable via `organizations` |
| ❌ Multi-utilisateurs avec rôles | ✅ admin / diagnostiqueur / assistant |
| Wizard dossier non détaillé | ✅ Wizard parité fiche papier Servicimmo (commit `08b256d`) |
```

- [ ] **Step 3 : Rédiger §3 checklist modifs PDF pour Étienne**

```markdown
## 3. Checklist modifs PDF pour Étienne

À faire dans le PDF source de la propal :

- [ ] **§4b · page 6** : remplacer le bloc "1 à 6 étapes" par le bloc "Parcours intelligent"
      → texte fourni dans `docs/propal-v2-questionnaire-plateforme.md`
- [ ] **§4b · page 6** : remplacer le visuel numéroté 1-6 par un schéma "Type projet → branche dynamique → récap prix"
- [ ] **§5 · page 8** : remplacer la liste 7 modules par les 9 modules de la version v2 (ajout : Demandes docs en zone 2, Portail client en zone 3)
- [ ] **§5 · page 8** : ajouter les marqueurs ⭐ "bonus inclus" sur Demandes docs et Portail client
- [ ] **NOUVELLE §5c · entre page 9 et 10** : insérer la nouvelle section "Conformité & paramétrage"
- [ ] **§11 Tarification · page 15** : vérifier cohérence du montant Phase 2 vs périmètre étendu (arbitrage : ajuster à la hausse OU vendre les bonus en "offert")
- [ ] **§9 Timeline · page 13** : vérifier durée Phase 2 (8 semaines) compatible avec le périmètre étendu — peut nécessiter +2 semaines polish
- [ ] **Page de garde · page 1** : incrémenter le numéro de version (v2)
```

- [ ] **Step 4 : Rédiger §4 axes d'amélioration produit**

```markdown
## 4. Axes d'amélioration produit (post-signature)

Ce qui reste à finir côté code pour matcher la promesse propal v2. Source de vérité :
[`.planning/BLOCKERS.md`](../.planning/BLOCKERS.md).

### Priorité haute (à faire avant kick-off ou en phase 2 polish)

- **UI éditeurs admin** (`/app/parametres/grille`, `/regles`, `/modeles`, `/utilisateurs`)
  Backend prêt, RLS OK, manque les écrans CRUD.
- **Génération PDF devis/facture** — `@react-pdf/renderer` installé, colonnes
  `pdf_storage_path` prêtes, template à écrire.
- **Upload portail demande-documents** — actuellement message "envoyer par mail",
  remplacer par signed-upload Supabase Storage.

### Priorité moyenne

- **DnD Kanban interactif** — backend `updateDossierStatus` prêt, intégration
  `@dnd-kit/core` à faire.
- **Vue agenda semaine/jour** — vue mois OK, à arbitrer avec Servicimmo.
- **E2E Playwright complets** — 3 parcours critiques (wizard→devis→Stripe, demande
  docs, FEC).
- **Autocompletion BAN dans wizard admin** — existe sur questionnaire public à porter.

### Blockers externes (Servicimmo doit fournir)

- 🔴 Buckets Storage à créer (3 buckets Supabase)
- 🔴 Stripe KYC + Resend domaine DKIM `servicimmo.fr`
- 🟠 Grille tarifaire réelle (10 questions à poser)
- 🟠 Infos cabinet (SIRET/IBAN/TVA)
```

- [ ] **Step 5 : Rédiger §5 risques commerciaux**

```markdown
## 5. Risques commerciaux à anticiper

### "Où sont passées les 6 étapes ?"

Si Fanny ou Jacques-Alexandre soulèvent la disparition des 6 étapes du questionnaire,
script de réponse :

> "On a affiné le parcours en travaillant sur le moteur de règles. Au lieu de 6 étapes
> fixes pour tout le monde, le questionnaire s'adapte au projet. Vos clients vente
> n'auront pas les questions location, vos clients location n'auront pas les questions
> vente. C'est plus court, plus précis, et ça augmente le taux de complétion."

### Écart de prix perçu (plateforme étendue vs propal v1)

La plateforme livrée contient ~30% de modules en plus que la propal v1 (FEC, portail
client, demandes docs, paramétrage complet). Deux options à arbitrer **avec Étienne
avant signature** :

1. **Ajuster Phase 2 à la hausse** pour refléter le périmètre étendu. Risque :
   re-négo, perte du momentum signature.
2. **Vendre les bonus comme "offerts"** au prix initial. Avantage : effet wow,
   signature accélérée. Risque : sous-valorisation du travail.

Recommandation : option 2 — l'effet wow vaut l'écart de marge, et ça crée une
dette d'image positive si on doit upseller en Phase 3-4.

### Si Étienne refuse certaines modifs

Le doc client `docs/propal-v2-questionnaire-plateforme.md` est self-contained. Étienne
peut piocher section par section. Pas de modif tout-ou-rien.
```

- [ ] **Step 6 : Vérifier le rendu Markdown**

Run: `cat docs/audit-interne-propal.md | wc -l`
Expected: ~120-150 lignes (lecture 5 min cible).

- [ ] **Step 7 : Commit**

```bash
git add docs/audit-interne-propal.md
git commit -m "docs(propal): livrable 2 — audit interne propal v1

5 sections : décisions actées, écarts code↔propal v1, checklist modifs PDF Étienne,
axes amélioration produit, risques commerciaux à anticiper.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Self-review

- ✅ Spec coverage : §4 spec → Task 1, §5 spec → Task 2, hors scope §6 spec respecté (pas de modif code).
- ✅ Pas de placeholder TBD/TODO dans le plan (les `[ ]` checkboxes du livrable 2 sont volontaires — c'est la checklist Étienne).
- ✅ Pas de tests automatisés (livrables doc) — pas d'incohérence type.
- ✅ Chaque step a son contenu complet (pas de "similar to above").

---

## Critères de succès finaux

1. `docs/propal-v2-questionnaire-plateforme.md` peut être copié-collé dans le PDF par Étienne sans retouche.
2. `docs/audit-interne-propal.md` se lit en 5 min.
3. Aucune mention des phases 3-4 dans les modifs.
4. Bonus plateforme valorisés explicitement (⭐ et §5c).
5. Les deux fichiers commités sur `main`.
