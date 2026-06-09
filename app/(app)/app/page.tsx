import Link from "next/link";
import {
  FolderOpenIcon,
  FileTextIcon,
  TimerIcon,
  WalletIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  CalendarIcon,
} from "lucide-react";

import { computeDashboardKpis, computeRevenueByMonth } from "@/lib/core/stats/aggregate";
import { loadStatsSnapshot } from "@/lib/features/stats/queries";

import { RevenueChart } from "./RevenueChart";

export default async function AppDashboardPage() {
  const snap = await loadStatsSnapshot();
  const kpis = computeDashboardKpis({
    dossiers: snap.dossiers,
    factures: snap.factures,
    devis: snap.devis,
    paiements: snap.paiements,
    rdvThisWeek: snap.rdvThisWeek,
  });
  const revenue = computeRevenueByMonth(snap.factures);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-sm text-neutral-500">
          Vision d&apos;ensemble du cabinet {snap.available ? "" : "· base non connectée"}
        </p>
      </header>

      {/* KPIs */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={FolderOpenIcon}
          label="Dossiers en cours"
          value={kpis.dossiersEnCours}
          href="/app/dossiers"
        />
        <Kpi
          icon={FileTextIcon}
          label="Devis envoyés"
          value={kpis.devisEnvoyes}
          href="/app/facturation"
        />
        <Kpi
          icon={TimerIcon}
          label="Factures en attente"
          value={kpis.facturesEnAttente}
          href="/app/facturation"
          accent={kpis.facturesEnAttente > 0 ? "amber" : "neutral"}
        />
        <Kpi
          icon={WalletIcon}
          label="CA ce mois"
          value={`${kpis.chiffreAffairesMois.toFixed(0)} €`}
          delta={kpis.caVsMoisPrecedent}
        />
        <Kpi
          icon={CheckCircleIcon}
          label="Taux acceptation devis"
          value={`${kpis.tauxAcceptationDevis}%`}
        />
        <Kpi
          icon={CalendarIcon}
          label="RDV cette semaine"
          value={kpis.rdvCetteSemaine}
          href="/app/agenda"
        />
        <Kpi
          icon={TrendingUpIcon}
          label="CA vs mois précédent"
          value={`${kpis.caVsMoisPrecedent > 0 ? "+" : ""}${kpis.caVsMoisPrecedent}%`}
          accent={
            kpis.caVsMoisPrecedent > 0
              ? "emerald"
              : kpis.caVsMoisPrecedent < 0
                ? "amber"
                : "neutral"
          }
        />
      </div>

      {/* Chart */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-3 font-mono text-[11px] tracking-widest text-neutral-500">
          CHIFFRE D&apos;AFFAIRES (12 MOIS)
        </div>
        <RevenueChart data={revenue} />
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sous-composants
// ---------------------------------------------------------------------------

function Kpi({
  icon: Icon,
  label,
  value,
  href,
  delta,
  accent = "neutral",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  href?: string;
  delta?: number;
  accent?: "neutral" | "emerald" | "amber";
}) {
  const accentStyle =
    accent === "emerald"
      ? "border-emerald-200 bg-emerald-50"
      : accent === "amber"
        ? "border-amber-200 bg-amber-50"
        : "border-neutral-200 bg-white";

  const content = (
    <div className={`rounded-xl border p-4 ${accentStyle}`}>
      <div className="mb-2 flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-neutral-500">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </div>
      <div className="text-2xl font-semibold text-neutral-900">{value}</div>
      {typeof delta === "number" && delta !== 0 ? (
        <div
          className={`mt-1 text-[11px] ${
            delta > 0 ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {delta > 0 ? "+" : ""}
          {delta}% vs mois précédent
        </div>
      ) : null}
    </div>
  );

  return href ? (
    <Link href={href} className="transition-colors hover:brightness-[0.98]">
      {content}
    </Link>
  ) : (
    content
  );
}
