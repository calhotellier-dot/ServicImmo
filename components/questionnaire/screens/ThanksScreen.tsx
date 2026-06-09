"use client";

import { CheckIcon, MailIcon, PhoneIcon } from "lucide-react";

import type { ProjectType } from "@/lib/core/diagnostics/types";

import { NextSteps } from "../components/NextSteps";
import { getBranchVars } from "../lib/branch-colors";

type ThanksScreenProps = {
  firstName?: string;
  email?: string;
  branch: ProjectType;
  onRestart: () => void;
};

export function ThanksScreen({ firstName, email, branch, onRestart }: ThanksScreenProps) {
  const name = firstName?.trim() || "pour votre demande";

  return (
    <div
      style={getBranchVars(branch)}
      className="flex min-h-full items-center justify-center bg-[var(--color-devis-cream)] px-5 py-14 sm:px-14 sm:py-24"
    >
      <div className="w-full max-w-xl">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--branch-bg)] text-[var(--branch-dark)]">
          <CheckIcon className="h-7 w-7" aria-hidden />
        </div>

        <h1 className="font-serif text-[30px] leading-[1.1] font-normal tracking-[-0.025em] text-[var(--color-devis-ink)] sm:text-[40px]">
          Merci <em className="font-medium italic">{name}</em>, votre demande est bien reçue.
        </h1>

        <p className="mt-4 mb-7 text-[15px] leading-relaxed text-[var(--color-devis-muted)] sm:text-[17px]">
          {email ? (
            <>
              Un récapitulatif a été envoyé à{" "}
              <strong className="font-medium text-[var(--color-devis-ink)]">{email}</strong>.{" "}
            </>
          ) : null}
          Notre équipe vous contactera sous{" "}
          <strong className="font-medium text-[var(--color-devis-ink)]">2 h ouvrées</strong> pour
          valider votre devis et planifier l&apos;intervention.
        </p>

        <NextSteps />

        <div className="mt-6 flex flex-wrap gap-2.5">
          <a
            href="tel:+33247470123"
            className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--color-devis-line)] bg-white px-4 py-3 text-[13px] text-[var(--color-devis-ink)] hover:border-[var(--branch-fg)]/60"
          >
            <PhoneIcon className="h-3.5 w-3.5" aria-hidden /> 02 47 47 01 23
          </a>
          <a
            href="mailto:contact@servicimmo.fr"
            className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--color-devis-line)] bg-white px-4 py-3 text-[13px] text-[var(--color-devis-ink)] hover:border-[var(--branch-fg)]/60"
          >
            <MailIcon className="h-3.5 w-3.5" aria-hidden /> contact@servicimmo.fr
          </a>
          <button
            type="button"
            onClick={onRestart}
            className="ml-auto inline-flex items-center gap-2 rounded-[10px] px-4 py-3 text-[13px] text-[var(--color-devis-muted)] hover:text-[var(--color-devis-ink)]"
          >
            Faire une nouvelle demande →
          </button>
        </div>
      </div>
    </div>
  );
}
