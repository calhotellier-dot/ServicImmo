/**
 * Types du domaine métier "diagnostic immobilier".
 *
 * Ces types sont partagés entre :
 * - le moteur de règles (`rules.ts`)
 * - le moteur de pricing (`pricing.ts`)
 * - les schémas Zod de validation (`lib/validation/schemas.ts`)
 * - les routes API (`app/api/calculate`, `app/api/quote-request/*`)
 * - la DB (`lib/supabase/types.ts` — mêmes strings d'enum)
 *
 * Règle : toute modification doit être répercutée dans les 3 sources (types,
 * Zod, migration SQL CHECK constraints).
 */

// ---------------------------------------------------------------------------
// Champs du formulaire (alignés sur le schéma Supabase)
// ---------------------------------------------------------------------------

export type ProjectType = "sale" | "rental" | "works" | "coownership" | "other";

export type PropertyType =
  | "house" // Maison
  | "apartment" // Appartement
  | "building" // Immeuble entier
  | "commercial" // Local commercial / professionnel
  | "common_areas" // Parties communes copropriété
  | "land" // Terrain nu
  | "annex" // Cave, garage, dépendance
  | "other";

export type PermitDateRange = "before_1949" | "1949_to_1997" | "after_1997" | "unknown";

export type HeatingType = "gas" | "electric" | "wood" | "fuel" | "heat_pump" | "mixed" | "unknown";

export type GasInstallation =
  | "none"
  | "city_gas"
  | "tank"
  | "bottles"
  | "meter_no_contract"
  | "unknown";

/**
 * Type spécifique à la location : impacte la Loi Boutin.
 * Seule la location **vide** à usage de résidence principale déclenche Boutin.
 */
export type RentalFurnished = "vide" | "meuble" | "saisonnier" | "unknown";

/**
 * Type spécifique aux travaux : influe sur les diagnostics pré-chantier.
 */
export type WorksType =
  | "renovation"
  | "demolition"
  | "voirie" // voirie / enrobés (HAP)
  | "other"
  | "unknown";

/**
 * Données du formulaire utilisées par le moteur de règles.
 *
 * Les champs nullables représentent des réponses non encore fournies (l'utilisateur
 * n'a pas atteint l'étape concernée) OU non applicables (ex: `gas_over_15_years`
 * n'a pas de sens si `gas_installation === 'none'`).
 */
export type QuoteFormData = {
  project_type: ProjectType;
  property_type: PropertyType;
  postal_code: string;
  surface: number;
  rooms_count: number;
  is_coownership: boolean | null;
  permit_date_range: PermitDateRange;
  heating_type: HeatingType;
  gas_installation: GasInstallation;
  gas_over_15_years: boolean | null;
  electric_over_15_years: boolean | null;

  // Optionnels selon le projet
  rental_furnished?: RentalFurnished;
  works_type?: WorksType;
};

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

export type DiagnosticId =
  | "dpe" // DPE logement (vente ou location)
  | "dpe_tertiary" // DPE tertiaire (local pro)
  | "dpe_collective" // DPE collectif (copropriétés > 50 lots, à affiner)
  | "lead" // CREP — plomb vente/location pré-1949
  | "asbestos" // Amiante vente, tous bâtiments pré-1997
  | "dapp" // Amiante location, parties privatives
  | "dta" // Amiante parties communes copropriété
  | "asbestos_works" // Amiante avant travaux (RAT)
  | "lead_works" // Plomb avant travaux
  | "termites"
  | "gas"
  | "electric"
  | "carrez"
  | "boutin"
  | "erp";

export type RequiredDiagnostic = {
  id: DiagnosticId;
  name: string;
  reason: string;
  /** Validité en mois. -1 = illimité (sous réserve de non-survenance d'événement). */
  validityMonths: number;
};

/**
 * Résultat du moteur de règles.
 *
 * - `required` : diagnostics obligatoires détectés avec certitude.
 * - `toClarify` : diagnostics **potentiellement** obligatoires mais dépendant
 *   d'informations que l'utilisateur n'a pas su fournir (ex: "Je ne sais pas"
 *   sur la date du permis de construire). Option B retenue en Session 1 :
 *   ne pas bloquer, ne pas assumer "le pire cas", mais **signaler explicitement**
 *   ces points à clarifier sur place lors de l'intervention.
 */
export type DiagnosticsResult = {
  required: RequiredDiagnostic[];
  toClarify: RequiredDiagnostic[];
};

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export type Urgency = "asap" | "week" | "two_weeks" | "month" | "flexible";

export type PricingContext = {
  /** Surface habitable en m². Utilisée pour le modulateur de surface. */
  surface: number;
  /** Code postal complet. Utilisé pour détecter "zone > 30 km de Tours". */
  postal_code: string;
  /** Type de bien : influe sur DPE, Amiante, DAPP (maison vs appartement). */
  property_type: PropertyType;
  /** Dès que possible (< 48h) → supplément urgence. */
  urgency: Urgency | null;
};

export type PriceEstimate = {
  min: number;
  max: number;
  /** Libellés des modulateurs appliqués (UX pédagogique et debug). */
  appliedModulators: string[];
};
