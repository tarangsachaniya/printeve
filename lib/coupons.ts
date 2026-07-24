import { api } from "./api";
import type { ActiveCoupon } from "./types";

export interface CouponValidationResult {
  valid: true;
  coupon: { id: string; code: string };
  discountAmount: number;
}

export function validateCoupon(code: string, baseAmount: number): Promise<CouponValidationResult> {
  return api.post<CouponValidationResult>("/coupons/validate", {
    code: code.trim().toUpperCase(),
    baseAmount,
  });
}

// Public — active promo codes read directly from the coupons table (no separate
// curation table). Powers the home coupon banner and the /coupons list page.
export async function getActiveCoupons(limit = 20): Promise<ActiveCoupon[]> {
  try {
    const res = await api.get<{ items: ActiveCoupon[] }>(`/coupons/active?limit=${limit}`);
    return res.items ?? [];
  } catch {
    return [];
  }
}
