import { describe, expect, it } from "vitest";

import {
  computeQuote,
  roundCents,
  type MajorationRule,
  type QuoteLine,
} from "../compute";

const LINES: QuoteLine[] = [
  {
    diagnosticTypeId: 1,
    label: "DPE",
    quantity: 1,
    unitPrice: 150,
    lineTotal: 150,
  },
  {
    diagnosticTypeId: 2,
    label: "ERP",
    quantity: 1,
    unitPrice: 30,
    lineTotal: 30,
  },
];

describe("computeQuote", () => {
  it("calcule subtotal + TVA 20% sans majoration", () => {
    const res = computeQuote(LINES, [], {}, 0.2);
    expect(res.subtotalBeforeMajoration).toBe(180);
    expect(res.subtotalHT).toBe(180);
    expect(res.vatAmount).toBe(36);
    expect(res.totalTTC).toBe(216);
  });

  it("applique TRAVEL_FEE flat si distance > seuil", () => {
    const rules: MajorationRule[] = [
      {
        ruleType: "TRAVEL_FEE",
        label: "Déplacement > 50 km",
        amountFlat: 30,
        criteria: { minDistanceKm: 50 },
      },
    ];
    const res = computeQuote(LINES, rules, { distanceKm: 60 }, 0.2);
    expect(res.appliedMajorations).toEqual([{ label: "Déplacement > 50 km", amount: 30 }]);
    expect(res.subtotalHT).toBe(210);
    expect(res.totalTTC).toBe(252);
  });

  it("n'applique pas TRAVEL_FEE si distance < seuil", () => {
    const rules: MajorationRule[] = [
      {
        ruleType: "TRAVEL_FEE",
        label: "Déplacement",
        amountFlat: 30,
        criteria: { minDistanceKm: 50 },
      },
    ];
    const res = computeQuote(LINES, rules, { distanceKm: 10 }, 0.2);
    expect(res.appliedMajorations).toEqual([]);
  });

  it("applique URGENT_DELAY en pourcentage", () => {
    const rules: MajorationRule[] = [
      {
        ruleType: "URGENT_DELAY",
        label: "Urgent < 48h",
        amountPercent: 20,
        criteria: { urgencyValues: ["asap"] },
      },
    ];
    const res = computeQuote(LINES, rules, { urgency: "asap" }, 0.2);
    // 180 + 20% = 180 + 36 = 216
    expect(res.subtotalHT).toBe(216);
  });

  it("applique COLLECTIVE_HEATING seulement si hasCollectiveDPE", () => {
    const rules: MajorationRule[] = [
      {
        ruleType: "COLLECTIVE_HEATING",
        label: "Chauffage collectif",
        amountPercent: 10,
      },
    ];
    const noMatch = computeQuote(LINES, rules, { heatingMode: "collective" }, 0.2);
    expect(noMatch.appliedMajorations).toEqual([]);
    const match = computeQuote(
      LINES,
      rules,
      { heatingMode: "collective", hasCollectiveDPE: true },
      0.2
    );
    expect(match.appliedMajorations).toHaveLength(1);
  });

  it("cumule plusieurs majorations dans l'ordre", () => {
    const rules: MajorationRule[] = [
      {
        ruleType: "TRAVEL_FEE",
        label: "Déplacement",
        amountFlat: 30,
        criteria: { minDistanceKm: 50 },
      },
      {
        ruleType: "URGENT_DELAY",
        label: "Urgent",
        amountPercent: 20,
        criteria: { urgencyValues: ["asap"] },
      },
    ];
    const res = computeQuote(LINES, rules, { distanceKm: 100, urgency: "asap" }, 0.2);
    // 180 + 30 = 210 ; 210 * 1.20 = 252 (20% du 210) → majoration URGENT = 42
    expect(res.appliedMajorations).toEqual([
      { label: "Déplacement", amount: 30 },
      { label: "Urgent", amount: 42 },
    ]);
    expect(res.subtotalHT).toBe(252);
  });

  it("roundCents arrondit à 2 décimales", () => {
    expect(roundCents(10.234)).toBe(10.23);
    expect(roundCents(10.235)).toBe(10.24);
  });
});
