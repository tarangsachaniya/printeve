"use client";

import { cn } from "@/lib/utils";

interface PricingTierCardsProps {
  quantities: number[];
  activeQuantity: number;
  onSelect: (quantity: number) => void;
}

export function PricingTierCards({ quantities, activeQuantity, onSelect }: PricingTierCardsProps) {
  if (quantities.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {quantities.map((qty) => {
        const isActive = activeQuantity === qty;

        return (
          <button
            key={qty}
            type="button"
            onClick={() => onSelect(qty)}
            className={cn(
              "flex-1 min-w-[120px] rounded-xl border-2 p-4 text-center transition-all hover:shadow-md",
              isActive
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-background hover:border-primary/40"
            )}
          >
            <p className={cn("text-sm font-bold", isActive ? "text-primary" : "text-text")}>
              {qty.toLocaleString("en-IN")} pcs
            </p>
          </button>
        );
      })}
    </div>
  );
}
