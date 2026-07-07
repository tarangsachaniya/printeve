"use client";

import * as React from "react";
import type { PricingConfig } from "./site-config";

type Settings = Record<string, string | null>;

const DEFAULT_PRICING_CONFIG: PricingConfig = {
  cgst_percent: 0,
  sgst_percent: 0,
  min_order_price: 0,
  free_delivery_min_price: 0,
  platform_fee_type: "flat",
  platform_fee_value: 0,
};

const SiteSettingsContext = React.createContext<Settings>({});
const PricingConfigContext = React.createContext<PricingConfig>(DEFAULT_PRICING_CONFIG);

export function SiteSettingsProvider({
  settings,
  pricingConfig,
  children,
}: {
  settings: Settings;
  pricingConfig?: PricingConfig;
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={settings ?? {}}>
      <PricingConfigContext.Provider value={pricingConfig ?? DEFAULT_PRICING_CONFIG}>
        {children}
      </PricingConfigContext.Provider>
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): Settings {
  return React.useContext(SiteSettingsContext);
}

export function usePricingConfig(): PricingConfig {
  return React.useContext(PricingConfigContext);
}
