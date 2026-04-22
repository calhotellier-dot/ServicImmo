/**
 * POST /api/quote-request/[id]/submit
 *
 * Finalise une demande :
 *   1. Valide le payload complet via `fullQuoteSchema`.
 *   2. Calcule les diagnostics obligatoires et l'estimation de prix.
 *   3. Update la ligne `quote_requests` : status='submitted', consent_at,
 *      diagnostics calculés, fourchette figée, modulateurs appliqués.
 *
 * En Session 3 : déclenchera aussi l'envoi d'email (Resend).
 * Fail-fast 503 si Supabase non configuré.
 */

import { NextResponse } from "next/server";

import {
  badRequest,
  fromZodError,
  notConfigured,
  notFound,
  ok,
  serverError,
} from "@/lib/api/responses";
import { calculateRequiredDiagnostics } from "@/lib/diagnostics/rules";
import { estimatePriceWithGrid, loadPricingGrid } from "@/lib/diagnostics/pricing";
import type { QuoteFormData } from "@/lib/diagnostics/types";
import { distanceFromToursKm } from "@/lib/geo/distance";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { fullQuoteSchema } from "@/lib/validation/schemas";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return notConfigured(
      "Supabase non configuré — la soumission ne peut pas être finalisée en base."
    );
  }

  const { id } = await context.params;
  if (!id) return badRequest("Identifiant manquant");

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return badRequest("Corps JSON invalide");
  }

  const parsed = fullQuoteSchema.safeParse(raw);
  if (!parsed.success) return fromZodError(parsed.error);

  // --- Calculs ------------------------------------------------------------
  const d = parsed.data;
  const formData: QuoteFormData = {
    project_type: d.project_type,
    property_type: d.property_type,
    postal_code: d.postal_code,
    surface: d.surface,
    rooms_count: d.rooms_count,
    is_coownership: d.is_coownership,
    permit_date_range: d.permit_date_range,
    heating_type: d.heating_type,
    gas_installation: d.gas_installation,
    gas_over_15_years: d.gas_over_15_years,
    electric_over_15_years: d.electric_over_15_years,
    rental_furnished: d.rental_furnished,
    works_type: d.works_type,
    heating_mode: d.heating_mode,
    ecs_type: d.ecs_type,
    dependencies: d.dependencies,
    dependencies_converted: d.dependencies_converted,
    existing_valid_diagnostics: d.existing_valid_diagnostics,
    existing_diagnostics_files: d.existing_diagnostics_files,
    tenants_in_place: d.tenants_in_place,
    is_duplex: d.is_duplex,
    is_top_floor: d.is_top_floor,
  };

  const diagnostics = calculateRequiredDiagnostics(formData);
  const grid = await loadPricingGrid();
  const distance_km = distanceFromToursKm(d.postal_code) ?? undefined;
  const estimate = estimatePriceWithGrid(grid, diagnostics.required, {
    surface: d.surface,
    postal_code: d.postal_code,
    property_type: d.property_type,
    urgency: d.urgency,
    heating_mode: d.heating_mode,
    distance_km,
  });

  // --- Persist ------------------------------------------------------------
  const nowIso = new Date().toISOString();
  const updatePayload = {
    status: "submitted" as const,
    // Étape 2
    project_type: d.project_type,
    property_type: d.property_type,
    address: d.address,
    postal_code: d.postal_code,
    city: d.city,
    surface: d.surface,
    rooms_count: d.rooms_count,
    is_coownership: d.is_coownership,
    // Étape 3
    email: d.email,
    // Étape 4
    permit_date_range: d.permit_date_range,
    heating_type: d.heating_type,
    gas_installation: d.gas_installation,
    gas_over_15_years: d.gas_over_15_years,
    electric_over_15_years: d.electric_over_15_years,
    rental_furnished: d.rental_furnished ?? null,
    works_type: d.works_type ?? null,
    // Étape 5
    urgency: d.urgency,
    notes: d.notes ?? null,
    // Étape 6
    civility: d.civility,
    first_name: d.first_name,
    last_name: d.last_name,
    phone: d.phone,
    // Consentement
    consent_rgpd: d.consent_rgpd,
    consent_at: nowIso,
    // V2 — rappel téléphone
    heating_mode: d.heating_mode ?? null,
    ecs_type: d.ecs_type ?? null,
    syndic_contact: d.syndic_contact ?? null,
    dependencies: d.dependencies ?? null,
    dependencies_converted: d.dependencies_converted ?? null,
    existing_valid_diagnostics: d.existing_valid_diagnostics ?? null,
    existing_diagnostics_files: d.existing_diagnostics_files ?? [],
    tenants_in_place: d.tenants_in_place ?? null,
    access_notes: d.access_notes ?? null,
    referral_source: d.referral_source ?? null,
    referral_other: d.referral_other ?? null,
    residence_name: d.residence_name ?? null,
    floor: d.floor ?? null,
    is_top_floor: d.is_top_floor ?? null,
    door_number: d.door_number ?? null,
    is_duplex: d.is_duplex ?? null,
    purchase_date: d.purchase_date ?? null,
    cooktop_connection: d.cooktop_connection ?? null,
    cadastral_reference: d.cadastral_reference ?? null,
    commercial_activity: d.commercial_activity ?? null,
    heated_zones_count: d.heated_zones_count ?? null,
    configuration_notes: d.configuration_notes ?? null,
    preferred_payment_method: d.preferred_payment_method ?? null,
    distance_km: distance_km ?? null,
    // Résultat calculé
    required_diagnostics: diagnostics.required,
    diagnostics_to_clarify: diagnostics.toClarify,
    price_min: estimate.min,
    price_max: estimate.max,
    applied_modulators: estimate.appliedModulators,
  };

  const { data, error } = await supabase
    .from("quote_requests")
    .update(updatePayload)
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) {
    if (error.code === "PGRST116") return notFound("Demande introuvable");
    console.error("[/api/quote-request/[id]/submit] erreur update", error);
    return serverError("Impossible de finaliser la demande.");
  }

  // TODO Session 3 : envoyer emails client + interne via Resend.

  return ok({
    id: data.id,
    status: data.status,
    diagnostics,
    estimate,
  });
}

export const dynamic = "force-dynamic";
