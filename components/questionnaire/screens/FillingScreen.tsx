"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { ProjectType } from "@/lib/diagnostics/types";

import { useQuestionnaireStore } from "@/lib/stores/questionnaire";

import { Accordion } from "../components/Accordion";
import { AddressAutocomplete } from "../components/AddressAutocomplete";
import { Chips } from "../components/Chips";
import { Field } from "../components/Field";
import { Label } from "../components/Label";
import { RadioRow } from "../components/RadioRow";
import { getBranchVars } from "../lib/branch-colors";
import { BRANCHES } from "../lib/branches";
import {
  PERMIT_UI_OPTIONS,
  booleanToTriState,
  permitStoreToUI,
  permitUIToStore,
  triStateToBoolean,
  type PermitUIValue,
  type TriState,
} from "../lib/field-mapping";

// ---------------------------------------------------------------------------
// Options UI (libellés FR)
// ---------------------------------------------------------------------------

const PROPERTY_TYPE_OPTIONS = [
  { value: "house", label: "Maison" },
  { value: "apartment", label: "Appartement" },
  { value: "building", label: "Immeuble" },
  { value: "commercial", label: "Local commercial" },
  { value: "common_areas", label: "Parties communes" },
  { value: "land", label: "Terrain" },
  { value: "annex", label: "Annexe" },
  { value: "other", label: "Autre" },
] as const;

const HEATING_OPTIONS = [
  { value: "gas", label: "Gaz" },
  { value: "electric", label: "Électrique" },
  { value: "heat_pump", label: "Pompe à chaleur" },
  { value: "wood", label: "Bois" },
  { value: "fuel", label: "Fioul" },
  { value: "mixed", label: "Mixte" },
  { value: "unknown", label: "Je ne sais pas" },
] as const;

const GAS_INSTALLATION_OPTIONS = [
  { value: "none", label: "Pas de gaz" },
  { value: "city_gas", label: "Gaz de ville" },
  { value: "tank", label: "Citerne" },
  { value: "bottles", label: "Bouteilles" },
  { value: "meter_no_contract", label: "Compteur sans contrat" },
  { value: "unknown", label: "Je ne sais pas" },
] as const;

const RENTAL_FURNISHED_OPTIONS = [
  { value: "vide", label: "Vide" },
  { value: "meuble", label: "Meublé" },
  { value: "saisonnier", label: "Saisonnier" },
  { value: "unknown", label: "Je ne sais pas" },
] as const;

const WORKS_TYPE_OPTIONS = [
  { value: "renovation", label: "Rénovation" },
  { value: "demolition", label: "Démolition" },
  { value: "voirie", label: "Voirie / enrobés" },
  { value: "other", label: "Autre" },
  { value: "unknown", label: "Je ne sais pas" },
] as const;

const URGENCY_OPTIONS = [
  { value: "asap", label: "Dès que possible" },
  { value: "week", label: "Dans la semaine" },
  { value: "two_weeks", label: "Sous 2 semaines" },
  { value: "month", label: "Dans le mois" },
  { value: "flexible", label: "Je suis flexible" },
] as const;

const TRISTATE_OPTIONS = [
  { value: "yes", label: "Oui" },
  { value: "no", label: "Non" },
  { value: "dk", label: "Je ne sais pas" },
] as const;

const TRISTATE_COMPACT_OPTIONS = [
  { value: "yes", label: "Oui" },
  { value: "no", label: "Non" },
  { value: "dk", label: "?" },
] as const;

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

type FillingScreenProps = {
  branch: ProjectType;
  onBack: () => void;
  onContinue: () => Promise<void> | void;
  /** Pendant l'appel /api/quote-request. */
  submitting: boolean;
  /** Message d'erreur à afficher sous le CTA, si présent. */
  error: string | null;
};

