"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/features/action-result";
import { getCurrentUser } from "@/lib/features/auth/session";
import {
  getSupabaseServerClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";
import type { DossierStatus } from "@/lib/supabase/types";

import { computeDossierCompletionRate } from "./completion";
import { dossierInputSchema, type DossierInput } from "./schema";

function err<T = undefined>(msg: string, fieldErrors?: Record<string, string>): ActionResult<T> {
  return { ok: false, error: msg, fieldErrors };
}

async function requireAuth() {
  if (!hasServerSupabaseEnv()) throw new Error("Service non configuré.");
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié.");
  return user;
}

// ---------------------------------------------------------------------------
// Create (retourne un brouillon vide, préparé pour le wizard)
// ---------------------------------------------------------------------------

export async function createDraftDossier(): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("dossiers")
      .insert({
        organization_id: user.profile.organization_id,
        status: "brouillon",
        completion_rate: 0,
      })
      .select("id")
      .single();
    if (error) return err(error.message);
    revalidatePath("/app/dossiers");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    return err((e as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Save (autosave wizard) — fusionne les données + recalcule completion_rate
// ---------------------------------------------------------------------------

export async function saveDossier(
  id: string,
  patch: DossierInput
): Promise<ActionResult<{ completionRate: number }>> {
  try {
    await requireAuth();
    const parsed = dossierInputSchema.safeParse(patch);
    if (!parsed.success) return err("Données invalides.");

    const supabase = await getSupabaseServerClient();

    // Charger l'état actuel pour merger + recalculer completion_rate
    const { data: current } = await supabase
      .from("dossiers")
      .select("*")
      .eq("id", id)
      .single();
    if (!current) return err("Dossier introuvable.");

    const merged = { ...current, ...parsed.data } as DossierInput;
    const completionRate = computeDossierCompletionRate(merged);

    const { error } = await supabase
      .from("dossiers")
      .update({
        ...parsed.data,
        completion_rate: completionRate,
      })
      .eq("id", id);

    if (error) return err(error.message);
    revalidatePath(`/app/dossiers/${id}`);
    revalidatePath("/app/dossiers");
    return { ok: true, data: { completionRate } };
  } catch (e) {
    return err((e as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Update status (drag & drop Kanban)
// ---------------------------------------------------------------------------

export async function updateDossierStatus(
  id: string,
  status: DossierStatus
): Promise<ActionResult> {
  try {
    await requireAuth();
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.from("dossiers").update({ status }).eq("id", id);
    if (error) return err(error.message);
    revalidatePath("/app/dossiers");
    revalidatePath(`/app/dossiers/${id}`);
    return { ok: true, data: undefined };
  } catch (e) {
    return err((e as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Recalcul (moteur core/diagnostics)
// ---------------------------------------------------------------------------

export async function recalculateDossier(id: string): Promise<ActionResult> {
  try {
    await requireAuth();
    const { calculateRequiredDiagnostics } = await import(
      "@/lib/core/diagnostics/rules"
    );
    const { estimatePriceWithGrid, loadPricingGrid } = await import(
      "@/lib/core/diagnostics/pricing"
    );
    const { distanceFromToursKm } = await import("@/lib/geo/distance");

    const supabase = await getSupabaseServerClient();
    const { data: d, error: fetchError } = await supabase
      .from("dossiers")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchError || !d) return err("Dossier introuvable.");

    // Mapping DossierRow → QuoteFormData pour le moteur (signatures compatibles).
    const form = {
      project_type: d.project_type ?? "other",
      property_type: d.property_type ?? "other",
      postal_code: d.postal_code ?? "",
      surface: d.surface ?? 0,
      rooms_count: d.rooms_count ?? 0,
      is_coownership: d.is_coownership,
      permit_date_range: d.permit_date_range ?? "unknown",
      heating_type: d.heating_type ?? "unknown",
      gas_installation: d.gas_installation ?? "none",
      gas_over_15_years: d.gas_over_15_years,
      electric_over_15_years: d.electric_over_15_years,
      rental_furnished: d.rental_furnished ?? undefined,
      works_type: d.works_type ?? undefined,
      heating_mode: d.heating_mode ?? undefined,
      ecs_type: (d.ecs_type as "same_as_heating" | "electric" | "gas" | "solar" | "other" | "unknown" | undefined) ?? undefined,
      dependencies: (d.dependencies as Array<"cave" | "garage" | "atelier" | "sous_sol" | "combles"> | null) ?? undefined,
      dependencies_converted: d.dependencies_converted,
      existing_valid_diagnostics:
        (d.existing_valid_diagnostics as Array<"dpe" | "lead" | "asbestos" | "gas" | "electric" | "termites" | "erp" | "carrez" | "boutin"> | null) ?? undefined,
      existing_diagnostics_files: Array.isArray(d.existing_diagnostics_files)
        ? (d.existing_diagnostics_files as string[])
        : undefined,
    } as Parameters<typeof calculateRequiredDiagnostics>[0];

    const diagnostics = calculateRequiredDiagnostics(form);
    const grid = await loadPricingGrid();
    const distance_km = distanceFromToursKm(d.postal_code ?? "") ?? undefined;
    const estimate = estimatePriceWithGrid(grid, diagnostics.required, {
      surface: d.surface ?? 0,
      postal_code: d.postal_code ?? "",
      property_type: (d.property_type as "house" | "apartment" | "building" | "commercial" | "common_areas" | "land" | "annex" | "other") ?? "other",
      urgency: null,
      heating_mode: d.heating_mode ?? undefined,
      distance_km,
    });

    const { error: updError } = await supabase
      .from("dossiers")
      .update({
        required_diagnostics: diagnostics.required,
        diagnostics_to_clarify: diagnostics.toClarify,
        price_min: estimate.min,
        price_max: estimate.max,
        applied_modulators: estimate.appliedModulators,
      })
      .eq("id", id);
    if (updError) return err(updError.message);

    revalidatePath(`/app/dossiers/${id}`);
    return { ok: true, data: undefined };
  } catch (e) {
    return err((e as Error).message);
  }
}
