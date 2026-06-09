/**
 * GET /api/pricing-rules
 *
 * Expose la grille tarifaire active (fusion DB + fallback code). Utilisée
 * par l'UI pour afficher des fourchettes indicatives sans recalculer côté
 * client. Fonctionne même si Supabase n'est pas provisionné (retour fallback).
 */

import { NextResponse } from "next/server";

import { ok } from "@/lib/api/responses";
import { loadPricingGrid } from "@/lib/core/diagnostics/pricing";

export async function GET(): Promise<NextResponse> {
  const grid = await loadPricingGrid();
  // Map → objet plat pour JSON.
  const serialized: Record<string, { min: number; max: number }> = {};
  for (const [key, value] of grid.entries()) {
    serialized[key] = value;
  }
  return ok({ rules: serialized });
}

export const dynamic = "force-dynamic";
// Cache HTTP 5 min côté edge si CDN, réduit la charge.
export const revalidate = 300;
