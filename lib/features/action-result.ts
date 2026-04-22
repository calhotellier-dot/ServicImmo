/**
 * Forme de retour standardisée des Server Actions du projet.
 *
 * Isolé de `"use server"` files pour contourner la contrainte Next.js :
 * un fichier "use server" ne peut exporter QUE des fonctions async.
 */

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
