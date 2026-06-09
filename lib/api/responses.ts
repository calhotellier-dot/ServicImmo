/**
 * Helpers de réponse HTTP uniformes pour les routes API.
 *
 * Convention :
 * - 200 `ok`        : succès, `data` dans le body
 * - 400 `badRequest`: validation échouée (Zod flatten dans `errors`)
 * - 404 `notFound`  : ressource absente
 * - 503 `notConfigured` : prérequis d'environnement manquant (ex: Supabase non provisionné en Session 2)
 * - 500 `serverError`: erreur inattendue
 */

import { NextResponse } from "next/server";
import type { ZodError } from "zod";

type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = {
  ok: false;
  error: string;
  code?: string;
  issues?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T, init?: ResponseInit): NextResponse<ApiResponse<T>> {
  return NextResponse.json<ApiResponse<T>>({ ok: true, data }, init);
}

export function badRequest(error: string, issues?: unknown): NextResponse<ApiResponse<never>> {
  return NextResponse.json<ApiResponse<never>>(
    { ok: false, error, code: "bad_request", issues },
    { status: 400 }
  );
}

export function fromZodError(err: ZodError): NextResponse<ApiResponse<never>> {
  return badRequest("Validation échouée", err.flatten());
}

export function notFound(error = "Ressource introuvable"): NextResponse<ApiResponse<never>> {
  return NextResponse.json<ApiResponse<never>>(
    { ok: false, error, code: "not_found" },
    { status: 404 }
  );
}

export function notConfigured(
  error = "Service indisponible : configuration Supabase manquante."
): NextResponse<ApiResponse<never>> {
  return NextResponse.json<ApiResponse<never>>(
    { ok: false, error, code: "not_configured" },
    { status: 503 }
  );
}

export function serverError(error = "Erreur serveur"): NextResponse<ApiResponse<never>> {
  return NextResponse.json<ApiResponse<never>>(
    { ok: false, error, code: "server_error" },
    { status: 500 }
  );
}
