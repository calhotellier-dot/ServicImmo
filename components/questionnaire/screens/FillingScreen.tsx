"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { ProjectType } from "@/lib/core/diagnostics/types";

import { useQuestionnaireStore } from "@/lib/stores/questionnaire";

import { Accordion } from "../components/Accordion";
import { getBranchVars } from "../lib/branch-colors";
import { BRANCHES } from "../lib/branches";
import {
  computeNextAccordion,
  type AccordionKey as StepAccordionKey,
} from "./filling/computeNextAccordion";
import { PROPERTY_TYPE_OPTIONS, URGENCY_OPTIONS } from "./filling/options";
import { ContactStep } from "./filling/steps/ContactStep";
import { DelaiStep } from "./filling/steps/DelaiStep";
import { DiagnosticsStep } from "./filling/steps/DiagnosticsStep";
import { LeBienStep } from "./filling/steps/LeBienStep";
import { TechniqueStep } from "./filling/steps/TechniqueStep";

// ---------------------------------------------------------------------------
// Screen — orchestrateur des 5 accordéons d'étape. La logique de complétion
// d'étape (propDone/techDone/…) pilote l'ouverture/résumé des accordéons ;
// l'affichage interne (sous-blocs repliables) est délégué aux modules d'étape
// dans `./filling/steps/`.
// ---------------------------------------------------------------------------

type FillingScreenProps = {
  branch: ProjectType;
  onBack: () => void;
  onContinue: () => Promise<void> | void;
  submitting: boolean;
  error: string | null;
};

type AccordionKey = StepAccordionKey | null;

