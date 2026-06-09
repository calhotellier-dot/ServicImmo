"use client";

import { useState } from "react";

import type { ProjectType } from "@/lib/core/diagnostics/types";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

import { SubBlock } from "../../components/SubBlock";
import { computeStepFlow } from "./computeStepFlow";
import type { SubBlockDescriptor } from "./types";

/**
 * Rendu d'une étape en sous-blocs repliables (révélation progressive).
 * Reçoit les descripteurs construits par le module d'étape ; gère l'état
 * `editingKey` (ré-ouverture manuelle d'un bloc rempli, toggle, lint-safe :
 * pas de setState dans un effet) et délègue le séquencement à `computeStepFlow`.
 */
export function StepBlocks({
  descriptors,
  data,
  branch,
}: {
  descriptors: readonly SubBlockDescriptor[];
  data: QuestionnaireData;
  branch: ProjectType;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const states = computeStepFlow(descriptors, data, branch, editingKey);
  const toggle = (key: string) =>
    setEditingKey((k) => (k === key ? null : key));

  return (
    <div className="flex flex-col gap-2.5 pt-3">
      {descriptors.map((d) => {
        const state = states[d.key] ?? "hidden";
        if (state === "hidden") return null;
        return (
          <SubBlock
            key={d.key}
            title={d.title}
            summary={d.summary(data)}
            state={state}
            onToggle={() => toggle(d.key)}
          >
            {state === "expanded" ? d.render() : null}
          </SubBlock>
        );
      })}
    </div>
  );
}
