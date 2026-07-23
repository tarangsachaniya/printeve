import { Suspense } from "react";
import { getCouponPromotions } from "@/lib/coupon-promotions";
import { CouponsExplorer } from "@/components/coupons/coupons-explorer";

export const metadata = {
  title: "Coupons & Offers — Priinteve",
  description: "Browse all active discount coupons on business cards, flyers, brochures, posters, banners and more.",
};

export default async function CouponsPage() {
  const { items, total } = await getCouponPromotions(1, 20);

  return (
    <div className="mx-auto max-w-7xl container-px py-10 lg:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">All Coupons</h1>
        <p className="mt-2 text-sm text-text-muted">
          {total > 0 ? `${total} active coupon${total === 1 ? "" : "s"} available.` : "Check back soon for new offers."}
        </p>
      </div>

      <Suspense>
        <CouponsExplorer initialItems={items} initialTotal={total} />
      </Suspense>
    </div>
  );
}
