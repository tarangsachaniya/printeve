import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl container-px py-10 lg:py-14">
      <div className="mb-6 border-b border-border/60 py-2.5">
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="size-16 shrink-0 rounded-md" />
            ))}
          </div>
        </div>

        {/* Configurator */}
        <div className="flex flex-col gap-5">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-6 w-32" />

          <div>
            <Skeleton className="h-4 w-24" />
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-20 rounded-md" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-28" />
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-md" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-10 w-full rounded-md" />
          </div>

          <div className="mt-2 flex flex-col gap-3">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-10 border-t border-border pt-8">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 flex flex-col gap-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-t border-border pt-8">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-md" />
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      {/* Similar products */}
      <div className="mt-12">
        <Skeleton className="h-7 w-56" />
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
