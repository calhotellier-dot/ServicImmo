/**
 * Parseur CSV minimal (fonction pure) pour l'import de contacts (F-04).
 *
 * Gère :
 *   - séparateur `,` ou `;` (auto-détecté)
 *   - guillemets doubles + échappement `""`
 *   - BOM UTF-8 en tête de fichier
 *   - lignes vides ignorées
 *
 * Pas de dépendance externe — on reste dans `lib/features/contacts/` sans
 * tirer Papa Parse ou équivalent. Si le volume explose (> 10k lignes), on
 * migrera vers une lib dédiée.
 */

import { contactCsvRowSchema, type ContactCsvRow } from "./schema";

export type CsvParseResult = {
  rows: ContactCsvRow[];
  errors: Array<{ line: number; message: string }>;
  /** Lignes dédupliquées (par email ou phone normalisé). */
  deduped: ContactCsvRow[];
};

// ---------------------------------------------------------------------------
// Parseur bas niveau (raw CSV → string[][])
// ---------------------------------------------------------------------------

export function parseCsvRaw(text: string): string[][] {
  // Strip BOM
  const input = text.replace(/^\uFEFF/, "");
  if (!input) return [];

  const separator = detectSeparator(input);
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === separator) {
        currentRow.push(currentField);
        currentField = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && input[i + 1] === "\n") i++;
        currentRow.push(currentField);
        if (currentRow.some((v) => v !== "")) rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else {
        currentField += ch;
      }
    }
  }
  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((v) => v !== "")) rows.push(currentRow);
  }
  return rows;
}

function detectSeparator(text: string): string {
  // Premiere ligne : compte les `,` et `;` hors guillemets.
  const firstLine = text.split(/\r?\n/)[0] ?? "";
  let commas = 0;
  let semicolons = 0;
  let inQuotes = false;
  for (const ch of firstLine) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (!inQuotes) {
      if (ch === ",") commas++;
      else if (ch === ";") semicolons++;
    }
  }
  return semicolons > commas ? ";" : ",";
}

// ---------------------------------------------------------------------------
// Mapper CSV → ContactCsvRow + validation Zod + dédup
// ---------------------------------------------------------------------------

export function parseContactsCsv(text: string): CsvParseResult {
  const raw = parseCsvRaw(text);
  const errors: CsvParseResult["errors"] = [];
  const rows: ContactCsvRow[] = [];

  if (raw.length === 0) {
    return { rows: [], errors: [{ line: 0, message: "Fichier vide." }], deduped: [] };
  }

  const header = raw[0]!.map((h) => h.trim().toLowerCase());
  const idx = {
    type: header.indexOf("type"),
    first_name: header.indexOf("first_name"),
    last_name: header.indexOf("last_name"),
    company_name: header.indexOf("company_name"),
    email: header.indexOf("email"),
    phone: header.indexOf("phone"),
    postal_code: header.indexOf("postal_code"),
    city: header.indexOf("city"),
  };

  if (idx.type === -1) {
    errors.push({
      line: 1,
      message:
        "Colonne 'type' manquante. Attendues : type, first_name, last_name, company_name, email, phone, postal_code, city.",
    });
    return { rows: [], errors, deduped: [] };
  }

  for (let i = 1; i < raw.length; i++) {
    const cells = raw[i]!;
    const getCell = (col: number) => (col === -1 ? "" : (cells[col] ?? "").trim());
    const payload = {
      type: getCell(idx.type) as ContactCsvRow["type"],
      first_name: getCell(idx.first_name) || undefined,
      last_name: getCell(idx.last_name) || undefined,
      company_name: getCell(idx.company_name) || undefined,
      email: getCell(idx.email) || undefined,
      phone: getCell(idx.phone) || undefined,
      postal_code: getCell(idx.postal_code) || undefined,
      city: getCell(idx.city) || undefined,
    };
    const parsed = contactCsvRowSchema.safeParse(payload);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ");
      errors.push({ line: i + 1, message: msg });
      continue;
    }
    rows.push(parsed.data);
  }

  return { rows, errors, deduped: dedupeContacts(rows) };
}

// ---------------------------------------------------------------------------
// Dédup (clé = email lowercase si présent, sinon téléphone normalisé)
// ---------------------------------------------------------------------------

export function dedupeContacts(rows: ContactCsvRow[]): ContactCsvRow[] {
  const seen = new Set<string>();
  const out: ContactCsvRow[] = [];
  for (const r of rows) {
    const key = dedupKey(r);
    if (!key) {
      // Pas d'identifiant → on considère unique (on laisse passer).
      out.push(r);
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

function dedupKey(r: ContactCsvRow): string | null {
  if (r.email) return `email:${r.email.toLowerCase().trim()}`;
  if (r.phone) {
    const digits = r.phone.replace(/\D/g, "");
    if (digits.length >= 8) return `phone:${digits}`;
  }
  return null;
}
