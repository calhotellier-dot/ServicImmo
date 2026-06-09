import type { ReactNode } from "react";

import type { ProjectType } from "@/lib/core/diagnostics/types";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

/**
 * Affichage sans scroll : à l'intérieur d'une étape, un seul sous-bloc déplié à
 * la fois. Voir la spec `docs/superpowers/specs/2026-06-10-questionnaire-sous-blocs-design.md`.
 */

export type SubBlockState = "expanded" | "summary" | "placeholder" | "hidden";

export type SubBlockDescriptor = {
  key: string;
  title: string;
  /** Le sous-bloc est-il pertinent dans le contexte courant ? */
  isVisible: (data: QuestionnaireData, branch: ProjectType) => boolean;
  /**
   * Le sous-bloc est-il « rempli » ? Un sous-bloc OPTIONNEL renvoie toujours
   * `true` : il ne devient jamais le bloc actif (ne bloque pas l'avancement).
   */
  isComplete: (data: QuestionnaireData, branch: ProjectType) => boolean;
  /** Résumé d'une ligne affiché quand le bloc est replié. */
  summary: (data: QuestionnaireData) => string | undefined;
  /** Les champs réels, rendus uniquement quand le bloc est déplié. */
  render: () => ReactNode;
};

export type StepProps = {
  data: QuestionnaireData;
  updateData: (patch: QuestionnaireData) => void;
  branch: ProjectType;
};
