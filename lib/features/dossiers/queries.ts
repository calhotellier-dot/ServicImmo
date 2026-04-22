import { getCurrentUser } from "@/lib/features/auth/session";
import {
  getSupabaseServerClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";
import type { DossierRow, DossierStatus } from "@/lib/supabase/types";

export type DossiersListFilter = {
  search?: string;
  status?: DossierStatus;
  technicien_id?: string;
};

export async function listDossiers(
  filter: DossiersListFilter = {}
): Promise<{ dossiers: DossierRow[]; available: boolean }> {
  if (!hasServerSupabaseEnv()) return { dossiers: [], available: false };
  const user = await getCurrentUser();
  if (!user) return { dossiers: [], available: false };

  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("dossiers")
    .select("*")
    .eq("organization_id", user.profile.organization_id)
    .order("created_at", { ascending: false })
    .limit(500);

  if (filter.status) query = query.eq("status", filter.status);
  if (filter.technicien_id) query = query.eq("technicien_id", filter.technicien_id);
  if (filter.search) {
    const q = filter.search.replace(/[%_]/g, "");
    query = query.or(
      `reference.ilike.%${q}%,address.ilike.%${q}%,city.ilike.%${q}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("[listDossiers] error", error);
    return { dossiers: [], available: true };
  }
  return { dossiers: data ?? [], available: true };
}

export async function getDossier(id: string): Promise<DossierRow | null> {
  if (!hasServerSupabaseEnv()) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("dossiers")
    .select("*")
    .eq("id", id)
    .eq("organization_id", user.profile.organization_id)
    .single();
  return data ?? null;
}
