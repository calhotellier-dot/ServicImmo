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

// ── Enums V2 "rappel téléphone" (migration 0002) ────────────────────────────

export type HeatingMode = "individual" | "collective" | "unknown";
export type EcsType =
  | "same_as_heating"
  | "electric"
  | "gas"
  | "solar"
  | "other"
  | "unknown";
export type ReferralSource =
  | "particulier"
  | "agence"
  | "notaire"
  | "syndic"
  | "recommandation"
  | "autre";
export type CooktopConnection = "souple" | "rigide" | "unknown";
export type PaymentMethod = "cb" | "chq" | "esp" | "virt";

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

  // ── Extensions V2 "rappel téléphone" (migration 0002) ─────────────────
  tenants_in_place: boolean | null;
  access_notes: string | null;
  heating_mode: HeatingMode | null;
  ecs_type: EcsType | null;
  syndic_contact: string | null;
  dependencies: string[] | null;
  dependencies_converted: boolean | null;
  existing_valid_diagnostics: string[] | null;
  existing_diagnostics_files: Json;
  referral_source: ReferralSource | null;
  referral_other: string | null;
  residence_name: string | null;
  floor: number | null;
  is_top_floor: boolean | null;
  door_number: string | null;
  is_duplex: boolean | null;
  purchase_date: string | null;
  cooktop_connection: CooktopConnection | null;
  cadastral_reference: string | null;
  commercial_activity: string | null;
  heated_zones_count: number | null;
  configuration_notes: string | null;
  preferred_payment_method: PaymentMethod | null;
  distance_km: number | null;
};

// ── Table pricing_rules (migration 0002) ─────────────────────────────────

export type PricingRuleRow = {
  id: number;
  diagnostic_id: string;
  context: string;
  price_min: number;
  price_max: number;
  notes: string | null;
  is_active: boolean;
  updated_at: string;
};

// ── Sprint 1 (migrations 0003 / 0004) ─────────────────────────────────────

export type UserRole = "admin" | "diagnostiqueur" | "assistant";
export type ContactRowType = "particulier" | "agence" | "notaire" | "syndic" | "autre";
export type DiagnosticCategory =
  | "logement"
  | "tertiaire"
  | "travaux"
  | "copropriete"
  | "mesurage"
  | "etat";

export type OrganizationRow = {
  id: string;
  created_at: string;
  updated_at: string;
  slug: string;
  name: string;
  siret: string | null;
  iban: string | null;
  tva_intra: string | null;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  settings: Json;
};

export type UserProfileRow = {
  id: string; // = auth.users.id
  organization_id: string;
  created_at: string;
  updated_at: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
};

export type ContactRow = {
  id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  type: ContactRowType;
  civility: Civility | null;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  siret: string | null;
  email: string | null;
  phone: string | null;
  phone_alt: string | null;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  pappers_data: Json | null;
  pappers_enriched_at: string | null;
  notes: string | null;
  tags: string[] | null;
  archived_at: string | null;
};

export type DiagnosticTypeRow = {
  id: number;
  slug: string;
  name: string;
  short_name: string | null;
  category: DiagnosticCategory;
  description: string | null;
  validity_months: number | null;
  is_active: boolean;
  order_index: number;
};

// ── Sprint 2 (migration 0005) ─────────────────────────────────────────────

export type DossierStatus =
  | "brouillon"
  | "a_planifier"
  | "planifie"
  | "en_cours"
  | "realise"
  | "en_facturation"
  | "facture"
  | "paye"
  | "archive"
  | "annule";

export type DossierDiagnosticStatus = "a_realiser" | "realise" | "annule";

