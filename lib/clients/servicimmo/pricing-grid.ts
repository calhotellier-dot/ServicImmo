/**
 * Grille tarifaire Servicimmo.
 *
 * Stub Sprint 0 — la grille réelle sera saisie dans la table Supabase
 * `pricing_rules` (migration 0002) et chargée par `loadPricingGrid()` côté
 * `lib/core/diagnostics/pricing.ts`. Ce fichier sert de point d'entrée
 * spécifique Servicimmo si on veut pré-seeder côté code.
 *
 * ⚠️ Les 10 questions à poser à Servicimmo pour calibrer la grille sont
 * listées dans le plan (MASTER-PLAN.md §Risques + plan pricing V2).
 */

export type PricingGridEntry = {
  diagnosticId: string;
  /** 'house' | 'apartment' | 'default' */
  context: string;
  priceMin: number;
  priceMax: number;
  notes?: string;
};

/**
 * Pour l'instant la grille vit dans `lib/core/diagnostics/pricing.ts`
 * (fallback code `BASE_PRICES`) et sera migrée vers Supabase en Sprint 4.
 * Ce tableau reste vide : il servira d'override ponctuel si Servicimmo veut
 * forcer des valeurs côté code (ex: packs spéciaux) avant que l'UI admin
 * pricing_rules soit livrée.
 */
export const servicimmoPricingOverrides: PricingGridEntry[] = [];
