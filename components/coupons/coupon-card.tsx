import Link from "next/link";
import { TicketPercent } from "lucide-react";
import type { CouponPromotion } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { ClaimButton } from "@/components/coupons/claim-button";

const BRAND_NAME = "Priinteve";

function discountLabel(coupon: CouponPromotion["coupon"]): string {
  return coupon.discount_type === "percentage"
    ? `${coupon.discount_value}% OFF`
    : `${formatPrice(coupon.discount_value)} OFF`;
}

export function CouponCard({ promotion, className }: { promotion: CouponPromotion; className?: string }) {
  const { coupon } = promotion;
  const storeName = promotion.store_name || BRAND_NAME;

  return (
    <div className={cn("flex w-64 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-background", className)}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={promotion.image_url} alt="" className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white shadow">
          <TicketPercent className="size-3.5" />
          {discountLabel(coupon)}
        </span>
        <span className="absolute -bottom-3.5 left-3 flex size-7 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-surface shadow">
          {promotion.store_logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={promotion.store_logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] font-bold text-primary">{storeName.slice(0, 1)}</span>
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-5">
        <p className="text-xs font-medium text-text-muted">{storeName}</p>
        <h3 className="mt-0.5 text-sm font-semibold text-text line-clamp-1">{promotion.title}</h3>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {promotion.category && (
            <Link
              href={`/products?category=${promotion.category.slug}`}
              className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-text-muted hover:text-primary"
            >
              {promotion.category.title}
            </Link>
          )}
        </div>

        <p className="mt-2 text-xs text-text-muted">
          Valid until {new Date(coupon.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>

        <div className="mt-3">
          <ClaimButton promotionId={promotion.id} code={coupon.code} />
        </div>
      </div>
    </div>
  );
}
