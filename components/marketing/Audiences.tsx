"use client";

import Link from "next/link";
import { useState } from "react";

import { Eyebrow } from "./Hero";

type Audience = {
  key: string;
  label: string;
  title: string;
  desc: string;
  chips: string[];
  diags: { name: string; note: string }[];
};

const AUDIENCES: Audience[] = [
  {
    key: "particuliers",
    label: "Particuliers",
    title: "Vous vendez ou louez votre bien",
    desc: "On vous guide sur la liste exacte des diagnostics obligatoires pour votre maison, appartement ou local. Devis sous 2 h, RDV sous 48 h.",
    chips: ["Vente", "Location", "Travaux"],
    diags: [
      { name: "DPE", note: "obligatoire" },
      { name: "Amiante", note: "si < 1997" },
      { name: "Plomb (CREP)", note: "si < 1949" },
      { name: "Gaz / Électricité", note: "si > 15 ans" },
      { name: "Termites · ERP · Loi Carrez", note: "selon cas" },
    ],
  },
  {
    key: "pros",
    label: "Professionnels",
    title: "Locaux professionnels, commerces, ERP",
    desc: "Cession de fonds de commerce, bail commercial, exploitation d'ERP — nous couvrons vos obligations de contrôle.",
    chips: ["Commerce", "Bureau", "ERP"],
    diags: [
      { name: "DPE mention tertiaire", note: "décret tertiaire" },
      { name: "Amiante DTA", note: "bâtiments < 1997" },
      { name: "Électricité", note: "si > 15 ans" },
      { name: "Accessibilité", note: "ERP" },
      { name: "Loi Carrez · ERP", note: "selon cas" },
    ],
  },
  {
    key: "syndics",
    label: "Syndics",
    title: "Gestion du patrimoine en copropriété",
    desc: "Accompagnement des syndics sur leurs obligations : DPE collectif, DTA, plans pluriannuels de travaux (PPT).",
    chips: ["DPE collectif", "DTA", "PPT"],
    diags: [
      { name: "DPE collectif", note: "obligatoire" },
      { name: "DTA", note: "collectifs < 1997" },
      { name: "PPT", note: "plan pluriannuel" },
      { name: "Audit énergétique", note: "selon cas" },
    ],
  },
  {
    key: "moa",
    label: "MOA & architectes",
    title: "Chantiers de travaux et de démolition",
    desc: "Repérages amiante avant travaux / démolition, mesures d'empoussièrement, recherche plomb en zone préfectorale.",
    chips: ["Démolition", "Rénovation", "Chantier"],
    diags: [
      { name: "Amiante av. travaux (RAAT)", note: "chantier" },
      { name: "Amiante av. démolition (RAAD)", note: "démolition" },
      { name: "Mesures empoussièrement", note: "chantier" },
      { name: "Plomb en zone", note: "préfectoral" },
      { name: "Constat visuel", note: "après travaux" },
    ],
  },
];

export function Audiences() {
  const [active, setActive] = useState(0);
  const a = AUDIENCES[active] ?? AUDIENCES[0]!;

  return (
    <section className="bg-[var(--color-home-bg)] py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="mx-auto mb-12 max-w-[800px] text-center">
          <div className="inline-flex justify-center">
            <Eyebrow>À qui nous nous adressons</Eyebrow>
          </div>
          <h2 className="mx-auto mt-4 mb-4 max-w-[20ch] text-[32px] leading-[1.1] font-medium tracking-[-0.025em] text-[var(--color-home-ink)] sm:text-[40px]">
            Un interlocuteur unique,{" "}
            <em className="font-medium text-[var(--color-home-saf-dark)] not-italic">
              quelque soit votre projet
            </em>
            .
          </h2>
          <p className="mx-auto max-w-[55ch] text-[16px] leading-relaxed text-[var(--color-home-muted-2)]">
            Particuliers, professionnels, syndics de copropriété, maîtrises d&apos;ouvrage —
            Servicimmo accompagne tous les acteurs de l&apos;immobilier en Touraine.
          </p>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-[var(--color-home-line)] bg-white shadow-[0_4px_20px_-10px_rgba(13,26,36,0.08)]">
          <div
            role="tablist"
            aria-label="Audiences"
            className="grid grid-cols-2 border-b border-[var(--color-home-line)] bg-[var(--color-home-bg-2)] md:grid-cols-4"
          >
            {AUDIENCES.map((aud, i) => {
              const isActive = i === active;
              return (
                <button
                  key={aud.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`audience-panel-${aud.key}`}
                  id={`audience-tab-${aud.key}`}
                  onClick={() => setActive(i)}
                  className={[
                    "flex items-baseline gap-2.5 border-r border-[var(--color-home-line)] px-6 py-5 text-left text-[15px] font-medium tracking-[-0.01em] transition-colors last:border-r-0",
                    isActive
                      ? "bg-white text-[var(--color-home-ink)] shadow-[inset_0_-2px_0_var(--color-home-saf-dark)]"
                      : "text-[var(--color-home-muted-2)] hover:text-[var(--color-home-ink)]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "font-mono text-[11px] tracking-[0.06em]",
                      isActive
                        ? "text-[var(--color-home-saf-dark)]"
                        : "text-[var(--color-home-muted)]",
                    ].join(" ")}
                  >
                    0{i + 1}
                  </span>
                  <span>{aud.label}</span>
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`audience-panel-${a.key}`}
            aria-labelledby={`audience-tab-${a.key}`}
            className="grid min-h-[300px] grid-cols-1 md:grid-cols-[1.3fr_1fr]"
          >
            <div className="p-10">
              <h3 className="mb-3 max-w-[22ch] text-[26px] leading-[1.15] font-medium tracking-[-0.02em] text-[var(--color-home-ink)]">
                {a.title}
              </h3>
              <p className="mb-5 max-w-[48ch] text-[15px] leading-relaxed text-[var(--color-home-muted-2)]">
                {a.desc}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {a.chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-[4px] bg-[var(--color-home-saf-bg)] px-2.5 py-1 font-mono text-[11px] font-semibold tracking-[0.04em] text-[var(--color-home-saf-dark)] uppercase"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <Link
                href="/devis"
                className="mt-7 inline-flex items-center gap-2 rounded-[6px] bg-[var(--color-home-slate)] px-5 py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Demander un devis →
              </Link>
            </div>
            <div className="border-t border-[var(--color-home-line)] bg-[var(--color-home-bg)] p-10 md:border-t-0 md:border-l">
              <div className="mb-3.5 font-mono text-[10px] tracking-[0.08em] text-[var(--color-home-muted)] uppercase">
                Diagnostics courants
              </div>
              <ul className="list-none">
                {a.diags.map((d, i) => (
                  <li
                    key={d.name}
                    className={[
                      "flex justify-between gap-4 py-2.5 text-[13px]",
                      i === 0 ? "" : "border-t border-[var(--color-home-line-soft)]",
                    ].join(" ")}
                  >
                    <span className="font-medium tracking-[-0.01em] text-[var(--color-home-ink)]">
                      {d.name}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--color-home-muted)]">
                      {d.note}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
