"use client";

import { Chips } from "@/components/questionnaire/components/Chips";
import { Field } from "@/components/questionnaire/components/Field";
import { RadioRow } from "@/components/questionnaire/components/RadioRow";

import { REFERRAL_OPTIONS, URGENCY_OPTIONS } from "../options";
import { StepBlocks } from "../StepBlocks";
import type { StepProps, SubBlockDescriptor } from "../types";

const HELP = "mb-2 text-[12px] leading-snug text-[var(--color-devis-muted)]";

/** Étape 4 — Délai et précisions. */
export function DelaiStep({ data, updateData, branch }: StepProps) {
  const descriptors: SubBlockDescriptor[] = [
    {
      key: "urgency",
      title: "Dans quel délai ?",
      isVisible: () => true,
      isComplete: (d) => !!d.urgency,
      summary: (d) =>
        URGENCY_OPTIONS.find((o) => o.value === d.urgency)?.label,
      render: () => (
        <RadioRow
          ariaLabel="Urgence"
          options={URGENCY_OPTIONS}
          value={data.urgency}
          onChange={(v) => updateData({ urgency: v })}
          columns={5}
        />
      ),
    },
    {
      key: "notes",
      title: "Notes complémentaires",
      isVisible: (d) => !!d.urgency,
      isComplete: () => true, // optionnel
      summary: (d) => (d.notes ? d.notes : "—"),
      render: () => (
        <>
          <p className={HELP}>
            Facultatif — précisez un créneau, un contexte particulier…
          </p>
          <textarea
            value={data.notes ?? ""}
            onChange={(e) => updateData({ notes: e.target.value })}
            rows={3}
            maxLength={2000}
            placeholder="Un accès particulier, un créneau précis…"
            className="w-full rounded-[10px] border border-[var(--color-devis-line)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-devis-ink)] outline-none focus:border-[var(--branch-fg)] focus-visible:ring-2 focus-visible:ring-[var(--branch-fg)]/30"
          />
        </>
      ),
    },
    {
      key: "referral",
      title: "Comment nous avez-vous trouvés ?",
      isVisible: (d) => !!d.urgency,
      // Optionnel SAUF si "autre" choisi sans précision (parité avec timeDone).
      isComplete: (d) => d.referral_source !== "autre" || !!d.referral_other,
      summary: (d) => {
        if (!d.referral_source) return "—";
        const label = REFERRAL_OPTIONS.find(
          (o) => o.value === d.referral_source,
        )?.label;
        return d.referral_source === "autre" && d.referral_other
          ? `${label} — ${d.referral_other}`
          : label;
      },
      render: () => (
        <>
          <Chips
            ariaLabel="Source du contact"
            options={REFERRAL_OPTIONS}
            value={data.referral_source}
            onChange={(v) => updateData({ referral_source: v })}
          />
          {data.referral_source === "autre" ? (
            <div className="mt-2">
              <Field
                value={data.referral_other ?? ""}
                onChange={(e) => updateData({ referral_other: e.target.value })}
                placeholder="Précisez…"
              />
            </div>
          ) : null}
        </>
      ),
    },
  ];

  return <StepBlocks descriptors={descriptors} data={data} branch={branch} />;
}