export type DossierRow = {
  id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  reference: string | null;
  status: DossierStatus;
  project_type: ProjectType | null;
  property_type: string | null;
  address: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
  surface: number | null;
  rooms_count: number | null;
  is_coownership: boolean | null;
  permit_date_range: PermitDateRange | null;
  heating_type: string | null;
  heating_mode: HeatingMode | null;
  ecs_type: string | null;
  gas_installation: string | null;
  gas_over_15_years: boolean | null;
  electric_over_15_years: boolean | null;
  rental_furnished: RentalFurnished | null;
  works_type: WorksType | null;
  residence_name: string | null;
  floor: number | null;
  is_top_floor: boolean | null;
  door_number: string | null;
  is_duplex: boolean | null;
  dependencies: string[] | null;
  dependencies_converted: boolean | null;
  cadastral_reference: string | null;
  purchase_date: string | null;
  cooktop_connection: CooktopConnection | null;
  commercial_activity: string | null;
  heated_zones_count: number | null;
  configuration_notes: string | null;
  tenants_in_place: boolean | null;
  access_notes: string | null;
  syndic_contact: string | null;
  proprietaire_id: string | null;
  prescripteur_id: string | null;
  technicien_id: string | null;
  existing_valid_diagnostics: string[] | null;
  existing_diagnostics_files: Json;
  required_diagnostics: Json | null;
  diagnostics_to_clarify: Json | null;
  price_min: number | null;
  price_max: number | null;
  applied_modulators: Json | null;
  urgency: string | null;
  notes: string | null;
  requested_date: string | null;
  completion_rate: number;
  tags: string[] | null;
  source_quote_request_id: string | null;
};

export type RendezVousStatus =
  | "planifie"
  | "confirme"
  | "en_cours"
  | "realise"
  | "annule"
  | "reporte";

export type RendezVousRow = {
  id: string;
  organization_id: string;
  dossier_id: string | null;
  technicien_id: string | null;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  location: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  status: RendezVousStatus;
  reminder_sent_at: string | null;
  notes: string | null;
};

export type DocumentCategory = "annexe" | "ddt" | "consentement" | "rapport" | "autre";
export type DocumentSource = "admin" | "portail" | "public";

export type DocumentDossierRow = {
  id: string;
  dossier_id: string;
  uploaded_by: string | null;
  created_at: string;
  category: DocumentCategory;
  name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  source: DocumentSource;
  notes: string | null;
};

// ── Sprint 4 (migration 0007) ─────────────────────────────────────────────

export type DevisStatus =
  | "brouillon"
  | "envoye"
  | "accepte"
  | "refuse"
  | "expire"
  | "annule";

export type FactureStatus =
  | "emise"
  | "payee_partiel"
  | "payee"
  | "en_relance"
  | "litige"
  | "annule";

export type InvoiceType = "facture" | "avoir";

export type PaiementMethodRow = "stripe" | "virement" | "cheque" | "especes";

// ── Sprint 6 (migration 0009) ─────────────────────────────────────────────

export type DemandeStatus =
  | "brouillon"
  | "envoye"
  | "en_cours"
  | "complete"
  | "expire"
  | "annule";

export type DemandeItemType = "document" | "question" | "signature";
export type DemandeItemStatus = "pending" | "completed" | "skipped";

export type ModeleDemandeRow = {
  id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  items: Json;
  is_active: boolean;
};

export type DemandeDocumentsRow = {
  id: string;
  organization_id: string;
  dossier_id: string | null;
  created_at: string;
  updated_at: string;
  reference: string | null;
  status: DemandeStatus;
  recipient_contact_id: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  access_token: string | null;
  access_token_expires_at: string | null;
  message: string | null;
  sent_at: string | null;
  completed_at: string | null;
  due_date: string | null;
};

export type DemandeItemRow = {
  id: string;
  demande_id: string;
  order_index: number;
  item_type: DemandeItemType;
  label: string;
  description: string | null;
  required: boolean;
  status: DemandeItemStatus;
  file_storage_path: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  file_mime: string | null;
  answer_text: string | null;
  signature_data: string | null;
  answered_at: string | null;
};

export type PaiementRow = {
  id: string;
  organization_id: string;
  facture_id: string;
  created_at: string;
  method: PaiementMethodRow;
  amount: number;
  paid_at: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  reference_manual: string | null;
  notes: string | null;
};

export type MajorationRuleType =
  | "TRAVEL_FEE"
  | "AREA_ABOVE_HAB"
  | "URGENT_DELAY"
  | "COLLECTIVE_HEATING"
  | "CUSTOM";

export type DevisRow = {
  id: string;
  organization_id: string;
  dossier_id: string | null;
  created_at: string;
  updated_at: string;
  reference: string | null;
  status: DevisStatus;
  client_id: string | null;
  client_snapshot: Json | null;
  subtotal_ht: number;
  vat_rate: number;
  vat_amount: number;
  total_ttc: number;
  applied_modulators: Json | null;
  accept_token: string | null;
  accept_token_expires_at: string | null;
  accepted_at: string | null;
  refused_at: string | null;
  refusal_reason: string | null;
  pdf_storage_path: string | null;
  valid_until: string | null;
  notes: string | null;
  commentary: string | null;
  sent_at: string | null;
  sent_to_email: string | null;
};

