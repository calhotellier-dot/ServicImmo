"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { recalculateDossier, saveDossier } from "@/lib/features/dossiers/actions";
import type { DossierInput } from "@/lib/features/dossiers/schema";
import type { DossierRow } from "@/lib/supabase/types";

type Props = { dossier: DossierRow };

const PROJECT_TYPES = [
  { value: "sale", label: "Vente" },
  { value: "rental", label: "Location" },
  { value: "works", label: "Travaux" },
  { value: "coownership", label: "Copropriété" },
  { value: "other", label: "Autre" },
] as const;

const PROPERTY_TYPES = [
  { value: "house", label: "Maison" },
  { value: "apartment", label: "Appartement" },
  { value: "building", label: "Immeuble" },
  { value: "commercial", label: "Local commercial" },
  { value: "common_areas", label: "Parties communes" },
  { value: "land", label: "Terrain" },
  { value: "annex", label: "Annexe" },
  { value: "other", label: "Autre" },
] as const;

const PERMIT_RANGES = [
  { value: "before_1949", label: "Avant 1949" },
  { value: "1949_to_1997", label: "1949 - 1997" },
  { value: "after_1997", label: "Après 1997" },
  { value: "unknown", label: "Inconnu" },
] as const;

/**
 * Wizard "tout-en-un" (édition du draft en place, auto-save debounce 500ms).
 * Version Sprint 2 — les 10 étapes du PRD sont présentées en accordions, pas
 * en slides séquentielles (UX plus rapide pour les power-users). Les steps
 * linéaires arriveront Sprint 8 si Servicimmo les préfère.
 */
export function DossierWizard({ dossier }: Props) {
  const [form, setForm] = useState<DossierInput>({
    project_type: dossier.project_type ?? undefined,
    property_type: (dossier.property_type as DossierInput["property_type"]) ?? undefined,
    address: dossier.address ?? undefined,
    postal_code: dossier.postal_code ?? undefined,
    city: dossier.city ?? undefined,
    surface: dossier.surface ?? undefined,
    rooms_count: dossier.rooms_count ?? undefined,
    is_coownership: dossier.is_coownership,
    permit_date_range: dossier.permit_date_range ?? undefined,
    urgency: dossier.urgency ?? undefined,
    requested_date: dossier.requested_date ?? undefined,
    notes: dossier.notes ?? undefined,
  });
  const [completion, setCompletion] = useState(dossier.completion_rate);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setStatus("saving");
      startTransition(async () => {
        const res = await saveDossier(dossier.id, form);
        if (res.ok) {
          setCompletion(res.data.completionRate);
          setStatus("saved");
          setTimeout(() => setStatus("idle"), 1500);
        } else {
          setStatus("error");
        }
      });
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const update = <K extends keyof DossierInput>(key: K, value: DossierInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Wizard dossier</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full bg-neutral-900 transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-neutral-500">{completion}%</span>
          </div>
          <SaveIndicator status={status} />
        </div>
      </div>

      {/* ─── Section 1 : Projet & bien ─── */}
      <Section title="Projet & bien">
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Type de projet"
            value={form.project_type ?? ""}
            options={PROJECT_TYPES}
            onChange={(v) => update("project_type", v as DossierInput["project_type"])}
          />
          <Select
            label="Type de bien"
            value={form.property_type ?? ""}
            options={PROPERTY_TYPES}
            onChange={(v) => update("property_type", v as DossierInput["property_type"])}
          />
          <Text
            label="Adresse"
            value={form.address ?? ""}
            onChange={(v) => update("address", v)}
            className="md:col-span-2"
          />
          <Text
            label="Code postal"
            value={form.postal_code ?? ""}
            onChange={(v) => update("postal_code", v)}
          />
          <Text
            label="Ville"
            value={form.city ?? ""}
            onChange={(v) => update("city", v)}
          />
          <Number
            label="Surface (m²)"
            value={form.surface}
            onChange={(v) => update("surface", v)}
          />
          <Number
            label="Nombre de pièces"
            value={form.rooms_count}
            onChange={(v) => update("rooms_count", v)}
          />
          <Select
            label="Date du permis"
            value={form.permit_date_range ?? ""}
            options={PERMIT_RANGES}
            onChange={(v) =>
              update("permit_date_range", v as DossierInput["permit_date_range"])
            }
          />
          <Tristate
            label="Copropriété ?"
            value={form.is_coownership}
            onChange={(v) => update("is_coownership", v)}
          />
        </div>
      </Section>

      {/* ─── Section 2 : Délai & notes ─── */}
      <Section title="Planning & notes">
        <div className="grid gap-4 md:grid-cols-2">
          <Text
            label="Urgence (asap, week, month…)"
            value={form.urgency ?? ""}
            onChange={(v) => update("urgency", v)}
          />
          <Text
            label="Date souhaitée (YYYY-MM-DD)"
            value={form.requested_date ?? ""}
            onChange={(v) => update("requested_date", v)}
          />
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[12px] font-medium text-neutral-700">
              Notes internes
            </label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => update("notes", e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-2">
        <form
          action={async () => {
            await recalculateDossier(dossier.id);
            window.location.reload();
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-700 hover:border-neutral-400"
          >
            Recalculer diagnostics + prix
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sous-composants
// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 font-mono text-[11px] tracking-widest text-neutral-500">
        {title.toUpperCase()}
      </div>
      {children}
    </section>
  );
}

function SaveIndicator({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  const label =
    status === "saving"
      ? "Enregistrement…"
      : status === "saved"
        ? "Enregistré"
        : status === "error"
          ? "Erreur"
          : "";
  if (!label) return <div className="h-4 w-16" />;
  return (
    <span
      className={`font-mono text-[10px] tracking-widest ${
        status === "saved"
          ? "text-emerald-700"
          : status === "error"
            ? "text-red-600"
            : "text-neutral-500"
      }`}
    >
      {label.toUpperCase()}
    </span>
  );
}

function Text({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={`flex flex-col ${className ?? ""}`}>
      <span className="mb-1.5 text-[12px] font-medium text-neutral-700">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
      />
    </label>
  );
}

function Number({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <label className="flex flex-col">
      <span className="mb-1.5 text-[12px] font-medium text-neutral-700">{label}</span>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : globalThis.Number(e.target.value))
        }
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col">
      <span className="mb-1.5 text-[12px] font-medium text-neutral-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Tristate({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null | undefined;
  onChange: (v: boolean | null) => void;
}) {
  const options = [
    { label: "Oui", v: true },
    { label: "Non", v: false },
    { label: "?", v: null },
  ];
  return (
    <div>
      <span className="mb-1.5 block text-[12px] font-medium text-neutral-700">{label}</span>
      <div className="flex gap-1.5">
        {options.map((opt) => {
          const active = value === opt.v;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.v)}
              className={`rounded-lg border px-3 py-1.5 text-[13px] ${
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
