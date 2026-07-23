"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { CouponPromotion } from "@/lib/types";
import { getCouponPromotions } from "@/lib/coupon-promotions";
import { CouponCard } from "@/components/coupons/coupon-card";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

export function CouponsExplorer({
  initialItems,
  initialTotal,
}: {
  initialItems: CouponPromotion[];
  initialTotal: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = items.length < total;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    const res = await getCouponPromotions(nextPage, PAGE_SIZE);
    setItems((prev) => [...prev, ...res.items]);
    setTotal(res.total);
    setPage(nextPage);
    setLoading(false);
  }, [loading, hasMore, page]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (items.length === 0) {
    return <p className="py-16 text-center text-sm text-text-muted">No coupons available right now — check back soon.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((promotion) => (
          <CouponCard key={promotion.id} promotion={promotion} className="w-full" />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="mt-8 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Loading…
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
