import { Button } from "@/components/ui/button";

/**
 * Page d'accueil — placeholder Session 1.
 * La vraie home (hero + questionnaire + trust + services) sera développée
 * en Session 2 après validation des fondations (rules + pricing + UI kit).
 */
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Propul&apos;seo × Servicimmo
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Refonte servicimmo.fr</h1>
        <p className="text-muted-foreground max-w-xl text-balance">
          Projet en cours de développement — Session 1 : fondations techniques. Moteur de règles et
          estimation tarifaire posés, questionnaire à venir.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <a href="/devis">Commencer mon devis</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/services">Nos services</a>
        </Button>
      </div>
    </main>
  );
}
