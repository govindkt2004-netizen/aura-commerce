export type UserRole = 'customer' | 'admin';

export interface Address {
  id: string;
  title?: string; // e.g. "Home", "Office"
  recipientName?: string;
  fullName?: string;
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  zip?: string;
  postalCode?: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  addresses: Address[];
  status?: 'active' | 'suspended';
  lastLogin?: string;
  createdAt: string;
}

export interface ProductVariant {
  sizes?: string[];
  colors?: { name: string; hex: string }[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  date: string;
  verifiedPurchase?: boolean;
  isVerified?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  detailedDescription?: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  categorySlug: string;
  brand?: string;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  sku?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isActive?: boolean;
  tags: string[];
  variants?: ProductVariant;
  specs: ProductSpec[];
  features?: string[];
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  isFeatured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  size?: string;
  selectedSize?: string;
  color?: string;
  selectedColor?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'return_requested'
  | 'returned';

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  discountPercent?: number;
  shippingFee: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: 'stripe' | 'test_card' | 'cod' | 'credit_card' | 'cash_on_delivery';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentIntentId?: string;
  orderStatus: OrderStatus;
  status?: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: string;
  cancellationReason?: string;
  returnReason?: string;
  returnComment?: string;
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalProducts: number;
  totalCustomers: number;
  averageOrderValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
  recentCustomers: { user: User; totalOrders: number; totalSpent: number }[];
  salesTrend: { date: string; revenue: number; orders: number }[];
  salesByDay: { date: string; amount: number }[];
  categoryDistribution: { category: string; count: number; revenue: number }[];
}

export interface FilterState {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
  sortBy: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
  inStockOnly: boolean;
}

// --- NEW ADMIN MANAGEMENT TYPES ---

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expirationDate?: string;
  expiryDate?: string;
  description?: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  link?: string;
  position: 'top-hero' | 'hero' | 'middle-shop' | 'bottom-footer';
  isActive: boolean;
  displayOrder: number;
  bgGradient?: string;
  createdAt: string;
}

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface HomepageContent {
  announcementBar?: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  heroBadge?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroPrimaryCtaText?: string;
  heroPrimaryCtaLink?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaLink?: string;
  heroImageUrl?: string;
  valueProps?: {
    title: string;
    description: string;
    icon: string;
  }[];
  announcement?: {
    isEnabled: boolean;
    text: string;
    link: string;
    badge: string;
  };
  hero?: {
    heading: string;
    tagline: string;
    description: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
  };
  featuredSectionTitle?: string;
  featuredSectionSubtitle?: string;
  newArrivalsTitle?: string;
  newArrivalsSubtitle?: string;
  curatedCategorySlugs?: string[];
  benefits?: BenefitItem[];
}

export interface NavigationItem {
  id: string;
  label: string;
  link: string;
  type: 'page' | 'category' | 'external';
  isEnabled: boolean;
  order: number;
}

export interface SiteSettings {
  storeName?: string;
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  currency?: string;
  currencySymbol?: string;
  taxPercent?: number;
  lowStockThreshold?: number;
  freeShippingThreshold?: number;
  shippingFee?: number;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
  policies?: {
    returnPolicy?: string;
    shippingPolicy?: string;
    privacyPolicy?: string;
    termsOfService?: string;
  };
  general?: {
    siteName: string;
    logoUrl?: string;
    tagline: string;
    contactEmail: string;
    contactPhone: string;
    businessAddress: string;
    taxNumber?: string;
  };
  store?: {
    currency: string;
    currencySymbol: string;
    freeShippingThreshold: number;
    standardShippingFee: number;
    expressShippingFee: number;
    taxPercent: number;
    lowStockThreshold: number;
    allowCod: boolean;
    minOrderAmount: number;
  };
  social?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    twitter?: string;
  };
  theme?: {
    primaryColor: string;
    accentColor: string;
    mode: 'light' | 'dark';
    buttonRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  };
  navigation?: NavigationItem[];
  footer?: {
    description: string;
    copyrightText: string;
    customerServiceLinks: { label: string; link: string }[];
    quickLinks: { label: string; link: string }[];
  };
}

export interface AdminActivityLog {
  id: string;
  adminEmail: string;
  adminName: string;
  action: string;
  targetType: 'product' | 'order' | 'category' | 'coupon' | 'settings' | 'customer' | 'banner' | 'inventory' | 'auth';
  targetId?: string;
  details: string;
  timestamp: string;
}

export interface ProductQuestion {
  id: string;
  productId: string;
  authorName: string;
  question: string;
  answer?: string;
  answeredBy?: string;
  answeredAt?: string;
  createdAt: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'deal' | 'price_drop' | 'system' | 'return';
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  origin?: string;
  website?: string;
  isActive: boolean;
  productCount?: number;
}

export interface SupportTicketMessage {
  id: string;
  sender: 'customer' | 'support';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
  category: 'order' | 'delivery' | 'payment' | 'return' | 'product' | 'defect' | 'general';
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: SupportTicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

