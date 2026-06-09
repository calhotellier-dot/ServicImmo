import type { ProjectType } from "@/lib/core/diagnostics/types";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

import type { SubBlockDescriptor, SubBlockState } from "./types";

/**
 * Moteur de séquencement PUR des sous-blocs d'une étape (testable, sans React).
 *
 * - `activeKey` (déplié automatique) = 1er sous-bloc VISIBLE incomplet.
 * - `editingKey` (déplié manuel) = un sous-bloc replié ré-ouvert via ✎. Il
 *   s'ajoute aux dépliés ; il ne remplace pas l'actif naturel.
 *
 * Aucun effet, aucun setState dérivé : tout se déduit de `data`. Donc robuste
 * aux conditions qui apparaissent/disparaissent (changer un choix antérieur
 * recalcule simplement le 1er incomplet).
 */
export function computeStepFlow(
  descriptors: readonly SubBlockDescriptor[],
  data: QuestionnaireData,
  branch: ProjectType,
  editingKey: string | null,
): Record<string, SubBlockState> {
  const visibleSet = new Set(
    descriptors.filter((d) => d.isVisible(data, branch)).map((d) => d.key),
  );

  const firstIncomplete =
    descriptors.find(
      (d) => visibleSet.has(d.key) && !d.isComplete(data, branch),
    )?.key ?? null;

  const result: Record<string, SubBlockState> = {};
  for (const d of descriptors) {
    if (!visibleSet.has(d.key)) {
      result[d.key] = "hidden";
      continue;
    }
    if (d.key === firstIncomplete || d.key === editingKey) {
      result[d.key] = "expanded";
    } else if (d.isComplete(data, branch)) {
      result[d.key] = "summary";
    } else {
      result[d.key] = "placeholder";
    }
  }
  return result;
}
