// Enums
export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPING = "SHIPPING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export enum PaymentStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum CustomerTier {
  NEW = "NEW",
  REGULAR = "REGULAR",
  VIP = "VIP",
  POTENTIAL = "POTENTIAL",
}

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
}

export enum PromotionType {
  PRODUCT_DISCOUNT = "PRODUCT_DISCOUNT",
  BUY_X_GET_Y = "BUY_X_GET_Y",
  BUNDLE = "BUNDLE",
}

// Auth
export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role?: string;
  roleName?: string;
  permissions?: string[];
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Role {
  roleId: number;
  roleName: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  permissionId: number;
  permissionName: string;
  description?: string;
  module?: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Customer
export interface Customer {
  customer_id: number;
  email: string;
  phone: string;
  full_name: string;
  gender?: Gender;
  date_of_birth?: string;
  customer_tier: CustomerTier;
  total_orders: number;
  total_spent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  address_id: number;
  customer_id: number;
  recipient_name: string;
  phone: string;
  address_line: string;
  ward: string;
  district: string;
  city: string;
  is_default: boolean;
}

// Product
export interface Product {
  productId: number;
  sku: string;
  productName: string;
  categoryId: number;
  category?: ProductCategory;
  brandId: number;
  brand?: Brand;
  material?: string;
  description?: string;
  careInstructions?: string;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductCategory {
  categoryId: number;
  categoryName: string;
  parentCategoryId?: number;
  description?: string;
  isActive: boolean;
}

export interface Brand {
  brandId: number;
  brandName: string;
  description?: string;
  logoUrl?: string;
  country?: string;
  website?: string;
  isActive: boolean;
}

export interface ProductVariant {
  variantId: number;
  productId: number;
  product?: Product;
  productSku?: string;
  color?: string;
  size?: string;
  variantSku: string;
  costPrice?: number;
  price: number; // Giá bán lẻ chính
  salePrice?: number; // Giá khuyến mãi (nếu có)
  stockQuantity: number;
  minStockThreshold: number;
  isActive: boolean;
}

export interface ProductImage {
  imageId: number;
  productId: number;
  variantId?: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

// Order
export interface Order {
  order_id: number;
  order_number: string;
  customer_id: number;
  customer_name?: string;
  customer?: Customer;
  order_date: string;
  status: OrderStatus;
  shipping_address_id: number;
  shipping_address?: CustomerAddress;
  shipping_method?: string;
  shipping_code?: string;
  shipping_fee: number;
  payment_method: string;
  payment_status: PaymentStatus;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  cancellation_reason?: string;
  return_reason?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  order_detail_id?: number;
  order_id?: number;
  variant_id: number;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  total_price?: number;
  // Product info for display
  product_name?: string;
  variant_sku?: string;
  color?: string;
  size?: string;
}

// Coupon
export interface Coupon {
  coupon_id: number;
  coupon_code: string;
  coupon_name: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  max_discount_amount?: number;
  min_order_amount?: number;
  usage_limit?: number;
  used_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// Promotion
export interface Promotion {
  promotion_id: number;
  promotion_name: string;
  description?: string;
  promotion_type: PromotionType;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// Cart (frontend only)
export interface CartItem {
  variantId: number; // Đổi từ variant_id sang variantId để nhất quán
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}
