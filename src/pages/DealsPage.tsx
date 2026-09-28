import React, { useState, useEffect } from 'react';
import { Flame, Clock, Sparkles, Copy, Check, ArrowRight, Tag, ShieldCheck, Zap } from 'lucide-react';
import { Product, Coupon } from '../types';
import { formatINR } from '../utils/currency';
import { ProductCard } from '../components/products/ProductCard';
import { useCart } from '../context/CartContext';

interface DealsPageProps {
  products: Product[];
  coupons?: Coupon[];
  onSelectProduct: (product: Product) => void;
  onNavigateShop: () => void;
}

export const DealsPage: React.FC<DealsPageProps> = ({
  products,
  coupons = [],
  onSelectProduct,
  onNavigateShop
}) => {
  const { applyCoupon } = useCart();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Live countdown timer ticking down to midnight
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Curate products that have discounts (compareAtPrice > price) or are featured
  const discountedProducts = products
    .filter(p => p.compareAtPrice && p.compareAtPrice > p.price)
    .sort((a, b) => {
      const discA = ((a.compareAtPrice! - a.price) / a.compareAtPrice!) * 100;
      const discB = ((b.compareAtPrice! - b.price) / b.compareAtPrice!) * 100;
      return discB - discA;
    });

  const displayCoupons = coupons.length > 0 ? coupons.filter(c => c.isActive) : [
    {
      id: 'cp-welcome10',
      code: 'WELCOME10',
      discountType: 'percentage' as const,
      discountValue: 10,
      minOrderAmount: 4999,
      description: '10% off your first archival instrument order',
      usageCount: 42,
      isActive: true,
      createdAt: '2026-01-01'
    },
    {
      id: 'cp-atelier20',
      code: 'ATELIER20',
      discountType: 'percentage' as const,
      discountValue: 20,
      minOrderAmount: 25000,
      description: '20% off high-fidelity luxury audio & horology orders over ₹25,000',
      usageCount: 19,
      isActive: true,
      createdAt: '2026-01-01'
    },
    {
      id: 'cp-flat2000',
      code: 'FLAT2000',
      discountType: 'fixed' as const,
      discountValue: 2000,
      minOrderAmount: 15000,
      description: 'Instant ₹2,000 cash discount on orders over ₹15,000',
      usageCount: 28,
      isActive: true,
      createdAt: '2026-01-01'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 pb-24">
      {/* 1. Flash Deals Hero Banner with Live Countdown */}
      <div className="relative rounded-3xl overflow-hidden bg-zinc-950 text-white p-8 sm:p-12 border border-zinc-800 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-500/30">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Limited Atelier Flash Vault</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display">
              Exclusive Seasonal Privileges & Flash Sales
            </h1>

            <p className="text-sm text-zinc-300 leading-relaxed font-normal">
              Special acquisitions on serialized studio monitors, Swiss automatic timepieces, and hand-finished textiles. Verified atelier pricing guaranteed.
            </p>
          </div>

          {/* Countdown Clock Box */}
          <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-6 text-center space-y-3 shrink-0 shadow-xl">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
              <Clock className="w-4 h-4 animate-spin-slow" />
              <span>Vault Refreshes In</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 min-w-[70px]">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-zinc-400 mt-1">Hours</span>
              </div>
              <span className="text-2xl font-bold text-zinc-600">:</span>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 min-w-[70px]">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-zinc-400 mt-1">Mins</span>
              </div>
              <span className="text-2xl font-bold text-zinc-600">:</span>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 min-w-[70px]">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-400">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-zinc-400 mt-1">Secs</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400">Next drop scheduled at 00:00 IST</p>
          </div>
        </div>
      </div>

      {/* 2. Active Coupons Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Voucher Vault</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
              Verified Promotional Codes
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-medium">Click code to copy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayCoupons.map(cp => (
            <div
              key={cp.id}
              className="bg-white rounded-2xl border-2 border-dashed border-zinc-200 hover:border-zinc-950 p-6 shadow-xs space-y-4 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                    <Tag className="w-3 h-3" />
                    {cp.discountType === 'percentage' ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} OFF`}
                  </span>
                  <p className="text-xs text-zinc-600 font-medium mt-1">
                    {cp.description || `Save on orders above ${formatINR(cp.minOrderAmount)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-100">
                <span className="font-mono font-bold text-base text-zinc-950 tracking-wider">
                  {cp.code}
                </span>

                <button
                  onClick={() => handleCopyCode(cp.code)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                    copiedCode === cp.code
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                  }`}
                >
                  {copiedCode === cp.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-zinc-400">
                Min. cart value: {formatINR(cp.minOrderAmount)} · Applied {cp.usageCount || 0} times
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Discounted Products Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Live Vault Drops
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
              Featured Flash Discounts ({discountedProducts.length} Items)
            </h2>
          </div>

          <button
            onClick={onNavigateShop}
            className="text-xs font-semibold uppercase tracking-wider text-zinc-900 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {discountedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
