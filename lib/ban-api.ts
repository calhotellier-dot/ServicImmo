/**
 * Helpers pour l'API BAN (Base Adresse Nationale — gouv.fr).
 *
 * Endpoint public et gratuit, pas de clé :
 *   https://adresse.data.gouv.fr/api-doc/adresse
 *
 * On expose :
 *   - `searchAddresses(query, limit)` : autocomplete
 *   - `isOutOfServiceArea(postalCode)` : alerte pédagogique étape 2
 */

const BAN_ENDPOINT = "https://api-adresse.data.gouv.fr/search/";

export type BanAddressSuggestion = {
  label: string;
  housenumber: string | null;
  street: string | null;
  postcode: string;
  city: string;
  citycode: string;
  context: string; // "37, Indre-et-Loire, Centre-Val de Loire"
  latitude: number | null;
  longitude: number | null;
  score: number;
};

type BanApiResponse = {
  features: Array<{
    properties: {
      label: string;
      housenumber?: string;
      street?: string;
      postcode?: string;
      city?: string;
      citycode?: string;
      context?: string;
      score?: number;
    };
    geometry?: {
      coordinates?: [number, number]; // [lng, lat]
    };
  }>;
};

/**
 * Retourne une liste de suggestions d'adresse pour la chaîne donnée.
 * Retourne un tableau vide si la requête est trop courte ou si l'API échoue.
 */
export async function searchAddresses(
  query: string,
  limit = 5,
  signal?: AbortSignal
): Promise<BanAddressSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url = new URL(BAN_ENDPOINT);
  url.searchParams.set("q", trimmed);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("autocomplete", "1");

  try {
    const res = await fetch(url.toString(), { signal });
    if (!res.ok) return [];
    const json = (await res.json()) as BanApiResponse;
    return json.features.map((feature) => {
      const p = feature.properties;
      const [lng, lat] = feature.geometry?.coordinates ?? [];
      return {
        label: p.label,
        housenumber: p.housenumber ?? null,
        street: p.street ?? null,
        postcode: p.postcode ?? "",
        city: p.city ?? "",
        citycode: p.citycode ?? "",
        context: p.context ?? "",
        latitude: typeof lat === "number" ? lat : null,
        longitude: typeof lng === "number" ? lng : null,
        score: p.score ?? 0,
      };
    });
  } catch {
    // Erreur réseau / parsing → fallback silencieux. L'UI garde l'input manuel.
    return [];
  }
}

/**
 * Départements considérés comme "zone d'intervention privilégiée" pour Servicimmo.
 * 37 = Indre-et-Loire (principal). 41, 36, 72, 49, 86 = limitrophes.
 */
const SERVICE_AREA_DEPTS = new Set(["37", "41", "36", "72", "49", "86"]);

/** True si le code postal est HORS de la zone d'intervention étendue. */
export function isOutOfServiceArea(postalCode: string): boolean {
  const trimmed = postalCode.trim();
  if (trimmed.length < 2) return false;
  const dept = trimmed.slice(0, 2);
  return !SERVICE_AREA_DEPTS.has(dept);
}
