"use client";

type RadioOption<T extends string> = {
  value: T;
  label: string;
};

type RadioRowProps<T extends string> = {
  options: ReadonlyArray<RadioOption<T>>;
  value: T | null | undefined;
  onChange: (value: T) => void;
  ariaLabel?: string;
  /** Largeur du layout : par défaut `auto` (auto-fit N colonnes). */
  columns?: number;
};

/**
 * Grille de choix en boutons pleine largeur. Utilisé pour les tri-state
 * oui/non/? et pour les choix courts mutuellement exclusifs.
 */
export function RadioRow<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  columns,
}: RadioRowProps<T>) {
  const cols = columns ?? options.length;
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={[
              "rounded-[10px] border px-2.5 py-3 text-center text-[13px] transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--branch-fg)]/40",
              selected
                ? "border-[var(--branch-fg)] bg-[var(--branch-bg)] font-medium text-[var(--branch-dark)]"
                : "border-[var(--color-devis-line)] bg-white text-[var(--color-devis-ink)] hover:border-[var(--branch-fg)]/60",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
