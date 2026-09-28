import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag, Bookmark } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR, FREE_SHIPPING_THRESHOLD } from '../../utils/currency';

interface CartDrawerProps {
  onCheckout: () => void;
  onExplore: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onExplore }) => {
  const {
    items,
    savedItems,
    removeItem,
    saveForLater,
    moveToCart,
    removeSavedItem,
    updateQuantity,
    totalItems,
    subtotal,
    discount,
    discountCode,
    discountPercent,
    applyCoupon,
    removeCoupon,
    shippingFee,
    tax,
    total,
    isCartOpen,
    setIsCartOpen,
    notificationMessage
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Free shipping progress calculation (₹4,999 target)
  const freeShippingThreshold = FREE_SHIPPING_THRESHOLD;
  const netSubtotal = subtotal - discount;
  const progressPercent = Math.min(100, Math.round((netSubtotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - netSubtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const res = await applyCoupon(inputCoupon);
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setInputCoupon('');
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 max-w-full w-full sm:max-w-md bg-white shadow-2xl z-50 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-zinc-950" />
                <h2 className="font-display text-lg font-bold text-zinc-950">
                  Your Bag ({totalItems})
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-950 rounded-full hover:bg-zinc-100 transition-colors"
                aria-label="Close Bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification banner if active */}
            {notificationMessage && (
              <div className="bg-zinc-900 text-zinc-100 text-xs py-2 px-4 text-center font-medium">
                {notificationMessage}
              </div>
            )}

            {/* Free Shipping Progress Indicator */}
            <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-3">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                {remainingForFreeShipping > 0 ? (
                  <span className="text-zinc-600">
                    Add <strong className="text-zinc-950 font-bold">{formatINR(remainingForFreeShipping)}</strong> for free express shipping
                  </span>
                ) : (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    ✓ You unlocked complimentary insured express shipping!
                  </span>
                )}
                <span className="text-[11px] text-zinc-400">{progressPercent}%</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-zinc-950 h-1.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-zinc-100">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900">Your bag is empty</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                    Explore our curated collection of architectural instruments and timeless wardrobe staples.
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      onExplore();
                    }}
                    className="mt-6 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider py-3 px-6 rounded-md transition-colors"
                  >
                    Explore Collection
                  </button>
                </div>
              ) : (
                items.map(item => (
                  <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="py-4 flex gap-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-24 object-cover object-center rounded-lg bg-zinc-100 border border-zinc-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-zinc-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => saveForLater(item.productId, item.selectedSize, item.selectedColor)}
                              className="text-zinc-400 hover:text-amber-600 transition-colors p-1 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                              title="Save for later"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Save</span>
                            </button>
                            <button
                              onClick={() => removeItem(item.productId, item.selectedSize, item.selectedColor)}
                              className="text-zinc-400 hover:text-rose-600 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Variant Details */}
                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                          {item.selectedColor && (
                            <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-[11px]">
                              {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-[11px]">
                              Size {item.selectedSize}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-zinc-200 rounded-md">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity - 1,
                                item.selectedSize,
                                item.selectedColor
                              )
                            }
                            className="p-1.5 text-zinc-500 hover:text-zinc-950 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity + 1,
                                item.selectedSize,
                                item.selectedColor
                              )
                            }
                            className="p-1.5 text-zinc-500 hover:text-zinc-950 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Total price for line */}
                        <span className="text-sm font-bold text-zinc-950">
                          {formatINR(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Saved For Later Section */}
              {savedItems.length > 0 && (
                <div className="pt-6 mt-6 border-t border-zinc-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                      Saved For Later ({savedItems.length})
                    </span>
                  </div>

                  <div className="space-y-3">
                    {savedItems.map(saved => (
                      <div
                        key={`saved-${saved.productId}-${saved.selectedSize}-${saved.selectedColor}`}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70"
                      >
                        <img
                          src={saved.product.images[0]}
                          alt={saved.product.name}
                          className="w-12 h-14 object-cover rounded-lg border border-zinc-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-semibold text-zinc-900 truncate">
                            {saved.product.name}
                          </h5>
                          <span className="text-xs font-bold text-zinc-950">
                            {formatINR(saved.product.price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveToCart(saved.productId, saved.selectedSize, saved.selectedColor)}
                            className="text-[11px] font-semibold bg-zinc-950 hover:bg-zinc-800 text-white px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                          >
                            Move to Bag
                          </button>
                          <button
                            onClick={() => removeSavedItem(saved.productId, saved.selectedSize, saved.selectedColor)}
                            className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="border-t border-zinc-200 px-6 py-5 bg-zinc-50/70 space-y-4">
                {/* Promo Code Input */}
                <div className="space-y-1.5">
                  {discountCode ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md py-1.5 px-3 text-xs text-emerald-800">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          <strong>{discountCode}</strong> applied ({discountPercent}% off)
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-zinc-400 hover:text-rose-600 text-xs font-semibold underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Discount code (e.g. WELCOME10)"
                        value={inputCoupon}
                        onChange={e => setInputCoupon(e.target.value)}
                        className="flex-1 bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs uppercase placeholder-zinc-400 focus:outline-none focus:border-zinc-950"
                      />
                      <button
                        type="submit"
                        disabled={couponLoading || !inputCoupon.trim()}
                        className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </form>
                  )}
                  {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}
                </div>

                {/* Calculations */}
                <div className="space-y-2 text-xs text-zinc-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-zinc-950 font-medium">{formatINR(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount ({discountCode})</span>
                      <span>-{formatINR(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span>{shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated GST (18%)</span>
                    <span>{formatINR(tax, true)}</span>
                  </div>

                  <div className="border-t border-zinc-200 pt-2 flex justify-between text-sm font-bold text-zinc-950">
                    <span>Estimated Total</span>
                    <span className="text-base">{formatINR(total, true)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  id="checkout-cta-btn"
                  onClick={() => {
                    setIsCartOpen(false);
                    onCheckout();
                  }}
                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-3.5 px-6 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Encrypted 256-Bit SSL Checkout · Instant Delivery Guarantee</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
