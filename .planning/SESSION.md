# Session State — 2026-04-21 10:40

## Branch
main (pas de remote — projet local uniquement pour l'instant)

## Completed This Session
- Session 3 (design handoff integration) :
  - Questionnaire V2-final : pivot 6 étapes → 4 écrans (entry/filling/recap/thanks), palette cream+lime+sage, Fraunces serif, 1:1 avec le design Claude
  - Home D3 : Header + Hero + MapCard Touraine (SVG routes + 7 villes + pin animé) + TrustBar + Audiences tabs + ServicesByCategory + Why W5 + Specialties + Actualités + Zones + FinalCTA + Footer, palette Anis+Navy, 1:1 avec le design Claude
  - Backend préservé intact : rules.ts, pricing.ts, 32 tests verts, Zustand store (version bumpée à 2 avec migrate), API routes /calculate + /quote-request + [id] + [id]/submit
  - Fonts : ajout Fraunces via next/font/google (variable + italic)
  - Tokens CSS : @theme étendu avec --color-home-* (palette classic D3) + --color-devis-* (cream-lime-sage) + --color-branch-* (5 branches)
  - Validation : tsc ✓, ESLint ✓, 32/32 tests ✓, build prod ✓ sur 11 routes, smoke test manuel ✓ (home + EntryScreen + FillingScreen)

## Next Task
Attendre retour Lyes sur design visuel + décider priorités S4 :
1. Provisionner Supabase (RLS + migrations déjà écrites) pour activer /api/quote-request persistance
2. Emails Resend (templates QuoteConfirmation + InternalNotification + AbandonRelance)
3. Back-office admin (/admin layout + liste demandes + fiche détail)
4. Migration 100 articles de l'ancien site (script migrate-articles.ts)
5. Redirects 301 (middleware.ts + redirects.json généré depuis servicimmo_urls.txt)
6. Deploy Vercel preview
7. Fix mineur en attente depuis S2 : ajouter `state_of_premises` (EDL) dans rules.ts + pricing.ts + tests

## Blockers
- Pas de remote git → commits locaux only (créer un repo GitHub quand prêt)
- Supabase non provisionné → routes API retournent 503 (comportement attendu, à brancher en S4)

## Key Context
- Scope figé S3 : UI-only, backend intact (rules/pricing/tests/API/Zustand). Confirmé par Lyes.
- Parcours V2 : entry (5 BranchCards) → filling (4 accordéons) → recap (diagnostics + contact form) → thanks
- QuestionnaireApp utilise `useSyncExternalStore` pour l'hydratation Zustand persist (évite setState-in-effect lint)
- Field mapping UI ↔ store : `permit_date_range` (UI pre1949/1949_1997/post1997/dk ↔ store before_1949/1949_to_1997/...), tri-state yes/no/dk ↔ boolean|null. Helpers dans `components/questionnaire/lib/field-mapping.ts`. UI ne pré-sélectionne aucun radio tant que la valeur du store est `undefined`.
- Variantes home (tone/density/servicesVariant/accent) hardcodées aux défauts du design : tone=warm, density=medium, servicesVariant=table, accent=classic (Anis+Navy)
- TweaksPanel du handoff volontairement non porté (dev-only)
- Anciens fichiers supprimés : `components/questionnaire/{ProgressBar,QuestionnaireLayout,QuestionnaireContainer,steps/*,controls/*}`, `components/layout/{Header,Footer}`, `app/(public)/devis/merci`
- Disque a failli saturer pendant la phase A (Turbopack + extract handoff) → résolu en supprimant /tmp/servicimmo-handoff. À surveiller.
