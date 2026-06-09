/**
 * Calcul de distance au siège Servicimmo (Tours, 37000).
 *
 * Utilisé par le moteur de pricing pour appliquer la majoration "+30 € TTC
 * au-delà de 50 km" mentionnée sur la fiche de renseignement papier.
 *
 * Implémentation : formule de haversine + table locale de coordonnées pour
 * les CP d'Indre-et-Loire + villes limitrophes. Pour les CP non couverts,
 * on retourne `null` → le pricing applique alors le fallback historique
 * "hors département 37 = +15 %".
 *
 * À terme : la table de coordonnées peut être remplacée par la table
 * Supabase `cities` (colonnes latitude/longitude). Pour ne pas bloquer sur
 * l'absence de DB, on embarque ici un jeu minimal couvrant >90 % des leads
 * Servicimmo (Indre-et-Loire + Paris + principales agglos).
 */

const TOURS_LAT = 47.3941;
const TOURS_LON = 0.6848;

/** Rayon moyen de la Terre en km. */
const EARTH_RADIUS_KM = 6371;

/**
 * Mini-table CP → coordonnées. Pragmatique, suffisant pour le modulateur
 * distance 50 km. Les CP 37xxx absents tombent dans le fallback "département
 * 37 = dans le périmètre" (distance assumée ≤ 50 km).
 */
const CP_COORDS: Record<string, { lat: number; lon: number }> = {
  // Indre-et-Loire — les plus fréquents
  "37000": { lat: 47.3941, lon: 0.6848 }, // Tours
  "37100": { lat: 47.4167, lon: 0.7 }, // Tours Nord
  "37200": { lat: 47.366, lon: 0.698 }, // Tours Sud
  "37300": { lat: 47.3515, lon: 0.6593 }, // Joué-lès-Tours
  "37400": { lat: 47.413, lon: 0.9818 }, // Amboise
  "37500": { lat: 47.1826, lon: 0.2243 }, // Chinon
  "37520": { lat: 47.3667, lon: 0.6167 }, // La Riche
  "37540": { lat: 47.4167, lon: 0.6333 }, // Saint-Cyr-sur-Loire
  "37550": { lat: 47.35, lon: 0.6333 }, // Saint-Avertin
  "37700": { lat: 47.3833, lon: 0.75 }, // La Ville-aux-Dames
  "37170": { lat: 47.3167, lon: 0.7 }, // Chambray-lès-Tours
  "37230": { lat: 47.4667, lon: 0.65 }, // Fondettes
  "37250": { lat: 47.2667, lon: 0.7167 }, // Veigné
  "37270": { lat: 47.3333, lon: 0.8333 }, // Montlouis-sur-Loire
  "37600": { lat: 47.1167, lon: 1.0333 }, // Loches
  "37800": { lat: 47.1667, lon: 0.5667 }, // Sainte-Maure-de-Touraine
  // Zones limitrophes (Blois, Le Mans, Poitiers, Orléans) — pour tester
  // proprement la distance 50 km.
  "41000": { lat: 47.5938, lon: 1.3337 }, // Blois (~60 km)
  "72000": { lat: 48.0061, lon: 0.1996 }, // Le Mans (~85 km)
  "86000": { lat: 46.5802, lon: 0.3404 }, // Poitiers (~100 km)
  "45000": { lat: 47.9029, lon: 1.9093 }, // Orléans (~110 km)
  // Paris (pour tests "hors région")
  "75001": { lat: 48.8606, lon: 2.3376 },
  "75015": { lat: 48.8417, lon: 2.2986 },
  // Lyon, Marseille, Lille (sanity checks)
  "69001": { lat: 45.767, lon: 4.8338 },
  "13001": { lat: 43.2965, lon: 5.3698 },
  "59000": { lat: 50.6292, lon: 3.0573 },
};

/**
 * Calcule la distance en km entre Tours et un code postal via haversine.
 * Retourne `null` si le CP n'est pas dans la table locale.
 */
export function distanceFromToursKm(postalCode: string): number | null {
  const normalized = postalCode.trim();
  const coords = CP_COORDS[normalized];
  if (!coords) return null;
  return haversineKm(TOURS_LAT, TOURS_LON, coords.lat, coords.lon);
}

/**
 * Distance à vol d'oiseau entre deux points (lat/lon en degrés).
 * Exporté pour tests unitaires.
 */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
