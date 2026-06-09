import { CheckIcon } from "lucide-react";

type DiagnosticRowProps = {
  index: number;
  name: string;
  reason: string;
  /** Première ligne → pas de border-top. */
  isFirst?: boolean;
};

export function DiagnosticRow({ index, name, reason, isFirst = false }: DiagnosticRowProps) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <div
      className={[
        "flex gap-3.5 py-3.5",
        isFirst ? "" : "border-t border-[var(--color-devis-line)]",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-[var(--branch-bg)] font-mono text-[10px] font-semibold text-[var(--branch-dark)]"
      >
        {num}
      </div>
      <div className="flex-1">
        <div className="text-[15px] font-medium text-[var(--color-devis-ink)]">{name}</div>
        <div className="mt-0.5 text-[13px] leading-relaxed text-[var(--color-devis-muted)]">
          {reason}
        </div>
      </div>
      <CheckIcon
        aria-hidden
        className="mt-2 h-4 w-4 flex-none text-[var(--branch-fg)]"
      />
    </div>
  );
}
