"use client";

import * as React from "react";
import { toast } from "sonner";
import { Search, Loader2, PackageSearch, CheckCircle2, Circle } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Order Placed" },
  { status: "confirmed", label: "Confirmed" },
  { status: "printing", label: "Printing" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<Order | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const data = await api.get<Order>(`/orders/${orderId.trim()}`);
      setOrder(data);
    } catch (err) {
      let msg: string;
      if (err instanceof ApiError && err.status === 404) {
        msg = "We couldn't find an order with that ID. Please double-check and try again.";
      } else if (err instanceof ApiError && err.status === 401) {
        msg = "Please sign in to track this order.";
      } else if (err instanceof ApiError) {
        msg = err.message;
      } else {
        msg = "Something went wrong. Please try again.";
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const isCancelled = order?.status === "cancelled";
  const currentIdx = order ? TIMELINE_STEPS.findIndex((s) => s.status === order.status) : -1;

  return (
    <div className="mx-auto max-w-2xl container-px py-14 lg:py-20">
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
          <PackageSearch className="size-6 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-text sm:text-3xl">Track Your Order</h1>
        <p className="mt-2 text-sm text-text-muted">Enter your order ID to see the latest status and delivery details.</p>
      </div>

      <Card className="mt-8 p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label className="mb-1.5 block" htmlFor="orderId">Order ID</Label>
            <Input id="orderId" required value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. 8f3a1c2b-..." />
          </div>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            Track Order
          </Button>
        </form>
        {error && <p className="mt-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>}
      </Card>

      {order && (
        <Card className="mt-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-text">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
            <Badge variant={isCancelled ? "default" : "primary"} className="capitalize">
              {order.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-sm text-text-muted">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>

          {!isCancelled && (
            <ol className="mt-6 flex flex-col gap-4">
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
          )}

          <div className="mt-6 flex justify-between border-t border-border pt-4 text-sm font-semibold">
            <span className="text-text">Order Total</span>
            <span className="text-text">{formatPrice(order.total)}</span>
          </div>
        </Card>
      )}
    </div>
  );
}
