import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = getPageNumbers(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        className="flex size-10 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:bg-surface hover:text-text disabled:pointer-events-none disabled:opacity-40 focus-ring"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="px-1.5 text-text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "flex size-10 items-center justify-center rounded-md text-sm font-medium transition-colors focus-ring",
              p === page
                ? "bg-primary text-primary-foreground"
                : "border border-border text-text hover:bg-surface"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        className="flex size-10 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:bg-surface hover:text-text disabled:pointer-events-none disabled:opacity-40 focus-ring"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
