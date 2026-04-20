/**
 * Store Zustand du questionnaire de devis.
 *
 * Responsabilités :
 * - Conserver l'étape courante (1-6)
 * - Conserver les réponses (`data`) incrémentalement
 * - Conserver l'id du `quote_requests` créé côté serveur (après l'étape 3)
 * - Persister dans localStorage pour permettre la reprise après abandon
 *
 * Pattern directement inspiré de CLAUDE.md §Gestion d'état du questionnaire.
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { FullQuoteInput } from "@/lib/validation/schemas";

export type QuestionnaireData = Partial<FullQuoteInput>;

type QuestionnaireState = {
  currentStep: number;
  data: QuestionnaireData;
  quoteRequestId: string | null;
  /** Indique si la soumission finale a déjà été effectuée avec succès. */
  submitted: boolean;
  /** Stocke le dernier calcul de diagnostics/prix (affiché en étape 6). */
  lastCalculation: {
    required: unknown[];
    toClarify: unknown[];
    estimate: { min: number; max: number; appliedModulators: string[] };
  } | null;

  setStep: (step: number) => void;
  goNext: () => void;
  goPrev: () => void;
  updateData: (patch: QuestionnaireData) => void;
  setQuoteRequestId: (id: string) => void;
  setLastCalculation: (calc: QuestionnaireState["lastCalculation"]) => void;
  markSubmitted: () => void;
  reset: () => void;
};

const TOTAL_STEPS = 6;
const MIN_STEP = 1;

export const useQuestionnaireStore = create<QuestionnaireState>()(
  persist(
    (set) => ({
      currentStep: 1,
      data: {},
      quoteRequestId: null,
      submitted: false,
      lastCalculation: null,

      setStep: (step) =>
        set({
          currentStep: Math.min(Math.max(step, MIN_STEP), TOTAL_STEPS),
        }),
      goNext: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS),
        })),
      goPrev: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, MIN_STEP),
        })),
      updateData: (patch) => set((state) => ({ data: { ...state.data, ...patch } })),
      setQuoteRequestId: (id) => set({ quoteRequestId: id }),
      setLastCalculation: (calc) => set({ lastCalculation: calc }),
      markSubmitted: () => set({ submitted: true }),
      reset: () =>
        set({
          currentStep: 1,
          data: {},
          quoteRequestId: null,
          submitted: false,
          lastCalculation: null,
        }),
    }),
    {
      name: "servicimmo-quote",
      version: 1,
      // On ne persiste pas `lastCalculation` (recalculable) pour éviter des
      // incohérences en cas de changement des règles entre deux sessions.
      partialize: (state) => ({
        currentStep: state.currentStep,
        data: state.data,
        quoteRequestId: state.quoteRequestId,
        submitted: state.submitted,
      }),
    }
  )
);

export const QUESTIONNAIRE_TOTAL_STEPS = TOTAL_STEPS;
