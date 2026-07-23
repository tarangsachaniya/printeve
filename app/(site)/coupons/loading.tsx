import { CouponCardSkeleton } from "@/components/skeletons/coupon-card-skeleton";

export default function CouponsLoading() {
  return (
    <div className="mx-auto max-w-7xl container-px py-10 lg:py-14">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-surface" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-surface" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CouponCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
