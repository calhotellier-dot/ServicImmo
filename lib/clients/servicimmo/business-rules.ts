/**
 * Business rules spécifiques à Servicimmo.
 *
 * Stub Sprint 0 — ces overrides seront branchés au moteur
 * `calculateRequiredDiagnostics(data, overrides)` dans les sprints suivants,
 * une fois le paramètre `overrides` ajouté à la signature.
 *
 * Pour l'instant, le moteur `lib/core/diagnostics/rules.ts` hardcode
 * `isIndreEtLoire` pour le termites. La migration vers `overrides` se fera
 * lorsqu'un second cabinet sera client (mutualisation du code).
 */

export type BusinessRuleOverrides = {
  /**
   * Zones (codes départements) où les termites sont obligatoires pour la vente.
   * Servicimmo : Indre-et-Loire (37) — arrêté préfectoral du 27/02/2018.
   */
  termitesZones: readonly string[];
  /**
   * Règles supplémentaires spécifiques cabinet (ex: mérule pour certaines
   * zones, plomb élargi, etc.). À remplir si besoin lors du Sprint 2.
   */
  extraMandatoryRules?: readonly string[];
};

export const servicimmoOverrides: BusinessRuleOverrides = {
  termitesZones: ["37"],
  extraMandatoryRules: [],
} as const;
