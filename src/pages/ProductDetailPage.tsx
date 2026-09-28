import React, { useState } from 'react';
import {
  Star,
  Shield,
  Truck,
  RotateCcw,
  Heart,
  Share2,
  Plus,
  Minus,
  Check,
  ChevronRight,
  Sparkles,
  MessageSquarePlus,
  Scale,
  Copy,
  CheckCheck,
  HelpCircle
} from 'lucide-react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProductCard } from '../components/products/ProductCard';
import { PincodeChecker } from '../components/products/PincodeChecker';
import { ProductQA } from '../components/products/ProductQA';
import { motion } from 'motion/react';
import { formatINR } from '../utils/currency';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateCategory: (cat: string) => void;
  onInstantCheckout: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onSelectProduct,
  onNavigateCategory,
  onInstantCheckout
}) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();
  const { user, setShowAuthModal } = useAuth();

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.variants?.colors?.[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product.variants?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'qa' | 'care' | 'reviews'>('details');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Review form states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState(user?.name || '');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [productState, setProductState] = useState<Product>(product);

  const inWishlist = isInWishlist(product.id);
  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && p.categorySlug === product.categorySlug)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(productState, quantity, selectedSize, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  const handleBuyNow = () => {
    addItem(productState, quantity, selectedSize, selectedColor);
    onInstantCheckout();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.addReview(productState.id, {
        authorName: reviewAuthor || 'Anonymous Collector',
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });
      setProductState(res.product);
      setShowReviewModal(false);
      setReviewTitle('');
      setReviewComment('');
    } catch (err) {
      console.error('Review submission error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-zinc-500 font-medium">
        <button onClick={() => onNavigateCategory('all')} className="hover:text-zinc-950">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
        <button onClick={() => onNavigateCategory(product.categorySlug)} className="hover:text-zinc-950">
          {product.category}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
        <span className="text-zinc-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery on Left (Col 1-7) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-20 shrink-0">
            {productState.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIdx(idx)}
                className={`relative aspect-square w-16 sm:w-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  currentImageIdx === idx ? 'border-zinc-950 shadow-md' : 'border-zinc-200 hover:border-zinc-400 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>

          {/* Large Main Display */}
          <div className="flex-1 relative aspect-[4/5] bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm group">
            <img
              src={productState.images[currentImageIdx] || productState.images[0]}
              alt={productState.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              referrerPolicy="no-referrer"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {productState.isFeatured && (
                <span className="bg-zinc-950 text-white text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-sm shadow-md">
                  Featured Instrument
                </span>
              )}
              {discountPercent > 0 && (
                <span className="bg-rose-600 text-white text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-sm shadow-md">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            <button
              onClick={() => toggleWishlist(productState)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
                inWishlist ? 'bg-rose-50 text-rose-600' : 'bg-white/90 text-zinc-700 hover:bg-white hover:text-zinc-950'
              }`}
              aria-label="Save to wishlist"
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Product Purchase Form on Right (Col 8-12) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                {productState.category}
              </span>
              <button
                onClick={handleShare}
                className="text-xs text-zinc-500 hover:text-zinc-950 flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight mt-1">
              {productState.name}
            </h1>

            {productState.tagline && (
              <p className="text-sm text-zinc-500 italic mt-1 font-serif">
                &ldquo;{productState.tagline}&rdquo;
              </p>
            )}

            {/* Rating Stars & Count */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(productState.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-zinc-800">{productState.rating} / 5.0</span>
              <span className="text-xs text-zinc-400">
                ({productState.reviewCount} verified reviews)
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200/80">
            <span className="text-3xl font-extrabold text-zinc-950 tracking-tight">
              {formatINR(productState.price)}
            </span>
            {productState.compareAtPrice && (
              <span className="text-base text-zinc-400 line-through">
                {formatINR(productState.compareAtPrice)}
              </span>
            )}
            <span className="ml-auto text-xs text-zinc-500 font-medium">
              Taxes & GST (18%) calculated at checkout
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-600 leading-relaxed font-normal">
            {productState.description}
          </p>

          {/* Color Selection if available */}
          {productState.variants?.colors && productState.variants.colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-zinc-800">
                <span>Finish / Color</span>
                <span className="text-zinc-500 lowercase capitalize">{selectedColor}</span>
              </div>
              <div className="flex items-center gap-3">
                {productState.variants.colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`group relative p-0.5 rounded-full transition-all ${
                      selectedColor === color.name
                        ? 'ring-2 ring-zinc-950 ring-offset-2'
                        : 'hover:scale-110'
                    }`}
                    title={color.name}
                  >
                    <span
                      className="block w-6 h-6 rounded-full border border-zinc-300 shadow-inner"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection if available */}
          {productState.variants?.sizes && productState.variants.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-zinc-800">
                <span>Select Size</span>
                <span className="text-zinc-400 font-normal">Standard Fit</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {productState.variants.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                      selectedSize === size
                        ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm'
                        : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Availability */}
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-800">
                Quantity
              </span>
              <div className="flex items-center border border-zinc-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-zinc-600 hover:text-zinc-950"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-zinc-950">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(productState.stock, quantity + 1))}
                  disabled={quantity >= productState.stock}
                  className="p-2 text-zinc-600 hover:text-zinc-950 disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1 flex-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-800">
                Availability
              </span>
              <div className="py-2">
                {productState.stock <= 0 ? (
                  <span className="text-xs font-bold uppercase text-rose-600">Currently Sold Out</span>
                ) : productState.stock <= 10 ? (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                    Low Stock: Only {productState.stock} remain
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock & Ready For Dispatch
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CTAs: Add to Cart and Buy Now */}
          <div className="space-y-3 pt-2">
            <button
              id="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={productState.stock <= 0}
              className={`w-full py-4 px-6 rounded-xl text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                productState.stock <= 0
                  ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                  : addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-white'
              }`}
            >
              {productState.stock <= 0 ? (
                'Out of Stock'
              ) : addedAnimation ? (
                <>
                  <Check className="w-4 h-4" /> Added To Your Bag
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add To Shopping Bag
                </>
              )}
            </button>

            <button
              id="buy-now-btn"
              onClick={handleBuyNow}
              disabled={productState.stock <= 0}
              className="w-full py-3.5 px-6 rounded-xl border border-zinc-300 hover:border-zinc-950 text-zinc-950 text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer bg-white"
            >
              Instant Express Checkout
            </button>
          </div>

          {/* Secondary Action Bar: Wishlist, Compare, Social Sharing */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => toggleWishlist(productState)}
              className={`flex-1 py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                inWishlist
                  ? 'border-rose-300 bg-rose-50 text-rose-600'
                  : 'border-zinc-200 hover:border-zinc-400 text-zinc-700 bg-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-rose-600' : ''}`} />
              <span>{inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>

            <button
              onClick={() => toggleCompare(productState)}
              className={`flex-1 py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isInCompare(productState.id)
                  ? 'border-amber-400 bg-amber-50 text-amber-950'
                  : 'border-zinc-200 hover:border-zinc-400 text-zinc-700 bg-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isInCompare(productState.id) ? 'In Comparison' : 'Compare'}</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2.5 rounded-lg border border-zinc-200 hover:border-zinc-400 text-zinc-700 bg-white transition-colors cursor-pointer"
                title="Share this artifact"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {showShareMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-xl shadow-xl border border-zinc-200 p-2 z-30 space-y-1">
                  <button
                    onClick={() => {
                      handleShare();
                      setShowShareMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 rounded-md flex items-center gap-2 cursor-pointer"
                  >
                    {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Take a look at ${productState.name} on AURA Atelier: ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowShareMenu(false)}
                    className="w-full text-left px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 rounded-md flex items-center gap-2 block"
                  >
                    <span className="text-emerald-600 font-bold text-xs">WA</span>
                    <span>Share on WhatsApp</span>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Discovering ${productState.name} on AURA Atelier`)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowShareMenu(false)}
                    className="w-full text-left px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 rounded-md flex items-center gap-2 block"
                  >
                    <span className="text-zinc-950 font-bold text-xs">𝕏</span>
                    <span>Share on X (Twitter)</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Delivery & Pincode Checker */}
          <div className="pt-2">
            <PincodeChecker />
          </div>

          {/* Assurance Icons */}
          <div className="pt-4 border-t border-zinc-200 grid grid-cols-3 gap-4 text-center text-xs text-zinc-600">
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-zinc-800" />
              <span className="text-[11px] font-medium">Free Carbon-Neutral Cargo</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Shield className="w-4 h-4 text-zinc-800" />
              <span className="text-[11px] font-medium">2-Year Atelier Warranty</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-zinc-800" />
              <span className="text-[11px] font-medium">30-Day Risk-Free Trial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Detailed Info, Specifications, Reviews */}
      <div className="border-t border-zinc-200 pt-10">
        <div className="flex border-b border-zinc-200 space-x-6 sm:space-x-8 text-sm font-semibold overflow-x-auto">
          {[
            { id: 'details', label: 'Overview & Story' },
            { id: 'specs', label: 'Technical Specifications' },
            { id: 'qa', label: 'Questions & Answers' },
            { id: 'care', label: 'Care & Provenance' },
            { id: 'reviews', label: `Reviews (${productState.reviews?.length || 0})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs uppercase tracking-wider transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-zinc-950 text-zinc-950'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === 'details' && (
            <div className="max-w-3xl space-y-4 text-sm text-zinc-700 leading-relaxed">
              <p>{productState.description}</p>
              <div className="pt-4">
                <h4 className="font-bold text-zinc-950 text-xs uppercase tracking-wider mb-2">
                  Atelier Highlights
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-zinc-600 text-xs sm:text-sm">
                  {(productState.features || [
                    'Meticulously inspected by master curators',
                    'Built with sustainable and serialized materials',
                    'Accompanied by Certificate of Provenance'
                  ]).map((f: string, i: number) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl bg-white rounded-xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100">
              {Array.isArray(productState.specs) ? (
                productState.specs.map((spec, idx) => (
                  <div key={idx} className="grid grid-cols-2 p-3.5 text-xs sm:text-sm">
                    <span className="font-semibold text-zinc-900">{spec.label}</span>
                    <span className="text-zinc-600">{spec.value}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-xs text-zinc-400">Specifications standard to collection.</div>
              )}
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="max-w-3xl">
              <ProductQA productId={productState.id} productName={productState.name} />
            </div>
          )}

          {activeTab === 'care' && (
            <div className="max-w-2xl space-y-3 text-sm text-zinc-700">
              <h4 className="font-bold text-zinc-950 text-xs uppercase tracking-wider">
                Preservation Guidelines
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-600">
                To maintain the natural patina and pristine surface finish, store in a temperature-controlled environment away from prolonged direct UV exposure. Clean using the included micro-fiber lint cloth without abrasive chemical solvents.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-zinc-950">{productState.rating}</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Based on {productState.reviewCount} customer reviews from verified owners.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (!user) {
                      setShowAuthModal(true);
                    } else {
                      setShowReviewModal(true);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Write An Assessment</span>
                </button>
              </div>

              {/* Review List */}
              <div className="space-y-4">
                {productState.reviews && productState.reviews.length > 0 ? (
                  productState.reviews.map(rev => (
                    <div
                      key={rev.id}
                      className="p-6 bg-white rounded-xl border border-zinc-200/80 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-950">{rev.authorName}</span>
                          {(rev.isVerified || rev.verifiedPurchase) && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-sm">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-400">{rev.date}</span>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      <h5 className="font-semibold text-sm text-zinc-900">{rev.title}</h5>
                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400">Be the first collector to review this instrument.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="font-display font-bold text-lg text-zinc-950">Write Collector Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-zinc-400 hover:text-zinc-950">
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                  Rating
                </label>
                <div className="flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={reviewAuthor}
                  onChange={e => setReviewAuthor(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  placeholder="e.g. Liam Sterling"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={e => setReviewTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  placeholder="e.g. Masterful engineering and audio clarity"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                  Detailed Experience
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                  placeholder="Share details about the ergonomics, materials, durability..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-zinc-200 text-xs font-semibold uppercase rounded-lg hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2 bg-zinc-950 text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-zinc-800 disabled:opacity-50"
                >
                  {submittingReview ? 'Publishing...' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-zinc-200 pt-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-2xl font-bold text-zinc-950">
              Complementary Works
            </h3>
            <button
              onClick={() => onNavigateCategory(product.categorySlug)}
              className="text-xs font-semibold uppercase tracking-wider text-zinc-900 hover:text-zinc-600"
            >
              Explore Full {product.category} Collection →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} onSelect={onSelectProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
