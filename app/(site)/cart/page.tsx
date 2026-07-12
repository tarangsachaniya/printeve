"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, FileText, Pencil } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useCity } from "@/lib/city";
import { useSiteSettings, usePricingConfig } from "@/lib/site-settings";
import { computeOrderBill } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, selectionKey } = useCart();
  const settings = useSiteSettings();
  const pricingConfig = usePricingConfig();
  const { cities, cityId } = useCity();
  const [removeKey, setRemoveKey] = React.useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl container-px py-20 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-soft">
          <ShoppingBag className="size-7 text-primary" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-text">
          {settings.empty_cart_title || "Your cart is empty"}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {settings.empty_cart_subtitle || "Browse our products and start building your order."}
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const cityDeliveryFee = cities.find((c) => c.id === cityId)?.price ?? 0;
  const bill = computeOrderBill(subtotal, pricingConfig, cityDeliveryFee);

  return (
    <div className="mx-auto max-w-7xl container-px py-10 pb-28 lg:py-14 lg:pb-14">
      <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Shopping Cart</h1>
      <p className="mt-1 text-sm text-text-muted">{items.length} item{items.length > 1 ? "s" : ""} in your cart</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const key = selectionKey(item);
            const unitPrice = item.unitPrice;
            return (
              <Card key={key} className="flex flex-col gap-4 rounded-xl p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)] sm:flex-row sm:items-center">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
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
                      ...(item.selection.options ?? []).map((o) => `${o.option_label}: ${o.value_label}`),
                      item.selection.custom_dimensions &&
                        `${item.selection.custom_dimensions.width} × ${item.selection.custom_dimensions.height} ${item.selection.custom_dimensions.unit}`,
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
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/products/${item.slug}?edit=${encodeURIComponent(key)}`}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                      aria-label="Edit item"
                    >
                      <Pencil className="size-4" />
                    </Link>
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
          <Card className="lg:sticky lg:top-24 rounded-xl p-5 shadow-[var(--shadow-card-hover)]">
            <h2 className="text-base font-semibold text-text">Order Summary</h2>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Service</p>
              <div className="flex justify-between">
                <dt className="text-text-muted">Subtotal</dt>
                <dd className="text-text">{formatPrice(bill.subtotal)}</dd>
              </div>
              {pricingConfig.cgst_percent > 0 && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">CGST ({pricingConfig.cgst_percent}%)</dt>
                  <dd className="text-text">{formatPrice(bill.cgstAmount)}</dd>
                </div>
              )}
              {pricingConfig.sgst_percent > 0 && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">SGST ({pricingConfig.sgst_percent}%)</dt>
                  <dd className="text-text">{formatPrice(bill.sgstAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 font-medium">
                <dt className="text-text">Service Total</dt>
                <dd className="text-text">{formatPrice(bill.serviceTotal)}</dd>
              </div>

              {bill.platformFee > 0 && (
                <>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Platform Fee</p>
                  <div className="flex justify-between border-t border-border pt-2 font-medium">
                    <dt className="text-text">Platform Fee Total</dt>
                    <dd className="text-text">{formatPrice(bill.platformFee)}</dd>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-2">
                <dt className="text-text-muted">Delivery</dt>
                <dd className="text-text">{bill.deliveryFee === 0 ? "Free" : formatPrice(bill.deliveryFee)}</dd>
              </div>
              {bill.deliveryFee > 0 && bill.amountToFreeDelivery > 0 && (
                <p className="text-xs text-primary">
                  Add {formatPrice(bill.amountToFreeDelivery)} more for free delivery
                </p>
              )}

            </dl>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-primary-soft px-3 py-2.5 text-base font-bold text-primary-soft-fg">
              <span>Total</span>
              <span>{formatPrice(bill.grandTotal)}</span>
            </div>
            {!bill.meetsMinOrder && (
              <p className="mt-3 rounded-md border border-danger/30 bg-danger/5 p-2.5 text-xs text-danger">
                Minimum order amount is {formatPrice(pricingConfig.min_order_price)}. Add {formatPrice(pricingConfig.min_order_price - subtotal)} more to checkout.
              </p>
            )}
            {bill.meetsMinOrder ? (
              <Button asChild size="lg" className="mt-5 hidden w-full lg:flex">
                <Link href="/checkout">
                  Proceed to Checkout <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" className="mt-5 hidden w-full lg:flex" disabled>
                Proceed to Checkout <ArrowRight className="size-4" />
              </Button>
            )}
            <Button asChild variant="outline" size="sm" className="mt-2 hidden w-full lg:flex">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </Card>
        </div>
      </div>

      {/* Sticky mobile checkout bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 container-px">
          <div>
            <p className="text-xs text-text-muted">Total</p>
            <p className="text-lg font-bold text-text">{formatPrice(bill.grandTotal)}</p>
          </div>
          {bill.meetsMinOrder ? (
            <Button asChild size="lg" className="flex-1 max-w-[220px]">
              <Link href="/checkout">
                Checkout <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button size="lg" className="flex-1 max-w-[220px]" disabled>
              Checkout <ArrowRight className="size-4" />
            </Button>
          )}
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
