/**
 * Chargement du snapshot statistiques depuis Supabase.
 * Retourne des tableaux vides si la base n'est pas disponible
 * (mode dégradé pour le dashboard).
 */

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type StatsSnapshot = {
  dossiers: Array<{
    status: string;
    created_at: string;
    technicien_id: string | null;
  }>;
  factures: Array<{
    total_ttc: number;
    issued_at: string;
    status: string;
    invoice_type: string;
  }>;
  devis: Array<{ status: string; created_at: string }>;
  paiements: Array<{ amount: number; paid_at: string }>;
  rdvThisWeek: number;
  available: boolean;
};

const EMPTY: StatsSnapshot = {
  dossiers: [],
  factures: [],
  devis: [],
  paiements: [],
  rdvThisWeek: 0,
  available: false,
};

export async function loadStatsSnapshot(): Promise<StatsSnapshot> {
  try {
    const supabase = await getSupabaseServerClient();

    const [dossiersRes, facturesRes, devisRes, paiementsRes] = await Promise.all([
      supabase
        .from("dossiers")
        .select("status, created_at, technicien_id"),
      supabase
        .from("factures")
        .select("total_ttc, issued_at, status, invoice_type"),
      supabase
        .from("devis")
        .select("status, created_at"),
      supabase
        .from("paiements")
        .select("amount, paid_at"),
    ]);

    if (
      dossiersRes.error ||
      facturesRes.error ||
      devisRes.error ||
      paiementsRes.error
    ) {
      return EMPTY;
    }

    return {
      dossiers: dossiersRes.data ?? [],
      factures: facturesRes.data ?? [],
      devis: devisRes.data ?? [],
      paiements: paiementsRes.data ?? [],
      rdvThisWeek: 0,
      available: true,
    };
  } catch {
    return EMPTY;
  }
}
