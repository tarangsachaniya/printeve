import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton";

export default function Loading() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto max-w-7xl container-px py-16 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <Skeleton className="h-7 w-40 rounded-full" />
              <Skeleton className="mt-5 h-11 w-full max-w-md" />
              <Skeleton className="mt-3 h-11 w-2/3 max-w-sm" />
              <Skeleton className="mt-5 h-4 w-full max-w-lg" />
              <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Skeleton className="h-11 w-36" />
                <Skeleton className="h-11 w-36" />
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6 max-w-md">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="mt-2 h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className={`aspect-[3/4] rounded-2xl ${i % 2 === 1 ? "mt-8" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl container-px py-16 lg:py-20">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col rounded-lg border border-border bg-background p-6">
              <Skeleton className="size-12 rounded-lg" />
              <Skeleton className="mt-4 h-4 w-2/3" />
              <Skeleton className="mt-2 h-3 w-full" />
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-surface border-y border-border">
        <div className="mx-auto max-w-7xl container-px py-16 lg:py-20">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Skeleton className="h-8 w-56" />
              <Skeleton className="mt-2 h-4 w-80 max-w-full" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
