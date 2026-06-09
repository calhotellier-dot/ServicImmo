import { defineConfig, devices } from "@playwright/test";

/**
 * Configuration Playwright — Sprint 8.
 *
 * Les tests E2E restent "smoke" à ce stade : le projet Supabase n'est pas
 * encore provisionné. Quand il le sera, on étendra avec les 3 parcours
 * critiques (wizard → devis → paiement, demande docs portail, export FEC).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
