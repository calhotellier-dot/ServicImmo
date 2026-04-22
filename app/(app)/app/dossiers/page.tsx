import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { listDossiers } from "@/lib/features/dossiers/queries";
import type { DossierStatus } from "@/lib/supabase/types";

const STATUS_LABELS: Record<DossierStatus, string> = {
  brouillon: "Brouillon",
  a_planifier: "À planifier",
  planifie: "Planifié",
  en_cours: "En cours",
  realise: "Réalisé",
  en_facturation: "En facturation",
  facture: "Facturé",
  paye: "Payé",
  archive: "Archivé",
  annule: "Annulé",
};

const STATUS_COLORS: Record<DossierStatus, string> = {
  brouillon: "bg-neutral-100 text-neutral-600",
  a_planifier: "bg-amber-100 text-amber-800",
  planifie: "bg-blue-100 text-blue-800",
  en_cours: "bg-purple-100 text-purple-800",
  realise: "bg-emerald-100 text-emerald-800",
  en_facturation: "bg-indigo-100 text-indigo-800",
  facture: "bg-sky-100 text-sky-800",
  paye: "bg-emerald-200 text-emerald-900",
  archive: "bg-neutral-200 text-neutral-700",
  annule: "bg-red-100 text-red-700",
};

type PageProps = {
  searchParams: Promise<{ search?: string; status?: string; view?: string }>;
};

export default async function DossiersPage({ searchParams }: PageProps) {
  const { search, status, view } = await searchParams;
  const isKanban = view === "kanban";

  const statusFilter = (Object.keys(STATUS_LABELS) as DossierStatus[]).find(
    (s) => s === status
  );
  const { dossiers, available } = await listDossiers({ search, status: statusFilter });

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dossiers</h1>
          <p className="text-sm text-neutral-500">
            Pilotage des interventions — de la prise de contact au paiement.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-0.5 text-[12px]">
            <Link
              href="/app/dossiers"
              className={`rounded-md px-2.5 py-1 ${!isKanban ? "bg-neutral-900 text-white" : "text-neutral-600"}`}
            >
              Liste
            </Link>
            <Link
              href="/app/dossiers?view=kanban"
              className={`rounded-md px-2.5 py-1 ${isKanban ? "bg-neutral-900 text-white" : "text-neutral-600"}`}
            >
              Kanban
            </Link>
          </div>
          <Link
            href="/app/dossiers/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            <PlusIcon className="h-4 w-4" aria-hidden /> Nouveau dossier
          </Link>
        </div>
      </header>

      {!isKanban ? (
        <>
          <form className="mb-4 flex items-center gap-2">
            <input
              name="search"
              defaultValue={search ?? ""}
              placeholder="Rechercher par référence, adresse, ville…"
              className="w-72 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
            <select
              name="status"
              defaultValue={status ?? ""}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Tous les statuts</option>
              {(Object.keys(STATUS_LABELS) as DossierStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <button className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 hover:border-neutral-400">
              Filtrer
            </button>
          </form>

          {!available ? (
            <Empty message="Base non connectée. Les dossiers s'afficheront après provisionnement Supabase." />
          ) : dossiers.length === 0 ? (
            <Empty message="Aucun dossier. Créez le premier via 'Nouveau dossier'." />
          ) : (
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-[12px] font-medium text-neutral-600">
                  <tr>
                    <th className="px-4 py-2.5">Référence</th>
                    <th className="px-4 py-2.5">Statut</th>
                    <th className="px-4 py-2.5">Adresse</th>
                    <th className="px-4 py-2.5">Surface</th>
                    <th className="px-4 py-2.5">Prix estimé</th>
                    <th className="px-4 py-2.5">Complétion</th>
                  </tr>
                </thead>
                <tbody>
                  {dossiers.map((d) => (
                    <tr key={d.id} className="border-b border-neutral-100 last:border-b-0">
                      <td className="px-4 py-2.5 font-mono text-[12px]">
                        <Link
                          href={`/app/dossiers/${d.id}`}
                          className="text-neutral-900 hover:underline"
                        >
                          {d.reference ?? d.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${STATUS_COLORS[d.status]}`}
                        >
                          {STATUS_LABELS[d.status]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-neutral-700">
                        {d.address ? `${d.address}, ${d.city ?? ""}` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-neutral-600">
                        {d.surface ? `${d.surface} m²` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-neutral-600">
                        {d.price_min !== null && d.price_max !== null
                          ? `${d.price_min}-${d.price_max} €`
                          : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-200">
                            <div
                              className="h-full bg-neutral-900"
                              style={{ width: `${d.completion_rate}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-neutral-500">
                            {d.completion_rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <KanbanView dossiers={dossiers} />
      )}
    </div>
  );
}

function KanbanView({ dossiers }: { dossiers: Awaited<ReturnType<typeof listDossiers>>["dossiers"] }) {
  // Vue Kanban simple (SSR — drag & drop interactif repris en Client Component
  // à l'évolution Sprint 2+. Pour l'instant on présente les colonnes statiques).
  const COLUMNS: DossierStatus[] = [
    "brouillon",
    "a_planifier",
    "planifie",
    "en_cours",
    "realise",
    "en_facturation",
    "facture",
    "paye",
  ];
  const byStatus = Object.fromEntries(
    COLUMNS.map((c) => [c, dossiers.filter((d) => d.status === c)])
  ) as Record<DossierStatus, typeof dossiers>;

  return (
    <div className="flex gap-3 overflow-x-auto pb-3">
      {COLUMNS.map((col) => (
        <section
          key={col}
          className="flex w-64 flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2.5"
        >
          <header className="flex items-center justify-between px-1">
            <span className="text-[12px] font-medium text-neutral-700">
              {STATUS_LABELS[col]}
            </span>
            <span className="font-mono text-[10px] text-neutral-500">
              {byStatus[col].length}
            </span>
          </header>
          <div className="flex flex-col gap-1.5">
            {byStatus[col].map((d) => (
              <Link
                key={d.id}
                href={`/app/dossiers/${d.id}`}
                className="rounded-md border border-neutral-200 bg-white p-2.5 text-xs hover:border-neutral-400"
              >
                <div className="font-mono text-[10px] text-neutral-500">
                  {d.reference ?? d.id.slice(0, 8)}
                </div>
                <div className="mt-0.5 font-medium text-neutral-900">
                  {d.address ?? "Sans adresse"}
                </div>
                <div className="mt-0.5 text-neutral-500">{d.city ?? ""}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white/60 p-8 text-center text-sm text-neutral-500">
      {message}
    </div>
  );
}
