# Revue propal Servicimmo v1 — Design

> **Statut** : design validé (brainstorm 26 avril 2026)
> **Auteur** : Lyes Triki
> **Contexte** : la propal `Proposition_Servicimmo_PropulSEO (2).pdf` (17 pages, éditée le 24 avril 2026) a été rédigée par Étienne sans avoir bossé sur le code. Plusieurs sections (questionnaire, plateforme métier) divergent de l'implémentation réelle. La propal n'est pas encore signée — on peut tout réviser.

---

## 1. Objectif

Produire **deux livrables actionnables** :

1. **Doc client** — sections propal réécrites prêtes à intégrer dans le PDF (sections §4, §4b, §5, §5b et §6 du PDF actuel).
2. **Doc audit interne** — décisions actées, écarts code ↔ propal, checklist modifs PDF pour Étienne, axes d'amélioration produit, risques commerciaux.

Phases 3 (Impartial/DS8) et 4 (France Carottage) **non touchées** — validées avec le client.

---

## 2. Décisions actées

| # | Décision | Choix | Justification |
|---|----------|-------|---------------|
| D1 | Structure questionnaire | Garder le code (4 écrans avec branches dynamiques), réécrire la propal | Le code livre une UX supérieure (moins d'étapes, branches intelligentes). Adapter la propal coûte 0, rebuilder le code coûte 2-3 jours et perd de l'intelligence métier. |
| D2 | Phasing | Garder l'ordre narratif propal (Phase 1=site, Phase 2=plateforme), livrer dans l'ordre réel (plateforme finie en premier) | Évite l'embarras de l'inversion. Le client voit la chronologie qu'il a validée. |
| D3 | Bonus plateforme | Tout valoriser dans la propal v2 (FEC, portail, paramètres, demandes docs, statistiques avancées) | Démontre la profondeur, justifie le prix Phase 2. |
| D4 | Phases 3 et 4 | Intactes | Validées avec Servicimmo. |
| D5 | Format livrable | Approche 3 (doc client minimaliste + audit interne court) | Action-oriented, pas un mur d'analyse. |

---

## 3. Architecture des deux livrables

```
docs/superpowers/specs/
├── 2026-04-26-revue-propal-design.md          (ce fichier — spec)
└── 2026-04-26-revue-propal-plan.md            (à créer — plan d'implémentation)

docs/
├── propal-v2-questionnaire-plateforme.md      (LIVRABLE 1 — doc client)
└── audit-interne-propal.md                    (LIVRABLE 2 — doc interne)
```

---

## 4. Livrable 1 — Doc client (`propal-v2-questionnaire-plateforme.md`)

Format identique au PDF actuel. Remplace les sections existantes :

### 4.1 Section §4 · Phase 1 · Site internet & questionnaire intelligent

- **Objectif** — inchangé
- **Structure du site · 5 pages principales** — inchangé
- **Sous-pages SEO · Référencement local** — inchangé

### 4.2 Section §4b · Le questionnaire intelligent — Cœur de la phase 1 (RÉÉCRIT)

**Suppression** : le bloc "6 étapes linéaires" (Type projet → Type bien → Caractéristiques → Localisation → Diagnostics potentiels → Coordonnées).

**Remplacement** par un narratif "parcours adaptatif" :

- Titre principal : **"Un parcours intelligent qui s'adapte à chaque projet"**
- Sous-titre : *"Pas de questions inutiles. Pas de formulaires interminables. Le questionnaire ne demande que ce qui sert à votre métier."*
- 3 piliers présentés visuellement :
  1. **Entrée par projet** — Vente, location, travaux, diagnostic périodique. Le parcours se réorganise instantanément selon le choix.
  2. **Branches automatiques** — Selon le type de bien (maison/appartement/local) et la localisation, seules les questions pertinentes apparaissent. Pas de termites en zone non concernée, pas de DPE tertiaire pour un particulier.
  3. **Prix calculé en temps réel** — Le client voit son devis estimatif s'affiner pendant la saisie. Aucune surprise au moment du contact.
- Conserver l'argument-clé : *"Votre premier appel n'est plus un appel de qualification — c'est un appel de closing."*
- Bloc "Ce qui change concrètement pour vous" — conserver tel quel
- Automatisations incluses — conserver telles quelles (email, notif interne, SMS rappel, avis Google, export plateforme)

### 4.3 Section §5 · Phase 2 · Plateforme métier Servicimmo (ÉTENDU)

- **Objectif** — légère reformulation pour souligner la couverture complète (du devis à la compta).
- **3 zones fonctionnelles** — conservé, modules étendus :

#### Zone 1 · Piloter
- **Tableau de bord** — dossiers en cours, RDV du jour, alertes, CA estimé temps réel *(inchangé)*
- **Statistiques & pilotage avancé** — dossiers traités, taux de conversion, activité par technicien, CA par mois, exports CSV *(enrichi vs propal v1)*

#### Zone 2 · Traiter
- **Gestion des dossiers** *(inchangé)*
- **Fiche dossier complète** *(inchangé)*
- **Gestion commerciale** — devis, factures immuables, relances automatisées, paiements Stripe + manuels *(enrichi)*
- **Agenda & planification** *(inchangé)*
- **Demandes de documents — portail magic link** ⭐ *(NOUVEAU — bonus valorisé)*
  - *Le cabinet envoie en un clic une demande de docs au client. Le client reçoit un lien sécurisé sans création de compte, dépose ses documents, le cabinet est notifié.*

#### Zone 3 · Relations
- **Gestion des tiers** *(inchangé)*
- **Portail client / prescripteur sécurisé** ⭐ *(NOUVEAU — bonus valorisé)*
  - *Vos clients et prescripteurs accèdent à leurs devis, factures et documents via un lien sécurisé. Pas de mot de passe à gérer.*

### 4.4 Section §5c · Conformité & paramétrage (NOUVELLE SECTION)

Bonus à valoriser :

- **Export FEC** — fichier comptable légal généré en un clic, conforme à l'obligation fiscale (article L.47 A du Livre des procédures fiscales).
- **Grille tarifaire éditable** — modifiez vos prix en autonomie, sans nous solliciter.
- **Règles de majoration éditables** — frais de déplacement, urgence, chauffage collectif, etc.
- **Multi-utilisateurs avec rôles** — admin, diagnostiqueur, assistant. Permissions granulaires.
- **Branding cabinet** — votre logo, vos couleurs, vos coordonnées sur tous les supports (devis, factures, emails).

### 4.5 Section §5b · Fiche dossier — L'élément central

Inchangé. Déjà aligné avec le code livré.

### 4.6 Section §6 · Fonctionnement complet d'un dossier

Inchangé. Déjà aligné avec le code livré.

---

## 5. Livrable 2 — Doc audit interne (`audit-interne-propal.md`)

Cible : Lyes (et Étienne après lecture). Court (~150 lignes max).

### 5.1 Décisions actées (brainstorm 26 avril)
Reprise du tableau §2 ci-dessus.

### 5.2 Écarts code ↔ propal v1 (avant correction)

Tableau 2 colonnes : *Vendu propal v1* / *Livré dans le code*. Périmètre questionnaire + plateforme uniquement.

### 5.3 Checklist modifs PDF pour Étienne

Liste actionnable :
- [ ] Remplacer §4b (bloc 6 étapes) par bloc "parcours intelligent" — fournir le texte du livrable 1
- [ ] Étendre §5 zones avec modules bonus (Demandes docs, Portail client) — fournir texte
- [ ] Ajouter §5c "Conformité & paramétrage" — fournir texte
- [ ] Vérifier cohérence tarif Phase 2 (périmètre étendu)
- [ ] Vérifier que les visuels du PDF (numéros 1-6 dans §4b) sont remplacés par un schéma branches
- [ ] Mettre à jour la timeline §9 si la durée Phase 2 change

### 5.4 Axes d'amélioration produit (post-signature)

Ce qui reste à finir côté code pour matcher la promesse propal v2. Source de vérité : `.planning/BLOCKERS.md`.

Priorité haute :
- UI admin éditeurs (grille tarifaire, règles, modèles, users)
- Génération PDF devis/facture
- Upload portail demande-documents

Priorité moyenne :
- DnD Kanban interactif
- Vue agenda semaine/jour
- E2E Playwright complets

### 5.5 Risques commerciaux à anticiper

- **Si Servicimmo demande "où sont les 6 étapes ?"** → script : *"On a affiné le parcours — au lieu de 6 étapes fixes, le questionnaire s'adapte au projet. Vos clients vente n'auront pas les questions location, etc. C'est plus court et plus précis."*
- **Si écart de prix perçu** (plateforme étendue vs propal v1) → arbitrage : soit on ajuste le tarif Phase 2 à la hausse pour refléter les bonus, soit on les vend comme "inclus offerts" pour l'effet wow. À décider avec Étienne.
- **Si Étienne refuse certaines modifs** → le doc client est self-contained, il peut piocher.

---

## 6. Hors scope

- Phases 3 (Impartial/DS8) et 4 (France Carottage) — pas touchées.
- Refonte du PDF lui-même — c'est Étienne qui maintient le PDF. On lui livre les sections texte.
- Modifications du code (le code est conservé tel quel, c'est la propal qui s'aligne).
- Roadmap post-livraison — référence à `.planning/BLOCKERS.md` suffit.

---

## 7. Critères de succès

1. Le doc client peut être copié-collé dans le PDF sans retouche par Étienne.
2. Le doc audit tient en une lecture de 5 min.
3. Aucune mention des phases 3-4 dans les modifs.
4. Les bonus plateforme (FEC, portail, paramètres) apparaissent comme valeur valorisée et non comme dette technique.
