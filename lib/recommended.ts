import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export interface RecommendedResult {
  items: Product[];
  mode: "latest" | "popular" | "nearby" | "manual";
}

const MODE_LABELS: Record<RecommendedResult["mode"], string> = {
  latest: "New Arrivals",
  popular: "Popular Right Now",
  nearby: "Available Near You",
  manual: "Recommended For You",
};

export function recommendedSectionTitle(mode: RecommendedResult["mode"]): string {
  return MODE_LABELS[mode] ?? MODE_LABELS.latest;
}

export async function getRecommended(cityId?: string): Promise<RecommendedResult> {
  try {
    const query = cityId ? `?city_id=${encodeURIComponent(cityId)}` : "";
    const res = await api.get<RecommendedResult>(`/recommended${query}`);
    return { items: res.items ?? [], mode: res.mode ?? "latest" };
  } catch {
    return { items: [], mode: "latest" };
  }
}
