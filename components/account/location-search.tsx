"use client";

import * as React from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import type { ResolvedLocation } from "@/lib/use-current-location";
import { Input } from "@/components/ui/input";

interface PlaceSuggestion {
  placeId: string;
  description: string;
}

interface LocationSearchProps {
  onSelect: (loc: ResolvedLocation) => void;
  placeholder?: string;
}

export function LocationSearch({ onSelect, placeholder = "Search for an area, street or landmark" }: LocationSearchProps) {
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [resolving, setResolving] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  React.useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    const handle = setTimeout(() => {
      api
        .get<{ items: PlaceSuggestion[] }>(`/places/autocomplete?input=${encodeURIComponent(query)}`)
        .then((res) => setSuggestions(res.items ?? []))
        .catch(() => setSuggestions([]))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(handle);
  }, [query]);

  async function handleSelect(suggestion: PlaceSuggestion) {
    setResolving(suggestion.placeId);
    try {
      const details = await api.get<ResolvedLocation>(`/places/details?place_id=${suggestion.placeId}`);
      onSelect(details);
      setQuery(suggestion.description);
      setOpen(false);
    } finally {
      setResolving(null);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="pl-10"
        />
        {searching && <Loader2 className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-text-muted" />}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-[var(--shadow-card-hover)]">
          <ul className="max-h-64 overflow-y-auto py-1">
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  onClick={() => handleSelect(s)}
                  disabled={resolving === s.placeId}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-text transition-colors hover:bg-surface disabled:opacity-60"
                >
                  {resolving === s.placeId ? (
                    <Loader2 className="size-3.5 shrink-0 animate-spin text-text-muted" />
                  ) : (
                    <MapPin className="size-3.5 shrink-0 text-text-muted" />
                  )}
                  <span className="truncate">{s.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
