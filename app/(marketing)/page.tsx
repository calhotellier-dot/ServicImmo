import Link from "next/link";
import {
  AwardIcon,
  CalendarClockIcon,
  ClipboardCheckIcon,
  MessagesSquareIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TimerIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------------
          Hero
          --------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b">
        <div className="bg-primary/5 absolute inset-0 -z-10" aria-hidden />
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-3xl space-y-6">
            <p className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-widest uppercase">
              <SparklesIcon className="size-4" aria-hidden />
              Diagnostic immobilier à Tours depuis 1998
            </p>
            <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
              Identifiez vos diagnostics obligatoires en{" "}
              <span className="text-primary decoration-primary/30 underline decoration-4 underline-offset-4">
                2 minutes
              </span>
              .
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
              Vente, location, travaux — notre questionnaire intelligent identifie les diagnostics
              réglementaires pour votre bien et vous donne une estimation tarifaire immédiate. Devis
              définitif sous 2 h ouvrées.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg">
                <Link href="/devis">Commencer mon devis</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="tel:+33247470123">02 47 47 01 23</a>
              </Button>
            </div>
          </div>

          {/* Trust row */}
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon className="text-primary size-4" aria-hidden />
              Certifié Qualixpert
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon className="text-primary size-4" aria-hidden />
              Assuré Allianz
            </span>
            <span className="flex items-center gap-1.5">
              <AwardIcon className="text-primary size-4" aria-hidden />
              FNAIM Diagnostic
            </span>
            <span className="flex items-center gap-1.5">
              <AwardIcon className="text-primary size-4" aria-hidden />
              I.Cert
            </span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Comment ça marche
          --------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl space-y-3">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            Comment ça marche
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Un parcours transparent, de la demande à l&apos;intervention.
          </h2>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-4">
          {[
            {
              icon: <ClipboardCheckIcon className="size-5" />,
              title: "Questionnaire",
              description:
                "2 minutes pour décrire votre projet : type de bien, surface, date du permis.",
            },
            {
              icon: <SparklesIcon className="size-5" />,
              title: "Diagnostics identifiés",
              description: "Notre moteur calcule immédiatement les diagnostics obligatoires.",
            },
            {
              icon: <TimerIcon className="size-5" />,
              title: "Devis sous 2 h",
              description: "Un expert valide votre estimation et vous envoie un devis définitif.",
            },
            {
              icon: <CalendarClockIcon className="size-5" />,
              title: "Intervention rapide",
              description: "RDV sous 48 h en Indre-et-Loire. Rapport transmis sous 5 jours.",
            },
          ].map((step, i) => (
            <li key={step.title} className="space-y-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
                {step.icon}
              </div>
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Étape {i + 1}
              </p>
              <h3 className="text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------------------------------------------------------
          Pourquoi Servicimmo
          --------------------------------------------------------------- */}
      <section className="bg-muted/30 border-y">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase">
              Pourquoi Servicimmo
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              28 ans d&apos;expertise locale, une méthode moderne.
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Cabinet indépendant basé à Tours depuis 1998, nous intervenons en Indre-et-Loire et
              départements limitrophes. Nous sommes certifiés Qualixpert, assurés Allianz, et
              membres de la FNAIM Diagnostic.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed">
              Notre équipe publie une veille réglementaire depuis 2017 et accompagne aussi bien les
              particuliers que les notaires, syndics et agences immobilières locales.
            </p>
          </div>

          {/* Chiffres clés */}
          <dl className="grid grid-cols-2 gap-6">
            {[
              { value: "28", unit: "ans", label: "D'expertise à Tours" },
              { value: "10 000+", unit: "", label: "Diagnostics réalisés" },
              { value: "48 h", unit: "", label: "Délai d'intervention moyen" },
              { value: "100 %", unit: "", label: "Tarifs annoncés à l'avance" },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-card space-y-1 rounded-xl border p-5">
                <dt className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {kpi.value}
                  {kpi.unit ? (
                    <span className="text-muted-foreground ml-1 text-lg font-normal">
                      {kpi.unit}
                    </span>
                  ) : null}
                </dt>
                <dd className="text-muted-foreground text-xs leading-snug">{kpi.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          CTA final
          --------------------------------------------------------------- */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="space-y-5">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Prêt à démarrer votre demande ?
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed">
            En 2 minutes vous saurez exactement ce dont vous avez besoin et à quel prix. Sans
            engagement, sans création de compte.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/devis">Lancer mon devis en 2 minutes</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/contact" className="inline-flex items-center gap-2">
                <MessagesSquareIcon className="size-4" aria-hidden />
                Poser une question
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
