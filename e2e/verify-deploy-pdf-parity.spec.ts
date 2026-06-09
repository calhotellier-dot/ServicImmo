import { expect, test } from "@playwright/test";

/**
 * Vérification du déploiement — parité fiche papier Servicimmo.
 *
 * Lance avec :
 *   PLAYWRIGHT_BASE_URL=https://servicimmoc.vercel.app \
 *   TEST_EMAIL=admin@servicimmo.test \
 *   TEST_PASSWORD=TestAdmin2026! \
 *   pnpm playwright test e2e/verify-deploy-pdf-parity.spec.ts --project=chromium --headed=false
 */

const EMAIL = process.env.TEST_EMAIL ?? "admin@servicimmo.test";
const PASSWORD = process.env.TEST_PASSWORD ?? "TestAdmin2026!";

const EXPECTED_SECTIONS = [
  "PARTIES PRENANTES",
  "PROJET & BIEN",
  "DÉPENDANCES",
  "CHAUFFAGE, ECS & GAZ",
  "DIAGNOSTICS EN COURS DE VALIDITÉ",
  "ACCÈS & LOCATAIRES",
  "PLANNING & NOTES",
];

test("parité PDF wizard sur déploiement", async ({ page }) => {
  test.setTimeout(90_000);

  // 1. Login
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
  await page.getByLabel("Email").first().fill(EMAIL);
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await page.waitForURL(/\/app(\/|$)/, { timeout: 15_000 });

  // 2. Créer un dossier draft via la page /app/dossiers/new
  await page.goto("/app/dossiers/new");
  await page.waitForURL(/\/app\/dossiers\/[0-9a-f-]{36}$/, { timeout: 15_000 });

  // 3. Vérifier que toutes les sections clés sont présentes
  await expect(page.getByRole("heading", { name: "Wizard dossier" })).toBeVisible();

  for (const section of EXPECTED_SECTIONS) {
    await expect(
      page.getByText(section, { exact: true }),
      `Section "${section}" manquante sur le déploiement`
    ).toBeVisible();
  }

  // 4. Screenshot plein page comme preuve
  await page.screenshot({
    path: "e2e/verify-deploy-pdf-parity.png",
    fullPage: true,
  });
});
