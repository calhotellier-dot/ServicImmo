/**
 * Moteur de tarification — Sprint 4 (F-18).
 *
 * Fonction pure : prend une grille, des règles de majoration et un contexte,
 * retourne les lignes + totaux. Testable sans DB.
 */

export type QuoteLine = {
  diagnosticTypeId: number | null;
  label: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type MajorationRule =
  | {
      ruleType: "TRAVEL_FEE";
      label: string;
      amountFlat: number;
      criteria: { minDistanceKm: number };
    }
  | {
      ruleType: "AREA_ABOVE_HAB";
      label: string;
      amountPercent: number;
      criteria: { minSurface: number };
    }
  | {
      ruleType: "URGENT_DELAY";
      label: string;
      amountPercent: number;
      criteria: { urgencyValues: string[] };
    }
  | {
      ruleType: "COLLECTIVE_HEATING";
      label: string;
      amountPercent: number;
    }
  | {
      ruleType: "CUSTOM";
      label: string;
      amountFlat?: number;
      amountPercent?: number;
    };

export type QuoteContext = {
  /** Distance en km au siège (pour TRAVEL_FEE). */
  distanceKm?: number;
  /** Surface habitable (pour AREA_ABOVE_HAB). */
  surface?: number;
  /** Niveau d'urgence (pour URGENT_DELAY). */
  urgency?: string;
  /** Chauffage collectif (pour COLLECTIVE_HEATING). */
  heatingMode?: "individual" | "collective" | "unknown";
  /** Inclut un DPE collectif (requis pour COLLECTIVE_HEATING s'applique). */
  hasCollectiveDPE?: boolean;
};

export type QuoteResult = {
  lines: QuoteLine[];
  subtotalBeforeMajoration: number;
  appliedMajorations: Array<{ label: string; amount: number }>;
  subtotalHT: number;
  vatRate: number;
  vatAmount: number;
  totalTTC: number;
};

/**
 * Compose un devis complet à partir de lignes et de règles.
 * Les prix des lignes sont supposés déjà figés (issus de la grille).
 * Les règles de majoration s'appliquent sur le subtotal.
 */
export function computeQuote(
  lines: QuoteLine[],
  rules: MajorationRule[],
  context: QuoteContext,
  vatRate: number = 0.2
): QuoteResult {
  const subtotalBefore = lines.reduce((acc, l) => acc + l.lineTotal, 0);
  let runningSubtotal = subtotalBefore;
  const appliedMajorations: QuoteResult["appliedMajorations"] = [];

  for (const rule of rules) {
    const shouldApply = evalRule(rule, context);
    if (!shouldApply) continue;
    let amount = 0;
    if ("amountFlat" in rule && rule.amountFlat !== undefined) {
      amount = rule.amountFlat;
    } else if ("amountPercent" in rule && rule.amountPercent !== undefined) {
      amount = runningSubtotal * (rule.amountPercent / 100);
    }
    amount = roundCents(amount);
    if (amount === 0) continue;
    appliedMajorations.push({ label: rule.label, amount });
    runningSubtotal += amount;
  }

  const subtotalHT = roundCents(runningSubtotal);
  const vatAmount = roundCents(subtotalHT * vatRate);
  const totalTTC = roundCents(subtotalHT + vatAmount);

  return {
    lines,
    subtotalBeforeMajoration: roundCents(subtotalBefore),
    appliedMajorations,
    subtotalHT,
    vatRate,
    vatAmount,
    totalTTC,
  };
}

function evalRule(rule: MajorationRule, ctx: QuoteContext): boolean {
  switch (rule.ruleType) {
    case "TRAVEL_FEE":
      return typeof ctx.distanceKm === "number" && ctx.distanceKm >= rule.criteria.minDistanceKm;
    case "AREA_ABOVE_HAB":
      return typeof ctx.surface === "number" && ctx.surface >= rule.criteria.minSurface;
    case "URGENT_DELAY":
      return !!ctx.urgency && rule.criteria.urgencyValues.includes(ctx.urgency);
    case "COLLECTIVE_HEATING":
      return ctx.heatingMode === "collective" && ctx.hasCollectiveDPE === true;
    case "CUSTOM":
      return true;
    default:
      return false;
  }
}

export function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}
