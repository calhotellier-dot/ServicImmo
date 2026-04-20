# PRD — Refonte servicimmo.fr

**Propul'seo × SERVICIMMO**
**Version :** 1.0 — avril 2026
**Auteur :** Lyes (Propul'seo)

---

## 1. Contexte

SERVICIMMO est un cabinet de diagnostic immobilier basé à Tours (Indre-et-Loire), actif depuis 1998, certifié LCC Qualixpert et assuré Allianz. Le site actuel (servicimmo.fr) date techniquement de 2015 environ : PHP monolithique, layout en tableaux, non responsive, avec un formulaire de devis figé qui ne convertit pas à son potentiel.

Le site porte néanmoins un actif SEO très fort : 100 articles de veille réglementaire depuis 2017 et 40 pages villes avec bon maillage interne.

## 2. Objectif

Refondre le site avec comme **produit central un questionnaire intelligent de devis** qui sert à la fois :
- D'outil de qualification entrante (calcul automatique des diagnostics obligatoires)
- De démonstration du savoir-faire (pédagogie en temps réel)
- De générateur de leads qualifiés (capture email progressive)
- De différenciateur fort vs concurrence (personne ne le fait bien dans le secteur)

## 3. Success metrics

| Métrique | Baseline estimée | Objectif M+3 |
|---|---|---|
| Taux de complétion formulaire | ~20-30% (estimation) | ≥ 60% |
| Leads qualifiés / mois | ? (à instrumenter) | +100% |
| Taux de transformation lead → devis signé | ? | ≥ 40% |
| Score mobile PageSpeed | ~50 | ≥ 90 |
| Trafic SEO organique | baseline J0 | +0% (pas de perte) puis +20% M+6 |

## 4. Périmètre de la V1

### In scope

1. **Questionnaire de devis multi-étapes intelligent** (cœur du projet)
2. **Pages services reprises** (21 pages services + pages villes) avec design moderne
3. **Blog actualités** migré (100 articles + pagination)
4. **Pages structurelles** : accueil, contact, mentions légales, CGV, à propos (nouveau)
5. **Back-office léger** : dashboard des demandes reçues, consultation, export
6. **Intégrations** : email transactionnel (Resend), map interactive zone d'intervention, Google Tag Manager

### Out of scope V1 (à considérer V2)

- Prise de RDV avec synchro calendrier (Cal.com) → V1.5
- Paiement en ligne intégré (Stripe) → conservé en V1 si simple à porter
- Portail client (suivi dossier en cours, expiration diagnostics) → V2
- CRM prescripteurs (notaires, syndics) → V2
- Génération automatique de contenu blog via Claude API → V2

## 5. Personas cibles

**P1 — Le particulier vendeur** (60% du volume)
Profile : 45-70 ans, vend sa maison/appart, ne connaît ni les termes ni les obligations. Cherche un prix clair et rapide.
Besoin : comprendre ce dont il a besoin, savoir combien ça coûte, être rassuré sur la légalité.

**P2 — Le bailleur** (20%)
Profile : 35-55 ans, bailleur d'un ou plusieurs biens, veut renouveler ses diagnostics expirés.
Besoin : rapidité d'exécution, coût minimal, conformité aux nouvelles règles DPE 2025/2026.

**P3 — Le prescripteur B2B** (15%)
Profile : notaire, agent immobilier, syndic. Envoie plusieurs dossiers par mois.
Besoin : interlocuteur fiable, délais courts, factures à son nom, suivi administratif clair.

**P4 — La maîtrise d'ouvrage / architecte** (5%)
Profile : travaux / rénovation, besoin amiante avant travaux, plomb, HAP enrobés.
Besoin : expertise technique pointue, rapports conformes COFRAC, réactivité chantier.

## 6. Le questionnaire — spec fonctionnelle

**→ Voir `QUESTIONNAIRE_FLOW.md` pour le détail des étapes, règles métier et décision.**

### Principes directeurs

1. **Progressif** — 4 à 6 étapes max, une barre de progression visible en permanence
2. **Conditionnel** — n'afficher que les questions pertinentes selon les réponses précédentes
3. **Pédagogique** — chaque question explique *pourquoi* on la pose (tooltip ou micro-copie)
4. **Rassurant** — durée estimée (« 2 minutes »), certifications visibles, pas d'engagement
5. **Capture progressive** — email demandé à l'étape 2 (pas à la fin)
6. **Récapitulatif intelligent** — à la fin, affiche : liste des diagnostics obligatoires calculés, estimation de prix, délai d'intervention possible, CTA de confirmation

### Les 6 étapes proposées

1. **Projet** — vente / location / travaux / autre
2. **Bien** — type, adresse (autocomplete BAN), code postal, surface, nombre de pièces
3. **Email** (capture progressive avec bénéfice : "Recevez votre devis personnalisé")
4. **Caractéristiques** — année de construction / permis, chauffage, gaz, copropriété
5. **Délai et précisions** — urgence, notes libres, upload optionnel de plans
6. **Récapitulatif et confirmation** — affichage des diagnostics obligatoires calculés + estimation + validation coordonnées

### Calcul des diagnostics obligatoires

Moteur de règles métier implémenté côté backend qui détermine selon :
- Type de transaction (vente / location)
- Type de bien
- Date du permis de construire
- Surface et composition
- Présence gaz / électricité et ancienneté installations
- Localisation (zone termites → oui pour toute l'Indre-et-Loire)
- Statut copropriété

**Les règles précises sont détaillées dans `QUESTIONNAIRE_FLOW.md`.**

### Estimation de prix

Chaque diagnostic a une fourchette tarifaire de base (ex: DPE maison 90€-180€), modulée par :
- Surface (palier de prix par tranche)
- Nombre de pièces
- Zone géographique (intra-37 ou périphérie)
- Urgence (supplément intervention <48h)

**Affichage final** : "Entre 280€ et 450€" avec mention "Devis définitif sous 2h ouvrées après validation".

## 7. Architecture technique

### Stack

- **Framework** : Next.js 14 (App Router, Server Components)
- **Langage** : TypeScript strict
- **Styling** : Tailwind CSS + shadcn/ui
- **Forms** : React Hook Form + Zod (validation côté client et serveur)
- **DB** : Supabase (Postgres + Auth + Storage pour uploads)
- **Email** : Resend (transactionnel) avec templates React Email
- **Analytics** : Plausible (pas Google Analytics, RGPD-friendly)
- **Hosting** : Vercel
- **Map** : Leaflet + OpenStreetMap (zone d'intervention)
- **Adresse** : API BAN (gouv.fr, gratuite) pour autocomplete

### Modèles de données (Supabase)

**Voir `CLAUDE.md` pour le schéma SQL complet.** En résumé :
- `quote_requests` — demandes de devis (jointure avec étapes du form)
- `services` — services proposés (DPE, amiante, etc.) avec tarifs de base
- `articles` — blog (migré depuis l'ancien site)
- `cities` — zones d'intervention (37XXX) pour pages SEO locales

### Gestion du SEO et de la migration

**Règle absolue : zéro URL cassée.**

- Toutes les URLs anciennes (193 identifiées) doivent rediriger en 301 vers leur équivalent neuf
- Fichier `redirects.json` à livrer en parallèle du code
- Conservation des meta descriptions et titles originaux quand ils sont bons
- Re-génération avec Claude API quand ils sont génériques ou inadaptés
- Sitemap XML auto-généré à partir de la base

## 8. Design — principes

**Inspirations** : Alan (santé), Qonto (B2B fluide), Doctolib (parcours step-by-step)
**Ton** : professionnel, rassurant, pédagogique. Pas corporate froid. Un peu « tech » mais accessible.

### Design system

- **Typo** : Inter (titres + corps) ou Geist
- **Couleurs** : à définir avec Servicimmo mais partir sur un bleu profond (confiance) + accent vert (validation)
- **Composants** : shadcn/ui customisés, pas de Bootstrap, pas de MUI
- **Icônes** : Lucide React
- **Espacement** : généreux, mobile-first
- **Animations** : discrètes, Framer Motion sur transitions de formulaire

## 9. Back-office (dashboard admin)

Interface simple pour Lyes, Etienne et l'équipe Servicimmo :
- Liste des demandes de devis reçues (tri, filtre, recherche)
- Fiche détail d'une demande (toutes les réponses au form, statut, notes internes)
- Export CSV pour import dans leur logiciel métier (Liciel probablement)
- Dashboard métriques : nombre de demandes par semaine, taux de complétion, services les plus demandés

Auth : Supabase Auth avec magic link (pas de mot de passe, email seul).

## 10. Planning prévisionnel

| Phase | Durée | Livrable |
|---|---|---|
| 1. Setup projet + Design system | 3 jours | Repo + composants shadcn customisés |
| 2. Questionnaire (cœur) | 5 jours | Form multi-step fonctionnel + moteur de règles |
| 3. Pages services + blog | 4 jours | Migration contenu + pages SEO |
| 4. Back-office admin | 3 jours | Dashboard demandes |
| 5. Intégrations (emails, map, analytics) | 2 jours | End-to-end OK |
| 6. Migration 301 + SEO | 2 jours | Aucune URL cassée |
| 7. QA + livraison | 2 jours | Mise en ligne |

**Total : ~3 semaines en dev full-time avec Claude Code.**

## 11. Livrables

1. ✅ Code source versionné (GitHub)
2. ✅ Déploiement Vercel avec preview + prod
3. ✅ Supabase configuré avec seed data
4. ✅ Documentation technique (`CLAUDE.md` + `README.md`)
5. ✅ Fichier de redirection 301 (`redirects.json`)
6. ✅ Sitemap XML + robots.txt
7. ✅ Templates email (devis reçu, confirmation client, relance)
8. ✅ Back-office admin accessible avec comptes créés pour l'équipe
9. ✅ Session de formation (1h) pour l'équipe Servicimmo

## 12. Risques et points d'attention

| Risque | Mitigation |
|---|---|
| Perte SEO à la migration | Plan 301 systématique + rollout progressif + Search Console monitoring |
| Régles métier mal calibrées (diagnostics obligatoires) | Validation avec Servicimmo sur 10 cas réels avant mise en prod |
| Estimation de prix fausse qui déçoit | Libellé « Estimation indicative, devis définitif sous 2h ouvrées » |
| Questionnaire trop long | Tests utilisateurs sur 5 personnes avant livraison |
| Contenu des articles mal formaté après migration | Script de migration + revue manuelle de 10 articles échantillons |

## 13. Évolutions V2 identifiées

- Prise de RDV en ligne (Cal.com)
- Portail client (suivi dossier, téléchargement rapports, expiration auto)
- CRM prescripteurs avec relances programmées
- Machine à contenu SEO : Claude génère 1 brouillon d'article par semaine à partir de l'actu du secteur
- API publique pour partenaires (notaires, agences)
- App mobile native pour diagnostiqueurs terrain (V2 lointaine — si Servicimmo veut internaliser un logiciel type Diag-Pilote)
