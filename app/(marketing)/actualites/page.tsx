export const metadata = {
  title: "Actualités",
  description:
    "Veille réglementaire sur les diagnostics immobiliers — DPE, amiante, plomb, termites.",
};

export default function ActualitesIndexPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Actualités réglementaires
      </h1>
      <p className="text-muted-foreground mt-4 leading-relaxed">
        Nous publions une veille réglementaire depuis 2017 : DPE 2025-2028, obligations amiante,
        réformes en copropriété…
      </p>
      <p className="text-muted-foreground mt-3 text-sm">
        Les 100 articles de l&apos;ancien site seront migrés dans une prochaine session (script
        `scripts/migrate-articles.ts`).
      </p>
    </section>
  );
}
