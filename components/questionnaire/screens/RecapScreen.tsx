"use client";

import { ArrowRightIcon, CheckIcon, LockIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  DiagnosticsResult,
  PriceEstimate,
  ProjectType,
  RequiredDiagnostic,
} from "@/lib/diagnostics/types";
import {
  useQuestionnaireStore,
  type QuestionnaireData,
} from "@/lib/stores/questionnaire";
import type { ApiResponse } from "@/lib/api/responses";
import type { CalculatePayload } from "@/lib/validation/schemas";

import { DiagnosticRow } from "../components/DiagnosticRow";
import { Field } from "../components/Field";
import { Label } from "../components/Label";
import { PriceHero } from "../components/PriceHero";
import { RadioRow } from "../components/RadioRow";
import { getBranchVars } from "../lib/branch-colors";

type CalculateResponse = DiagnosticsResult & { estimate: PriceEstimate };

const CIVILITY_OPTIONS = [
  { value: "mr", label: "M." },
  { value: "mme", label: "Mme" },
  { value: "other", label: "Autre" },
] as const;

const PAYMENT_METHOD_OPTIONS = [
  { value: "cb", label: "Carte bancaire" },
  { value: "chq", label: "Chèque" },
  { value: "esp", label: "Espèces" },
  { value: "virt", label: "Virement" },
] as const;

type RecapScreenProps = {
  branch: ProjectType;
  onSubmitted: () => void;
};

/**
 * Extrait la sous-partie du store utile pour l'appel /api/calculate.
 * Retourne null si les pré-requis (step1/2/4) ne sont pas suffisants — dans
 * ce cas le RecapScreen affiche un état d'erreur et invite à revenir en arrière.
 */
function toCalculatePayload(d: QuestionnaireData): CalculatePayload | null {
  if (
    !d.project_type ||
    !d.property_type ||
    !d.address ||
    !d.postal_code ||
    !d.city ||
    typeof d.surface !== "number" ||
    typeof d.rooms_count !== "number" ||
    d.is_coownership === undefined ||
    !d.permit_date_range ||
    !d.heating_type ||
    !d.gas_installation ||
    d.gas_over_15_years === undefined ||
    d.electric_over_15_years === undefined
  ) {
    return null;
  }
  return {
    project_type: d.project_type,
    property_type: d.property_type,
    address: d.address,
    postal_code: d.postal_code,
    city: d.city,
    surface: d.surface,
    rooms_count: d.rooms_count,
    is_coownership: d.is_coownership,
    permit_date_range: d.permit_date_range,
    heating_type: d.heating_type,
    gas_installation: d.gas_installation,
    gas_over_15_years: d.gas_over_15_years,
    electric_over_15_years: d.electric_over_15_years,
    rental_furnished: d.rental_furnished,
    works_type: d.works_type,
    urgency: d.urgency,
    // V2 — influe sur diagnostics et pricing
    heating_mode: d.heating_mode,
    ecs_type: d.ecs_type,
    syndic_contact: d.syndic_contact,
    cooktop_connection: d.cooktop_connection,
    dependencies: d.dependencies,
    dependencies_converted: d.dependencies_converted,
    existing_valid_diagnostics: d.existing_valid_diagnostics,
    existing_diagnostics_files: d.existing_diagnostics_files,
    tenants_in_place: d.tenants_in_place,
    residence_name: d.residence_name,
    floor: d.floor,
    is_top_floor: d.is_top_floor,
    door_number: d.door_number,
    is_duplex: d.is_duplex,
    purchase_date: d.purchase_date,
    cadastral_reference: d.cadastral_reference,
    commercial_activity: d.commercial_activity,
    heated_zones_count: d.heated_zones_count,
    configuration_notes: d.configuration_notes,
  };
}

