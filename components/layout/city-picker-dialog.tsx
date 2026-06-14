"use client";

import * as React from "react";
import { MapPin, Navigation, ChevronDown, Search, Check } from "lucide-react";
import { useCity } from "@/lib/city";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function CitySelect({
  cities,
  value,
  onValueChange,
}: {
  cities: { id: string; name: string; state: string }[];
  value: string;
  onValueChange: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = query
    ? cities.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : cities;

  const selectedCity = cities.find((c) => c.id === value);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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
        <span className={cn(!selectedCity && "text-text-muted")}>
          {selectedCity ? selectedCity.name : "Select your city"}
        </span>
        <ChevronDown className="size-4 shrink-0 text-text-muted" />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-background text-text shadow-[var(--shadow-card-hover)]">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="size-3.5 shrink-0 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search cities..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted outline-none"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-center text-sm text-text-muted">No cities found</p>
            ) : (
              filtered.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleSelect(city.id)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-text transition-colors hover:bg-surface"
                >
                  <Check className={cn("size-3.5 shrink-0 text-primary", city.id === value ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{city.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CityPickerDialog() {
  const { cities, cityId, pickerOpen, selectCity, closePicker } = useCity();
  const [selected, setSelected] = React.useState<string>("");
  const [locationRequested, setLocationRequested] = React.useState(false);

  React.useEffect(() => {
    if (pickerOpen) setSelected(cityId ?? "");
  }, [pickerOpen, cityId]);

  function handleAllowLocation() {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationRequested(true),
        () => setLocationRequested(true)
      );
    } else {
      setLocationRequested(true);
    }
  }

  function handleContinue() {
    if (selected) selectCity(selected);
  }

  return (
    <Dialog open={pickerOpen} onOpenChange={(open) => !open && closePicker()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" /> See prices for your city
          </DialogTitle>
          <DialogDescription>
            Prices may vary by location. Allow location access or pick your city to see accurate pricing.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Button type="button" variant="outline" onClick={handleAllowLocation} className="justify-center">
            <Navigation className="size-4" />
            {locationRequested ? "Location access requested" : "Allow Location Access"}
          </Button>

          <CitySelect cities={cities} value={selected} onValueChange={setSelected} />

          <Button type="button" onClick={handleContinue} disabled={!selected}>
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
