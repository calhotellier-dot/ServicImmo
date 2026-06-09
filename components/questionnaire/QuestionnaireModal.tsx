"use client";

import { useEffect } from "react";
import { XIcon } from "lucide-react";

import { useQuestionnaireStore } from "@/lib/stores/questionnaire";
import { QuestionnaireApp } from "./QuestionnaireApp";

const STEPS = ["Projet", "Bien", "Email", "Technique", "Délai", "Récap"];

/** Mapping écran courant → index de l'étape active dans le stepper. */
const SCREEN_INDEX: Record<string, number> = {
  entry: 0,
  filling: 1,
  recap: 5,
  thanks: 5,
};

/**
 * Modal devis — stepper vertical compact (pastilles 1–6) à gauche,
 * QuestionnaireApp en mode embedded à droite.
 * Fermeture : croix, touche ESC, clic sur l'overlay assombri.
 */
export function QuestionnaireModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const screen = useQuestionnaireStore((s) => s.currentScreen);
  const active = SCREEN_INDEX[screen] ?? 0;

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(15,30,58,.55)] p-6 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex h-auto max-h-[94vh] min-h-[460px] w-[min(1080px,96vw)] overflow-hidden rounded-[26px] bg-[var(--color-devis-cream)] shadow-[0_40px_100px_rgba(15,30,58,.4)]">

        {/* Bouton fermeture */}
        <button
          onClick={onClose}
          aria-label="Fermer le formulaire de devis"
          className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/70 text-[var(--color-devis-muted)] transition-colors hover:bg-white"
        >
          <XIcon className="h-5 w-5" />
        </button>

        {/* Stepper vertical compact */}
        <nav
          aria-label="Étapes du devis"
          className="flex w-16 flex-shrink-0 flex-col items-center gap-4 border-r border-[var(--color-devis-line)] py-8"
        >
          {STEPS.map((label, i) => (
            <span
              key={label}
              title={label}
              aria-label={`Étape ${i + 1} : ${label}${i <= active ? " (complétée)" : ""}`}
              className={`grid h-[30px] w-[30px] place-items-center rounded-full border text-[13px] font-bold transition-colors ${
                i <= active
                  ? "border-[#a4c425] bg-[#a4c425] text-white"
                  : "border-[var(--color-devis-line)] text-[var(--color-devis-muted)]"
              }`}
            >
              {i + 1}
            </span>
          ))}
        </nav>

        {/* Zone contenu scrollable */}
        <div className="min-w-0 flex-1 overflow-y-auto">
          <QuestionnaireApp embedded />
        </div>
      </div>
    </div>
  );
}
