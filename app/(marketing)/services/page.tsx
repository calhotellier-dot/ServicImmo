import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Nos services",
  description: "Catalogue complet des diagnostics immobiliers Servicimmo.",
};

export default function ServicesIndexPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20 text-center">
      <p className="text-primary text-xs font-semibold tracking-widest uppercase">
        Prochaine session
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Catalogue des services à venir
      </h1>
      <p className="text-muted-foreground mx-auto mt-4 max-w-xl leading-relaxed">
        DPE, amiante, termites, plomb, gaz, électricité, Loi Carrez / Boutin, ERP… les pages
        détaillées sont en cours de rédaction. En attendant, notre questionnaire identifie les
        diagnostics adaptés à votre projet.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/devis">Calculer mes diagnostics</Link>
      </Button>
    </section>
  );
}
