"use server";

import { randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/features/action-result";
import { getCurrentUser } from "@/lib/features/auth/session";
import {
  getSupabaseServerClient,
  getSupabaseServiceClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";
import type { DemandeItemType } from "@/lib/supabase/types";

function err<T = undefined>(msg: string): ActionResult<T> {
  return { ok: false, error: msg };
}

async function requireAuth() {
  if (!hasServerSupabaseEnv()) throw new Error("Service non configuré.");
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié.");
  return user;
}

type NewItem = {
  item_type: DemandeItemType;
  label: string;
  description?: string;
  required?: boolean;
};

/** Crée une demande depuis un modèle (ou items custom) et l'envoie. */
export async function createDemande(input: {
  dossier_id?: string;
  recipient_email: string;
  recipient_name?: string;
  message?: string;
  due_date?: string;
  items: NewItem[];
  modele_id?: string;
}): Promise<ActionResult<{ id: string; portalUrl: string }>> {
  try {
    const user = await requireAuth();
    if (!input.items.length) return err("Ajoutez au moins un item.");

    const supabase = await getSupabaseServerClient();

    const { data: ref } = await (supabase.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>
    ) => Promise<{ data: string | null; error: unknown }>)(
      "generate_demande_reference",
      { org_id: user.profile.organization_id }
    );

    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: demande, error } = await supabase
      .from("demandes_documents")
      .insert({
        organization_id: user.profile.organization_id,
        dossier_id: input.dossier_id ?? null,
        reference: ref ?? null,
        status: "envoye",
        recipient_email: input.recipient_email,
        recipient_name: input.recipient_name ?? null,
        access_token: token,
        access_token_expires_at: expiresAt,
        message: input.message ?? null,
        due_date: input.due_date ?? null,
        sent_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) return err(error.message);

    const items = input.items.map((it, i) => ({
      demande_id: demande.id,
      order_index: i,
      item_type: it.item_type,
      label: it.label,
      description: it.description ?? null,
      required: it.required ?? true,
      status: "pending" as const,
    }));
    const { error: itemsErr } = await supabase.from("demande_items").insert(items);
    if (itemsErr) return err(itemsErr.message);

    const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const portalUrl = `${base}/portail/${token}/demande/${demande.id}`;

    // Envoi email (fail-soft)
    const { getResend, hasResendEnv, getEmailFrom } = await import("@/lib/resend/client");
    if (hasResendEnv()) {
      const r = getResend();
      await r?.emails.send({
        from: getEmailFrom(),
        to: input.recipient_email,
        subject: `Demande de documents ${ref ?? ""}`,
        html: `<div style="font-family:system-ui,sans-serif;max-width:560px;padding:24px;">
          <h2>Demande de documents Servicimmo</h2>
          ${input.message ? `<p>${escapeHtml(input.message)}</p>` : ""}
          <p><a href="${portalUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
            Compléter la demande
          </a></p>
          <p style="color:#666;font-size:12px;">Lien valable 30 jours.</p>
        </div>`,
      });
    }

    revalidatePath("/app/dossiers");
    return { ok: true, data: { id: demande.id, portalUrl } };
  } catch (e) {
    return err((e as Error).message);
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Portail — soumission depuis le client (pas d'auth)
// ───────────────────────────────────────────────────────────────────────────

export async function submitItemAnswer(
  token: string,
  itemId: string,
  answer: { text?: string; file?: { storagePath: string; name: string; size: number; mime?: string } }
): Promise<ActionResult> {
  if (!hasServerSupabaseEnv()) return err("Service non configuré.");
  const admin = getSupabaseServiceClient();
  if (!admin) return err("Service indisponible.");

  // Vérifier token valide
  const { data: demande } = await admin
    .from("demandes_documents")
    .select("id, status, access_token_expires_at")
    .eq("access_token", token)
    .single();
  if (!demande) return err("Lien invalide.");
  if (demande.access_token_expires_at && new Date(demande.access_token_expires_at) < new Date()) {
    return err("Lien expiré.");
  }

  // Vérifier que l'item appartient à cette demande
  const { data: item } = await admin
    .from("demande_items")
    .select("id, item_type")
    .eq("id", itemId)
    .eq("demande_id", demande.id)
    .single();
  if (!item) return err("Item introuvable.");

  const patch: {
    status: "completed";
    answered_at: string;
    answer_text?: string | null;
    file_storage_path?: string | null;
    file_name?: string | null;
    file_size_bytes?: number | null;
    file_mime?: string | null;
  } = {
    status: "completed",
    answered_at: new Date().toISOString(),
  };
  if (answer.text) patch.answer_text = answer.text;
  if (answer.file) {
    patch.file_storage_path = answer.file.storagePath;
    patch.file_name = answer.file.name;
    patch.file_size_bytes = answer.file.size;
    patch.file_mime = answer.file.mime ?? null;
  }

  const { error } = await admin.from("demande_items").update(patch).eq("id", itemId);
  if (error) return err(error.message);

  // Si tous les items requis sont completed → marquer demande complete
  const { data: remaining } = await admin
    .from("demande_items")
    .select("id")
    .eq("demande_id", demande.id)
    .eq("required", true)
    .neq("status", "completed");
  if (remaining && remaining.length === 0) {
    await admin
      .from("demandes_documents")
      .update({ status: "complete", completed_at: new Date().toISOString() })
      .eq("id", demande.id);
  } else if (demande.status === "envoye") {
    await admin.from("demandes_documents").update({ status: "en_cours" }).eq("id", demande.id);
  }

  return { ok: true, data: undefined };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
