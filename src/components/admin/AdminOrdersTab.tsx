import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Package,
  Calendar,
  X,
  FileText,
  MapPin,
  CreditCard,
  Send,
  Download
} from 'lucide-react';
import { Order } from '../../types';
import { formatINR } from '../../utils/currency';
import { downloadOrderInvoice } from '../../services/invoiceService';

interface AdminOrdersTabProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['orderStatus'], note?: string) => Promise<void>;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  onUpdateOrderStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [transitionStatus, setTransitionStatus] = useState<Order['orderStatus']>('processing');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  const handleDownloadInvoice = async (order: Order) => {
    try {
      setIsDownloadingInvoice(true);
      await downloadOrderInvoice(order);
    } catch (err: any) {
      console.error('Invoice generation error:', err);
      alert(err.message || 'Failed to generate invoice PDF');
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setTransitionStatus(order.orderStatus);
    setStatusNote('');
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      await onUpdateOrderStatus(selectedOrder.id, transitionStatus, statusNote.trim() || undefined);
      // Update selected order in view
      const updated = {
        ...selectedOrder,
        orderStatus: transitionStatus,
        status: transitionStatus,
        statusHistory: [
          ...selectedOrder.statusHistory,
          {
            status: transitionStatus,
            timestamp: new Date().toISOString(),
            note: statusNote || `Status changed to ${transitionStatus.toUpperCase()}`
          }
        ]
      };
      setSelectedOrder(updated);
      setStatusNote('');
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
            Order Fulfillment & Operations
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Process incoming orders, dispatch shipments with tracking numbers, and manage cancellations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-700 shadow-xs">
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, email, or tracking #..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100">
                <th className="py-3 px-5">Order ID</th>
                <th className="py-3 px-5">Date & Time</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Items & SKU</th>
                <th className="py-3 px-5">Total (INR)</th>
                <th className="py-3 px-5">Payment Status</th>
                <th className="py-3 px-5">Fulfillment Status</th>
                <th className="py-3 px-5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-zinc-950">
                      {order.id}
                    </td>

                    <td className="py-3.5 px-5 text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                      <div className="text-[10px] text-zinc-400">
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-zinc-900">{order.customerName}</div>
                      <div className="text-[11px] text-zinc-400">{order.customerEmail}</div>
                    </td>

                    <td className="py-3.5 px-5 text-zinc-600">
                      <div>
                        {order.items.length} item(s) · {order.items.reduce((sum, i) => sum + i.quantity, 0)} units
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate max-w-[180px]">
                        {order.items.map(i => i.productName).join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-5 font-bold text-zinc-950">
                      {formatINR(order.total)}
                      {order.discount ? (
                        <div className="text-[10px] text-emerald-700 font-normal">
                          Saved {formatINR(order.discount)}
                        </div>
                      ) : null}
                    </td>

                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        order.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : order.paymentStatus === 'refunded'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {order.paymentMethod.toUpperCase()} · {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
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

                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-md transition-colors cursor-pointer"
                          title="Download Tax Invoice PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="hidden sm:inline">Invoice</span>
                        </button>
                        <button
                          onClick={() => handleOpenDetails(order)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Workflow Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-zinc-950 font-mono">
                    Order #{selectedOrder.id}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                    selectedOrder.orderStatus === 'delivered'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : selectedOrder.orderStatus === 'shipped'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : selectedOrder.orderStatus === 'cancelled'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  disabled={isDownloadingInvoice}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  title="Generate and Download Official GST Tax Invoice PDF"
                >
                  <Download className={`w-3.5 h-3.5 ${isDownloadingInvoice ? 'animate-bounce' : ''}`} />
                  <span>{isDownloadingInvoice ? 'Generating...' : 'Download Invoice'}</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-6 text-xs max-h-[70vh] overflow-y-auto pr-1">
              {/* Items List */}
              <div>
                <h4 className="font-semibold text-zinc-800 uppercase tracking-wider text-[11px] mb-3">
                  Purchased Atelier Items
                </h4>
                <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded-lg bg-zinc-100 border border-zinc-200"
                        />
                        <div>
                          <div className="font-semibold text-zinc-900">{item.productName}</div>
                          <div className="text-[11px] text-zinc-500">
                            Qty: {item.quantity} · {item.size ? `Size: ${item.size}` : ''} {item.color ? `Color: ${item.color}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-zinc-950">{formatINR(item.price * item.quantity)}</div>
                        <div className="text-[10px] text-zinc-400">{formatINR(item.price)} each</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-2">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span>{formatINR(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount ? (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount {selectedOrder.discountCode ? `(${selectedOrder.discountCode})` : ''}</span>
                    <span>-{formatINR(selectedOrder.discount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-zinc-600">
                  <span>Standard Shipping</span>
                  <span>{selectedOrder.shippingFee === 0 ? 'Complimentary' : formatINR(selectedOrder.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>GST (18%)</span>
                  <span>{formatINR(selectedOrder.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-zinc-950 pt-2 border-t border-zinc-200">
                  <span>Grand Total</span>
                  <span>{formatINR(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-zinc-200">
                  <h4 className="font-semibold text-zinc-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    Delivery Destination
                  </h4>
                  <p className="font-semibold text-zinc-900">{selectedOrder.customerName}</p>
                  <p className="text-zinc-600 mt-1 leading-relaxed">
                    {selectedOrder.shippingAddress?.street}<br />
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}<br />
                    {selectedOrder.shippingAddress?.country || 'India'}<br />
                    Phone: {selectedOrder.shippingAddress?.phone || 'Not provided'}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-zinc-200">
                  <h4 className="font-semibold text-zinc-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                    Payment Information
                  </h4>
                  <p className="text-zinc-700">
                    <span className="font-semibold">Method:</span> {selectedOrder.paymentMethod.toUpperCase()}
                  </p>
                  <p className="text-zinc-700 mt-1">
                    <span className="font-semibold">Status:</span> {selectedOrder.paymentStatus}
                  </p>
                  {selectedOrder.trackingNumber && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                      <div className="font-semibold text-[11px] flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        Courier Tracking AWB
                      </div>
                      <div className="font-mono text-xs font-bold mt-0.5">{selectedOrder.trackingNumber}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Workflow Status Transition Form */}
              <form onSubmit={handleStatusSubmit} className="bg-zinc-900 text-white p-5 rounded-xl space-y-4">
                <h4 className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  Update Order Fulfillment Status
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">
                      New Status Transition
                    </label>
                    <select
                      value={transitionStatus}
                      onChange={e => setTransitionStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                    >
                      <option value="pending">Pending Confirmation</option>
                      <option value="processing">In Atelier Preparation (Processing)</option>
                      <option value="shipped">Dispatched with Courier (Shipped)</option>
                      <option value="delivered">Fulfilled & Handed Over (Delivered)</option>
                      <option value="cancelled">Cancelled (Restores Product Stock)</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">
                      Internal / Customer Activity Note
                    </label>
                    <input
                      type="text"
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                      placeholder="e.g. Package dispatched via BlueDart Express..."
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                </div>

                {transitionStatus === 'cancelled' && (
                  <div className="p-2.5 bg-rose-950/80 border border-rose-800/80 rounded-lg text-rose-300 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>
                      Notice: Cancelling this order will automatically restore inventory stock back to the atelier catalog.
                    </span>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isUpdating || transitionStatus === selectedOrder.orderStatus}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isUpdating ? 'Applying Change...' : 'Apply Status Update'}
                  </button>
                </div>
              </form>

              {/* Status History Timeline */}
              <div>
                <h4 className="font-semibold text-zinc-800 uppercase tracking-wider text-[11px] mb-3">
                  Status Transition Audit History
                </h4>
                <div className="space-y-2 border-l-2 border-zinc-200 pl-4 ml-2">
                  {selectedOrder.statusHistory?.map((h, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-900 border-2 border-white" />
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 uppercase text-[10px] bg-zinc-100 px-2 py-0.5 rounded">
                          {h.status}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {new Date(h.timestamp).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-zinc-600 mt-0.5">{h.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
