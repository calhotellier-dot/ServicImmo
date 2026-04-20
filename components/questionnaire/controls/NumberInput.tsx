"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NumberInputProps = Omit<React.ComponentProps<"input">, "type" | "onChange" | "value"> & {
  value: number | null;
  onChange: (value: number | null) => void;
  suffix?: string;
  min?: number;
  max?: number;
};

/**
 * Input numérique avec suffixe visuel (ex: "m²", "pièces").
 * Expose une valeur en `number | null` (pas de NaN).
 */
export function NumberInput({
  value,
  onChange,
  suffix,
  min,
  max,
  className,
  inputMode,
  ...rest
}: NumberInputProps) {
  return (
    <div className={cn("relative flex items-stretch", className)}>
      <Input
        type="number"
        inputMode={inputMode ?? "numeric"}
        min={min}
        max={max}
        value={value === null ? "" : value}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onChange(null);
            return;
          }
          const n = Number(raw);
          onChange(Number.isNaN(n) ? null : n);
        }}
        className={cn(suffix ? "pr-12" : undefined)}
        {...rest}
      />
      {suffix ? (
        <span
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium"
        >
          {suffix}
        </span>
      ) : null}
    </div>
  );
}
