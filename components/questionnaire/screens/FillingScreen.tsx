"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { ProjectType } from "@/lib/core/diagnostics/types";

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

const HEATING_MODE_OPTIONS = [
  { value: "individual", label: "Individuel" },
  { value: "collective", label: "Collectif" },
  { value: "unknown", label: "Je ne sais pas" },
] as const;

const ECS_OPTIONS = [
  { value: "same_as_heating", label: "Comme le chauffage" },
  { value: "electric", label: "Ballon électrique" },
  { value: "gas", label: "Gaz" },
  { value: "solar", label: "Solaire" },
  { value: "other", label: "Autre" },
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

const COOKTOP_OPTIONS = [
  { value: "souple", label: "Tuyau souple" },
  { value: "rigide", label: "Tuyau rigide" },
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

const REFERRAL_OPTIONS = [
  { value: "particulier", label: "Particulier" },
  { value: "agence", label: "Agence" },
  { value: "notaire", label: "Notaire" },
  { value: "syndic", label: "Syndic" },
  { value: "recommandation", label: "Recommandation" },
  { value: "autre", label: "Autre" },
] as const;

const DEPENDENCIES_OPTIONS = [
  { value: "cave", label: "Cave" },
  { value: "garage", label: "Garage" },
  { value: "atelier", label: "Atelier" },
  { value: "sous_sol", label: "Sous-sol" },
  { value: "combles", label: "Combles" },
] as const;

const EXISTING_DIAGS_OPTIONS = [
  { value: "dpe", label: "DPE" },
  { value: "asbestos", label: "Amiante" },
  { value: "lead", label: "Plomb" },
  { value: "gas", label: "Gaz" },
  { value: "electric", label: "Électricité" },
  { value: "termites", label: "Termites" },
  { value: "erp", label: "ERP" },
  { value: "carrez", label: "Loi Carrez" },
  { value: "boutin", label: "Loi Boutin" },
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
// Mini-composant "ChipsMulti" (local — évite un nouveau fichier)
// ---------------------------------------------------------------------------

type MultiOpt<T extends string> = { value: T; label: string };

function ChipsMulti<T extends string>({
  options,
  values,
  onToggle,
  ariaLabel,
}: {
  options: ReadonlyArray<MultiOpt<T>>;
  values: T[];
  onToggle: (v: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            role="checkbox"
            aria-checked={selected}
            onClick={() => onToggle(opt.value)}
            className={[
              "rounded-full border px-3.5 py-2 text-[13px] transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--branch-fg)]/40",
              selected
                ? "border-[var(--branch-fg)] bg-[var(--branch-bg)] font-medium text-[var(--branch-dark)]"
                : "border-[var(--color-devis-line)] bg-white text-[var(--color-devis-ink)] hover:border-[var(--branch-fg)]/60",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

type FillingScreenProps = {
  branch: ProjectType;
  onBack: () => void;
  onContinue: () => Promise<void> | void;
  submitting: boolean;
  error: string | null;
};

type AccordionKey = "prop" | "tech" | "existing" | "time" | "contact" | null;

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

  // ─── Completion flags par accordéon ──────────────────────────────────────
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
    // Appartement → étage renseigné
    (!isApartment || typeof data.floor === "number") &&
    // Commercial → activité renseignée
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

  // "Diagnostics déjà valides" est optionnel → considéré done dès qu'on a
  // ouvert l'accordéon (même sans rien cocher, l'utilisateur peut répondre
  // "aucun" implicitement). Pour simplifier : toujours done.
  const existingDone = true;

  const timeDone =
    !!data.urgency &&
    // Si source "autre" → précision requise
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

  // Auto-open du suivant
  const prevRef = useRef({ propDone, techDone, existingDone, timeDone });
  useEffect(() => {
    const p = prevRef.current;
    if (propDone && !p.propDone && open === "prop") setOpen("tech");
    else if (techDone && !p.techDone && open === "tech") setOpen("existing");
    else if (existingDone && !p.existingDone && open === "existing") setOpen("time");
    else if (timeDone && !p.timeDone && open === "time") setOpen("contact");
    prevRef.current = { propDone, techDone, existingDone, timeDone };
  }, [propDone, techDone, existingDone, timeDone, open]);

  const completedCount = [propDone, techDone, existingDone, timeDone, contactDone].filter(
    Boolean
  ).length;

  // ─── Flags de disclosure champ-par-champ ─────────────────────────────────
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
  const hasCoownership = data.is_coownership !== undefined;

  const needsRentalFurnished = branch === "rental";
  const needsWorksType = branch === "works";
  const branchSpecDone =
    (!needsRentalFurnished || !!data.rental_furnished) &&
    (!needsWorksType || !!data.works_type);
  const hasPermit = !!data.permit_date_range;
  const hasHeatingMode = !!data.heating_mode;
  const hasHeating = !!data.heating_type;
  const hasEcs = !!data.ecs_type;
  const hasGasInstall = !!data.gas_installation;
  const hasCooktop = !hasGas || !!data.cooktop_connection;
  const hasGasAge = data.gas_over_15_years !== undefined;

  const dependencies = data.dependencies ?? [];
  const existingDiags = data.existing_valid_diagnostics ?? [];

  const toggleDependency = (v: (typeof DEPENDENCIES_OPTIONS)[number]["value"]) => {
    const next = dependencies.includes(v)
      ? dependencies.filter((x) => x !== v)
      : [...dependencies, v];
    updateData({ dependencies: next });
  };

  const toggleExisting = (v: (typeof EXISTING_DIAGS_OPTIONS)[number]["value"]) => {
    const next = existingDiags.includes(v)
      ? existingDiags.filter((x) => x !== v)
      : [...existingDiags, v];
    updateData({ existing_valid_diagnostics: next });
  };

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

                {/* Champs conditionnels appartement */}
                {hasCoownership && isApartment ? (
                  <div className="devis-reveal flex flex-col gap-3 rounded-[10px] bg-white/60 p-3">
                    <div className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-devis-muted)]">
                      PRÉCISIONS APPARTEMENT
                    </div>
                    <div>
                      <Label>Nom de la résidence</Label>
                      <Field
                        value={data.residence_name ?? ""}
                        onChange={(e) => updateData({ residence_name: e.target.value })}
                        placeholder="Résidence des Tilleuls"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Étage</Label>
                        <Field
                          type="number"
                          inputMode="numeric"
                          min={-5}
                          max={100}
                          value={data.floor ?? ""}
                          onChange={(e) => {
                            const v =
                              e.target.value === "" ? undefined : Number(e.target.value);
                            updateData({ floor: v });
                          }}
                          placeholder="3"
                        />
                      </div>
                      <div>
                        <Label>N° de porte</Label>
                        <Field
                          value={data.door_number ?? ""}
                          onChange={(e) => updateData({ door_number: e.target.value })}
                          placeholder="12B"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Dernier étage ?</Label>
                      <RadioRow
                        ariaLabel="Dernier étage"
                        options={TRISTATE_COMPACT_OPTIONS}
                        value={booleanToTriState(data.is_top_floor)}
                        onChange={(v: TriState) =>
                          updateData({ is_top_floor: triStateToBoolean(v) })
                        }
                      />
                    </div>
                    <div>
                      <Label>Duplex ?</Label>
                      <RadioRow
                        ariaLabel="Duplex"
                        options={TRISTATE_COMPACT_OPTIONS}
                        value={booleanToTriState(data.is_duplex)}
                        onChange={(v: TriState) =>
                          updateData({ is_duplex: triStateToBoolean(v) })
                        }
                      />
                    </div>
                  </div>
                ) : null}

                {/* Champs conditionnels commercial */}
                {hasCoownership && isCommercial ? (
                  <div className="devis-reveal flex flex-col gap-3 rounded-[10px] bg-white/60 p-3">
                    <div className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-devis-muted)]">
                      LOCAL PROFESSIONNEL
                    </div>
                    <div>
                      <Label>Activité exercée</Label>
                      <Field
                        value={data.commercial_activity ?? ""}
                        onChange={(e) => updateData({ commercial_activity: e.target.value })}
                        placeholder="Bureau, commerce, restaurant…"
                      />
                    </div>
                    <div>
                      <Label>Nombre de zones chauffées</Label>
                      <Field
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={50}
                        value={data.heated_zones_count ?? ""}
                        onChange={(e) => {
                          const v =
                            e.target.value === "" ? undefined : Number(e.target.value);
                          updateData({ heated_zones_count: v });
                        }}
                        placeholder="2"
                      />
                    </div>
                    <div>
                      <Label help="Configuration du local, accès spécifiques, horaires d'ouverture…">
                        Configuration (optionnel)
                      </Label>
                      <textarea
                        value={data.configuration_notes ?? ""}
                        onChange={(e) => updateData({ configuration_notes: e.target.value })}
                        rows={2}
                        maxLength={2000}
                        className="w-full rounded-[10px] border border-[var(--color-devis-line)] bg-white px-3 py-2 text-[14px] text-[var(--color-devis-ink)] outline-none focus:border-[var(--branch-fg)]"
                      />
                    </div>
                  </div>
                ) : null}

                {/* Dépendances (toujours proposé) */}
                {hasCoownership ? (
                  <div className="devis-reveal">
                    <Label help="Cave, garage, atelier… Cochez celles qui existent.">
                      Dépendances
                    </Label>
                    <ChipsMulti
                      ariaLabel="Dépendances"
                      options={DEPENDENCIES_OPTIONS}
                      values={dependencies}
                      onToggle={toggleDependency}
                    />
                    {dependencies.length > 0 ? (
                      <div className="mt-2">
                        <Label>Aménagées (pièces à vivre) ?</Label>
                        <RadioRow
                          ariaLabel="Dépendances aménagées"
                          options={TRISTATE_COMPACT_OPTIONS}
                          value={booleanToTriState(data.dependencies_converted)}
                          onChange={(v: TriState) =>
                            updateData({ dependencies_converted: triStateToBoolean(v) })
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* Référence cadastrale (optionnel) */}
                {hasCoownership ? (
                  <div className="devis-reveal">
                    <Label help="Vous la trouvez sur votre taxe foncière ou sur cadastre.gouv.fr (optionnel).">
                      Référence cadastrale
                    </Label>
                    <Field
                      value={data.cadastral_reference ?? ""}
                      onChange={(e) => updateData({ cadastral_reference: e.target.value })}
                      placeholder="Ex : AB 123"
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
                    </div>
                  ) : null}

                  {hasPermit ? (
                    <div className="devis-reveal">
                      <Label help="Individuel ou collectif — le collectif déclenche des diagnostics spécifiques en copropriété.">
                        Mode de chauffage
                      </Label>
                      <Chips
                        ariaLabel="Mode de chauffage"
                        options={HEATING_MODE_OPTIONS}
                        value={data.heating_mode}
                        onChange={(v) => updateData({ heating_mode: v })}
                      />
                    </div>
                  ) : null}

                  {hasHeatingMode ? (
                    <div className="devis-reveal">
                      <Label>Type de chauffage</Label>
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
                      <Label>Eau chaude sanitaire</Label>
                      <Chips
                        ariaLabel="Eau chaude sanitaire"
                        options={ECS_OPTIONS}
                        value={data.ecs_type}
                        onChange={(v) => updateData({ ecs_type: v })}
                      />
                    </div>
                  ) : null}

                  {hasEcs ? (
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

                  {hasGasInstall && hasGas ? (
                    <div className="devis-reveal">
                      <Label>Raccordement de la table de cuisson</Label>
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
                    </div>
                  ) : null}

                  {hasGasInstall && hasCooktop ? (
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

                  {/* Date d'achat optionnelle */}
                  {hasGasAge ? (
                    <div className="devis-reveal">
                      <Label help="Si différente du permis de construire — optionnel.">
                        Date d&apos;achat (optionnel)
                      </Label>
                      <Field
                        type="date"
                        value={data.purchase_date ?? ""}
                        onChange={(e) => updateData({ purchase_date: e.target.value })}
                      />
                    </div>
                  ) : null}
                </div>
              </Accordion>
            </div>
          ) : null}

          {/* ─────────── Accordéon 3 : Diagnostics déjà valides ─────────── */}
          {techDone ? (
            <div className="devis-reveal">
              <Accordion
                step={3}
                open={open === "existing"}
                done={existingDone && open !== "existing" && existingDiags.length > 0}
                onToggle={() => toggle("existing")}
                title="Diagnostics déjà valides ?"
                summary={existingDiags.length > 0 ? `${existingDiags.length} déclaré(s)` : undefined}
              >
                <div className="flex flex-col gap-3 pt-3">
                  <p className="text-[13px] text-[var(--color-devis-muted)]">
                    Cochez les diagnostics que vous avez déjà et qui sont encore valides.
                    Nous les exclurons du devis (économie réelle).
                  </p>
                  <ChipsMulti
                    ariaLabel="Diagnostics déjà valides"
                    options={EXISTING_DIAGS_OPTIONS}
                    values={existingDiags}
                    onToggle={toggleExisting}
                  />
                  {existingDiags.includes("asbestos") || existingDiags.includes("lead") ? (
                    <div className="rounded-[10px] border border-dashed border-[var(--color-devis-line)] bg-white/60 p-3 text-[12px] text-[var(--color-devis-muted)]">
                      Amiante et plomb : merci d&apos;envoyer le diagnostic existant par email après
                      soumission ; sinon le technicien le refait sur place.
                    </div>
                  ) : null}
                </div>
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
                  {data.urgency ? (
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
                  {data.urgency ? (
                    <div className="devis-reveal">
                      <Label>Comment nous avez-vous trouvés ?</Label>
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
                    </div>
                  ) : null}
                </div>
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
                <div className="flex flex-col gap-4 pt-3">
                  <div className="devis-reveal">
                    <Label help="Numéro joignable pour caler le rendez-vous (obligatoire).">
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
                  {contactDone ? (
                    <>
                      <div className="devis-reveal">
                        <Label>Locataire(s) en place ?</Label>
                        <RadioRow
                          ariaLabel="Locataire en place"
                          options={TRISTATE_OPTIONS}
                          value={booleanToTriState(data.tenants_in_place)}
                          onChange={(v: TriState) =>
                            updateData({ tenants_in_place: triStateToBoolean(v) })
                          }
                        />
                      </div>
                      <div className="devis-reveal">
                        <Label help="Horaires d'accès, contact gardien, digicode, présence animaux…">
                          Accès au bien (optionnel)
                        </Label>
                        <textarea
                          value={data.access_notes ?? ""}
                          onChange={(e) => updateData({ access_notes: e.target.value })}
                          rows={2}
                          maxLength={1000}
                          placeholder="Accès libre, clés chez le gardien au 2e étage…"
                          className="w-full rounded-[10px] border border-[var(--color-devis-line)] bg-white px-3.5 py-3 text-[14px] text-[var(--color-devis-ink)] outline-none focus:border-[var(--branch-fg)]"
                        />
                      </div>
                      {data.heating_mode === "collective" ? (
                        <div className="devis-reveal">
                          <Label help="Nom et contact du syndic (nécessaire pour DPE collectif).">
                            Coordonnées du syndic (optionnel)
                          </Label>
                          <textarea
                            value={data.syndic_contact ?? ""}
                            onChange={(e) => updateData({ syndic_contact: e.target.value })}
                            rows={2}
                            maxLength={500}
                            placeholder="Cabinet Dupont, 02 47 00 00 00"
                            className="w-full rounded-[10px] border border-[var(--color-devis-line)] bg-white px-3.5 py-3 text-[14px] text-[var(--color-devis-ink)] outline-none focus:border-[var(--branch-fg)]"
                          />
                        </div>
                      ) : null}
                    </>
                  ) : null}
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
