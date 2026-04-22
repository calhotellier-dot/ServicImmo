import { getCurrentUser } from "@/lib/features/auth/session";
import {
  getSupabaseServerClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";

export type StatsSnapshot = {
  available: boolean;
  dossiers: Array<{ status: string; created_at: string; technicien_id: string | null }>;
  factures: Array<{
    total_ttc: number;
    issued_at: string;
    status: string;
    invoice_type: string;
  }>;
  devis: Array<{ status: string; created_at: string }>;
  paiements: Array<{ amount: number; paid_at: string }>;
  rdvThisWeek: number;
};

export async function loadStatsSnapshot(): Promise<StatsSnapshot> {
  const empty: StatsSnapshot = {
    available: false,
    dossiers: [],
    factures: [],
    devis: [],
    paiements: [],
    rdvThisWeek: 0,
  };
  if (!hasServerSupabaseEnv()) return empty;
  const user = await getCurrentUser();
  if (!user) return empty;

  const supabase = await getSupabaseServerClient();
  const orgId = user.profile.organization_id;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // lundi
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const [dRes, fRes, qRes, pRes, rdvCnt] = await Promise.all([
    supabase
      .from("dossiers")
      .select("status, created_at, technicien_id")
      .eq("organization_id", orgId),
    supabase
      .from("factures")
      .select("total_ttc, issued_at, status, invoice_type")
      .eq("organization_id", orgId),
    supabase.from("devis").select("status, created_at").eq("organization_id", orgId),
    supabase
      .from("paiements")
      .select("amount, paid_at")
      .eq("organization_id", orgId),
    supabase
      .from("rendez_vous")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .gte("starts_at", weekStart.toISOString())
      .lt("starts_at", weekEnd.toISOString()),
  ]);

  return {
    available: true,
    dossiers: dRes.data ?? [],
    factures: fRes.data ?? [],
    devis: qRes.data ?? [],
    paiements: pRes.data ?? [],
    rdvThisWeek: rdvCnt.count ?? 0,
  };
}
