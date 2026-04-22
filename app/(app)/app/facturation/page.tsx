import Link from "next/link";

import { listDevis, listFactures } from "@/lib/features/devis/queries";

export default async function FacturationPage() {
  const [devis, factures] = await Promise.all([listDevis(), listFactures()]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Facturation</h1>
        <p className="text-sm text-neutral-500">Devis et factures du cabinet.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Devis</h2>
            <span className="font-mono text-[11px] text-neutral-500">
              {devis.rows.length} total
            </span>
          </div>
          <TableList
            rows={devis.rows.map((d) => ({
              id: d.id,
              ref: d.reference ?? d.id.slice(0, 8),
              href: `/app/facturation/devis/${d.id}`,
              status: d.status,
              amount: d.total_ttc,
              date: d.created_at,
            }))}
            available={devis.available}
          />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Factures</h2>
            <span className="font-mono text-[11px] text-neutral-500">
              {factures.rows.length} total
            </span>
          </div>
          <TableList
            rows={factures.rows.map((f) => ({
              id: f.id,
              ref: f.reference ?? f.id.slice(0, 8),
              href: `/app/facturation/factures/${f.id}`,
              status: `${f.invoice_type === "avoir" ? "Avoir · " : ""}${f.status}`,
              amount: f.total_ttc,
              date: f.created_at,
            }))}
            available={factures.available}
          />
        </section>
      </div>
    </div>
  );
}

function TableList({
  rows,
  available,
}: {
  rows: Array<{ id: string; ref: string; href: string; status: string; amount: number; date: string }>;
  available: boolean;
}) {
  if (!available) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white/60 p-6 text-center text-sm text-neutral-500">
        Base non connectée.
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white/60 p-6 text-center text-sm text-neutral-500">
        Aucun élément pour l&apos;instant.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-[12px] font-medium text-neutral-600">
          <tr>
            <th className="px-4 py-2.5">Référence</th>
            <th className="px-4 py-2.5">Statut</th>
            <th className="px-4 py-2.5">Montant TTC</th>
            <th className="px-4 py-2.5">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-neutral-100 last:border-b-0">
              <td className="px-4 py-2.5 font-mono text-[12px]">
                <Link href={r.href} className="hover:underline">
                  {r.ref}
                </Link>
              </td>
              <td className="px-4 py-2.5 text-neutral-600">{r.status}</td>
              <td className="px-4 py-2.5 font-medium text-neutral-900">
                {r.amount.toFixed(2)} €
              </td>
              <td className="px-4 py-2.5 text-neutral-500">
                {new Date(r.date).toLocaleDateString("fr-FR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
