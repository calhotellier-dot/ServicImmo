# QUESTIONNAIRE — Flow et règles métier

Ce document détaille le parcours utilisateur du questionnaire de devis et la logique de calcul automatique des diagnostics obligatoires.

**C'est le cœur du produit. Toute ambiguïté ici = produit défaillant. À valider avec Servicimmo avant implémentation.**

---

## 1. Principes UX

- **Une question par écran** (sauf l'étape 2 qui en regroupe logiquement quelques-unes)
- **Progression visuelle** en haut : étape X/6, barre horizontale
- **Navigation** : bouton « Retour » présent partout, bouton « Suivant » activé seulement si réponses valides
- **Sauvegarde auto** de l'état dans localStorage → l'utilisateur peut reprendre
- **Temps estimé** affiché en début : « 2 minutes »
- **Micro-copie pédagogique** à côté de chaque question
- **Pas de branding lourd** pendant le form : utilisateur focalisé

---

## 2. Les 6 étapes

### Étape 1 — Votre projet

**Question :** *« Quel est votre projet ? »*

Options visuelles (cards avec icône) :
- 🏠 Vente d'un bien
- 🔑 Mise en location
- 🔨 Travaux / Rénovation
- 📋 Gestion copropriété / syndic
- ❓ Autre (champ libre)

**Impact :** détermine complètement la logique de la suite.

---

### Étape 2 — Votre bien

Regroupement logique de plusieurs questions sur un écran, responsive.

**Questions :**

a. *« Type de bien »* (radio)
- Maison
- Appartement
- Immeuble entier
- Local commercial / professionnel
- Parties communes copropriété
- Terrain
- Cave, garage, dépendance
- Autre

b. *« Adresse du bien »* (autocomplete BAN)
Pré-remplissage code postal + ville auto via l'API adresse.data.gouv.fr.
Si code postal hors département 37 ou proche (41, 36, 72, 49, 86) → alerte pédagogique : « Nous intervenons principalement en Indre-et-Loire, confirmez votre demande pour vérifier notre disponibilité. »

c. *« Surface habitable »* (number)
Champ numérique simple avec unité « m² » à droite.

d. *« Nombre de pièces principales »* (select)
1 (studio) / 2 / 3 / 4 / 5 / 6 / 7+

e. *« S'agit-il d'une copropriété ? »* (radio)
Oui / Non / Je ne sais pas

**Condition d'affichage :** si Étape 1 = « Gestion copropriété », saut direct vers Étape 4 avec présélection type = Immeuble/Parties communes.

---

### Étape 3 — Votre email (capture progressive)

**Écran dédié, minimal.**

Texte :
> Encore 3 étapes pour recevoir votre estimation personnalisée.
>
> Laissez-nous votre email pour vous envoyer un récapitulatif détaillé et un devis définitif sous 2h ouvrées.

Champ : email uniquement (validation Zod stricte).
Bouton : « Continuer ».
Mention RGPD discrète : « Pas de spam. Vos données restent chez nous (RGPD). »

**Technique :** à la soumission, insert en base d'un brouillon `quote_requests` avec statut `draft`. Tout abandon ultérieur = lead capturé, relance J+1 par email automatique.

---

### Étape 4 — Caractéristiques techniques

Questions en fonction de Étape 1 et Étape 2.

a. *« Date du permis de construire »* (radio visuels)
- Avant janvier 1949 → peintures plomb obligatoires
- Entre 1949 et juillet 1997 → amiante possible
- Après juillet 1997 → plus d'amiante
- Je ne sais pas (fallback : on pose questions complémentaires ou on attribue le pire cas)

b. *« Mode de chauffage principal »* (radio)
- Gaz
- Électrique
- Bois
- Fioul
- Pompe à chaleur
- Autre / mixte
- Je ne sais pas

c. Si chauffage = Gaz OU si bien équipé gaz (déclaré en d.) :
*« L'installation de gaz date de plus de 15 ans ? »* Oui / Non / Je ne sais pas

d. *« Installation gaz présente ? »* (si pas déjà répondu via c.)
- Aucune
- Gaz de ville
- Citerne extérieure
- Bouteilles
- Compteur présent sans abonnement actif

e. *« Installation électrique datant de plus de 15 ans ? »* Oui / Non / Je ne sais pas

**Affichage conditionnel :** si Étape 1 = Travaux → étape 4 adaptée avec questions spécifiques amiante avant travaux / démolition / plomb avant travaux.

---

### Étape 5 — Délai et précisions

a. *« Dans quel délai souhaitez-vous l'intervention ? »*
- Dès que possible (<48h)
- Sous une semaine
- Sous deux semaines
- Dans le mois
- Pas pressé / à planifier

b. *« Un message ou une précision ? »* (textarea facultatif)

c. *« Des documents à joindre ? »* (upload facultatif)
Accepte : PDF, JPG, PNG. Max 10Mo.
Suggestions : « plans, diagnostics précédents, attestations existantes ».

---

### Étape 6 — Récapitulatif et confirmation

**C'est l'écran clé de conversion. Soigner au maximum.**

Structure :

**Bloc 1 — Diagnostics obligatoires identifiés** (calculés automatiquement)

Liste claire avec icône + libellé + mini-explication de pourquoi c'est obligatoire.
Exemple :
- ✅ **DPE** — Obligatoire pour toute vente de logement
- ✅ **Amiante** — Votre permis est antérieur à juillet 1997
- ✅ **ERP (État des Risques)** — Indre-et-Loire concerné par plusieurs risques
- ✅ **Loi Carrez** — Bien en copropriété
- ✅ **Termites** — Département classé par arrêté préfectoral

**Bloc 2 — Estimation tarifaire**

Mise en avant visuelle :
> Entre **340€ et 520€** TTC
>
> Devis définitif sous 2h ouvrées après validation

Disclaimer :
> Estimation indicative basée sur les tarifs en vigueur au 01/01/2026. Le devis final prend en compte les caractéristiques précises de votre bien et votre secteur géographique.

**Bloc 3 — Vos coordonnées**

Champs :
- Civilité (M. / Mme)
- Nom + prénom
- Téléphone (optionnel mais recommandé : « pour accélérer la prise de RDV »)

**Bloc 4 — Consentement et soumission**

- Case à cocher RGPD (texte court, pas juridique)
- Bouton principal large : **« Envoyer ma demande »**

---

## 3. Écran post-soumission

Texte :
> **Merci [Prénom], votre demande est bien reçue !**
>
> Un récapitulatif a été envoyé à [email]. Notre équipe vous contactera sous 2h ouvrées pour valider votre devis et planifier l'intervention.
>
> En attendant, découvrez nos articles récents sur les obligations DPE 2026.

CTAs :
- [Voir les actualités]
- [Retour à l'accueil]

Envoi email côté client ET côté Servicimmo en parallèle.

---

## 4. Règles métier — calcul des diagnostics obligatoires

### Tableau décisionnel principal

| Diagnostic | Condition d'obligation |
|---|---|
| **DPE** | Vente ou location de logement (sauf exceptions rares : monuments historiques, lieux de culte, <50 m², biens à démolir). Pour les locaux tertiaires : DPE tertiaire si vente/location. |
| **Plomb (CREP)** | Permis de construire **antérieur au 1er janvier 1949**, logement (vente + location). Ne concerne pas les locaux pros. |
| **Amiante** | Permis de construire **antérieur au 1er juillet 1997**, tous bâtiments (vente). Pour location : DAPP uniquement parties privatives du logement. Pour copropriétés : DTA parties communes. |
| **Termites** | Zone déclarée par arrêté préfectoral. **L'Indre-et-Loire entier est concerné** depuis arrêté du 27 février 2018. Vente uniquement. Validité 6 mois. |
| **Gaz** | Vente ou location d'un logement avec installation gaz de **plus de 15 ans**. |
| **Électricité** | Vente ou location d'un logement avec installation électrique de **plus de 15 ans**. |
| **Loi Carrez** | Vente d'un lot de **copropriété** avec surface privative ≥ 8 m². |
| **Loi Boutin** | Location de **logement vide** à usage de résidence principale. |
| **ERP (ex-ESRIS / ERNMT)** | Toujours obligatoire en vente et location. Liste de risques à intégrer selon commune (inondation, sismique, radon, RGA, etc.). **L'Indre-et-Loire est concerné par RGA notamment.** Validité 6 mois. |
| **État des lieux entrant** | Location uniquement, obligatoire à l'entrée et à la sortie du locataire. |
| **Audit énergétique** | Vente d'un logement classé F ou G au DPE depuis avril 2023, puis E depuis 2025, D depuis 2034. *À affiner selon calendrier officiel.* |
| **DPE collectif** | Copropriétés de plus de 50 lots depuis 2024, toutes depuis 2025-2026. *À affiner.* |
| **Attestation RT 2012 / RE 2020** | Construction neuve uniquement (permis après 2013 pour RT2012, après 2022 pour RE2020). |

### Règles contextuelles (travaux / démolition)

Si Étape 1 = Travaux :
- **Amiante avant travaux (RAT)** si bâtiment pré-1997
- **Plomb avant travaux** si bâtiment pré-1949
- **Mesures d'empoussièrement** si chantier amiante identifié
- **Constat visuel après travaux** après chantier désamiantage
- **Amiante enrobés (HAP)** si intervention voirie / infrastructure

---

## 5. Règles d'estimation tarifaire

**Important :** ces tarifs sont des fourchettes de marché à titre indicatif. À valider et calibrer avec Servicimmo avant mise en prod.

### Tarifs de base (2026)

| Diagnostic | Min | Max |
|---|---|---|
| DPE maison | 110€ | 220€ |
| DPE appartement | 90€ | 180€ |
| DPE collectif | sur devis | sur devis |
| DPE tertiaire | 200€ | 800€ |
| Amiante maison | 80€ | 150€ |
| Amiante appartement | 70€ | 130€ |
| Plomb (CREP) | 110€ | 220€ |
| Termites | 90€ | 170€ |
| Gaz | 90€ | 130€ |
| Électricité | 90€ | 130€ |
| Loi Carrez | 60€ | 110€ |
| Loi Boutin | 60€ | 110€ |
| ERP | 20€ | 40€ |
| État des lieux | 150€ | 300€ |
| DTA | sur devis | sur devis |
| Amiante avant travaux | 250€ | 600€ |

### Modulateurs

- **Surface ≤ 40 m²** : -10% sur chaque diagnostic
- **Surface 40-80 m²** : tarif de base
- **Surface 80-150 m²** : +10%
- **Surface >150 m²** : +20% ou sur devis
- **Urgence <48h** : +20%
- **Zone > 30 km de Tours** : +15% ou sur devis
- **Pack complet (3+ diagnostics)** : -15% sur le total

### Affichage

Additionner les diagnostics obligatoires calculés, appliquer modulateurs, afficher fourchette arrondie à la dizaine.

Exemple pour vente d'une maison de 110 m² à Joué-lès-Tours, permis 1985, chauffage gaz >15 ans :
- DPE maison : 110-220€
- Amiante : 80-150€
- Termites : 90-170€
- Gaz : 90-130€
- Électricité : 90-130€ (si >15 ans aussi)
- ERP : 20-40€

Total brut : 480€ - 840€
Modulateur surface (+10%) : 528€ - 924€
Pack complet (-15%) : **449€ - 786€**

Affichage : « Entre **450€ et 790€** TTC »

---

## 6. Flow technique (schéma synthétique)

```
[Étape 1] ─┐
           ├─> valid? ──> insert draft quote_requests (no email yet)
[Étape 2] ─┘
           │
[Étape 3 (email)]
           │
           ├─> update quote_requests.email, status='email_captured'
           │   └─> trigger relance J+1 si pas de completion
[Étape 4] ─┐
           ├─> update quote_requests.details
[Étape 5] ─┘
           │
[Étape 6 : récap]
           │
           ├─> call POST /api/calculate
           │     - reçoit état du form
           │     - retourne diagnostics obligatoires + estimation prix
           │
           ├─> user valide et soumet
           │     - update quote_requests.status='submitted'
           │     - send email to client (devis récap PDF attaché)
           │     - send email to servicimmo team (nouvelle demande)
           │     - notification dashboard admin
           │
           └─> redirect écran de confirmation
```

---

## 7. Cas limites à gérer

| Cas | Comportement |
|---|---|
| Utilisateur hors zone d'intervention | Alerte en étape 2, mais permettre la soumission (peut-être un prescripteur externe) |
| « Je ne sais pas » à toutes les questions techniques | Ne pas bloquer. Afficher : « Nos experts identifieront cela lors du RDV » en récap |
| Surface = 0 ou incohérente | Validation Zod bloque avant Étape 6 |
| Email invalide / jetable | Validation format + check domaines jetables (liste open-source) |
| Téléphone invalide | Format libre mais validation longueur ≥ 8 |
| Upload >10Mo | Message d'erreur clair, suggérer compression |
| Reprise après abandon | localStorage restore + bouton « Reprendre ma demande » sur accueil |
| Multi-device | Magic link envoyé dans l'email de capture : permet de reprendre depuis un autre appareil |

---

## 8. Ce qu'il reste à valider avec Servicimmo

Avant implémentation, confirmer :

1. [ ] Les tarifs de base réels 2026 (section 5)
2. [ ] Les zones d'intervention et surcoûts kilométriques
3. [ ] Les remises pack (3+, 5+ diagnostics)
4. [ ] Les délais d'intervention réels possibles (sous 48h réaliste ?)
5. [ ] Le texte exact du consentement RGPD
6. [ ] La destination email des notifications internes
7. [ ] L'accord sur le principe « estimation indicative, devis définitif sous 2h »
8. [ ] Les règles fines pour les cas tertiaire / industriel / enrobés (hors périmètre particulier)
9. [ ] Le workflow interne après réception : qui traite, sous quel délai, quel outil utilisé (Liciel ?)
10. [ ] Si on intègre la prise de RDV directe ou si on reste en « contact sous 2h »
