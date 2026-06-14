"use client";

import * as React from "react";
import { api } from "./api";
import type { City } from "./types";

const STORAGE_KEY = "printeve_city_id";
const COOKIE_KEY = "printeve_city_id";

interface CityContextValue {
  cities: City[];
  cityId: string | null;
  cityName: string | null;
  pickerOpen: boolean;
  selectCity: (id: string) => void;
  openPicker: () => void;
  closePicker: () => void;
}

const CityContext = React.createContext<CityContextValue | null>(null);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [cities, setCities] = React.useState<City[]>([]);
  const [cityId, setCityId] = React.useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  React.useEffect(() => {
    api
      .get<{ items: City[] }>("/cities")
      .then((res) => setCities(res.items ?? []))
      .catch(() => setCities([]));

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCityId(stored);
    } else {
      setPickerOpen(true);
    }
  }, []);

  const selectCity = React.useCallback((id: string) => {
    setCityId(id);
    localStorage.setItem(STORAGE_KEY, id);
    document.cookie = `${COOKIE_KEY}=${id}; path=/; max-age=31536000`;
    setPickerOpen(false);
  }, []);

  const openPicker = React.useCallback(() => setPickerOpen(true), []);
  const closePicker = React.useCallback(() => setPickerOpen(false), []);

  const cityName = cities.find((c) => c.id === cityId)?.name ?? null;

  const value = React.useMemo(
    () => ({ cities, cityId, cityName, pickerOpen, selectCity, openPicker, closePicker }),
    [cities, cityId, cityName, pickerOpen, selectCity, openPicker, closePicker]
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
  const ctx = React.useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used within CityProvider");
  return ctx;
}
