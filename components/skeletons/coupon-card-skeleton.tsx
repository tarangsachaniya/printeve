import { Skeleton } from "@/components/ui/skeleton";

export function CouponCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 pt-5">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="mt-2 h-4 w-3/4" />
        <Skeleton className="mt-3 h-3 w-1/2" />
        <Skeleton className="mt-3 h-8 w-full rounded-md" />
      </div>
    </div>
  );
}
