/**
 * POST /api/calculate
 *
 * Route stateless (ne touche pas la DB) qui reçoit l'état courant du
 * questionnaire et retourne :
 *   - la liste des diagnostics obligatoires
 *   - la liste des diagnostics à clarifier (Option B pour "je ne sais pas")
 *   - l'estimation tarifaire (fourchette + modulateurs appliqués)
 *
 * Utilisée par l'étape 6 (récapitulatif) AVANT soumission. Fonctionne même
 * sans Supabase configuré.
 */

import { NextResponse } from "next/server";

import { badRequest, fromZodError, ok, serverError } from "@/lib/api/responses";
import { calculateRequiredDiagnostics } from "@/lib/diagnostics/rules";
import { estimatePriceWithGrid, loadPricingGrid } from "@/lib/diagnostics/pricing";
import type { DiagnosticsResult, PriceEstimate, QuoteFormData } from "@/lib/diagnostics/types";
import { distanceFromToursKm } from "@/lib/geo/distance";
import { calculatePayloadSchema, type CalculatePayload } from "@/lib/validation/schemas";

type CalculateResponse = DiagnosticsResult & { estimate: PriceEstimate };

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Corps de requête JSON invalide");
  }

  const parsed = calculatePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return fromZodError(parsed.error);
  }

  try {
    const result = await computeCalculation(parsed.data);
    return ok<CalculateResponse>(result);
  } catch (err) {
    console.error("[/api/calculate] erreur inattendue", err);
    return serverError();
  }
}

// ---------------------------------------------------------------------------
// Pure computation (testable indépendamment)
// ---------------------------------------------------------------------------

async function computeCalculation(payload: CalculatePayload): Promise<CalculateResponse> {
  // On re-construit un QuoteFormData minimal suffisant pour les moteurs.
  // Les champs V2 (heating_mode, dependencies, existing_valid_diagnostics…)
  // sont ajoutés si présents dans le payload (schema élargi plus loin).
  const extra = payload as Partial<QuoteFormData>;
  const formData: QuoteFormData = {
    project_type: payload.project_type,
    property_type: payload.property_type,
    postal_code: payload.postal_code,
    surface: payload.surface,
    rooms_count: payload.rooms_count,
    is_coownership: payload.is_coownership,
    permit_date_range: payload.permit_date_range,
    heating_type: payload.heating_type,
    gas_installation: payload.gas_installation,
    gas_over_15_years: payload.gas_over_15_years,
    electric_over_15_years: payload.electric_over_15_years,
    rental_furnished: payload.rental_furnished,
    works_type: payload.works_type,
    heating_mode: extra.heating_mode,
    ecs_type: extra.ecs_type,
    dependencies: extra.dependencies,
    dependencies_converted: extra.dependencies_converted,
    existing_valid_diagnostics: extra.existing_valid_diagnostics,
    existing_diagnostics_files: extra.existing_diagnostics_files,
    tenants_in_place: extra.tenants_in_place,
    is_duplex: extra.is_duplex,
    is_top_floor: extra.is_top_floor,
  };

  const diagnostics = calculateRequiredDiagnostics(formData);
  const grid = await loadPricingGrid();

  const distance_km = distanceFromToursKm(payload.postal_code) ?? undefined;

  const estimate = estimatePriceWithGrid(grid, diagnostics.required, {
    surface: payload.surface,
    postal_code: payload.postal_code,
    property_type: payload.property_type,
    urgency: payload.urgency ?? null,
    heating_mode: extra.heating_mode,
    distance_km,
  });

  return { ...diagnostics, estimate };
}

// Exposé pour les tests unitaires optionnels (pas de tests en Session 2 sur
// cette route : le calcul est déjà testé via rules.test.ts et pricing.test.ts).
export const __test = { computeCalculation };

// Empêche la mise en cache statique — on veut toujours recalculer.
export const dynamic = "force-dynamic";
