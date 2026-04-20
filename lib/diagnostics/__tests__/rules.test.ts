import { describe, expect, it } from "vitest";

import { calculateRequiredDiagnostics } from "../rules";
import type { DiagnosticId, QuoteFormData } from "../types";

// ---------------------------------------------------------------------------
// Test helper — construit un QuoteFormData "valide" (vente maison typique)
// et on override les champs qui nous intéressent par test.
// ---------------------------------------------------------------------------
function makeData(overrides: Partial<QuoteFormData> = {}): QuoteFormData {
  return {
    project_type: "sale",
    property_type: "house",
    postal_code: "37000",
    surface: 100,
    rooms_count: 4,
    is_coownership: false,
    permit_date_range: "after_1997",
    heating_type: "electric",
    gas_installation: "none",
    gas_over_15_years: null,
    electric_over_15_years: false,
    ...overrides,
  };
}

function ids(diagnostics: Array<{ id: DiagnosticId }>): DiagnosticId[] {
  return diagnostics.map((d) => d.id);
}

// ===========================================================================
// Cas 1 — Vente maison récente (après 1997), chauffage électrique, élec < 15 ans
// ===========================================================================
describe("Cas 1 — Vente maison récente, chauffage électrique, élec < 15 ans", () => {
  it("déclenche DPE + Termites + ERP sans plomb ni amiante", () => {
    const result = calculateRequiredDiagnostics(makeData());

    expect(ids(result.required).sort()).toEqual(["dpe", "erp", "termites"].sort());
    expect(result.toClarify).toEqual([]);
  });
});

// ===========================================================================
// Cas 2 — Vente maison pré-1949, chauffage gaz +15, élec +15
// ===========================================================================
describe("Cas 2 — Vente maison pré-1949 chauffage gaz +15 ans électricité +15 ans", () => {
  it("déclenche la liste complète DPE + Plomb + Amiante + Termites + Gaz + Électricité + ERP", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        permit_date_range: "before_1949",
        heating_type: "gas",
        gas_installation: "city_gas",
        gas_over_15_years: true,
        electric_over_15_years: true,
      })
    );

    expect(ids(result.required).sort()).toEqual(
      ["dpe", "lead", "asbestos", "termites", "gas", "electric", "erp"].sort()
    );
    expect(result.toClarify).toEqual([]);
  });
});

// ===========================================================================
// Cas 3 — Location appartement copropriété années 80 (1949-1997), vide, élec +15
// ===========================================================================
describe("Cas 3 — Location appartement copropriété années 80, vide, élec +15", () => {
  it("déclenche DPE + DAPP + Électricité + Boutin + ERP (pas de Termites en location)", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        project_type: "rental",
        property_type: "apartment",
        is_coownership: true,
        rental_furnished: "vide",
        permit_date_range: "1949_to_1997",
        heating_type: "electric",
        gas_installation: "none",
        electric_over_15_years: true,
      })
    );

    expect(ids(result.required).sort()).toEqual(
      ["dpe", "dapp", "electric", "boutin", "erp"].sort()
    );
    expect(result.toClarify).toEqual([]);
  });
});

// ===========================================================================
// Cas 4 — Vente copropriété 1949-1997 avec amiante et Loi Carrez
// ===========================================================================
describe("Cas 4 — Vente appartement copropriété 1949-1997", () => {
  it("déclenche DPE + Amiante + Termites + Carrez + ERP", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        property_type: "apartment",
        is_coownership: true,
        permit_date_range: "1949_to_1997",
      })
    );

    expect(ids(result.required).sort()).toEqual(
      ["dpe", "asbestos", "termites", "carrez", "erp"].sort()
    );
    expect(result.toClarify).toEqual([]);
  });
});

// ===========================================================================
// Cas 5 — Travaux rénovation, bâtiment 1949-1997
// ===========================================================================
describe("Cas 5 — Travaux rénovation dans un bâtiment 1949-1997", () => {
  it("déclenche uniquement Amiante avant travaux (pas de plomb avant travaux)", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        project_type: "works",
        works_type: "renovation",
        permit_date_range: "1949_to_1997",
      })
    );

    expect(ids(result.required)).toEqual(["asbestos_works"]);
    expect(result.toClarify).toEqual([]);
  });
});

// ===========================================================================
// Cas 6 — Travaux démolition, bâtiment pré-1949
// ===========================================================================
describe("Cas 6 — Travaux démolition dans un bâtiment pré-1949", () => {
  it("déclenche Amiante avant travaux + Plomb avant travaux", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        project_type: "works",
        works_type: "demolition",
        permit_date_range: "before_1949",
      })
    );

    expect(ids(result.required).sort()).toEqual(["asbestos_works", "lead_works"].sort());
    expect(result.toClarify).toEqual([]);
  });
});

// ===========================================================================
// Cas 7 — « Je ne sais pas » sur toutes les questions techniques (Option B)
// ===========================================================================
describe("Cas 7 — Unknown partout (permis, gaz, élec)", () => {
  it("déclenche DPE + Termites + ERP en required, Plomb + Amiante + Élec en toClarify", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        permit_date_range: "unknown",
        heating_type: "unknown",
        gas_installation: "unknown",
        gas_over_15_years: null,
        electric_over_15_years: null,
      })
    );

    // Required : ce qui ne dépend pas des "unknown"
    expect(ids(result.required).sort()).toEqual(["dpe", "termites", "erp"].sort());

    // toClarify : plomb + amiante + gaz (installation unknown) + électricité
    expect(ids(result.toClarify).sort()).toEqual(["lead", "asbestos", "gas", "electric"].sort());
  });
});

