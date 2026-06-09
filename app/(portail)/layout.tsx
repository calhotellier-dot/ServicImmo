import type { ReactNode } from "react";

/**
 * Layout du groupe (portail) — accès magic link JWT pour clients et
 * prescripteurs.
 *
 * Stub Sprint 0 — la vérification du token arrivera au Sprint 4 (F-13 :
 * portail acceptation devis) et au Sprint 6 (F-23 : demande documents).
 */
export default function PortailLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="text-sm font-medium">Servicimmo · Espace client</div>
          <div className="font-mono text-[11px] tracking-widest text-neutral-400">
            SPRINT 0 — STUB
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
