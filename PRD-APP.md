# PRD Phase 1 — Servicimmo Pilote

> **Version** : 1.0 finale (22/04/2026)
> **Basé sur** : analyse Diag Pilote + besoins Servicimmo
> **Durée cible** : 10-12 semaines avec Claude Code

---

## 1. Objectif

Livrer à Servicimmo (cabinet de diagnostic immobilier à Tours) une plateforme interne qui remplace leurs outils actuels (Excel, papier, outils dispersés) par une solution unifiée qui centralise **dossiers, clients, prescripteurs, devis, factures, paiements, portail**.

**Pas de modules de saisie de diagnostic en Phase 1.** Les diags restent faits dans leur outil actuel (Liciel probablement) ; les rapports PDF sont uploadés manuellement dans le dossier Servicimmo Pilote en attendant la Phase 2.

## 2. Personas

| Persona | Rôle | Accès |
|---------|------|-------|
| **Admin cabinet** | Direction Servicimmo | Total : dossiers, facturation, paramètres, tous les techniciens |
| **Diagnostiqueur** | Collaborateur terrain | Ses dossiers, ses devis, ses factures, son agenda |
| **Client final** | Particulier qui fait faire le diag | Portail read-only : devis à signer, factures, rapports (magic link) |
| **Prescripteur** | Agence immo, notaire, mandataire | Portail read-only : dossiers apportés, factures, rapports (magic link) |

## 3. Critères de succès V1

- ✅ Création d'un dossier complet en < 3 minutes via wizard 10 étapes
- ✅ Devis générable en PDF et envoyable en 1 clic
- ✅ Paiement en ligne fonctionnel (Stripe Checkout)
- ✅ Portail client/prescripteur accessible sans création de compte
- ✅ Export FEC conforme à la réglementation française
- ✅ 100% des données migrables depuis leurs outils actuels
- ✅ Mobile-friendly (responsive, utilisable sur tablette terrain)

---

## 4. Features (27 features numérotées)

### 🔐 AUTHENTIFICATION

#### F-01 · Authentification utilisateurs internes
**User story** : en tant qu'admin ou diagnostiqueur, je veux me connecter à la plateforme avec mes identifiants pour accéder à mon espace.

- Login email + password (Supabase Auth)
- Magic link en fallback
- Reset password par email
- Remember me (session 30 jours)
- 2FA TOTP optionnel (paramètre utilisateur)

**Critères d'acceptation** :
- Redirection automatique vers /login si non connecté
- RLS Supabase empêche toute fuite de données cross-utilisateur
- Rate limiting sur les tentatives (5/minute)

#### F-02 · Portail externe (clients + prescripteurs)
**User story** : en tant que client ou prescripteur, je veux accéder à mes dossiers sans créer de compte.

- Accès via magic link envoyé par email à chaque nouvelle notification
- Token signé (JWT) avec expiration 30 jours, renouvelable
- Pas de mot de passe, pas d'inscription
- Cookie de session valide 24h après clic sur le magic link

---

### 👥 CONTACTS (clients + prescripteurs unifiés)

#### F-03 · CRUD Contact
**User story** : en tant qu'utilisateur, je veux gérer mes contacts (clients, agences, notaires, etc.) en un seul endroit.

**Champs** :
- Type (enum : `client`, `agence`, `notaire`, `proprietaire`, `fournisseur`, `autre`)
- Civilité, prénom, nom
- Raison sociale (optionnel, pour les pros)
- SIRET (optionnel) — si présent, bouton "Enrichir via Pappers API"
- Email, téléphone
- Adresse, code postal, ville
- Notes (textarea)
- **Partage société** (checkbox) : si coché, visible par tous les users Servicimmo ; sinon, privé au créateur
- **Créer un compte utilisateur pour ce contact** (checkbox) : génère les accès portail, rôle adapté au type

**Vues** :
- Liste avec colonnes customizables : Nom, Email, Téléphone, Type, Nb dossiers, Accès, Partage, Créé le, Actions
- Fiche détail avec historique des dossiers
- Recherche texte + filtres (type, partage)
- Import CSV, Export CSV

**Critères d'acceptation** :
- Un contact avec SIRET valide se pré-remplit via API Pappers
- La suppression est soft (archive), pas hard
- Empêcher la suppression si des dossiers actifs sont liés

#### F-04 · Enrichissement SIRET (Pappers API)
Bouton "Enrichir" sur fiche contact pro → appel API Pappers → pré-remplissage (raison sociale, adresse, dirigeants, activité).

Déjà utilisé sur d'autres projets Propul'seo, on réutilise l'intégration.

---

### 📁 DOSSIERS (entité pivot)

