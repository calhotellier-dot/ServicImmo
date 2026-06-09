"use client";

import { CheckIcon, ChevronUpIcon, PencilIcon } from "lucide-react";
import { useId, type ReactNode } from "react";

import type { SubBlockState } from "../screens/filling/types";

type SubBlockProps = {
  title: string;
  summary?: string;
  state: SubBlockState; // "hidden" → non rendu par l'appelant
  onToggle: () => void;
  children?: ReactNode;
};

/**
 * Un groupe de champs d'une étape, en révélation progressive :
 * - expanded → champs édités (children) + en-tête repliable.
 * - summary → ligne « Titre — valeur » + ✎ (clic = ré-ouvrir).
 * - placeholder → ligne grisée « à remplir » (clic = ouvrir).
 */
export function SubBlock({
  title,
  summary,
  state,
  onToggle,
  children,
}: SubBlockProps) {
  const panelId = useId();

  if (state === "expanded") {
    return (
      <div className="devis-reveal rounded-[10px] border border-[var(--branch-fg)]/30 bg-white p-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded
          aria-controls={panelId}
          className="mb-2 flex w-full items-center gap-2 text-left"
        >
          <span
            aria-hidden
            className="grid h-5 w-5 flex-none place-items-center rounded-full bg-[var(--branch-bg)] text-[10px] font-semibold text-[var(--branch-dark)]"
          >
            ●
          </span>
          <span className="flex-1 text-[13px] font-medium text-[var(--color-devis-ink)]">
            {title}
          </span>
          <ChevronUpIcon
            aria-hidden
            className="h-4 w-4 flex-none text-[var(--color-devis-muted)]"
          />
        </button>
        <div id={panelId}>{children}</div>
      </div>
    );
  }

  const done = state === "summary";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={false}
      className="flex w-full items-center gap-3 rounded-[10px] border border-[var(--color-devis-line)] bg-white/70 px-3 py-2.5 text-left transition-colors hover:border-[var(--branch-fg)]/50"
    >
      <span
        aria-hidden
        className={[
          "grid h-5 w-5 flex-none place-items-center rounded-full text-[10px]",
          done
            ? "bg-[var(--branch-fg)] text-white"
            : "bg-[var(--color-devis-line)] text-[var(--color-devis-muted)]",
        ].join(" ")}
      >
        {done ? <CheckIcon className="h-3 w-3" /> : "·"}
      </span>
      <span className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="flex-none text-[13px] font-medium text-[var(--color-devis-ink)]">
          {title}
        </span>
        <span className="truncate text-[12.5px] text-[var(--color-devis-muted)]">
          {done ? (summary ?? "") : "à remplir"}
        </span>
      </span>
      {done ? (
        <PencilIcon
          aria-hidden
          className="h-3.5 w-3.5 flex-none text-[var(--color-devis-muted)]"
        />
      ) : null}
    </button>
  );
}
