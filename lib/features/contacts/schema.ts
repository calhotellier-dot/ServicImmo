import { z } from "zod";

/**
 * Schémas Zod pour la feature contacts (Sprint 1 — F-03).
 */

export const contactTypeSchema = z.enum([
  "particulier",
  "agence",
  "notaire",
  "syndic",
  "autre",
]);

export const civilitySchema = z.enum(["mr", "mme", "other"]);

/** Création / mise à jour d'un contact via le formulaire admin. */
export const contactInputSchema = z
  .object({
    type: contactTypeSchema,
    civility: civilitySchema.nullable().optional(),
    first_name: z.string().max(120).optional(),
    last_name: z.string().max(120).optional(),
    company_name: z.string().max(200).optional(),
    siret: z
      .string()
      .refine((v) => !v || /^\d{14}$/.test(v.replace(/\s/g, "")), "SIRET : 14 chiffres attendus")
      .optional(),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    phone: z.string().max(40).optional(),
    phone_alt: z.string().max(40).optional(),
    address_line1: z.string().max(200).optional(),
    address_line2: z.string().max(200).optional(),
    postal_code: z
      .string()
      .refine((v) => !v || /^\d{5}$/.test(v), "Code postal : 5 chiffres")
      .optional(),
    city: z.string().max(120).optional(),
    country: z.string().max(80).optional(),
    notes: z.string().max(5000).optional(),
    tags: z.array(z.string().max(40)).max(20).optional(),
  })
  .superRefine((data, ctx) => {
    // Particulier → au moins un nom ; prescripteur → company_name requis
    if (data.type === "particulier") {
      if (!data.first_name && !data.last_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["last_name"],
          message: "Prénom ou nom requis pour un particulier.",
        });
      }
    } else {
      if (!data.company_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["company_name"],
          message: "Raison sociale requise pour un prescripteur.",
        });
      }
    }
  });

export type ContactInput = z.infer<typeof contactInputSchema>;

/** Ligne d'un CSV d'import de contacts (format minimal). */
export const contactCsvRowSchema = z.object({
  type: contactTypeSchema,
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  company_name: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
});

export type ContactCsvRow = z.infer<typeof contactCsvRowSchema>;
