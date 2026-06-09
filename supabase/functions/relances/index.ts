/**
 * Supabase Edge Function — `relances`
 *
 * Cron quotidien : relance les factures en retard (J+7, J+15, J+30) via Resend.
 * À déployer : `supabase functions deploy relances` + schedule via
 * `supabase functions schedule relances --schedule "0 8 * * *"` (8h UTC).
 *
 * ⚠️ Ce fichier n'est PAS utilisé par Next.js. Il vit dans supabase/functions/
 * et s'exécute dans Deno. Les imports suivent la syntaxe Deno (URL ESM).
 */

// @ts-expect-error — runtime Deno, pas d'types côté projet Next.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-expect-error
import { Resend } from "https://esm.sh/resend@4";

declare const Deno: { env: { get(k: string): string | undefined }; serve: (h: (r: Request) => Response | Promise<Response>) => void };

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM = Deno.env.get("EMAIL_FROM") ?? "devis@servicimmo.fr";
const APP_URL = Deno.env.get("NEXT_PUBLIC_APP_URL") ?? "https://servicimmo.fr";

const THRESHOLDS = [7, 15, 30] as const;

Deno.serve(async () => {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const resend = new Resend(RESEND_KEY);

  const today = new Date();
  const resultsByThreshold: Record<number, number> = {};

  for (const days of THRESHOLDS) {
    const dueBefore = new Date(today.getTime() - days * 86400 * 1000);
    const dueIso = dueBefore.toISOString().slice(0, 10);

    const { data: factures } = await sb
      .from("factures")
      .select("id, reference, total_ttc, amount_paid, sent_to_email, due_at, status")
      .in("status", ["emise", "payee_partiel", "en_relance"])
      .lte("due_at", dueIso);

    if (!factures) continue;
    let sent = 0;
    for (const f of factures) {
      if (!f.sent_to_email) continue;
      const daysLate = Math.floor(
        (today.getTime() - new Date(f.due_at!).getTime()) / 86400000
      );
      if (daysLate < days || daysLate >= days + 7) continue; // fenêtre de 7j

      await resend.emails.send({
        from: FROM,
        to: f.sent_to_email,
        subject: `Rappel paiement ${f.reference}`,
        html: `<p>Rappel : la facture ${f.reference} (${f.total_ttc} € TTC) est en retard de ${daysLate} jours.</p>
               <p><a href="${APP_URL}/portail/pay/${f.id}">Régler en ligne</a></p>`,
      });
      await sb.from("factures").update({ status: "en_relance" }).eq("id", f.id);
      sent++;
    }
    resultsByThreshold[days] = sent;
  }

  return new Response(JSON.stringify({ ok: true, results: resultsByThreshold }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
