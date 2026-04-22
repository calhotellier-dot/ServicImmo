import { describe, expect, it } from "vitest";

import { computeDossierCompletionRate } from "../completion";

describe("computeDossierCompletionRate", () => {
  it("retourne 0 pour un dossier vide", () => {
    expect(computeDossierCompletionRate({})).toBe(0);
  });

  it("retourne 100 pour un dossier complet (tous les champs pondérés)", () => {
    const rate = computeDossierCompletionRate({
      project_type: "sale",
      property_type: "house",
      address: "12 rue de Tours",
      postal_code: "37000",
      city: "Tours",
      surface: 100,
      rooms_count: 4,
      is_coownership: false,
      permit_date_range: "after_1997",
      heating_type: "electric",
      heating_mode: "individual",
      gas_installation: "none",
      gas_over_15_years: false,
      electric_over_15_years: false,
      proprietaire_id: "00000000-0000-0000-0000-000000000001",
      technicien_id: "00000000-0000-0000-0000-000000000002",
      urgency: "week",
      requested_date: "2026-05-01",
      notes: "Client absent le matin.",
    });
    expect(rate).toBe(100);
  });

  it("reflète les champs critiques avec un poids supérieur", () => {
    const onlyProject = computeDossierCompletionRate({ project_type: "sale" });
    const onlyNotes = computeDossierCompletionRate({ notes: "abcde" });
    expect(onlyProject).toBeGreaterThan(onlyNotes);
  });

  it("rejette les codes postaux mal formés", () => {
    const bad = computeDossierCompletionRate({ postal_code: "37" });
    const good = computeDossierCompletionRate({ postal_code: "37000" });
    expect(good).toBeGreaterThan(bad);
  });
});
