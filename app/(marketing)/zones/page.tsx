export const metadata = {
  title: "Zones d'intervention",
  description: "Servicimmo intervient en Indre-et-Loire et départements limitrophes.",
};

export default function ZonesIndexPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Zones d&apos;intervention
      </h1>
      <p className="text-muted-foreground mt-4 leading-relaxed">
        Nous couvrons principalement l&apos;Indre-et-Loire (37) et les départements limitrophes :
        Loir-et-Cher (41), Indre (36), Sarthe (72), Maine-et-Loire (49), Vienne (86).
      </p>
      <p className="text-muted-foreground mt-3 text-sm">
        Les pages détaillées par ville (Tours, Amboise, Joué-lès-Tours, Chambray-lès-Tours,
        Fondettes…) arrivent dans une prochaine session.
      </p>
    </section>
  );
}
