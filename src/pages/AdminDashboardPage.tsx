import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Tag,
  Image as ImageIcon,
  Sparkles,
  Settings,
  Shield,
  RefreshCw,
  ExternalLink,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Building2,
  LifeBuoy,
  Star,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  AdminStats,
  Order,
  Product,
  Category,
  Coupon,
  Banner,
  SiteSettings,
  HomepageContent,
  AdminActivityLog
} from '../types';

import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminProductsTab } from '../components/admin/AdminProductsTab';
import { AdminCategoriesTab } from '../components/admin/AdminCategoriesTab';
import { AdminOrdersTab } from '../components/admin/AdminOrdersTab';
import { AdminCustomersTab } from '../components/admin/AdminCustomersTab';
import { AdminCouponsTab } from '../components/admin/AdminCouponsTab';
import { AdminBannersTab } from '../components/admin/AdminBannersTab';
import { AdminCmsTab } from '../components/admin/AdminCmsTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';
import { AdminAuditLogTab } from '../components/admin/AdminAuditLogTab';
import { AdminBrandsTab } from '../components/admin/AdminBrandsTab';
import { AdminSupportTab } from '../components/admin/AdminSupportTab';
import { AdminReviewsTab } from '../components/admin/AdminReviewsTab';
import { AdminReportsTab } from '../components/admin/AdminReportsTab';

interface AdminDashboardPageProps {
  products: Product[];
  categories: Category[];
  onRefreshProducts: () => void;
  onNavigateHome?: () => void;
}

