/**
 * Moteur de pricing — estimation tarifaire d'un pack de diagnostics.
 *
 * ⚠️ TARIFS INDICATIFS — À VALIDER ET CALIBRER AVEC SERVICIMMO AVANT PROD.
 *
 * Source : `QUESTIONNAIRE_FLOW.md` §5 (grille tarifaire 2026 + modulateurs).
 *
 * Décisions de Session 1 :
 *   - Pas de seuil "sur devis" automatique. Tout reste en fourchette, même
 *     pour grandes surfaces / zones éloignées. Équipe Servicimmo affine au
 *     devis définitif sous 2h.
 *
 * Ordre de calcul (cf. exemple §5) :
 *   1. Base price par diagnostic (dépend du type de bien pour DPE/Amiante).
 *   2. Somme des fourchettes.
 *   3. Modulateur surface (−10%, base, +10%, +20%).
 *   4. Modulateur urgence (+20% si <48h).
 *   5. Modulateur zone géographique (+15% hors 37).
 *   6. Remise pack (−15% si ≥3 diagnostics).
 *   7. Arrondi à la dizaine.
 */

import type {
  DiagnosticId,
  PriceEstimate,
  PricingContext,
  PropertyType,
  RequiredDiagnostic,
} from "./types";

// ---------------------------------------------------------------------------
// Grille tarifaire — fonction car certains prix dépendent du contexte
// (type de bien pour DPE / Amiante / DAPP).
// ---------------------------------------------------------------------------

type PriceRange = { min: number; max: number };

type PriceResolver = (ctx: PricingContext) => PriceRange;

/**
 * Pour DPE et Amiante, tarif plus bas en appartement qu'en maison (moins de
 * pièces à visiter en moyenne).
 */
function housingPrice(
  ctx: PricingContext,
  houseMin: number,
  houseMax: number,
  apartmentMin: number,
  apartmentMax: number
): PriceRange {
  return ctx.property_type === "house"
    ? { min: houseMin, max: houseMax }
    : { min: apartmentMin, max: apartmentMax };
}

const BASE_PRICES: Record<DiagnosticId, PriceResolver> = {
  dpe: (ctx) => housingPrice(ctx, 110, 220, 90, 180),
  dpe_tertiary: () => ({ min: 200, max: 800 }),
  // DPE collectif et DTA sont officiellement "sur devis". On donne une
  // fourchette large à titre indicatif ; l'UI affichera une mention.
  dpe_collective: () => ({ min: 600, max: 1500 }),
  dta: () => ({ min: 400, max: 900 }),

  lead: () => ({ min: 110, max: 220 }),
  asbestos: (ctx) => housingPrice(ctx, 80, 150, 70, 130),
  dapp: (ctx) => housingPrice(ctx, 80, 150, 70, 130),
  asbestos_works: () => ({ min: 250, max: 600 }),
  lead_works: () => ({ min: 150, max: 400 }),

  termites: () => ({ min: 90, max: 170 }),
  gas: () => ({ min: 90, max: 130 }),
  electric: () => ({ min: 90, max: 130 }),
  carrez: () => ({ min: 60, max: 110 }),
  boutin: () => ({ min: 60, max: 110 }),
  erp: () => ({ min: 20, max: 40 }),
};

// ---------------------------------------------------------------------------
// Modulateurs
// ---------------------------------------------------------------------------

type SurfaceBand =
  | "tiny" // ≤ 40 m²
  | "small" // 40-80 m²
  | "medium" // 80-150 m²
  | "large"; // > 150 m²

function surfaceBand(surface: number): SurfaceBand {
  if (surface <= 40) return "tiny";
  if (surface <= 80) return "small";
  if (surface <= 150) return "medium";
  return "large";
}

function surfaceMultiplier(surface: number): number {
  switch (surfaceBand(surface)) {
    case "tiny":
      return 0.9;
    case "small":
      return 1;
    case "medium":
      return 1.1;
    case "large":
      return 1.2;
  }
}

function surfaceLabel(surface: number): string | null {
  switch (surfaceBand(surface)) {
    case "tiny":
      return "Surface ≤ 40 m² (−10 %)";
    case "medium":
      return "Surface 80-150 m² (+10 %)";
    case "large":
      return "Surface > 150 m² (+20 %)";
    default:
      return null;
  }
}

/**
 * Zone géographique : l'Indre-et-Loire (37) est considérée dans le périmètre
 * "proche Tours" (tarif base). Tout autre département → supplément +15 %.
 * Simplification : on ne calcule pas la distance exacte à Tours.
 */
function isOutOfRange(postalCode: string): boolean {
  return !postalCode.trim().startsWith("37");
}

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

function roundToTen(n: number): number {
  return Math.round(n / 10) * 10;
}

// ---------------------------------------------------------------------------
// Fonction principale
// ---------------------------------------------------------------------------

export function estimatePrice(
  diagnostics: RequiredDiagnostic[],
  context: PricingContext
): PriceEstimate {
  const appliedModulators: string[] = [];

  // 1) Somme des fourchettes de base
  let min = 0;
  let max = 0;
  for (const diag of diagnostics) {
    const resolver = BASE_PRICES[diag.id];
    if (!resolver) continue; // diagnostic inconnu → ignoré
    const range = resolver(context);
    min += range.min;
    max += range.max;
  }

  // Cas vide : pas de diagnostic → pas d'estimation
  if (diagnostics.length === 0) {
    return { min: 0, max: 0, appliedModulators };
  }

  // 2) Surface
  const sm = surfaceMultiplier(context.surface);
  if (sm !== 1) {
    min *= sm;
    max *= sm;
    const label = surfaceLabel(context.surface);
    if (label) appliedModulators.push(label);
  }

  // 3) Urgence
  if (context.urgency === "asap") {
    min *= 1.2;
    max *= 1.2;
    appliedModulators.push("Intervention < 48 h (+20 %)");
  }

  // 4) Zone géographique
  if (isOutOfRange(context.postal_code)) {
    min *= 1.15;
    max *= 1.15;
    appliedModulators.push("Hors Indre-et-Loire (+15 %)");
  }

  // 5) Pack (≥ 3 diagnostics)
  if (diagnostics.length >= 3) {
    min *= 0.85;
    max *= 0.85;
    appliedModulators.push("Pack complet ≥ 3 diagnostics (−15 %)");
  }

  // 6) Arrondi dizaine
  return {
    min: roundToTen(min),
    max: roundToTen(max),
    appliedModulators,
  };
}

// ---------------------------------------------------------------------------
// Helpers exportés (utiles pour les tests et la UI)
// ---------------------------------------------------------------------------

export const __pricingInternals = {
  BASE_PRICES,
  surfaceBand,
  surfaceMultiplier,
  isOutOfRange,
  roundToTen,
};

export function basePrice(id: DiagnosticId, propertyType: PropertyType): PriceRange {
  const resolver = BASE_PRICES[id];
  return resolver({
    surface: 100,
    postal_code: "37000",
    property_type: propertyType,
    urgency: null,
  });
}
