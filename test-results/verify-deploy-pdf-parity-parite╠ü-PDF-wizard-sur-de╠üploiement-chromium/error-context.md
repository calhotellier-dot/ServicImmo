# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: verify-deploy-pdf-parity.spec.ts >> parité PDF wizard sur déploiement
- Location: e2e/verify-deploy-pdf-parity.spec.ts:26:5

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - heading "Connexion" [level=1] [ref=e5]
    - paragraph [ref=e6]: Accès admin / diagnostiqueur à l'app Pilote.
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: Email
        - textbox "Email" [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e12]: Mot de passe
        - textbox "Mot de passe" [ref=e13]
      - alert [ref=e14]: Service d'authentification non configuré. Le projet Supabase sera provisionné en Sprint 1.
      - button "Se connecter" [ref=e15]
    - generic [ref=e16]: ou
    - generic [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e21]: Lien magique par email
        - textbox "Lien magique par email" [ref=e22]
      - button "Recevoir un lien magique" [ref=e23]
    - link "Mot de passe oublié ?" [ref=e25] [cursor=pointer]:
      - /url: /reset-password
  - alert [ref=e26]
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | /**
  4  |  * Vérification du déploiement — parité fiche papier Servicimmo.
  5  |  *
  6  |  * Lance avec :
  7  |  *   PLAYWRIGHT_BASE_URL=https://servicimmoc.vercel.app \
  8  |  *   TEST_EMAIL=admin@servicimmo.test \
  9  |  *   TEST_PASSWORD=TestAdmin2026! \
  10 |  *   pnpm playwright test e2e/verify-deploy-pdf-parity.spec.ts --project=chromium --headed=false
  11 |  */
  12 | 
  13 | const EMAIL = process.env.TEST_EMAIL ?? "admin@servicimmo.test";
  14 | const PASSWORD = process.env.TEST_PASSWORD ?? "TestAdmin2026!";
  15 | 
  16 | const EXPECTED_SECTIONS = [
  17 |   "PARTIES PRENANTES",
  18 |   "PROJET & BIEN",
  19 |   "DÉPENDANCES",
  20 |   "CHAUFFAGE, ECS & GAZ",
  21 |   "DIAGNOSTICS EN COURS DE VALIDITÉ",
  22 |   "ACCÈS & LOCATAIRES",
  23 |   "PLANNING & NOTES",
  24 | ];
  25 | 
  26 | test("parité PDF wizard sur déploiement", async ({ page }) => {
  27 |   test.setTimeout(90_000);
  28 | 
  29 |   // 1. Login
  30 |   await page.goto("/login");
  31 |   await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
  32 |   await page.getByLabel("Email").first().fill(EMAIL);
  33 |   await page.getByLabel("Mot de passe").fill(PASSWORD);
  34 |   await page.getByRole("button", { name: /se connecter/i }).click();
> 35 |   await page.waitForURL(/\/app(\/|$)/, { timeout: 15_000 });
     |              ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  36 | 
  37 |   // 2. Créer un dossier draft via la page /app/dossiers/new
  38 |   await page.goto("/app/dossiers/new");
  39 |   await page.waitForURL(/\/app\/dossiers\/[0-9a-f-]{36}$/, { timeout: 15_000 });
  40 | 
  41 |   // 3. Vérifier que toutes les sections clés sont présentes
  42 |   await expect(page.getByRole("heading", { name: "Wizard dossier" })).toBeVisible();
  43 | 
  44 |   for (const section of EXPECTED_SECTIONS) {
  45 |     await expect(
  46 |       page.getByText(section, { exact: true }),
  47 |       `Section "${section}" manquante sur le déploiement`
  48 |     ).toBeVisible();
  49 |   }
  50 | 
  51 |   // 4. Screenshot plein page comme preuve
  52 |   await page.screenshot({
  53 |     path: "e2e/verify-deploy-pdf-parity.png",
  54 |     fullPage: true,
  55 |   });
  56 | });
  57 | 
```