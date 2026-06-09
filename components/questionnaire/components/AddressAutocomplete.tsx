"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

/**
 * Autocomplete d'adresse basé sur l'API BAN (Base Adresse Nationale).
 *
 * - Gratuite, officielle IGN, pas de clé API, CORS activé.
 * - Debounce 250 ms, 5 suggestions max, limite FR seule.
 * - Sur sélection : auto-remplit address + postal_code + city via `onSelect`.
 * - Fallback : si l'API échoue, on n'affiche plus de suggestions mais
 *   l'utilisateur peut continuer à taper librement (onManualChange).
 * - A11y : pattern combobox (role, aria-autocomplete, aria-activedescendant).
 *
 * Endpoint : https://api-adresse.data.gouv.fr/search/?q={q}&limit=5&autocomplete=1
 */

type BanFeature = {
  properties: {
    label: string;
    postcode: string;
    city: string;
    name: string;
    context: string;
    score: number;
    type: string;
  };
};

type BanResponse = {
  features: BanFeature[];
};

type AddressAutocompleteProps = {
  address: string;
  postalCode: string;
  city: string;
  onSelect: (selection: { address: string; postalCode: string; city: string }) => void;
  onManualChange: (address: string) => void;
};

const BAN_ENDPOINT = "https://api-adresse.data.gouv.fr/search/";

export function AddressAutocomplete({
  address,
  postalCode,
  city,
  onSelect,
  onManualChange,
}: AddressAutocompleteProps) {
  const listId = useId();
  const [query, setQuery] = useState(address);
  const [suggestions, setSuggestions] = useState<BanFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [apiError, setApiError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Indique qu'une adresse complète est déjà sélectionnée (query correspond
  // au label stocké ET on a un code postal). Empêche de re-fetcher inutilement
  // juste parce que l'input contient déjà la valeur validée.
  const isSelected =
    query.length > 0 && query === address && !!postalCode && !!city;

  const shouldFetch = query.trim().length >= 3 && !isSelected;
  const canShowList = open && shouldFetch && suggestions.length > 0;

  useEffect(() => {
    if (!shouldFetch) return;

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const url = `${BAN_ENDPOINT}?q=${encodeURIComponent(query)}&limit=5&autocomplete=1`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error("BAN API non-2xx");
        const data = (await res.json()) as BanResponse;
        setSuggestions(data.features ?? []);
        setOpen((data.features ?? []).length > 0);
        setApiError(false);
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setSuggestions([]);
        setApiError(true);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, shouldFetch]);

  function handleSelect(feature: BanFeature) {
    onSelect({
      address: feature.properties.label,
      postalCode: feature.properties.postcode,
      city: feature.properties.city,
    });
    setQuery(feature.properties.label);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--color-devis-muted)]"
        />
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
          }
          autoComplete="street-address"
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            onManualChange(v);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          onBlur={() => {
            // Délai pour laisser au clic sur une option le temps de se déclencher.
            setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Commencez à taper : rue, ville…"
          aria-label="Adresse du bien"
          className="w-full rounded-[10px] border border-[var(--color-devis-line)] bg-white py-3 pr-3.5 pl-10 text-[15px] text-[var(--color-devis-ink)] outline-none transition-colors focus:border-[var(--branch-fg)] focus-visible:ring-2 focus-visible:ring-[var(--branch-fg)]/30 placeholder:text-[var(--color-devis-muted)]/70"
        />
      </div>

      {canShowList ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full right-0 left-0 z-20 mt-1.5 max-h-72 overflow-auto rounded-[10px] border border-[var(--color-devis-line)] bg-white py-1 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)]"
        >
          {suggestions.map((f, i) => (
            <li
              key={`${f.properties.label}-${i}`}
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                // preventDefault pour ne pas perdre le focus (blur cache la liste).
                e.preventDefault();
                handleSelect(f);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={[
                "cursor-pointer px-3.5 py-2.5 text-[14px] text-[var(--color-devis-ink)]",
                i === activeIndex ? "bg-[var(--branch-bg)] text-[var(--branch-dark)]" : "",
              ].join(" ")}
            >
              <span className="block font-medium leading-tight">
                {f.properties.name}
              </span>
              <span className="mt-0.5 block text-[12px] text-[var(--color-devis-muted)]">
                {f.properties.postcode} {f.properties.city}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {apiError ? (
        <p className="mt-1.5 text-[12px] text-amber-700" role="status">
          Service de recherche momentanément indisponible. Tapez quand même votre adresse, nous la
          relirons à la main.
        </p>
      ) : null}
    </div>
  );
}
