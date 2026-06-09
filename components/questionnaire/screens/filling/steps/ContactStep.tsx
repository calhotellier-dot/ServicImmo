"use client";

import { Field } from "@/components/questionnaire/components/Field";
import { RadioRow } from "@/components/questionnaire/components/RadioRow";
import {
  booleanToTriState,
  triStateToBoolean,
  type TriState,
} from "@/components/questionnaire/lib/field-mapping";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

import { TRISTATE_OPTIONS } from "../options";
import { StepBlocks } from "../StepBlocks";
import type { StepProps, SubBlockDescriptor } from "../types";

const HELP = "mb-2 text-[12px] leading-snug text-[var(--color-devis-muted)]";
const TEXTAREA =
  "w-full rounded-[10px] border border-[var(--color-devis-line)] bg-white px-3.5 py-3 text-[14px] text-[var(--color-devis-ink)] outline-none focus:border-[var(--branch-fg)]";

const phoneComplete = (d: QuestionnaireData) =>
  (d.phone ?? "").replace(/\D/g, "").length >= 8;
const triLbl = (v: boolean | null | undefined) =>
  TRISTATE_OPTIONS.find((o) => o.value === booleanToTriState(v))?.label;

/** Étape 5 — Contact & accès. */
export function ContactStep({ data, updateData, branch }: StepProps) {
  const descriptors: SubBlockDescriptor[] = [
    {
      key: "phone",
      title: "Téléphone",
      isVisible: () => true,
      isComplete: (d) => phoneComplete(d),
      summary: (d) => d.phone,
      render: () => (
        <>
          <p className={HELP}>
            Numéro joignable pour caler le rendez-vous (obligatoire).
          </p>
          <Field
            type="tel"
            autoComplete="tel"
            value={data.phone ?? ""}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="06 12 34 56 78"
            aria-label="Téléphone"
          />
        </>
      ),
    },
    {
      key: "tenants",
      title: "Locataire(s) en place ?",
      isVisible: (d) => phoneComplete(d),
      isComplete: () => true, // optionnel
      summary: (d) => triLbl(d.tenants_in_place) ?? "—",
      render: () => (
        <RadioRow
          ariaLabel="Locataire en place"
          options={TRISTATE_OPTIONS}
          value={booleanToTriState(data.tenants_in_place)}
          onChange={(v: TriState) =>
            updateData({ tenants_in_place: triStateToBoolean(v) })
          }
        />
      ),
    },
    {
      key: "access",
      title: "Accès au bien",
      isVisible: (d) => phoneComplete(d),
      isComplete: () => true, // optionnel
      summary: (d) => (d.access_notes ? d.access_notes : "—"),
      render: () => (
        <>
          <p className={HELP}>
            Horaires d&apos;accès, contact gardien, digicode, présence animaux…
          </p>
          <textarea
            value={data.access_notes ?? ""}
            onChange={(e) => updateData({ access_notes: e.target.value })}
            rows={2}
            maxLength={1000}
            placeholder="Accès libre, clés chez le gardien au 2e étage…"
            className={TEXTAREA}
          />
        </>
      ),
    },
    {
      key: "syndic",
      title: "Coordonnées du syndic",
      isVisible: (d) => phoneComplete(d) && d.heating_mode === "collective",
      isComplete: () => true, // optionnel
      summary: (d) => (d.syndic_contact ? d.syndic_contact : "—"),
      render: () => (
        <>
          <p className={HELP}>
            Nom et contact du syndic (nécessaire pour DPE collectif).
          </p>
          <textarea
            value={data.syndic_contact ?? ""}
            onChange={(e) => updateData({ syndic_contact: e.target.value })}
            rows={2}
            maxLength={500}
            placeholder="Cabinet Dupont, 02 47 00 00 00"
            className={TEXTAREA}
          />
        </>
      ),
    },
  ];

  return <StepBlocks descriptors={descriptors} data={data} branch={branch} />;
}
