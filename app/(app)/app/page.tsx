/**
 * Route `/app` — entrée de l'app Pilote.
 * Stub Sprint 0, redirigera vers /dashboard au Sprint 1.
 */
export default function AppLanding() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-semibold">App Pilote — à venir</h1>
      <p className="text-neutral-600">
        Cette zone hébergera l&apos;ERP métier Servicimmo : dossiers, devis,
        factures, agenda, statistiques. Livraison progressive du Sprint 1 au
        Sprint 8 (voir <code className="font-mono text-sm">MASTER-PLAN.md</code>).
      </p>
      <ul className="mt-3 list-disc pl-6 text-sm text-neutral-600">
        <li>Sprint 1 — auth + contacts + layout app</li>
        <li>Sprint 2 — wizard dossier + kanban</li>
        <li>Sprint 3 — agenda + RDV + documents</li>
        <li>Sprint 4 — devis + facturation + tarification</li>
        <li>Sprint 5 — Stripe + relances + FEC</li>
        <li>Sprint 6 — demande documents</li>
        <li>Sprint 7 — dashboard + statistiques</li>
        <li>Sprint 8 — paramètres + polish + mise en prod</li>
      </ul>
    </div>
  );
}
