"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export function CartSheet() {
  const { items, itemCount, subtotal, removeItem, selectionKey } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="relative flex size-10 items-center justify-center rounded-md text-text transition-colors hover:bg-surface focus-ring"
          aria-label="Open cart"
        >
          <ShoppingCart className="size-5" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart ({itemCount})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <ShoppingCart className="size-10 text-text-muted" />
            <p className="text-sm text-text-muted">Your cart is empty.</p>
            <SheetClose asChild>
              <Button asChild variant="outline" size="sm">
                <Link href="/products">Browse Products</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-2 px-2">
              <ul className="flex flex-col gap-4">
                {items.map((item) => {
                  const key = selectionKey(item);
                  return (
                    <li key={key} className="flex gap-3 border-b border-border pb-4">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border bg-surface">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text line-clamp-1">{item.name}</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {[
                            item.selection.paper_size?.name,
                            item.selection.paper_type?.name,
                            item.selection.paper_quality?.name,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-text mt-1">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, key)}
                        className="self-start rounded-md p-1 text-text-muted hover:bg-surface hover:text-danger focus-ring"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-text-muted">Subtotal</span>
                <span className="text-base font-semibold text-text">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <SheetClose asChild>
                  <Button asChild>
                    <Link href="/checkout">Checkout</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="outline">
                    <Link href="/cart">View Cart</Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
