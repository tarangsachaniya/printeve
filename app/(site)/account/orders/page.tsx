"use client";

import * as React from "react";
import Link from "next/link";
import { Package, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { getOrders } from "@/lib/orders";
import { useSiteSettings } from "@/lib/site-settings";
import type { Order } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_VARIANT: Record<Order["status"], "default" | "primary" | "secondary" | "accent" | "outline"> = {
  pending: "outline",
  confirmed: "primary",
  printing: "secondary",
  out_for_delivery: "secondary",
  delivered: "accent",
  cancelled: "default",
};

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<Order[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const settings = useSiteSettings();

  React.useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.items))
      .catch((err) => {
        const msg = err instanceof ApiError ? err.message : "Unable to load orders.";
        setError(msg);
        toast.error(msg);
        setOrders([]);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">My Orders</h1>

      <div className="mt-8">
        {orders === null ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-text-muted" />
          </div>
        ) : error ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-danger/10">
              <AlertTriangle className="size-6 text-danger" />
            </div>
            <h2 className="text-lg font-semibold text-text">Failed to load orders</h2>
            <p className="max-w-sm text-sm text-text-muted">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-2">
              Try Again
            </Button>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-surface">
              <Package className="size-6 text-text-muted" />
            </div>
            <h2 className="text-lg font-semibold text-text">
              {settings.empty_orders_title || "No orders yet"}
            </h2>
            <p className="max-w-sm text-sm text-text-muted">
              {settings.empty_orders_subtitle ||
                "When you place an order, it will show up here with its status and tracking details."}
            </p>
            <Button asChild className="mt-2">
              <Link href="/products">Start an Order</Link>
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`}>
                <Card className="flex items-center justify-between gap-4 p-4 transition-colors hover:border-primary/40">
                  <div>
                    <p className="text-sm font-semibold text-text">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="mt-0.5 text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={STATUS_VARIANT[order.status] ?? "default"} className={cn("capitalize")}>
                      {formatStatus(order.status)}
                    </Badge>
                    <p className="text-sm font-bold text-text">{formatPrice(order.total)}</p>
                    <ChevronRight className="size-4 text-text-muted" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
