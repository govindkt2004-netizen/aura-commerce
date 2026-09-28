import React, { useState } from 'react';
import { CheckCircle, Package, Truck, Calendar, Printer, ArrowRight, Download } from 'lucide-react';
import { Order } from '../types';
import { formatINR } from '../utils/currency';
import { downloadOrderInvoice } from '../services/invoiceService';
import { OrderTrackingStepper } from '../components/orders/OrderTrackingStepper';

interface OrderConfirmationPageProps {
  order: Order;
  onContinueShopping: () => void;
  onViewAllOrders: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order: initialOrder,
  onContinueShopping,
  onViewAllOrders
}) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadInvoice = async () => {
    try {
      setIsDownloading(true);
      await downloadOrderInvoice(order);
    } catch (err: any) {
      console.error('Invoice download error:', err);
      alert(err.message || 'Failed to generate invoice PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Top Hero Confirmation */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          Acquisition Secured
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
          Thank you for your patronage.
        </h1>

        <p className="text-sm text-zinc-600 max-w-lg mx-auto">
          We have received your order <strong className="text-zinc-950">#{order.id}</strong>. A full confirmation notice and tracking dossier have been registered for your account.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadInvoice}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
            <span>{isDownloading ? 'Generating...' : 'Download Invoice'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-300 hover:bg-zinc-50 rounded-lg text-xs font-semibold uppercase tracking-wider text-zinc-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={onViewAllOrders}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-xs font-semibold uppercase tracking-wider text-zinc-900 transition-colors cursor-pointer"
          >
            <span>Track in Account</span>
          </button>
        </div>
      </div>

      {/* Interactive Delivery Pipeline Tracker */}
      <OrderTrackingStepper
        order={order}
        onOrderUpdated={setOrder}
        onDownloadInvoice={handleDownloadInvoice}
        onContactConcierge={onViewAllOrders}
      />

      {/* Order Details & Summary Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shipping Address */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Delivery Destination
          </h4>
          <div className="text-xs sm:text-sm text-zinc-700 space-y-1">
            <p className="font-bold text-zinc-950">{order.shippingAddress?.fullName || order.shippingAddress?.recipientName || 'Client'}</p>
            <p>{order.shippingAddress?.street}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip || order.shippingAddress?.zipCode}
            </p>
            <p>{order.shippingAddress?.country}</p>
            <p className="pt-2 text-zinc-500">Contact: {order.shippingAddress?.phone}</p>
          </div>
        </div>

        {/* Payment & Invoice Breakdown */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Payment Method & Total
          </h4>
          <div className="text-xs sm:text-sm text-zinc-700 space-y-2">
            <div className="flex justify-between">
              <span>Method:</span>
              <span className="font-semibold text-zinc-950 uppercase text-xs">
                {order.paymentMethod === 'stripe' || order.paymentMethod === 'test_card' || order.paymentMethod === 'credit_card'
                  ? 'Credit Card (Stripe)'
                  : 'Cash on Delivery'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span>-{formatINR(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee:</span>
              <span>{order.shippingFee === 0 ? 'Complimentary' : formatINR(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span>{formatINR(order.tax, true)}</span>
            </div>
            <div className="border-t border-zinc-200 pt-2 flex justify-between font-extrabold text-base text-zinc-950">
              <span>Grand Total:</span>
              <span>{formatINR(order.total, true)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized list */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-4">
        <h4 className="font-display font-bold text-base text-zinc-950">
          Purchased Instruments ({order.items.length})
        </h4>

        <div className="divide-y divide-zinc-100">
          {order.items.map((item, i) => (
            <div key={i} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-14 h-16 rounded object-cover bg-zinc-100"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h5 className="text-xs sm:text-sm font-semibold text-zinc-950">
                    {item.productName}
                  </h5>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Qty {item.quantity} {item.selectedSize || item.size ? `· Size ${item.selectedSize || item.size}` : ''}{' '}
                    {item.selectedColor || item.color ? `· ${item.selectedColor || item.color}` : ''}
                  </p>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-bold text-zinc-950">
                {formatINR(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action to Return Home */}
      <div className="text-center pt-4">
        <button
          onClick={onContinueShopping}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <span>Continue Exploring Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
