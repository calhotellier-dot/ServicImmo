import { redirect } from "next/navigation";

import { createDraftDossier } from "@/lib/features/dossiers/actions";

/**
 * Route `/app/dossiers/new` — crée un draft puis redirige vers la page détail
 * qui sert de wizard (édition progressive). Pattern Linear-style.
 */
export default async function NewDossierPage() {
  const result = await createDraftDossier();
  if (!result.ok) {
    return (
      <div className="max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <div className="font-medium">Impossible de créer le dossier.</div>
        <p className="mt-1">{result.error}</p>
      </div>
    );
  }
  redirect(`/app/dossiers/${result.data.id}`);
}
