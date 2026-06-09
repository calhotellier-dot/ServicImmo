/**
 * Types partagés entre les Server Actions auth et l'UI login/reset.
 * Isolé pour respecter la contrainte Next.js (use server → export async uniquement).
 */

export type AuthActionState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};
