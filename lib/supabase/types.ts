/**
 * Types TypeScript du schéma Supabase (migration 0001).
 *
 * Écrits manuellement en Session 2 pour ne pas dépendre d'une instance Supabase
 * locale ou distante. En Session 3, lorsque le projet Supabase sera provisionné,
 * ces types seront régénérés automatiquement via :
 *
 *   pnpm dlx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
 *
 * Tant que ce n'est pas fait, les modifications du schéma SQL doivent être
 * répercutées à la main ici (sinon l'autocomplétion ment).
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ---------------------------------------------------------------------------
// Enums implicites du schéma (via CHECK constraints)
// ---------------------------------------------------------------------------

export type QuoteRequestStatus =
  | "draft"
  | "email_captured"
  | "submitted"
  | "quoted"
  | "accepted"
  | "rejected"
  | "archived";

export type ProjectType = "sale" | "rental" | "works" | "coownership" | "other";

export type PermitDateRange = "before_1949" | "1949_to_1997" | "after_1997" | "unknown";

export type RentalFurnished = "vide" | "meuble" | "saisonnier" | "unknown";

export type WorksType = "renovation" | "demolition" | "voirie" | "other" | "unknown";

export type Civility = "mr" | "mme" | "other";

export type ServiceCategory = "particulier" | "pro" | "amiante" | "autre";

// ---------------------------------------------------------------------------
// Row shapes
// ---------------------------------------------------------------------------

export type QuoteRequestRow = {
  id: string;
  created_at: string;
  updated_at: string;
  status: QuoteRequestStatus;

  // Étape 1
  project_type: ProjectType | null;

  // Étape 2
  property_type: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  surface: number | null;
  rooms_count: number | null;
  is_coownership: boolean | null;

  // Étape 3
  email: string | null;
  email_captured_at: string | null;

  // Étape 4
  permit_date_range: PermitDateRange | null;
  heating_type: string | null;
  gas_installation: string | null;
  gas_over_15_years: boolean | null;
  electric_over_15_years: boolean | null;
  rental_furnished: RentalFurnished | null;
  works_type: WorksType | null;

  // Étape 5
  urgency: string | null;
  notes: string | null;
  attachments: Json; // array d'URLs

  // Étape 6
  civility: Civility | null;
  last_name: string | null;
  first_name: string | null;
  phone: string | null;

  // Calculs
  required_diagnostics: Json | null;
  diagnostics_to_clarify: Json | null;
  price_min: number | null;
  price_max: number | null;
  applied_modulators: Json | null;

  // Consentement
  consent_rgpd: boolean;
  consent_at: string | null;

  // Tracking
  source: string | null;
  medium: string | null;
  campaign: string | null;
  referer: string | null;
  user_agent: string | null;
};

export type ServiceRow = {
  id: number;
  slug: string;
  name: string;
  category: ServiceCategory;
  short_description: string | null;
  content: string | null;
  price_min: number | null;
  price_max: number | null;
  duration_minutes: number | null;
  validity_months: number | null;
  is_active: boolean;
  order_index: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type ArticleRow = {
  id: number;
  legacy_id: number | null;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string | null;
  published_at: string | null;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
};

export type CityRow = {
  id: number;
  slug: string;
  name: string;
  postal_code: string | null;
  department: string;
  latitude: number | null;
  longitude: number | null;
  is_primary_zone: boolean;
  seo_content: string | null;
  is_active: boolean;
};

export type QuoteNoteRow = {
  id: number;
  quote_request_id: string;
  author_id: string | null;
  content: string;
  created_at: string;
};

export type ActionLogRow = {
  id: number;
  entity_type: string | null;
  entity_id: string | null;
  action: string | null;
  author_id: string | null;
  metadata: Json | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Database — forme attendue par @supabase/supabase-js
// ---------------------------------------------------------------------------

/**
 * Note : le champ `Relationships: []` est requis par `@supabase/postgrest-js`
 * sur chaque table. Le schéma 0001 ne déclare pas de FK cross-table (en dehors
 * de `quote_notes.quote_request_id` et `quote_notes.author_id` / `action_logs.author_id`),
 * mais même pour les tables sans relation cross-schema il faut déclarer le
 * tableau vide pour satisfaire `GenericTable`.
 */

export type Database = {
  public: {
    Tables: {
      quote_requests: {
        Row: QuoteRequestRow;
        Insert: Partial<Omit<QuoteRequestRow, "id" | "created_at" | "updated_at">> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<QuoteRequestRow, "id" | "created_at">>;
        Relationships: [];
      };
      services: {
        Row: ServiceRow;
        Insert: Omit<ServiceRow, "id" | "created_at" | "updated_at"> & {
          id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ServiceRow, "id" | "created_at">>;
        Relationships: [];
      };
      articles: {
        Row: ArticleRow;
        Insert: Omit<ArticleRow, "id" | "updated_at"> & {
          id?: number;
          updated_at?: string;
        };
        Update: Partial<Omit<ArticleRow, "id">>;
        Relationships: [];
      };
      cities: {
        Row: CityRow;
        Insert: Omit<CityRow, "id"> & { id?: number };
        Update: Partial<Omit<CityRow, "id">>;
        Relationships: [];
      };
      quote_notes: {
        Row: QuoteNoteRow;
        Insert: Omit<QuoteNoteRow, "id" | "created_at"> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Omit<QuoteNoteRow, "id">>;
        Relationships: [
          {
            foreignKeyName: "quote_notes_quote_request_id_fkey";
            columns: ["quote_request_id"];
            referencedRelation: "quote_requests";
            referencedColumns: ["id"];
          },
        ];
      };
      action_logs: {
        Row: ActionLogRow;
        Insert: Omit<ActionLogRow, "id" | "created_at"> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Omit<ActionLogRow, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
