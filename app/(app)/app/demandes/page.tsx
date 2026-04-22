import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { listDemandes } from "@/lib/features/demandes-documents/queries";

export default async function DemandesPage() {
  const { rows, available } = await listDemandes();

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Demandes de documents</h1>
          <p className="text-sm text-neutral-500">
            Collecte de pièces côté client via magic link.
          </p>
        </div>
        <Link
          href="/app/demandes/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <PlusIcon className="h-4 w-4" aria-hidden /> Nouvelle demande
        </Link>
      </header>

      {!available ? (
        <Empty message="Base non connectée." />
      ) : rows.length === 0 ? (
        <Empty message="Aucune demande envoyée." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-[12px] font-medium text-neutral-600">
              <tr>
                <th className="px-4 py-2.5">Référence</th>
                <th className="px-4 py-2.5">Destinataire</th>
                <th className="px-4 py-2.5">Statut</th>
                <th className="px-4 py-2.5">Envoyé le</th>
                <th className="px-4 py-2.5">Échéance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-neutral-100 last:border-b-0">
                  <td className="px-4 py-2.5 font-mono text-[12px]">
                    <Link href={`/app/demandes/${d.id}`} className="hover:underline">
                      {d.reference ?? d.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">{d.recipient_name ?? d.recipient_email ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-2.5 text-neutral-500">
                    {d.sent_at ? new Date(d.sent_at).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-500">
                    {d.due_date ? new Date(d.due_date).toLocaleDateString("fr-FR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    brouillon: "bg-neutral-100 text-neutral-600",
    envoye: "bg-blue-100 text-blue-800",
    en_cours: "bg-amber-100 text-amber-800",
    complete: "bg-emerald-100 text-emerald-800",
    expire: "bg-red-100 text-red-700",
    annule: "bg-neutral-200 text-neutral-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] ${colors[status] ?? ""}`}>
      {status}
    </span>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white/60 p-8 text-center text-sm text-neutral-500">
      {message}
    </div>
  );
}
