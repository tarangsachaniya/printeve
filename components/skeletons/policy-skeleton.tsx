import { Skeleton } from "@/components/ui/skeleton";

const LINE_WIDTHS = ["w-full", "w-full", "w-5/6", "w-full", "w-4/6", "w-full", "w-full", "w-3/6"];

export function PolicySkeleton() {
  return (
    <div className="mx-auto max-w-3xl container-px py-14 lg:py-20">
      <Skeleton className="h-9 w-2/3" />
      <div className="mt-8 flex flex-col gap-3">
        {LINE_WIDTHS.map((width, i) => (
          <Skeleton key={i} className={`h-4 ${width}`} />
        ))}
      </div>
    </div>
  );
}
