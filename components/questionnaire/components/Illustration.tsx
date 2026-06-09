import type { ProjectType } from "@/lib/core/diagnostics/types";

import { BRANCHES } from "../lib/branches";

type IllustrationProps = {
  branch: ProjectType;
  selected?: boolean;
};

/**
 * Style B du handoff : grande icône Lucide centrée sur un fond couleur branche.
 * Un petit badge texte (VENTE, LOC., etc.) est affiché en haut à droite.
 *
 * Nécessite que le parent ait injecté les vars CSS `--branch-bg`, `--branch-fg`,
 * `--branch-dark` via `getBranchVars(branch)`.
 */
export function Illustration({ branch, selected = false }: IllustrationProps) {
  const config = BRANCHES[branch];
  const Icon = config.icon;

  return (
    <div
      className={[
        "relative flex aspect-[16/10] w-full items-center justify-center rounded-[10px] transition-colors",
        selected
          ? "bg-[var(--branch-fg)] text-white"
          : "bg-[var(--branch-bg)] text-[var(--branch-dark)]",
      ].join(" ")}
      aria-hidden
    >
      <span
        className="absolute top-3 right-3.5 font-mono text-[10px] tracking-[0.12em] opacity-50"
      >
        {config.badge}
      </span>
      <Icon className="h-[58px] w-[58px]" strokeWidth={1.25} />
    </div>
  );
}
