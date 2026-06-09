"use client";

import { ClockIcon, PhoneIcon, ShieldCheckIcon, StarIcon } from "lucide-react";

import type { ProjectType } from "@/lib/core/diagnostics/types";

import { BranchCard } from "../components/BranchCard";
import { BRANCH_ORDER } from "../lib/branches";

type EntryScreenProps = {
  selected: ProjectType | null;
  onSelect: (branch: ProjectType) => void;
};

/**
 * Écran 1 — Entrée.
 * Hero Fraunces + 5 BranchCards + footer de trust.
 * La sélection d'une carte fait avancer vers le FillingScreen via le parent.
 */
export function EntryScreen({ selected, onSelect }: EntryScreenProps) {
  return (
    <div className="min-h-full bg-[var(--color-devis-cream)] px-4 py-7 sm:px-10 sm:py-11">
      <div className="mx-auto max-w-6xl">
        {/* Duration pill */}
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-devis-line)] bg-white px-3 py-1.5 text-[12px] text-[var(--color-devis-muted)]">
          <ClockIcon className="h-3.5 w-3.5" aria-hidden />
          <strong className="font-medium text-[var(--color-devis-ink)]">2 minutes</strong> · sans
          engagement · sans compte
        </div>

        <h1 className="font-serif text-[30px] leading-[1.08] font-normal tracking-[-0.025em] text-[var(--color-devis-ink)] sm:text-[40px]">
          Quel est{" "}
          <em className="font-medium italic">votre projet</em> ?
        </h1>
        <p className="mt-3.5 mb-7 max-w-xl text-[15px] leading-relaxed text-[var(--color-devis-muted)] sm:text-[16px]">
          En 2 minutes, identifiez les diagnostics obligatoires pour votre bien et recevez une
          estimation tarifaire. Rappel sous 2 h ouvrées.
        </p>

        <div
          role="radiogroup"
          aria-label="Choisissez votre projet"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
        >
          {BRANCH_ORDER.map((key) => (
            <BranchCard
              key={key}
              branch={key}
              selected={selected === key}
              onClick={onSelect}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-[var(--color-devis-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden /> Données chiffrées — RGPD
          </span>
          <span className="inline-flex items-center gap-1.5">
            <StarIcon className="h-3.5 w-3.5" aria-hidden /> 28 ans à Tours
          </span>
          <a
            href="tel:+33247470123"
            className="inline-flex items-center gap-1.5 hover:text-[var(--color-devis-ink)]"
          >
            <PhoneIcon className="h-3.5 w-3.5" aria-hidden /> 02 47 47 01 23
          </a>
        </div>
      </div>
    </div>
  );
}
