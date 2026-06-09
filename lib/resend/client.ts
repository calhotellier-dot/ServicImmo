/**
 * Client Resend — Sprint 5.
 * Fail-soft : retourne null si RESEND_API_KEY absente.
 */

import { Resend } from "resend";

let cached: Resend | null = null;

export function getResend(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached = new Resend(key);
  return cached;
}

export function hasResendEnv(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "devis@servicimmo.fr";
}

export function getEmailInternal(): string {
  return process.env.EMAIL_INTERNAL ?? process.env.EMAIL_INTERNAL_NOTIFICATION ?? "contact@servicimmo.fr";
}