#### F-05 · Wizard création dossier (10 étapes)

Le parcours UX le plus critique. **Pas un formulaire géant**, un wizard séquentiel.

| # | Étape | URL | Champs |
|---|-------|-----|--------|
| 0 | Transaction | `/dossiers/new/transaction` | Vente / Location |
| 1 | Localisation | `/dossiers/new/localisation` | CP, Ville, Adresse (autocomplete API BAN) |
| 2 | Type de bien | `/dossiers/new/bien` | 9 options (Appartement, Maison, Local, Cave/Box, Immeuble, Partie commune, Terrain, Grange, Château) |
| 3 | Construction | `/dossiers/new/construction` | Tranche (`avant_1949` / `1949_1997` / `1997_2010` / `apres_2010`) + année exacte optionnelle |
| 4 | Surface | `/dossiers/new/surface` | Surface habitable (m²) |
| 5 | Gaz | `/dossiers/new/gaz` | Oui / Non / Je ne sais pas |
| 6 | Annexes | `/dossiers/new/annexes` | Cave, Garage, Comble, Dépendance, Grenier (multi) |
| 7 | Contacts | `/dossiers/new/contacts` | Propriétaire, Apporteur d'affaire, Facturation (tous optionnels, FK contacts) |
| 8 | RDV | `/dossiers/new/rdv` | Titre (auto), Technicien, Date, Heure, Durée, Trajet avant/après, Description |
| 9 | Diagnostics | `/dossiers/new/diagnostics` | Dual-list avec **bouton "Recalculer"** qui réévalue selon les paramètres |

**Règles métier "Recalculer"** :
- Si `annee_construction_tranche = avant_1949` → suggérer Plomb (CREP)
- Si `annee_construction_tranche ∈ [avant_1949, 1949_1997]` → suggérer Amiante
- Si `gaz = oui` → suggérer Diagnostic Gaz
- Si `transaction = vente` → toujours suggérer DPE, ERP, Termites
- Si `transaction = location` → DPE, ERP, Carrez (si copro)
- Si `type_bien = appartement` → suggérer Carrez (vente) ou Boutin (location)
- Électricité : si installation > 15 ans (calculée depuis date construction ou champ dédié)

**UX patterns obligatoires** :
- Auto-save en brouillon à chaque changement (debounce 500ms)
- Toast "Dossier sauvegardé" quand on clique Sauvegarder
- Bouton "Continuer" (jaune) + "Sauvegarder" (noir) en bas de chaque étape
- Bouton "Abandonner" (rouge, confirmation modale) pour trash le draft
- Breadcrumb des étapes en bas : `Vente » Localisation » Bien » ...`
- Peut revenir en arrière sans perdre les données

#### F-06 · Liste des dossiers (vue tableau)

URL : `/dossiers`

- Tabs filtres par statut : **Actifs · Refusés · Annulés · Terminés · Archivés · Tous**
- Colonnes customizables (dropdown "Colonnes" avec checkboxes) :
  - ID (`#00110`)
  - Référence externe (libre)
  - **Tx. complétion** (donut %)
  - Technicien (avatar rond)
  - RDV (date + heure)
  - Contacts (3 lignes)
  - Résumé (tags empilés : transaction, type bien, surface, construction, adresse)
  - Fichiers (compteur DDT)
  - Devis/Facture (badges statut)
  - Infos (N° lot, Id fiscal, Chauffage collectif, Gaz)
  - Annexes (liste texte)
  - Diagnostics (liste texte)
- Recherche texte libre (nom client, adresse, n° dossier)
- Pagination (25/50/100 par page)
- Tri par colonne

#### F-07 · Vue Kanban des dossiers

URL : `/dossiers?view=kanban`

- Toggle vue liste ↔ vue Kanban
- Colonnes : statuts (Brouillon, Actif, Attente RDV, Attente Rapport, Facturé, Payé, Clôturé)
- Drag & drop entre colonnes pour changer le statut
- Cartes avec résumé dossier + contacts + prochaine action

#### F-08 · Vue détail dossier

URL : `/dossiers/[id]`

**Header** : tabs horizontaux
- `Dossier` (vue principale)
- `Infos` (métadonnées complémentaires)
- `Devis`
- `Documents` (fichiers)
- `Journal` (communications)
- `Notes` (internes + rappels)
- `Demande` (demande docs au client)
- `Export`

**Corps — Informations principales** (panneau gauche) :
- Référence libre (éditable)
- Toggle Verrouillé/Déverrouillé (DDT)
- Technicien (dropdown users)
- Transaction, Type bien, Adresse, CP, Ville
- Surface, Construction, Année exacte
- Gaz (Oui/Non/N/C), Annexes
- N° lot, Id fiscal, Chauffage collectif

