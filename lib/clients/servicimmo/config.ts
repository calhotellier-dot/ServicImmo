/**
 * Config cabinet Servicimmo.
 * Stub Sprint 0 — valeurs à valider avec le client au Sprint 1.
 * Source : MASTER-PLAN.md §0 (Tours, Indre-et-Loire).
 */

export const servicimmoConfig = {
  nom: "Servicimmo",
  raisonSociale: "Servicimmo",
  siret: "", // TODO Sprint 1 — demander à Servicimmo
  adresse: {
    ligne1: "",
    ligne2: "",
    codePostal: "37000",
    ville: "Tours",
    pays: "France",
  },
  contact: {
    telephone: "02 47 47 01 23",
    email: "contact@servicimmo.fr",
    emailDevis: "devis@servicimmo.fr",
  },
  iban: "", // TODO Sprint 1 — pour émission factures
  tvaIntracommunautaire: "", // TODO Sprint 1
  departementPrincipal: "37",
} as const;

export type ServicimmoConfig = typeof servicimmoConfig;
