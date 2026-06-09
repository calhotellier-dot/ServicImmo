import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

/**
 * Architecture en couches (MASTER-PLAN.md §2) enforcée via
 * `import/no-restricted-paths`.
 *
 *   lib/core     ──✗──▶  lib/features, lib/clients, app/
 *   lib/features ──✗──▶  lib/clients, app/
 *
 * Les couches "infrastructure" (lib/supabase, lib/stripe, lib/resend, lib/ban,
 * lib/pappers, lib/validation) restent accessibles à features/clients/app
 * mais pas à core (pur). Si on veut un jour interdire aussi core → lib/supabase,
 * étendre la liste ci-dessous.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { import: importPlugin },
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            // lib/core ne peut pas importer depuis features, clients, app.
            {
              target: "./lib/core",
              from: "./lib/features",
              message: "lib/core est une couche pure — elle ne peut pas dépendre de lib/features.",
            },
            {
              target: "./lib/core",
              from: "./lib/clients",
              message:
                "lib/core est une couche pure — elle ne peut pas dépendre de lib/clients (specifics cabinet). Injecter les overrides en paramètre.",
            },
            {
              target: "./lib/core",
              from: "./app",
              message: "lib/core ne doit rien savoir de la couche app/.",
            },
            // lib/features ne peut pas importer depuis clients.
            {
              target: "./lib/features",
              from: "./lib/clients",
              message:
                "lib/features est mutualisé — les specifics cabinet doivent être passés en paramètre, pas importés.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Supabase Edge Functions tournent en Deno, hors TypeScript projet.
    "supabase/functions/**",
  ]),
]);

export default eslintConfig;
