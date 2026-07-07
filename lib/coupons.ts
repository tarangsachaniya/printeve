import { api } from "./api";

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
