"use client";

import type { QuantitySlab } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";

interface PricingTierCardsProps {
  slabs: QuantitySlab[];
  basePrice: number;
  activeQuantity: number;
  onSelect: (quantity: number) => void;
}

export function PricingTierCards({ slabs, basePrice, activeQuantity, onSelect }: PricingTierCardsProps) {
  if (slabs.length === 0) return null;

  const tiers = slabs.map((slab) => {
    const unitPrice = basePrice + Number(slab.price_modifier ?? 0);
    const totalPrice = unitPrice * slab.min_qty;
    return { slab, unitPrice, totalPrice };
  });

  const highestUnitPrice = Math.max(...tiers.map((t) => t.unitPrice));

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tiers.map(({ slab, unitPrice, totalPrice }) => {
        const isActive = activeQuantity >= slab.min_qty && (slab.max_qty == null || activeQuantity <= slab.max_qty);
        const savings = highestUnitPrice > 0 ? Math.round(((highestUnitPrice - unitPrice) / highestUnitPrice) * 100) : 0;

        return (
          <button
            key={slab.id}
            type="button"
            onClick={() => onSelect(slab.min_qty)}
            className={cn(
              "flex-1 min-w-[140px] rounded-xl border-2 p-4 text-left transition-all hover:shadow-md",
              isActive
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-background hover:border-primary/40"
            )}
          >
            <p className={cn("text-sm font-bold", isActive ? "text-primary" : "text-text")}>
              {slab.min_qty.toLocaleString("en-IN")} pcs
            </p>
            <p className="mt-1 text-lg font-bold text-text">{formatPrice(totalPrice)}</p>
            <p className="mt-0.5 text-xs text-text-muted">
              {formatPrice(unitPrice)} / pc
            </p>
            {savings > 0 && (
              <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                Save {savings}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
