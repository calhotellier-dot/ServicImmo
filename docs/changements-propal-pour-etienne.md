# Changements propal Servicimmo — pour Étienne

> **De** : Lyes
> **Date** : 26 avril 2026
> **Objet** : récap des modifs apportées à la propal v1 (PDF du 24/04) après alignement avec le code livré.
> **Pourquoi maintenant** : la propal n'est pas encore signée. On peut tout réviser avant envoi à Fanny et Jacques-Alexandre.

---

## TL;DR

J'ai retravaillé les sections **Phase 1 questionnaire** et **Phase 2 plateforme** parce qu'elles divergeaient du code que j'ai livré ces dernières semaines. **Phases 3 et 4 (Impartial + France Carottage) intactes**, validées avec le client.

Résultat : un PDF v2 de 18 pages dispo dans `docs/pdf/Proposition_Servicimmo_PropulSEO_v2.pdf` que tu peux soit envoyer tel quel, soit reprendre dans ton outil de mise en page.

---

## Vue d'ensemble

| Section | Action | Impact |
|---|---|---|
| §4b · Questionnaire | Réécrit | gros |
| §5 · Plateforme zones | Étendue | gros |
| §5b · Fiche dossier | Réécrit | moyen |
| §5c · Conformité & paramétrage | **Nouvelle section** | gros |
| §5d · Le socle métier | **Nouvelle section** | gros |
| §11 · Tarification | Lignes mises à jour | moyen |
| Tonalité | Tirets cadratins retirés en prose | léger |

---

## Détail des changements

### §4b · Questionnaire (RÉÉCRIT)

**Avant** : 6 étapes linéaires fixes (Type projet → Type bien → Caractéristiques → Localisation → Diagnostics → Coordonnées).

**Après** : 3 piliers d'un parcours adaptatif :
1. **Entrée par projet** qui réorganise tout
2. **Branches automatiques** selon bien et localisation
3. **Prix calculé en temps réel** pendant la saisie

**Pourquoi** : le code livre un parcours à branches dynamiques (4 écrans, pas 6 étapes fixes). Plus court, plus pertinent par client, meilleur taux de complétion. Argument commercial gardé : "votre premier appel n'est plus un appel de qualification, c'est un appel de closing".

**Si Servicimmo demande "où sont passées les 6 étapes ?"** → script de réponse :
> "On a affiné le parcours en travaillant sur le moteur de règles. Au lieu de 6 étapes fixes pour tout le monde, le questionnaire s'adapte au projet. Vos clients vente n'auront pas les questions location, et inversement. C'est plus court, plus précis, et ça augmente le taux de complétion."

---

### §5 · Plateforme — zones étendues

**Modules ajoutés vs propal v1** :

- **Demandes de documents** (zone Traiter) — portail magic link, le client dépose ses pièces sans créer de compte
- **Portail client / prescripteur sécurisé** (zone Relations) — accès devis/factures/docs via lien sécurisé
- **Statistiques avancées** (zone Piloter) — CA mensuel, conversion, activité par technicien, exports CSV (avant : "stats" générique)

**Pourquoi** : le code livre 9 modules au lieu des 7 vendus en v1. Ces 2 modules ajoutés sont du gros travail déjà fait, à valoriser.

---

### §5b · Fiche dossier (RÉÉCRIT)

**Avant** : "Fiche dossier · L'élément central" — listing des 4 blocs (contacts, projet, diagnostics, organisation).

**Après** : "Fiche dossier · Parité fiche papier" — narratif autour de 3 idées :
1. **On reproduit fidèlement votre fiche papier actuelle** — vos équipes ne réapprennent pas leur métier
2. **Une saisie guidée pas-à-pas** — auto-complétion adresse (BAN), suggestions diagnostiques, sauvegarde automatique
3. **Tout converge sur la fiche** — le système entier s'alimente de cette saisie

