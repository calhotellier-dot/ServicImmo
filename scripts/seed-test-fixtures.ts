/**
 * Script idempotent — fixtures pour tests E2E et démos.
 *
 * Usage :
 *   pnpm dlx tsx scripts/seed-test-fixtures.ts
 *
 * Crée (si inexistants) :
 *   - 5 contacts particuliers (propriétaires fictifs Tours / Indre-et-Loire)
 *   - 3 prescripteurs (1 agence, 1 notaire, 1 syndic)
 *   - 3 dossiers à différents stades (brouillon, à planifier, planifié)
 *
 * Tous les fixtures sont taggués `fixture`. Le script supprime d'abord les
 * lignes existantes avec ce tag (pour l'org Servicimmo) puis ré-insère —
 * idempotent et déterministe (re-run produit toujours le même état).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  try {
    const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]!]) process.env[m[1]!] = m[2];
    }
  } catch {
    // ignore
  }
}
loadEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error(
    "❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local"
  );
  process.exit(1);
}

const sb = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PARTICULIERS = [
  {
    email: "fixture-dupont@example.test",
    civility: "mr",
    first_name: "Jean",
    last_name: "Dupont",
    phone: "0247000001",
    address_line1: "12 rue Nationale",
    postal_code: "37000",
    city: "Tours",
  },
  {
    email: "fixture-martin@example.test",
    civility: "mme",
    first_name: "Sophie",
    last_name: "Martin",
    phone: "0247000002",
    address_line1: "5 avenue de Grammont",
    postal_code: "37000",
    city: "Tours",
  },
  {
    email: "fixture-bernard@example.test",
    civility: "mr",
    first_name: "Pierre",
    last_name: "Bernard",
    phone: "0247000003",
    address_line1: "23 rue Bretonneau",
    postal_code: "37000",
    city: "Tours",
  },
  {
    email: "fixture-leroy@example.test",
    civility: "mme",
    first_name: "Claire",
    last_name: "Leroy",
    phone: "0247000004",
    address_line1: "8 place Plumereau",
    postal_code: "37000",
    city: "Tours",
  },
  {
    email: "fixture-moreau@example.test",
    civility: "mr",
    first_name: "Thomas",
    last_name: "Moreau",
    phone: "0247000005",
    address_line1: "47 boulevard Béranger",
    postal_code: "37100",
    city: "Tours",
  },
];

const PRESCRIPTEURS = [
  {
    email: "fixture-agence-loire@example.test",
    type: "agence",
    company_name: "Agence Loire Immobilier",
    first_name: "Julie",
    last_name: "Petit",
    phone: "0247100001",
    address_line1: "100 rue Nationale",
    postal_code: "37000",
    city: "Tours",
  },
  {
    email: "fixture-notaire-touraine@example.test",
    type: "notaire",
    company_name: "Étude Notariale Touraine",
    first_name: "Marc",
    last_name: "Lefèvre",
    phone: "0247100002",
    address_line1: "15 rue Colbert",
    postal_code: "37000",
    city: "Tours",
  },
  {
    email: "fixture-syndic-centre@example.test",
    type: "syndic",
    company_name: "Syndic Centre Loire",
    first_name: "Anne",
    last_name: "Roux",
    phone: "0247100003",
    address_line1: "3 rue de la République",
    postal_code: "37100",
    city: "Tours",
  },
];

const DOSSIERS = [
  {
    reference: "FIXTURE-001",
    status: "brouillon" as const,
    project_type: "sale" as const,
    property_type: "house" as const,
    address: "12 rue Nationale",
    postal_code: "37000",
    city: "Tours",
    surface: 95,
    rooms_count: 4,
    is_coownership: false,
    permit_date_range: "1949_to_1997" as const,
    proprietaire_email: "fixture-dupont@example.test",
    prescripteur_email: "fixture-notaire-touraine@example.test",
    notes: "Vente maison familiale, signature prévue en juin.",
  },
  {
    reference: "FIXTURE-002",
    status: "a_planifier" as const,
    project_type: "rental" as const,
    property_type: "apartment" as const,
    address: "5 avenue de Grammont",
    postal_code: "37000",
    city: "Tours",
    surface: 52,
    rooms_count: 2,
    is_coownership: true,
    permit_date_range: "after_1997" as const,
    residence_name: "Résidence Les Tilleuls",
    floor: 3,
    door_number: "B12",
    proprietaire_email: "fixture-martin@example.test",
    prescripteur_email: "fixture-agence-loire@example.test",
    rental_furnished: "vide" as const,
    notes: "Location vide, locataires précédents partis fin mars.",
  },
  {
    reference: "FIXTURE-003",
    status: "planifie" as const,
    project_type: "sale" as const,
    property_type: "apartment" as const,
    address: "23 rue Bretonneau",
    postal_code: "37000",
    city: "Tours",
    surface: 78,
    rooms_count: 3,
    is_coownership: true,
    permit_date_range: "before_1949" as const,
    residence_name: "Résidence du Vieux Tours",
    floor: 2,
    is_top_floor: false,
    heating_type: "gas" as const,
    heating_mode: "collective" as const,
    syndic_contact: "Syndic Centre Loire — 02 47 10 00 03",
    gas_installation: "city_gas" as const,
    gas_over_15_years: true,
    proprietaire_email: "fixture-bernard@example.test",
    prescripteur_email: "fixture-syndic-centre@example.test",
    notes: "Diagnostics urgents, RDV programmé semaine prochaine.",
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // 1. Org
  const { data: org, error: orgErr } = await sb
    .from("organizations")
    .select("id, name")
    .eq("slug", "servicimmo")
    .single();
  if (orgErr || !org) {
    console.error("❌ Organisation 'servicimmo' introuvable.");
    process.exit(1);
  }
  console.log(`✓ Organisation : ${org.name}`);

  // 2. Wipe fixtures existants (dossiers d'abord pour respecter les FK)
  console.log(`\n— Nettoyage fixtures précédents —`);
  const { error: delDossiersErr, count: delDossiers } = await sb
    .from("dossiers")
    .delete({ count: "exact" })
    .eq("organization_id", org.id)
    .contains("tags", ["fixture"]);
  if (delDossiersErr) console.error("  ✗ delete dossiers :", delDossiersErr.message);
  else console.log(`  ✓ ${delDossiers ?? 0} dossiers fixtures supprimés`);

  const { error: delContactsErr, count: delContacts } = await sb
    .from("contacts")
    .delete({ count: "exact" })
    .eq("organization_id", org.id)
    .contains("tags", ["fixture"]);
  if (delContactsErr) console.error("  ✗ delete contacts :", delContactsErr.message);
  else console.log(`  ✓ ${delContacts ?? 0} contacts fixtures supprimés`);

  // 3. Insert particuliers
  console.log(`\n— Contacts particuliers —`);
  for (const c of PARTICULIERS) {
    const { error } = await sb.from("contacts").insert({
      ...c,
      organization_id: org.id,
      type: "particulier",
      tags: ["fixture"],
    });
    if (error) console.error(`  ✗ ${c.email} →`, error.message);
    else console.log(`  ✓ ${c.first_name} ${c.last_name} (${c.email})`);
  }

  // 4. Insert prescripteurs
  console.log(`\n— Prescripteurs —`);
  for (const c of PRESCRIPTEURS) {
    const { error } = await sb.from("contacts").insert({
      ...c,
      organization_id: org.id,
      tags: ["fixture"],
    });
    if (error) console.error(`  ✗ ${c.email} →`, error.message);
    else console.log(`  ✓ ${c.company_name} (${c.email})`);
  }

  // 5. Map emails → IDs (pour rattacher les dossiers)
  const { data: allContacts } = await sb
    .from("contacts")
    .select("id, email")
    .eq("organization_id", org.id)
    .contains("tags", ["fixture"]);
  const idByEmail = new Map((allContacts ?? []).map((c) => [c.email, c.id]));

  // 6. Insert dossiers
  console.log(`\n— Dossiers —`);
  for (const d of DOSSIERS) {
    const { proprietaire_email, prescripteur_email, ...rest } = d;
    const proprietaire_id = idByEmail.get(proprietaire_email) ?? null;
    const prescripteur_id = idByEmail.get(prescripteur_email) ?? null;

    const { error } = await sb.from("dossiers").insert({
      ...rest,
      organization_id: org.id,
      proprietaire_id,
      prescripteur_id,
      tags: ["fixture"],
    });
    if (error) console.error(`  ✗ ${d.reference} →`, error.message);
    else console.log(`  ✓ ${d.reference} — ${d.status} — ${d.address}, ${d.city}`);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Fixtures prêts`);
  console.log(`   ${PARTICULIERS.length} particuliers + ${PRESCRIPTEURS.length} prescripteurs + ${DOSSIERS.length} dossiers`);
  console.log(`   Tag : "fixture"`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch((e) => {
  console.error("❌ Erreur :", e);
  process.exit(1);
});
