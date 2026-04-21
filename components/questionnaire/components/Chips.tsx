"use client";

type ChipOption<T extends string> = {
  value: T;
  label: string;
};

type ChipsProps<T extends string> = {
  options: ReadonlyArray<ChipOption<T>>;
  value: T | null | undefined;
  onChange: (value: T) => void;
  ariaLabel?: string;
};

/**
 * Groupe de "chips" pour un choix unique parmi plusieurs options textuelles
 * (ex : type de bien). Navigation clavier standard via role="radiogroup".
 */
export function Chips<T extends string>({ options, value, onChange, ariaLabel }: ChipsProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
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