// ===========================================================================
// Cas 8 — Hors zone 37 (ex: Loir-et-Cher 41000) — pas de Termites
// ===========================================================================
describe("Cas 8 — Vente hors Indre-et-Loire (41000)", () => {
  it("ne déclenche PAS Termites mais garde DPE + Plomb + Amiante + ERP", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        postal_code: "41000",
        permit_date_range: "before_1949",
      })
    );

    expect(ids(result.required)).not.toContain("termites");
    expect(ids(result.required).sort()).toEqual(["dpe", "lead", "asbestos", "erp"].sort());
  });
});

// ===========================================================================
// Cas 9 — Location meublée (pas de Loi Boutin)
// ===========================================================================
describe("Cas 9 — Location meublée d'un appartement 1990", () => {
  it("ne déclenche PAS Boutin mais DAPP reste obligatoire", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        project_type: "rental",
        property_type: "apartment",
        rental_furnished: "meuble",
        permit_date_range: "1949_to_1997",
        electric_over_15_years: true,
      })
    );

    expect(ids(result.required)).not.toContain("boutin");
    expect(ids(result.required).sort()).toEqual(["dpe", "dapp", "electric", "erp"].sort());
  });
});

// ===========================================================================
// Cas 10 — Vente local commercial (tertiaire) — 1980
// ===========================================================================
describe("Cas 10 — Vente local commercial pré-1997", () => {
  it("déclenche DPE Tertiaire + Amiante + Termites + ERP, pas de Plomb/Carrez/Boutin", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        property_type: "commercial",
        is_coownership: false,
        permit_date_range: "1949_to_1997",
      })
    );

    expect(ids(result.required).sort()).toEqual(
      ["dpe_tertiary", "asbestos", "termites", "erp"].sort()
    );
    expect(ids(result.required)).not.toContain("lead");
    expect(ids(result.required)).not.toContain("carrez");
    expect(ids(result.required)).not.toContain("boutin");
  });
});

// ===========================================================================
// Cas 11 — Vente terrain nu — ERP uniquement
// ===========================================================================
describe("Cas 11 — Vente d'un terrain nu", () => {
  it("déclenche uniquement ERP (pas de DPE, pas de Termites)", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        property_type: "land",
      })
    );

    expect(ids(result.required)).toEqual(["erp"]);
    expect(result.toClarify).toEqual([]);
  });
});

// ===========================================================================
// Cas 12 — Location appartement copro 1995 : gaz +15 avéré, élec inconnu
// ===========================================================================
describe("Cas 12 — Location appartement copro 1995 gaz +15, élec inconnu", () => {
  it("déclenche DPE + DAPP + Gaz + Boutin + ERP en required et Élec en toClarify", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        project_type: "rental",
        property_type: "apartment",
        is_coownership: true,
        rental_furnished: "vide",
        permit_date_range: "1949_to_1997",
        heating_type: "gas",
        gas_installation: "city_gas",
        gas_over_15_years: true,
        electric_over_15_years: null,
      })
    );

    expect(ids(result.required).sort()).toEqual(["dpe", "dapp", "gas", "boutin", "erp"].sort());
    expect(ids(result.toClarify)).toEqual(["electric"]);
  });
});

// ===========================================================================
// Cas 13 — Vente maison chauffage gaz déclaré mais installation === 'none'
// (cas incohérent saisi par l'utilisateur — on respecte 'none' comme autorité)
// ===========================================================================
describe("Cas 13 — Vente maison 1960 chauffage gaz mais gas_installation=none", () => {
  it("ne déclenche pas Gaz parce que gas_installation = none", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        permit_date_range: "1949_to_1997",
        heating_type: "gas",
        gas_installation: "none",
        gas_over_15_years: null,
      })
    );

    expect(ids(result.required)).not.toContain("gas");
    expect(ids(result.toClarify)).not.toContain("gas");
  });
});

// ===========================================================================
// Cas 14 — Projet copropriété (gestion syndic) sur bâtiment pré-1997
// ===========================================================================
describe("Cas 14 — Gestion copropriété d'un immeuble pré-1997", () => {
  it("déclenche DTA en required et DPE collectif en toClarify", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        project_type: "coownership",
        property_type: "common_areas",
        is_coownership: true,
        permit_date_range: "1949_to_1997",
      })
    );

    expect(ids(result.required)).toEqual(["dta"]);
    expect(ids(result.toClarify)).toEqual(["dpe_collective"]);
  });
});

// ===========================================================================
// Cas 15 — Projet "other" : aucune règle fiable
// ===========================================================================
describe("Cas 15 — Projet 'other'", () => {
  it("retourne un résultat vide (traitement humain côté Servicimmo)", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        project_type: "other",
      })
    );

    expect(result.required).toEqual([]);
    expect(result.toClarify).toEqual([]);
  });
});

// ===========================================================================
// Cas 16 — Travaux avec permis inconnu (Option B)
// ===========================================================================
describe("Cas 16 — Travaux avec permis unknown", () => {
  it("met Amiante avant travaux + Plomb avant travaux en toClarify", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        project_type: "works",
        works_type: "renovation",
        permit_date_range: "unknown",
      })
    );

    expect(result.required).toEqual([]);
    expect(ids(result.toClarify).sort()).toEqual(["asbestos_works", "lead_works"].sort());
  });
});

// ===========================================================================
// Cas 17 — Vente maison après 1997 avec installation gaz inconnue
// ===========================================================================
describe("Cas 17 — Vente maison après 1997 avec gas_installation=unknown", () => {
  it("met Gaz en toClarify (présence à vérifier sur place)", () => {
    const result = calculateRequiredDiagnostics(
      makeData({
        permit_date_range: "after_1997",
        heating_type: "unknown",
        gas_installation: "unknown",
        gas_over_15_years: null,
      })
    );

    expect(ids(result.toClarify)).toContain("gas");
  });
});
