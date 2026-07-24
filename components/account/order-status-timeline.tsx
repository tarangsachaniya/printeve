"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus, OrderTracking } from "@/lib/types";

const STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: "pending", label: "Order Placed", description: "We've received your order and are getting it ready." },
  { status: "confirmed", label: "Confirmed", description: "Your order has been confirmed and will begin printing soon." },
  { status: "printing", label: "Printing", description: "Your order is being printed." },
  { status: "out_for_delivery", label: "Out for Delivery", description: "Your print is on the way!" },
  { status: "delivered", label: "Delivered", description: "Delivered." },
];

export function OrderStatusTimeline({
  currentStatus,
  history,
}: {
  currentStatus: OrderStatus;
  history?: OrderTracking["history"];
}) {
  const currentIdx = STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <ol className="flex flex-col gap-4">
      {STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const historyEntry = history?.find((h) => h.status === step.status);
        return (
          <li key={step.status} className="flex items-center gap-3">
            {done ? (
              <CheckCircle2 className="size-5 text-primary" />
            ) : (
              <Circle className="size-5 text-border" />
            )}
            <div>
              <span className={cn("text-sm", done ? "font-medium text-text" : "text-text-muted")}>{step.label}</span>
              {idx === currentIdx && <p className="text-sm text-text-muted">{step.description}</p>}
              {historyEntry?.updatedAt && (
                <p className="text-xs text-text-muted">{new Date(historyEntry.updatedAt).toLocaleString()}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
