import type { ReactNode } from "react";

type LabelProps = {
  htmlFor?: string;
  children: ReactNode;
  help?: ReactNode;
};

export function Label({ htmlFor, children, help }: LabelProps) {
  return (
    <div className="mb-2 flex flex-col gap-0.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-[var(--color-devis-ink)]"
      >
        {children}
      </label>
      {help ? (
        <span className="text-[12px] leading-snug text-[var(--color-devis-muted)]">
          {help}
        </span>
      ) : null}
    </div>
  );
}
