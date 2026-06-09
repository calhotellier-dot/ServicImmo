import { getCurrentUser } from "@/lib/features/auth/session";
import {
  getSupabaseServerClient,
  getSupabaseServiceClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";
import type {
  DemandeDocumentsRow,
  DemandeItemRow,
  ModeleDemandeRow,
} from "@/lib/supabase/types";

export async function listDemandes(): Promise<{
  rows: DemandeDocumentsRow[];
  available: boolean;
}> {
  if (!hasServerSupabaseEnv()) return { rows: [], available: false };
  const user = await getCurrentUser();
  if (!user) return { rows: [], available: false };
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("demandes_documents")
    .select("*")
    .eq("organization_id", user.profile.organization_id)
    .order("created_at", { ascending: false });
  return { rows: data ?? [], available: true };
}

export async function listModeles(): Promise<ModeleDemandeRow[]> {
  if (!hasServerSupabaseEnv()) return [];
  const user = await getCurrentUser();
  if (!user) return [];
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("modeles_demande")
    .select("*")
    .eq("organization_id", user.profile.organization_id)
    .eq("is_active", true)
    .order("name");
  return data ?? [];
}

/** Pour le portail : résolution par token (service_role). */
export async function getDemandeByToken(
  token: string
): Promise<{ demande: DemandeDocumentsRow; items: DemandeItemRow[] } | null> {
  if (!hasServerSupabaseEnv()) return null;
  const admin = getSupabaseServiceClient();
  if (!admin) return null;
  const { data: demande } = await admin
    .from("demandes_documents")
    .select("*")
    .eq("access_token", token)
    .single();
  if (!demande) return null;
  const { data: items } = await admin
    .from("demande_items")
    .select("*")
    .eq("demande_id", demande.id)
    .order("order_index");
  return { demande, items: items ?? [] };
}
