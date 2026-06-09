/**
 * Format FEC — Fichier des Écritures Comptables (Sprint 5, F-21).
 *
 * 18 colonnes imposées par l'article A. 47 A-1 du LPF. Séparateur tabulation,
 * décimales avec virgule, encodage UTF-8 BOM, fin de ligne CRLF.
 *
 * Source : https://www.impots.gouv.fr/portail/node/12404
 *
 * Fonction pure — pas d'accès DB. L'appelant fournit les écritures déjà
 * chargées. Tests ≥ 5 cas (header, dates, montants, contrainte équilibre,
 * PDF export hors scope ici).
 */

export type FecEntry = {
  /** JournalCode (max 10 car) */
  journalCode: string;
  /** JournalLib (max 55) */
  journalLib: string;
  /** EcritureNum */
  ecritureNum: string;
  /** EcritureDate (YYYYMMDD) */
  ecritureDate: string; // ISO input converti
  /** CompteNum (411 client, 706/707 produits, 445 TVA, 512 banque, etc.) */
  compteNum: string;
  compteLib: string;
  /** CompAuxNum — numéro auxiliaire (client/fournisseur) */
  compAuxNum?: string;
  compAuxLib?: string;
  /** PieceRef (numéro facture) */
  pieceRef: string;
  /** PieceDate (date de la pièce) */
  pieceDate: string;
  /** EcritureLib */
  ecritureLib: string;
  /** Debit (positif, formatté virgule) */
  debit: number;
  /** Credit (positif) */
  credit: number;
  /** EcritureLet (optionnel, lettrage) */
  ecritureLet?: string;
  /** DateLet */
  dateLet?: string;
  /** ValidDate (YYYYMMDD) */
  validDate: string;
  /** Montantdevise */
  montantDevise?: number;
  /** Idevise */
  idevise?: string;
};

const HEADERS = [
  "JournalCode",
  "JournalLib",
  "EcritureNum",
  "EcritureDate",
  "CompteNum",
  "CompteLib",
  "CompAuxNum",
  "CompAuxLib",
  "PieceRef",
  "PieceDate",
  "EcritureLib",
  "Debit",
  "Credit",
  "EcritureLet",
  "DateLet",
  "ValidDate",
  "Montantdevise",
  "Idevise",
];

export function formatFec(entries: FecEntry[]): string {
  const lines = [HEADERS.join("\t")];
  for (const e of entries) {
    lines.push(
      [
        e.journalCode,
        e.journalLib,
        e.ecritureNum,
        e.ecritureDate,
        e.compteNum,
        e.compteLib,
        e.compAuxNum ?? "",
        e.compAuxLib ?? "",
        e.pieceRef,
        e.pieceDate,
        e.ecritureLib,
        formatMontant(e.debit),
        formatMontant(e.credit),
        e.ecritureLet ?? "",
        e.dateLet ?? "",
        e.validDate,
        e.montantDevise !== undefined ? formatMontant(e.montantDevise) : "",
        e.idevise ?? "",
      ].join("\t")
    );
  }
  // UTF-8 BOM + CRLF
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}

/** FR decimal : virgule, 2 décimales exactes, pas de séparateur de milliers. */
export function formatMontant(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

/** Vérifie l'équilibre global d'un set d'écritures (Debit = Credit). */
export function isBalanced(entries: FecEntry[]): boolean {
  let d = 0;
  let c = 0;
  for (const e of entries) {
    d += e.debit;
    c += e.credit;
  }
  return Math.abs(d - c) < 0.005;
}

/** Convertit une date ISO (YYYY-MM-DD ou ISO Z) vers le format FEC YYYYMMDD. */
export function toFecDate(iso: string): string {
  const d = iso.slice(0, 10).replace(/-/g, "");
  if (!/^\d{8}$/.test(d)) throw new Error(`Date FEC invalide : ${iso}`);
  return d;
}
