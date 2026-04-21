type PriceHeroProps = {
  min: number;
  max: number;
  appliedModulators: string[];
};

/**
 * Bloc "Estimation TTC" en haut du RecapScreen.
 * Le blob décoratif en haut-droite utilise `--branch-bg` avec 50% d'opacité.
 */
export function PriceHero({ min, max, appliedModulators }: PriceHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-[var(--color-devis-line)] bg-white p-5 sm:p-7">
      <div
        aria-hidden
        className="absolute -top-10 -right-10 h-[140px] w-[140px] rounded-full bg-[var(--branch-bg)] opacity-50"
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-6">
        <div className="min-w-[220px] flex-1">
          <div className="font-mono text-[11px] tracking-[0.12em] text-[var(--color-devis-muted)]">
            ESTIMATION TTC
          </div>
          <div className="mt-1.5 font-serif text-[44px] leading-none font-normal tracking-[-0.03em] text-[var(--color-devis-ink)] sm:text-[58px]">
            {min}{" "}
            <span className="text-[22px] text-[var(--color-devis-muted)] sm:text-[28px]">—</span>{" "}
            {max}{" "}
            <span className="text-[28px] text-[var(--color-devis-ink)] sm:text-[36px]">€</span>
          </div>
          {appliedModulators.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {appliedModulators.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-[var(--branch-bg)] px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--branch-dark)]"
                >
                  {m}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="max-w-[220px] text-[12px] leading-snug text-[var(--color-devis-muted)] sm:text-right">
          Tarifs au 01/01/2026. Devis définitif sous{" "}
          <strong className="font-medium text-[var(--color-devis-ink)]">2 h ouvrées</strong>.
        </div>
      </div>
    </div>
  );
}
