"use client";

import * as React from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionListSelectProps {
  options: { id: string; label: string }[];
  value: string;
  onValueChange: (id: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  searchable?: boolean;
}

function OptionListSelect({
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  searchable = true,
}: OptionListSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const selected = options.find((o) => o.id === value);

  React.useEffect(() => {
    if (open && searchable) inputRef.current?.focus();
  }, [open, searchable]);

  React.useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function handleSelect(id: string) {
    onValueChange(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3.5 py-2 text-sm text-text focus-ring focus-visible:border-primary"
      >
        <span className={cn(!selected && "text-text-muted")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 text-text-muted" />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-background text-text shadow-[var(--shadow-card-hover)]">
          {searchable && (
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="size-3.5 shrink-0 text-text-muted" />
              <input
                ref={inputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted outline-none"
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-center text-sm text-text-muted">{emptyText}</p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-text transition-colors hover:bg-surface"
                >
                  <Check className={cn("size-3.5 shrink-0 text-primary", option.id === value ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{option.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CitySelect({
  cities,
  value,
  onValueChange,
}: {
  cities: { id: string; name: string; state: string }[];
  value: string;
  onValueChange: (id: string) => void;
}) {
  return (
    <OptionListSelect
      options={cities.map((c) => ({ id: c.id, label: c.name }))}
      value={value}
      onValueChange={onValueChange}
      placeholder="Select your city"
      searchPlaceholder="Search cities..."
      emptyText="No cities found"
    />
  );
}

export function StateSelect({
  states,
  value,
  onValueChange,
}: {
  states: string[];
  value: string;
  onValueChange: (state: string) => void;
}) {
  return (
    <OptionListSelect
      options={states.map((s) => ({ id: s, label: s }))}
      value={value}
      onValueChange={onValueChange}
      placeholder="Select state"
      searchPlaceholder="Search states..."
      emptyText="No states found"
      searchable={states.length > 5}
    />
  );
}
