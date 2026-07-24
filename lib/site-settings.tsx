"use client";

import * as React from "react";
import type { PricingConfig, LetterheadConfig } from "./site-config";

type Settings = Record<string, string | null>;

const DEFAULT_PRICING_CONFIG: PricingConfig = {
  cgst_percent: 0,
  sgst_percent: 0,
  min_order_price: 0,
  free_delivery_min_price: 0,
  platform_fee_type: "flat",
  platform_fee_value: 0,
};

const DEFAULT_LETTERHEAD_CONFIG: LetterheadConfig = {
  logo_url: "",
  company_name: "Priinteve Innovations",
  tagline: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  phone_primary: "",
  phone_secondary: "",
  email: "",
  website: "",
  gst_number: "",
  pan_number: "",
  cin_number: "",
  signature_url: "",
  signature_name: "",
  signature_designation: "",
  footer_text: "",
  terms_and_conditions: "",
  bank_details_text: "",
  qr_code_url: "",
  watermark_url: "",
  watermark_opacity: 0.06,
};

const SiteSettingsContext = React.createContext<Settings>({});
const PricingConfigContext = React.createContext<PricingConfig>(DEFAULT_PRICING_CONFIG);
const LetterheadConfigContext = React.createContext<LetterheadConfig>(DEFAULT_LETTERHEAD_CONFIG);

export function SiteSettingsProvider({
  settings,
  pricingConfig,
  letterheadConfig,
  children,
}: {
  settings: Settings;
  pricingConfig?: PricingConfig;
  letterheadConfig?: LetterheadConfig;
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={settings ?? {}}>
      <PricingConfigContext.Provider value={pricingConfig ?? DEFAULT_PRICING_CONFIG}>
        <LetterheadConfigContext.Provider value={letterheadConfig ?? DEFAULT_LETTERHEAD_CONFIG}>
          {children}
        </LetterheadConfigContext.Provider>
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

export function useLetterheadConfig(): LetterheadConfig {
  return React.useContext(LetterheadConfigContext);
}
