"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { QuestionnaireModal } from "./QuestionnaireModal";

type QuoteModalContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const QuoteModalContext = createContext<QuoteModalContextValue | null>(null);

/** Fournit l'accès au modal devis à toute l'arborescence marketing. */
export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <QuoteModalContext.Provider value={{ open, close, isOpen }}>
      {children}
      <QuestionnaireModal open={isOpen} onClose={close} />
    </QuoteModalContext.Provider>
  );
}

/**
 * Hook pour ouvrir/fermer le modal devis depuis n'importe quel composant client
 * enfant de `<QuoteModalProvider>`.
 */
export function useQuoteModal(): QuoteModalContextValue {
  const ctx = useContext(QuoteModalContext);
  if (!ctx) {
    throw new Error("useQuoteModal doit être utilisé à l'intérieur de <QuoteModalProvider>");
  }
  return ctx;
}
