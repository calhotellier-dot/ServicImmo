"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useId, type ReactNode } from "react";

type AccordionProps = {
  step: number;
  title: string;
  /** Résumé affiché quand le bloc est replié ET que `done=true`. */
  summary?: string;
  open: boolean;
  /** Quand true, l'indicateur passe en pastille "check" couleur branche. */
  done?: boolean;
  onToggle: () => void;
  children?: ReactNode;
};

/**
 * Bloc repliable utilisé dans le FillingScreen.
 *
 * A11y : le header est un <button> avec `aria-expanded` et `aria-controls`,
 * le panneau est en `role="region"` labellé par le bouton.
 */
export function Accordion({
  step,
  title,
  summary,
  open,
  done = false,
  onToggle,
  children,
}: AccordionProps) {
  const panelId = useId();
  const headerId = useId();

  return (
    <div
      className={[
        "overflow-hidden rounded-[14px] border border-[var(--color-devis-line)] bg-white",
        open ? "shadow-[0_2px_0_rgba(0,0,0,0.02)]" : "",
      ].join(" ")}
    >
      <button
        id={headerId}
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 px-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--branch-fg)]/40"
      >
        <span
          aria-hidden
          className={[
            "flex h-7 w-7 flex-none items-center justify-center rounded-full font-mono text-[11px] font-semibold",
            done
              ? "bg-[var(--branch-fg)] text-white"
              : "bg-[var(--branch-bg)] text-[var(--branch-dark)]",
          ].join(" ")}
        >
          {done ? <CheckIcon className="h-3.5 w-3.5" /> : step}
        </span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="font-serif text-[17px] leading-tight font-medium tracking-tight text-[var(--color-devis-ink)]">
            {title}
          </span>
          {!open && summary ? (
            <span className="font-mono text-[13px] text-[var(--color-devis-muted)]">
              {summary}
            </span>
          ) : null}
        </span>
        <ChevronDownIcon
          aria-hidden
          className={[
            "h-4.5 w-4.5 flex-none text-[var(--color-devis-muted)] transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className="border-t border-[var(--color-devis-line)] px-5 pt-1 pb-6"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
