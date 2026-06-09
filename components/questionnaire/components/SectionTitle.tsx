import type { ReactNode } from "react";

type SectionTitleProps = {
  kicker?: string;
  children: ReactNode;
  /** Taille du titre. Par défaut `md` (26px). Les heros utilisent `lg`. */
  size?: "md" | "lg" | "xl";
};

export function SectionTitle({ kicker, children, size = "md" }: SectionTitleProps) {
  const sizeClass = {
    md: "text-[26px]",
    lg: "text-[32px] sm:text-[40px]",
    xl: "text-[30px] sm:text-[44px]",
  }[size];

  return (
    <div>
      {kicker ? (
        <div className="mb-2 font-mono text-[11px] tracking-[0.14em] text-[var(--color-devis-muted)]">
          {kicker}
        </div>
      ) : null}
      <h2
        className={[
          "font-serif font-medium tracking-[-0.02em] text-[var(--color-devis-ink)] leading-[1.08]",
          sizeClass,
        ].join(" ")}
      >
        {children}
      </h2>
    </div>
  );
}
