/**
 * Helpers de mapping entre la couche UI (design V2) et le store Zustand
 * (`QuoteFormData` / `FullQuoteInput`).
 *
 * Raison d'être :
 * - Le design V2 utilise ses propres enums pour certains champs (ex : `pre1949`
 *   côté UI, `before_1949` côté store/schémas/DB).
 * - Plusieurs champs sont en tri-state côté UI ("oui / non / je ne sais pas")
 *   mais stockés en `boolean | null`.
 *
 * Ces helpers centralisent la traduction pour que les composants d'écran ne
 * manipulent que des clés UI lisibles, et que le store reste 1:1 aligné sur
 * la couche rules/pricing/API.
 */

import type { PermitDateRange } from "@/lib/diagnostics/types";

// ---------------------------------------------------------------------------
// Tri-state ↔ boolean nullable
// ---------------------------------------------------------------------------

export type TriState = "yes" | "no" | "dk";

export function triStateToBoolean(v: TriState | null | undefined): boolean | null {
  if (v === "yes") return true;
  if (v === "no") return false;
  return null; // "dk" explicite → null en DB
}

/**
 * `undefined` signifie "pas encore répondu" → on retourne `undefined` pour que
 * l'UI n'affiche aucun radio pré-sélectionné. `null` signifie "je ne sais pas"
 * explicite → on retourne "dk".
 */
export function booleanToTriState(v: boolean | null | undefined): TriState | undefined {
  if (v === true) return "yes";
  if (v === false) return "no";
  if (v === null) return "dk";
  return undefined;
}

// ---------------------------------------------------------------------------
// Permit date range : clés UI ↔ enum store
// ---------------------------------------------------------------------------

export type PermitUIValue = "pre1949" | "1949_1997" | "post1997" | "dk";

const PERMIT_UI_TO_STORE: Record<PermitUIValue, PermitDateRange> = {
  pre1949: "before_1949",
  "1949_1997": "1949_to_1997",
  post1997: "after_1997",
  dk: "unknown",
};

const PERMIT_STORE_TO_UI: Record<PermitDateRange, PermitUIValue> = {
  before_1949: "pre1949",
  "1949_to_1997": "1949_1997",
  after_1997: "post1997",
  unknown: "dk",
};

export function permitUIToStore(v: PermitUIValue): PermitDateRange {
  return PERMIT_UI_TO_STORE[v];
}

export function permitStoreToUI(v: PermitDateRange | undefined): PermitUIValue | undefined {
  if (v === undefined) return undefined;
  return PERMIT_STORE_TO_UI[v];
}

export const PERMIT_UI_OPTIONS: ReadonlyArray<{ value: PermitUIValue; label: string }> = [
  { value: "pre1949", label: "Avant 1949" },
  { value: "1949_1997", label: "1949 – juillet 1997" },
  { value: "post1997", label: "Après juillet 1997" },
  { value: "dk", label: "Je ne sais pas" },
] as const;
