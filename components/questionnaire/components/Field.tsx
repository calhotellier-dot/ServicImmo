"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  suffix?: string;
};

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { suffix, className = "", ...rest },
  ref
) {
  return (
    <div className="relative">
      <input
        ref={ref}
        {...rest}
        className={[
          "w-full rounded-[10px] border border-[var(--color-devis-line)] bg-white",
          "px-3.5 py-3 text-[15px] text-[var(--color-devis-ink)]",
          suffix ? "pr-10" : "",
          "outline-none transition-colors",
          "focus:border-[var(--branch-fg)] focus-visible:ring-2 focus-visible:ring-[var(--branch-fg)]/30",
          "placeholder:text-[var(--color-devis-muted)]/70",
          className,
        ].join(" ")}
      />
      {suffix ? (
        <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[13px] text-[var(--color-devis-muted)]">
          {suffix}
        </span>
      ) : null}
    </div>
  );
});
