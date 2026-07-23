import { api } from "@/lib/api";
import type { FeaturedItem } from "@/lib/types";

export async function getFeatured(cityId?: string): Promise<FeaturedItem[]> {
  try {
    const query = cityId ? `?city_id=${encodeURIComponent(cityId)}` : "";
    const res = await api.get<{ items: FeaturedItem[] }>(`/featured${query}`);
    return res.items ?? [];
  } catch {
    return [];
  }
}