**Panneau droit** :
- **Carte Contacts** : 3 rôles (Propriétaire*, Apporteur d'affaire, Facturation) + bouton "+ Nouveau"
- **Carte Rendez-vous** : date/créneau, technicien, bouton "Modifier" + lien "Agenda"

**Section Diagnostics** :
- Dual-list : "Diags. dispo." ↔ "Diags. sélectionnés" + boutons +/- au milieu
- Recherche dans chaque liste
- **Bouton "Recalculer"** (recalcule selon paramètres dossier)
- Bouton "Enregistrer toutes les modifications" en bas

**Taux de complétion** (donut affiché en haut) :
- Calculé sur : présence propriétaire, présence RDV, diagnostics sélectionnés, devis accepté, documents consentement uploadés, facture émise, paiement encaissé, rapport uploadé
- Affiché aussi dans la colonne "Tx." de la liste

#### F-09 · Infos complémentaires du dossier

Onglet `Infos` → formulaire :
- **Numéro de lot** (avec pattern "Renseigner / Non requis")
- **Identifiant fiscal** (13 chiffres, avec lien "aide")
- **Chauffage collectif** (Oui/Non)
- **Options dossier** (toggles Oui/Non) :
  - Dossier prioritaire (affiche icône dans la liste)
  - Relances paiements automatiques
  - Demande d'avis client post-mission

**Formulaire de consentement** :
- Bouton "Envoyer la demande" → email au propriétaire avec lien vers formulaire de consentement RGPD à signer électroniquement
- Retour de signature stocké avec horodatage + IP

---

### 📅 AGENDA / PLANNING

#### F-10 · Vue agenda

URL : `/agenda`

- 4 vues : **Mois · Semaine (défaut) · Jour · Planning (vue par technicien)**
- Navigation : `<`, `>`, `Aujourd'hui`
- Grille horaire 00h-24h (créneaux 1h, découpés visuellement en 15min)
- Ligne "Journée" pour events all-day

**RDV affiché** :
- Bloc coloré (couleur choisie à la création)
- Survol → tooltip avec : titre, liste diags, adresse, date/heure, trajet avant, durée, trajet après, présence
- Clic → modal édition

#### F-11 · Modal RDV (création + édition)

**Champs** :
- Titre
- Description (textarea, auto-rempli avec liste des diags du dossier lié)
- Date / Heure / Durée (dropdown 15min, 30min, 45min, 1h, 1h30, 2h, custom)
- Trajet avant (min) / Trajet après (min)
- **Dossier lié** (dropdown searchable) — si vide, création automatique d'un dossier brouillon
- Personne présente au RDV (dropdown contacts du dossier + bouton "Créer un nouveau contact")
- Couleur (color picker)

**Boutons** : `Annuler` / `Mettre à jour` (ou `Créer`)

---

### 💰 DEVIS & FACTURATION

#### F-12 · Création devis depuis un dossier

Depuis `/dossiers/[id]` onglet `Devis` :

- 2 modes : **"Établir un devis détaillé"** (ligne par ligne) ou **"Établir un devis forfaitaire"** (montant global)
- Section **"Tarif calculé (grille tarifaire)"** — affichage des prix calculés auto selon les diags sélectionnés + règles de majoration (voir F-14)
- Section **"Devis & Facturation"** — tableau éditable pré-rempli depuis la grille :
  - Description · Unité (par défaut `diagnostic`) · Qté · PU HT · Total ligne HT · Bouton supprimer ligne
  - Toggle "Calculer totaux automatiquement"
  - Champ TVA % (20 par défaut)
  - Bouton "Enregistrer le devis"

#### F-13 · Création devis standalone

URL : `/devis/new`

Pour facturer hors dossier (formations, prestations annexes, etc.).

- **Associer à un dossier** (dropdown searchable, facultatif)
- **Sélectionner un contact** (dropdown, obligatoire — astérisque rouge)
- Tableau de lignes libre + `+ Ajouter une ligne`
- Commentaire (textarea)
- Résumé : Sous-total HT / TVA / Total TTC
- Bouton "Enregistrer"

#### F-14 · Moteur de tarification

**Deux composants** :

**a) Grille tarifaire** (`/parametres/grille-tarifaire`) :
- Liste des `diagnostic_types` avec prix unitaire HT et TVA par défaut
- CRUD paramétrable par admin

