import { CheckCircle2Icon, CircleHelpIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RequiredDiagnostic } from "@/lib/diagnostics/types";

type DiagnosticCardProps = {
  diagnostic: RequiredDiagnostic;
  variant?: "required" | "toClarify";
};

/**
 * Card de diagnostic affichée dans l'étape 6 (récapitulatif).
 * - `required` : vert/primaire, case cochée.
 * - `toClarify` : ton neutre, icône point d'interrogation.
 */
export function DiagnosticCard({ diagnostic, variant = "required" }: DiagnosticCardProps) {
  const isToClarify = variant === "toClarify";
  const Icon = isToClarify ? CircleHelpIcon : CheckCircle2Icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        isToClarify ? "bg-muted/40 border-dashed" : "bg-card"
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-5 shrink-0",
          isToClarify ? "text-muted-foreground" : "text-primary"
        )}
        aria-hidden
      />
      <div className="space-y-1">
        <p className="text-sm leading-tight font-medium">{diagnostic.name}</p>
        <p className="text-muted-foreground text-xs leading-snug">{diagnostic.reason}</p>
      </div>
    </div>
  );
}
