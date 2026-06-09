"use server";

/**
 * Server Actions CRUD contacts (Sprint 1 — F-03).
 *
 * Toutes les mutations passent par le client Supabase de session (anon key +
 * cookies RLS) : chaque utilisateur est scopé à son `organization_id` via les
 * policies de la migration 0003.
 *
 * Fail-soft si l'env Supabase est absente : retourne `{ ok: false, error }`,
 * l'UI affiche un message explicite sans crash.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/lib/features/action-result";
import { getCurrentUser } from "@/lib/features/auth/session";
import {
  getSupabaseServerClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";

import { parseContactsCsv } from "./csv";
import { contactInputSchema, type ContactInput } from "./schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function err<T = undefined>(
  msg: string,
  fieldErrors?: Record<string, string>
): ActionResult<T> {
  return { ok: false, error: msg, fieldErrors };
}

function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

function fromZod<T = undefined>(zerr: z.ZodError): ActionResult<T> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of zerr.issues) {
    const k = issue.path.join(".") || "_form";
    fieldErrors[k] = issue.message;
  }
  return { ok: false, error: "Données invalides.", fieldErrors };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function requireAuth() {
  if (!hasServerSupabaseEnv()) {
    throw new Error("Service non configuré — Supabase non provisionné.");
  }
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié.");
  return user;
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createContact(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    return err((e as Error).message);
  }

  const payload = formDataToInput(formData);
  const parsed = contactInputSchema.safeParse(payload);
  if (!parsed.success) return fromZod(parsed.error);

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      ...parsed.data,
      email: parsed.data.email || null,
      organization_id: user.profile.organization_id,
    })
    .select("id")
    .single();

  if (error) return err(error.message);
  revalidatePath("/app/contacts");
  return ok({ id: data.id });
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateContact(
  id: string,
  input: ContactInput
): Promise<ActionResult> {
  try {
    await requireAuth();
  } catch (e) {
    return err((e as Error).message);
  }
  const parsed = contactInputSchema.safeParse(input);
  if (!parsed.success) return fromZod(parsed.error);

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("contacts")
    .update({
      ...parsed.data,
      email: parsed.data.email || null,
    })
    .eq("id", id);

  if (error) return err(error.message);
  revalidatePath("/app/contacts");
  revalidatePath(`/app/contacts/${id}`);
  return ok(undefined);
}

// ---------------------------------------------------------------------------
// Delete (soft — archived_at)
// ---------------------------------------------------------------------------

export async function archiveContact(id: string): Promise<ActionResult> {
  try {
    await requireAuth();
  } catch (e) {
    return err((e as Error).message);
  }
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("contacts")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return err(error.message);
  revalidatePath("/app/contacts");
  return ok(undefined);
}

// ---------------------------------------------------------------------------
// Import CSV
// ---------------------------------------------------------------------------

export async function importContactsCsv(
  _prev: ActionResult<{ imported: number; skipped: number; errors: number }> | null,
  formData: FormData
): Promise<ActionResult<{ imported: number; skipped: number; errors: number }>> {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    return err((e as Error).message);
  }
  const file = formData.get("file");
  if (!(file instanceof File)) return err("Aucun fichier fourni.");

  const text = await file.text();
  const result = parseContactsCsv(text);
  if (result.deduped.length === 0) {
    return err(
      `Aucune ligne valide. ${result.errors.length} erreur(s) détectée(s).`
    );
  }

  const supabase = await getSupabaseServerClient();
  const rows = result.deduped.map((r) => ({
    organization_id: user.profile.organization_id,
    type: r.type,
    first_name: r.first_name ?? null,
    last_name: r.last_name ?? null,
    company_name: r.company_name ?? null,
    email: r.email || null,
    phone: r.phone ?? null,
    postal_code: r.postal_code ?? null,
    city: r.city ?? null,
  }));

  const { error, count } = await supabase
    .from("contacts")
    .insert(rows, { count: "exact" });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/app/contacts");
  return {
    ok: true,
    data: {
      imported: count ?? rows.length,
      skipped: result.rows.length - result.deduped.length,
      errors: result.errors.length,
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formDataToInput(fd: FormData): Partial<ContactInput> {
  const get = (k: string) => {
    const v = fd.get(k);
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
  };
  const tagsRaw = fd.get("tags");
  const tags =
    typeof tagsRaw === "string" && tagsRaw.trim()
      ? tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

  return {
    type: get("type") as ContactInput["type"],
    civility: (get("civility") as ContactInput["civility"]) ?? null,
    first_name: get("first_name"),
    last_name: get("last_name"),
    company_name: get("company_name"),
    siret: get("siret"),
    email: get("email"),
    phone: get("phone"),
    phone_alt: get("phone_alt"),
    address_line1: get("address_line1"),
    address_line2: get("address_line2"),
    postal_code: get("postal_code"),
    city: get("city"),
    country: get("country"),
    notes: get("notes"),
    tags,
  };
}