type AdminTab =
  | 'overview'
  | 'products'
  | 'categories'
  | 'brands'
  | 'orders'
  | 'support'
  | 'reviews'
  | 'customers'
  | 'coupons'
  | 'banners'
  | 'cms'
  | 'reports'
  | 'settings'
  | 'logs';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  products,
  categories,
  onRefreshProducts,
  onNavigateHome
}) => {
  const { user, isAdmin, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Admin Data State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [
        statsRes,
        ordersRes,
        custRes,
        couponsRes,
        bannersRes,
        settingsRes,
        cmsRes,
        logsRes
      ] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders(),
        api.getAdminCustomers(),
        api.getCoupons(),
        api.getAdminBanners(),
        api.getAdminSettings(),
        api.getAdminHomepageContent(),
        api.getAdminActivityLogs()
      ]);

      setStats(statsRes.stats);
      setOrders(ordersRes.orders);
      setCustomers(custRes.customers);
      setCoupons(couponsRes.coupons);
      setBanners(bannersRes.banners);
      setSiteSettings(settingsRes.settings);
      setHomepageContent(cmsRes.content);
      setActivityLogs(logsRes.logs);
    } catch (err: any) {
      console.error('Error loading admin management suite:', err);
      showToast(err.message || 'Failed to synchronize admin suite data', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  // Product Operations
  const handleCreateProduct = async (data: Partial<Product>) => {
    await api.createAdminProduct(data);
    showToast('Product successfully added to catalog');
    onRefreshProducts();
    loadAllAdminData();
  };

  const handleUpdateProduct = async (id: string, data: Partial<Product>) => {
    await api.updateAdminProduct(id, data);
    showToast('Product updated successfully');
    onRefreshProducts();
    loadAllAdminData();
  };

  const handleDuplicateProduct = async (id: string) => {
    await api.duplicateAdminProduct(id);
    showToast('Product duplicated successfully');
    onRefreshProducts();
    loadAllAdminData();
  };

  const handleToggleProductActive = async (id: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    const nextActive = prod.isActive === false ? true : false;
    await api.updateAdminProduct(id, { isActive: nextActive });
    showToast(`Product visibility marked as ${nextActive ? 'Active' : 'Draft'}`);
    onRefreshProducts();
    loadAllAdminData();
  };

  const handleUpdateProductStock = async (id: string, stock: number) => {
    await api.updateAdminStock(id, stock);
    showToast(`Stock updated to ${stock} units`);
    onRefreshProducts();
    loadAllAdminData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you certain you wish to remove this product from the atelier archive?')) {
      await api.deleteAdminProduct(id);
      showToast('Product removed from catalog');
      onRefreshProducts();
      loadAllAdminData();
    }
  };

  // Category Operations
  const handleCreateCategory = async (data: Partial<Category>) => {
    await api.createAdminCategory(data);
    showToast('Category created successfully');
    onRefreshProducts();
    loadAllAdminData();
  };

  const handleUpdateCategory = async (id: string, data: Partial<Category>) => {
    await api.updateAdminCategory(id, data);
    showToast('Category updated successfully');
    onRefreshProducts();
    loadAllAdminData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await api.deleteAdminCategory(id);
      showToast('Category deleted');
      onRefreshProducts();
      loadAllAdminData();
    }
  };

  // Order Operations
  const handleUpdateOrderStatus = async (orderId: string, status: Order['orderStatus'], note?: string) => {
    await api.updateOrderStatus(orderId, status, note);
    showToast(`Order #${orderId} updated to ${status.toUpperCase()}`);
    loadAllAdminData();
  };

  // Customer Operations
  const handleToggleCustomerStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (window.confirm(`Are you sure you wish to change this account status to ${newStatus}?`)) {
      await api.updateCustomerStatus(userId, newStatus);
      showToast(`Customer account marked as ${newStatus}`);
      loadAllAdminData();
    }
  };

  // Coupon Operations
  const handleCreateCoupon = async (data: Partial<Coupon>) => {
    await api.createCoupon(data);
    showToast('Coupon code activated');
    loadAllAdminData();
  };

  const handleUpdateCoupon = async (id: string, data: Partial<Coupon>) => {
    await api.updateCoupon(id, data);
    showToast('Coupon code updated');
    loadAllAdminData();
  };

  const handleDeleteCoupon = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      await api.deleteCoupon(id);
      showToast('Coupon code deleted');
      loadAllAdminData();
    }
  };

  // Banner Operations
  const handleCreateBanner = async (data: Partial<Banner>) => {
    await api.createBanner(data);
    showToast('Banner created and published');
    loadAllAdminData();
  };

  const handleUpdateBanner = async (id: string, data: Partial<Banner>) => {
    await api.updateBanner(id, data);
    showToast('Banner updated');
    loadAllAdminData();
  };

  const handleDeleteBanner = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      await api.deleteBanner(id);
      showToast('Banner removed');
      loadAllAdminData();
    }
  };

  // CMS Operations
  const handleUpdateHomepageContent = async (content: Partial<HomepageContent>) => {
    const res = await api.updateAdminHomepageContent(content);
    setHomepageContent(res.content);
    showToast('Storefront homepage CMS published live');
    loadAllAdminData();
  };

  // Settings Operations
  const handleUpdateSiteSettings = async (settings: Partial<SiteSettings>) => {
    const res = await api.updateAdminSettings(settings);
    setSiteSettings(res.settings);
    showToast('Business & currency settings updated successfully');
    loadAllAdminData();
  };

  // Guard: Not an admin
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-28 px-4 text-center">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-xs">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-zinc-950">Administrative Access Restricted</h2>
        <p className="text-xs text-zinc-500 mt-2 leading-relaxed max-w-sm mx-auto">
          The management console and operational endpoints require an authenticated administrator session.
        </p>
        <button
          onClick={onNavigateHome}
          className="mt-6 px-5 py-2.5 bg-zinc-950 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
        >
          Return to Atelier Storefront
        </button>
      </div>
    );
  }

  const navTabs: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Stock', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'brands', label: 'Brands & Provenance', icon: Building2 },
    { id: 'orders', label: 'Orders & Dispatch', icon: ShoppingBag },
    { id: 'support', label: 'Support & Concierge', icon: LifeBuoy },
    { id: 'reviews', label: 'Reviews Moderation', icon: Star },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons (INR)', icon: Tag },
    { id: 'banners', label: 'Banners & Hero', icon: ImageIcon },
    { id: 'cms', label: 'Storefront CMS', icon: Sparkles },
    { id: 'reports', label: 'Reports & CSV Export', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings & Tax', icon: Settings },
    { id: 'logs', label: 'Audit Logs', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-20">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-zinc-950 text-white border-zinc-800'
              : 'bg-rose-950 text-white border-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Admin Navigation Header */}
      <header className="bg-zinc-950 text-white border-b border-zinc-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white text-zinc-950 flex items-center justify-center font-bold text-sm">
                A
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold tracking-tight uppercase leading-none">
                    Atelier Executive Console
                  </h1>
                  <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-bold rounded">
                    ENFORCED RBAC
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Connected to Live Production Server
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <button
                id="admin-sync-btn"
                onClick={loadAllAdminData}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                title="Synchronize all data from backend"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync Data</span>
              </button>

              <button
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Live Store</span>
              </button>

              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-zinc-800 text-zinc-400">
                <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-200 text-xs">
                  {user?.name ? user.name[0].toUpperCase() : 'A'}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-zinc-200 text-xs leading-none">{user?.name}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{user?.email}</div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Sign out of Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation Tabs Bar */}
        <div className="bg-white rounded-xl border border-zinc-200/80 p-1.5 shadow-xs mb-8 flex items-center gap-1 overflow-x-auto">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                {tab.id === 'orders' && orders.filter(o => o.orderStatus === 'pending').length > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-zinc-950 rounded-full text-[10px] font-bold">
                    {orders.filter(o => o.orderStatus === 'pending').length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Initializing Executive Suite...
            </p>
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && (
              <AdminOverviewTab
                stats={stats}
                orders={orders}
                products={products}
                onNavigateTab={tab => setActiveTab(tab)}
                onOpenCreateProduct={() => setActiveTab('products')}
                onOpenCreateCoupon={() => setActiveTab('coupons')}
                onOpenCreateBanner={() => setActiveTab('banners')}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}

            {activeTab === 'products' && (
              <AdminProductsTab
                products={products}
                categories={categories}
                onCreateProduct={handleCreateProduct}
                onUpdateProduct={handleUpdateProduct}
                onDuplicateProduct={handleDuplicateProduct}
                onToggleActive={handleToggleProductActive}
                onUpdateStock={handleUpdateProductStock}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeTab === 'categories' && (
              <AdminCategoriesTab
                categories={categories}
                onCreateCategory={handleCreateCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}

            {activeTab === 'brands' && (
              <AdminBrandsTab onNotify={showToast} />
            )}

            {activeTab === 'orders' && (
              <AdminOrdersTab
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}

            {activeTab === 'support' && (
              <AdminSupportTab onNotify={showToast} />
            )}

            {activeTab === 'reviews' && (
              <AdminReviewsTab onNotify={showToast} />
            )}

            {activeTab === 'customers' && (
              <AdminCustomersTab
                customers={customers}
                orders={orders}
                onToggleCustomerStatus={handleToggleCustomerStatus}
              />
            )}

            {activeTab === 'coupons' && (
              <AdminCouponsTab
                coupons={coupons}
                onCreateCoupon={handleCreateCoupon}
                onUpdateCoupon={handleUpdateCoupon}
                onDeleteCoupon={handleDeleteCoupon}
              />
            )}

            {activeTab === 'banners' && (
              <AdminBannersTab
                banners={banners}
                onCreateBanner={handleCreateBanner}
                onUpdateBanner={handleUpdateBanner}
                onDeleteBanner={handleDeleteBanner}
              />
            )}

            {activeTab === 'cms' && (
              <AdminCmsTab
                content={homepageContent}
                onUpdateContent={handleUpdateHomepageContent}
              />
            )}

            {activeTab === 'reports' && (
              <AdminReportsTab onNotify={showToast} />
            )}

            {activeTab === 'settings' && (
              <AdminSettingsTab
                settings={siteSettings}
                onUpdateSettings={handleUpdateSiteSettings}
              />
            )}

            {activeTab === 'logs' && (
              <AdminAuditLogTab logs={activityLogs} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
