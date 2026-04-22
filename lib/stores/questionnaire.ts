/**
 * Store Zustand du questionnaire de devis.
 *
 * Pivot UX (handoff Claude Design V2-final) : le parcours n'est plus à 6 étapes
 * linéaires mais sur 4 écrans (entry → filling → recap → thanks). Les données
 * restent compatibles avec `FullQuoteInput` + `QuoteFormData` : seul le
 * "chapitrage" de l'UI change. Le moteur de règles et le pricing sont intacts.
 *
 * Responsabilités :
 * - Conserver l'écran courant
 * - Conserver les réponses (`data`) incrémentalement
 * - Conserver l'id du `quote_requests` créé côté serveur (après capture email)
 * - Conserver le dernier calcul de diagnostics/prix (affiché au recap)
 * - Persister dans localStorage pour permettre la reprise après abandon
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { FullQuoteInput } from "@/lib/validation/schemas";

export type QuestionnaireScreen = "entry" | "filling" | "recap" | "thanks";

export type QuestionnaireData = Partial<FullQuoteInput>;

type LastCalculation = {
  required: unknown[];
  toClarify: unknown[];
  estimate: { min: number; max: number; appliedModulators: string[] };
} | null;

type QuestionnaireState = {
  currentScreen: QuestionnaireScreen;
  data: QuestionnaireData;
  quoteRequestId: string | null;
  /** Indique si la soumission finale a déjà été effectuée avec succès. */
  submitted: boolean;
  lastCalculation: LastCalculation;

  goToScreen: (screen: QuestionnaireScreen) => void;
  updateData: (patch: QuestionnaireData) => void;
  setQuoteRequestId: (id: string) => void;
  setLastCalculation: (calc: LastCalculation) => void;
  markSubmitted: () => void;
  reset: () => void;
};

export const useQuestionnaireStore = create<QuestionnaireState>()(
  persist(
    (set) => ({
      currentScreen: "entry",
      data: {},
      quoteRequestId: null,
      submitted: false,
      lastCalculation: null,

      goToScreen: (screen) => set({ currentScreen: screen }),
      updateData: (patch) => set((state) => ({ data: { ...state.data, ...patch } })),
      setQuoteRequestId: (id) => set({ quoteRequestId: id }),
      setLastCalculation: (calc) => set({ lastCalculation: calc }),
      markSubmitted: () => set({ submitted: true }),
      reset: () =>
        set({
          currentScreen: "entry",
          data: {},
          quoteRequestId: null,
          submitted: false,
          lastCalculation: null,
        }),
    }),
    {
      name: "servicimmo-quote",
      // v3 = extensions "rappel téléphone" (accès, chauffage indiv/collectif,
      // dépendances, diag existants, téléphone obligatoire…). Migration
      // conservatrice v2 → v3 : on garde les données saisies, les nouveaux
      // champs démarrent à `undefined`.
      // v2 = pivot UX vers 4 écrans. v1 = ancien 6 étapes (reset complet).
      version: 3,
      partialize: (state) => ({
        currentScreen: state.currentScreen,
        data: state.data,
        quoteRequestId: state.quoteRequestId,
        submitted: state.submitted,
      }),
      migrate: (persistedState, fromVersion) => {
        // v1 → reset (forme trop différente).
        if (fromVersion < 2) {
          return {
            currentScreen: "entry",
            data: {},
            quoteRequestId: null,
            submitted: false,
          };
        }
        // v2 → v3 : rien à convertir, les nouveaux champs sont optionnels.
        return persistedState as {
          currentScreen: QuestionnaireScreen;
          data: QuestionnaireData;
          quoteRequestId: string | null;
          submitted: boolean;
        };
      },
    }
  )
);
