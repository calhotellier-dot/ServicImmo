"use client";

import { Chips } from "@/components/questionnaire/components/Chips";
import { Field } from "@/components/questionnaire/components/Field";
import { Label } from "@/components/questionnaire/components/Label";
import { RadioRow } from "@/components/questionnaire/components/RadioRow";
import {
  PERMIT_UI_OPTIONS,
  booleanToTriState,
  permitStoreToUI,
  permitUIToStore,
  triStateToBoolean,
  type PermitUIValue,
  type TriState,
} from "@/components/questionnaire/lib/field-mapping";
import type { ProjectType } from "@/lib/core/diagnostics/types";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

import {
  COOKTOP_OPTIONS,
  ECS_OPTIONS,
  GAS_INSTALLATION_OPTIONS,
  HEATING_MODE_OPTIONS,
  HEATING_OPTIONS,
  RENTAL_FURNISHED_OPTIONS,
  TRISTATE_COMPACT_OPTIONS,
  WORKS_TYPE_OPTIONS,
} from "../options";
import { StepBlocks } from "../StepBlocks";
import type { StepProps, SubBlockDescriptor } from "../types";

// ── Prédicats purs (repris à l'identique des flags d'origine) ───────────────
const hasGas = (d: QuestionnaireData) =>
  !!d.gas_installation &&
  d.gas_installation !== "none" &&
  d.gas_installation !== "unknown";
const branchSpecDone = (d: QuestionnaireData, branch: ProjectType) =>
  (branch !== "rental" || !!d.rental_furnished) &&
  (branch !== "works" || !!d.works_type);

const lbl = <T extends string>(
  opts: ReadonlyArray<{ value: T; label: string }>,
  v: T | null | undefined,
) => opts.find((o) => o.value === v)?.label;
const triLbl = (v: boolean | null | undefined) =>
  ({ yes: "Oui", no: "Non", dk: "?" })[booleanToTriState(v) ?? "dk"];

