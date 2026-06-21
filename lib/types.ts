export interface ProductOption {
  id: string;
  field_definition_id: string;
  key: string;
  label: string;
  field_type: string;
  is_required: boolean;
  sort_order: number;
  values: { id: string; field_option_value_id: string; value: string; is_default: boolean }[];
}

export interface PriceLookupResult {
  quantity: number;
  price: number;
  max_completion_minutes: number | null;
  selected_options: { option_label: string; value_label: string; field_option_value_id: string }[];
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
  description: string | null;
  images: string[];
  video_url: string | null;
  created_at: string;
  options: ProductOption[];
  available_quantities: number[];
  starting_price: number | null;
  faqs: FAQ[];
  finish_and_care: string[];
  guidelines: Guideline[];
  specifications: Specification[];
  city_id: string | null;

  category: { id: string; title: string; slug: string } | null;
  related_products: { id: string; name: string; slug: string; images: string[]; starting_price: number | null }[];
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

export interface SelectedOption {
  option_label: string;
  value_label: string;
  field_option_value_id: string;
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
    options: SelectedOption[];
    custom_dimensions?: CustomDimensions;
  };
  artworkFileName?: string;
}
