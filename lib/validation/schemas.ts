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

// ── Extensions V2 "rappel téléphone" ────────────────────────────────────────

export const heatingModeSchema = z.enum(["individual", "collective", "unknown"]);

export const ecsTypeSchema = z.enum([
  "same_as_heating",
  "electric",
  "gas",
  "solar",
  "other",
  "unknown",
]);

export const referralSourceSchema = z.enum([
  "particulier",
  "agence",
  "notaire",
  "syndic",
  "recommandation",
  "autre",
]);

export const cooktopConnectionSchema = z.enum(["souple", "rigide", "unknown"]);

export const paymentMethodSchema = z.enum(["cb", "chq", "esp", "virt"]);

export const dependencySchema = z.enum(["cave", "garage", "atelier", "sous_sol", "combles"]);

export const existingDiagnosticIdSchema = z.enum([
  "dpe",
  "lead",
  "asbestos",
  "gas",
  "electric",
  "termites",
  "erp",
  "carrez",
  "boutin",
]);

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

  // Dépendances (optionnelles — peu de biens en ont)
  dependencies: z.array(dependencySchema).optional(),
  dependencies_converted: z.boolean().nullable().optional(),

  // Appartement (optionnels, validés conditionnellement dans fullQuoteSchema)
  residence_name: z.string().max(200).optional(),
  floor: z.number().int().min(-5).max(100).optional(),
  is_top_floor: z.boolean().nullable().optional(),
  door_number: z.string().max(20).optional(),
  is_duplex: z.boolean().nullable().optional(),

  // Divers
  purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  cadastral_reference: z.string().max(100).optional(),

  // Commercial / tertiaire
  commercial_activity: z.string().max(200).optional(),
  heated_zones_count: z.number().int().min(0).max(50).optional(),
  configuration_notes: z.string().max(2000).optional(),
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

  // ── Extensions V2 ────────────────────────────────────────────────────────
  heating_mode: heatingModeSchema.optional(),
  ecs_type: ecsTypeSchema.optional(),
  syndic_contact: z.string().max(500).optional(),
  cooktop_connection: cooktopConnectionSchema.optional(),
});

export const step5Schema = z.object({
  urgency: urgencySchema,
  notes: z.string().max(2000, "2000 caractères max").optional(),
  referral_source: referralSourceSchema.optional(),
  referral_other: z.string().max(200).optional(),
  // Diagnostics déjà en cours de validité
  existing_valid_diagnostics: z.array(existingDiagnosticIdSchema).optional(),
  existing_diagnostics_files: z.array(z.string().url()).optional(),
});

export const step6Schema = z.object({
  civility: civilitySchema,
  first_name: z.string().min(1, "Prénom requis"),
  last_name: z.string().min(1, "Nom requis"),
  // V2 : téléphone désormais **obligatoire** — automatisation du rappel ops.
  phone: z
    .string()
    .min(1, "Téléphone requis")
    .refine((v) => v.replace(/\D/g, "").length >= 8, "Téléphone trop court (≥ 8 chiffres)"),
  // Accès au bien (collectés dans l'accordéon "Contact & accès" du Filling)
  access_notes: z.string().max(1000).optional(),
  tenants_in_place: z.boolean().nullable().optional(),
  // Mode de règlement préféré (info ops)
  preferred_payment_method: paymentMethodSchema.optional(),
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
  .superRefine((data, ctx) => {
    // Branche location → type de bail requis
    if (data.project_type === "rental" && data.rental_furnished === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rental_furnished"],
        message: "En location, le type de bail (vide / meublé / saisonnier) est requis.",
      });
    }
    // Branche travaux → type de chantier requis
    if (data.project_type === "works" && data.works_type === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["works_type"],
        message: "Pour un projet de travaux, précisez le type d'intervention.",
      });
    }
    // Appartement → étage requis
    if (data.property_type === "apartment") {
      if (data.floor === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["floor"],
          message: "Précisez l'étage de l'appartement.",
        });
      }
    }
    // Commercial → activité requise
    if (data.property_type === "commercial" && !data.commercial_activity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commercial_activity"],
        message: "Précisez l'activité exercée dans le local.",
      });
    }
    // Gaz présent → raccordement table de cuisson requis
    if (
      data.gas_installation &&
      data.gas_installation !== "none" &&
      data.gas_installation !== "unknown" &&
      !data.cooktop_connection
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cooktop_connection"],
        message: "Précisez le type de raccordement de la table de cuisson.",
      });
    }
    // Source "autre" → précision requise
    if (data.referral_source === "autre" && !data.referral_other) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["referral_other"],
        message: "Précisez la source du contact.",
      });
    }
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
      // V2 : diagnostics déjà valides + pièces jointes client (pour le filtre
      // des required dans le moteur de règles).
      existing_valid_diagnostics: z.array(existingDiagnosticIdSchema).optional(),
      existing_diagnostics_files: z.array(z.string().url()).optional(),
      tenants_in_place: z.boolean().nullable().optional(),
    })
  );

export type CalculatePayload = z.infer<typeof calculatePayloadSchema>;

/**
 * Schéma pour le PATCH partiel des étapes 4 + 5 (update d'un draft).
 */
export const updateQuotePayloadSchema = step4Schema.merge(step5Schema).partial();

export type UpdateQuotePayload = z.infer<typeof updateQuotePayloadSchema>;
