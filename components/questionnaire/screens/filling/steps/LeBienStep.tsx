"use client";

import { AddressAutocomplete } from "@/components/questionnaire/components/AddressAutocomplete";
import { Chips } from "@/components/questionnaire/components/Chips";
import { ChipsMulti } from "@/components/questionnaire/components/ChipsMulti";
import { Field } from "@/components/questionnaire/components/Field";
import { Label } from "@/components/questionnaire/components/Label";
import { RadioRow } from "@/components/questionnaire/components/RadioRow";
import {
  booleanToTriState,
  triStateToBoolean,
  type TriState,
} from "@/components/questionnaire/lib/field-mapping";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

import {
  DEPENDENCIES_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  TRISTATE_COMPACT_OPTIONS,
  TRISTATE_OPTIONS,
} from "../options";
import { StepBlocks } from "../StepBlocks";
import type { StepProps, SubBlockDescriptor } from "../types";

// ── Prédicats purs (repris à l'identique des flags d'origine) ───────────────
const addressComplete = (d: QuestionnaireData) =>
  !!d.address &&
  d.address.length >= 3 &&
  !!d.postal_code &&
  /^\d{5}$/.test(d.postal_code) &&
  !!d.city;
const surfaceComplete = (d: QuestionnaireData) =>
  typeof d.surface === "number" &&
  d.surface > 0 &&
  typeof d.rooms_count === "number" &&
  d.rooms_count >= 1;
const coownershipAnswered = (d: QuestionnaireData) =>
  d.is_coownership !== undefined;

const propertyLabel = (d: QuestionnaireData) =>
  PROPERTY_TYPE_OPTIONS.find((o) => o.value === d.property_type)?.label ?? "";
const triLabel = (v: boolean | null | undefined) =>
  TRISTATE_OPTIONS.find((o) => o.value === booleanToTriState(v))?.label;

/** Étape 1 — Le bien (référence du pattern sous-blocs). */
export function LeBienStep({ data, updateData, branch }: StepProps) {
  const dependencies = data.dependencies ?? [];
  const toggleDependency = (
    v: (typeof DEPENDENCIES_OPTIONS)[number]["value"],
  ) => {
    const next = dependencies.includes(v)
      ? dependencies.filter((x) => x !== v)
      : [...dependencies, v];
    updateData({ dependencies: next });
  };

  const descriptors: SubBlockDescriptor[] = [
    {
      key: "type",
      title: "Type de bien",
      isVisible: () => true,
      isComplete: (d) => !!d.property_type,
      summary: (d) => propertyLabel(d),
      render: () => (
        <Chips
          ariaLabel="Type de bien"
          options={PROPERTY_TYPE_OPTIONS}
          value={data.property_type}
          onChange={(value) => updateData({ property_type: value })}
        />
      ),
    },
    {
      key: "address",
      title: "Adresse du bien",
      isVisible: (d) => !!d.property_type,
      isComplete: (d) => addressComplete(d),
      summary: (d) =>
        d.city ? `${d.city} ${d.postal_code ?? ""}`.trim() : undefined,
      render: () => (
        <>
          <Label help="Commencez à taper, nous remplissons le code postal et la ville automatiquement.">
            Adresse
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
        </>
      ),
    },
    {
      key: "surface",
      title: "Surface & pièces",
      isVisible: (d) => addressComplete(d),
      isComplete: (d) => surfaceComplete(d),
      summary: (d) => `${d.surface} m² · ${d.rooms_count} pièces`,
      render: () => (
        <div className="grid grid-cols-2 gap-4">
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
                const v =
                  e.target.value === "" ? undefined : Number(e.target.value);
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
                const v =
                  e.target.value === "" ? undefined : Number(e.target.value);
                updateData({ rooms_count: v });
              }}
              placeholder="4"
              aria-label="Nombre de pièces"
            />
          </div>
        </div>
      ),
    },
    {
      key: "coownership",
      title: "Copropriété ?",
      isVisible: (d) => surfaceComplete(d),
      isComplete: (d) => coownershipAnswered(d),
      summary: (d) => triLabel(d.is_coownership),
      render: () => (
        <RadioRow
          ariaLabel="Copropriété"
          options={TRISTATE_OPTIONS}
          value={booleanToTriState(data.is_coownership)}
          onChange={(v: TriState) =>
            updateData({ is_coownership: triStateToBoolean(v) })
          }
        />
      ),
    },
    {
      key: "apartment",
      title: "Précisions appartement",
      isVisible: (d) =>
        coownershipAnswered(d) && d.property_type === "apartment",
      isComplete: (d) => typeof d.floor === "number",
      summary: (d) =>
        typeof d.floor === "number" ? `Étage ${d.floor}` : undefined,
      render: () => (
        <div className="flex flex-col gap-3">
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
      ),
    },
    {
      key: "commercial",
      title: "Local professionnel",
      isVisible: (d) =>
        coownershipAnswered(d) && d.property_type === "commercial",
      isComplete: (d) => !!d.commercial_activity,
      summary: (d) => d.commercial_activity || undefined,
      render: () => (
        <div className="flex flex-col gap-3">
          <div>
            <Label>Activité exercée</Label>
            <Field
              value={data.commercial_activity ?? ""}
              onChange={(e) =>
                updateData({ commercial_activity: e.target.value })
              }
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
              onChange={(e) =>
                updateData({ configuration_notes: e.target.value })
              }
              rows={2}
              maxLength={2000}
              className="w-full rounded-[10px] border border-[var(--color-devis-line)] bg-white px-3 py-2 text-[14px] text-[var(--color-devis-ink)] outline-none focus:border-[var(--branch-fg)]"
            />
          </div>
        </div>
      ),
    },
    {
      key: "dependencies",
      title: "Dépendances",
      isVisible: (d) => coownershipAnswered(d),
      isComplete: () => true, // optionnel
      summary: (d) => {
        const list = d.dependencies ?? [];
        if (list.length === 0) return "Aucune";
        return DEPENDENCIES_OPTIONS.filter((o) => list.includes(o.value))
          .map((o) => o.label)
          .join(", ");
      },
      render: () => (
        <>
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
        </>
      ),
    },
    {
      key: "cadastre",
      title: "Référence cadastrale",
      isVisible: (d) => coownershipAnswered(d),
      isComplete: () => true, // optionnel
      summary: (d) => d.cadastral_reference || "—",
      render: () => (
        <>
          <Label help="Vous la trouvez sur votre taxe foncière ou sur cadastre.gouv.fr (optionnel).">
            Référence cadastrale
          </Label>
          <Field
            value={data.cadastral_reference ?? ""}
            onChange={(e) => updateData({ cadastral_reference: e.target.value })}
            placeholder="Ex : AB 123"
          />
        </>
      ),
    },
  ];

  return <StepBlocks descriptors={descriptors} data={data} branch={branch} />;
}
