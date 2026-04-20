import { describe, expect, it } from "vitest";

import { basePrice, estimatePrice } from "../pricing";
import type { PricingContext, PropertyType, RequiredDiagnostic } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeContext(overrides: Partial<PricingContext> = {}): PricingContext {
  return {
    surface: 100,
    postal_code: "37000",
    property_type: "house",
    urgency: null,
    ...overrides,
  };
}

/** Builder de diagnostics simplifié — id et prix suffisent pour les tests. */
function diag(id: RequiredDiagnostic["id"]): RequiredDiagnostic {
  return {
    id,
    name: id,
    reason: "",
    validityMonths: 12,
  };
}

// ===========================================================================
// Cas 1 — Exemple du brief QUESTIONNAIRE_FLOW.md §5 :
// Vente maison 110 m² à Joué-lès-Tours, permis 1949-1997, gaz +15, élec +15
// Diagnostics : DPE maison (110-220), Amiante maison (80-150), Termites (90-170),
//              Gaz (90-130), Élec (90-130), ERP (20-40)
// Total brut : 480-840 ; ×1.1 (surface 80-150) = 528-924 ; ×0.85 (pack) = 448.8-785.4
// Arrondi dizaine : 450-790
// ===========================================================================
describe("Cas 1 — Exemple du brief QUESTIONNAIRE_FLOW §5", () => {
  it("maison 110 m² à Joué-lès-Tours avec 6 diagnostics → 450-790 €", () => {
    const diagnostics = [
      diag("dpe"),
      diag("asbestos"),
      diag("termites"),
      diag("gas"),
      diag("electric"),
      diag("erp"),
    ];
    const result = estimatePrice(
      diagnostics,
      makeContext({ surface: 110, property_type: "house" })
    );

    expect(result.min).toBe(450);
    expect(result.max).toBe(790);
    expect(result.appliedModulators).toContain("Surface 80-150 m² (+10 %)");
    expect(result.appliedModulators).toContain("Pack complet ≥ 3 diagnostics (−15 %)");
  });
});

// ===========================================================================
// Cas 2 — Studio 30 m² → modulateur surface −10 %
// ===========================================================================
describe("Cas 2 — Studio 30 m² avec 2 diagnostics (DPE + ERP)", () => {
  it("applique le modulateur -10 % sur la surface", () => {
    const result = estimatePrice(
      [diag("dpe"), diag("erp")],
      makeContext({ surface: 30, property_type: "apartment" })
    );

    // Base: DPE appt (90-180) + ERP (20-40) = 110-220
    // Surface ≤ 40 : ×0.9 → 99-198 → arrondi dizaine → 100-200
    expect(result.min).toBe(100);
    expect(result.max).toBe(200);
    expect(result.appliedModulators).toContain("Surface ≤ 40 m² (−10 %)");
  });
});

// ===========================================================================
// Cas 3 — Appartement 60 m² : aucun modulateur de surface (tranche 40-80)
// ===========================================================================
describe("Cas 3 — Appartement 60 m² avec DPE et ERP", () => {
  it("ne pousse pas de modulateur de surface", () => {
    const result = estimatePrice(
      [diag("dpe"), diag("erp")],
      makeContext({ surface: 60, property_type: "apartment" })
    );

    expect(result.appliedModulators.some((m) => m.startsWith("Surface"))).toBe(false);

    // Base pure : 110-220 → arrondi → 110-220
    expect(result.min).toBe(110);
    expect(result.max).toBe(220);
  });
});

// ===========================================================================
// Cas 4 — Grande maison 200 m² → modulateur +20 %
// ===========================================================================
describe("Cas 4 — Maison 200 m² avec 2 diagnostics", () => {
  it("applique le modulateur +20 % sur la surface", () => {
    const result = estimatePrice(
      [diag("dpe"), diag("erp")],
      makeContext({ surface: 200, property_type: "house" })
    );

    // Base: DPE maison (110-220) + ERP (20-40) = 130-260
    // Surface >150 : ×1.2 → 156-312 → arrondi dizaine → 160-310
    expect(result.min).toBe(160);
    expect(result.max).toBe(310);
    expect(result.appliedModulators).toContain("Surface > 150 m² (+20 %)");
  });
});

