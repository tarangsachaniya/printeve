import { TicketPercent } from "lucide-react";
import type { ActiveCoupon } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { ClaimButton } from "@/components/coupons/claim-button";

function discountLabel(coupon: ActiveCoupon): string {
  return coupon.discount_type === "percentage"
    ? `${coupon.discount_value}% OFF`
    : `${formatPrice(coupon.discount_value)} OFF`;
}

export function CouponCard({ coupon, className }: { coupon: ActiveCoupon; className?: string }) {
  return (
    <div className={cn("flex w-64 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-background", className)}>
      <div
        className="relative aspect-[4/3] w-full overflow-hidden bg-surface"
        style={{
          backgroundImage: coupon.banner_image_url
            ? `linear-gradient(180deg, rgba(6,40,24,0.1), rgba(6,40,24,0.55)), url(${coupon.banner_image_url})`
            : "linear-gradient(135deg, #166534, #22C55E)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white shadow">
          <TicketPercent className="size-3.5" />
          {discountLabel(coupon)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-text line-clamp-1">
          {coupon.banner_title || `${discountLabel(coupon)} your order`}
        </h3>
        <p className="mt-1 text-xs text-text-muted line-clamp-2">
          {coupon.banner_subtitle ||
            (coupon.minimum_purchase_amount ? `Min. order ${formatPrice(coupon.minimum_purchase_amount)}` : "No minimum order")}
        </p>

        <p className="mt-2 text-xs text-text-muted">
          Valid until {new Date(coupon.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>

        <div className="mt-3">
          <ClaimButton code={coupon.code} />
        </div>
      </div>
    </div>
  );
}
