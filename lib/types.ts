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

export interface PricingMatrixRow {
  quantity: number;
  price: number;
  max_completion_minutes: number | null;
  city_id: string | null;
  option_value_ids: string[];
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
  compare_at_price?: number | null;
  discount_percent?: number | null;
  delivers_to_city?: boolean | null;
  pricing_matrix: PricingMatrixRow[];
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
  image_url: string | null;
  short_description: string | null;
  products: { id: string; name: string; slug: string; images: string[] }[];
}

export type RedirectType = "none" | "product" | "category" | "url" | "screen";

export interface StorySlide {
  id: string;
  media_type: "image" | "video";
  media_url: string;
  duration_seconds: number;
  redirect_type: RedirectType;
  redirect_value: string | null;
}

export interface Story {
  id: string;
  title: string;
  cover_image_url: string | null;
  category_id?: string | null;
  product_id?: string | null;
  slides: StorySlide[];
}

export interface Campaign {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  cta_label: string | null;
  redirect_type: RedirectType;
  redirect_value: string | null;
}

export type FeaturedItem =
  | { id: string; type: "product"; sort_order: number; product: Product }
  | { id: string; type: "category"; sort_order: number; category: Category }
  | { id: string; type: "offer"; sort_order: number; offer: { id: string; code: string; discount_type: "percentage" | "fixed"; discount_value: number; end_date: string } }
  | { id: string; type: "campaign"; sort_order: number; campaign: Campaign };

export interface CouponPromotion {
  id: string;
  title: string;
  image_url: string;
  store_name: string | null;
  store_logo_url: string | null;
  category: { id: string; title: string; slug: string } | null;
  is_featured: boolean;
  coupon: {
    id: string;
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    max_discount_cap: number | null;
    minimum_purchase_amount: number | null;
    end_date: string;
  };
}

export interface CouponPromotionListResponse {
  items: CouponPromotion[];
  total: number;
}

export interface City {
  id: string;
  name: string;
  state: string;
  /** Flat delivery fee for this city, waived above the free-delivery threshold. */
  price: number | null;
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
  discountAmount: number;
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
  avatarUrl?: string | null;
  company?: string | null;
  gstNumber?: string | null;
  orderNotifications?: boolean;
  promotionalNotifications?: boolean;
}

export type AddressLabel = "Home" | "Work" | "Hotel" | "Other";

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
  /** Receiver is the account holder — auto-fills name/phone and stays in sync. */
  isSelf?: boolean;
  houseNumber?: string | null;
  floor?: string | null;
  towerBlock?: string | null;
  landmark?: string | null;
  mapsLink?: string | null;
  /** Customer-provided delivery coordinates, used for printer radius matching. */
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
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
