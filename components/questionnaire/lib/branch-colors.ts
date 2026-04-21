/**
 * Helpers pour injecter les couleurs d'une branche via variables CSS locales.
 *
 * Pattern : chaque écran / composant wrapper applique `getBranchVars(branch)`
 * en `style`, ce qui expose `--branch-bg`, `--branch-fg`, `--branch-dark` à
 * tous les enfants. Les primitives (Chips, RadioRow, Accordion…) référencent
 * ensuite `var(--branch-fg)` etc. sans rien savoir du projet choisi.
 *
 * Les valeurs sont inlinées ici plutôt que référencées via `var(--color-*)` :
 * Tailwind v4 ne les émettrait pas comme custom properties car elles ne sont
 * consommées qu'à travers une indirection (var de var). Palette source :
 * `cream-lime-sage` du handoff Claude Design.
 */

import type { CSSProperties } from "react";

import type { ProjectType } from "@/lib/diagnostics/types";

const BRANCH_HEX: Record<ProjectType, { bg: string; fg: string; dark: string }> = {
  sale: { bg: "#eaf5c7", fg: "#7a9b1c", dark: "#546b10" },
  rental: { bg: "#d8e9d1", fg: "#5a8256", dark: "#365233" },
  works: { bg: "#f0d9bf", fg: "#b36a3a", dark: "#733e1c" },
  coownership: { bg: "#d4e8e6", fg: "#2a7570", dark: "#104a48" },
  other: { bg: "#e4e0cc", fg: "#6a6452", dark: "#3a3628" },
};

export function getBranchVars(branch: ProjectType | null | undefined): CSSProperties {
  const c = BRANCH_HEX[branch ?? "sale"];
  return {
    ["--branch-fg" as string]: c.fg,
    ["--branch-bg" as string]: c.bg,
    ["--branch-dark" as string]: c.dark,
  };
}
