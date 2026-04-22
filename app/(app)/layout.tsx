import type { ReactNode } from "react";

/**
 * Layout du groupe (app) — app Pilote interne (Phase 1 PRIORITAIRE).
 *
 * Stub Sprint 0 — l'authentification + sidebar + header arriveront au
 * Sprint 1 (F-02, F-03). Pour l'instant, enveloppe minimale.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="text-sm font-medium">Servicimmo · App Pilote</div>
          <div className="font-mono text-[11px] tracking-widest text-neutral-400">
            SPRINT 0 — STUB
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
