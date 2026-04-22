/**
 * Paiement — Sprint 5 (F-19, F-20).
 * Stripe Checkout + réconciliation manuelle (virement, chèque).
 * Stub Sprint 0.
 */

export type PaiementMethode = "stripe" | "virement" | "cheque" | "especes";

export type Paiement = {
  id: string;
  methode: PaiementMethode;
  // À compléter Sprint 5
};