export function FillingScreen({
  branch,
  onBack,
  onContinue,
  submitting,
  error,
}: FillingScreenProps) {
  const data = useQuestionnaireStore((s) => s.data);
  const updateData = useQuestionnaireStore((s) => s.updateData);
  const config = BRANCHES[branch];
  const BranchIcon = config.icon;

  const [open, setOpen] = useState<AccordionKey>("prop");
  const toggle = (k: Exclude<AccordionKey, null>) => setOpen(open === k ? null : k);

  // ─── Completion flags par accordéon (inchangés) ──────────────────────────
  const isApartment = data.property_type === "apartment";
  const isCommercial = data.property_type === "commercial";

  const propDone =
    !!data.property_type &&
    !!data.address &&
    data.address.length >= 3 &&
    !!data.postal_code &&
    /^\d{5}$/.test(data.postal_code) &&
    !!data.city &&
    typeof data.surface === "number" &&
    data.surface > 0 &&
    typeof data.rooms_count === "number" &&
    data.rooms_count >= 1 &&
    data.is_coownership !== undefined &&
    (!isApartment || typeof data.floor === "number") &&
    (!isCommercial || !!data.commercial_activity);

  const hasGas =
    !!data.gas_installation &&
    data.gas_installation !== "none" &&
    data.gas_installation !== "unknown";

  const techDone =
    !!data.permit_date_range &&
    !!data.heating_type &&
    !!data.gas_installation &&
    data.gas_over_15_years !== undefined &&
    data.electric_over_15_years !== undefined &&
    (branch !== "rental" || !!data.rental_furnished) &&
    (branch !== "works" || !!data.works_type) &&
    (!hasGas || !!data.cooktop_connection);

  // "Diagnostics déjà valides" est optionnel → toujours done.
  const existingDone = true;
  const existingDiagsCount = (data.existing_valid_diagnostics ?? []).length;

  const timeDone =
    !!data.urgency &&
    (data.referral_source !== "autre" || !!data.referral_other);

  const phoneDigits = (data.phone ?? "").replace(/\D/g, "");
  const contactDone = phoneDigits.length >= 8;

  const canContinue = propDone && techDone && existingDone && timeDone && contactDone;

  const propSummary = useMemo(() => {
    if (!propDone) return undefined;
    const propertyLabel =
      PROPERTY_TYPE_OPTIONS.find((o) => o.value === data.property_type)?.label ?? "";
    return `${propertyLabel} · ${data.city} ${data.postal_code} · ${data.surface} m² · ${data.rooms_count} pièces`;
  }, [propDone, data.property_type, data.city, data.postal_code, data.surface, data.rooms_count]);

  const timeSummary = useMemo(() => {
    if (!timeDone) return undefined;
    return URGENCY_OPTIONS.find((o) => o.value === data.urgency)?.label;
  }, [timeDone, data.urgency]);

  const contactSummary = contactDone ? data.phone : undefined;

  // Auto-open du suivant — délégué au moteur pur `computeNextAccordion`.
  // L'étape optionnelle « Diagnostics déjà valides » (existing) est sautée dans
  // la chaîne auto : tech complétée → ouvre directement « Délai ». Elle reste
  // ouvrable manuellement.
  const prevRef = useRef({ prop: propDone, tech: techDone, time: timeDone });
  useEffect(() => {
    const next = { prop: propDone, tech: techDone, time: timeDone };
    const target = computeNextAccordion(prevRef.current, next, open);
    if (target) setOpen(target);
    prevRef.current = next;
  }, [propDone, techDone, timeDone, open]);

  const completedCount = [propDone, techDone, existingDone, timeDone, contactDone].filter(
    Boolean
  ).length;

  const stepProps = { data, updateData, branch };

  return (
    <div
      style={getBranchVars(branch)}
      className="min-h-full bg-[var(--color-devis-cream)] px-4 py-5 sm:px-9 sm:py-8"
    >
      <div className="mx-auto max-w-3xl">
        {/* Top bar */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-devis-line)] bg-white px-3 py-1.5 text-[12px] text-[var(--color-devis-ink)] hover:border-[var(--branch-fg)]/60"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden /> Retour
          </button>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--branch-bg)] px-3 py-1.5 text-[12px] font-medium text-[var(--branch-dark)]">
            <BranchIcon className="h-3.5 w-3.5" aria-hidden /> {config.short}
          </div>
          <div className="ml-auto text-[12px] text-[var(--color-devis-muted)]">
            Sauvegardé <span className="text-[var(--branch-fg)]">●</span>
          </div>
        </div>

        <h1 className="mb-1.5 font-serif text-[26px] font-normal tracking-[-0.02em] text-[var(--color-devis-ink)] sm:text-[32px]">
          Parlez-nous de <em className="font-medium italic">votre bien</em>
        </h1>
        <p className="mb-5 text-[14px] text-[var(--color-devis-muted)]">
          5 blocs rapides. On calcule le reste.
        </p>

        <div className="flex flex-col gap-2.5">
          {/* ─────────── Accordéon 1 : Le bien ─────────── */}
          <div className="devis-reveal">
            <Accordion
              step={1}
              open={open === "prop"}
              done={propDone && open !== "prop"}
              onToggle={() => toggle("prop")}
              title="Le bien"
              summary={propSummary}
            >
              <LeBienStep {...stepProps} />
            </Accordion>
          </div>

          {/* ─────────── Accordéon 2 : Caractéristiques techniques ─────────── */}
          {propDone ? (
            <div className="devis-reveal">
              <Accordion
                step={2}
                open={open === "tech"}
                done={techDone && open !== "tech"}
                onToggle={() => toggle("tech")}
                title="Caractéristiques techniques"
              >
                <TechniqueStep {...stepProps} />
              </Accordion>
            </div>
          ) : null}

          {/* ─────────── Accordéon 3 : Diagnostics déjà valides ─────────── */}
          {techDone ? (
            <div className="devis-reveal">
              <Accordion
                step={3}
                open={open === "existing"}
                done={existingDone && open !== "existing" && existingDiagsCount > 0}
                onToggle={() => toggle("existing")}
                title="Diagnostics déjà valides ?"
                summary={existingDiagsCount > 0 ? `${existingDiagsCount} déclaré(s)` : undefined}
              >
                <DiagnosticsStep {...stepProps} />
              </Accordion>
            </div>
          ) : null}

          {/* ─────────── Accordéon 4 : Délai et précisions ─────────── */}
          {techDone ? (
            <div className="devis-reveal">
              <Accordion
                step={4}
                open={open === "time"}
                done={timeDone && open !== "time"}
                onToggle={() => toggle("time")}
                title="Délai et précisions"
                summary={timeSummary}
              >
                <DelaiStep {...stepProps} />
              </Accordion>
            </div>
          ) : null}

          {/* ─────────── Accordéon 5 : Contact & accès ─────────── */}
          {timeDone ? (
            <div className="devis-reveal">
              <Accordion
                step={5}
                open={open === "contact"}
                done={contactDone && open !== "contact"}
                onToggle={() => toggle("contact")}
                title="Contact & accès"
                summary={contactSummary}
              >
                <ContactStep {...stepProps} />
              </Accordion>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          disabled={!canContinue || submitting}
          onClick={() => {
            void onContinue();
          }}
          className={[
            "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[12px] px-5 py-4 text-[16px] font-medium text-white transition-opacity",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--branch-fg)]/50",
            !canContinue || submitting
              ? "cursor-not-allowed bg-[var(--branch-fg)]/50"
              : "bg-[var(--branch-fg)] hover:opacity-90",
          ].join(" ")}
        >
          {submitting ? "Envoi en cours…" : "Continuer"}
          {!submitting ? <ArrowRightIcon className="h-4.5 w-4.5" aria-hidden /> : null}
        </button>

        {!canContinue && !error ? (
          <p className="mt-2 text-center font-mono text-[12px] text-[var(--color-devis-muted)]">
            {completedCount} / 5 blocs complétés
          </p>
        ) : null}

        {error ? (
          <p className="mt-3 text-center text-[13px] text-amber-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
