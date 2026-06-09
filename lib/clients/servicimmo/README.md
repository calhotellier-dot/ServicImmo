# lib/clients/servicimmo/

Couche **spécifique cabinet**. Contient tout ce qui est propre à Servicimmo : identité, branding, grille tarifaire réelle, règles métier overrides (ex : termites en Indre-et-Loire), templates emails, mentions légales.

## Règles d'import

```
lib/clients/servicimmo  ──✓──▶  lib/core
lib/clients/servicimmo  ──✓──▶  lib/features
lib/clients/servicimmo  ──✓──▶  lib/supabase, lib/resend, ...
```

Aucune restriction entrante : `app/` et n'importe quelle route peut importer depuis ici.

## Contenu

- `config.ts` — infos cabinet (nom, SIRET, adresse, IBAN, contacts).
- `branding.ts` — couleurs, logo, polices (tokens design).
- `pricing-grid.ts` — grille tarifaire réelle (à caler avec Servicimmo).
- `business-rules.ts` — overrides du moteur de règles (ex: `termitesZones: ['37']`).
- `email-templates/` *(sprints suivants)* — templates React Email brandés Servicimmo.
- `legal/` *(sprints suivants)* — CGV, mentions légales.

## Duplication future

Cette isolation permet, le jour où un autre cabinet voudra la même app, de créer un `lib/clients/autrecabinet/` à côté et de switcher via `process.env.NEXT_PUBLIC_CLIENT`. Aucune modification de `core/` ou `features/` requise.
