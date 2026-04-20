"use client";

import Link from "next/link";
import { ClockIcon, ShieldCheckIcon } from "lucide-react";

import { ProgressBar } from "@/components/questionnaire/ProgressBar";
import { QUESTIONNAIRE_TOTAL_STEPS } from "@/lib/stores/questionnaire";

type QuestionnaireLayoutProps = {
  currentStep: number;
  children: React.ReactNode;
};

export function QuestionnaireLayout({ currentStep, children }: QuestionnaireLayoutProps) {
  return (
    <div className="bg-background flex min-h-dvh flex-col">
      {/* Header sobre — focus sur le parcours */}
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight"
            aria-label="Retour à l'accueil Servicimmo"
          >
            Servicimmo
          </Link>
          <div className="text-muted-foreground flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <ClockIcon className="size-3.5" aria-hidden />2 minutes
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <ShieldCheckIcon className="size-3.5" aria-hidden />
              Données protégées (RGPD)
            </span>
          </div>
        </div>
      </header>

      {/* Progress + contenu */}
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-3xl px-6 pt-8">
          <ProgressBar currentStep={currentStep} totalSteps={QUESTIONNAIRE_TOTAL_STEPS} />
        </div>
        <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</div>
      </main>
    </div>
  );
}
