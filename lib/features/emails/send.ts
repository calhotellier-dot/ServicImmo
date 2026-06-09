/**
 * Envoi d'emails transactionnels (Sprint 5).
 *
 * Sans React Email pour éviter le poids — HTML inline minimal. Les templates
 * riches (React Email) pourront être branchés en Sprint 8 polish.
 */

import {
  getEmailFrom,
  getEmailInternal,
  getResend,
  hasResendEnv,
} from "@/lib/resend/client";

type SendResult = { ok: true; id: string } | { ok: false; error: string };

async function send(to: string, subject: string, html: string): Promise<SendResult> {
  if (!hasResendEnv()) return { ok: false, error: "Resend non configuré." };
  const resend = getResend();
  if (!resend) return { ok: false, error: "Resend indisponible." };
  const { data, error } = await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject,
    html,
  });
  if (error || !data) return { ok: false, error: error?.message ?? "envoi échoué" };
  return { ok: true, id: data.id };
}

export function sendDevisEmail(
  to: string,
  params: { reference: string; totalTtc: number; portalUrl: string }
): Promise<SendResult> {
  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <h2 style="margin:0 0 12px;font-weight:600;">Votre devis Servicimmo</h2>
      <p>Bonjour,</p>
      <p>Votre devis <strong>${params.reference}</strong> est disponible pour un montant de
      <strong>${params.totalTtc.toFixed(2)} € TTC</strong>.</p>
      <p style="margin:24px 0;">
        <a href="${params.portalUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Consulter et accepter le devis
        </a>
      </p>
      <p style="color:#666;font-size:12px;">Ce lien est personnel et valable 30 jours.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="color:#888;font-size:12px;">Servicimmo — diagnostics immobiliers · Tours 37000</p>
    </div>`;
  return send(to, `Votre devis Servicimmo ${params.reference}`, html);
}

export function sendFactureEmail(
  to: string,
  params: { reference: string; totalTtc: number; stripeUrl?: string }
): Promise<SendResult> {
  const payButton = params.stripeUrl
    ? `<p style="margin:24px 0;">
        <a href="${params.stripeUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Régler en ligne
        </a>
      </p>`
    : "";
  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <h2 style="margin:0 0 12px;">Facture ${params.reference}</h2>
      <p>Bonjour,</p>
      <p>Vous trouverez ci-joint votre facture <strong>${params.reference}</strong> d'un montant de
      <strong>${params.totalTtc.toFixed(2)} € TTC</strong>.</p>
      ${payButton}
      <p style="color:#888;font-size:12px;">Servicimmo — diagnostics immobiliers</p>
    </div>`;
  return send(to, `Facture Servicimmo ${params.reference}`, html);
}

export function sendRelanceFacture(
  to: string,
  params: { reference: string; totalTtc: number; daysLate: number; stripeUrl?: string }
): Promise<SendResult> {
  const payButton = params.stripeUrl
    ? `<p style="margin:24px 0;">
        <a href="${params.stripeUrl}" style="display:inline-block;background:#b91c1c;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Régler maintenant
        </a>
      </p>`
    : "";
  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <h2>Rappel de paiement — ${params.reference}</h2>
      <p>Bonjour,</p>
      <p>Votre facture <strong>${params.reference}</strong>
      (${params.totalTtc.toFixed(2)} € TTC) est en retard de
      <strong>${params.daysLate} jour(s)</strong>.</p>
      <p>Merci de régulariser sous 48 h.</p>
      ${payButton}
      <p style="color:#888;font-size:12px;">Servicimmo — contact@servicimmo.fr</p>
    </div>`;
  return send(to, `Rappel paiement ${params.reference}`, html);
}

export function sendInternalNotification(subject: string, body: string): Promise<SendResult> {
  const html = `<div style="font-family:system-ui,sans-serif;"><pre style="white-space:pre-wrap;">${body}</pre></div>`;
  return send(getEmailInternal(), subject, html);
}
