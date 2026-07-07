// Line-item pricing is handled entirely by the API via matrix lookup.
// This file also holds the shared checkout bill math (tax/fees/delivery),
// computed client-side from the live, site-wide pricing config for display —
// the API recomputes and charges the authoritative amounts at checkout.

import type { ProductOption } from "./types";
import type { PricingConfig } from "./site-config";

export function defaultOptionValue(option: ProductOption): string | undefined {
  const def = option.values.find((v) => v.is_default);
  return def?.field_option_value_id ?? option.values[0]?.field_option_value_id;
}

export interface OrderBill {
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  serviceTotal: number;
  platformFee: number;
  deliveryFee: number;
  grandTotal: number;
  meetsMinOrder: boolean;
  amountToFreeDelivery: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Computes the two-bill breakdown (Service = subtotal + CGST + SGST; Platform
 * Fee; Delivery kept separate) from the live site-wide pricing config.
 */
export function computeOrderBill(subtotal: number, config: PricingConfig, cityDeliveryFee: number): OrderBill {
  const deliveryFee = subtotal >= config.free_delivery_min_price ? 0 : cityDeliveryFee;
  const cgstAmount = round2((subtotal * config.cgst_percent) / 100);
  const sgstAmount = round2((subtotal * config.sgst_percent) / 100);
  const platformFee = config.platform_fee_type === "percentage"
    ? round2((subtotal * config.platform_fee_value) / 100)
    : config.platform_fee_value;
  const serviceTotal = subtotal + cgstAmount + sgstAmount;

  return {
    subtotal,
    cgstAmount,
    sgstAmount,
    serviceTotal,
    platformFee,
    deliveryFee,
    grandTotal: serviceTotal + platformFee + deliveryFee,
    meetsMinOrder: subtotal >= config.min_order_price,
    amountToFreeDelivery: Math.max(0, config.free_delivery_min_price - subtotal),
  };
}