export type DevisLigneRow = {
  id: string;
  devis_id: string;
  order_index: number;
  diagnostic_type_id: number | null;
  label: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type FactureRow = {
  id: string;
  organization_id: string;
  dossier_id: string | null;
  devis_id: string | null;
  created_at: string;
  updated_at: string;
  reference: string | null;
  invoice_type: InvoiceType;
  status: FactureStatus;
  client_id: string | null;
  client_snapshot: Json | null;
  subtotal_ht: number;
  vat_rate: number;
  vat_amount: number;
  total_ttc: number;
  amount_paid: number;
  issued_at: string;
  due_at: string | null;
  pdf_storage_path: string | null;
  credit_of_invoice_id: string | null;
  sent_at: string | null;
  sent_to_email: string | null;
  notes: string | null;
  commentary: string | null;
};

export type FactureLigneRow = {
  id: string;
  facture_id: string;
  order_index: number;
  diagnostic_type_id: number | null;
  label: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type GrilleTarifaireRow = {
  id: number;
  organization_id: string;
  diagnostic_type_id: number;
  context: string;
  price_min: number;
  price_max: number;
  is_active: boolean;
  updated_at: string;
};

export type RegleMajorationRow = {
  id: number;
  organization_id: string;
  rule_type: MajorationRuleType;
  label: string;
  criteria: Json;
  amount_flat: number | null;
  amount_percent: number | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
};

export type DossierDiagnosticRow = {
  id: string;
  dossier_id: string;
  diagnostic_type_id: number;
  status: DossierDiagnosticStatus;
  report_url: string | null;
  completed_at: string | null;
  price_override: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
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
  // Requis par @supabase/supabase-js >= 2.60 (postgrest v12).
  // Sans ce champ, le type générique tombe sur `never` pour toutes les tables.
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
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
      pricing_rules: {
        Row: PricingRuleRow;
        Insert: Omit<PricingRuleRow, "id" | "updated_at"> & {
          id?: number;
          updated_at?: string;
        };
        Update: Partial<Omit<PricingRuleRow, "id">>;
        Relationships: [];
      };
      organizations: {
        Row: OrganizationRow;
        Insert: Partial<Omit<OrganizationRow, "id" | "created_at" | "updated_at">> & {
          name: string;
          slug: string;
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<OrganizationRow, "id" | "created_at">>;
        Relationships: [];
      };
      users_profiles: {
        Row: UserProfileRow;
        Insert: Partial<Omit<UserProfileRow, "created_at" | "updated_at">> & {
          id: string;
          organization_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserProfileRow, "id" | "created_at">>;
        Relationships: [];
      };
      contacts: {
        Row: ContactRow;
        Insert: {
          id?: string;
          organization_id: string;
          type: ContactRowType;
          civility?: Civility | null;
          first_name?: string | null;
          last_name?: string | null;
          company_name?: string | null;
          siret?: string | null;
          email?: string | null;
          phone?: string | null;
          phone_alt?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          postal_code?: string | null;
          city?: string | null;
          country?: string | null;
          pappers_data?: Json | null;
          pappers_enriched_at?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: ContactRowType;
          civility?: Civility | null;
          first_name?: string | null;
          last_name?: string | null;
          company_name?: string | null;
          siret?: string | null;
          email?: string | null;
          phone?: string | null;
          phone_alt?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          postal_code?: string | null;
          city?: string | null;
          country?: string | null;
          pappers_data?: Json | null;
          pappers_enriched_at?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          archived_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      diagnostic_types: {
        Row: DiagnosticTypeRow;
        Insert: Partial<Omit<DiagnosticTypeRow, "id">> & {
          slug: string;
          name: string;
          category: DiagnosticCategory;
          id?: number;
        };
        Update: Partial<Omit<DiagnosticTypeRow, "id">>;
        Relationships: [];
      };
      dossiers: {
        Row: DossierRow;
        Insert: Partial<Omit<DossierRow, "id" | "created_at" | "updated_at">> & {
          organization_id: string;
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DossierRow, "id" | "created_at" | "organization_id">>;
        Relationships: [];
      };
      dossier_diagnostics: {
        Row: DossierDiagnosticRow;
        Insert: Partial<Omit<DossierDiagnosticRow, "id" | "created_at" | "updated_at">> & {
          dossier_id: string;
          diagnostic_type_id: number;
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DossierDiagnosticRow, "id" | "created_at">>;
        Relationships: [];
      };
      rendez_vous: {
        Row: RendezVousRow;
        Insert: Partial<Omit<RendezVousRow, "id" | "created_at" | "updated_at">> & {
          organization_id: string;
          title: string;
          starts_at: string;
          ends_at: string;
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<RendezVousRow, "id" | "created_at" | "organization_id">>;
        Relationships: [];
      };
      documents_dossier: {
        Row: DocumentDossierRow;
        Insert: Partial<Omit<DocumentDossierRow, "id" | "created_at">> & {
          dossier_id: string;
          category: DocumentCategory;
          name: string;
          storage_path: string;
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DocumentDossierRow, "id" | "created_at" | "dossier_id">>;
        Relationships: [];
      };
      devis: {
        Row: DevisRow;
        Insert: Partial<Omit<DevisRow, "id" | "created_at" | "updated_at">> & {
          organization_id: string;
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DevisRow, "id" | "created_at" | "organization_id">>;
        Relationships: [];
      };
      devis_lignes: {
        Row: DevisLigneRow;
        Insert: Partial<Omit<DevisLigneRow, "id">> & {
          devis_id: string;
          label: string;
          id?: string;
        };
        Update: Partial<Omit<DevisLigneRow, "id" | "devis_id">>;
        Relationships: [];
      };
      factures: {
        Row: FactureRow;
        Insert: Partial<Omit<FactureRow, "id" | "created_at" | "updated_at">> & {
          organization_id: string;
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<FactureRow, "id" | "created_at" | "organization_id">>;
        Relationships: [];
      };
      facture_lignes: {
        Row: FactureLigneRow;
        Insert: Partial<Omit<FactureLigneRow, "id">> & {
          facture_id: string;
          label: string;
          id?: string;
        };
        Update: Partial<Omit<FactureLigneRow, "id" | "facture_id">>;
        Relationships: [];
      };
      grille_tarifaire: {
        Row: GrilleTarifaireRow;
        Insert: Partial<Omit<GrilleTarifaireRow, "id" | "updated_at">> & {
          organization_id: string;
          diagnostic_type_id: number;
          price_min: number;
          price_max: number;
          id?: number;
          updated_at?: string;
        };
        Update: Partial<Omit<GrilleTarifaireRow, "id">>;
        Relationships: [];
      };
      regles_majoration: {
        Row: RegleMajorationRow;
        Insert: Partial<Omit<RegleMajorationRow, "id" | "created_at">> & {
          organization_id: string;
          rule_type: MajorationRuleType;
          label: string;
          id?: number;
          created_at?: string;
        };
        Update: Partial<Omit<RegleMajorationRow, "id">>;
        Relationships: [];
      };
      paiements: {
        Row: PaiementRow;
        Insert: Partial<Omit<PaiementRow, "id" | "created_at">> & {
          organization_id: string;
          facture_id: string;
          method: PaiementMethodRow;
          amount: number;
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<PaiementRow, "id" | "created_at" | "organization_id">>;
        Relationships: [];
      };
      modeles_demande: {
        Row: ModeleDemandeRow;
        Insert: Partial<Omit<ModeleDemandeRow, "id" | "created_at" | "updated_at">> & {
          organization_id: string;
          name: string;
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ModeleDemandeRow, "id" | "created_at" | "organization_id">>;
        Relationships: [];
      };
      demandes_documents: {
        Row: DemandeDocumentsRow;
        Insert: Partial<Omit<DemandeDocumentsRow, "id" | "created_at" | "updated_at">> & {
          organization_id: string;
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DemandeDocumentsRow, "id" | "created_at" | "organization_id">>;
        Relationships: [];
      };
      demande_items: {
        Row: DemandeItemRow;
        Insert: Partial<Omit<DemandeItemRow, "id">> & {
          demande_id: string;
          item_type: DemandeItemType;
          label: string;
          id?: string;
        };
        Update: Partial<Omit<DemandeItemRow, "id" | "demande_id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
