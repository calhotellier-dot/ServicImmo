/**
 * Contact — particuliers + prescripteurs unifiés (Sprint 1, F-03).
 * Stub Sprint 0.
 */

export type ContactType = "particulier" | "agence" | "notaire" | "syndic" | "autre";

export type Contact = {
  id: string;
  type: ContactType;
  // À compléter Sprint 1
};
