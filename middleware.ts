/**
 * Middleware Next.js 16 — sécurité et rafraîchissement de session Supabase.
 *
 * Responsabilités (Sprint 1) :
 *   1. Rafraîchit la session Supabase (cookies) sur chaque requête.
 *   2. Protège les routes `/app/**` : redirection vers `/login` si non connecté.
 *   3. Redirige un utilisateur connecté qui visite `/login` vers `/app`.
 *
 * Les routes publiques (marketing, devis, /portail/[token], /api) restent
 * accessibles. Le portail sera sécurisé par vérification JWT en Sprint 4.
 *
 * Si l'environnement Supabase n'est pas provisionné (pas de vars env),
 * le middleware laisse passer silencieusement — aucune session à gérer.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Chemins à protéger (route group `(app)` = toute URL /app/...).
const APP_PREFIXES = ["/app"];
// Chemins publics d'authentification (ne pas rediriger si déjà connecté :
// on redirige vers /app à la place).
const AUTH_PATHS = ["/login", "/reset-password"];

function isAppPath(pathname: string): boolean {
  return APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fast path : pas de Supabase → on laisse tout passer (phase dev / preview).
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies: { name: string; value: string; options: CookieOptions }[]) {
        // Propager sur la request ET la response (SSR session refresh).
        for (const { name, value } of cookies) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookies) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route app protégée → redirect /login
  if (isAppPath(pathname) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Déjà connecté sur /login → redirect /app
  if (isAuthPath(pathname) && user) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return response;
}

export const config = {
  // On exclut les assets statiques + routes API (gèrent leur propre auth).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)|api/).*)",
  ],
};
