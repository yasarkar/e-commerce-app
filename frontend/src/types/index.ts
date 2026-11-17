// Enums
export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

// Coupon Types
export type CouponType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: CouponType;
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  createdAt: string;
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  description?: string;
  type: CouponType;
  discountValue: number;
  maximumDiscountAmount?: number;
  calculatedDiscount: number;
  finalAmount: number;
  message: string;
}

export interface CreateCouponRequest {
  code: string;
  description?: string;
  type: CouponType;
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  validFrom: string;
  validUntil: string;
}

export interface UpdateCouponRequest extends Omit<CreateCouponRequest, 'code'> {
  active: boolean;
}

// Backend Response Wrappers
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  validationErrors?: Record<string, string>;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Entity / DTO Types
export interface Address {
  label?: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  addresses?: Address[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  active: boolean;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subTotal: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  updatedAt?: string;
}

export interface WishlistItem {
  productId: string;
  productName: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  active: boolean;
  addedAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  totalItems: number;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  orderItems: OrderItem[];
  shippingAddress: Address;
  totalAmount: number;
  couponCode?: string;
  discountAmount?: number;
  finalAmount?: number;
  status: OrderStatus;
  orderDate: string;
}

// Request Filter DTO
export interface ProductFilterParams {
  searchQuery?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  active?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

// Authentication Request & Response DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserResponse extends User { }

export interface CreateOrderRequest {
  shippingAddress: Address;
  items?: { productId: string; quantity: number }[];
  couponCode?: string;
}

// Admin Requests
export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  active: boolean;
}

export interface UpdateProductRequest extends CreateProductRequest { }

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest { }

// Review & Rating Types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userFullName: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
}

export interface ProductRating {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
}

export interface UpdateReviewRequest {
  rating: number;
  title?: string;
  comment: string;
}

// Stock Movement Types
export type StockMovementType = 'SALE' | 'CANCEL' | 'RESTOCK' | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  quantityChange: number; // negatif = düşüş, pozitif = artış
  type: StockMovementType;
  reason?: string;
  performedBy?: string;
  createdAt: string;
}

export interface BulkStockUpdateItem {
  productId: string;
  newStockQuantity: number;
  reason?: string;
}

export interface BulkStockUpdateResult {
  productId: string;
  productName: string;
  success: boolean;
  oldStockQuantity?: number;
  newStockQuantity?: number;
  message?: string;
}

export interface StockMovementFilterParams {
  productSearch?: string;
  productId?: string;
  type?: StockMovementType;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}
