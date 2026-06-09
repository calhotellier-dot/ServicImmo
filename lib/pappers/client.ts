/**
 * Client Pappers — enrichissement SIRET (Sprint 1, utilisé en Sprint 2+).
 *
 * https://www.pappers.fr/api
 *
 * Fail-soft si `PAPPERS_API_KEY` absente → retourne `null`. L'UI doit
 * afficher un message "enrichissement indisponible" sans crash.
 */

export type PappersCompany = {
  siren: string;
  siret: string;
  denomination: string;
  nomCommercial?: string;
  formeJuridique?: string;
  dateCreation?: string;
  codeNaf?: string;
  libelleNaf?: string;
  adresse?: {
    ligne?: string;
    codePostal?: string;
    ville?: string;
  };
  raw: Record<string, unknown>;
};

export async function fetchPappersBySiret(siret: string): Promise<PappersCompany | null> {
  const apiKey = process.env.PAPPERS_API_KEY;
  if (!apiKey) return null;

  const cleaned = siret.replace(/\s/g, "");
  if (!/^\d{14}$/.test(cleaned)) return null;

  try {
    const res = await fetch(
      `https://api.pappers.fr/v2/entreprise?siret=${cleaned}&api_token=${apiKey}`,
      { next: { revalidate: 86400 } } // cache 24h
    );
    if (!res.ok) return null;
    const raw = (await res.json()) as Record<string, unknown>;
    return {
      siren: String(raw.siren ?? ""),
      siret: cleaned,
      denomination: String(raw.denomination ?? raw.nom_entreprise ?? ""),
      nomCommercial: raw.nom_commercial as string | undefined,
      formeJuridique: (raw.forme_juridique as string) ?? undefined,
      dateCreation: (raw.date_creation as string) ?? undefined,
      codeNaf: (raw.code_naf as string) ?? undefined,
      libelleNaf: (raw.libelle_code_naf as string) ?? undefined,
      adresse: raw.siege
        ? {
            ligne: (raw.siege as Record<string, unknown>).adresse_ligne_1 as string | undefined,
            codePostal: (raw.siege as Record<string, unknown>).code_postal as string | undefined,
            ville: (raw.siege as Record<string, unknown>).ville as string | undefined,
          }
        : undefined,
      raw,
    };
  } catch (e) {
    console.error("[pappers] fetch error", e);
    return null;
  }
}
