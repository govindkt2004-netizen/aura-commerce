import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ChevronRight,
  Info,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order, CartItem } from '../types';
import confetti from 'canvas-confetti';
import { formatINR, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../utils/currency';

interface CheckoutPageProps {
  onBackToCart: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToCart, onOrderCompleted }) => {
  const { items, subtotal, discount, discountCode, discountPercent, tax, clearCart } = useCart();
  const { user } = useAuth();

  // Step management
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.addresses?.[0]?.street || '');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || '');
  const [state, setState] = useState(user?.addresses?.[0]?.state || '');
  const [zip, setZip] = useState(user?.addresses?.[0]?.zipCode || user?.addresses?.[0]?.zip || '');
  const [country] = useState('India');

  // Sync with authenticated user
  useEffect(() => {
    if (user) {
      if (user.email) setEmail(user.email);
      if (user.name) {
        setFullName(user.name);
        setNameOnCard(user.name);
      }
      if (user.phone) setPhone(user.phone);
      if (user.addresses?.[0]) {
        const addr = user.addresses[0];
        if (addr.street) setStreet(addr.street);
        if (addr.city) setCity(addr.city);
        if (addr.state) setState(addr.state);
        if (addr.zipCode || addr.zip) setZip(addr.zipCode || addr.zip || '');
      }
    }
  }, [user]);

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Payment Method & Stripe Card Simulation
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [nameOnCard, setNameOnCard] = useState(user?.name || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Shipping fee calculation (INR)
  const calculatedShipping =
    shippingMethod === 'express' ? 399 : subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = Number((Math.max(0, subtotal - discount) + calculatedShipping + tax).toFixed(2));

  // Quick fill Stripe test card
  const fillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('123');
    setNameOnCard(fullName || 'Test Cardholder');
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setError('Your shopping bag is empty.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. If using Stripe, initiate payment intent first
      if (paymentMethod === 'stripe') {
        await api.createPaymentIntent(grandTotal);
      }

      // 2. Submit order to server
      const orderPayload = {
        items: items.map((i: CartItem) => ({
          productId: i.productId,
          productName: i.product.name,
          productImage: i.product.images[0],
          price: i.product.price,
          quantity: i.quantity,
          selectedSize: i.selectedSize,
          selectedColor: i.selectedColor
        })),
        shippingAddress: {
          recipientName: fullName,
          fullName,
          street,
          city,
          state,
          zip,
          country,
          phone
        },
        paymentMethod: paymentMethod === 'stripe' ? 'credit_card' : 'cash_on_delivery',
        subtotal,
        discount,
        discountCode: discountCode || undefined,
        discountPercent: discountPercent || undefined,
        shippingFee: calculatedShipping,
        tax,
        total: grandTotal
      };

      const res = await api.createOrder(orderPayload);

      // Trigger celebratory confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.warn('Confetti note:', e);
      }

      clearCart();
      onOrderCompleted(res.order);
    } catch (err: any) {
      setError(err.message || 'Failed to finalize order. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
        <button
          onClick={onBackToCart}
          className="text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Bag</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <span className={currentStep >= 1 ? 'text-zinc-950 font-bold' : ''}>1. Address</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
          <span className={currentStep >= 2 ? 'text-zinc-950 font-bold' : ''}>2. Delivery</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
          <span className={currentStep >= 3 ? 'text-zinc-950 font-bold' : ''}>3. Payment</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>SSL Secured</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Form Steps (Col 1-7) */}
        <div className="lg:col-span-7 space-y-8">
          {/* STEP 1: Shipping Address */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-zinc-950 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-display font-bold text-lg text-zinc-950">
                  Client & Shipping Address
                </h3>
              </div>
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 underline"
                >
                  Edit
                </button>
              )}
            </div>

            {currentStep === 1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full text-xs sm:text-sm p-3 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                      Email for Receipt
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full text-xs sm:text-sm p-3 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                      Mobile Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full text-xs sm:text-sm p-3 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      disabled
                      value={country}
                      className="w-full text-xs sm:text-sm p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    Street Address & Suite
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full text-xs sm:text-sm p-3 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                      State / Region
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full text-xs sm:text-sm p-3 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      required
                      value={zip}
                      onChange={e => setZip(e.target.value)}
                      className="w-full text-xs sm:text-sm p-3 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="mt-4 px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
                >
                  Continue to Delivery Method
                </button>
              </div>
            ) : (
              <div className="text-xs text-zinc-600 space-y-1">
                <p className="font-semibold text-zinc-900">{fullName} ({email})</p>
                <p>{street}, {city}, {state} {zip}, {country}</p>
                <p>Phone: {phone}</p>
              </div>
            )}
          </div>

          {/* STEP 2: Shipping Method */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${currentStep >= 2 ? 'bg-zinc-950 text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                  2
                </span>
                <h3 className="font-display font-bold text-lg text-zinc-950">
                  Delivery Speed & Method
                </h3>
              </div>
              {currentStep > 2 && (
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 underline"
                >
                  Edit
                </button>
              )}
            </div>

            {currentStep >= 2 ? (
              <div className="space-y-3">
                <label
                  onClick={() => setShippingMethod('standard')}
                  className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    shippingMethod === 'standard'
                      ? 'border-zinc-950 bg-zinc-50/50'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="mt-1 accent-zinc-950"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900">Standard Insured Courier</span>
                        <Truck className="w-4 h-4 text-zinc-500" />
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">Estimated 3–5 business days dispatch</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-zinc-900">
                    {subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 'FREE' : formatINR(SHIPPING_FEE)}
                  </span>
                </label>

                <label
                  onClick={() => setShippingMethod('express')}
                  className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    shippingMethod === 'express'
                      ? 'border-zinc-950 bg-zinc-50/50'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="mt-1 accent-zinc-950"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900">Priority Air Cargo Overnight</span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded">
                          Fastest
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">Next business day signature delivery across metro cities</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-zinc-900">{formatINR(399)}</span>
                </label>

                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="mt-4 px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
                  >
                    Continue to Payment
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-400">Complete shipping address to view options.</p>
            )}
          </div>

          {/* STEP 3: Payment */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${currentStep === 3 ? 'bg-zinc-950 text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                  3
                </span>
                <h3 className="font-display font-bold text-lg text-zinc-950">
                  Payment Method
                </h3>
              </div>
            </div>

            {currentStep === 3 ? (
              <div className="space-y-6">
                {/* Method selector tabs */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-4 rounded-xl border-2 text-left flex flex-col justify-between gap-2 transition-all ${
                      paymentMethod === 'stripe'
                        ? 'border-zinc-950 bg-zinc-50/50 shadow-xs'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className="w-5 h-5 text-zinc-900" />
                      <span className="text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded font-semibold">
                        Stripe
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-950">Credit / Debit Card</h4>
                      <p className="text-[11px] text-zinc-500">Visa, Mastercard, Amex</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-xl border-2 text-left flex flex-col justify-between gap-2 transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-zinc-950 bg-zinc-50/50 shadow-xs'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Truck className="w-5 h-5 text-zinc-900" />
                      <span className="text-[10px] bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded font-semibold">
                        COD
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-950">Pay on Delivery</h4>
                      <p className="text-[11px] text-zinc-500">Upon courier handover</p>
                    </div>
                  </button>
                </div>

                {/* Stripe Card Fields */}
                {paymentMethod === 'stripe' && (
                  <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-zinc-900">
                          Encrypted Stripe Card Gateway
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={fillTestCard}
                        className="text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded transition-colors"
                      >
                        ⚡ 1-Click Fill Test Card
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={nameOnCard}
                        onChange={e => setNameOnCard(e.target.value)}
                        className="w-full text-xs sm:text-sm p-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          className="w-full text-xs sm:text-sm p-2.5 bg-white border border-zinc-300 rounded-lg font-mono focus:outline-none focus:border-zinc-950"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                          VISA
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                          Expiration (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          className="w-full text-xs sm:text-sm p-2.5 bg-white border border-zinc-300 rounded-lg font-mono focus:outline-none focus:border-zinc-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                          Security CVC
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value)}
                          className="w-full text-xs sm:text-sm p-2.5 bg-white border border-zinc-300 rounded-lg font-mono focus:outline-none focus:border-zinc-950"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>Stripe sandbox payment intent will be processed in secure test mode.</span>
                    </div>
                  </div>
                )}

                {/* Final Order Submit Button */}
                <button
                  id="submit-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    'Securing Order & Authorization...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Order · {formatINR(grandTotal, true)}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">Progress through previous steps to select payment.</p>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary (Col 8-12) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-xs space-y-6 sticky top-24">
          <h3 className="font-display font-bold text-base text-zinc-950 border-b border-zinc-100 pb-3">
            Summary of Acquisition ({items.reduce((s: number, i: CartItem) => s + i.quantity, 0)} items)
          </h3>

          <div className="divide-y divide-zinc-100 max-h-72 overflow-y-auto pr-1">
            {items.map((item: CartItem, idx: number) => (
              <div key={idx} className="py-3 flex items-center gap-3">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-14 h-16 rounded-lg object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-zinc-900 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Qty {item.quantity} {item.selectedSize ? `· Size ${item.selectedSize}` : ''}{' '}
                    {item.selectedColor ? `· ${item.selectedColor}` : ''}
                  </p>
                  <span className="text-xs font-bold text-zinc-950">
                    {formatINR(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-200 pt-4 space-y-2 text-xs text-zinc-600">
            <div className="flex justify-between">
              <span>Catalog Subtotal</span>
              <span className="font-medium text-zinc-950">{formatINR(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount Code ({discountCode})</span>
                <span>-{formatINR(discount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery Service</span>
              <span>{calculatedShipping === 0 ? 'FREE' : formatINR(calculatedShipping)}</span>
            </div>

            <div className="flex justify-between">
              <span>Estimated GST (18%)</span>
              <span>{formatINR(tax, true)}</span>
            </div>

            <div className="border-t border-zinc-200 pt-3 flex justify-between text-base font-extrabold text-zinc-950">
              <span>Total Payable</span>
              <span className="text-lg">{formatINR(grandTotal, true)}</span>
            </div>
          </div>

          <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 text-[11px] text-zinc-500 space-y-1">
            <p className="font-semibold text-zinc-800">Atelier Guarantee:</p>
            <p>30-Day risk-free home trial with prepaid return shipping label included in every delivery box.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
