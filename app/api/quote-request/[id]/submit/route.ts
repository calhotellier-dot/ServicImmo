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
import { estimatePrice } from "@/lib/diagnostics/pricing";
import type { QuoteFormData } from "@/lib/diagnostics/types";
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
  const formData: QuoteFormData = {
    project_type: parsed.data.project_type,
    property_type: parsed.data.property_type,
    postal_code: parsed.data.postal_code,
    surface: parsed.data.surface,
    rooms_count: parsed.data.rooms_count,
    is_coownership: parsed.data.is_coownership,
    permit_date_range: parsed.data.permit_date_range,
    heating_type: parsed.data.heating_type,
    gas_installation: parsed.data.gas_installation,
    gas_over_15_years: parsed.data.gas_over_15_years,
    electric_over_15_years: parsed.data.electric_over_15_years,
    rental_furnished: parsed.data.rental_furnished,
    works_type: parsed.data.works_type,
  };

  const diagnostics = calculateRequiredDiagnostics(formData);
  const estimate = estimatePrice(diagnostics.required, {
    surface: parsed.data.surface,
    postal_code: parsed.data.postal_code,
    property_type: parsed.data.property_type,
    urgency: parsed.data.urgency,
  });

  // --- Persist ------------------------------------------------------------
  const nowIso = new Date().toISOString();
  const updatePayload = {
    status: "submitted" as const,
    // Étape 2 (on réécrit pour couvrir les cas où le draft n'existait pas vraiment)
    project_type: parsed.data.project_type,
    property_type: parsed.data.property_type,
    address: parsed.data.address,
    postal_code: parsed.data.postal_code,
    city: parsed.data.city,
    surface: parsed.data.surface,
    rooms_count: parsed.data.rooms_count,
    is_coownership: parsed.data.is_coownership,
    // Étape 3
    email: parsed.data.email,
    // Étape 4
    permit_date_range: parsed.data.permit_date_range,
    heating_type: parsed.data.heating_type,
    gas_installation: parsed.data.gas_installation,
    gas_over_15_years: parsed.data.gas_over_15_years,
    electric_over_15_years: parsed.data.electric_over_15_years,
    rental_furnished: parsed.data.rental_furnished ?? null,
    works_type: parsed.data.works_type ?? null,
    // Étape 5
    urgency: parsed.data.urgency,
    notes: parsed.data.notes ?? null,
    // Étape 6
    civility: parsed.data.civility,
    first_name: parsed.data.first_name,
    last_name: parsed.data.last_name,
    phone: parsed.data.phone ?? null,
    // Consentement
    consent_rgpd: parsed.data.consent_rgpd,
    consent_at: nowIso,
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