**Pourquoi** : le code livre une création de dossier qui calque exactement la fiche papier que Fanny utilise au cabinet (le dernier gros chantier que j'ai fait). Argument terrain massif jamais valorisé en v1.

**Note tonalité** : j'ai retiré le mot "wizard" partout, remplacé par "saisie guidée" / "création de dossier" / "parcours". Trop technique pour des dirigeants de PME.

---

### §5c · Conformité & paramétrage (NOUVELLE SECTION)

5 livrables qui n'étaient pas du tout dans la v1 :

- **Export FEC** — fichier comptable légal, conforme article L.47 A
- **Grille tarifaire éditable** — autonomie sur les prix
- **Règles de majoration éditables** — déplacement, urgence, chauffage collectif, etc.
- **Multi-utilisateurs avec rôles** — admin / diagnostiqueur / assistant
- **Branding cabinet** — logo, couleurs, coordonnées sur tous les supports

**Pourquoi** : tout ça existe dans le code (BDD prête, UI en finition). Bonus stratégique à valoriser, surtout l'export FEC qui est une obligation légale.

---

### §5d · Le socle métier (NOUVELLE SECTION)

3 piliers techniques sous-vendus dans la v1 :

1. **Moteur de règles diagnostics** — calcule auto les diagnostics obligatoires selon vente/loc, type bien, année construction, localisation
2. **Moteur de tarification modulaire** — grille × règles de majoration, devis transparents et auditables
3. **Conformité légale intégrée** — devis/factures immuables, FEC, hébergement EU, RGPD by design

**Pourquoi** : la propal v1 vendait l'écran. La v2 vend ce qui est en dessous : un socle technique blindé qui crée de la valeur long terme. C'est aussi ce qui justifie l'écart de prix face à un dev freelance.

---

### §11 · Tarification

Lignes Phase 1 et Phase 2 mises à jour pour refléter le nouveau périmètre :

**Phase 1** :
- Remplacement de "Questionnaire 6 étapes" par "Questionnaire intelligent à parcours adaptatif"

**Phase 2** :
- Nouvelle ligne "Zone Traiter — gestion dossiers, fiche dossier, commercial, agenda, **demandes docs**"
- Nouvelle ligne "Zone Relations — base centralisée + **portail client/prescripteur sécurisé**"
- Nouvelle ligne "**Conformité & paramétrage** — export FEC, grille & règles éditables, multi-utilisateurs"

**Montants à arbitrer entre nous** : la plateforme livrée contient environ 30 % de modules en plus que la v1 (FEC, portail client, demandes docs, paramétrage admin). Deux options :

| Option | Effet | Risque |
|---|---|---|
| **Ajuster Phase 2 à la hausse** | Reflète la valeur livrée | Re-négo, perte de momentum |
| **Vendre les bonus comme "offerts"** | Effet wow, signature accélérée | Sous-valorisation du travail |

Ma reco : **option 2** (offert). Effet wow vaut l'écart de marge, et ça crée une dette d'image positive si on doit upseller en Phase 3-4.

---

### Tonalité globale

J'ai supprimé tous les **tirets cadratins (—)** en milieu de phrase. Ça commence à faire "rédigé par IA" sur les propals, et ça nuit à la crédibilité.

Remplacés par : virgule (juxtaposition), point (séparation phrases) ou deux-points (listes "Terme : description"). Les tirets dans les titres / structures graphiques sont conservés.

---

## Ce qui n'a PAS changé

| Section | Statut |
|---|---|
| §1 Contexte & vision | inchangée |
| §2 Objectifs stratégiques | inchangée |
| §3 Architecture globale | inchangée |
| §4 Structure du site et SEO | inchangée |
| §6 Fonctionnement complet d'un dossier | inchangée |
| §7 Phase 3 Impartial / DS8 | inchangée |
| §8 Phase 4 France Carottage | inchangée |
| §9 Timeline | inchangée |
| §10 Méthodologie | inchangée |
| §12 Conclusion | inchangée |
| §13 Bon pour accord | inchangée |

---

## Livrables disponibles

- **PDF complet v2** : `docs/pdf/Proposition_Servicimmo_PropulSEO_v2.pdf` (18 pages)
- **Sections texte autonomes** (si tu préfères piocher) : `docs/propal-v2-questionnaire-plateforme.md`
- **Audit interne** (mémo) : `docs/audit-interne-propal.md`

---

À toi.
