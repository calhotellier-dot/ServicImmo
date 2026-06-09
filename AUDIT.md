# AUDIT — servicimmo.fr (état actuel)

**Date :** avril 2026
**Périmètre :** diagnostic UX/tech/conversion, focus formulaire de devis

---

## 1. Vue d'ensemble

| Dimension | État | Verdict |
|---|---|---|
| Stack technique | PHP ancien, tableaux HTML, jQuery-like | ⚠️ Obsolète |
| Responsive | Partiel, table-based layout | ❌ Non adapté mobile |
| Performance | Images non optimisées, pas de lazy-load | ⚠️ Médiocre |
| SEO | 100 articles + 40 pages villes — **gros actif** | ✅ Fort |
| Contenu | Veille réglementaire depuis 2017 | ✅ Exceptionnel |
| Conversion | Formulaire non qualifiant, pas d'engagement visuel | ❌ Faible |
| Confiance | Certifications présentes mais enterrées en footer | ⚠️ Sous-exploitée |

---

## 2. Analyse du formulaire actuel `/demande-devis.php`

### Structure détectée

Le formulaire est un **gros bloc monolithique** dans un `<table>` HTML, sans logique conditionnelle visible côté UX. L'utilisateur voit **tous les champs d'un seul coup** (30+ champs).

### Problèmes critiques

**1. Aucune progression visuelle**
Pas d'étapes, pas de barre de progression, pas de sentiment d'avancement → taux d'abandon probablement >70%.

**2. Redondance logique**
- "Vous vendez / Vous louez" demandé 2 fois (en haut + dans la section "Votre bien")
- Le type de bien + date de permis est proposé en boutons (6 combos) mais redemandé en champs séparés

**3. Champs inutilisés ou mal pensés**
- Liste d'obligations `[Plomb][DPE][ERP]...` affichée sans explication → le particulier ne sait pas quoi cocher
- Champ "Année" avec valeurs ambiguës ("Après Juillet 1997 mais plus de 15 ans" → calcul mental pénible)
- "Gaz / Chauffage / Installation gaz +15 ans" demandés séparément → devrait être conditionnel

**4. Pas de calcul de diagnostics obligatoires**
C'est pourtant la promesse : *"vous identifiez rapidement quels sont les diagnostics obligatoires"*. Mais rien n'est calculé, l'utilisateur coche lui-même.

**5. Pas d'estimation de prix**
Concurrents (Diag-Pilote, Allodiagnostic, etc.) affichent une fourchette immédiate → friction majeure pour Servicimmo.

**6. Confirmation et rassurance absentes**
- Pas de récapitulatif avant envoi
- Pas de délai de réponse annoncé
- Pas de logos de certification à proximité du CTA
- Pas de témoignages clients

**7. Capture email uniquement à la fin**
Si l'utilisateur abandonne en cours, 100% perdu → pas de retargeting possible.

**8. Aucune feature mobile-first**
- Pas de géolocalisation pour pré-remplir code postal/ville
- Pas d'autocomplete d'adresse (BAN, Google Places)
- Clavier non optimisé (`type="tel"`, `type="email"` probablement absents)

### Ce qui fonctionne

- ✅ La **logique métier est bonne** dans l'idée : type de bien × date de permis permet de déduire les diagnostics
- ✅ Les **bons champs sont collectés** (surface, nombre de pièces, année, chauffage, gaz) pour chiffrer un devis
- ✅ L'**envoi par email** à l'équipe fonctionne vraisemblablement

---

## 3. Audit global du site (hors formulaire)

### Navigation et information architecture

La nav à 3 entrées (Particuliers / Pros / Amiante) est **logique** mais :
- 11 sous-items dans "Particuliers" = surcharge cognitive
- Les pages services sont longues et non-scannables (murs de texte)
- Pas de CTA contextuel en fin de page service (obligation de revenir au menu)

### SEO

- **Force** : 100 articles, 40 pages villes, maillage interne correct
- **Faiblesse** : titles et meta descriptions auto-générés (ex: `Actualités Château-Renault` sur la page 17 alors que le contenu parle du DPE national)
- **Risque refonte** : si migration sans 301 systématiques, perte de 50% du trafic organique assurée

### Design et confiance

- Certifications LCC Qualixpert, Allianz, FNAIM, I.Cert → **enterrées en footer**, devraient être en hero
- Pas de photo d'équipe, pas de cas clients, pas de chiffres clés ("28 ans d'expérience", "10 000+ diagnostics")
- Logo et identité visuelle datés mais pas catastrophiques

### Opportunités non-exploitées

1. **Moteur de recommandation** : "Selon votre bien, voici les diagnostics obligatoires" → doit être LE produit d'appel
2. **Estimation de prix** : même approximative, convertit 3× mieux qu'un devis différé
3. **Prise de RDV directe** : le tel est visible mais aucun système de booking
4. **Rappel auto des diagnostics qui expirent** : capital client de 28 ans dormant

---

## 4. Verdict et orientation

Le site actuel **convertit sans doute** (trafic SEO solide), mais **sous-performe largement** vs potentiel :

- Formulaire daté qui ne vend pas le savoir-faire
- Contenu expert invisible au-dessus de la ligne de flottaison
- Aucun outil interactif qui différencie Servicimmo d'un cabinet lambda

### Recommandation stratégique

**Le questionnaire de devis doit devenir le produit phare du site.**

Pas un formulaire. Un **assistant de diagnostic intelligent** qui :
1. Pose des questions conditionnelles, claires, en 3-5 étapes
2. Calcule en temps réel les diagnostics obligatoires (avec pédagogie)
3. Donne une estimation de prix transparente
4. Capture l'email dès l'étape 2 (re-engage si abandon)
5. Propose RDV en ligne + devis PDF généré automatiquement

Ce questionnaire **EST** la démonstration du savoir-faire de Servicimmo. Il montre au client que Servicimmo connaît son métier mieux que lui — ce qui est exactement ce qu'il veut payer.

**→ Voir `PRD.md` pour la spec détaillée.**
