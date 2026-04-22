import { z } from "zod";

/**
 * Schémas Zod pour la feature dossiers (Sprint 2 — F-05/06).
 * L'input du wizard reprend en grande partie celui du questionnaire public
 * V2 (cf. `lib/validation/schemas.ts`) — on réutilise les mêmes enums.
 */

export const dossierStatusSchema = z.enum([
  "brouillon",
  "a_planifier",
  "planifie",
  "en_cours",
  "realise",
  "en_facturation",
  "facture",
  "paye",
  "archive",
  "annule",
]);

/** Input du wizard — tous les champs sont optionnels (brouillon autosave). */
export const dossierInputSchema = z.object({
  project_type: z.enum(["sale", "rental", "works", "coownership", "other"]).optional(),
  property_type: z
    .enum([
      "house",
      "apartment",
      "building",
      "commercial",
      "common_areas",
      "land",
      "annex",
      "other",
    ])
    .optional(),
  address: z.string().max(300).optional(),
  address_line2: z.string().max(200).optional(),
  postal_code: z
    .string()
    .refine((v) => !v || /^\d{5}$/.test(v), "CP : 5 chiffres")
    .optional(),
  city: z.string().max(120).optional(),
  surface: z.number().positive().max(10_000).optional(),
  rooms_count: z.number().int().min(0).max(50).optional(),
  is_coownership: z.boolean().nullable().optional(),
  permit_date_range: z
    .enum(["before_1949", "1949_to_1997", "after_1997", "unknown"])
    .optional(),
  heating_type: z
    .enum(["gas", "electric", "wood", "fuel", "heat_pump", "mixed", "unknown"])
    .optional(),
  heating_mode: z.enum(["individual", "collective", "unknown"]).optional(),
  ecs_type: z
    .enum(["same_as_heating", "electric", "gas", "solar", "other", "unknown"])
    .optional(),
  gas_installation: z
    .enum(["none", "city_gas", "tank", "bottles", "meter_no_contract", "unknown"])
    .optional(),
  gas_over_15_years: z.boolean().nullable().optional(),
  electric_over_15_years: z.boolean().nullable().optional(),
  rental_furnished: z.enum(["vide", "meuble", "saisonnier", "unknown"]).optional(),
  works_type: z
    .enum(["renovation", "demolition", "voirie", "other", "unknown"])
    .optional(),
  cooktop_connection: z.enum(["souple", "rigide", "unknown"]).optional(),

  residence_name: z.string().max(200).optional(),
  floor: z.number().int().min(-5).max(100).optional(),
  is_top_floor: z.boolean().nullable().optional(),
  door_number: z.string().max(20).optional(),
  is_duplex: z.boolean().nullable().optional(),

  dependencies: z.array(z.string()).max(20).optional(),
  dependencies_converted: z.boolean().nullable().optional(),
  cadastral_reference: z.string().max(100).optional(),
  purchase_date: z
    .string()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Date : format YYYY-MM-DD")
    .optional(),

  commercial_activity: z.string().max(200).optional(),
  heated_zones_count: z.number().int().min(0).max(50).optional(),
  configuration_notes: z.string().max(2000).optional(),

  tenants_in_place: z.boolean().nullable().optional(),
  access_notes: z.string().max(1000).optional(),
  syndic_contact: z.string().max(500).optional(),

  proprietaire_id: z.string().uuid().nullable().optional(),
  prescripteur_id: z.string().uuid().nullable().optional(),
  technicien_id: z.string().uuid().nullable().optional(),

  existing_valid_diagnostics: z.array(z.string()).max(20).optional(),
  existing_diagnostics_files: z.array(z.string().url()).optional(),

  urgency: z.string().max(40).optional(),
  notes: z.string().max(5000).optional(),
  requested_date: z
    .string()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Date : format YYYY-MM-DD")
    .optional(),

  tags: z.array(z.string().max(40)).max(20).optional(),
});

export type DossierInput = z.infer<typeof dossierInputSchema>;