// ===========================================================================
// Cas 5 — Urgence <48h → +20 %
// ===========================================================================
describe("Cas 5 — Urgence intervention < 48 h", () => {
  it("applique +20 %", () => {
    const result = estimatePrice(
      [diag("dpe"), diag("erp")],
      makeContext({
        surface: 60,
        property_type: "apartment",
        urgency: "asap",
      })
    );

    // Base: 110-220 ; urgence ×1.2 → 132-264 → arrondi dizaine → 130-260
    expect(result.min).toBe(130);
    expect(result.max).toBe(260);
    expect(result.appliedModulators).toContain("Intervention < 48 h (+20 %)");
  });
});

// ===========================================================================
// Cas 6 — Hors Indre-et-Loire (45000 Orléans) → +15 %
// ===========================================================================
describe("Cas 6 — Hors Indre-et-Loire (Loiret 45000)", () => {
  it("applique +15 % de zone géographique", () => {
    const result = estimatePrice(
      [diag("dpe"), diag("erp")],
      makeContext({
        surface: 60,
        property_type: "apartment",
        postal_code: "45000",
      })
    );

    // Base: 110-220 ; zone ×1.15 → 126.5-253 → arrondi dizaine → 130-250
    expect(result.min).toBe(130);
    expect(result.max).toBe(250);
    expect(result.appliedModulators).toContain("Hors Indre-et-Loire (+15 %)");
  });
});

// ===========================================================================
// Cas 7 — Pack 2 diagnostics → PAS de remise pack
// ===========================================================================
describe("Cas 7 — 2 diagnostics seulement", () => {
  it("ne déclenche PAS la remise pack (−15 %)", () => {
    const result = estimatePrice(
      [diag("dpe"), diag("erp")],
      makeContext({ surface: 60, property_type: "apartment" })
    );

    expect(result.appliedModulators.some((m) => m.includes("Pack complet"))).toBe(false);
  });
});

// ===========================================================================
// Cas 8 — Pack 3 diagnostics exactement → remise pack
// ===========================================================================
describe("Cas 8 — 3 diagnostics → remise pack −15 %", () => {
  it("applique la remise", () => {
    const result = estimatePrice(
      [diag("dpe"), diag("termites"), diag("erp")],
      makeContext({ surface: 60, property_type: "apartment" })
    );

    expect(result.appliedModulators).toContain("Pack complet ≥ 3 diagnostics (−15 %)");
    // Base: 90+90+20=200 / 180+170+40=390 → ×0.85 = 170-331.5 → arrondi → 170-330
    expect(result.min).toBe(170);
    expect(result.max).toBe(330);
  });
});

// ===========================================================================
// Cas 9 — Liste de diagnostics vide → {0, 0}
// ===========================================================================
describe("Cas 9 — Aucun diagnostic à estimer", () => {
  it("retourne 0-0 sans modulateur", () => {
    const result = estimatePrice([], makeContext());

    expect(result.min).toBe(0);
    expect(result.max).toBe(0);
    expect(result.appliedModulators).toEqual([]);
  });
});

