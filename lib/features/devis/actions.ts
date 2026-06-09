"use server";

import { randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/features/action-result";
import { getCurrentUser } from "@/lib/features/auth/session";
import {
  getSupabaseServerClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";
import type { DevisStatus, FactureStatus } from "@/lib/supabase/types";

function err<T = undefined>(msg: string): ActionResult<T> {
  return { ok: false, error: msg };
}

async function requireAuth() {
  if (!hasServerSupabaseEnv()) throw new Error("Service non configuré.");
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié.");
  return user;
}

// ---------------------------------------------------------------------------
// Devis CRUD
// ---------------------------------------------------------------------------

export async function createDevisFromDossier(
  dossierId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();
    const supabase = await getSupabaseServerClient();

    const { data: dossier } = await supabase
      .from("dossiers")
      .select("*")
      .eq("id", dossierId)
      .single();
    if (!dossier) return err("Dossier introuvable.");

    // Générer référence via RPC
    const { data: ref } = await (supabase.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>
    ) => Promise<{ data: string | null; error: unknown }>)(
      "generate_devis_reference",
      { org_id: user.profile.organization_id }
    );

    // Créer devis
    const { data: devis, error } = await supabase
      .from("devis")
      .insert({
        organization_id: user.profile.organization_id,
        dossier_id: dossierId,
        reference: ref ?? null,
        status: "brouillon",
        client_id: dossier.proprietaire_id,
        subtotal_ht: dossier.price_min ?? 0,
        vat_rate: 0.2,
        vat_amount: Math.round((dossier.price_min ?? 0) * 0.2 * 100) / 100,
        total_ttc: Math.round((dossier.price_min ?? 0) * 1.2 * 100) / 100,
      })
      .select("id")
      .single();
    if (error) return err(error.message);

    // Pré-alimenter des lignes depuis required_diagnostics (jsonb array d'objets)
    const required = Array.isArray(dossier.required_diagnostics)
      ? (dossier.required_diagnostics as Array<{ id: string; name: string }>)
      : [];
    if (required.length > 0) {
      const lines = required.map((d, i) => ({
        devis_id: devis.id,
        order_index: i,
        label: d.name ?? d.id,
        quantity: 1,
        unit_price: 0,
        line_total: 0,
      }));
      await supabase.from("devis_lignes").insert(lines);
    }

    revalidatePath(`/app/dossiers/${dossierId}`);
    revalidatePath("/app/facturation");
    return { ok: true, data: { id: devis.id } };
  } catch (e) {
    return err((e as Error).message);
  }
}

export async function updateDevisStatus(
  id: string,
  status: DevisStatus
): Promise<ActionResult> {
  try {
    await requireAuth();
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.from("devis").update({ status }).eq("id", id);
    if (error) return err(error.message);
    revalidatePath("/app/facturation");
    return { ok: true, data: undefined };
  } catch (e) {
    return err((e as Error).message);
  }
}

