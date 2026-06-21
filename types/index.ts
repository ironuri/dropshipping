export type Supplier = "BIGBUY" | "DIETISUR";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";
export type SupplierOrderStatus =
  | "PENDING"
  | "SENT"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "FAILED";

export interface ProductImage {
  id: string;
  url: string;
  altEs: string;
  altCa?: string | null;
  position: number;
}

export interface Category {
  id: string;
  name: string;
  nameEs: string;
  nameCa?: string | null;
  slug: string;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  imageUrl?: string | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameEs: string;
  nameCa?: string | null;
  descriptionEs: string;
  descriptionCa?: string | null;
  descriptionEn?: string | null;
  sku: string;
  ean?: string | null;
  supplier: Supplier;
  supplierSku: string;
  costPrice: number;
  retailPrice: number;
  compareAtPrice?: number | null;
  stock: number;
  active: boolean;
  images: ProductImage[];
  categories: Category[];
  tags: string[];
  ingredients?: string | null;
  spf?: number | null;
  isEco: boolean;
  isVegan: boolean;
  isCrueltyFree: boolean;
  brand?: string | null;
  weight?: number | null;
  volume?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  product: Pick<Product, "id" | "slug" | "nameEs" | "retailPrice" | "images" | "stock" | "supplier" | "supplierSku">;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: Date;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId?: string | null;
  email: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  stripePaymentIntentId?: string | null;
  couponCode?: string | null;
  discountAmount: number;
  supplierOrders: SupplierOrder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SupplierOrder {
  id: string;
  orderId: string;
  supplier: Supplier;
  status: SupplierOrderStatus;
  supplierOrderId?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  discount: number;
  active: boolean;
  items: BundleItem[];
}

export interface BundleItem {
  id: string;
  bundleId: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface SupplierProduct {
  sku: string;
  ean?: string;
  name: string;
  nameEs?: string;
  descriptionEs?: string;
  costPrice: number;
  stock: number;
  brand?: string;
  images?: string[];
  categories?: string[];
  weight?: number;
  volume?: number;
}

export interface SupplierAdapter {
  fetchProducts(): Promise<SupplierProduct[]>;
  getStock(sku: string): Promise<number>;
  placeOrder(order: OrderPayload): Promise<SupplierOrderResult>;
}

export interface OrderPayload {
  supplierOrderId: string;
  items: Array<{ sku: string; quantity: number }>;
  shippingAddress: Address;
  customerEmail: string;
}

export interface SupplierOrderResult {
  success: boolean;
  supplierOrderId?: string;
  error?: string;
}

export interface FilterState {
  brands: string[];
  categories: string[];
  spfMin?: number;
  spfMax?: number;
  priceMin?: number;
  priceMax?: number;
  isEco?: boolean;
  isVegan?: boolean;
  isCrueltyFree?: boolean;
  supplier?: Supplier;
  sortBy: "price_asc" | "price_desc" | "newest" | "bestseller";
  page: number;
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  facets: {
    brands: Array<{ name: string; count: number }>;
    categories: Array<{ name: string; count: number }>;
    spfValues: number[];
  };
}
