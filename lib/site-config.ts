const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3032'

export interface CmsSectionItem {
  id: string
  title: string | null
  subtitle: string | null
  content: string | null
  image_url: string | null
  icon: string | null
  link_url: string | null
  link_label: string | null
  metadata: Record<string, unknown>
  sort_order: number
}

export interface CmsSection {
  id: string
  key: string
  title: string | null
  subtitle: string | null
  layout: string
  content: Record<string, unknown> | null
  settings: Record<string, unknown>
  is_active: boolean
  sort_order: number
  items: CmsSectionItem[]
}

export interface CmsPage {
  title: string
  slug: string
  meta_title: string | null
  meta_description: string | null
  sections: CmsSection[]
}

export interface CmsNavItem {
  id: string
  label: string
  href: string
  sort_order: number
}

export interface CmsFooterGroup {
  id: string
  title: string
  sort_order: number
  links: { id: string; label: string; href: string; sort_order: number }[]
}

export interface HomepageSection {
  id: string
  key: string
  title: string | null
  layout: string
  settings: Record<string, unknown>
  is_active: boolean
  sort_order: number
}

export interface PricingConfig {
  cgst_percent: number
  sgst_percent: number
  min_order_price: number
  free_delivery_min_price: number
  platform_fee_type: 'percentage' | 'flat'
  platform_fee_value: number
}

const DEFAULT_PRICING_CONFIG: PricingConfig = {
  cgst_percent: 0,
  sgst_percent: 0,
  min_order_price: 0,
  free_delivery_min_price: 0,
  platform_fee_type: 'flat',
  platform_fee_value: 0,
}

export interface LetterheadConfig {
  logo_url: string
  company_name: string
  tagline: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  pincode: string
  phone_primary: string
  phone_secondary: string
  email: string
  website: string
  gst_number: string
  pan_number: string
  cin_number: string
  signature_url: string
  signature_name: string
  signature_designation: string
  footer_text: string
  terms_and_conditions: string
  bank_details_text: string
  qr_code_url: string
  watermark_url: string
  watermark_opacity: number
}

const DEFAULT_LETTERHEAD_CONFIG: LetterheadConfig = {
  logo_url: '',
  company_name: 'Priinteve Innovations',
  tagline: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  pincode: '',
  phone_primary: '',
  phone_secondary: '',
  email: '',
  website: '',
  gst_number: '',
  pan_number: '',
  cin_number: '',
  signature_url: '',
  signature_name: '',
  signature_designation: '',
  footer_text: '',
  terms_and_conditions: '',
  bank_details_text: '',
  qr_code_url: '',
  watermark_url: '',
  watermark_opacity: 0.06,
}

export interface SiteConfig {
  version: string
  settings: Record<string, string | null>
  navbar: Record<string, CmsNavItem[]>
  footer: CmsFooterGroup[]
  pages: Record<string, CmsPage>
  pricingConfig: PricingConfig
  letterheadConfig: LetterheadConfig
  homepageSections: HomepageSection[]
}

let fallbackConfig: SiteConfig | null = null

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const res = await fetch(`${API_URL}/v1/web/site-config`, {
      next: { revalidate: 3600, tags: ['site-config'] },
    })
    if (!res.ok) throw new Error(`site-config ${res.status}`)
    const data = await res.json()
    fallbackConfig = data
    return data
  } catch {
    if (fallbackConfig) return fallbackConfig
    return {
      version: '0', settings: {}, navbar: {}, footer: [], pages: {},
      pricingConfig: DEFAULT_PRICING_CONFIG, letterheadConfig: DEFAULT_LETTERHEAD_CONFIG, homepageSections: [],
    }
  }
}

export function getPageSections(page: CmsPage | undefined): Record<string, CmsSection> {
  if (!page) return {}
  return Object.fromEntries(page.sections.map(s => [s.key, s]))
}

export function getHomepageSections(config: SiteConfig): Record<string, HomepageSection> {
  return Object.fromEntries((config.homepageSections ?? []).map(s => [s.key, s]))
}
