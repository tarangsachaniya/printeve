import Link from "next/link";
import { TicketPercent } from "lucide-react";
import type { ActiveCoupon } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

function discountLabel(coupon: ActiveCoupon): string {
  return coupon.discount_type === "percentage"
    ? `${coupon.discount_value}% OFF`
    : `${formatPrice(coupon.discount_value)} OFF`;
}

// Shows the newest active promo code directly from the coupons table — no separate
// "promotion" record required. Renders nothing if no code is currently active.
export function CouponBanner({ coupons }: { coupons: ActiveCoupon[] }) {
  const coupon = coupons[0];
  if (!coupon) return null;

  const title = coupon.banner_title || `${discountLabel(coupon)} your order`;
  const subtitle =
    coupon.banner_subtitle ||
    `Valid till ${new Date(coupon.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <section className="mx-auto max-w-7xl container-px py-6">
      <Link
        href="/coupons"
        className="group relative flex items-center gap-4 overflow-hidden rounded-xl p-6 text-white transition-transform hover:-translate-y-0.5"
        style={{
          backgroundImage: coupon.banner_image_url
            ? `linear-gradient(90deg, rgba(6,40,24,0.55), rgba(6,40,24,0.85)), url(${coupon.banner_image_url})`
            : "linear-gradient(90deg, #166534, #22C55E)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20">
          <TicketPercent className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-primary">
            {discountLabel(coupon)}
          </span>
          <h3 className="mt-1 truncate text-lg font-semibold">{title}</h3>
          <p className="truncate text-sm text-white/80">{subtitle}</p>
        </div>
        <span className="hidden shrink-0 rounded-lg bg-white/20 px-3 py-2 font-mono text-sm font-bold sm:block">
          {coupon.code}
        </span>
      </Link>
    </section>
  );
}
