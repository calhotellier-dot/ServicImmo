"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPinIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { searchAddresses, type BanAddressSuggestion } from "@/lib/ban-api";
import { cn } from "@/lib/utils";

export type AddressAutocompleteValue = {
  label: string;
  postal_code: string;
  city: string;
};

type AddressAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (picked: AddressAutocompleteValue) => void;
  placeholder?: string;
  id?: string;
};

/**
 * Champ adresse avec suggestions BAN (API gouv, gratuite).
 *
 * - Debounced 250 ms
 * - Affiche jusqu'à 5 propositions
 * - Au clic, notifie le parent via `onSelect` pour qu'il remplisse aussi
 *   `postal_code` et `city`.
 * - Fallback gracieux si BAN est en erreur : l'utilisateur peut taper
 *   librement, les champs postal/ville restent à remplir manuellement.
 */
export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Commencez à taper votre adresse…",
  id,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<BanAddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(value, 250);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions — setState dans l'effet est volontaire ici : on
  // synchronise le state local avec une source externe (API BAN).
  useEffect(() => {
    const trimmed = debounced.trim();
    if (trimmed.length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    let cancelled = false;

    searchAddresses(trimmed, 5, controller.signal).then((results) => {
      if (!cancelled) setSuggestions(results);
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debounced]);

  // Ferme la dropdown en cliquant à l'extérieur
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const showDropdown = useMemo(() => open && suggestions.length > 0, [open, suggestions]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPinIcon
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pl-9"
        />
      </div>

      {showDropdown ? (
        <ul
          role="listbox"
          className="bg-popover absolute top-full left-0 z-10 mt-1 w-full overflow-hidden rounded-md border shadow-md"
        >
          {suggestions.map((s) => (
            <li key={`${s.label}-${s.citycode}`}>
              <button
                type="button"
                onClick={() => {
                  onChange(s.label);
                  onSelect({
                    label: s.label,
                    postal_code: s.postcode,
                    city: s.city,
                  });
                  setOpen(false);
                }}
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm"
                )}
              >
                <span className="font-medium">{s.label}</span>
                <span className="text-muted-foreground text-xs">{s.context}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
