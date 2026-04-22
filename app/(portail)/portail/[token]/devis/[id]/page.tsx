import { notFound } from "next/navigation";

import { getDevisByAcceptToken } from "@/lib/features/devis/queries";

import { AcceptForm } from "./AcceptForm";

type PageProps = { params: Promise<{ token: string; id: string }> };

export default async function PortalDevisPage({ params }: PageProps) {
  const { token, id } = await params;
  const result = await getDevisByAcceptToken(token);
  if (!result || result.devis.id !== id) notFound();
  const { devis, lignes } = result;

  const expired =
    devis.accept_token_expires_at &&
    new Date(devis.accept_token_expires_at) < new Date();

  return (
    <div>
      <header className="mb-6">
        <div className="font-mono text-[12px] text-neutral-500">
          Devis {devis.reference}
        </div>
        <h1 className="text-2xl font-semibold">Votre devis Servicimmo</h1>
      </header>

      <section className="mb-6 rounded-xl border border-neutral-200 bg-white p-5">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 text-left text-[12px] text-neutral-500">
            <tr>
              <th className="py-2">Prestation</th>
              <th className="py-2 text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr key={l.id} className="border-b border-neutral-100 last:border-b-0">
                <td className="py-2.5">{l.label}</td>
                <td className="py-2.5 text-right">{l.line_total.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="text-base font-semibold">
              <td className="py-2">Total TTC</td>
              <td className="py-2 text-right">{devis.total_ttc.toFixed(2)} €</td>
            </tr>
          </tfoot>
        </table>
      </section>

      {devis.status === "accepte" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          Merci ! Votre devis a bien été accepté. Notre équipe vous recontacte
          sous 2 h ouvrées pour caler le rendez-vous.
        </div>
      ) : devis.status === "refuse" ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-5 text-sm text-neutral-700">
          Ce devis a été refusé. Pour toute question, contactez-nous à
          contact@servicimmo.fr.
        </div>
      ) : expired ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Ce lien a expiré. Merci de nous contacter pour un nouveau devis.
        </div>
      ) : (
        <AcceptForm token={token} />
      )}
    </div>
  );
}
