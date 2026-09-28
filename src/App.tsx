import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { SearchModal } from './components/common/SearchModal';
import { AuthModal } from './components/auth/AuthModal';
import { CompareBar } from './components/products/CompareBar';
import { CompareModal } from './components/products/CompareModal';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { DealsPage } from './pages/DealsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { WishlistPage } from './pages/WishlistPage';
import { AboutPage, ContactPage, PrivacyPolicyPage, TermsPage } from './pages/StaticPages';
import { CustomerLoginPage } from './pages/CustomerLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminForbiddenPage } from './pages/AdminForbiddenPage';
import { useAuth } from './context/AuthContext';

import { Product, Category, Order, SiteSettings, HomepageContent, Banner, Coupon } from './types';
import { api } from './services/api';
import { motion, AnimatePresence } from 'motion/react';

function MainCommerceApp() {
  const { user, isAdmin } = useAuth();

  const getInitialView = () => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/admin/login') return 'admin-login';
    if (path === '/admin') return 'admin';
    if (path === '/login') return 'login';
    if (path === '/checkout') return 'checkout';
    if (path === '/wishlist') return 'wishlist';
    if (path === '/orders' || path === '/dashboard' || path === '/account') return 'dashboard';
    if (path === '/shop') return 'shop';
    if (path === '/deals') return 'deals';
    return 'home';
  };

  const [currentView, setCurrentView] = useState<string>(getInitialView);
  const [selectedDashboardTab, setSelectedDashboardTab] = useState<string>('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync browser URL bar with current view
  useEffect(() => {
    const viewToPath: Record<string, string> = {
      home: '/',
      shop: '/shop',
      deals: '/deals',
      checkout: '/checkout',
      dashboard: '/account',
      orders: '/orders',
      wishlist: '/wishlist',
      login: '/login',
      'admin-login': '/admin/login',
      admin: '/admin'
    };
    const path = viewToPath[currentView];
    if (path && window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, [currentView]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchCatalogAndConfig = async () => {
    try {
      const [prodRes, catRes, settingsRes, cmsRes, bannersRes, couponsRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getPublicSettings().catch(() => ({ settings: null })),
        api.getPublicHomepageContent().catch(() => ({ content: null })),
        api.getPublicBanners().catch(() => ({ banners: [] })),
        api.getPublicCoupons().catch(() => ({ coupons: [] }))
      ]);
      setProducts(prodRes.products);
      setCategories(catRes.categories);
      if (settingsRes.settings) setSiteSettings(settingsRes.settings);
      if (cmsRes.content) setHomepageContent(cmsRes.content);
      if (bannersRes.banners) setBanners(bannersRes.banners);
      if (couponsRes.coupons) setCoupons(couponsRes.coupons);
    } catch (err) {
      console.error('Error fetching catalog and configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogAndConfig();
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProduct]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
  };

  const handleSelectCategory = (catSlug: string) => {
    setSelectedCategory(catSlug);
    setCurrentView('shop');
  };

  const handleViewAllSearchResults = (query: string) => {
    setSearchQuery(query);
    setCurrentView('shop');
  };

  const handleOrderCompleted = (order: Order) => {
    setConfirmedOrder(order);
    setCurrentView('order-confirmation');
  };

  const isAuthOrAdminView = currentView === 'login' || currentView === 'admin-login';

  if (isAuthOrAdminView) {
    return (
      <div className="min-h-screen font-sans antialiased">
        {currentView === 'login' && (
          <CustomerLoginPage
            onLoginSuccess={(destination) => {
              if (destination === 'checkout') setCurrentView('checkout');
              else if (destination === 'wishlist') setCurrentView('wishlist');
              else if (destination === 'product-detail' && selectedProduct) setCurrentView('product-detail');
              else setCurrentView('dashboard');
            }}
            onNavigateHome={() => setCurrentView('home')}
            onNavigateAdminLogin={() => setCurrentView('admin-login')}
          />
        )}

        {currentView === 'admin-login' && (
          <AdminLoginPage
            onAdminLoginSuccess={() => setCurrentView('admin')}
            onNavigateHome={() => setCurrentView('home')}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col selection:bg-zinc-950 selection:text-white font-sans antialiased">
      {/* Global Navigation Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        setSelectedCategory={setSelectedCategory}
        onOpenSearch={() => setIsSearchOpen(true)}
        siteSettings={siteSettings}
        announcementBar={homepageContent?.announcementBar}
        onSelectDashboardTab={(tab) => {
          setSelectedDashboardTab(tab);
          setCurrentView('dashboard');
        }}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onCheckout={() => setCurrentView('checkout')}
        onExplore={() => {
          setCurrentView('shop');
          setSelectedCategory('all');
        }}
      />

      {/* Real-time Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onViewAllResults={handleViewAllSearchResults}
      />

      {/* Authentication Modal */}
      <AuthModal />

      {/* Main View Transition Container */}
      <main className="flex-1">
        {loading ? (
          <div className="py-36 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-10 h-10 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
              Preparing Atelier Archive...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + (selectedProduct?.id || '')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'home' && (
                <HomePage
                  products={products}
                  categories={categories}
                  homepageContent={homepageContent}
                  banners={banners}
                  onSelectProduct={handleSelectProduct}
                  onSelectCategory={handleSelectCategory}
                  onNavigateShop={() => {
                    setCurrentView('shop');
                    setSelectedCategory('all');
                  }}
                  onNavigateAbout={() => setCurrentView('about')}
                />
              )}

              {currentView === 'shop' && (
                <ShopPage
                  products={products}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  onSelectProduct={handleSelectProduct}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              )}

              {currentView === 'product-detail' && selectedProduct && (
                <ProductDetailPage
                  product={selectedProduct}
                  allProducts={products}
                  onSelectProduct={handleSelectProduct}
                  onNavigateCategory={handleSelectCategory}
                  onInstantCheckout={() => setCurrentView('checkout')}
                />
              )}

              {currentView === 'deals' && (
                <DealsPage
                  products={products}
                  coupons={coupons}
                  onSelectProduct={handleSelectProduct}
                  onNavigateShop={() => {
                    setCurrentView('shop');
                    setSelectedCategory('all');
                  }}
                />
              )}

              {currentView === 'checkout' && (
                <CheckoutPage
                  onBackToCart={() => setCurrentView('shop')}
                  onOrderCompleted={handleOrderCompleted}
                />
              )}

              {currentView === 'order-confirmation' && confirmedOrder && (
                <OrderConfirmationPage
                  order={confirmedOrder}
                  onContinueShopping={() => {
                    setCurrentView('shop');
                    setSelectedCategory('all');
                  }}
                  onViewAllOrders={() => setCurrentView('dashboard')}
                />
              )}

              {(currentView === 'dashboard' || currentView === 'orders' || currentView === 'customer') && (
                <CustomerDashboardPage
                  onSelectOrder={order => {
                    setConfirmedOrder(order);
                    setCurrentView('order-confirmation');
                  }}
                  onNavigateShop={() => setCurrentView('shop')}
                  initialTab={selectedDashboardTab as any}
                />
              )}

              {currentView === 'admin' && (
                isAdmin ? (
                  <AdminDashboardPage
                    products={products}
                    categories={categories}
                    onRefreshProducts={fetchCatalogAndConfig}
                    onNavigateHome={() => setCurrentView('home')}
                  />
                ) : (
                  <AdminForbiddenPage
                    onNavigateHome={() => setCurrentView('home')}
                    onNavigateAdminLogin={() => setCurrentView('admin-login')}
                  />
                )
              )}

              {currentView === 'wishlist' && (
                <WishlistPage
                  onSelectProduct={handleSelectProduct}
                  onNavigateShop={() => setCurrentView('shop')}
                />
              )}

              {currentView === 'about' && <AboutPage />}
              {currentView === 'contact' && <ContactPage />}
              {currentView === 'privacy' && <PrivacyPolicyPage />}
              {currentView === 'terms' && <TermsPage />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Floating Comparison Drawer & Comparison Matrix Modal */}
      <CompareBar />
      <CompareModal onSelectProduct={handleSelectProduct} />

      {/* Global Comprehensive Footer */}
      <Footer setCurrentView={setCurrentView} setSelectedCategory={setSelectedCategory} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <CompareProvider>
            <MainCommerceApp />
          </CompareProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
