import {
  computeDashboardKpis,
  computeRevenueByMonth,
  computeTechnicienStats,
} from "@/lib/core/stats/aggregate";
import { loadStatsSnapshot } from "@/lib/features/stats/queries";

import { RevenueChart } from "../RevenueChart";

export default async function StatistiquesPage() {
  const snap = await loadStatsSnapshot();
  const kpis = computeDashboardKpis({
    dossiers: snap.dossiers,
    factures: snap.factures,
    devis: snap.devis,
    paiements: snap.paiements,
    rdvThisWeek: snap.rdvThisWeek,
  });
  const revenue = computeRevenueByMonth(snap.factures);
  const techs = computeTechnicienStats(snap.dossiers);

  const totalDossiers = snap.dossiers.length;
  const totalFactures = snap.factures.filter((f) => f.invoice_type === "facture").length;
  const totalRevenue12 = revenue.reduce((a, r) => a + r.revenue, 0);
  const countInvoices12 = revenue.reduce((a, r) => a + r.invoiceCount, 0);
  const avgTicket = countInvoices12 > 0 ? totalRevenue12 / countInvoices12 : 0;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Statistiques</h1>
        <p className="text-sm text-neutral-500">
          Performance du cabinet sur les 12 derniers mois.
        </p>
      </header>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Metric label="Dossiers (total)" value={totalDossiers} />
        <Metric label="Factures (12 mois)" value={totalFactures} />
        <Metric label="Panier moyen" value={`${avgTicket.toFixed(0)} €`} />
        <Metric label="Taux accept. devis" value={`${kpis.tauxAcceptationDevis}%`} />
      </div>

      <section className="mb-6 rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-3 font-mono text-[11px] tracking-widest text-neutral-500">
          CHIFFRE D&apos;AFFAIRES MENSUEL
        </div>
        <RevenueChart data={revenue} />
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-3 font-mono text-[11px] tracking-widest text-neutral-500">
          DOSSIERS PAR TECHNICIEN
        </div>
        {techs.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Aucune attribution de technicien pour le moment.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {techs.map((t) => (
              <li
                key={t.technicienId}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-mono text-[11px] text-neutral-500">
                  {t.technicienId.slice(0, 8)}…
                </span>
                <span className="font-medium">{t.dossierCount} dossier(s)</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-1 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
        {label}
      </div>
      <div className="text-xl font-semibold text-neutral-900">{value}</div>
    </div>
  );
}