export async function sendDevis(id: string, email: string): Promise<ActionResult<{ url: string }>> {
  try {
    const user = await requireAuth();
    const supabase = await getSupabaseServerClient();
    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30j
    const { error } = await supabase
      .from("devis")
      .update({
        status: "envoye",
        accept_token: token,
        accept_token_expires_at: expiresAt,
        sent_at: new Date().toISOString(),
        sent_to_email: email,
      })
      .eq("id", id);
    if (error) return err(error.message);

    const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const url = `${base}/portail/${token}/devis/${id}`;

    // Envoi email via Resend (Sprint 5). Fail-soft : si Resend absent, on
    // renvoie quand même l'URL pour transmission manuelle.
    const { sendDevisEmail } = await import("@/lib/features/emails/send");
    const { data: devisData } = await supabase
      .from("devis")
      .select("reference, total_ttc")
      .eq("id", id)
      .single();
    if (devisData) {
      await sendDevisEmail(email, {
        reference: devisData.reference ?? id.slice(0, 8),
        totalTtc: Number(devisData.total_ttc),
        portalUrl: url,
      });
    }
    void user;

    revalidatePath("/app/facturation");
    revalidatePath(`/app/facturation/devis/${id}`);
    return { ok: true, data: { url } };
  } catch (e) {
    return err((e as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Facture
// ---------------------------------------------------------------------------

export async function createFactureFromDevis(
  devisId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();
    const supabase = await getSupabaseServerClient();
    const { data: devis } = await supabase
      .from("devis")
      .select("*")
      .eq("id", devisId)
      .single();
    if (!devis) return err("Devis introuvable.");
    if (devis.status !== "accepte") {
      return err("Le devis doit être accepté avant facturation.");
    }
    const { data: lignes } = await supabase
      .from("devis_lignes")
      .select("*")
      .eq("devis_id", devisId)
      .order("order_index");

    const { data: ref } = await (supabase.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>
    ) => Promise<{ data: string | null; error: unknown }>)(
      "generate_facture_reference",
      { org_id: user.profile.organization_id, inv_type: "facture" }
    );

    const { data: facture, error } = await supabase
      .from("factures")
      .insert({
        organization_id: user.profile.organization_id,
        dossier_id: devis.dossier_id,
        devis_id: devisId,
        reference: ref ?? null,
        invoice_type: "facture",
        status: "emise",
        client_id: devis.client_id,
        client_snapshot: devis.client_snapshot,
        subtotal_ht: devis.subtotal_ht,
        vat_rate: devis.vat_rate,
        vat_amount: devis.vat_amount,
        total_ttc: devis.total_ttc,
        issued_at: new Date().toISOString(),
        due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      })
      .select("id")
      .single();
    if (error) return err(error.message);

    if (lignes && lignes.length > 0) {
      const rows = lignes.map((l, i) => ({
        facture_id: facture.id,
        order_index: i,
        diagnostic_type_id: l.diagnostic_type_id,
        label: l.label,
        description: l.description,
        quantity: l.quantity,
        unit_price: l.unit_price,
        line_total: l.line_total,
      }));
      await supabase.from("facture_lignes").insert(rows);
    }

    revalidatePath("/app/facturation");
    return { ok: true, data: { id: facture.id } };
  } catch (e) {
    return err((e as Error).message);
  }
}

export async function updateFactureStatus(
  id: string,
  status: FactureStatus
): Promise<ActionResult> {
  try {
    await requireAuth();
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.from("factures").update({ status }).eq("id", id);
    if (error) return err(error.message);
    revalidatePath("/app/facturation");
    return { ok: true, data: undefined };
  } catch (e) {
    return err((e as Error).message);
  }
}

/** Génère un avoir depuis une facture payée (on crée une facture de type 'avoir'). */
export async function createAvoirFromFacture(
  factureId: string,
  reason: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();
    const supabase = await getSupabaseServerClient();
    const { data: src } = await supabase
      .from("factures")
      .select("*")
      .eq("id", factureId)
      .single();
    if (!src) return err("Facture introuvable.");

    const { data: ref } = await (supabase.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>
    ) => Promise<{ data: string | null; error: unknown }>)(
      "generate_facture_reference",
      { org_id: user.profile.organization_id, inv_type: "avoir" }
    );

    const { data: avoir, error } = await supabase
      .from("factures")
      .insert({
        organization_id: user.profile.organization_id,
        dossier_id: src.dossier_id,
        devis_id: src.devis_id,
        reference: ref ?? null,
        invoice_type: "avoir",
        status: "emise",
        client_id: src.client_id,
        client_snapshot: src.client_snapshot,
        // Montants négatifs
        subtotal_ht: -src.subtotal_ht,
        vat_rate: src.vat_rate,
        vat_amount: -src.vat_amount,
        total_ttc: -src.total_ttc,
        issued_at: new Date().toISOString(),
        credit_of_invoice_id: factureId,
        commentary: reason,
      })
      .select("id")
      .single();
    if (error) return err(error.message);
    revalidatePath("/app/facturation");
    return { ok: true, data: { id: avoir.id } };
  } catch (e) {
    return err((e as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Acceptation depuis le portail (magic link, pas d'auth requise)
// ---------------------------------------------------------------------------

export async function acceptDevisViaToken(
  token: string
): Promise<ActionResult<{ devisId: string }>> {
  if (!hasServerSupabaseEnv()) return err("Service non configuré.");
  const { getSupabaseServiceClient } = await import("@/lib/supabase/server");
  const admin = getSupabaseServiceClient();
  if (!admin) return err("Service indisponible.");

  const { data: devis } = await admin
    .from("devis")
    .select("id, status, accept_token_expires_at")
    .eq("accept_token", token)
    .single();
  if (!devis) return err("Lien invalide.");
  if (devis.status === "accepte") return err("Devis déjà accepté.");
  if (
    devis.accept_token_expires_at &&
    new Date(devis.accept_token_expires_at) < new Date()
  ) {
    return err("Lien expiré.");
  }

  const { error } = await admin
    .from("devis")
    .update({ status: "accepte", accepted_at: new Date().toISOString() })
    .eq("id", devis.id);
  if (error) return err(error.message);
  return { ok: true, data: { devisId: devis.id } };
}

export async function refuseDevisViaToken(
  token: string,
  reason: string
): Promise<ActionResult> {
  if (!hasServerSupabaseEnv()) return err("Service non configuré.");
  const { getSupabaseServiceClient } = await import("@/lib/supabase/server");
  const admin = getSupabaseServiceClient();
  if (!admin) return err("Service indisponible.");

  const { data: devis } = await admin
    .from("devis")
    .select("id, status")
    .eq("accept_token", token)
    .single();
  if (!devis) return err("Lien invalide.");

  const { error } = await admin
    .from("devis")
    .update({
      status: "refuse",
      refused_at: new Date().toISOString(),
      refusal_reason: reason,
    })
    .eq("id", devis.id);
  if (error) return err(error.message);
  return { ok: true, data: undefined };
}
