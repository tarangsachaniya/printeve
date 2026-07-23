import Link from "next/link";
import { notFound } from "next/navigation";
import { TicketPercent } from "lucide-react";
import { getCouponPromotionById } from "@/lib/coupon-promotions";
import { formatPrice } from "@/lib/utils";
import { ClaimButton } from "@/components/coupons/claim-button";

const BRAND_NAME = "Priinteve";

function discountLabel(coupon: { discount_type: "percentage" | "fixed"; discount_value: number }): string {
  return coupon.discount_type === "percentage"
    ? `${coupon.discount_value}% OFF`
    : `${formatPrice(coupon.discount_value)} OFF`;
}

export default async function CouponDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promotion = await getCouponPromotionById(id);

  if (!promotion) notFound();

  const { coupon } = promotion;
  const storeName = promotion.store_name || BRAND_NAME;
  const shopHref = promotion.category ? `/products?category=${promotion.category.slug}` : "/products";

  return (
    <div className="mx-auto max-w-3xl container-px py-10 lg:py-14">
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={promotion.image_url} alt="" className="h-full w-full object-cover" />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center overflow-hidden rounded-full border border-border bg-surface">
              {promotion.store_logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={promotion.store_logo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-primary">{storeName.slice(0, 1)}</span>
              )}
            </span>
            <span className="text-sm font-medium text-text-muted">{storeName}</span>
          </div>

          <h1 className="mt-3 text-2xl font-bold text-text">{promotion.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">
              <TicketPercent className="size-4" />
              {discountLabel(coupon)}
            </span>
            {promotion.category && (
              <Link
                href={`/products?category=${promotion.category.slug}`}
                className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-text-muted hover:text-primary"
              >
                {promotion.category.title}
              </Link>
            )}
          </div>

          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between border-b border-border py-2">
              <dt className="text-text-muted">Coupon code</dt>
              <dd className="font-mono font-semibold text-text">{coupon.code}</dd>
            </div>
            {coupon.minimum_purchase_amount != null && (
              <div className="flex justify-between border-b border-border py-2">
                <dt className="text-text-muted">Minimum order</dt>
                <dd className="font-medium text-text">{formatPrice(coupon.minimum_purchase_amount)}</dd>
              </div>
            )}
            {coupon.max_discount_cap != null && (
              <div className="flex justify-between border-b border-border py-2">
                <dt className="text-text-muted">Maximum discount</dt>
                <dd className="font-medium text-text">{formatPrice(coupon.max_discount_cap)}</dd>
              </div>
            )}
            <div className="flex justify-between py-2">
              <dt className="text-text-muted">Valid until</dt>
              <dd className="font-medium text-text">
                {new Date(coupon.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ClaimButton promotionId={promotion.id} code={coupon.code} className="sm:w-auto sm:px-8" />
            <Link
              href={shopHref}
              className="flex items-center justify-center rounded-md border border-border px-6 py-2 text-sm font-medium text-text hover:border-primary/30 hover:text-primary"
            >
              Shop Now
            </Link>
          </div>

          <p className="mt-4 text-xs text-text-muted">
            Apply this code at checkout to redeem the discount. Terms and usage limits apply.
          </p>
        </div>
      </div>
    </div>
  );
}
