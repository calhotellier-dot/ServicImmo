import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Servicimmo — cabinet de diagnostic immobilier à Tours.",
};

export default function MentionsLegalesPage() {
  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Mentions légales</h1>
      <p className="text-muted-foreground mt-3 text-sm">
        Dernière mise à jour : avril 2026. Page temporaire — contenu définitif à fournir par
        Servicimmo.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">Éditeur du site</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Servicimmo — 58 rue de la Chevalerie, 37100 Tours.
          <br />
          Téléphone : 02 47 47 01 23.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">Hébergeur</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Vercel Inc. — 440 N Barranca Ave #4133, Covina CA 91723, USA.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">Données personnelles</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Les données collectées via le formulaire de devis sont utilisées exclusivement pour
          traiter votre demande. Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès,
          de rectification et de suppression que vous pouvez exercer par email à{" "}
          <a href="mailto:contact@servicimmo.fr" className="underline">
            contact@servicimmo.fr
          </a>
          .
        </p>
      </section>
    </article>
  );
}
