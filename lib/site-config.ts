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

export interface SiteConfig {
  version: string
  settings: Record<string, string | null>
  navbar: Record<string, CmsNavItem[]>
  footer: CmsFooterGroup[]
  pages: Record<string, CmsPage>
  pricingConfig: PricingConfig
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
    return { version: '0', settings: {}, navbar: {}, footer: [], pages: {}, pricingConfig: DEFAULT_PRICING_CONFIG }
  }
}

export function getPageSections(page: CmsPage | undefined): Record<string, CmsSection> {
  if (!page) return {}
  return Object.fromEntries(page.sections.map(s => [s.key, s]))
}