type AccordionKey = "prop" | "tech" | "time" | "email" | null;

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

  // ─── Progressive disclosure ─────────────────────────────────────────
  // On ne révèle l'accordéon N+1 qu'une fois N complété. Quand l'accordéon
  // courant bascule à "done", on ouvre automatiquement le suivant pour
  // guider l'utilisateur sans qu'il ait à deviner l'ordre.

  // ─── Completion flags par accordéon (pour afficher la pastille "done") ───
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
    data.is_coownership !== undefined;

  const techDone =
    !!data.permit_date_range &&
    !!data.heating_type &&
    !!data.gas_installation &&
    data.gas_over_15_years !== undefined &&
    data.electric_over_15_years !== undefined &&
    (branch !== "rental" || !!data.rental_furnished) &&
    (branch !== "works" || !!data.works_type);

  const timeDone = !!data.urgency;
  const emailDone = !!data.email && /.+@.+\..+/.test(data.email);

  const canContinue = propDone && techDone && timeDone && emailDone;

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

  const emailSummary = emailDone ? data.email : undefined;

  // Auto-open du suivant : quand un accordéon bascule done → true, on ouvre
  // automatiquement le suivant si l'utilisateur est encore sur le courant.
  const prevRef = useRef({ propDone, techDone, timeDone });
  useEffect(() => {
    const p = prevRef.current;
    if (propDone && !p.propDone && open === "prop") setOpen("tech");
    else if (techDone && !p.techDone && open === "tech") setOpen("time");
    else if (timeDone && !p.timeDone && open === "time") setOpen("email");
    prevRef.current = { propDone, techDone, timeDone };
  }, [propDone, techDone, timeDone, open]);

  const completedCount = [propDone, techDone, timeDone, emailDone].filter(Boolean).length;

  // ─── Progressive disclosure au niveau du champ ─────────────────────────
  // Chaque sous-bloc se révèle quand le précédent est renseigné. Les flags
  // suivent l'ordre UX (plus naturel que l'ordre de déclaration des champs).
  const hasPropType = !!data.property_type;
  const hasAddress =
    !!data.address &&
    data.address.length >= 3 &&
    !!data.postal_code &&
    /^\d{5}$/.test(data.postal_code) &&
    !!data.city;
  const hasSurfaceRooms =
    typeof data.surface === "number" &&
    data.surface > 0 &&
    typeof data.rooms_count === "number" &&
    data.rooms_count >= 1;

  // Pour l'accordéon technique, l'ordre dépend du type de projet.
  const needsRentalFurnished = branch === "rental";
  const needsWorksType = branch === "works";
  const branchSpecDone =
    (!needsRentalFurnished || !!data.rental_furnished) &&
    (!needsWorksType || !!data.works_type);
  const hasPermit = !!data.permit_date_range;
  const hasHeating = !!data.heating_type;
  const hasGasInstall = !!data.gas_installation;
  const hasGasAge = data.gas_over_15_years !== undefined;

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
          4 blocs rapides. On calcule le reste.
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
            <div className="flex flex-col gap-4 pt-3">
              <div className="devis-reveal">
                <Label>Type de bien</Label>
                <Chips
                  ariaLabel="Type de bien"
                  options={PROPERTY_TYPE_OPTIONS}
                  value={data.property_type}
                  onChange={(value) => updateData({ property_type: value })}
                />
              </div>

              {hasPropType ? (
                <div className="devis-reveal">
                  <Label help="Commencez à taper, nous remplissons le code postal et la ville automatiquement.">
                    Adresse du bien
                  </Label>
                  <AddressAutocomplete
                    address={data.address ?? ""}
                    postalCode={data.postal_code ?? ""}
                    city={data.city ?? ""}
                    onSelect={({ address, postalCode, city }) =>
                      updateData({ address, postal_code: postalCode, city })
                    }
                    onManualChange={(v) =>
                      updateData({ address: v, postal_code: "", city: "" })
                    }
                  />
                </div>
              ) : null}

              {hasAddress ? (
                <div className="devis-reveal grid grid-cols-2 gap-4">
                  <div>
                    <Label>Surface</Label>
                    <Field
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={10000}
                      suffix="m²"
                      value={data.surface ?? ""}
                      onChange={(e) => {
                        const v = e.target.value === "" ? undefined : Number(e.target.value);
                        updateData({ surface: v });
                      }}
                      placeholder="92"
                      aria-label="Surface en m²"
                    />
                  </div>
                  <div>
                    <Label>Nombre de pièces</Label>
                    <Field
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={20}
                      value={data.rooms_count ?? ""}
                      onChange={(e) => {
                        const v = e.target.value === "" ? undefined : Number(e.target.value);
                        updateData({ rooms_count: v });
                      }}
                      placeholder="4"
                      aria-label="Nombre de pièces"
                    />
                  </div>
                </div>
              ) : null}

              {hasSurfaceRooms ? (
                <div className="devis-reveal">
                  <Label>Est-ce une copropriété ?</Label>
                  <RadioRow
                    ariaLabel="Copropriété"
                    options={TRISTATE_OPTIONS}
                    value={booleanToTriState(data.is_coownership)}
                    onChange={(v: TriState) =>
                      updateData({ is_coownership: triStateToBoolean(v) })
                    }
                  />
                </div>
              ) : null}
            </div>
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
            <div className="flex flex-col gap-4 pt-3">
              {needsRentalFurnished ? (
                <div className="devis-reveal">
                  <Label help="Impacte la Loi Boutin (location vide uniquement).">
                    Type de bail
                  </Label>
                  <Chips
                    ariaLabel="Type de bail"
                    options={RENTAL_FURNISHED_OPTIONS}
                    value={data.rental_furnished}
                    onChange={(v) => updateData({ rental_furnished: v })}
                  />
                </div>
              ) : null}

              {needsWorksType ? (
                <div className="devis-reveal">
                  <Label>Type de travaux</Label>
                  <Chips
                    ariaLabel="Type de travaux"
                    options={WORKS_TYPE_OPTIONS}
                    value={data.works_type}
                    onChange={(v) => updateData({ works_type: v })}
                  />
                </div>
              ) : null}

              {branchSpecDone ? (
                <div className="devis-reveal">
                  <Label help="Cette date détermine les risques plomb et amiante.">
                    Date du permis de construire
                  </Label>
                  <RadioRow
                    ariaLabel="Date du permis de construire"
                    options={PERMIT_UI_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                    value={permitStoreToUI(data.permit_date_range)}
                    onChange={(v: PermitUIValue) =>
                      updateData({ permit_date_range: permitUIToStore(v) })
                    }
                    columns={4}
                  />
                </div>
              ) : null}

              {hasPermit ? (
                <div className="devis-reveal">
                  <Label>Chauffage</Label>
                  <Chips
                    ariaLabel="Type de chauffage"
                    options={HEATING_OPTIONS}
                    value={data.heating_type}
                    onChange={(v) => updateData({ heating_type: v })}
                  />
                </div>
              ) : null}

              {hasHeating ? (
                <div className="devis-reveal">
                  <Label>Installation gaz</Label>
                  <Chips
                    ariaLabel="Installation gaz"
                    options={GAS_INSTALLATION_OPTIONS}
                    value={data.gas_installation}
                    onChange={(v) => updateData({ gas_installation: v })}
                  />
                </div>
              ) : null}

              {hasGasInstall ? (
                <div className="devis-reveal">
                  <Label>Installation gaz +15 ans ?</Label>
                  <RadioRow
                    ariaLabel="Installation gaz de plus de 15 ans"
                    options={TRISTATE_COMPACT_OPTIONS}
                    value={booleanToTriState(data.gas_over_15_years)}
                    onChange={(v: TriState) =>
                      updateData({ gas_over_15_years: triStateToBoolean(v) })
                    }
                  />
                </div>
              ) : null}

              {hasGasAge ? (
                <div className="devis-reveal">
                  <Label>Installation élec +15 ans ?</Label>
                  <RadioRow
                    ariaLabel="Installation électrique de plus de 15 ans"
                    options={TRISTATE_COMPACT_OPTIONS}
                    value={booleanToTriState(data.electric_over_15_years)}
                    onChange={(v: TriState) =>
                      updateData({ electric_over_15_years: triStateToBoolean(v) })
                    }
                  />
                </div>
              ) : null}
            </div>
          </Accordion>
          </div>
          ) : null}

          {/* ─────────── Accordéon 3 : Délai et notes ─────────── */}
          {techDone ? (
          <div className="devis-reveal">
          <Accordion
            step={3}
            open={open === "time"}
            done={timeDone && open !== "time"}
            onToggle={() => toggle("time")}
            title="Délai et notes"
            summary={timeSummary}
          >
            <div className="flex flex-col gap-4 pt-3">
              <div className="devis-reveal">
                <Label>Dans quel délai ?</Label>
                <RadioRow
                  ariaLabel="Urgence"
                  options={URGENCY_OPTIONS}
                  value={data.urgency}
                  onChange={(v) => updateData({ urgency: v })}
                  columns={5}
                />
              </div>
              {timeDone ? (
                <div className="devis-reveal">
                  <Label help="Facultatif — précisez un créneau, un contexte particulier…">
                    Notes complémentaires
                  </Label>
                  <textarea
                    value={data.notes ?? ""}
                    onChange={(e) => updateData({ notes: e.target.value })}
                    rows={3}
                    maxLength={2000}
                    placeholder="Un accès particulier, un créneau précis…"
                    className="w-full rounded-[10px] border border-[var(--color-devis-line)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-devis-ink)] outline-none focus:border-[var(--branch-fg)] focus-visible:ring-2 focus-visible:ring-[var(--branch-fg)]/30"
                  />
                </div>
              ) : null}
            </div>
          </Accordion>
          </div>
          ) : null}

          {/* ─────────── Accordéon 4 : Votre email ─────────── */}
          {timeDone ? (
          <div className="devis-reveal">
          <Accordion
            step={4}
            open={open === "email"}
            done={emailDone && open !== "email"}
            onToggle={() => toggle("email")}
            title="Votre email"
            summary={emailSummary}
          >
            <div className="pt-3">
              <Label help="On vous envoie le récapitulatif, pas de spam.">Email</Label>
              <Field
                type="email"
                autoComplete="email"
                value={data.email ?? ""}
                onChange={(e) => updateData({ email: e.target.value })}
                placeholder="vous@exemple.fr"
                aria-label="Email"
              />
            </div>
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
            {completedCount} / 4 blocs complétés
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
