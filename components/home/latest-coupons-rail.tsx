import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCouponPromotions } from "@/lib/coupon-promotions";
import { CouponCard } from "@/components/coupons/coupon-card";

export async function LatestCouponsRail({ limit = 10 }: { limit?: number }) {
  const { items } = await getCouponPromotions(1, limit);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl container-px py-16 lg:py-20">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Latest Coupons</h2>
          <p className="mt-2 text-sm text-text-muted sm:text-base">
            Fresh discounts on your favorite print products.
          </p>
        </div>
        <Link
          href="/coupons"
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          View all coupons <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-8 flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((promotion) => (
          <CouponCard key={promotion.id} promotion={promotion} />
        ))}
      </div>
    </section>
  );
}
