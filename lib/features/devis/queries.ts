import { getCurrentUser } from "@/lib/features/auth/session";
import {
  getSupabaseServerClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";
import type {
  DevisLigneRow,
  DevisRow,
  FactureLigneRow,
  FactureRow,
} from "@/lib/supabase/types";

export async function listDevis(): Promise<{ rows: DevisRow[]; available: boolean }> {
  if (!hasServerSupabaseEnv()) return { rows: [], available: false };
  const user = await getCurrentUser();
  if (!user) return { rows: [], available: false };
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("devis")
    .select("*")
    .eq("organization_id", user.profile.organization_id)
    .order("created_at", { ascending: false })
    .limit(500);
  return { rows: data ?? [], available: true };
}

export async function listFactures(): Promise<{ rows: FactureRow[]; available: boolean }> {
  if (!hasServerSupabaseEnv()) return { rows: [], available: false };
  const user = await getCurrentUser();
  if (!user) return { rows: [], available: false };
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("factures")
    .select("*")
    .eq("organization_id", user.profile.organization_id)
    .order("created_at", { ascending: false })
    .limit(500);
  return { rows: data ?? [], available: true };
}

export async function getDevisWithLines(
  id: string
): Promise<{ devis: DevisRow; lignes: DevisLigneRow[] } | null> {
  if (!hasServerSupabaseEnv()) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await getSupabaseServerClient();
  const { data: devis } = await supabase
    .from("devis")
    .select("*")
    .eq("id", id)
    .eq("organization_id", user.profile.organization_id)
    .single();
  if (!devis) return null;
  const { data: lignes } = await supabase
    .from("devis_lignes")
    .select("*")
    .eq("devis_id", id)
    .order("order_index");
  return { devis, lignes: lignes ?? [] };
}

export async function getFactureWithLines(
  id: string
): Promise<{ facture: FactureRow; lignes: FactureLigneRow[] } | null> {
  if (!hasServerSupabaseEnv()) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await getSupabaseServerClient();
  const { data: facture } = await supabase
    .from("factures")
    .select("*")
    .eq("id", id)
    .eq("organization_id", user.profile.organization_id)
    .single();
  if (!facture) return null;
  const { data: lignes } = await supabase
    .from("facture_lignes")
    .select("*")
    .eq("facture_id", id)
    .order("order_index");
  return { facture, lignes: lignes ?? [] };
}

/** Pour le portail : lookup devis par accept_token (service role). */
export async function getDevisByAcceptToken(
  token: string
): Promise<{ devis: DevisRow; lignes: DevisLigneRow[] } | null> {
  if (!hasServerSupabaseEnv()) return null;
  const { getSupabaseServiceClient } = await import("@/lib/supabase/server");
  const admin = getSupabaseServiceClient();
  if (!admin) return null;
  const { data: devis } = await admin
    .from("devis")
    .select("*")
    .eq("accept_token", token)
    .single();
  if (!devis) return null;
  const { data: lignes } = await admin
    .from("devis_lignes")
    .select("*")
    .eq("devis_id", devis.id)
    .order("order_index");
  return { devis, lignes: lignes ?? [] };
}
