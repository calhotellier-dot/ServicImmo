"use client";

import { ArrowRightIcon } from "lucide-react";

import type { ProjectType } from "@/lib/core/diagnostics/types";

import { getBranchVars } from "../lib/branch-colors";
import { BRANCHES } from "../lib/branches";
import { Illustration } from "./Illustration";

type BranchCardProps = {
  branch: ProjectType;
  selected?: boolean;
  onClick: (branch: ProjectType) => void;
  /** Compact = variante mobile. */
  compact?: boolean;
};

export function BranchCard({ branch, selected = false, onClick, compact = false }: BranchCardProps) {
  const config = BRANCHES[branch];

  return (
    <button
      type="button"
      onClick={() => onClick(branch)}
      aria-pressed={selected}
      style={getBranchVars(branch)}
      className={[
        "group flex w-full flex-col gap-3 rounded-[14px] border text-left transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--branch-fg)]/40",
        compact ? "gap-2.5 p-3" : "gap-3 p-4",
        selected
          ? "border-[var(--branch-fg)] bg-[var(--branch-bg)] shadow-[0_8px_24px_-12px_var(--branch-fg)]"
          : "border-[var(--color-devis-line)] bg-white hover:border-[var(--branch-fg)]/60",
      ].join(" ")}
    >
      <Illustration branch={branch} selected={selected} />

      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[10px] tracking-[0.1em] text-[var(--color-devis-muted)]">
          {config.num}
        </span>
        <h3
          className={[
            "font-serif font-medium tracking-[-0.01em] text-[var(--color-devis-ink)]",
            compact ? "text-[17px]" : "text-[19px]",
          ].join(" ")}
        >
          {config.label}
        </h3>
      </div>

      <p className="text-[13px] leading-relaxed text-[var(--color-devis-muted)]">
        {config.tagline}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-[var(--color-devis-line)] pt-2">
        <span className="text-[11px] font-medium text-[var(--branch-fg)]">
          {config.stat}
        </span>
        <ArrowRightIcon className="h-4 w-4 text-[var(--branch-fg)] transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}
