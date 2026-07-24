"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, PackageX, AlertTriangle, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { getOrderById, getOrderTracking } from "@/lib/orders";
import { usePricingConfig, useLetterheadConfig } from "@/lib/site-settings";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import type { Order, OrderTracking } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusTimeline } from "@/components/account/order-status-timeline";

function formatAddress(address: NonNullable<Order["shippingAddress"]>): string {
  const parts = [
    [address.houseNumber, address.floor, address.towerBlock].filter(Boolean).join(", "),
    address.line1,
    address.line2,
    address.landmark ? `Near ${address.landmark}` : null,
    `${address.city}, ${address.state} ${address.pincode}`,
  ].filter(Boolean);
  return parts.join(", ");
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const pricingConfig = usePricingConfig();
  const letterheadConfig = useLetterheadConfig();
  const [order, setOrder] = React.useState<Order | null | undefined>(undefined);
  const [tracking, setTracking] = React.useState<OrderTracking | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [downloading, setDownloading] = React.useState(false);

  React.useEffect(() => {
    getOrderById(params.id)
      .then(setOrder)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setOrder(null);
        } else {
          const msg = err instanceof ApiError ? err.message : "Unable to load order details.";
          setError(msg);
          toast.error(msg);
          setOrder(null);
        }
      });
    getOrderTracking(params.id)
      .then(setTracking)
      .catch(() => setTracking(null));
  }, [params.id]);

  if (order === undefined) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-4 w-28" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-3 w-32" />
        </div>

        <Card className="p-5">
          <Skeleton className="h-4 w-16" />
          <div className="mt-4 flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <Skeleton className="h-4 w-16" />
          <div className="mt-3 flex flex-col gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (order === null) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-surface">
          {error ? (
            <AlertTriangle className="size-6 text-danger" />
          ) : (
            <PackageX className="size-6 text-text-muted" />
          )}
        </div>
        <h2 className="text-lg font-semibold text-text">
          {error ? "Failed to load order" : "Order not found"}
        </h2>
        <p className="max-w-sm text-sm text-text-muted">
          {error ?? "We couldn't find an order with this ID. It may have been removed or the ID is incorrect."}
        </p>
        <Link href="/account/orders" className="mt-2 text-sm font-medium text-primary hover:underline">
          Back to Orders
        </Link>
      </Card>
    );
  }

  const isCancelled = order.status === "cancelled";
  const shippingAddress = order.shippingAddress;
  const billingAddress = order.billingAddress;
  const billingSameAsShipping = !billingAddress || !shippingAddress || billingAddress.id === shippingAddress.id;

  // CGST/SGST are global, site-wide rates (not stored per order) — computed here
  // from the order's net subtotal using the current live rates.
  const netSubtotal = Math.max(0, order.subtotal - order.discountAmount);
  const cgstAmount = Math.round(((netSubtotal * pricingConfig.cgst_percent) / 100) * 100) / 100;
  const sgstAmount = Math.round(((netSubtotal * pricingConfig.sgst_percent) / 100) * 100) / 100;
  const serviceTotal = netSubtotal + cgstAmount + sgstAmount;

  async function handleDownloadInvoice() {
    setDownloading(true);
    try {
      await downloadInvoicePdf(order!, letterheadConfig);
    } catch {
      toast.error("Failed to generate invoice.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/account/orders" className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary">
          <ChevronLeft className="size-4" /> Back to Orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-text">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
          <Badge variant={isCancelled ? "default" : "primary"} className="capitalize">
            {order.status.replace(/_/g, " ")}
          </Badge>
        </div>
        <p className="text-sm text-text-muted">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        {order.invoiceNumber && <p className="text-xs text-text-muted">Invoice {order.invoiceNumber}</p>}
      </div>

      {!isCancelled && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text">Status</h3>
          <div className="mt-4">
            <OrderStatusTimeline currentStatus={order.status} history={tracking?.history} />
          </div>
        </Card>
      )}

      {(order.customerName || order.customerPhone) && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text">Customer Details</h3>
          <div className="mt-2 text-sm text-text-muted">
            {order.customerName && <p className="text-text">{order.customerName}</p>}
            {order.customerPhone && <p>{order.customerPhone}</p>}
            {order.customerEmail && <p>{order.customerEmail}</p>}
            {order.hasGst && order.gstNumber && (
              <div className="mt-2 border-t border-border pt-2">
                {order.companyName && <p className="text-text">{order.companyName}</p>}
                <p>GSTIN: {order.gstNumber}</p>
                {order.placeOfSupply && (
                  <p>Place of Supply: {order.placeOfSupply}{order.stateCode ? ` (${order.stateCode})` : ""}</p>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {(shippingAddress || billingAddress) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {shippingAddress && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-text">Shipping Address</h3>
              <p className="mt-2 text-sm font-medium text-text">{shippingAddress.fullName}</p>
              <p className="text-sm text-text-muted">{formatAddress(shippingAddress)}</p>
              <p className="text-sm text-text-muted">{shippingAddress.phone}</p>
            </Card>
          )}
          {billingAddress && !billingSameAsShipping && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-text">Billing Address</h3>
              <p className="mt-2 text-sm font-medium text-text">{billingAddress.fullName}</p>
              <p className="text-sm text-text-muted">{formatAddress(billingAddress)}</p>
              <p className="text-sm text-text-muted">{billingAddress.phone}</p>
            </Card>
          )}
        </div>
      )}

      {order.items.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text">Items</h3>
          <div className="mt-3 flex flex-col gap-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 border-b border-border pb-3 text-sm last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-text">{item.productName ?? item.productType} × {item.quantity}</p>
                  {item.selectedOptions.length > 0 && (
                    <p className="text-xs text-text-muted">
                      {item.selectedOptions.map((o) => `${o.option_label}: ${o.value_label}`).join(" · ")}
                    </p>
                  )}
                  <p className="text-xs text-text-muted">{formatPrice(item.unitPrice)} each</p>
                </div>
                <p className="font-semibold text-text">{formatPrice(item.totalPrice)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-text">Payment</h3>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Service</p>
          <div className="flex justify-between">
            <dt className="text-text-muted">Subtotal</dt>
            <dd className="text-text">{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between">
              <dt className="text-primary">Discount</dt>
              <dd className="text-primary">-{formatPrice(order.discountAmount)}</dd>
            </div>
          )}
          {pricingConfig.cgst_percent > 0 && (
            <div className="flex justify-between">
              <dt className="text-text-muted">CGST ({pricingConfig.cgst_percent}%)</dt>
              <dd className="text-text">{formatPrice(cgstAmount)}</dd>
            </div>
          )}
          {pricingConfig.sgst_percent > 0 && (
            <div className="flex justify-between">
              <dt className="text-text-muted">SGST ({pricingConfig.sgst_percent}%)</dt>
              <dd className="text-text">{formatPrice(sgstAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 font-medium">
            <dt className="text-text">Service Total</dt>
            <dd className="text-text">{formatPrice(serviceTotal)}</dd>
          </div>

          {order.platformFee > 0 && (
            <>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Platform Fee</p>
              <div className="flex justify-between border-t border-border pt-2 font-medium">
                <dt className="text-text">Platform Fee Total</dt>
                <dd className="text-text">{formatPrice(order.platformFee)}</dd>
              </div>
            </>
          )}

          <div className="flex justify-between pt-2">
            <dt className="text-text-muted">Delivery Fee</dt>
            <dd className="text-text">{order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
            <dt className="text-text">Total</dt>
            <dd className="text-text">{formatPrice(order.total)}</dd>
          </div>
          <div className="flex justify-between pt-1">
            <dt className="text-text-muted">Payment Status</dt>
            <dd className="capitalize text-text">{order.paymentStatus}</dd>
          </div>
          {order.paymentMethod && (
            <div className="flex justify-between pt-1">
              <dt className="text-text-muted">Payment Method</dt>
              <dd className="text-text">{order.paymentMethod}</dd>
            </div>
          )}
        </dl>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <Button variant="outline" size="sm" onClick={handleDownloadInvoice} disabled={downloading}>
            {downloading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            Download Invoice
          </Button>
        </div>
      </Card>
    </div>
  );
}
