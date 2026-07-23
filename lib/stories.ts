import { api } from "@/lib/api";
import type { Story } from "@/lib/types";

export async function getStories(params?: { categoryId?: string; productId?: string }): Promise<Story[]> {
  try {
    const query = new URLSearchParams();
    if (params?.categoryId) query.set("category_id", params.categoryId);
    if (params?.productId) query.set("product_id", params.productId);
    const qs = query.toString();
    const res = await api.get<{ items: Story[] }>(`/stories${qs ? `?${qs}` : ""}`);
    return res.items ?? [];
  } catch {
    return [];
  }
}