/** Étape 2 — Caractéristiques techniques. */
export function TechniqueStep({ data, updateData, branch }: StepProps) {
  const descriptors: SubBlockDescriptor[] = [
    {
      key: "bail",
      title: "Type de bail",
      isVisible: (_d, b) => b === "rental",
      isComplete: (d) => !!d.rental_furnished,
      summary: (d) => lbl(RENTAL_FURNISHED_OPTIONS, d.rental_furnished),
      render: () => (
        <>
          <Label help="Impacte la Loi Boutin (location vide uniquement).">
            Type de bail
          </Label>
          <Chips
            ariaLabel="Type de bail"
            options={RENTAL_FURNISHED_OPTIONS}
            value={data.rental_furnished}
            onChange={(v) => updateData({ rental_furnished: v })}
          />
        </>
      ),
    },
    {
      key: "worksType",
      title: "Type de travaux",
      isVisible: (_d, b) => b === "works",
      isComplete: (d) => !!d.works_type,
      summary: (d) => lbl(WORKS_TYPE_OPTIONS, d.works_type),
      render: () => (
        <Chips
          ariaLabel="Type de travaux"
          options={WORKS_TYPE_OPTIONS}
          value={data.works_type}
          onChange={(v) => updateData({ works_type: v })}
        />
      ),
    },
    {
      key: "permit",
      title: "Date du permis de construire",
      isVisible: (d, b) => branchSpecDone(d, b),
      isComplete: (d) => !!d.permit_date_range,
      summary: (d) =>
        PERMIT_UI_OPTIONS.find((o) => o.value === permitStoreToUI(d.permit_date_range))
          ?.label,
      render: () => (
        <>
          <Label help="Cette date détermine les risques plomb et amiante.">
            Date du permis de construire
          </Label>
          <RadioRow
            ariaLabel="Date du permis de construire"
            options={PERMIT_UI_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            value={permitStoreToUI(data.permit_date_range)}
            onChange={(v: PermitUIValue) =>
              updateData({ permit_date_range: permitUIToStore(v) })
            }
            columns={4}
          />
        </>
      ),
    },
    {
      key: "heatingMode",
      title: "Mode de chauffage",
      isVisible: (d) => !!d.permit_date_range,
      isComplete: (d) => !!d.heating_mode,
      summary: (d) => lbl(HEATING_MODE_OPTIONS, d.heating_mode),
      render: () => (
        <>
          <Label help="Individuel ou collectif — le collectif déclenche des diagnostics spécifiques en copropriété.">
            Mode de chauffage
          </Label>
          <Chips
            ariaLabel="Mode de chauffage"
            options={HEATING_MODE_OPTIONS}
            value={data.heating_mode}
            onChange={(v) => updateData({ heating_mode: v })}
          />
        </>
      ),
    },
    {
      key: "heating",
      title: "Type de chauffage",
      isVisible: (d) => !!d.heating_mode,
      isComplete: (d) => !!d.heating_type,
      summary: (d) => lbl(HEATING_OPTIONS, d.heating_type),
      render: () => (
        <Chips
          ariaLabel="Type de chauffage"
          options={HEATING_OPTIONS}
          value={data.heating_type}
          onChange={(v) => updateData({ heating_type: v })}
        />
      ),
    },
    {
      key: "ecs",
      title: "Eau chaude sanitaire",
      isVisible: (d) => !!d.heating_type,
      isComplete: (d) => !!d.ecs_type,
      summary: (d) => lbl(ECS_OPTIONS, d.ecs_type),
      render: () => (
        <Chips
          ariaLabel="Eau chaude sanitaire"
          options={ECS_OPTIONS}
          value={data.ecs_type}
          onChange={(v) => updateData({ ecs_type: v })}
        />
      ),
    },
    {
      key: "gas",
      title: "Installation gaz",
      isVisible: (d) => !!d.ecs_type,
      isComplete: (d) => !!d.gas_installation,
      summary: (d) => lbl(GAS_INSTALLATION_OPTIONS, d.gas_installation),
      render: () => (
        <Chips
          ariaLabel="Installation gaz"
          options={GAS_INSTALLATION_OPTIONS}
          value={data.gas_installation}
          onChange={(v) => updateData({ gas_installation: v })}
        />
      ),
    },
    {
      key: "cooktop",
      title: "Raccordement de la table de cuisson",
      isVisible: (d) => !!d.gas_installation && hasGas(d),
      isComplete: (d) => !!d.cooktop_connection,
      summary: (d) => lbl(COOKTOP_OPTIONS, d.cooktop_connection),
      render: () => (
        <RadioRow
          ariaLabel="Raccordement table de cuisson"
          options={COOKTOP_OPTIONS}
          value={data.cooktop_connection}
          onChange={(v) =>
            updateData({
              cooktop_connection: v as "souple" | "rigide" | "unknown",
            })
          }
        />
      ),
    },
    {
      key: "gasAge",
      title: "Installation gaz +15 ans ?",
      isVisible: (d) =>
        !!d.gas_installation && (!hasGas(d) || !!d.cooktop_connection),
      isComplete: (d) => d.gas_over_15_years !== undefined,
      summary: (d) => triLbl(d.gas_over_15_years),
      render: () => (
        <RadioRow
          ariaLabel="Installation gaz de plus de 15 ans"
          options={TRISTATE_COMPACT_OPTIONS}
          value={booleanToTriState(data.gas_over_15_years)}
          onChange={(v: TriState) =>
            updateData({ gas_over_15_years: triStateToBoolean(v) })
          }
        />
      ),
    },
    {
      key: "elecAge",
      title: "Installation élec +15 ans ?",
      isVisible: (d) => d.gas_over_15_years !== undefined,
      isComplete: (d) => d.electric_over_15_years !== undefined,
      summary: (d) => triLbl(d.electric_over_15_years),
      render: () => (
        <RadioRow
          ariaLabel="Installation électrique de plus de 15 ans"
          options={TRISTATE_COMPACT_OPTIONS}
          value={booleanToTriState(data.electric_over_15_years)}
          onChange={(v: TriState) =>
            updateData({ electric_over_15_years: triStateToBoolean(v) })
          }
        />
      ),
    },
    {
      key: "purchaseDate",
      title: "Date d'achat",
      isVisible: (d) => d.gas_over_15_years !== undefined,
      isComplete: () => true, // optionnel
      summary: (d) => d.purchase_date || "—",
      render: () => (
        <>
          <Label help="Si différente du permis de construire — optionnel.">
            Date d&apos;achat (optionnel)
          </Label>
          <Field
            type="date"
            value={data.purchase_date ?? ""}
            onChange={(e) => updateData({ purchase_date: e.target.value })}
          />
        </>
      ),
    },
  ];

  return <StepBlocks descriptors={descriptors} data={data} branch={branch} />;
}