**b) Règles de majoration** (`/parametres/regles-majoration`) :
- Règles conditionnelles, chacune avec :
  - Code (ex: `TRAVEL_FEE`, `AREA_ABOVE_HAB`, `URGENT_DELAY`)
  - Libellé
  - Condition (JSON Logic ou similaire) — ex: `{"gt": [{"var": "bien.surface_m2"}, 100]}`
  - Formule (montant fixe ou pourcentage ou formule custom) — ex: `{"add": [{"multiply": [{"var": "bien.surface_m2"}, 0.5]}, 0]}`
  - Actif (bool)

**Règles de base à livrer** :
- `TRAVEL_FEE` : majoration kilométrique si adresse > 30 km du cabinet
- `AREA_ABOVE_HAB` : majoration de 0,50 €/m² pour surface > 100 m²
- `URGENT_DELAY` : +30% si RDV demandé sous 48h

**Vue dans le devis** : tableau récapitulatif avec sous-total base + sous-total majorations + Total HT.

#### F-15 · Génération PDF devis

- Template unique V1 (paramétrable : logo, couleurs, mentions légales, pied de page)
- Génération via `@react-pdf/renderer` ou `pdf-lib`
- URL du PDF stockée dans `devis.pdf_url` (Supabase Storage)
- Régénération automatique si devis modifié avant envoi

#### F-16 · Envoi devis par email

- Bouton "Envoyer au client" sur la fiche devis
- Email via Resend avec template React Email :
  - PDF en pièce jointe
  - Lien magic vers portail client avec page d'acceptation
- Trace dans `journal_communications`

#### F-17 · Acceptation devis par le client

URL portail : `/portail/devis/[token]`

- Affichage du devis (lecture)
- Case à cocher "J'accepte ce devis"
- Champ signature (nom complet) + timestamp + IP stockés
- Bouton "Valider mon acceptation"
- Statut devis → `accepte`, envoi notification à l'admin + diagnostiqueur

#### F-18 · Factures

- Génération facture depuis un devis accepté (report de toutes les lignes)
- Création manuelle aussi possible
- **Numérotation séquentielle légale** `FA-YYYY-NNNNN` (aucune rupture, aucune modification post-émission)
- **Immuabilité** : une fois émise, une facture ne peut plus être modifiée — il faut émettre un avoir (`AV-YYYY-NNNNN`)
- Statuts : `brouillon`, `emise`, `payee`, `partiellement_payee`, `en_retard`, `annulee` (via avoir)
- PDF généré + envoi email avec lien Stripe Checkout

#### F-19 · Paiements Stripe

- Lien Stripe Checkout unique par facture (expiration 30 jours, renouvelable)
- Webhook Stripe `checkout.session.completed` → MAJ statut facture → `payee`
- **Réconciliation manuelle** : bouton "Enregistrer un paiement" pour virement/chèque/espèces hors Stripe
- Multi-paiements possibles par facture (acomptes)
- Historique des paiements dans la fiche facture

#### F-20 · Relances paiements automatiques

Si facture `en_retard` et option `relances_paiements = true` sur le dossier :
- J+7 après échéance : email de relance (ton courtois)
- J+15 : deuxième relance (ferme)
- J+30 : troisième relance (mise en demeure)

Scheduled job (Supabase cron ou Vercel cron) quotidien.

#### F-21 · Export FEC ⚠️ OBLIGATION LÉGALE

URL : `/facturation/export-fec`

- Sélecteur période (exercice comptable)
- Génération fichier texte tabulé 18 colonnes au format FEC officiel
- Encodage UTF-8, séparateur `|`, EOL `\r\n`
- Contient toutes les écritures de la période : ventes, encaissements, avoirs
- Téléchargement .txt

Spécifications : https://www.impots.gouv.fr/portail/fichier-des-ecritures-comptables

---

### 🗂 DOCUMENTS & FICHIERS

#### F-22 · Gestion des fichiers par dossier

Onglet `Documents` sur fiche dossier :

3 zones drag & drop :
1. **Documents annexes** (plans, photos, scans...)
2. **DDT** (Dossier de Diagnostic Technique final — bouton "Transmettre au client")
3. **Consentement** (formulaire signé RGPD)

- Max 20 fichiers par zone, 50 MB par fichier
- Supabase Storage avec policies RLS
- Prévisualisation inline pour PDF/images
- Bouton download / supprimer par fichier

---

### 📬 DEMANDE DE DOCUMENTS (feature majeure)

#### F-23 · Demande documentaire au client

Onglet `Demande` sur fiche dossier → modal "Demander des documents" :

