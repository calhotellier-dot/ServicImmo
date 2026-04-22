import { describe, expect, it } from "vitest";

import {
  computeDashboardKpis,
  computeRevenueByMonth,
  computeTechnicienStats,
} from "../aggregate";

const NOW = new Date("2026-04-22T12:00:00Z");

describe("computeDashboardKpis", () => {
  it("calcule le CA du mois courant et la variation vs mois précédent", () => {
    const kpi = computeDashboardKpis({
      dossiers: [],
      factures: [
        { total_ttc: 500, issued_at: "2026-04-10", status: "emise", invoice_type: "facture" },
        { total_ttc: 300, issued_at: "2026-04-15", status: "payee", invoice_type: "facture" },
        { total_ttc: 600, issued_at: "2026-03-20", status: "payee", invoice_type: "facture" },
      ],
      devis: [],
      paiements: [],
      rdvThisWeek: 0,
      now: NOW,
    });
    expect(kpi.chiffreAffairesMois).toBe(800);
    // Avril = 800 vs Mars = 600 → +33%
    expect(kpi.caVsMoisPrecedent).toBe(33);
  });

  it("ignore les avoirs dans le CA", () => {
    const kpi = computeDashboardKpis({
      dossiers: [],
      factures: [
        { total_ttc: 500, issued_at: "2026-04-10", status: "emise", invoice_type: "facture" },
        { total_ttc: -200, issued_at: "2026-04-11", status: "emise", invoice_type: "avoir" },
      ],
      devis: [],
      paiements: [],
      rdvThisWeek: 0,
      now: NOW,
    });
    expect(kpi.chiffreAffairesMois).toBe(500);
  });

  it("compte les dossiers en cours", () => {
    const kpi = computeDashboardKpis({
      dossiers: [
        { status: "en_cours", created_at: "", technicien_id: null },
        { status: "planifie", created_at: "", technicien_id: null },
        { status: "paye", created_at: "", technicien_id: null },
        { status: "archive", created_at: "", technicien_id: null },
      ],
      factures: [],
      devis: [],
      paiements: [],
      rdvThisWeek: 0,
      now: NOW,
    });
    expect(kpi.dossiersEnCours).toBe(2);
  });

  it("calcule le taux d'acceptation devis", () => {
    const kpi = computeDashboardKpis({
      dossiers: [],
      factures: [],
      devis: [
        { status: "envoye", created_at: "" },
        { status: "accepte", created_at: "" },
        { status: "accepte", created_at: "" },
        { status: "refuse", created_at: "" },
      ],
      paiements: [],
      rdvThisWeek: 0,
      now: NOW,
    });
    // 2/4 = 50%
    expect(kpi.tauxAcceptationDevis).toBe(50);
  });
});

describe("computeRevenueByMonth", () => {
  it("retourne 12 buckets dans l'ordre chronologique", () => {
    const rows = computeRevenueByMonth([], NOW, 12);
    expect(rows).toHaveLength(12);
    expect(rows[0]?.month).toBe("2025-05");
    expect(rows[11]?.month).toBe("2026-04");
    expect(rows.every((r) => r.revenue === 0)).toBe(true);
  });

  it("agrège revenus par mois et compte les factures", () => {
    const rows = computeRevenueByMonth(
      [
        { total_ttc: 100, issued_at: "2026-04-01", status: "emise", invoice_type: "facture" },
        { total_ttc: 200, issued_at: "2026-04-15", status: "emise", invoice_type: "facture" },
        { total_ttc: 300, issued_at: "2026-03-10", status: "emise", invoice_type: "facture" },
      ],
      NOW
    );
    const apr = rows.find((r) => r.month === "2026-04");
    const mar = rows.find((r) => r.month === "2026-03");
    expect(apr?.revenue).toBe(300);
    expect(apr?.invoiceCount).toBe(2);
    expect(mar?.revenue).toBe(300);
    expect(mar?.invoiceCount).toBe(1);
  });
});

describe("computeTechnicienStats", () => {
  it("groupe par technicien et trie par count desc", () => {
    const stats = computeTechnicienStats([
      { status: "en_cours", created_at: "", technicien_id: "t1" },
      { status: "en_cours", created_at: "", technicien_id: "t1" },
      { status: "en_cours", created_at: "", technicien_id: "t2" },
      { status: "en_cours", created_at: "", technicien_id: null },
    ]);
    expect(stats).toEqual([
      { technicienId: "t1", dossierCount: 2 },
      { technicienId: "t2", dossierCount: 1 },
    ]);
  });
});
