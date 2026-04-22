import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { DevisActions } from "./DevisActions";
import { getDevisWithLines } from "@/lib/features/devis/queries";

type PageProps = { params: Promise<{ id: string }> };

export default async function DevisDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getDevisWithLines(id);
  if (!result) notFound();
  const { devis, lignes } = result;

  return (
    <div className="max-w-4xl">
      <Link
        href="/app/facturation"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden /> Facturation
      </Link>

      <header className="mb-6 flex items-end justify-between">
        <div>
          <div className="font-mono text-[12px] text-neutral-500">Devis</div>
          <h1 className="text-2xl font-semibold">{devis.reference ?? devis.id.slice(0, 8)}</h1>
          <div className="mt-1 text-sm text-neutral-500">Statut : {devis.status}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">{devis.total_ttc.toFixed(2)} €</div>
          <div className="font-mono text-[11px] text-neutral-500">TTC</div>
        </div>
      </header>

      <section className="mb-6 rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-3 font-mono text-[11px] tracking-widest text-neutral-500">
          LIGNES
        </div>
        {lignes.length === 0 ? (
          <p className="text-sm text-neutral-500">Aucune ligne.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 text-left text-[12px] text-neutral-500">
              <tr>
                <th className="py-2">Libellé</th>
                <th className="py-2 text-right">Qté</th>
                <th className="py-2 text-right">PU HT</th>
                <th className="py-2 text-right">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.id} className="border-b border-neutral-100 last:border-b-0">
                  <td className="py-2.5">{l.label}</td>
                  <td className="py-2.5 text-right">{l.quantity}</td>
                  <td className="py-2.5 text-right">{l.unit_price.toFixed(2)} €</td>
                  <td className="py-2.5 text-right font-medium">{l.line_total.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-200 font-medium">
                <td colSpan={3} className="py-2 text-right text-neutral-500">
                  Sous-total HT
                </td>
                <td className="py-2 text-right">{devis.subtotal_ht.toFixed(2)} €</td>
              </tr>
              <tr>
                <td colSpan={3} className="py-1 text-right text-neutral-500">
                  TVA {(devis.vat_rate * 100).toFixed(0)} %
                </td>
                <td className="py-1 text-right">{devis.vat_amount.toFixed(2)} €</td>
              </tr>
              <tr className="text-base font-semibold">
                <td colSpan={3} className="py-2 text-right">
                  Total TTC
                </td>
                <td className="py-2 text-right">{devis.total_ttc.toFixed(2)} €</td>
              </tr>
            </tfoot>
          </table>
        )}
      </section>

      <DevisActions devisId={devis.id} status={devis.status} />
    </div>
  );
}
