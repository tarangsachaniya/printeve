"use client";

import * as React from "react";

type Settings = Record<string, string | null>;

const SiteSettingsContext = React.createContext<Settings>({});

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: Settings;
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={settings ?? {}}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): Settings {
  return React.useContext(SiteSettingsContext);
}
