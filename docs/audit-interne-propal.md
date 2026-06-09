# Audit interne — Propal Servicimmo v1

> **Cible** : Lyes (puis Étienne après lecture).
> **Date** : 26 avril 2026
> **Origine** : brainstorm 26/04 — la propal v1 (PDF du 24/04) a été rédigée par Étienne sans avoir bossé sur le code. Sections questionnaire + plateforme à réaligner.
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

---

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

---

## 3. Checklist modifs PDF pour Étienne

À faire dans le PDF source de la propal :

- [ ] **§4b · page 6** : remplacer le bloc "1 à 6 étapes" par le bloc "Parcours intelligent" → texte fourni dans `docs/propal-v2-questionnaire-plateforme.md`
- [ ] **§4b · page 6** : remplacer le visuel numéroté 1-6 par un schéma "Type projet → branche dynamique → récap prix"
- [ ] **§5 · page 8** : remplacer la liste 7 modules par les 9 modules de la version v2 (ajout : Demandes docs en zone 2, Portail client en zone 3)
- [ ] **§5 · page 8** : ajouter les marqueurs ⭐ "bonus inclus" sur Demandes docs et Portail client
- [ ] **NOUVELLE §5c · entre page 9 et 10** : insérer la nouvelle section "Conformité & paramétrage"
- [ ] **§11 Tarification · page 15** : vérifier cohérence du montant Phase 2 vs périmètre étendu (arbitrage : ajuster à la hausse OU vendre les bonus en "offert")
- [ ] **§9 Timeline · page 13** : vérifier durée Phase 2 (8 semaines) compatible avec le périmètre étendu — peut nécessiter +2 semaines polish
- [ ] **Page de garde · page 1** : incrémenter le numéro de version (v2)

---

## 4. Axes d'amélioration produit (post-signature)

Ce qui reste à finir côté code pour matcher la promesse propal v2. Source de vérité : [`.planning/BLOCKERS.md`](../.planning/BLOCKERS.md).

### Priorité haute (à faire avant kick-off ou en phase 2 polish)

- **UI éditeurs admin** (`/app/parametres/grille`, `/regles`, `/modeles`, `/utilisateurs`) — backend prêt, RLS OK, manque les écrans CRUD.
- **Génération PDF devis/facture** — `@react-pdf/renderer` installé, colonnes `pdf_storage_path` prêtes, template à écrire.
- **Upload portail demande-documents** — actuellement message "envoyer par mail", remplacer par signed-upload Supabase Storage.

### Priorité moyenne

- **DnD Kanban interactif** — backend `updateDossierStatus` prêt, intégration `@dnd-kit/core` à faire.
- **Vue agenda semaine/jour** — vue mois OK, à arbitrer avec Servicimmo.
- **E2E Playwright complets** — 3 parcours critiques (wizard→devis→Stripe, demande docs, FEC).
- **Autocompletion BAN dans wizard admin** — existe sur questionnaire public à porter.

### Blockers externes (Servicimmo doit fournir)

- 🔴 Buckets Storage à créer (3 buckets Supabase)
- 🔴 Stripe KYC + Resend domaine DKIM `servicimmo.fr`
- 🟠 Grille tarifaire réelle (10 questions à poser)
- 🟠 Infos cabinet (SIRET/IBAN/TVA)

---

## 5. Risques commerciaux à anticiper

### "Où sont passées les 6 étapes ?"

Si Fanny ou Jacques-Alexandre soulèvent la disparition des 6 étapes du questionnaire, script de réponse :

> "On a affiné le parcours en travaillant sur le moteur de règles. Au lieu de 6 étapes fixes pour tout le monde, le questionnaire s'adapte au projet. Vos clients vente n'auront pas les questions location, vos clients location n'auront pas les questions vente. C'est plus court, plus précis, et ça augmente le taux de complétion."

### Écart de prix perçu (plateforme étendue vs propal v1)

La plateforme livrée contient ~30% de modules en plus que la propal v1 (FEC, portail client, demandes docs, paramétrage complet). Deux options à arbitrer **avec Étienne avant signature** :

1. **Ajuster Phase 2 à la hausse** pour refléter le périmètre étendu. Risque : re-négo, perte du momentum signature.
2. **Vendre les bonus comme "offerts"** au prix initial. Avantage : effet wow, signature accélérée. Risque : sous-valorisation du travail.

Recommandation : **option 2** — l'effet wow vaut l'écart de marge, et ça crée une dette d'image positive si on doit upseller en Phase 3-4.

### Si Étienne refuse certaines modifs

Le doc client `docs/propal-v2-questionnaire-plateforme.md` est self-contained. Étienne peut piocher section par section. Pas de modif tout-ou-rien.
