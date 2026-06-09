# Session State — 2026-04-27 (fin de session 26/04)

## Branch
main (push origin lyestriki-29/servicimmo)

## Completed This Session
- Analyse propal v1 PDF (Proposition_Servicimmo_PropulSEO 17 pages)
- Brainstorm + spec : `docs/superpowers/specs/2026-04-26-revue-propal-design.md`
- Plan : `docs/superpowers/plans/2026-04-26-revue-propal.md`
- Livrable 1 (sections propal v2 réécrites) : `docs/propal-v2-questionnaire-plateforme.md`
- Livrable 2 (audit interne Lyes) : `docs/audit-interne-propal.md`
- Livrable 3 (récap pour Étienne) : `docs/changements-propal-pour-etienne.md`
- Script PDF : `scripts/generate-pdfs.ts` (Playwright + marked + Inter)
- 4 PDFs générés dans `docs/pdf/` (propal v2 18p, sections, audit, récap Étienne)
- Itérations propal v2 : §4b parcours adaptatif, §5 zones étendues + bonus, §5b parité fiche papier (sans "wizard"), §5c Conformité, §5d Le socle métier, em-dashes retirés, tarif compactée sur 1 page

## Next Task
Polish post-MVP côté code (au choix) :
1. UI admin éditeurs (grille tarifaire, règles, modèles, users)
2. Génération PDF devis/facture (@react-pdf/renderer template)
3. DnD Kanban interactif
4. Vue agenda semaine/jour
5. Upload portail demande-documents (signed URL Supabase)
6. E2E Playwright 3 parcours critiques

## Blockers
- 🔴 Buckets Storage Supabase à créer (3 buckets)
- 🔴 Stripe KYC + Resend domaine DKIM
- 🟠 Grille tarifaire réelle + infos cabinet
- 🟠 Décision Lyes/Étienne : tarif Phase 2 (hausse vs offert)

## Key Context
- Propal v2 prête à envoyer ou retravailler par Étienne. Reco interne : vendre bonus comme "offerts" pour effet wow.
- Améliorations propal NON faites (à arbitrer) : "ce qui n'est pas inclus", garanties post-livraison, page À propos, CGV.
- Phases 3-4 (Impartial, France Carottage) intactes — validées avec client.
