import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  description:
    "CGV Servicimmo — conditions contractuelles applicables aux prestations de diagnostic immobilier.",
};

export default function CGVPage() {
  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Conditions Générales de Vente
      </h1>
      <p className="text-muted-foreground mt-3 text-sm">
        Page temporaire — les CGV définitives (PDF ou HTML) seront intégrées par Servicimmo avant
        mise en production.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">Objet</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Les présentes Conditions Générales de Vente régissent les rapports entre Servicimmo et ses
          clients particuliers ou professionnels dans le cadre de la réalisation de diagnostics
          immobiliers obligatoires.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">Devis et commande</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Chaque demande de devis donne lieu à une estimation indicative en ligne, suivie d&apos;un
          devis définitif transmis sous 2 h ouvrées après validation par notre équipe.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">Tarifs et paiement</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Les tarifs affichés sur le site sont indicatifs. Le prix définitif figure sur le devis
          signé par le client.
        </p>
      </section>
    </article>
  );
}
