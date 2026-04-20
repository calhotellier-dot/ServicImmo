/**
 * PATCH /api/quote-request/[id]
 *
 * Met à jour un brouillon de demande (typiquement après les étapes 4 et 5).
 * N'accepte pas la finalisation (status='submitted') — utiliser la route
 * `/submit` dédiée.
 *
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
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { updateQuotePayloadSchema } from "@/lib/validation/schemas";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return notConfigured("Supabase non configuré — mise à jour non enregistrée.");
  }

  const { id } = await context.params;
  if (!id) return badRequest("Identifiant manquant");

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return badRequest("Corps JSON invalide");
  }

  const parsed = updateQuotePayloadSchema.safeParse(raw);
  if (!parsed.success) return fromZodError(parsed.error);

  // Construction explicite du payload de mise à jour (on ne se contente pas
  // d'un `Object.fromEntries` à cause du typage strict de Supabase Update).
  const d = parsed.data;
  const updatePayload: Record<string, unknown> = {};
  if (d.permit_date_range !== undefined) updatePayload.permit_date_range = d.permit_date_range;
  if (d.heating_type !== undefined) updatePayload.heating_type = d.heating_type;
  if (d.gas_installation !== undefined) updatePayload.gas_installation = d.gas_installation;
  if (d.gas_over_15_years !== undefined) updatePayload.gas_over_15_years = d.gas_over_15_years;
  if (d.electric_over_15_years !== undefined)
    updatePayload.electric_over_15_years = d.electric_over_15_years;
  if (d.rental_furnished !== undefined) updatePayload.rental_furnished = d.rental_furnished;
  if (d.works_type !== undefined) updatePayload.works_type = d.works_type;
  if (d.urgency !== undefined) updatePayload.urgency = d.urgency;
  if (d.notes !== undefined) updatePayload.notes = d.notes;

  if (Object.keys(updatePayload).length === 0) {
    return badRequest("Aucun champ à mettre à jour");
  }

  const { data, error } = await supabase
    .from("quote_requests")
    // Cast nécessaire : `Record<string, unknown>` n'est pas compatible avec
    // le type `Update` ultra-strict généré par Supabase, mais chaque clé est
    // vérifiée individuellement ci-dessus et le Zod schema garantit les
    // valeurs.
    .update(updatePayload as never)
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) {
    // PGRST116 = no rows (PostgREST)
    if (error.code === "PGRST116") return notFound("Demande introuvable");
    console.error("[/api/quote-request/[id] PATCH] erreur", error);
    return serverError("Impossible de mettre à jour la demande.");
  }

  return ok({ id: data.id, status: data.status });
}

export const dynamic = "force-dynamic";
