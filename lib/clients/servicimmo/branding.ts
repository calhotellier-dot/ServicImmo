/**
 * Branding cabinet Servicimmo.
 * Stub Sprint 0 — charte à finaliser avec Servicimmo (cf. MASTER-PLAN.md §4).
 */

export const servicimmoBranding = {
  /** Nom affiché dans header, emails, PDF. */
  displayName: "Servicimmo",
  /** Slogan court. */
  tagline: "Diagnostics immobiliers — 28 ans à Tours",
  /** Palette principale (tokens CSS variables — à raffiner Sprint 1). */
  colors: {
    primary: "#1F3A5F", // bleu de Prusse (suggéré MASTER-PLAN)
    primaryLight: "#E8EEF5",
    accent: "#C8E06D", // anis (palette home D3 existante)
    ink: "#1A1A1A",
    muted: "#6B7280",
    background: "#FFFFFF",
    surface: "#FAFAF7",
  },
  /** Polices (à confirmer Sprint 1). */
  fonts: {
    sans: "Inter, system-ui, sans-serif",
    serif: "Fraunces, Georgia, serif",
    mono: "ui-monospace, SFMono-Regular, monospace",
  },
  /** Logo (placeholder — à remplacer par l'asset définitif). */
  logo: {
    src: "/logos/servicimmo.svg",
    alt: "Servicimmo",
    width: 160,
    height: 40,
  },
} as const;

export type ServicimmoBranding = typeof servicimmoBranding;