**Sections** :
1. **Destinataires** (parmi contacts du dossier)
2. **Modèle** (dropdown pré-enregistrés + "Sélection manuelle") + bouton "Sauvegarder" (créer modèle)
3. **Documents** à demander (chacun tagué par diag : `DPE`, `GAZ`, `AMIANTE`, `ELEC`, `CREP`, `TOUS`, `COPRO`) :
   - Factures énergie (élec, gaz, fioul, bois)
   - Attestations entretien (chaudière, PAC, VMC)
   - Plan du logement, acte notarié, règlement copro, carnet d'entretien copro
   - Diagnostics précédents (DPE, amiante, plomb)
   - Permis de construire
   - Photos (façade, compteurs, tableau élec, chaudière, ballon, VMC, radiateurs)
   - Certificats conformité (gaz, élec)
   - Factures travaux (isolation, chauffage, fenêtres)
4. **Informations** (champs textuels) :
   - N° lot, identifiant fiscal, année construction, surface, syndic, cadastre, PDL, PCE, travaux, sinistres, observations, accès
5. **Questions structurées** :
   - Type chauffage principal, ECS, vitrage, VMC, climatisation, énergie
6. **Éléments personnalisés** : upload / texte court / texte long
7. **Message personnalisé** (textarea)
8. **Canal** : Email (V1) / SMS (V2)

**Flow** :
- Envoi → email au destinataire avec magic link vers formulaire portail
- Destinataire remplit, upload docs, répond aux questions
- Soumission → tout est stocké dans le dossier, tagué
- Notification admin/diagnostiqueur
- Statut demande : `brouillon`, `envoyee`, `en_cours`, `completee`

#### F-24 · Modèles de demande

URL : `/parametres/modeles-demande`

- CRUD de modèles réutilisables (structure pré-cochée de documents + infos + questions)
- Exemples livrés : "Diag complet vente", "DPE seul", "Location meublée"

---

### 📊 DASHBOARD & STATISTIQUES

#### F-25 · Dashboard admin

URL : `/dashboard`

**Colonne principale** :
- **Mes RDV** : Aujourd'hui (nb + prochain) + Cette semaine (nb + prochain)
- **Chiffres clés** (date range picker, défaut = mois en cours) :
  - Graphique 12 mois glissants : Dossiers (bar) + Total facturé HT (ligne) + Encaissements (ligne)
  - 3 tuiles synthèse : Dossiers / Facturation HT / Encaissements TTC
  - Lien "Statistiques détaillées" → `/statistiques`
- **Liste "À faire aujourd'hui"** : RDV du jour + relances à envoyer + devis à relancer

**Colonne latérale** :
- **Dossiers récents** (5 derniers)
- **Factures impayées** (top 5 par montant)

Version diagnostiqueur : idem mais filtré sur ses propres dossiers.

#### F-26 · Page Statistiques

URL : `/statistiques`

**Période paramétrable** en haut à droite (date range).

**KPI (6 tuiles)** avec évolution vs période précédente :
- Dossiers créés
- Dossiers terminés
- CA facturé HT
- CA encaissé TTC
- Taux de conversion (devis → facture)
- Panier moyen TTC

**Graphiques (V1 Must Have)** :
1. Chiffre d'affaires : courbe double (facturé vs encaissé), 12 mois glissants
2. Répartition par statut : donut
3. Top diagnostics demandés : bar horizontal
4. **Lead times du funnel** (4 tuiles) :
   - Dossier → RDV
   - Dossier → Devis
   - Devis → Facture
   - Facture → Paiement
5. Performance par technicien (tableau : Dossiers / RDV / CA HT / CA encaissé / Panier moyen)
6. Récapitulatif mensuel (tableau + bouton "Export CSV")

**V2 Should Have** (à garder dans le backlog) :
- Répartition géographique (par département)
- Répartition type de bien / type de transaction
- Graphique activité mensuelle (dossiers, RDV réalisés, RDV annulés)
- Analyse facturation (devis émis, factures émises, taux conversion)

---

### ⚙️ PARAMÈTRES

#### F-27 · Paramètres cabinet

URL : `/parametres`

Sections :
- **Infos cabinet** : nom, SIRET, logo, adresse, téléphone, email, mentions légales
- **Design** : couleur primaire, couleur secondaire (pour PDFs et emails)
- **Utilisateurs** : CRUD users, invitation par email, rôles (admin/diagnostiqueur)
- **Catalogue prestations** : CRUD prestations avec PU HT et TVA
- **Grille tarifaire** : CRUD prix par diagnostic type
- **Règles de majoration** : CRUD règles conditionnelles
- **Modèles de demande documents** : CRUD modèles
- **Numérotation** (lecture seule) : préfixes et compteurs courants
- **Email** : config expéditeur Resend (from, reply-to)
- **Stripe** : lien compte Stripe + webhook URL

---

## 5. Modèle de données complet

