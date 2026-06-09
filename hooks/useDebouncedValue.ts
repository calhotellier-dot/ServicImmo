"use client";

import { useEffect, useState } from "react";

/**
 * Retourne une version "debounced" de la valeur fournie.
 * Utile pour l'autocomplete BAN (limiter les fetch au rythme de la frappe).
 */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
