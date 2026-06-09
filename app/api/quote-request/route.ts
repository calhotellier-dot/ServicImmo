/**
 * POST /api/quote-request
 *
 * Crée un brouillon de demande de devis après l'étape 3 (capture email).
 * Body attendu : merge de step1 + step2 + step3 + tracking optionnel.
 *
 * Fail-fast 503 si Supabase n'est pas configuré (Session 2 mode offline).
 */

import { NextResponse } from "next/server";

import { badRequest, fromZodError, notConfigured, ok, serverError } from "@/lib/api/responses";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { QuoteRequestRow } from "@/lib/supabase/types";
import { step1Schema, step2Schema, step3Schema } from "@/lib/validation/schemas";
import { z } from "zod";

// Schéma accepté par ce endpoint : les 3 premières étapes + tracking optionnel.
const createDraftSchema = step1Schema.merge(step2Schema).merge(step3Schema).extend({
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  referer: z.string().optional(),
  user_agent: z.string().optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return notConfigured(
      "Supabase non configuré — la demande ne peut pas être enregistrée en base. " +
        "Vous pouvez continuer le questionnaire, vos données restent conservées localement."
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return badRequest("Corps JSON invalide");
  }

  const parsed = createDraftSchema.safeParse(raw);
  if (!parsed.success) return fromZodError(parsed.error);

  const now = new Date().toISOString();
  const insertPayload = {
    status: "email_captured" as const,
    project_type: parsed.data.project_type,
    property_type: parsed.data.property_type,
    address: parsed.data.address,
    postal_code: parsed.data.postal_code,
    city: parsed.data.city,
    surface: parsed.data.surface,
    rooms_count: parsed.data.rooms_count,
    is_coownership: parsed.data.is_coownership,
    email: parsed.data.email,
    email_captured_at: now,
    source: parsed.data.source ?? null,
    medium: parsed.data.medium ?? null,
    campaign: parsed.data.campaign ?? null,
    referer: parsed.data.referer ?? null,
    user_agent: parsed.data.user_agent ?? null,
  };

  const { data, error } = await supabase
    .from("quote_requests")
    .insert(insertPayload)
    .select("id")
    .single<Pick<QuoteRequestRow, "id">>();

  if (error) {
    console.error("[/api/quote-request] insert error", error);
    return serverError("Impossible d'enregistrer la demande.");
  }

  return ok({ id: data.id }, { status: 201 });
}

export const dynamic = "force-dynamic";
