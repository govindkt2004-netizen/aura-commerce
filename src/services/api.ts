import {
  Product,
  Category,
  User,
  Order,
  OrderStatus,
  AdminStats,
  Address,
  Coupon,
  Banner,
  SiteSettings,
  HomepageContent,
  AdminActivityLog,
  ProductQuestion,
  ReturnRequest,
  NotificationItem,
  Brand,
  SupportTicket,
  FAQItem
} from '../types';

const getAuthToken = (): string | null => {
  return localStorage.getItem('aura_auth_token');
};

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // --- Auth ---
  async login(identifier: string, password?: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(name: string, email: string, phone?: string, password?: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async googleLogin(name?: string, email?: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Google Sign-in failed');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders()
    });
    if (!res.ok) {
      throw new Error('Not authenticated');
    }
    return res.json();
  },

  async updateProfile(data: { name: string; phone?: string; avatar?: string }): Promise<{ user: User }> {
    const res = await fetch('/api/auth/profile', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Profile update failed');
    }
    return res.json();
  },

  async addAddress(address: Omit<Address, 'id'>): Promise<{ address: Address; user: User }> {
    const res = await fetch('/api/auth/addresses', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(address)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add address');
    }
    return res.json();
  },

  // --- Products & Categories (Public) ---
  async getProducts(params?: Record<string, any>): Promise<{ products: Product[]; total: number }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
    }
    const res = await fetch(`/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProductById(id: string): Promise<{ product: Product }> {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async addReview(productId: string, review: { authorName: string; rating: number; title: string; comment: string }): Promise<{ product: Product }> {
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit review');
    }
    return res.json();
  },

  async getCategories(): Promise<{ categories: Category[] }> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  // --- Wishlist ---
  async getWishlist(): Promise<{ wishlist: Product[] }> {
    const res = await fetch('/api/wishlist', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch wishlist');
    return res.json();
  },

  async toggleWishlist(productId: string): Promise<{ inWishlist: boolean; wishlist: Product[] }> {
    const res = await fetch('/api/wishlist/toggle', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId })
    });
    if (!res.ok) throw new Error('Failed to update wishlist');
    return res.json();
  },

  // --- Coupons (Customer Validation) ---
  async validateCoupon(code: string, amount: number): Promise<{ valid: boolean; coupon: any; message: string }> {
    const query = new URLSearchParams({ code, amount: String(amount) });
    const res = await fetch(`/api/coupons/validate?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid promotional code');
    }
    return data;
  },

  async getPublicCoupons(): Promise<{ coupons: Coupon[] }> {
    const res = await fetch('/api/public/coupons');
    if (!res.ok) throw new Error('Failed to fetch public coupons');
    return res.json();
  },

  // --- Public CMS & Site Settings ---
  async getSiteSettings(): Promise<{ settings: SiteSettings }> {
    const res = await fetch('/api/site-settings');
    if (!res.ok) throw new Error('Failed to fetch store settings');
    return res.json();
  },

  async getHomepageContent(): Promise<{ content: HomepageContent }> {
    const res = await fetch('/api/homepage-content');
    if (!res.ok) throw new Error('Failed to fetch homepage content');
    return res.json();
  },

  async getPublicBanners(): Promise<{ banners: Banner[] }> {
    const res = await fetch('/api/banners');
    if (!res.ok) throw new Error('Failed to fetch promotional banners');
    return res.json();
  },

  // --- Payments (Stripe) ---
  async createPaymentIntent(amount: number): Promise<{ clientSecret: string; paymentIntentId: string; isLiveStripe: boolean; message?: string }> {
    const res = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount })
    });
    if (!res.ok) throw new Error('Failed to initialize payment gateway');
    return res.json();
  },

  // --- Orders ---
  async createOrder(orderData: any): Promise<{ order: Order }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  },

  async getOrders(): Promise<{ orders: Order[] }> {
    const res = await fetch('/api/orders', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrderById(id: string): Promise<{ order: Order }> {
    const res = await fetch(`/api/orders/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async getOrderInvoice(id: string): Promise<{ invoice: any; order: Order }> {
    const res = await fetch(`/api/orders/${id}/invoice`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch invoice data');
    return res.json();
  },

  async cancelOrder(id: string, reason?: string): Promise<{ order: Order; message: string }> {
    const res = await fetch(`/api/orders/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to cancel order');
    }
    return res.json();
  },

  async requestReturn(id: string, reason: string, comment?: string): Promise<{ order: Order; returnRequest: ReturnRequest; message: string }> {
    const res = await fetch(`/api/orders/${id}/return`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason, comment })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit return request');
    }
    return res.json();
  },

  async updateOrderTrackingStatus(id: string, status: OrderStatus, note?: string): Promise<{ order: Order; message: string }> {
    const res = await fetch(`/api/orders/${id}/tracking`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, note })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update order tracking status');
    }
    return res.json();
  },

  // --- Questions & Answers ---
  async getProductQuestions(productId: string): Promise<{ questions: ProductQuestion[] }> {
    const res = await fetch(`/api/products/${productId}/questions`);
    if (!res.ok) throw new Error('Failed to load questions');
    return res.json();
  },

  async askQuestion(productId: string, data: { authorName: string; question: string }): Promise<{ question: ProductQuestion; message: string }> {
    const res = await fetch(`/api/products/${productId}/questions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit question');
    }
    return res.json();
  },

  // --- Notifications ---
  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    const res = await fetch('/api/notifications', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  // ==================== ADMIN API ====================

  // --- Stats & Overview ---
  async getAdminStats(): Promise<{ stats: AdminStats }> {
    const res = await fetch('/api/admin/stats', { headers: getHeaders() });
    if (!res.ok) throw new Error('Admin authorization required');
    return res.json();
  },

  // --- Orders Management ---
  async getAdminOrders(): Promise<{ orders: Order[] }> {
    const res = await fetch('/api/admin/orders', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin orders');
    return res.json();
  },

  async updateOrderStatus(orderId: string, status: string, note?: string): Promise<{ order: Order }> {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, note })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update status');
    }
    return res.json();
  },

  async getAdminReturns(): Promise<{ returns: ReturnRequest[] }> {
    const res = await fetch('/api/admin/returns', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch returns');
    return res.json();
  },

  async updateAdminReturnStatus(id: string, status: string): Promise<{ returnRequest: ReturnRequest }> {
    const res = await fetch(`/api/admin/returns/${id}/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update return status');
    }
    return res.json();
  },

  async getAdminQuestions(): Promise<{ questions: ProductQuestion[] }> {
    const res = await fetch('/api/admin/questions', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json();
  },

  async answerAdminQuestion(id: string, answer: string): Promise<{ question: ProductQuestion }> {
    const res = await fetch(`/api/admin/questions/${id}/answer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ answer })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to answer question');
    }
    return res.json();
  },

  // --- Customers Management ---
  async getAdminCustomers(): Promise<{ customers: { user: User; totalOrders: number; totalSpent: number; lastOrderDate?: string }[] }> {
    const res = await fetch('/api/admin/customers', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async updateCustomerStatus(userId: string, status: 'active' | 'suspended'): Promise<{ user: User }> {
    const res = await fetch(`/api/admin/customers/${userId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update customer status');
    }
    return res.json();
  },

  // --- Products Management ---
  async createAdminProduct(productData: Partial<Product>): Promise<{ product: Product }> {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create product');
    }
    return res.json();
  },

  async updateAdminProduct(id: string, productData: Partial<Product>): Promise<{ product: Product }> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update product');
    }
    return res.json();
  },

  async duplicateAdminProduct(id: string): Promise<{ product: Product }> {
    const res = await fetch(`/api/admin/products/${id}/duplicate`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to duplicate product');
    }
    return res.json();
  },

  async toggleAdminProductActive(id: string): Promise<{ product: Product }> {
    const res = await fetch(`/api/admin/products/${id}/toggle-active`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to toggle product status');
    }
    return res.json();
  },

  async updateAdminProductStock(id: string, stock?: number, delta?: number): Promise<{ product: Product }> {
    const res = await fetch(`/api/admin/products/${id}/stock`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ stock, delta })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update inventory stock');
    }
    return res.json();
  },

  async deleteAdminProduct(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete product');
    }
    return true;
  },

  // --- Categories Management ---
  async getAdminCategories(): Promise<{ categories: Category[] }> {
    const res = await fetch('/api/admin/categories', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createAdminCategory(data: Partial<Category>): Promise<{ category: Category }> {
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create category');
    }
    return res.json();
  },

  async updateAdminCategory(id: string, data: Partial<Category>): Promise<{ category: Category }> {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update category');
    }
    return res.json();
  },

  async deleteAdminCategory(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete category');
    }
    return true;
  },

  // --- Coupons Management ---
  async getAdminCoupons(): Promise<{ coupons: Coupon[] }> {
    const res = await fetch('/api/admin/coupons', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
  },

  async createAdminCoupon(data: Partial<Coupon>): Promise<{ coupon: Coupon }> {
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create coupon');
    }
    return res.json();
  },

  async updateAdminCoupon(id: string, data: Partial<Coupon>): Promise<{ coupon: Coupon }> {
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update coupon');
    }
    return res.json();
  },

  async toggleAdminCoupon(id: string): Promise<{ coupon: Coupon }> {
    const res = await fetch(`/api/admin/coupons/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to toggle coupon status');
    }
    return res.json();
  },

  async deleteAdminCoupon(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete coupon');
    }
    return true;
  },

  // --- Banners Management ---
  async getAdminBanners(): Promise<{ banners: Banner[] }> {
    const res = await fetch('/api/admin/banners', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch banners');
    return res.json();
  },

  async createAdminBanner(data: Partial<Banner>): Promise<{ banner: Banner }> {
    const res = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create banner');
    }
    return res.json();
  },

  async updateAdminBanner(id: string, data: Partial<Banner>): Promise<{ banner: Banner }> {
    const res = await fetch(`/api/admin/banners/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update banner');
    }
    return res.json();
  },

  async deleteAdminBanner(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/banners/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete banner');
    }
    return true;
  },

  // --- Site Settings Management ---
  async getAdminSettings(): Promise<{ settings: SiteSettings }> {
    const res = await fetch('/api/admin/settings', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch site settings');
    return res.json();
  },

  async updateAdminSettings(data: Partial<SiteSettings>): Promise<{ settings: SiteSettings }> {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update site settings');
    }
    return res.json();
  },

  // --- Homepage CMS Management ---
  async getAdminHomepage(): Promise<{ content: HomepageContent }> {
    const res = await fetch('/api/admin/homepage', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch homepage content');
    return res.json();
  },

  async updateAdminHomepage(data: Partial<HomepageContent>): Promise<{ content: HomepageContent }> {
    const res = await fetch('/api/admin/homepage', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update homepage content');
    }
    return res.json();
  },

  // --- Admin Activity Logs ---
  async getAdminActivityLogs(limit = 100): Promise<{ logs: AdminActivityLog[] }> {
    const res = await fetch(`/api/admin/activity-logs?limit=${limit}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch activity logs');
    return res.json();
  },

  // --- Aliases for UI convenience ---
  async getCoupons(): Promise<{ coupons: Coupon[] }> {
    return this.getAdminCoupons();
  },
  async createCoupon(data: Partial<Coupon>): Promise<{ coupon: Coupon }> {
    return this.createAdminCoupon(data);
  },
  async updateCoupon(id: string, data: Partial<Coupon>): Promise<{ coupon: Coupon }> {
    return this.updateAdminCoupon(id, data);
  },
  async deleteCoupon(id: string): Promise<boolean> {
    return this.deleteAdminCoupon(id);
  },
  async createBanner(data: Partial<Banner>): Promise<{ banner: Banner }> {
    return this.createAdminBanner(data);
  },
  async updateBanner(id: string, data: Partial<Banner>): Promise<{ banner: Banner }> {
    return this.updateAdminBanner(id, data);
  },
  async deleteBanner(id: string): Promise<boolean> {
    return this.deleteAdminBanner(id);
  },
  async updateAdminStock(id: string, stock: number): Promise<{ product: Product }> {
    return this.updateAdminProductStock(id, stock);
  },
  async getAdminHomepageContent(): Promise<{ content: HomepageContent }> {
    return this.getAdminHomepage();
  },
  async updateAdminHomepageContent(data: Partial<HomepageContent>): Promise<{ content: HomepageContent }> {
    return this.updateAdminHomepage(data);
  },
  async getPublicSettings(): Promise<{ settings: SiteSettings }> {
    return this.getSiteSettings();
  },
  async getPublicHomepageContent(): Promise<{ content: HomepageContent }> {
    return this.getHomepageContent();
  },

  // --- Mobile Phone OTP (Real SMS) & Recovery ---
  async getSmsStatus(): Promise<{ providerConfigured: boolean; provider: string | null; providerId?: string | null; supportedProviders: string[] }> {
    const res = await fetch('/api/auth/phone/sms-status');
    if (!res.ok) throw new Error('Failed to check SMS status');
    return res.json();
  },

  async sendOtp(phone: string): Promise<{
    success: boolean;
    message: string;
    phone?: string;
    maskedPhone?: string;
    resendAfterSeconds?: number;
    configRequired?: boolean;
    demoCode?: string;
  }> {
    const res = await fetch('/api/auth/phone/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, identifier: phone })
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Failed to send verification code');
      err.code = data.code;
      err.configRequired = data.configRequired;
      throw err;
    }
    return data;
  },

  async verifyOtp(phone: string, otp: string, name?: string): Promise<{ user: User; token: string; message: string }> {
    const res = await fetch('/api/auth/phone/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, identifier: phone, otp, code: otp, name })
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Verification failed');
      err.attemptsLeft = data.attemptsLeft;
      throw err;
    }
    return data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; demoCode?: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to request reset');
    }
    return res.json();
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reset password');
    }
    return res.json();
  },

  async adminLogin(email: string, password?: string): Promise<{ user: User; token: string; message: string }> {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Admin authentication failed');
    }
    return res.json();
  },

  async createAdminAccount(data: { name: string; email: string; phone?: string; password: string; confirmPassword: string }): Promise<{ user: User; message: string }> {
    const res = await fetch('/api/auth/admin/create', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create administrator account');
    }
    return res.json();
  },

  // --- Public Brands & FAQs ---
  async getBrands(): Promise<{ brands: Brand[] }> {
    const res = await fetch('/api/brands');
    if (!res.ok) throw new Error('Failed to fetch brands');
    return res.json();
  },

  async getFaqs(): Promise<{ faqs: FAQItem[] }> {
    const res = await fetch('/api/support/faq');
    if (!res.ok) throw new Error('Failed to fetch FAQs');
    return res.json();
  },

  // --- Customer Support Tickets ---
  async getSupportTickets(): Promise<{ tickets: SupportTicket[] }> {
    const res = await fetch('/api/support/tickets', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load tickets');
    return res.json();
  },

  async createSupportTicket(data: {
    category: SupportTicket['category'];
    subject: string;
    message: string;
    orderId?: string;
    priority?: SupportTicket['priority'];
  }): Promise<{ ticket: SupportTicket; message: string }> {
    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit support ticket');
    }
    return res.json();
  },

  async replySupportTicket(id: string, message: string): Promise<{ ticket: SupportTicket }> {
    const res = await fetch(`/api/support/tickets/${id}/reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send reply');
    }
    return res.json();
  },

  // --- Admin Brands Management ---
  async getAdminBrands(): Promise<{ brands: Brand[] }> {
    const res = await fetch('/api/admin/brands', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load brands');
    return res.json();
  },

  async createAdminBrand(data: Partial<Brand>): Promise<{ brand: Brand }> {
    const res = await fetch('/api/admin/brands', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create brand');
    return res.json();
  },

  async updateAdminBrand(id: string, data: Partial<Brand>): Promise<{ brand: Brand }> {
    const res = await fetch(`/api/admin/brands/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update brand');
    return res.json();
  },

  async deleteAdminBrand(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/brands/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.ok;
  },

  // --- Admin Support Tickets ---
  async getAdminSupportTickets(): Promise<{ tickets: SupportTicket[] }> {
    const res = await fetch('/api/admin/support/tickets', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load support tickets');
    return res.json();
  },

  async replyAdminSupportTicket(id: string, message: string, status?: string): Promise<{ ticket: SupportTicket }> {
    const res = await fetch(`/api/admin/support/tickets/${id}/reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, status })
    });
    if (!res.ok) throw new Error('Failed to send reply');
    return res.json();
  },

  async updateAdminSupportTicketStatus(id: string, status: string): Promise<{ ticket: SupportTicket }> {
    const res = await fetch(`/api/admin/support/tickets/${id}/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update ticket status');
    return res.json();
  },

  // --- Admin Reviews Moderation ---
  async getAdminReviews(): Promise<{ reviews: { product: { id: string; name: string; image: string }; review: any }[] }> {
    const res = await fetch('/api/admin/reviews', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load reviews');
    return res.json();
  },

  async deleteAdminReview(productId: string, reviewId: string): Promise<boolean> {
    const res = await fetch(`/api/admin/reviews/${productId}/${reviewId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.ok;
  },

  // --- Admin Reports Export ---
  async exportAdminReports(type: 'sales' | 'orders' | 'products' | 'customers'): Promise<Blob> {
    const res = await fetch(`/api/admin/reports/export?type=${type}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to export report');
    return res.blob();
  }
};

