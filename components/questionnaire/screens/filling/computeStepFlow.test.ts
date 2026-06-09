import { describe, expect, it } from "vitest";

import type { ProjectType } from "@/lib/core/diagnostics/types";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

import { computeStepFlow } from "./computeStepFlow";
import type { SubBlockDescriptor } from "./types";

// ── Descripteurs factices pour tester le moteur en isolation ────────────────
// Étape : a (requis) → b (requis, visible si a) → opt (optionnel, visible si a).
const desc = (
  over: Partial<SubBlockDescriptor> & { key: string },
): SubBlockDescriptor => ({
  title: over.key,
  isVisible: () => true,
  isComplete: () => false,
  summary: () => undefined,
  render: () => null,
  ...over,
});

const BLOCKS: SubBlockDescriptor[] = [
  desc({ key: "a", isComplete: (d) => !!d.property_type }),
  desc({
    key: "b",
    isVisible: (d) => !!d.property_type,
    isComplete: (d) => typeof d.surface === "number",
  }),
  desc({
    key: "opt",
    isVisible: (d) => !!d.property_type,
    isComplete: () => true, // optionnel
  }),
];

const branch: ProjectType = "sale";
const run = (data: QuestionnaireData, editing: string | null = null) =>
  computeStepFlow(BLOCKS, data, branch, editing);

describe("computeStepFlow", () => {
  it("data vide → 1er bloc actif, le reste masqué", () => {
    const s = run({});
    expect(s.a).toBe("expanded");
    expect(s.b).toBe("hidden");
    expect(s.opt).toBe("hidden");
  });

  it("1er rempli → 1er en résumé, 2e actif, optionnel en résumé", () => {
    const s = run({ property_type: "apartment" });
    expect(s.a).toBe("summary");
    expect(s.b).toBe("expanded");
    expect(s.opt).toBe("summary"); // optionnel visible mais jamais actif
  });

  it("tout requis rempli → aucun bloc déplié (étape terminée)", () => {
    const s = run({ property_type: "apartment", surface: 50 });
    expect(s.a).toBe("summary");
    expect(s.b).toBe("summary");
    expect(s.opt).toBe("summary");
  });

  it("editingKey ré-ouvre un bloc rempli (en plus de l'actif naturel)", () => {
    const s = run({ property_type: "apartment" }, "a");
    expect(s.a).toBe("expanded"); // ré-ouvert manuellement
    expect(s.b).toBe("expanded"); // toujours l'actif naturel
  });

  it("editingKey sur un bloc masqué est ignoré", () => {
    const s = run({}, "b");
    expect(s.b).toBe("hidden");
    expect(s.a).toBe("expanded");
  });

  it("rendre incomplet un bloc déjà rempli le réactive", () => {
    const filled = run({ property_type: "apartment", surface: 50 });
    expect(filled.b).toBe("summary");
    const cleared = run({ property_type: "apartment" });
    expect(cleared.b).toBe("expanded");
  });
});
