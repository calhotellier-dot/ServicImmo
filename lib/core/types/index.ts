/**
 * Barrel des types métier du core.
 * Import direct recommandé :
 *   import type { Dossier } from '@/lib/core/types/dossier';
 * Ou via barrel si plusieurs types d'un coup :
 *   import type { Dossier, Devis, Facture } from '@/lib/core/types';
 */

export type { Dossier } from "./dossier";
export type { Devis, DevisLigne } from "./devis";
export type { Facture, FactureLigne } from "./facture";
export type { Contact, ContactType } from "./contact";
export type { RendezVous } from "./rendez-vous";
export type { Paiement, PaiementMethode } from "./paiement";
export type {
  DemandeDocuments,
  DemandeItem,
  ModeleDemande,
} from "./demande-documents";
