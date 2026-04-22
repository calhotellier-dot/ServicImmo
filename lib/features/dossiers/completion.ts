/**
 * Calcul du taux de complétion d'un dossier (F-09).
 *
 * Fonction pure — on compte les champs renseignés sur une liste pondérée.
 * Pondération : les champs critiques (adresse, surface, permis, contact)
 * valent plus que les champs annexes (notes, tags).
 */

import type { DossierInput } from "./schema";

type FieldWeight = {
  key: keyof DossierInput | "proprietaire_id" | "technicien_id";
  weight: number;
  /** Prédicat custom (par défaut : valeur définie et non-vide). */
  check?: (data: DossierInput) => boolean;
};

const FIELDS: FieldWeight[] = [
  { key: "project_type", weight: 3 },
  { key: "property_type", weight: 3 },
  { key: "address", weight: 3, check: (d) => !!d.address && d.address.length >= 5 },
  { key: "postal_code", weight: 2, check: (d) => !!d.postal_code && /^\d{5}$/.test(d.postal_code) },
  { key: "city", weight: 2 },
  { key: "surface", weight: 3, check: (d) => typeof d.surface === "number" && d.surface > 0 },
  { key: "rooms_count", weight: 1, check: (d) => typeof d.rooms_count === "number" },
  { key: "is_coownership", weight: 1, check: (d) => d.is_coownership !== undefined && d.is_coownership !== null },
  { key: "permit_date_range", weight: 3 },
  { key: "heating_type", weight: 1 },
  { key: "heating_mode", weight: 1 },
  { key: "gas_installation", weight: 1 },
  { key: "gas_over_15_years", weight: 1, check: (d) => d.gas_over_15_years !== undefined && d.gas_over_15_years !== null },
  { key: "electric_over_15_years", weight: 1, check: (d) => d.electric_over_15_years !== undefined && d.electric_over_15_years !== null },
  { key: "proprietaire_id", weight: 3, check: (d) => !!d.proprietaire_id },
  { key: "technicien_id", weight: 2, check: (d) => !!d.technicien_id },
  { key: "urgency", weight: 1 },
  { key: "requested_date", weight: 1 },
  { key: "notes", weight: 1, check: (d) => !!d.notes && d.notes.length >= 5 },
];

export function computeDossierCompletionRate(data: DossierInput): number {
  const total = FIELDS.reduce((acc, f) => acc + f.weight, 0);
  let filled = 0;
  for (const field of FIELDS) {
    if (field.check) {
      if (field.check(data)) filled += field.weight;
    } else {
      const v = (data as Record<string, unknown>)[field.key as string];
      if (v !== undefined && v !== null && v !== "") filled += field.weight;
    }
  }
  return Math.round((filled / total) * 100);
}
