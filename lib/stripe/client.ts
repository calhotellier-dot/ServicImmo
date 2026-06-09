/**
 * Client Stripe — Sprint 5 (F-19).
 * Instance singleton côté serveur. Fail-soft si STRIPE_SECRET_KEY absente.
 */

import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // Stripe SDK v22 : le constructeur accepte une config optionnelle. On laisse
  // le SDK utiliser son apiVersion par défaut (compatible prod) pour éviter le
  // cast sur des types qui évoluent d'une mineure à l'autre.
  cached = new Stripe(key);
  return cached;
}

export function hasStripeEnv(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
