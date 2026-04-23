/**
 * Script one-shot — crée un utilisateur test admin dans Supabase.
 *
 * Usage :
 *   pnpm dlx tsx scripts/seed-test-admin.ts
 *
 * Utilise SUPABASE_SERVICE_ROLE_KEY depuis .env.local.
 *
 * Compte créé :
 *   email    : admin@servicimmo.test
 *   password : TestAdmin2026!
 *   rôle     : admin
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Lecture minimale du .env.local (sans dotenv)
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
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local");
  process.exit(1);
}

const EMAIL = "admin@servicimmo.test";
const PASSWORD = "TestAdmin2026!";

async function main() {
  const sb = createClient(URL!, KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Récupérer l'organisation Servicimmo
  const { data: org, error: orgErr } = await sb
    .from("organizations")
    .select("id, name")
    .eq("slug", "servicimmo")
    .single();
  if (orgErr || !org) {
    console.error("❌ Organisation 'servicimmo' introuvable. Migrations 0003/0004 bien appliquées ?");
    process.exit(1);
  }
  console.log(`✓ Organisation trouvée : ${org.name} (${org.id})`);

  // 2. Chercher si l'utilisateur existe déjà
  const { data: existing } = await sb.auth.admin.listUsers();
  const existingUser = existing?.users.find((u) => u.email === EMAIL);

  let userId: string;
  if (existingUser) {
    userId = existingUser.id;
    console.log(`ℹ️  Utilisateur existant : ${EMAIL} (${userId}) — mot de passe inchangé`);
  } else {
    // 3. Créer l'utilisateur auth avec email_confirm=true
    const { data: created, error: createErr } = await sb.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });
    if (createErr || !created.user) {
      console.error("❌ Échec création utilisateur :", createErr?.message);
      process.exit(1);
    }
    userId = created.user.id;
    console.log(`✓ Utilisateur créé : ${EMAIL} (${userId})`);
  }

  // 4. Insérer/upsert le profil étendu
  const { error: profileErr } = await sb.from("users_profiles").upsert(
    {
      id: userId,
      organization_id: org.id,
      first_name: "Admin",
      last_name: "Test",
      role: "admin",
      is_active: true,
    },
    { onConflict: "id" }
  );
  if (profileErr) {
    console.error("❌ Échec insertion profil :", profileErr.message);
    process.exit(1);
  }
  console.log(`✓ Profil admin rattaché à l'organisation`);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Compte de test prêt`);
  console.log(`   URL      : http://localhost:3000/login`);
  console.log(`   Email    : ${EMAIL}`);
  console.log(`   Password : ${PASSWORD}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch((e) => {
  console.error("❌ Erreur :", e);
  process.exit(1);
});
