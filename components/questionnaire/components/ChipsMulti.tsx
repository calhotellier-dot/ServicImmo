"use client";

type MultiOpt<T extends string> = { value: T; label: string };

/**
 * Groupe de "chips" pour un choix MULTIPLE (cases à cocher stylées).
 * Extrait de FillingScreen lors du découpage — comportement inchangé.
 */
export function ChipsMulti<T extends string>({
  options,
  values,
  onToggle,
  ariaLabel,
}: {
  options: ReadonlyArray<MultiOpt<T>>;
  values: T[];
  onToggle: (v: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            role="checkbox"
            aria-checked={selected}
            onClick={() => onToggle(opt.value)}
            className={[
              "rounded-full border px-3.5 py-2 text-[13px] transition-colors",
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