export function RecapScreen({ branch, onSubmitted }: RecapScreenProps) {
  const data = useQuestionnaireStore((s) => s.data);
  const updateData = useQuestionnaireStore((s) => s.updateData);
  const quoteRequestId = useQuestionnaireStore((s) => s.quoteRequestId);
  const lastCalculation = useQuestionnaireStore((s) => s.lastCalculation);
  const setLastCalculation = useQuestionnaireStore((s) => s.setLastCalculation);
  const markSubmitted = useQuestionnaireStore((s) => s.markSubmitted);

  // Pré-calcul du payload : si incomplet, on affiche l'erreur sans fetch.
  const payload = useMemo(() => toCalculatePayload(data), [data]);

  // État initial calculé de façon synchrone (pas de setState en useEffect).
  const initialCalc = (() => {
    if (lastCalculation) return { state: "ready" as const, error: null as string | null };
    if (!payload) {
      return {
        state: "error" as const,
        error:
          "Des informations sont manquantes. Reprenez le questionnaire pour compléter vos réponses.",
      };
    }
    return { state: "loading" as const, error: null as string | null };
  })();

  const [calcState, setCalcState] = useState(initialCalc.state);
  const [calcError, setCalcError] = useState<string | null>(initialCalc.error);

  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "done" | "error">(
    "idle"
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ─── Calcul diagnostics + prix au montage ────────────────────────────────
  useEffect(() => {
    if (calcState !== "loading" || !payload) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = (await res.json()) as ApiResponse<CalculateResponse>;
        if (cancelled) return;

        if (!json.ok) {
          setCalcState("error");
          setCalcError(json.error ?? "Impossible de calculer votre estimation.");
          return;
        }

        setLastCalculation({
          required: json.data.required,
          toClarify: json.data.toClarify,
          estimate: {
            min: json.data.estimate.min,
            max: json.data.estimate.max,
            appliedModulators: json.data.estimate.appliedModulators,
          },
        });
        setCalcState("ready");
      } catch {
        if (cancelled) return;
        setCalcState("error");
        setCalcError("Impossible de joindre le serveur. Vérifiez votre connexion.");
      }
    })();

    return () => {
      cancelled = true;
    };
    // On ne relance pas si `payload` change pendant l'affichage : le recap
    // est figé à l'arrivée. Un retour en arrière remettra `lastCalculation`
    // à null via goToScreen → rerender.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Submit final ────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitState === "submitting") return;

    // Validation légère côté client — Zod fera la validation stricte côté API.
    if (
      !data.civility ||
      !data.first_name ||
      !data.last_name ||
      !data.consent_rgpd
    ) {
      setSubmitError("Complétez votre civilité, prénom, nom et le consentement RGPD.");
      return;
    }
    // Téléphone désormais obligatoire (V2 — automatisation du rappel ops).
    const phoneDigits = (data.phone ?? "").replace(/\D/g, "");
    if (phoneDigits.length < 8) {
      setSubmitError("Un numéro de téléphone est requis pour la prise de rendez-vous.");
      return;
    }

    // Si Supabase n'est pas configuré, quoteRequestId sera null — on passe
    // quand même en thanks (les données restent dans le store local).
    if (!quoteRequestId) {
      markSubmitted();
      onSubmitted();
      return;
    }

    setSubmitState("submitting");
    setSubmitError(null);

    try {
      const res = await fetch(`/api/quote-request/${quoteRequestId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as ApiResponse<unknown>;
      if (!json.ok) {
        // 503 Supabase offline = on bascule quand même en thanks (mode local).
        if (res.status === 503) {
          markSubmitted();
          onSubmitted();
          return;
        }
        setSubmitState("error");
        setSubmitError(json.error ?? "Impossible de finaliser la demande.");
        return;
      }
      markSubmitted();
      setSubmitState("done");
      onSubmitted();
    } catch {
      setSubmitState("error");
      setSubmitError("Impossible de joindre le serveur.");
    }
  }

  const required = (lastCalculation?.required ?? []) as RequiredDiagnostic[];
  const toClarify = (lastCalculation?.toClarify ?? []) as RequiredDiagnostic[];
  const estimate = lastCalculation?.estimate;

  return (
    <div
      style={getBranchVars(branch)}
      className="min-h-full bg-[var(--color-devis-cream)] px-4 py-6 sm:px-10 sm:py-11"
    >
      <div className="mx-auto max-w-6xl">
        <div className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-devis-muted)]">
          VOTRE RÉCAPITULATIF
        </div>
        <h1 className="mt-2.5 font-serif text-[30px] leading-[1.08] font-normal tracking-[-0.025em] text-[var(--color-devis-ink)] sm:text-[44px]">
          Voici <em className="font-medium italic">ce qu&apos;il vous faut</em>.
        </h1>
        <p className="mt-3.5 mb-7 max-w-xl text-[15px] leading-relaxed text-[var(--color-devis-muted)] sm:text-[16px]">
          Nos experts ont identifié les diagnostics obligatoires pour votre bien. Validez vos
          coordonnées et nous vous rappelons sous 2 h.
        </p>

        {calcState === "loading" ? (
          <div className="rounded-[18px] border border-[var(--color-devis-line)] bg-white p-6 text-center text-[14px] text-[var(--color-devis-muted)]">
            Calcul de vos diagnostics en cours…
          </div>
        ) : null}

        {calcState === "error" ? (
          <div
            role="alert"
            className="rounded-[18px] border border-amber-200 bg-amber-50 p-5 text-[14px] text-amber-900"
          >
            {calcError}
          </div>
        ) : null}

        {calcState === "ready" && estimate ? (
          <>
            <div className="mb-4">
              <PriceHero
                min={estimate.min}
                max={estimate.max}
                appliedModulators={estimate.appliedModulators}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
              {/* Diagnostics list */}
              <section
                aria-labelledby="diagnostics-title"
                className="rounded-[18px] border border-[var(--color-devis-line)] bg-white p-5 sm:p-6"
              >
                <div className="mb-3.5 flex items-baseline justify-between">
                  <h2
                    id="diagnostics-title"
                    className="font-serif text-[19px] font-medium text-[var(--color-devis-ink)]"
                  >
                    Vos diagnostics obligatoires
                  </h2>
                  <span className="font-mono text-[12px] text-[var(--color-devis-muted)]">
                    {required.length} identifiés
                  </span>
                </div>
                <div className="flex flex-col">
                  {required.map((d, i) => (
                    <DiagnosticRow
                      key={d.id}
                      index={i}
                      name={d.name}
                      reason={d.reason}
                      isFirst={i === 0}
                    />
                  ))}
                </div>

                {toClarify.length > 0 ? (
                  <div className="mt-5 rounded-[12px] border border-dashed border-[var(--color-devis-line)] bg-[var(--color-devis-cream)] p-4">
                    <div className="mb-1.5 font-mono text-[11px] tracking-[0.1em] text-[var(--color-devis-muted)]">
                      À VALIDER SUR PLACE
                    </div>
                    <div className="text-[13px] leading-relaxed text-[var(--color-devis-ink)]">
                      Vous avez répondu «&nbsp;je ne sais pas&nbsp;» à certaines questions : l&apos;expert
                      confirme ces diagnostics lors de la visite.
                      <ul className="mt-2 ml-4 list-disc text-[var(--color-devis-muted)]">
                        {toClarify.map((d) => (
                          <li key={d.id}>{d.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </section>

              {/* Contact form */}
              <form
                onSubmit={handleSubmit}
                aria-labelledby="contact-title"
                className="rounded-[18px] border border-[var(--color-devis-line)] bg-white p-5 sm:p-6"
              >
                <h2
                  id="contact-title"
                  className="mb-1 font-serif text-[19px] font-medium text-[var(--color-devis-ink)]"
                >
                  Vos coordonnées
                </h2>
                <p className="mb-4 text-[13px] text-[var(--color-devis-muted)]">
                  On vous rappelle sous 2 h ouvrées.
                </p>
                <div className="flex flex-col gap-3">
                  <div>
                    <Label>Civilité</Label>
                    <RadioRow
                      ariaLabel="Civilité"
                      options={CIVILITY_OPTIONS}
                      value={data.civility}
                      onChange={(v) => updateData({ civility: v })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label>Prénom</Label>
                      <Field
                        autoComplete="given-name"
                        value={data.first_name ?? ""}
                        onChange={(e) => updateData({ first_name: e.target.value })}
                        aria-label="Prénom"
                      />
                    </div>
                    <div>
                      <Label>Nom</Label>
                      <Field
                        autoComplete="family-name"
                        value={data.last_name ?? ""}
                        onChange={(e) => updateData({ last_name: e.target.value })}
                        aria-label="Nom"
                      />
                    </div>
                  </div>
                  <div>
                    <Label help="Déjà renseigné à l'étape précédente — modifiable si besoin.">
                      Téléphone
                    </Label>
                    <Field
                      type="tel"
                      autoComplete="tel"
                      value={data.phone ?? ""}
                      onChange={(e) => updateData({ phone: e.target.value })}
                      placeholder="06 12 34 56 78"
                      aria-label="Téléphone"
                    />
                  </div>
                  <div>
                    <Label help="Pour information — non bloquant.">
                      Mode de règlement préféré (optionnel)
                    </Label>
                    <RadioRow
                      ariaLabel="Mode de règlement"
                      options={PAYMENT_METHOD_OPTIONS}
                      value={data.preferred_payment_method}
                      onChange={(v) =>
                        updateData({ preferred_payment_method: v as "cb" | "chq" | "esp" | "virt" })
                      }
                      columns={4}
                    />
                  </div>
                  <label className="mt-1 flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-[var(--color-devis-muted)]">
                    <input
                      type="checkbox"
                      checked={data.consent_rgpd ?? false}
                      onChange={(e) => updateData({ consent_rgpd: e.target.checked })}
                      className="sr-only"
                      aria-label="Consentement RGPD"
                    />
                    <span
                      aria-hidden
                      className={[
                        "mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded border-[1.5px]",
                        data.consent_rgpd
                          ? "border-[var(--branch-fg)] bg-[var(--branch-fg)] text-white"
                          : "border-[var(--color-devis-line)] bg-white",
                      ].join(" ")}
                    >
                      {data.consent_rgpd ? <CheckIcon className="h-2.5 w-2.5" /> : null}
                    </span>
                    <span>
                      J&apos;accepte que mes données soient utilisées pour ma demande de devis.
                      Pas de spam, vos données restent chez nous.
                    </span>
                  </label>
                  <button
                    type="submit"
                    disabled={submitState === "submitting"}
                    className={[
                      "mt-1.5 inline-flex items-center justify-center gap-2 rounded-[12px] px-4 py-4 text-[15px] font-medium text-white transition-opacity",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--branch-fg)]/50",
                      submitState === "submitting"
                        ? "cursor-not-allowed bg-[var(--branch-fg)]/60"
                        : "bg-[var(--branch-fg)] hover:opacity-90",
                    ].join(" ")}
                  >
                    {submitState === "submitting" ? "Envoi…" : "Envoyer ma demande"}
                    {submitState !== "submitting" ? (
                      <ArrowRightIcon className="h-4 w-4" aria-hidden />
                    ) : null}
                  </button>
                  {submitError ? (
                    <p role="alert" className="text-center text-[12px] text-amber-700">
                      {submitError}
                    </p>
                  ) : null}
                  <div className="text-center font-mono text-[11px] tracking-[0.08em] text-[var(--color-devis-muted)]">
                    <LockIcon className="mr-1.5 inline h-2.5 w-2.5 align-middle" aria-hidden />
                    données chiffrées · rgpd
                  </div>
                </div>
              </form>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
