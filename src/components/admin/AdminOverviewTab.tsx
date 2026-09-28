import React from 'react';
import {
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Tag,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { AdminStats, Order, Product } from '../../types';
import { formatINR } from '../../utils/currency';

interface AdminOverviewTabProps {
  stats: AdminStats | null;
  orders: Order[];
  products: Product[];
  onNavigateTab: (tab: any) => void;
  onOpenCreateProduct: () => void;
  onOpenCreateCoupon: () => void;
  onOpenCreateBanner: () => void;
  onUpdateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  stats,
  orders,
  products,
  onNavigateTab,
  onOpenCreateProduct,
  onOpenCreateCoupon,
  onOpenCreateBanner,
  onUpdateOrderStatus
}) => {
  if (!stats) return null;

  const lowStockThreshold = 10;
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold);
  const outOfStockItems = products.filter(p => p.stock === 0);

  return (
    <div className="space-y-8">
      {/* Alert Banner for Low/Out of Stock */}
      {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                Inventory Attention Required
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {outOfStockItems.length > 0 && (
                  <span className="font-medium mr-2">
                    {outOfStockItems.length} product(s) out of stock.
                  </span>
                )}
                {lowStockItems.length > 0 && (
                  <span>
                    {lowStockItems.length} product(s) running low on inventory (≤ {lowStockThreshold} units).
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            id="view-inventory-alerts-btn"
            onClick={() => onNavigateTab('products')}
            className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            Manage Inventory
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base">
              ₹
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-zinc-950 tracking-tight">
              {formatINR(stats.totalRevenue)}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real-time settled payments</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Orders Volume
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-zinc-950 tracking-tight">
              {stats.totalOrders}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              <span className="font-semibold text-amber-700">{stats.pendingOrders ?? 0} pending</span> · {stats.completedOrders ?? 0} fulfilled
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Average Order
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-zinc-950 tracking-tight">
              {formatINR(stats.averageOrderValue)}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Across all customer orders
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Active Catalog
            </span>
            <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-zinc-950 tracking-tight">
              {products.length}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {stats.lowStockCount} low stock · {stats.outOfStockCount ?? 0} out of stock
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
          Quick Management Actions
        </h4>
        <div className="flex flex-wrap gap-2.5">
          <button
            id="quick-add-product-btn"
            onClick={onOpenCreateProduct}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Product
          </button>
          <button
            id="quick-add-coupon-btn"
            onClick={onOpenCreateCoupon}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            Create Promo Coupon
          </button>
          <button
            id="quick-add-banner-btn"
            onClick={onOpenCreateBanner}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Add Store Banner
          </button>
          <button
            id="quick-edit-cms-btn"
            onClick={() => onNavigateTab('cms')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Edit Storefront CMS
          </button>
          <button
            id="quick-edit-settings-btn"
            onClick={() => onNavigateTab('settings')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Business & Tax Settings
          </button>
        </div>
      </div>

      {/* Sales Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Graph */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-zinc-950">
                Revenue & Sales Trajectory
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Past 7-day revenue performance (INR)
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
              Live Synchronized
            </span>
          </div>

          <div className="space-y-4">
            {stats.salesTrend && stats.salesTrend.length > 0 ? (
              <div className="grid grid-cols-7 gap-2 items-end h-44 pt-6">
                {stats.salesTrend.map((item, idx) => {
                  const maxRev = Math.max(...stats.salesTrend.map(s => s.revenue), 100000);
                  const heightPercent = Math.max(12, Math.round((item.revenue / maxRev) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-semibold">
                        ₹{(item.revenue / 1000).toFixed(0)}k
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[36px] bg-zinc-900 rounded-t group-hover:bg-zinc-700 transition-all duration-300 relative"
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-950 text-white text-[9px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                          {item.orders} orders
                        </div>
                      </div>
                      <span className="text-xs font-medium text-zinc-600">
                        {item.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-zinc-400">
                No sales data available yet
              </div>
            )}
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-zinc-950">
              Collection Breakdown
            </h3>
            <button
              onClick={() => onNavigateTab('categories')}
              className="text-xs text-zinc-600 hover:text-zinc-950 font-semibold cursor-pointer"
            >
              Manage
            </button>
          </div>
          <p className="text-xs text-zinc-500 mb-4">
            Catalog inventory and revenue distribution
          </p>

          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-56 pr-1">
            {stats.categoryDistribution?.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-zinc-800">{cat.category}</span>
                  <span className="font-semibold text-zinc-950">{formatINR(cat.revenue)} ({cat.count} items)</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-zinc-900 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(8, (cat.count / Math.max(products.length, 1)) * 100))}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-950">
              Recent Customer Orders
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Live orders placed on the storefront
            </p>
          </div>
          <button
            id="view-all-orders-btn"
            onClick={() => onNavigateTab('orders')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 hover:text-zinc-700 cursor-pointer"
          >
            <span>View All Orders ({orders.length})</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100">
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Items</th>
                <th className="py-3 px-6">Total (INR)</th>
                <th className="py-3 px-6">Payment</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Quick Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.slice(0, 6).map(order => (
                <tr key={order.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-semibold text-zinc-900">
                    {order.id}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="font-semibold text-zinc-900">{order.customerName}</div>
                    <div className="text-[11px] text-zinc-400">{order.customerEmail}</div>
                  </td>
                  <td className="py-3.5 px-6 text-zinc-600">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} unit(s)
                  </td>
                  <td className="py-3.5 px-6 font-bold text-zinc-950">
                    {formatINR(order.total)}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-50 text-emerald-800'
                        : order.paymentStatus === 'refunded'
                        ? 'bg-purple-50 text-purple-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}>
                      {order.paymentMethod.toUpperCase()} · {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                      order.orderStatus === 'delivered'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : order.orderStatus === 'shipped'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : order.orderStatus === 'processing'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : order.orderStatus === 'cancelled'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <select
                      value={order.orderStatus}
                      onChange={e => onUpdateOrderStatus(order.id, e.target.value as any)}
                      className="text-xs bg-zinc-50 border border-zinc-200 rounded-md py-1 px-2 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
