/**
 * Construit les écritures FEC d'une période à partir des factures + paiements
 * d'une organisation (Sprint 5, F-21).
 *
 * Règles simplifiées (schéma classique diagnostic immobilier) :
 * - Émission facture : Dt 411 (Client), Ct 706 (Prestations), Ct 445710 (TVA)
 * - Encaissement : Dt 512 (Banque) / 531 (Caisse), Ct 411 (Client)
 *
 * Fonction pure (les données en entrée viennent de queries côté serveur).
 */

import type { FactureRow, PaiementRow } from "@/lib/supabase/types";

import { formatFec, toFecDate, type FecEntry } from "@/lib/core/fec/format";

export type FecInput = {
  factures: FactureRow[];
  paiements: PaiementRow[];
  /** Libellé client snapshot (si disponible). */
  resolveClientName: (clientId: string | null) => string;
};

const COMPTE_CLIENT = "411000";
const COMPTE_VENTES = "706000";
const COMPTE_TVA_COLLECTEE = "445710";
const COMPTE_BANQUE = "512000";
const COMPTE_CAISSE = "531000";

export function buildFecFromOperations(input: FecInput): FecEntry[] {
  const entries: FecEntry[] = [];
  let seq = 1;

  // ── Émission factures ───────────────────────────────────────────────
  for (const f of input.factures) {
    if (f.status === "annule") continue;
    const ecritureNum = `VT-${seq++}`;
    const pieceDate = toFecDate(f.issued_at);
    const ecritureDate = pieceDate;
    const clientName = input.resolveClientName(f.client_id);
    const mul = f.invoice_type === "avoir" ? -1 : 1;

    entries.push({
      journalCode: "VT",
      journalLib: "Ventes",
      ecritureNum,
      ecritureDate,
      compteNum: COMPTE_CLIENT,
      compteLib: "Clients",
      compAuxNum: f.client_id ?? "",
      compAuxLib: clientName,
      pieceRef: f.reference ?? f.id,
      pieceDate,
      ecritureLib: `${f.invoice_type === "avoir" ? "Avoir" : "Facture"} ${f.reference ?? ""}`.trim(),
      debit: mul * Number(f.total_ttc),
      credit: 0,
      validDate: ecritureDate,
    });
    entries.push({
      journalCode: "VT",
      journalLib: "Ventes",
      ecritureNum,
      ecritureDate,
      compteNum: COMPTE_VENTES,
      compteLib: "Prestations de services",
      pieceRef: f.reference ?? f.id,
      pieceDate,
      ecritureLib: `${f.invoice_type === "avoir" ? "Avoir" : "Facture"} ${f.reference ?? ""}`.trim(),
      debit: 0,
      credit: mul * Number(f.subtotal_ht),
      validDate: ecritureDate,
    });
    entries.push({
      journalCode: "VT",
      journalLib: "Ventes",
      ecritureNum,
      ecritureDate,
      compteNum: COMPTE_TVA_COLLECTEE,
      compteLib: "TVA collectée",
      pieceRef: f.reference ?? f.id,
      pieceDate,
      ecritureLib: `TVA ${f.reference ?? ""}`.trim(),
      debit: 0,
      credit: mul * Number(f.vat_amount),
      validDate: ecritureDate,
    });
  }

  // ── Encaissements ───────────────────────────────────────────────────
  for (const p of input.paiements) {
    const seqN = `ENC-${seq++}`;
    const date = toFecDate(p.paid_at);
    const compteContrepartie =
      p.method === "especes" ? COMPTE_CAISSE : COMPTE_BANQUE;
    const facture = input.factures.find((f) => f.id === p.facture_id);
    const ref = facture?.reference ?? p.facture_id;
    entries.push({
      journalCode: p.method === "especes" ? "CA" : "BQ",
      journalLib: p.method === "especes" ? "Caisse" : "Banque",
      ecritureNum: seqN,
      ecritureDate: date,
      compteNum: compteContrepartie,
      compteLib: p.method === "especes" ? "Caisse" : "Banque",
      pieceRef: ref,
      pieceDate: date,
      ecritureLib: `Encaissement ${ref} (${p.method})`,
      debit: Number(p.amount),
      credit: 0,
      validDate: date,
    });
    entries.push({
      journalCode: p.method === "especes" ? "CA" : "BQ",
      journalLib: p.method === "especes" ? "Caisse" : "Banque",
      ecritureNum: seqN,
      ecritureDate: date,
      compteNum: COMPTE_CLIENT,
      compteLib: "Clients",
      compAuxNum: facture?.client_id ?? "",
      compAuxLib: input.resolveClientName(facture?.client_id ?? null),
      pieceRef: ref,
      pieceDate: date,
      ecritureLib: `Encaissement ${ref}`,
      debit: 0,
      credit: Number(p.amount),
      validDate: date,
    });
  }

  return entries;
}

export function exportFecToString(input: FecInput): string {
  const entries = buildFecFromOperations(input);
  return formatFec(entries);
}
