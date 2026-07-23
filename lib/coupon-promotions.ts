import { api } from "@/lib/api";
import type { CouponPromotion, CouponPromotionListResponse } from "@/lib/types";

export async function getCouponPromotions(page = 1, limit = 10): Promise<CouponPromotionListResponse> {
  try {
    const res = await api.get<CouponPromotionListResponse>(`/coupon-promotions?page=${page}&limit=${limit}`);
    return { items: res.items ?? [], total: res.total ?? 0 };
  } catch {
    return { items: [], total: 0 };
  }
}

export async function getCouponPromotionById(id: string): Promise<CouponPromotion | null> {
  try {
    return await api.get<CouponPromotion>(`/coupon-promotions/${id}`);
  } catch {
    return null;
  }
}
