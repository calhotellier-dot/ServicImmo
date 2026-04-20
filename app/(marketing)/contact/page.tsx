import Link from "next/link";
import { MapPinIcon, PhoneIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Contact",
  description: "Contacter Servicimmo — cabinet de diagnostic immobilier à Tours.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Nous contacter</h1>
      <p className="text-muted-foreground mt-4 leading-relaxed">
        La plupart des demandes sont traitées via notre questionnaire en ligne (devis sous 2 h
        ouvrées). Pour un contact direct, vous pouvez nous appeler ou passer nous voir à Tours.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <a
          href="tel:+33247470123"
          className="hover:bg-accent/40 flex items-start gap-4 rounded-xl border p-6 transition"
        >
          <PhoneIcon className="text-primary size-5 shrink-0" aria-hidden />
          <div>
            <p className="text-sm font-semibold">02 47 47 01 23</p>
            <p className="text-muted-foreground text-xs">Lundi à vendredi, 9h - 19h</p>
          </div>
        </a>
        <div className="flex items-start gap-4 rounded-xl border p-6">
          <MapPinIcon className="text-primary size-5 shrink-0" aria-hidden />
          <div>
            <p className="text-sm font-semibold">
              58 rue de la Chevalerie
              <br />
              37100 Tours
            </p>
            <p className="text-muted-foreground text-xs">Accueil sur rendez-vous</p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <Button asChild size="lg">
          <Link href="/devis">Obtenir un devis en ligne</Link>
        </Button>
      </div>
    </section>
  );
}
