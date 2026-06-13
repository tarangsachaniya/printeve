export interface VariantOption {
  id: string;
  paper_size_id?: string;
  paper_quality_id?: string;
  paper_type_id?: string;
  name: string;
  price_modifier: number;
  is_default: boolean;
}

export interface QuantitySlab {
  id: string;
  min_qty: number;
  max_qty: number | null;
  price_modifier: number;
  max_completion_minutes: number | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  category_id: string | null;
  description: string | null;
  images: string[];
  video_url: string | null;
  created_at: string;
  paper_sizes: VariantOption[];
  paper_qualities: VariantOption[];
  paper_types: VariantOption[];
  quantity_slabs: QuantitySlab[];
  city_id: string | null;
  city_pricing_applied: boolean;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
}

export interface PriceBreakdown {
  quantity: number;
  base_unit_price: number;
  modifiers: {
    paper_size: { id: string; name: string; amount: number } | null;
    paper_quality: { id: string; name: string; amount: number } | null;
    paper_type: { id: string; name: string; amount: number } | null;
    quantity_slab: { amount: number } | null;
    city?: { amount: number } | null;
  };
  unit_price: number;
  total_price: number;
  matched_slab: { min_qty: number; max_qty: number | null } | null;
  max_completion_minutes: number | null;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "printing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
  id: string;
  customerId: string;
  printerId: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  paymentStatus: OrderPaymentStatus;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productType: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  changedBy: string;
  timestamp: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string | null;
  slug: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selection: {
    paper_size?: { id: string; name: string };
    paper_quality?: { id: string; name: string };
    paper_type?: { id: string; name: string };
  };
  artworkFileName?: string;
}
