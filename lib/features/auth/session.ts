/**
 * Helpers côté serveur pour récupérer l'utilisateur courant + son profil
 * étendu (organisation_id, role) via `users_profiles`.
 *
 * Sprint 1 — F-02 auth admin.
 */

import {
  getSupabaseServerClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";
import type { UserProfileRow } from "@/lib/supabase/types";

export type SessionUser = {
  id: string;
  email: string;
  profile: UserProfileRow;
};

/**
 * Retourne l'utilisateur authentifié + son profil.
 * Retourne `null` si :
 *   - env Supabase absente (service non provisionné)
 *   - pas de session active
 *   - profil introuvable (compte auth créé mais pas encore rattaché à une org)
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!hasServerSupabaseEnv()) return null;

  const supabase = await getSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return null;

  const { data: profile } = await supabase
    .from("users_profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (!profile) return null;

  return {
    id: userData.user.id,
    email: userData.user.email ?? "",
    profile,
  };
}
