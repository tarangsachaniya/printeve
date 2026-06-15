"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, FileText } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const FREE_DELIVERY_THRESHOLD = 1000;
const DELIVERY_FEE = 99;

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, selectionKey } = useCart();
  const [removeKey, setRemoveKey] = React.useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl container-px py-20 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-surface">
          <ShoppingBag className="size-7 text-text-muted" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-text">Your cart is empty</h1>
        <p className="mt-2 text-sm text-text-muted">
          Browse our products and start building your order.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  return (
    <div className="mx-auto max-w-7xl container-px py-10 lg:py-14">
      <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Shopping Cart</h1>
      <p className="mt-1 text-sm text-text-muted">{items.length} item{items.length > 1 ? "s" : ""} in your cart</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const key = selectionKey(item);
            const unitPrice = item.unitPrice;
            return (
              <Card key={key} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-md border border-border bg-surface">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-text-muted">
                      <ShoppingBag className="size-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`} className="text-sm font-semibold text-text hover:text-primary">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-text-muted">
                    {[
                      item.selection.paper_size?.name,
                      item.selection.paper_type?.name,
                      item.selection.paper_quality?.name,
                      ...Object.values(item.selection.custom_fields ?? {}).map((f) => f.label),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {item.artworkFileName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                      <FileText className="size-3.5" /> {item.artworkFileName}
                    </p>
                  )}
                  <p className="mt-1.5 text-sm font-medium text-text">{formatPrice(unitPrice)} / unit</p>
                </div>

                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                  <div className="flex h-10 items-center rounded-md border border-border">
                    <button
                      className="flex h-full w-9 items-center justify-center text-text-muted transition-colors hover:text-primary disabled:opacity-40"
                      onClick={() =>
                        updateQuantity(item.productId, key, Math.max(1, item.quantity - 1), unitPrice * Math.max(1, item.quantity - 1))
                      }
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium text-text">{item.quantity}</span>
                    <button
                      className="flex h-full w-9 items-center justify-center text-text-muted transition-colors hover:text-primary"
                      onClick={() => updateQuantity(item.productId, key, item.quantity + 1, unitPrice * (item.quantity + 1))}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <p className="text-base font-bold text-text">{formatPrice(item.totalPrice)}</p>
                  <button
                    onClick={() => setRemoveKey(key)}
                    className="flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-danger"
                  >
                    <Trash2 className="size-3.5" /> Remove
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Order summary */}
        <div>
          <Card className="sticky top-24 p-5">
            <h2 className="text-base font-semibold text-text">Order Summary</h2>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Subtotal</dt>
                <dd className="text-text">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Delivery</dt>
                <dd className="text-text">{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</dd>
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs text-accent">
                  Add {formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery
                </p>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                <dt className="text-text">Total</dt>
                <dd className="text-text">{formatPrice(total)}</dd>
              </div>
            </dl>
            <Button asChild size="lg" className="mt-5 w-full">
              <Link href="/checkout">
                Proceed to Checkout <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="mt-2 w-full">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={removeKey !== null}
        onOpenChange={(open) => !open && setRemoveKey(null)}
        title="Remove item?"
        description="This item will be removed from your cart."
        confirmLabel="Remove"
        onConfirm={() => {
          const item = items.find((i) => selectionKey(i) === removeKey);
          if (item) removeItem(item.productId, selectionKey(item));
          setRemoveKey(null);
        }}
      />
    </div>
  );
}
