import { api } from "./api";
import type { Order, OrderAddress, OrderItemDetail, OrderPaymentStatus, OrderStatus, OrderTracking } from "./types";

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  optionValueIds?: string[];
}

export interface CreateOrderGstDetails {
  hasGst: boolean;
  gstNumber?: string;
  companyName?: string;
  /** Must belong to the ordering user. Defaults to the shipping address when omitted. */
  billingAddressId?: string;
}

export interface CreateOrderPayload {
  items: CreateOrderItemInput[];
  addressId?: string;
  couponCode?: string;
  gstDetails?: CreateOrderGstDetails;
  paymentMethod?: string;
}

export interface OrdersListResult {
  items: Order[];
  total: number;
}

interface RawOrderAddress {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  house_number: string | null;
  floor: string | null;
  tower_block: string | null;
  landmark: string | null;
}

interface RawOrderItem {
  id: string;
  product_type: string;
  quantity: number;
  unit_price: number | string;
  total_price: number | string;
  selected_options: { option_label: string; value_label: string; field_option_value_id: string }[] | null;
  products: { name: string } | null;
}

interface RawOrder {
  id: string;
  customer_id: string;
  printer_id: string;
  status: OrderStatus;
  subtotal: number | string;
  delivery_fee: number | string;
  platform_fee: number | string;
  discount_amount: number | string;
  total: number | string;
  payment_status: OrderPaymentStatus;
  payment_method: string | null;
  created_at: string;
  expected_delivery_at: string | null;
  invoice_number: string | null;
  invoice_generated_at: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  has_gst: boolean;
  gst_number: string | null;
  company_name: string | null;
  place_of_supply: string | null;
  state_code: string | null;
  shipping_address: RawOrderAddress | null;
  billing_address: RawOrderAddress | null;
  items?: RawOrderItem[];
}

function toAddress(raw: RawOrderAddress | null): OrderAddress | null {
  if (!raw) return null;
  return {
    id: raw.id,
    label: raw.label,
    fullName: raw.full_name,
    phone: raw.phone,
    line1: raw.line1,
    line2: raw.line2,
    city: raw.city,
    state: raw.state,
    pincode: raw.pincode,
    houseNumber: raw.house_number,
    floor: raw.floor,
    towerBlock: raw.tower_block,
    landmark: raw.landmark,
  };
}

function toItem(raw: RawOrderItem): OrderItemDetail {
  return {
    id: raw.id,
    productType: raw.product_type,
    productName: raw.products?.name ?? null,
    quantity: raw.quantity,
    unitPrice: Number(raw.unit_price),
    totalPrice: Number(raw.total_price),
    selectedOptions: raw.selected_options ?? [],
  };
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
    discountAmount: Number(raw.discount_amount),
    total: Number(raw.total),
    paymentStatus: raw.payment_status,
    paymentMethod: raw.payment_method,
    createdAt: raw.created_at,
    expectedDeliveryAt: raw.expected_delivery_at,
    invoiceNumber: raw.invoice_number,
    invoiceGeneratedAt: raw.invoice_generated_at,
    customerName: raw.customer_name,
    customerPhone: raw.customer_phone,
    customerEmail: raw.customer_email,
    hasGst: raw.has_gst,
    gstNumber: raw.gst_number,
    companyName: raw.company_name,
    placeOfSupply: raw.place_of_supply,
    stateCode: raw.state_code,
    shippingAddress: toAddress(raw.shipping_address),
    billingAddress: toAddress(raw.billing_address),
    items: (raw.items ?? []).map(toItem),
  };
}

export async function getOrders(): Promise<OrdersListResult> {
  const res = await api.get<{ items: RawOrder[]; total: number }>("/orders");
  return { items: res.items.map(toOrder), total: res.total };
}

export async function getOrderById(id: string): Promise<Order> {
  return toOrder(await api.get<RawOrder>(`/orders/${id}`));
}

interface RawOrderTracking {
  order_id: string;
  status: OrderStatus;
  updated_at: string | null;
  eta_minutes: number | null;
  history: { status: OrderStatus; updated_at: string }[];
}

export async function getOrderTracking(id: string): Promise<OrderTracking> {
  const raw = await api.get<RawOrderTracking>(`/orders/${id}/track`);
  return {
    orderId: raw.order_id,
    status: raw.status,
    updatedAt: raw.updated_at,
    etaMinutes: raw.eta_minutes,
    history: raw.history.map((h) => ({ status: h.status, updatedAt: h.updated_at })),
  };
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await api.post<{ order: RawOrder; message: string }>("/checkout/confirm", payload);
  return toOrder(res.order);
}
