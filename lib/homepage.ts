import { api } from "@/lib/api";
import type { HomepageData } from "@/lib/types";

// Single homepage API shared by the app and web — one call returns categories, cities,
// hero_banners, sections, stories, latest_products, popular_products, and coupons.
// See printvana-api HomepageService (the same backend service both clients hit).
export async function getHomepage(cityId?: string): Promise<HomepageData> {
  const empty: HomepageData = {
    categories: [],
    cities: [],
    hero_banners: [],
    sections: [],
    stories: [],
    latest_products: [],
    popular_products: [],
    coupons: [],
  };
  try {
    const query = cityId ? `?city_id=${encodeURIComponent(cityId)}` : "";
    const res = await api.get<Partial<HomepageData>>(`/homepage${query}`);
    return { ...empty, ...res };
  } catch {
    return empty;
  }
}
