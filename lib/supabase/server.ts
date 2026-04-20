/**
 * Supabase clients — côté serveur (Server Components, Server Actions, API routes).
 *
 * Deux variantes :
 * 1. `getSupabaseServerClient()` — anon key + cookies Next 16 (session utilisateur,
 *    respecte les policies RLS). À utiliser pour les lectures côté serveur
 *    sensibles aux droits.
 * 2. `getSupabaseServiceClient()` — service_role key (bypass RLS) pour les
 *    opérations admin côté backend (insert / update quote_requests depuis les
 *    routes API). Retourne `null` si l'env n'est pas configurée — les routes
 *    API gèrent ce cas avec une réponse 503 explicite.
 */

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

// ---------------------------------------------------------------------------
// Client anon "SSR" : session utilisateur + cookies
// ---------------------------------------------------------------------------

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase server client: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes."
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options: CookieOptions;
        }[]
      ) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // "cookies().set()" lève parfois en Server Component — comportement
          // attendu, ignore (middleware gérera le rafraîchissement de session).
        }
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Client service_role : bypass RLS — à utiliser UNIQUEMENT côté serveur
// ---------------------------------------------------------------------------

/**
 * Retourne un client Supabase privilégié (bypass RLS) ou `null` si les
 * variables d'environnement ne sont pas encore configurées.
 *
 * Les routes API (`/api/quote-request/*`) utilisent ce client pour insérer,
 * mettre à jour et finaliser les demandes. Si `null`, elles répondent en
 * 503 (voir `app/api/quote-request/route.ts`).
 */
export function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** True si les clés serveur Supabase (anon + service_role) sont présentes. */
export function hasServerSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
