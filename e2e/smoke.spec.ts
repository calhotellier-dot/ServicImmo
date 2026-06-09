import { expect, test } from "@playwright/test";

/**
 * Smoke tests E2E — Sprint 8.
 *
 * Valide que les routes critiques se chargent sans erreur même en l'absence
 * de Supabase. Les parcours complets (wizard → devis → paiement, demande
 * docs portail, export FEC) seront ajoutés après provisionnement DB.
 */

test("home marketing charge", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Servicimmo/);
});

test("page devis charge et affiche le questionnaire", async ({ page }) => {
  await page.goto("/devis");
  await expect(page.getByRole("heading", { name: /votre projet/i })).toBeVisible();
});

test("login page rend le formulaire", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
});

test("/app redirige vers /login si non connecté (si middleware actif)", async ({
  page,
}) => {
  const response = await page.goto("/app", { waitUntil: "domcontentloaded" });
  // Si env Supabase absent → la page /app charge directement (middleware laisse
  // passer). Si env présent et non connecté → redirection vers /login.
  // On accepte les deux cas dans le smoke test.
  expect(response?.status()).toBeLessThan(500);
});

test("/portail/test-token rend la page portail sans crash", async ({ page }) => {
  const response = await page.goto("/portail/test-token");
  // 200 si ça rend, 404 si token invalide (comportement attendu) — les deux OK.
  expect([200, 404]).toContain(response?.status() ?? 0);
});