// ===========================================================================
// Cas 10 — Cumul de tous les modulateurs
// ===========================================================================
describe("Cas 10 — Cumul surface >150 + urgence + hors zone + pack", () => {
  it("empile les 4 modulateurs dans l'ordre", () => {
    const diagnostics = [diag("dpe"), diag("asbestos"), diag("lead"), diag("erp")];
    const result = estimatePrice(
      diagnostics,
      makeContext({
        surface: 220,
        property_type: "house",
        postal_code: "72000", // hors 37
        urgency: "asap",
      })
    );

    expect(result.appliedModulators).toContain("Surface > 150 m² (+20 %)");
    expect(result.appliedModulators).toContain("Intervention < 48 h (+20 %)");
    expect(result.appliedModulators).toContain("Hors Indre-et-Loire (+15 %)");
    expect(result.appliedModulators).toContain("Pack complet ≥ 3 diagnostics (−15 %)");

    // Base maison: DPE (110-220) + Amiante (80-150) + Plomb (110-220) + ERP (20-40)
    // = 320-630
    // ×1.2 (surface) = 384-756
    // ×1.2 (urgence) = 460.8-907.2
    // ×1.15 (zone) = 529.92-1043.28
    // ×0.85 (pack) = 450.43-886.79
    // arrondi dizaine = 450-890
    expect(result.min).toBe(450);
    expect(result.max).toBe(890);
  });
});

// ===========================================================================
// Cas 11 — Prix de base DPE maison vs appartement
// ===========================================================================
describe("Cas 11 — basePrice DPE", () => {
  it("DPE maison = 110-220, DPE appartement = 90-180", () => {
    expect(basePrice("dpe", "house")).toEqual({ min: 110, max: 220 });
    expect(basePrice("dpe", "apartment")).toEqual({ min: 90, max: 180 });
  });

  it("Amiante maison > Amiante appartement", () => {
    expect(basePrice("asbestos", "house")).toEqual({ min: 80, max: 150 });
    expect(basePrice("asbestos", "apartment")).toEqual({ min: 70, max: 130 });
  });
});

// ===========================================================================
// Cas 12 — Arrondi à la dizaine
// ===========================================================================
describe("Cas 12 — Arrondi à la dizaine", () => {
  it("arrondit correctement 126.5 à 130 et 253 à 250", () => {
    // On reprend le cas 6 pour vérifier l'arrondi
    const result = estimatePrice(
      [diag("dpe"), diag("erp")],
      makeContext({
        surface: 60,
        property_type: "apartment",
        postal_code: "45000",
      })
    );

    // min brut = 126.5 → 130 (arrondi sup-inférieur)
    // max brut = 253 → 250 (arrondi inférieur)
    expect(result.min % 10).toBe(0);
    expect(result.max % 10).toBe(0);
    expect(result.min).toBe(130);
    expect(result.max).toBe(250);
  });
});

// ===========================================================================
// Cas 13 — Travaux : amiante avant travaux + plomb avant travaux
// ===========================================================================
describe("Cas 13 — Travaux : amiante + plomb avant travaux (2 diags, pas de pack)", () => {
  it("somme les deux sans modulateur surface 80-150", () => {
    const result = estimatePrice(
      [diag("asbestos_works"), diag("lead_works")],
      makeContext({ surface: 100, property_type: "house" })
    );

    // Base: Amiante travaux (250-600) + Plomb travaux (150-400) = 400-1000
    // ×1.1 (surface 80-150) = 440-1100 → arrondi → 440-1100
    expect(result.min).toBe(440);
    expect(result.max).toBe(1100);
    expect(result.appliedModulators).toContain("Surface 80-150 m² (+10 %)");
    expect(result.appliedModulators.some((m) => m.includes("Pack complet"))).toBe(false);
  });
});

// ===========================================================================
// Cas 14 — Valeurs "sur devis" (DTA, DPE collectif) comptées dans la fourchette
// ===========================================================================
describe("Cas 14 — Gestion copropriété avec DTA (sur devis indicatif)", () => {
  it("intègre la fourchette indicative DTA (400-900)", () => {
    const result = estimatePrice(
      [diag("dta")],
      makeContext({ surface: 1000, property_type: "common_areas" as PropertyType })
    );

    // Base DTA: 400-900 ; surface >150 → ×1.2 → 480-1080 → arrondi dizaine → 480-1080
    expect(result.min).toBe(480);
    expect(result.max).toBe(1080);
  });
});
