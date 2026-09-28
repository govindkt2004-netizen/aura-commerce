import React, { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  User as UserIcon,
  Calendar,
  Truck,
  Plus,
  Check,
  FileText,
  RotateCcw,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Download,
  LifeBuoy,
  MessageSquare,
  Send,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Navigation,
  Heart,
  Bookmark,
  Ticket,
  Bell,
  Star,
  Lock,
  LogOut,
  Copy,
  CheckCheck,
  Shield,
  ShoppingBag,
  Trash2,
  Eye,
  EyeOff,
  Percent,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../services/api';
import { Order, Address, SupportTicket } from '../types';
import { formatINR } from '../utils/currency';
import { downloadOrderInvoice } from '../services/invoiceService';
import { OrderTrackingStepper } from '../components/orders/OrderTrackingStepper';

export type DashboardTab =
  | 'profile'
  | 'orders'
  | 'wishlist'
  | 'saved-for-later'
  | 'coupons'
  | 'notifications'
  | 'reviews'
  | 'addresses'
  | 'tickets'
  | 'security'
  | 'returns';

interface CustomerDashboardPageProps {
  onSelectOrder: (order: Order) => void;
  onNavigateShop: () => void;
  initialTab?: DashboardTab;
}

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({
  onSelectOrder,
  onNavigateShop,
  initialTab = 'orders'
}) => {
  const { user, updateProfile, addAddress, logout } = useAuth();
  const { savedItems, moveToCart, removeSavedItem, addItem } = useCart();
  const { wishlist, toggleWishlist, wishlistCount } = useWishlist();

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  // Order Tracking States
  const [activeDossierOrderId, setActiveDossierOrderId] = useState<string | null>(null);
  const [expandedTrackerOrderId, setExpandedTrackerOrderId] = useState<string | null>(null);

  // Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<SupportTicket['category']>('general');
  const [ticketPriority, setTicketPriority] = useState<SupportTicket['priority']>('medium');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notifications State
  interface DashboardNotification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'order' | 'delivery' | 'offer' | 'return' | 'security';
    read: boolean;
  }
  const [notifications, setNotifications] = useState<DashboardNotification[]>([
    {
      id: 'notif-1',
      title: 'Order Confirmed',
      message: 'Your bespoke order has been verified and registered with Atelier Logistics.',
      time: '2 hours ago',
      type: 'order',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Out for Delivery',
      message: 'Insured courier partner has dispatched your package for delivery today.',
      time: '5 hours ago',
      type: 'delivery',
      read: false
    },
    {
      id: 'notif-3',
      title: 'Privilege Access Offer',
      message: 'Enjoy complimentary express shipping & 10% off with promo code WELCOME10.',
      time: '1 day ago',
      type: 'offer',
      read: true
    },
    {
      id: 'notif-4',
      title: 'Return Request Approved',
      message: 'Reverse cargo logistics partner scheduled for item collection.',
      time: '3 days ago',
      type: 'return',
      read: true
    }
  ]);

  // Coupons State
  const availableCoupons = [
    {
      code: 'WELCOME10',
      title: 'Welcome Privilege',
      discount: '10% OFF',
      minSpend: 'Min. order ₹1,999',
      expiry: 'Valid till 31 Dec 2026',
      description: 'Complimentary introductory discount on first artisan acquisitions.'
    },
    {
      code: 'FESTIVE20',
      title: 'Festive Connoisseur',
      discount: '20% OFF',
      minSpend: 'Min. order ₹4,999',
      expiry: 'Limited Time Exclusive',
      description: 'Seasonal celebration discount applicable across rare archives.'
    },
    {
      code: 'ATELIER500',
      title: 'Curator Voucher',
      discount: 'FLAT ₹500 OFF',
      minSpend: 'Min. order ₹2,499',
      expiry: 'Valid on entire catalog',
      description: 'Instant credit applied during checkout on certified pieces.'
    },
    {
      code: 'FREESHIP',
      title: 'Insured Cargo Pass',
      discount: 'FREE DELIVERY',
      minSpend: 'No minimum order',
      expiry: 'Permanent Member Benefit',
      description: 'Air cargo priority shipping with white-glove packaging.'
    }
  ];
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);

  // Reviews State
  interface UserReviewItem {
    id: string;
    productName: string;
    productImage: string;
    rating: number;
    title: string;
    comment: string;
    date: string;
    helpfulCount: number;
  }
  const [userReviews, setUserReviews] = useState<UserReviewItem[]>([
    {
      id: 'rev-1',
      productName: 'AURA S-1 Pro Wireless Studio Headphones',
      productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      rating: 5,
      title: 'Exceptional acoustic precision and luxury finish',
      comment: 'The brushed aluminum housing and memory foam ear cushions make extended listening effortless. Soundstage is breathtakingly wide.',
      date: '18 Sep 2026',
      helpfulCount: 24
    },
    {
      id: 'rev-2',
      productName: 'Obsidian Chronograph Series IV',
      productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      rating: 5,
      title: 'Heirloom craftsmanship',
      comment: 'Exquisite build quality. The sapphire crystal and automatic mechanical movement exceed expectations.',
      date: '02 Sep 2026',
      helpfulCount: 17
    }
  ]);
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewProduct, setNewReviewProduct] = useState('');

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // New Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [addrPhone, setAddrPhone] = useState('');

  // Cancellation & Return States
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Changed mind');
  const [isCancelling, setIsCancelling] = useState(false);

  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('Defective or damaged artifact');
  const [returnComment, setReturnComment] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.getOrders();
        setOrders(res.orders);
        if (res.orders.length > 0) {
          const inTransit = res.orders.find(
            o => o.orderStatus === 'processing' || o.orderStatus === 'shipped' || o.orderStatus === 'out_for_delivery'
          ) || res.orders[0];
          setActiveDossierOrderId(inTransit.id);
        }
      } catch (e) {
        console.error('Error fetching orders:', e);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const handleOrderUpdated = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
    showToast(`Order #${updatedOrder.id} status updated to ${((updatedOrder.orderStatus || updatedOrder.status) as string).replace(/_/g, ' ').toUpperCase()}`);
  };

  const handleOpenTicketForOrder = (orderId: string) => {
    setTicketOrderId(orderId);
    setTicketCategory('delivery');
    setTicketSubject(`Delivery & Courier Inquiry for Order #${orderId}`);
    setTicketMessage(`Hello Atelier Concierge, I would like to inquire regarding the shipment milestone status and delivery window for Order #${orderId}.`);
    setShowTicketModal(true);
    setActiveTab('tickets');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ name, phone });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAddress({
        title: 'Home',
        recipientName: name,
        fullName: name,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        zipCode: addrZip,
        zip: addrZip,
        country: 'India',
        phone: addrPhone,
        isDefault: (user?.addresses?.length || 0) === 0
      });
      setShowAddressModal(false);
      setAddrStreet('');
      setAddrCity('');
      setAddrState('');
      setAddrZip('');
      setAddrPhone('');
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'out_for_delivery':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'return_requested':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'returned':
        return 'bg-zinc-100 text-zinc-600 border-zinc-300';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  const handleCancelOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    setIsCancelling(true);
    try {
      await api.cancelOrder(cancelModalOrder.id, cancelReason);
      setOrders(prev =>
        prev.map(o => (o.id === cancelModalOrder.id ? { ...o, status: 'cancelled' } : o))
      );
      setCancelModalOrder(null);
      showToast(`Order #${cancelModalOrder.id} has been cancelled successfully.`);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReturnOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalOrder) return;
    setIsSubmittingReturn(true);
    try {
      await api.requestReturn(returnModalOrder.id, returnReason, returnComment);
      setOrders(prev =>
        prev.map(o => (o.id === returnModalOrder.id ? { ...o, status: 'return_requested' } : o))
      );
      setReturnModalOrder(null);
      setReturnComment('');
      showToast(`Return requested for Order #${returnModalOrder.id}. Our concierge will arrange pickup.`);
    } catch (err: any) {
      alert(err.message || 'Failed to submit return request');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await api.getSupportTickets();
      setTickets(res.tickets || []);
      if (selectedTicket) {
        const found = res.tickets?.find((t: SupportTicket) => t.id === selectedTicket.id);
        if (found) setSelectedTicket(found);
      }
    } catch (e) {
      console.error('Error fetching tickets:', e);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setIsSubmittingTicket(true);
    try {
      const res = await api.createSupportTicket({
        subject: ticketSubject.trim(),
        category: ticketCategory,
        priority: ticketPriority,
        message: ticketMessage.trim(),
        orderId: ticketOrderId.trim() || undefined
      });
      setShowTicketModal(false);
      setTicketSubject('');
      setTicketMessage('');
      setTicketOrderId('');
      showToast('Inquiry submitted. Our atelier concierge will respond promptly.');
      fetchTickets();
      setSelectedTicket(res.ticket);
    } catch (err: any) {
      alert(err.message || 'Failed to submit inquiry');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleClientReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;
    try {
      const res = await api.replySupportTicket(selectedTicket.id, ticketReplyText.trim());
      setSelectedTicket(res.ticket);
      setTicketReplyText('');
      showToast('Reply dispatched to concierge');
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to reply');
    }
  };

  const handleDownloadInvoice = async (order: Order) => {
    try {
      setDownloadingInvoiceId(order.id);
      await downloadOrderInvoice(order);
      showToast(`Tax invoice for Order #${order.id} downloaded successfully.`);
    } catch (err: any) {
      console.error('Invoice download error:', err);
      alert(err.message || 'Failed to generate invoice PDF');
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to view and print your Tax Invoice.');
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Invoice - ${order.id}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #18181b; max-width: 800px; margin: 0 auto; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e4e4e7; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; letter-spacing: 2px; }
          .meta { font-size: 13px; color: #71717a; text-align: right; }
          .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px; }
          .card { background: #f4f4f5; padding: 15px; border-radius: 8px; width: 45%; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { text-align: left; border-bottom: 2px solid #e4e4e7; padding: 10px; font-size: 12px; text-transform: uppercase; color: #71717a; }
          td { border-bottom: 1px solid #e4e4e7; padding: 12px 10px; font-size: 13px; }
          .totals { margin-left: auto; width: 280px; font-size: 13px; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; }
          .total-row { font-weight: 800; font-size: 16px; border-top: 2px solid #18181b; margin-top: 8px; padding-top: 8px; }
          .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #a1a1aa; border-top: 1px solid #e4e4e7; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">AURA ATELIER</div>
            <div style="font-size: 12px; color: #71717a; margin-top: 4px;">Archival Industrial Design & Horology</div>
            <div style="font-size: 11px; color: #a1a1aa;">GSTIN: 27AABCA1234F1Z5 · Original for Recipient</div>
          </div>
          <div class="meta">
            <div><strong>TAX INVOICE</strong></div>
            <div>Invoice #: INV-${order.id}</div>
            <div>Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
            <div>Status: ${(order.status || 'COMPLETED').toUpperCase()}</div>
          </div>
        </div>

        <div class="addresses">
          <div class="card">
            <strong>Billed & Shipped To:</strong><br>
            ${order.shippingAddress?.fullName || user?.name || 'Valued Collector'}<br>
            ${order.shippingAddress?.street || ''}<br>
            ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zipCode || ''}<br>
            Phone: ${order.shippingAddress?.phone || user?.phone || 'On file'}
          </div>
          <div class="card">
            <strong>Dispatch Atelier:</strong><br>
            Aura Atelier Fulfillment Facility 01<br>
            42 Heritage Mill Industrial Estate<br>
            Lower Parel, Mumbai 400013<br>
            Support: concierge@aura-atelier.com
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                item => `
              <tr>
                <td><strong>${item.productName}</strong><br><span style="font-size: 11px; color: #71717a;">${[item.selectedColor, item.selectedSize ? 'Size: ' + item.selectedSize : ''].filter(Boolean).join(' · ')}</span></td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toLocaleString('en-IN')}</td>
                <td style="text-align: right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="row"><span>Subtotal:</span><span>₹${(order.subtotal || order.total).toLocaleString('en-IN')}</span></div>
          ${order.discount ? `<div class="row"><span>Coupon Discount:</span><span>-₹${order.discount.toLocaleString('en-IN')}</span></div>` : ''}
          <div class="row"><span>CGST (9%) + SGST (9%):</span><span>Included</span></div>
          <div class="row"><span>Insured Cargo Shipping:</span><span>₹0 (Complimentary)</span></div>
          <div class="row total-row"><span>Total Amount:</span><span>₹${order.total.toLocaleString('en-IN')}</span></div>
        </div>

        <div class="footer">
          This is a computer generated invoice and carries digital authenticity. Thank you for your patronage with AURA Atelier.
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Header Profile Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
            alt={user?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-zinc-200"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl text-zinc-950">{user?.name}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">{user?.email}</p>
            <p className="text-xs text-zinc-400 mt-1">Client Member since 2026</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-center">
          <div className="px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
            <span className="text-xl font-bold text-zinc-950">{orders.length}</span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Acquisitions
            </span>
          </div>
          <div className="px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
            <span className="text-xl font-bold text-zinc-950">
              {formatINR(orders.reduce((sum, o) => sum + o.total, 0))}
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Lifetime Value
            </span>
          </div>
        </div>
      </div>

      {/* Customer Account Dashboard Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Customer Account Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-zinc-200/80 p-3 shadow-xs space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            MY ACCOUNT
          </div>

          {/* 1. My Profile */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserIcon className="w-4 h-4" />
              <span>My Profile</span>
            </div>
          </button>

          {/* 2. My Orders */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>My Orders</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'orders' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              {orders.length}
            </span>
          </button>

          {/* 3. Wishlist */}
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'wishlist'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'wishlist' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              {wishlistCount}
            </span>
          </button>

          {/* 4. Saved for Later */}
          <button
            onClick={() => setActiveTab('saved-for-later')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'saved-for-later'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className="w-4 h-4" />
              <span>Saved for Later</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'saved-for-later' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              {savedItems.length}
            </span>
          </button>

          {/* 5. Coupons */}
          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'coupons'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Ticket className="w-4 h-4" />
              <span>Coupons & Offers</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'coupons' ? 'bg-zinc-800 text-white' : 'bg-amber-100 text-amber-900'
              }`}
            >
              4 New
            </span>
          </button>

          {/* 6. Notifications */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </div>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* 7. My Reviews */}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4" />
              <span>My Reviews</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'reviews' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              {userReviews.length}
            </span>
          </button>

          {/* 8. My Addresses */}
          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4" />
              <span>My Addresses</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'addresses' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              {user?.addresses?.length || 0}
            </span>
          </button>

          {/* 9. Returns & Refunds */}
          <button
            onClick={() => setActiveTab('returns')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'returns'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4" />
              <span>Returns & Refunds</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'returns' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              {orders.filter(o => o.status === 'return_requested' || o.status === 'returned').length}
            </span>
          </button>

          {/* 10. Customer Support */}
          <button
            onClick={() => setActiveTab('tickets')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LifeBuoy className="w-4 h-4" />
              <span>Help & Support</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'tickets' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              {tickets.length}
            </span>
          </button>

          {/* 11. Security & Settings */}
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4" />
              <span>Security</span>
            </div>
          </button>

          <div className="pt-2 border-t border-zinc-100">
            <button
              onClick={() => {
                logout();
                onNavigateShop();
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0 w-full">
        {/* 1. ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loadingOrders ? (
              <div className="py-12 text-center text-xs text-zinc-400">Loading your orders...</div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-zinc-200/80 p-6">
                <Package className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <h3 className="font-bold text-zinc-900 text-sm">No purchases yet</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  When you place an order for any atelier instrument, its shipping status and receipt will appear here.
                </p>
                <button
                  onClick={onNavigateShop}
                  className="mt-5 px-6 py-2.5 bg-zinc-950 text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Consignment Interactive Tracker Hero */}
                {(() => {
                  const activeDossierOrder = orders.find(o => o.id === activeDossierOrderId) || orders[0];
                  if (!activeDossierOrder) return null;
                  return (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 text-white p-4 sm:p-5 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                                Active Consignment Tracker
                              </h2>
                              <span className="text-[11px] font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">
                                #{activeDossierOrder.id}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              Real-time interactive flow: Processing → Shipped → Out for Delivery → Delivered
                            </p>
                          </div>
                        </div>

                        {orders.length > 1 && (
                          <div className="flex items-center gap-2">
                            <label htmlFor="active-order-select" className="text-xs text-zinc-400 font-medium shrink-0">
                              Track Order:
                            </label>
                            <select
                              id="active-order-select"
                              value={activeDossierOrder.id}
                              onChange={e => setActiveDossierOrderId(e.target.value)}
                              className="text-xs font-semibold bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
                            >
                              {orders.map(o => (
                                <option key={o.id} value={o.id}>
                                  #{o.id} · {((o.orderStatus || o.status || 'processing') as string).replace(/_/g, ' ').toUpperCase()} ({formatINR(o.total, true)})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <OrderTrackingStepper
                        order={activeDossierOrder}
                        onOrderUpdated={handleOrderUpdated}
                        onContactConcierge={handleOpenTicketForOrder}
                        onDownloadInvoice={handleDownloadInvoice}
                      />
                    </div>
                  );
                })()}

                {/* Orders List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 pt-2">
                    All Order Records ({orders.length})
                  </h3>
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-4 hover:border-zinc-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-zinc-950">
                              #{order.id}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(
                                order.status || order.orderStatus
                              )}`}
                            >
                              {(order.status || order.orderStatus || 'processing').replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            {order.trackingNumber && (
                              <span className="flex items-center gap-1 text-zinc-700 font-mono">
                                <Truck className="w-3 h-3" />
                                {order.trackingNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-extrabold text-zinc-950 mr-2">
                            {formatINR(order.total, true)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDownloadInvoice(order)}
                            disabled={downloadingInvoiceId === order.id}
                            className="px-3 py-1.5 border border-zinc-200 hover:bg-zinc-100 rounded-lg text-xs font-medium text-zinc-700 flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                            title="Download Professional GST Tax Invoice PDF"
                          >
                            <Download className={`w-3.5 h-3.5 ${downloadingInvoiceId === order.id ? 'animate-bounce text-zinc-900' : ''}`} />
                            <span>{downloadingInvoiceId === order.id ? 'Generating...' : 'Download Invoice'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedTrackerOrderId(expandedTrackerOrderId === order.id ? null : order.id);
                              setActiveDossierOrderId(order.id);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 ${
                              expandedTrackerOrderId === order.id
                                ? 'bg-zinc-950 text-white shadow-xs'
                                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
                            }`}
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>{expandedTrackerOrderId === order.id ? 'Hide Pipeline' : 'Track Pipeline'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Mini 4-Step Status Progress Bar */}
                      <div className="py-2.5 px-3 bg-zinc-50/70 rounded-xl border border-zinc-100">
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          {(['processing', 'shipped', 'out_for_delivery', 'delivered'] as const).map((stepKey, idx) => {
                            const currentNorm = (order.orderStatus || order.status || 'processing') as string;
                            const currentIdx = currentNorm === 'delivered' ? 3 : currentNorm === 'out_for_delivery' ? 2 : currentNorm === 'shipped' ? 1 : 0;
                            const isDone = idx < currentIdx;
                            const isCurrent = idx === currentIdx;
                            const stepLabels = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
                            return (
                              <div key={stepKey} className="flex flex-col items-center text-center">
                                <div className="flex items-center w-full">
                                  <div className={`h-0.5 flex-1 ${idx === 0 ? 'invisible' : isDone || isCurrent ? 'bg-zinc-900' : 'bg-zinc-200'}`} />
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                                      isDone
                                        ? 'bg-zinc-950 text-white'
                                        : isCurrent
                                        ? 'bg-white border-2 border-zinc-950 text-zinc-950 ring-2 ring-zinc-900/20'
                                        : 'bg-zinc-100 border border-zinc-300 text-zinc-400'
                                    }`}
                                  >
                                    {isDone ? '✓' : idx + 1}
                                  </div>
                                  <div className={`h-0.5 flex-1 ${idx === 3 ? 'invisible' : isDone ? 'bg-zinc-900' : 'bg-zinc-200'}`} />
                                </div>
                                <span
                                  className={`text-[10px] mt-1 line-clamp-1 ${
                                    isCurrent
                                      ? 'font-bold text-zinc-950'
                                      : isDone
                                      ? 'font-medium text-zinc-700'
                                      : 'text-zinc-400'
                                  }`}
                                >
                                  {stepLabels[idx]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Thumbnail Previews */}
                      <div className="flex flex-wrap items-center gap-3">
                        {order.items.map((it, i) => (
                          <div key={i} className="flex items-center gap-3 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                            <img
                              src={it.productImage}
                              alt={it.productName}
                              className="w-10 h-12 object-cover rounded bg-white"
                              referrerPolicy="no-referrer"
                            />
                            <div className="text-xs">
                              <p className="font-semibold text-zinc-900 line-clamp-1">{it.productName}</p>
                              <p className="text-zinc-400 text-[11px]">Qty {it.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Expanded Interactive Tracker within Order Card */}
                      {expandedTrackerOrderId === order.id && (
                        <div className="pt-2">
                          <OrderTrackingStepper
                            order={order}
                            onOrderUpdated={handleOrderUpdated}
                            onContactConcierge={handleOpenTicketForOrder}
                            onDownloadInvoice={handleDownloadInvoice}
                          />
                        </div>
                      )}

                      {/* Post-Order Actions: Cancellation & Return */}
                      <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div>
                          {order.status === 'cancelled' && (
                            <span className="text-rose-600 font-medium flex items-center gap-1.5">
                              <XCircle className="w-4 h-4" /> This order was cancelled. Payment refunded to original payment method.
                            </span>
                          )}
                          {order.status === 'return_requested' && (
                            <span className="text-purple-700 font-medium flex items-center gap-1.5">
                              <RotateCcw className="w-4 h-4" /> Return request submitted. Our concierge will contact you for pickup.
                            </span>
                          )}
                          {order.status === 'delivered' && (
                            <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" /> Delivered & Covered under 30-day Atelier trial.
                            </span>
                          )}
                          {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') && (
                            <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                              <Truck className="w-4 h-4" /> Being prepared at Atelier fulfillment facility.
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                          {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') && (
                            <button
                              onClick={() => setCancelModalOrder(order)}
                              className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer font-medium"
                            >
                              Cancel Order
                            </button>
                          )}

                          {order.status === 'delivered' && (
                            <button
                              onClick={() => setReturnModalOrder(order)}
                              className="px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors cursor-pointer font-medium flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
                              <span>Request Return</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. RETURNS & REFUNDS TAB */}
        {activeTab === 'returns' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-zinc-950 uppercase tracking-wider">
                  Returns & Replacements Concierge
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Track return verification, complimentary pickup coordination, and bank refunds.
                </p>
              </div>
            </div>

            {orders.filter(o => o.status === 'return_requested' || o.status === 'returned').length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200/80 shadow-xs space-y-3">
                <RotateCcw className="w-10 h-10 text-zinc-300 mx-auto" />
                <h4 className="font-bold text-zinc-900 text-sm">No Active Returns</h4>
                <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                  All your acquisitions are in pristine standing. If any bespoke artifact does not meet your expectations, we offer 30-day complimentary insured returns from your delivered orders list.
                </p>
                {orders.some(o => o.status === 'delivered') && (
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="mt-3 px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
                  >
                    View Delivered Acquisitions
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {orders
                  .filter(o => o.status === 'return_requested' || o.status === 'returned')
                  .map(order => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-zinc-950 uppercase">
                              Return for Order #{order.id}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                order.status === 'returned'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}
                            >
                              {order.status === 'returned' ? 'Refund Processed' : 'Return In Review'}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1">
                            Refund Amount: <strong>{formatINR(order.total)}</strong> · Method: Original Payment
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(order)}
                          disabled={downloadingInvoiceId === order.id}
                          className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-lg text-xs font-medium border border-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Download className={`w-3.5 h-3.5 ${downloadingInvoiceId === order.id ? 'animate-bounce text-zinc-900' : ''}`} />
                          <span>{downloadingInvoiceId === order.id ? 'Generating...' : 'Download Invoice & Return Slip'}</span>
                        </button>
                      </div>

                      {/* 4-Step Visual Timeline */}
                      <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/80">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold mb-1.5">
                              ✓
                            </div>
                            <span className="text-xs font-bold text-zinc-900">Return Logged</span>
                            <span className="text-[10px] text-zinc-500 mt-0.5">Order verified</span>
                          </div>

                          <div className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                                order.status === 'returned'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-purple-600 text-white animate-pulse'
                              }`}
                            >
                              {order.status === 'returned' ? '✓' : '2'}
                            </div>
                            <span className="text-xs font-bold text-zinc-900">Pickup Scheduled</span>
                            <span className="text-[10px] text-zinc-500 mt-0.5">Insured courier</span>
                          </div>

                          <div className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                                order.status === 'returned'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-zinc-200 text-zinc-600'
                              }`}
                            >
                              {order.status === 'returned' ? '✓' : '3'}
                            </div>
                            <span className="text-xs font-bold text-zinc-900">Inspection QA</span>
                            <span className="text-[10px] text-zinc-500 mt-0.5">Atelier verification</span>
                          </div>

                          <div className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                                order.status === 'returned'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-zinc-200 text-zinc-600'
                              }`}
                            >
                              {order.status === 'returned' ? '✓' : '4'}
                            </div>
                            <span className="text-xs font-bold text-zinc-900">Refund Credited</span>
                            <span className="text-[10px] text-zinc-500 mt-0.5">Instant transfer</span>
                          </div>
                        </div>
                      </div>

                      {/* Items Returned */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Artifacts in Return
                        </div>
                        {order.items.map((item, idx) => (
                          <div
                            key={item.productId || idx}
                            className="flex items-center justify-between p-3 bg-white rounded-xl border border-zinc-100"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-10 h-10 rounded-lg object-cover border border-zinc-200"
                              />
                              <div>
                                <h5 className="font-semibold text-xs text-zinc-900">{item.productName}</h5>
                                <p className="text-[11px] text-zinc-500">Qty: {item.quantity} · {formatINR(item.price)}</p>
                              </div>
                            </div>
                            <span className="text-xs font-mono font-semibold text-zinc-950">
                              {formatINR(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* 3. ATELIER CONCIERGE & SUPPORT TICKETS TAB */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-zinc-950 uppercase tracking-wider">
                  Client Concierge Service
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Direct communication channel with our curators regarding order logistics, sizing, or custom commissions.
                </p>
              </div>

              <button
                onClick={() => setShowTicketModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-xs cursor-pointer hover:bg-zinc-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit New Inquiry</span>
              </button>
            </div>

            {loadingTickets ? (
              <div className="p-12 text-center text-xs text-zinc-400">Loading communications...</div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200/80 shadow-xs space-y-3">
                <LifeBuoy className="w-10 h-10 text-zinc-300 mx-auto" />
                <h4 className="font-bold text-zinc-900 text-sm">No Support Inquiries</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Need assistance with an acquisition, custom engraving, or shipment rerouting? Submit an inquiry and our team will attend to you.
                </p>
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="mt-3 px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
                >
                  Create Inquiry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[450px]">
                {/* Tickets list */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-xs divide-y divide-zinc-100 max-h-[550px] overflow-y-auto">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pb-3 px-2">
                    Inquiries ({tickets.length})
                  </div>
                  {tickets.map(t => {
                    const isSelected = selectedTicket?.id === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1.5 cursor-pointer ${
                          isSelected ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50 text-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              t.status === 'resolved'
                                ? 'bg-emerald-50 text-emerald-700'
                                : t.status === 'in_progress'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {t.status.replace('_', ' ')}
                          </span>
                          <span className={`text-[10px] ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                            {new Date(t.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <h5 className="font-semibold text-xs truncate">{t.subject}</h5>
                        <p className={`text-[11px] truncate ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                          {t.messages[t.messages.length - 1]?.message || ''}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Ticket Details & Chat */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs flex flex-col justify-between">
                  {selectedTicket ? (
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="pb-3 border-b border-zinc-100">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-400">#{selectedTicket.id}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                              {selectedTicket.category}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-zinc-950 mt-1">{selectedTicket.subject}</h4>
                          {selectedTicket.orderId && (
                            <p className="text-xs text-zinc-500 mt-0.5">Linked Order: #{selectedTicket.orderId}</p>
                          )}
                        </div>

                        {/* Thread */}
                        <div className="space-y-3 py-4 max-h-[320px] overflow-y-auto">
                          {selectedTicket.messages.map((m, idx) => {
                            const isMe = m.sender === 'customer';
                            return (
                              <div
                                key={idx}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                              >
                                <div className="text-[10px] text-zinc-400 mb-0.5 px-1">
                                  {m.senderName} · {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div
                                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                                    isMe
                                      ? 'bg-zinc-950 text-white rounded-br-xs'
                                      : 'bg-zinc-100 text-zinc-800 rounded-bl-xs'
                                  }`}
                                >
                                  {m.message}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Reply Form */}
                      <form onSubmit={handleClientReplySubmit} className="pt-3 border-t border-zinc-100 relative">
                        <textarea
                          rows={2}
                          required
                          value={ticketReplyText}
                          onChange={e => setTicketReplyText(e.target.value)}
                          placeholder="Type your response to the concierge..."
                          className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 resize-none"
                        />
                        <button
                          type="submit"
                          disabled={!ticketReplyText.trim()}
                          className="absolute right-2 bottom-3 px-3 py-1 bg-zinc-950 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-400">
                      <LifeBuoy className="w-10 h-10 text-zinc-300 mb-2 stroke-1" />
                      <p className="text-xs">Select an inquiry to read replies or write a message.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Create Ticket Modal */}
            {showTicketModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                    <h4 className="font-bold text-sm text-zinc-950 uppercase tracking-wider">
                      Contact Atelier Concierge
                    </h4>
                    <button
                      onClick={() => setShowTicketModal(false)}
                      className="p-1 text-zinc-400 hover:text-zinc-950"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateTicketSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                        Inquiry Subject *
                      </label>
                      <input
                        type="text"
                        required
                        value={ticketSubject}
                        onChange={e => setTicketSubject(e.target.value)}
                        placeholder="e.g. Delivery ETA inquiry or Sizing question"
                        className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                          Category
                        </label>
                        <select
                          value={ticketCategory}
                          onChange={e => setTicketCategory(e.target.value as any)}
                          className="w-full p-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="order">Order & Logistics</option>
                          <option value="delivery">Express Delivery</option>
                          <option value="defect">Product Defect / QA</option>
                          <option value="payment">Payment & Invoicing</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                          Urgency
                        </label>
                        <select
                          value={ticketPriority}
                          onChange={e => setTicketPriority(e.target.value as any)}
                          className="w-full p-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none"
                        >
                          <option value="low">Standard</option>
                          <option value="medium">Medium</option>
                          <option value="high">High Priority</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                        Linked Order ID (Optional)
                      </label>
                      <select
                        value={ticketOrderId}
                        onChange={e => setTicketOrderId(e.target.value)}
                        className="w-full p-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none"
                      >
                        <option value="">No linked order</option>
                        {orders.map(o => (
                          <option key={o.id} value={o.id}>
                            #{o.id} - {formatINR(o.total)} ({o.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                        Inquiry Details *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={ticketMessage}
                        onChange={e => setTicketMessage(e.target.value)}
                        placeholder="Please describe how our atelier concierge may assist you..."
                        className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => setShowTicketModal(false)}
                        className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingTicket}
                        className="px-5 py-2 bg-zinc-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmittingTicket ? 'Transmitting...' : 'Send Inquiry'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. ADDRESSES TAB */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
                Saved Shipping Destinations
              </h3>
              <button
                onClick={() => setShowAddressModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.addresses && user.addresses.length > 0 ? (
                user.addresses.map(addr => (
                  <div
                    key={addr.id}
                    className="p-6 bg-white rounded-xl border border-zinc-200/80 shadow-xs relative space-y-2"
                  >
                    {addr.isDefault && (
                      <span className="inline-block bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        Default Address
                      </span>
                    )}
                    <h4 className="font-bold text-sm text-zinc-950">{addr.fullName || addr.recipientName}</h4>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {addr.street} <br />
                      {addr.city}, {addr.state} {addr.zip || addr.zipCode} <br />
                      {addr.country}
                    </p>
                    <p className="text-xs text-zinc-500 pt-1">Tel: {addr.phone}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-zinc-400 bg-white rounded-xl border border-zinc-200 col-span-2">
                  No saved addresses yet. Add an address for expedited checkout.
                </div>
              )}
            </div>

            {/* Address Modal */}
            {showAddressModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 p-6 space-y-4">
                  <h4 className="font-bold text-base text-zinc-950">Add Shipping Address</h4>
                  <form onSubmit={handleAddAddress} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        required
                        value={addrStreet}
                        onChange={e => setAddrStreet(e.target.value)}
                        className="w-full text-xs p-2.5 border border-zinc-300 rounded-lg"
                        placeholder="742 Evergreen Terrace"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          value={addrCity}
                          onChange={e => setAddrCity(e.target.value)}
                          className="w-full text-xs p-2.5 border border-zinc-300 rounded-lg"
                          placeholder="Springfield"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          required
                          value={addrState}
                          onChange={e => setAddrState(e.target.value)}
                          className="w-full text-xs p-2.5 border border-zinc-300 rounded-lg"
                          placeholder="OR"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          required
                          value={addrZip}
                          onChange={e => setAddrZip(e.target.value)}
                          className="w-full text-xs p-2.5 border border-zinc-300 rounded-lg"
                          placeholder="97477"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-zinc-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          required
                          value={addrPhone}
                          onChange={e => setAddrPhone(e.target.value)}
                          className="w-full text-xs p-2.5 border border-zinc-300 rounded-lg"
                          placeholder="+1 555 382 9901"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowAddressModal(false)}
                        className="px-4 py-2 border rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold uppercase"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. PROFILE SETTINGS TAB */}
        {activeTab === 'profile' && (
          <div className="max-w-xl bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-xs">
            <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider mb-4">
              Edit Account Information
            </h3>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 mb-4">
                <Check className="w-4 h-4" />
                <span>Profile information successfully updated.</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full text-xs sm:text-sm p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-500"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Primary atelier authentication identifier
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  placeholder="+1 (555) 382-9901"
                />
              </div>

              <button
                type="submit"
                className="mt-4 px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Save Profile Changes
              </button>
            </form>
          </div>
        )}

        {/* 4. WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
                  My Wishlist ({wishlist.length})
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Artisanal acquisitions saved for upcoming curations.
                </p>
              </div>
              {wishlist.length > 0 && (
                <button
                  onClick={onNavigateShop}
                  className="text-xs font-semibold text-zinc-900 hover:underline cursor-pointer"
                >
                  Explore More Items
                </button>
              )}
            </div>

            {wishlist.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-zinc-200/80 p-8 shadow-xs">
                <Heart className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <h4 className="font-bold text-zinc-900 text-sm">Your Wishlist is Empty</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Explore our curated archives and save extraordinary instruments and artifacts here.
                </p>
                <button
                  onClick={onNavigateShop}
                  className="mt-5 px-6 py-2.5 bg-zinc-950 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {wishlist.map(product => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all group"
                  >
                    <div>
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 mb-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                            {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                        {product.brand}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 line-clamp-1 mt-0.5">
                        {product.name}
                      </h4>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-sm font-bold text-zinc-950">
                          {formatINR(product.price)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-zinc-400 line-through">
                            {formatINR(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
                      <button
                        onClick={() => {
                          addItem(product, 1);
                          toggleWishlist(product);
                          showToast(`Moved ${product.name} to your Cart`);
                        }}
                        className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Cart</span>
                      </button>
                      <button
                        onClick={() => {
                          toggleWishlist(product);
                          showToast(`Removed from wishlist`);
                        }}
                        className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. SAVED FOR LATER TAB */}
        {activeTab === 'saved-for-later' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
                  Saved for Later ({savedItems.length})
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Items temporarily set aside from your shopping bag.
                </p>
              </div>
            </div>

            {savedItems.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-zinc-200/80 p-8 shadow-xs">
                <Bookmark className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <h4 className="font-bold text-zinc-900 text-sm">No items saved for later</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  When viewing your cart, you can save items for later review and checkout.
                </p>
                <button
                  onClick={onNavigateShop}
                  className="mt-5 px-6 py-2.5 bg-zinc-950 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedItems.map(item => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                    className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square rounded-xl overflow-hidden bg-zinc-100 mb-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                        {item.product.brand}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 line-clamp-1 mt-0.5">
                        {item.product.name}
                      </h4>
                      {(item.selectedSize || item.selectedColor) && (
                        <p className="text-[11px] text-zinc-500 mt-1">
                          {item.selectedSize && `Size: ${item.selectedSize} `}
                          {item.selectedColor && `Color: ${item.selectedColor}`}
                        </p>
                      )}
                      <p className="text-sm font-bold text-zinc-950 mt-2">
                        {formatINR(item.product.price)}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
                      <button
                        onClick={() => {
                          moveToCart(item.product.id, item.selectedSize, item.selectedColor);
                          showToast(`Moved ${item.product.name} to Cart`);
                        }}
                        className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                      <button
                        onClick={() => {
                          removeSavedItem(item.product.id, item.selectedSize, item.selectedColor);
                          showToast('Item removed from saved list');
                        }}
                        className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
                Privilege Coupons & Vouchers
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Exclusive client codes verified for your account. One-click copy and apply during checkout.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCoupons.map(coupon => {
                const isCopied = copiedCouponCode === coupon.code;
                return (
                  <div
                    key={coupon.code}
                    className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-sm">
                          {coupon.discount}
                        </span>
                        <h4 className="font-bold text-sm text-zinc-950 mt-2">{coupon.title}</h4>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                          {coupon.description}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-3 font-medium">
                          <span>{coupon.minSpend}</span>
                          <span>•</span>
                          <span>{coupon.expiry}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-dashed border-zinc-200 flex items-center justify-between gap-3">
                      <span className="font-mono text-sm font-bold text-zinc-900 tracking-wider bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(coupon.code);
                          setCopiedCouponCode(coupon.code);
                          showToast(`Copied code ${coupon.code} to clipboard`);
                          setTimeout(() => setCopiedCouponCode(null), 3000);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
                  Notifications Feed
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Milestone alerts, shipping dispatches, and catalog updates.
                </p>
              </div>
              <button
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  showToast('All notifications marked as read');
                }}
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 hover:underline cursor-pointer"
              >
                Mark All as Read
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs divide-y divide-zinc-100 overflow-hidden">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                    !notif.read ? 'bg-zinc-50/60' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.type === 'order'
                          ? 'bg-blue-100 text-blue-700'
                          : notif.type === 'delivery'
                          ? 'bg-emerald-100 text-emerald-700'
                          : notif.type === 'return'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      {notif.type === 'order' && <Package className="w-4 h-4" />}
                      {notif.type === 'delivery' && <Truck className="w-4 h-4" />}
                      {notif.type === 'return' && <RotateCcw className="w-4 h-4" />}
                      {notif.type === 'offer' && <Ticket className="w-4 h-4" />}
                      {notif.type === 'security' && <Shield className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-zinc-950">{notif.title}</h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-zinc-400 mt-2 block font-medium">
                        {notif.time}
                      </span>
                    </div>
                  </div>

                  {!notif.read && (
                    <button
                      onClick={() => {
                        setNotifications(prev =>
                          prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
                        );
                      }}
                      className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-950 shrink-0 cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. MY REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
                  My Reviews & Ratings ({userReviews.length})
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Your verified appraisals and feedback on acquired instruments.
                </p>
              </div>
              <button
                onClick={() => setShowWriteReviewModal(true)}
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write Review</span>
              </button>
            </div>

            <div className="space-y-4">
              {userReviews.map(review => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.productImage}
                        alt={review.productName}
                        className="w-12 h-12 rounded-lg object-cover border border-zinc-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-zinc-950">{review.productName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-sm">
                            ✓ Verified Purchase
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 shrink-0">{review.date}</span>
                  </div>

                  <div className="pt-2 border-t border-zinc-100">
                    <h5 className="text-xs font-bold text-zinc-900">{review.title}</h5>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{review.comment}</p>
                    <div className="flex items-center gap-4 mt-3 text-[11px] text-zinc-400">
                      <span>{review.helpfulCount} patrons found this helpful</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
                Account Security & Credentials
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Manage your credentials, 2-Factor Authentication, and active sessions.
              </p>
            </div>

            {/* Change Password Form */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-zinc-900">
                <Lock className="w-4 h-4 text-zinc-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Update Account Password</h4>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!newPassword || newPassword.length < 6) {
                    showToast('New password must be at least 6 characters');
                    return;
                  }
                  if (newPassword !== confirmNewPassword) {
                    showToast('Passwords do not match');
                    return;
                  }
                  setIsUpdatingPassword(true);
                  setTimeout(() => {
                    setIsUpdatingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    showToast('Password successfully updated and securely hashed.');
                  }, 800);
                }}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                </div>

                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                      <span>Password Strength</span>
                      <span>{newPassword.length >= 10 ? 'Strong' : 'Moderate'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          newPassword.length >= 10
                            ? 'w-full bg-emerald-500'
                            : newPassword.length >= 6
                            ? 'w-2/3 bg-amber-500'
                            : 'w-1/3 bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* 2-Factor Authentication Card */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Two-Factor Authentication (2FA)
                </h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-md">
                  Require an SMS OTP code on +91 {user?.phone || 'registered mobile'} every time you log in from an unrecognized device.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled);
                  showToast(
                    !twoFactorEnabled
                      ? 'Two-Factor Authentication activated.'
                      : 'Two-Factor Authentication deactivated.'
                  );
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  twoFactorEnabled ? 'bg-zinc-950' : 'bg-zinc-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Active Devices & Sessions
              </h4>
              <div className="divide-y divide-zinc-100 text-xs">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-zinc-900">Current Web Browser</p>
                    <p className="text-zinc-400 text-[11px]">Desktop • Bengaluru, India • Active Now</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Current Device
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Toast Alert Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-zinc-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Order Cancellation Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-bold text-sm text-zinc-950">Cancel Order #{cancelModalOrder.id}</h4>
              </div>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="text-zinc-400 hover:text-zinc-950 text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you wish to cancel this acquisition? The reserved items will be returned to inventory and your payment of{' '}
              <strong>{formatINR(cancelModalOrder.total, true)}</strong> will be credited back to your original source.
            </p>

            <form onSubmit={handleCancelOrderSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 p-2.5 rounded-lg text-xs"
                >
                  <option value="Changed mind">Changed mind</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found better pricing / deal">Found alternative arrangement</option>
                  <option value="Need to change shipping address">Need to update shipping destination</option>
                  <option value="Delivery time too long">Delivery timeframe incompatible</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg hover:bg-zinc-50"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-zinc-300 text-white text-xs font-semibold uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2 text-zinc-950">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-sm text-zinc-950">Request Return for #{returnModalOrder.id}</h4>
              </div>
              <button
                onClick={() => setReturnModalOrder(null)}
                className="text-zinc-400 hover:text-zinc-950 text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Our 30-day risk-free atelier guarantee covers full returns and exchanges. Please specify the condition and reason so our logistics concierge can arrange insured reverse cargo.
            </p>

            <form onSubmit={handleReturnOrderSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 p-2.5 rounded-lg text-xs"
                >
                  <option value="Defective or damaged artifact">Defective or damaged artifact</option>
                  <option value="Wrong item or size received">Wrong size or specification received</option>
                  <option value="Quality not as expected">Material quality or acoustics mismatch</option>
                  <option value="Missing provenance documentation">Missing provenance or parts</option>
                  <option value="Changed aesthetic preference">Changed aesthetic preference</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700">Comments or Specifics</label>
                <textarea
                  rows={3}
                  value={returnComment}
                  onChange={e => setReturnComment(e.target.value)}
                  placeholder="Provide any additional details or preferred pickup time slots..."
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 p-2.5 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalOrder(null)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="px-5 py-2 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-semibold uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  {isSubmittingReturn ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {showWriteReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h4 className="font-bold text-sm text-zinc-950">Appraise Acquisition</h4>
              </div>
              <button
                onClick={() => setShowWriteReviewModal(false)}
                className="text-zinc-400 hover:text-zinc-950 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newReviewTitle || !newReviewComment) {
                  showToast('Please fill in both title and review comments');
                  return;
                }
                const newRev: UserReviewItem = {
                  id: 'rev-' + Date.now(),
                  productName: newReviewProduct || (orders[0]?.items[0]?.productName || 'Atelier Signature Piece'),
                  productImage: orders[0]?.items[0]?.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
                  rating: newReviewRating,
                  title: newReviewTitle,
                  comment: newReviewComment,
                  date: 'Just now',
                  helpfulCount: 0
                };
                setUserReviews([newRev, ...userReviews]);
                setShowWriteReviewModal(false);
                setNewReviewTitle('');
                setNewReviewComment('');
                showToast('Review submitted successfully. Thank you for your appraisal!');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Select Product
                </label>
                <select
                  value={newReviewProduct}
                  onChange={e => setNewReviewProduct(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 p-2.5 rounded-lg text-xs"
                >
                  {orders.flatMap(o => o.items).length > 0 ? (
                    orders.flatMap(o => o.items).map((item, idx) => (
                      <option key={idx} value={item.productName}>
                        {item.productName} (Order #{orders.find(o => o.items.includes(item))?.id})
                      </option>
                    ))
                  ) : (
                    <option value="AURA S-1 Pro Wireless Studio Headphones">AURA S-1 Pro Wireless Studio Headphones</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-zinc-700 ml-2">
                    {newReviewRating} out of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Headline / Title
                </label>
                <input
                  type="text"
                  required
                  value={newReviewTitle}
                  onChange={e => setNewReviewTitle(e.target.value)}
                  placeholder="e.g., Uncompromising acoustic clarity and build"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 p-2.5 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Written Feedback
                </label>
                <textarea
                  rows={4}
                  required
                  value={newReviewComment}
                  onChange={e => setNewReviewComment(e.target.value)}
                  placeholder="Describe the craftsmanship, ergonomics, sound, materials, and overall impression..."
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 p-2.5 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWriteReviewModal(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  Publish Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
