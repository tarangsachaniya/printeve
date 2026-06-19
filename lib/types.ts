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

export interface CustomFieldOption {
  id: string;
  name: string;
  price_modifier: number;
  is_default: boolean;
}

export interface CustomField {
  product_field_id: string;
  key: string;
  label: string;
  field_type: "select" | "multi_select" | "boolean" | "number" | "text" | "textarea" | "file_upload" | "radio";
  is_required: boolean;
  options: CustomFieldOption[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Guideline {
  icon_url: string;
  title: string;
  description: string;
}

export interface Specification {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  description: string | null;
  images: string[];
  video_url: string | null;
  created_at: string;
  paper_sizes: VariantOption[];
  paper_qualities: VariantOption[];
  paper_types: VariantOption[];
  quantity_slabs: QuantitySlab[];
  custom_fields: CustomField[];
  faqs: FAQ[];
  finish_and_care: string[];
  guidelines: Guideline[];
  specifications: Specification[];
  city_id: string | null;
  city_pricing_applied: boolean;
  category: { id: string; title: string; slug: string } | null;
  related_products: { id: string; name: string; slug: string; base_price: number; images: string[] }[];
}

export interface ProductListResponse {
  items: Product[];
  total: number;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  icon_url: string | null;
  short_description: string | null;
  products: { id: string; name: string; slug: string }[];
}

export interface City {
  id: string;
  name: string;
  state: string;
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
    custom_fields?: { product_field_id: string; label: string; amount: number }[];
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

export type DimensionUnit = "mm" | "cm" | "in";

export interface CustomDimensions {
  width: number;
  height: number;
  unit: DimensionUnit;
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
    custom_fields?: Record<string, { value: string | string[]; label: string; modifier: number }>;
    custom_dimensions?: CustomDimensions;
  };
  artworkFileName?: string;
}
