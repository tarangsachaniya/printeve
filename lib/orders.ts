import { api } from "./api";
import type { Order, OrderPaymentStatus, OrderStatus } from "./types";

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  optionValueIds?: string[];
}

export interface CreateOrderPayload {
  items: CreateOrderItemInput[];
  addressId?: string;
  deliveryFee?: number;
}

export interface OrdersListResult {
  items: Order[];
  total: number;
}

interface RawOrder {
  id: string;
  customer_id: string;
  printer_id: string;
  status: OrderStatus;
  subtotal: number | string;
  delivery_fee: number | string;
  platform_fee: number | string;
  total: number | string;
  payment_status: OrderPaymentStatus;
  created_at: string;
}

function toOrder(raw: RawOrder): Order {
  return {
    id: raw.id,
    customerId: raw.customer_id,
    printerId: raw.printer_id,
    status: raw.status,
    subtotal: Number(raw.subtotal),
    deliveryFee: Number(raw.delivery_fee),
    platformFee: Number(raw.platform_fee),
    total: Number(raw.total),
    paymentStatus: raw.payment_status,
    createdAt: raw.created_at,
  };
}

export async function getOrders(): Promise<OrdersListResult> {
  const res = await api.get<{ items: RawOrder[]; total: number }>("/orders");
  return { items: res.items.map(toOrder), total: res.total };
}

export async function getOrderById(id: string): Promise<Order> {
  return toOrder(await api.get<RawOrder>(`/orders/${id}`));
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await api.post<{ order: RawOrder; message: string }>("/checkout/confirm", payload);
  return toOrder(res.order);
}
