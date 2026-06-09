/**
 * Agrégats purs pour les statistiques (Sprint 7, F-25 / F-26).
 * Pas de dépendance DB — prend des rows déjà chargés.
 *
 * Testable sans Supabase.
 */

export type Period = { from: Date; to: Date };

export type RevenueByMonth = {
  month: string; // YYYY-MM
  revenue: number;
  invoiceCount: number;
};

type InvoiceLike = {
  total_ttc: number;
  issued_at: string;
  status: string;
  invoice_type: string;
};

type DossierLike = {
  status: string;
  created_at: string;
  technicien_id: string | null;
};

type PaiementLike = {
  amount: number;
  paid_at: string;
};

// ---------------------------------------------------------------------------
// KPI dashboard (6 tuiles)
// ---------------------------------------------------------------------------

export type DashboardKpis = {
  dossiersEnCours: number;
  devisEnvoyes: number;
  facturesEnAttente: number;
  chiffreAffairesMois: number;
  caVsMoisPrecedent: number; // %
  tauxAcceptationDevis: number; // %
  rdvCetteSemaine: number;
};

export function computeDashboardKpis(input: {
  dossiers: DossierLike[];
  factures: InvoiceLike[];
  devis: Array<{ status: string; created_at: string }>;
  paiements: PaiementLike[];
  rdvThisWeek: number;
  now?: Date;
}): DashboardKpis {
  const now = input.now ?? new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
  const prevDate = new Date(now);
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonth = prevDate.toISOString().slice(0, 7);

  const caCurrent = sum(
    input.factures
      .filter((f) => f.issued_at.slice(0, 7) === currentMonth && f.invoice_type === "facture")
      .map((f) => f.total_ttc)
  );
  const caPrev = sum(
    input.factures
      .filter((f) => f.issued_at.slice(0, 7) === prevMonth && f.invoice_type === "facture")
      .map((f) => f.total_ttc)
  );
  const caDelta = caPrev === 0 ? 0 : Math.round(((caCurrent - caPrev) / caPrev) * 100);

  const devisNon = input.devis.filter((d) => d.status === "envoye").length;
  const devisTotal = input.devis.length;
  const devisOui = input.devis.filter((d) => d.status === "accepte").length;
  const tauxAcc = devisTotal === 0 ? 0 : Math.round((devisOui / devisTotal) * 100);

  return {
    dossiersEnCours: input.dossiers.filter((d) =>
      ["planifie", "en_cours", "realise", "en_facturation"].includes(d.status)
    ).length,
    devisEnvoyes: devisNon,
    facturesEnAttente: input.factures.filter((f) =>
      ["emise", "payee_partiel", "en_relance"].includes(f.status)
    ).length,
    chiffreAffairesMois: caCurrent,
    caVsMoisPrecedent: caDelta,
    tauxAcceptationDevis: tauxAcc,
    rdvCetteSemaine: input.rdvThisWeek,
  };
}

// ---------------------------------------------------------------------------
// CA par mois (12 derniers mois) pour graphique recharts
// ---------------------------------------------------------------------------

export function computeRevenueByMonth(
  factures: InvoiceLike[],
  now: Date = new Date(),
  months: number = 12
): RevenueByMonth[] {
  const buckets: Record<string, RevenueByMonth> = {};
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    buckets[key] = { month: key, revenue: 0, invoiceCount: 0 };
  }
  for (const f of factures) {
    if (f.invoice_type !== "facture") continue;
    const key = f.issued_at.slice(0, 7);
    if (buckets[key]) {
      buckets[key].revenue += f.total_ttc;
      buckets[key].invoiceCount += 1;
    }
  }
  return Object.values(buckets).sort((a, b) => a.month.localeCompare(b.month));
}

// ---------------------------------------------------------------------------
// Performance par technicien
// ---------------------------------------------------------------------------

export type TechnicienStats = {
  technicienId: string;
  dossierCount: number;
};

export function computeTechnicienStats(dossiers: DossierLike[]): TechnicienStats[] {
  const map = new Map<string, number>();
  for (const d of dossiers) {
    if (!d.technicien_id) continue;
    map.set(d.technicien_id, (map.get(d.technicien_id) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([technicienId, dossierCount]) => ({ technicienId, dossierCount }))
    .sort((a, b) => b.dossierCount - a.dossierCount);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sum(arr: number[]): number {
  return Math.round(arr.reduce((a, b) => a + Number(b), 0) * 100) / 100;
}
