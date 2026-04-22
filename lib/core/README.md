# lib/core/

Couche **domaine pure**. Ne dépend de **rien** du projet : pas d'appel Supabase, Resend, Stripe, ni d'import depuis `lib/features/`, `lib/clients/`, `app/`.

## Règle d'import

```
lib/core  ──✗──▶  lib/features
lib/core  ──✗──▶  lib/clients
lib/core  ──✗──▶  app/
```

Enforcée par ESLint (`import/no-restricted-paths`). Voir `eslint.config.mjs`.

## Contenu

- `diagnostics/` — moteur de règles + pricing (fonctions pures, testées).
- `types/` — types métier partagés (`Dossier`, `Devis`, `Facture`, `Contact`, `RendezVous`, `Paiement`, `DemandeDocuments`).
- `fec/` *(Sprint 5)* — format FEC (écritures comptables).
- `signature/` *(Sprint 1)* — tokens JWT magic link.
- `utils/` — helpers purs.

## Principe

Les fonctions `core/` reçoivent la configuration/les overrides en **paramètre**, pas via import. Exemple :

```ts
// lib/core/diagnostics/rules.ts
export function calculateRequiredDiagnostics(
  data: QuoteFormData,
  overrides?: BusinessRuleOverrides
): DiagnosticsResult { ... }

// lib/clients/servicimmo/business-rules.ts
export const servicimmoOverrides: BusinessRuleOverrides = { ... };

// app/(app)/... (consommateur)
import { calculateRequiredDiagnostics } from '@/lib/core/diagnostics/rules';
import { servicimmoOverrides } from '@/lib/clients/servicimmo/business-rules';

calculateRequiredDiagnostics(data, servicimmoOverrides);
```

Cette inversion de dépendance permet de brancher n'importe quel cabinet client sans toucher au core.
