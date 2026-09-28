import React from 'react';
import { Heart, Star, Plus, Check, Scale } from 'lucide-react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useCompare } from '../../context/CompareContext';
import { motion } from 'motion/react';
import { formatINR } from '../../utils/currency';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { isInCompare, toggleCompare } = useCompare();
  const [added, setAdded] = React.useState(false);

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultColor = product.variants?.colors?.[0]?.name;
    const defaultSize = product.variants?.sizes?.[0];
    addItem(product, 1, defaultSize, defaultColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(product)}
      className="group relative flex flex-col bg-white rounded-xl border border-zinc-200/80 overflow-hidden hover:shadow-xl hover:border-zinc-300 transition-all duration-300 cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] w-full bg-zinc-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Secondary Image hover reveal if available */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isFeatured && (
            <span className="bg-zinc-950 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm shadow-sm">
              Featured
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-white text-zinc-950 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm shadow-sm border border-zinc-200">
              New
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-rose-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Action Buttons (Wishlist & Compare) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleWishlistClick}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              inWishlist
                ? 'bg-rose-50 text-rose-600 shadow-md scale-105'
                : 'bg-white/80 backdrop-blur-sm text-zinc-700 hover:bg-white hover:text-zinc-950 shadow-sm opacity-90 group-hover:opacity-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-600' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(product);
            }}
            title={inCompare ? 'Remove from comparison' : 'Compare specifications'}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              inCompare
                ? 'bg-zinc-950 text-amber-400 shadow-md scale-105'
                : 'bg-white/80 backdrop-blur-sm text-zinc-700 hover:bg-white hover:text-zinc-950 shadow-sm opacity-90 group-hover:opacity-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Add Overlay on Desktop */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hidden sm:block">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors ${
              product.stock <= 0
                ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-950 hover:bg-zinc-800 text-white cursor-pointer'
            }`}
          >
            {product.stock <= 0 ? (
              'Sold Out'
            ) : added ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added to Bag
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Quick Add
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span className="uppercase tracking-wider text-[10px] font-semibold text-zinc-400">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-zinc-700 font-semibold">{product.rating}</span>
              <span className="text-zinc-400 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-medium text-zinc-900 text-sm group-hover:text-zinc-950 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed font-normal">
            {product.tagline || product.description}
          </p>
        </div>

        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-zinc-950 tracking-tight">
              {formatINR(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-zinc-400 line-through">
                {formatINR(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Stock Indicator */}
          {product.stock <= 0 ? (
            <span className="text-[10px] font-semibold uppercase text-zinc-400">Sold Out</span>
          ) : product.stock <= 10 ? (
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Only {product.stock} left
            </span>
          ) : (
            <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> In Stock
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