```sql
-- Extension du schéma dans ANALYSE-DIAG-PILOTE.md §8
-- Ajouts / ajustements depuis analyse part 2

-- Contacts unifiés (clients + prescripteurs + autres)
CREATE TYPE contact_type AS ENUM ('client', 'agence', 'notaire', 'proprietaire', 'fournisseur', 'autre');

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type contact_type NOT NULL DEFAULT 'client',
  civilite TEXT,
  prenom TEXT,
  nom TEXT NOT NULL,
  raison_sociale TEXT,
  siret TEXT,
  email TEXT,
  telephone TEXT,
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  notes TEXT,
  partage_societe BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES auth.users(id), -- si compte portail créé
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- Dossiers
CREATE TYPE dossier_statut AS ENUM ('brouillon', 'actif', 'attente_rdv', 'attente_rapport', 'facture', 'paye', 'cloture', 'refuse', 'annule', 'archive');
CREATE TYPE transaction_type AS ENUM ('vente', 'location');
CREATE TYPE type_bien AS ENUM ('appartement', 'maison', 'local_bureau', 'cave_box_parking', 'immeuble', 'partie_commune', 'terrain', 'grange_dependance', 'chateau');
CREATE TYPE annee_tranche AS ENUM ('avant_1949', '1949_1997', '1997_2010', 'apres_2010');
CREATE TYPE oui_non_nc AS ENUM ('oui', 'non', 'nc');

CREATE TABLE dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE NOT NULL, -- #00110
  reference TEXT,
  statut dossier_statut NOT NULL DEFAULT 'brouillon',
  transaction transaction_type NOT NULL,

  -- bien
  type_bien type_bien NOT NULL,
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  surface_m2 NUMERIC(8,2),
  annee_construction_tranche annee_tranche,
  annee_construction_exacte INT,
  gaz oui_non_nc DEFAULT 'nc',
  annexes TEXT[], -- array: cave, garage, comble, dependance, grenier

  -- métadonnées complémentaires
  numero_lot TEXT,
  identifiant_fiscal TEXT,
  chauffage_collectif BOOLEAN,

  -- assignations (FK)
  technicien_id UUID REFERENCES auth.users(id),
  proprietaire_id UUID REFERENCES contacts(id),
  apporteur_affaire_id UUID REFERENCES contacts(id),
  facturation_id UUID REFERENCES contacts(id),

  -- options
  prioritaire BOOLEAN DEFAULT false,
  relances_paiements BOOLEAN DEFAULT true,
  avis_client BOOLEAN DEFAULT false,
  verrouille_ddt BOOLEAN DEFAULT false,

  -- calculé
  completion_pct INT DEFAULT 0,

  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diagnostic types (table de référence)
CREATE TABLE diagnostic_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- dpe, amiante, plomb_crep, elec, gaz, termites, carrez, boutin, erp
  libelle TEXT NOT NULL,
  prix_ht_default NUMERIC(10,2),
  tva_pct_default NUMERIC(5,2) DEFAULT 20,
  ordre INT DEFAULT 0
);

-- Liaison dossier ↔ diagnostics (n-n)
CREATE TABLE dossier_diagnostics (
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  diagnostic_type_id UUID REFERENCES diagnostic_types(id),
  ordre INT DEFAULT 0,
  PRIMARY KEY (dossier_id, diagnostic_type_id)
);

-- Rendez-vous
CREATE TABLE rendez_vous (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES dossiers(id), -- nullable : auto-création dossier si NULL
  titre TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  heure_debut TIME NOT NULL,
  duree_min INT NOT NULL DEFAULT 60,
  marge_avant_min INT DEFAULT 10,
  marge_apres_min INT DEFAULT 10,
  technicien_id UUID REFERENCES auth.users(id),
  presence_contact_id UUID REFERENCES contacts(id),
  couleur TEXT DEFAULT '#000000',
  statut TEXT DEFAULT 'planifie',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Devis
CREATE TYPE devis_statut AS ENUM ('brouillon', 'envoye', 'accepte', 'refuse', 'expire');
CREATE TYPE devis_type AS ENUM ('detaille', 'forfaitaire');

CREATE TABLE devis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE NOT NULL, -- DV-2026-00001
  dossier_id UUID REFERENCES dossiers(id), -- nullable : devis standalone
  contact_id UUID NOT NULL REFERENCES contacts(id),
  type devis_type DEFAULT 'detaille',
  statut devis_statut DEFAULT 'brouillon',
  total_ht NUMERIC(10,2) DEFAULT 0,
  total_tva NUMERIC(10,2) DEFAULT 0,
  total_ttc NUMERIC(10,2) DEFAULT 0,
  tva_pct NUMERIC(5,2) DEFAULT 20,
  commentaire TEXT,
  pdf_url TEXT,
  envoye_le TIMESTAMPTZ,
  accepte_le TIMESTAMPTZ,
  accepte_par_ip TEXT,
  accepte_par_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE devis_lignes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id UUID NOT NULL REFERENCES devis(id) ON DELETE CASCADE,
  ordre INT DEFAULT 0,
  description TEXT NOT NULL,
  unite TEXT DEFAULT 'diagnostic',
  quantite NUMERIC(10,3) DEFAULT 1,
  pu_ht NUMERIC(10,2) DEFAULT 0,
  tva_pct NUMERIC(5,2) DEFAULT 20,
  total_ligne_ht NUMERIC(10,2) DEFAULT 0
);

-- Factures (même structure que devis + immuabilité)
CREATE TYPE facture_statut AS ENUM ('brouillon', 'emise', 'payee', 'partiellement_payee', 'en_retard', 'annulee');

CREATE TABLE factures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE NOT NULL, -- FA-2026-00001
  dossier_id UUID REFERENCES dossiers(id),
  devis_id UUID REFERENCES devis(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  statut facture_statut DEFAULT 'brouillon',
  total_ht NUMERIC(10,2) DEFAULT 0,
  total_tva NUMERIC(10,2) DEFAULT 0,
  total_ttc NUMERIC(10,2) DEFAULT 0,
  tva_pct NUMERIC(5,2) DEFAULT 20,
  echeance_date DATE,
  mode_reglement TEXT,
  pdf_url TEXT,
  stripe_payment_link TEXT,
  emise_le TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE facture_lignes (...same as devis_lignes);

CREATE TABLE paiements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facture_id UUID NOT NULL REFERENCES factures(id),
  montant NUMERIC(10,2) NOT NULL,
  mode TEXT NOT NULL, -- stripe | virement | cheque | especes
  date DATE NOT NULL,
  reference_externe TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TYPE document_categorie AS ENUM ('annexe', 'ddt', 'consentement');

CREATE TABLE documents_dossier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  categorie document_categorie NOT NULL,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  taille_bytes BIGINT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

-- Demande de documents
CREATE TYPE demande_statut AS ENUM ('brouillon', 'envoyee', 'en_cours', 'completee');
CREATE TYPE demande_canal AS ENUM ('email', 'sms');

CREATE TABLE demandes_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES dossiers(id),
  destinataire_contact_id UUID NOT NULL REFERENCES contacts(id),
  modele_id UUID REFERENCES modeles_demande(id),
  canal demande_canal DEFAULT 'email',
  message_personnalise TEXT,
  token_acces TEXT UNIQUE NOT NULL, -- JWT signé
  token_expire_le TIMESTAMPTZ,
  statut demande_statut DEFAULT 'brouillon',
  envoyee_le TIMESTAMPTZ,
  completee_le TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE demande_item_type AS ENUM ('document', 'information', 'question', 'personnalise');

CREATE TABLE demande_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demande_id UUID NOT NULL REFERENCES demandes_documents(id) ON DELETE CASCADE,
  type demande_item_type NOT NULL,
  code_diag TEXT, -- dpe, gaz, amiante, elec, crep, tous, copro
  libelle TEXT NOT NULL,
  obligatoire BOOLEAN DEFAULT false,
  multi_fichiers BOOLEAN DEFAULT false,
  reponse_text TEXT,
  reponse_fichier_url TEXT,
  repondu_le TIMESTAMPTZ
);

CREATE TABLE modeles_demande (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  items_json JSONB NOT NULL, -- structure des items pré-cochés
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tarification
CREATE TABLE grille_tarifaire (
  diagnostic_type_id UUID PRIMARY KEY REFERENCES diagnostic_types(id),
  prix_ht NUMERIC(10,2) NOT NULL,
  tva_pct NUMERIC(5,2) DEFAULT 20,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE regles_majoration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- TRAVEL_FEE, AREA_ABOVE_HAB
  libelle TEXT NOT NULL,
  condition_json JSONB NOT NULL, -- JSON Logic
  formule_json JSONB NOT NULL,
  actif BOOLEAN DEFAULT true,
  ordre INT DEFAULT 0
);

-- Journal communications (audit log)
CREATE TABLE journal_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES dossiers(id),
  type TEXT NOT NULL, -- email | sms
  statut TEXT, -- envoye | delivre | ouvert | clique | erreur
  destinataire_contact_id UUID REFERENCES contacts(id),
  destinataire_email TEXT,
  destinataire_telephone TEXT,
  objet TEXT,
  apercu TEXT,
  provider_id TEXT, -- ID Resend ou Twilio
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catalogue prestations
CREATE TABLE catalogue_prestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  libelle TEXT NOT NULL,
  unite TEXT DEFAULT 'u',
  pu_ht_default NUMERIC(10,2),
  tva_pct_default NUMERIC(5,2) DEFAULT 20,
  actif BOOLEAN DEFAULT true
);

-- Paramètres cabinet (singleton)
CREATE TABLE parametres_cabinet (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nom TEXT,
  siret TEXT,
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  telephone TEXT,
  email TEXT,
  logo_url TEXT,
  couleur_primaire TEXT DEFAULT '#F9B233',
  couleur_secondaire TEXT DEFAULT '#3DC4B2',
  mentions_legales TEXT,
  stripe_account_id TEXT,
  resend_from_email TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Index critiques** :
```sql
CREATE INDEX idx_dossiers_statut ON dossiers(statut);
CREATE INDEX idx_dossiers_technicien ON dossiers(technicien_id);
CREATE INDEX idx_dossiers_created_at ON dossiers(created_at DESC);
CREATE INDEX idx_factures_statut ON factures(statut);
CREATE INDEX idx_factures_echeance ON factures(echeance_date) WHERE statut IN ('emise', 'partiellement_payee');
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_rdv_date ON rendez_vous(date, technicien_id);
```

**RLS policies principales** (à détailler en dev) :
- Admin : accès total
- Diagnostiqueur : ses dossiers uniquement (via `technicien_id = auth.uid()`)
- Contact avec `user_id` : accès lecture aux dossiers où il est lié (portail)

---

## 6. Roadmap de développement (sprints)

**Sprint 0 — Setup (1 semaine)**
- Init repo Next.js + Supabase + Tailwind + shadcn
- Configuration Vercel + Supabase prod/dev
- Auth Supabase + layouts (admin + portail)
- Migrations initiales (users, contacts, dossiers, diagnostic_types)

**Sprint 1 — Contacts + Dossiers (2 semaines)**
- F-03, F-04 (Contacts + Pappers)
- F-05 (Wizard dossier 10 étapes)
- F-06 (Liste dossiers)
- F-08 (Vue détail dossier)

**Sprint 2 — Agenda + RDV + Documents (2 semaines)**
- F-10, F-11 (Agenda + modal RDV)
- F-22 (Gestion fichiers par dossier)
- F-07 (Vue Kanban)
- F-09 (Infos complémentaires)

**Sprint 3 — Devis + Facturation (2 semaines)**
- F-12, F-13 (Création devis dossier + standalone)
- F-14 (Moteur tarification)
- F-15, F-16 (PDF + envoi email)
- F-17 (Acceptation portail)
- F-18 (Factures + immuabilité)

**Sprint 4 — Paiements + Relances + FEC (1,5 semaine)**
- F-19 (Stripe Checkout + webhooks)
- F-20 (Relances automatiques)
- F-21 (Export FEC)

**Sprint 5 — Demande documents (1,5 semaine)**
- F-23 (Modal demande + portail destinataire)
- F-24 (Modèles)

**Sprint 6 — Dashboard + Stats (1 semaine)**
- F-25 (Dashboard)
- F-26 (Statistiques V1)

**Sprint 7 — Paramètres + Polish + Tests (1 semaine)**
- F-27 (Paramètres complets)
- Tests E2E parcours critiques (Playwright)
- Optimisations perfs
- Recette avec Servicimmo

**Total : 10,5 semaines** (marge ~2 semaines pour imprévus = 12 semaines)

---

## 7. Ce qui est volontairement hors scope Phase 1

| Feature | Phase | Raison |
|---------|-------|--------|
| Modules de saisie diagnostic (DPE, Amiante, Plomb...) | Phase 2/3 | Scope énorme, Servicimmo garde Liciel en attendant |
| Moteur DPE (CSTB / ADEME) | Phase 3 | Réglementation complexe, responsabilité juridique |
| Import/Export Liciel | Phase 3 | Format propriétaire, reverse engineering nécessaire |
| Apps mobiles natives iOS/Android | Phase 4 | PWA responsive suffit en V1 |
| Enregistrement vocal agenda | Phase 4 | Nice-to-have, pas critique |
| Intégration Google Calendar (OAuth) | Phase 2 | Confort, pas bloquant |
| Événements récurrents blocage | Phase 2 | Idem |
| SMS (Twilio) | Phase 2 | Email suffit pour V1 |
| Veille réglementaire | Hors scope | Partenariat externe, pas pertinent |
| Multi-cabinets (SaaS) | Hors scope | Outil interne Servicimmo uniquement |
| Commande vocale | Hors scope | Gadget |
