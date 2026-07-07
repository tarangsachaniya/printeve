"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Loader2, CheckCircle2, Circle, PackageX, AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { getOrderById } from "@/lib/orders";
import { usePricingConfig } from "@/lib/site-settings";
import { downloadServiceBillPdf, downloadPlatformFeeBillPdf } from "@/lib/invoice-pdf";
import type { Order, OrderStatus } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Order Placed" },
  { status: "confirmed", label: "Confirmed" },
  { status: "printing", label: "Printing" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const pricingConfig = usePricingConfig();
  const [order, setOrder] = React.useState<Order | null | undefined>(undefined);
  const [error, setError] = React.useState<string | null>(null);

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
  }, [params.id]);

  if (order === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-text-muted" />
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
  const currentIdx = TIMELINE_STEPS.findIndex((s) => s.status === order.status);

  // CGST/SGST are global, site-wide rates (not stored per order) — computed here
  // from the order's net subtotal using the current live rates.
  const netSubtotal = Math.max(0, order.subtotal - order.discountAmount);
  const cgstAmount = Math.round(((netSubtotal * pricingConfig.cgst_percent) / 100) * 100) / 100;
  const sgstAmount = Math.round(((netSubtotal * pricingConfig.sgst_percent) / 100) * 100) / 100;
  const serviceTotal = netSubtotal + cgstAmount + sgstAmount;

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
      </div>

      {!isCancelled && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text">Status</h3>
          <ol className="mt-4 flex flex-col gap-4">
            {TIMELINE_STEPS.map((step, idx) => {
              const done = idx <= currentIdx;
              return (
                <li key={step.status} className="flex items-center gap-3">
                  {done ? (
                    <CheckCircle2 className="size-5 text-primary" />
                  ) : (
                    <Circle className="size-5 text-border" />
                  )}
                  <span className={cn("text-sm", done ? "font-medium text-text" : "text-text-muted")}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
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
        </dl>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadServiceBillPdf({
                orderId: order.id,
                createdAt: order.createdAt,
                subtotal: order.subtotal,
                discountAmount: order.discountAmount,
                cgstPercent: pricingConfig.cgst_percent,
                sgstPercent: pricingConfig.sgst_percent,
                cgstAmount,
                sgstAmount,
                serviceTotal,
              })
            }
          >
            <Download className="size-3.5" /> Service Bill (PDF)
          </Button>
          {order.platformFee > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadPlatformFeeBillPdf({
                  orderId: order.id,
                  createdAt: order.createdAt,
                  platformFee: order.platformFee,
                })
              }
            >
              <Download className="size-3.5" /> Platform Fee Bill (PDF)
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
