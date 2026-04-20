/**
 * Schémas Zod partagés client ↔ serveur.
 *
 * Un schéma par étape du questionnaire (validation progressive) + un schéma
 * global `fullQuoteSchema` pour la soumission finale.
 *
 * Ces schémas sont la seule source de vérité de la forme des données côté
 * frontend (React Hook Form) et backend (routes API).
 *
 * Les enums reprennent les valeurs textuelles des CHECK constraints SQL
 * (`supabase/migrations/0001_initial_schema.sql`) et des types de domaine
 * (`lib/diagnostics/types.ts`).
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums (alignés sur SQL + domaine)
// ---------------------------------------------------------------------------

export const projectTypeSchema = z.enum(["sale", "rental", "works", "coownership", "other"]);

export const propertyTypeSchema = z.enum([
  "house",
  "apartment",
  "building",
  "commercial",
  "common_areas",
  "land",
  "annex",
  "other",
]);

export const permitDateRangeSchema = z.enum([
  "before_1949",
  "1949_to_1997",
  "after_1997",
  "unknown",
]);

export const heatingTypeSchema = z.enum([
  "gas",
  "electric",
  "wood",
  "fuel",
  "heat_pump",
  "mixed",
  "unknown",
]);

export const gasInstallationSchema = z.enum([
  "none",
  "city_gas",
  "tank",
  "bottles",
  "meter_no_contract",
  "unknown",
]);

export const rentalFurnishedSchema = z.enum(["vide", "meuble", "saisonnier", "unknown"]);

export const worksTypeSchema = z.enum(["renovation", "demolition", "voirie", "other", "unknown"]);

export const urgencySchema = z.enum(["asap", "week", "two_weeks", "month", "flexible"]);

export const civilitySchema = z.enum(["mr", "mme", "other"]);

// ---------------------------------------------------------------------------
// Étapes
// ---------------------------------------------------------------------------

export const step1Schema = z.object({
  project_type: projectTypeSchema,
});

export const step2Schema = z.object({
  property_type: propertyTypeSchema,
  address: z.string().min(3, "Adresse trop courte"),
  postal_code: z.string().regex(/^\d{5}$/, "Code postal : 5 chiffres attendus"),
  city: z.string().min(1, "Ville requise"),
  surface: z
    .number({ invalid_type_error: "Surface numérique attendue" })
    .positive("Surface > 0")
    .max(10_000, "Surface improbable"),
  rooms_count: z.number({ invalid_type_error: "Nombre de pièces attendu" }).int().min(1).max(20),
  is_coownership: z.boolean().nullable(),
});

export const step3Schema = z.object({
  email: z.string().email("Format email invalide"),
});

export const step4Schema = z.object({
  permit_date_range: permitDateRangeSchema,
  heating_type: heatingTypeSchema,
  gas_installation: gasInstallationSchema,
  gas_over_15_years: z.boolean().nullable(),
  electric_over_15_years: z.boolean().nullable(),
  rental_furnished: rentalFurnishedSchema.optional(),
  works_type: worksTypeSchema.optional(),
});

export const step5Schema = z.object({
  urgency: urgencySchema,
  notes: z.string().max(2000, "2000 caractères max").optional(),
});

export const step6Schema = z.object({
  civility: civilitySchema,
  first_name: z.string().min(1, "Prénom requis"),
  last_name: z.string().min(1, "Nom requis"),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || v.replace(/\D/g, "").length >= 8, "Téléphone trop court (≥ 8 chiffres)"),
  // On ne peut pas utiliser `z.literal(true)` : ça force un type `true` très
  // strict côté React Hook Form (casse defaultValues=false). On valide via
  // `.refine`.
  consent_rgpd: z.boolean().refine((v) => v === true, {
    message: "Consentement RGPD requis",
  }),
});

// ---------------------------------------------------------------------------
// Schéma complet (pour submit)
// ---------------------------------------------------------------------------

export const fullQuoteSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema)
  .refine((data) => data.project_type !== "rental" || data.rental_furnished !== undefined, {
    message: "En location, le type de bail (vide / meublé / saisonnier) est requis.",
    path: ["rental_furnished"],
  })
  .refine((data) => data.project_type !== "works" || data.works_type !== undefined, {
    message: "Pour un projet de travaux, précisez le type d'intervention.",
    path: ["works_type"],
  });

// ---------------------------------------------------------------------------
// Types inférés (à utiliser dans l'UI et les API routes)
// ---------------------------------------------------------------------------

export type Step1Input = z.infer<typeof step1Schema>;
export type Step2Input = z.infer<typeof step2Schema>;
export type Step3Input = z.infer<typeof step3Schema>;
export type Step4Input = z.infer<typeof step4Schema>;
export type Step5Input = z.infer<typeof step5Schema>;
export type Step6Input = z.infer<typeof step6Schema>;
export type FullQuoteInput = z.infer<typeof fullQuoteSchema>;

/**
 * Schéma pour `/api/calculate` — on accepte un sous-ensemble minimal (sans
 * exiger les coordonnées finales). C'est le payload de preview en étape 6.
 */
export const calculatePayloadSchema = step1Schema
  .merge(step2Schema)
  .merge(step4Schema)
  .merge(
    z.object({
      urgency: urgencySchema.optional(),
    })
  );

export type CalculatePayload = z.infer<typeof calculatePayloadSchema>;

/**
 * Schéma pour le PATCH partiel des étapes 4 + 5 (update d'un draft).
 */
export const updateQuotePayloadSchema = step4Schema.merge(step5Schema).partial();

export type UpdateQuotePayload = z.infer<typeof updateQuotePayloadSchema>;
