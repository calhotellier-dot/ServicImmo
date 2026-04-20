/**
 * Supabase client — côté navigateur (Client Components).
 *
 * Utilise la clé `NEXT_PUBLIC_SUPABASE_ANON_KEY` qui est limitée par les
 * policies RLS définies dans `supabase/migrations/0001_initial_schema.sql`.
 *
 * ⚠️ Ne JAMAIS exposer `SUPABASE_SERVICE_ROLE_KEY` côté client.
 */

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";

let cachedClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Retourne un client Supabase singleton pour le navigateur.
 *
 * Throws si les variables d'environnement publiques sont absentes — dans ce
 * cas la page appelante doit gérer l'erreur (la V1 affichera un fallback
 * "service indisponible" jusqu'à provisionnement du projet Supabase).
 */
export function getSupabaseBrowserClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase browser client: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes."
    );
  }

  cachedClient = createBrowserClient<Database>(url, anonKey);
  return cachedClient;
}

/** True si les variables d'environnement Supabase côté navigateur sont présentes. */
export function hasBrowserSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
