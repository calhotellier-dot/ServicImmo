import { notFound } from "next/navigation";

import { getDemandeByToken } from "@/lib/features/demandes-documents/queries";

import { DemandeItemsList } from "./DemandeItemsList";

type PageProps = { params: Promise<{ token: string; id: string }> };

export default async function PortalDemandePage({ params }: PageProps) {
  const { token, id } = await params;
  const result = await getDemandeByToken(token);
  if (!result || result.demande.id !== id) notFound();
  const { demande, items } = result;

  const expired =
    demande.access_token_expires_at &&
    new Date(demande.access_token_expires_at) < new Date();

  return (
    <div>
      <header className="mb-6">
        <div className="font-mono text-[12px] text-neutral-500">
          Demande {demande.reference}
        </div>
        <h1 className="text-2xl font-semibold">Documents demandés par Servicimmo</h1>
        {demande.message ? (
          <p className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
            {demande.message}
          </p>
        ) : null}
      </header>

      {demande.status === "complete" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          Merci ! Tous les éléments ont bien été transmis. L&apos;équipe Servicimmo vous recontacte.
        </div>
      ) : expired ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Ce lien a expiré. Contactez-nous pour un nouveau lien.
        </div>
      ) : (
        <DemandeItemsList token={token} items={items} />
      )}
    </div>
  );
}
