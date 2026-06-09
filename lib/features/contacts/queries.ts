/**
 * Queries côté serveur pour les contacts (Sprint 1).
 * À utiliser dans les Server Components.
 */

import { getCurrentUser } from "@/lib/features/auth/session";
import {
  getSupabaseServerClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";
import type { ContactRow } from "@/lib/supabase/types";

export type ContactsListFilter = {
  search?: string;
  type?: ContactRow["type"];
};

export async function listContacts(
  filter: ContactsListFilter = {}
): Promise<{ contacts: ContactRow[]; available: boolean }> {
  if (!hasServerSupabaseEnv()) return { contacts: [], available: false };
  const user = await getCurrentUser();
  if (!user) return { contacts: [], available: false };

  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("contacts")
    .select("*")
    .eq("organization_id", user.profile.organization_id)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(200);

  if (filter.type) query = query.eq("type", filter.type);
  if (filter.search) {
    const q = filter.search.replace(/[%_]/g, "");
    query = query.or(
      `last_name.ilike.%${q}%,first_name.ilike.%${q}%,company_name.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("[listContacts] error", error);
    return { contacts: [], available: true };
  }
  return { contacts: data ?? [], available: true };
}

export async function getContact(id: string): Promise<ContactRow | null> {
  if (!hasServerSupabaseEnv()) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .eq("organization_id", user.profile.organization_id)
    .single();

  return data ?? null;
}
