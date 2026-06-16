import { describe, expect, it } from "vitest";

import {
  computeNextAccordion,
  type StepDoneFlags,
} from "./computeNextAccordion";

const flags = (over: Partial<StepDoneFlags> = {}): StepDoneFlags => ({
  prop: false,
  tech: false,
  time: false,
  ...over,
});

describe("computeNextAccordion", () => {
  it("prop complétée (ouvert sur prop) → ouvre tech", () => {
    const prev = flags();
    const next = flags({ prop: true });
    expect(computeNextAccordion(prev, next, "prop")).toBe("tech");
  });

  it("tech complétée (ouvert sur tech) → ouvre time en SAUTANT l'étape optionnelle existing", () => {
    // Régression d'origine : la chaîne se figeait sur « existing » et n'ouvrait
    // jamais « time ». Ce test verrouille le saut direct tech → time.
    const prev = flags({ prop: true });
    const next = flags({ prop: true, tech: true });
    expect(computeNextAccordion(prev, next, "tech")).toBe("time");
  });

  it("time complétée (ouvert sur time) → ouvre contact", () => {
    const prev = flags({ prop: true, tech: true });
    const next = flags({ prop: true, tech: true, time: true });
    expect(computeNextAccordion(prev, next, "time")).toBe("contact");
  });

  it("aucune nouvelle complétion → aucune ouverture", () => {
    const prev = flags({ prop: true, tech: true });
    const next = flags({ prop: true, tech: true });
    expect(computeNextAccordion(prev, next, "tech")).toBeNull();
  });

  it("étape complétée mais accordéon courant différent → aucune ouverture", () => {
    // L'utilisateur a navigué ailleurs : on ne force pas l'ouverture.
    const prev = flags({ prop: true });
    const next = flags({ prop: true, tech: true });
    expect(computeNextAccordion(prev, next, "existing")).toBeNull();
  });

  it("existing n'est jamais une cible d'auto-ouverture", () => {
    // On parcourt toutes les transitions : aucune ne mène à « existing ».
    const prev = flags();
    const next = flags({ prop: true });
    expect(computeNextAccordion(prev, next, "prop")).not.toBe("existing");
  });
});
