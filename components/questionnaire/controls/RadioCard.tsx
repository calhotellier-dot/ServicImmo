"use client";

import * as React from "react";
import { RadioGroupItem } from "@radix-ui/react-radio-group";

import { cn } from "@/lib/utils";

export type RadioCardProps = {
  value: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
};

/**
 * Grande "card" cliquable utilisée dans les steps 1 et 4 pour les choix
 * visuels (projet, date permis, chauffage, etc.).
 *
 * À utiliser à l'intérieur d'un `<RadioGroup>` de shadcn/ui. Elle délègue
 * l'input natif à Radix via `RadioGroupItem` (même logique que shadcn radio)
 * et enveloppe le tout dans un label cliquable.
 */
export function RadioCard({
  value,
  title,
  description,
  icon,
  disabled,
  className,
}: RadioCardProps) {
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition",
        "hover:bg-accent/40",
        "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 has-[[data-state=checked]]:shadow-sm",
        "has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50",
        className
      )}
    >
      <RadioGroupItem
        value={value}
        disabled={disabled}
        className="mt-1 size-4 shrink-0 appearance-none rounded-full border outline-hidden data-[state=checked]:border-[color:var(--primary)] data-[state=checked]:bg-[color:var(--primary)]"
      />
      {icon ? (
        <span
          aria-hidden
          className="text-muted-foreground group-has-[[data-state=checked]]:text-primary mt-0.5 flex size-5 items-center justify-center"
        >
          {icon}
        </span>
      ) : null}
      <span className="flex-1 space-y-1">
        <span className="block text-sm font-medium">{title}</span>
        {description ? (
          <span className="text-muted-foreground block text-xs">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
