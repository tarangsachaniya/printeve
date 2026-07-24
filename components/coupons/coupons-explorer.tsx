"use client";

import type { ActiveCoupon } from "@/lib/types";
import { CouponCard } from "@/components/coupons/coupon-card";

export function CouponsExplorer({ coupons }: { coupons: ActiveCoupon[] }) {
  if (coupons.length === 0) {
    return <p className="py-16 text-center text-sm text-text-muted">No coupons available right now — check back soon.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {coupons.map((coupon) => (
        <CouponCard key={coupon.code} coupon={coupon} className="w-full" />
      ))}
    </div>
  );
}
