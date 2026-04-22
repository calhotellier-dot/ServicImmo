/**
 * Route `/portail/[token]` — portail client/prescripteur.
 *
 * Stub Sprint 0. La vérification du JWT magic link sera faite en Sprint 4
 * (middleware `(portail)` → redirige si token invalide/expiré).
 */
type PortailPageProps = {
  params: Promise<{ token: string }>;
};

export default async function PortailLanding({ params }: PortailPageProps) {
  const { token } = await params;
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-semibold">Portail client — à venir</h1>
      <p className="text-neutral-600">
        Token reçu : <code className="font-mono text-sm">{token}</code>
      </p>
      <p className="text-sm text-neutral-500">
        Ici viendront l&apos;acceptation de devis (Sprint 4), le paiement de
        facture via Stripe (Sprint 5), la demande de documents (Sprint 6) et
        la vue synthétique du dossier.
      </p>
    </div>
  );
}
