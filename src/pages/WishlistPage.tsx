import React from 'react';
import { Heart, Trash2, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { formatINR } from '../utils/currency';

interface WishlistPageProps {
  onSelectProduct: (product: Product) => void;
  onNavigateShop: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onSelectProduct, onNavigateShop }) => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToBag = (product: Product) => {
    addItem(product, 1);
    toggleWishlist(product);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-zinc-200 pb-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Personal Registry
          </span>
          <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight mt-1">
            Saved Atelier Works ({wishlist.length})
          </h1>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={onNavigateShop}
            className="text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:text-zinc-950 flex items-center gap-1"
          >
            <span>Discover more</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-zinc-200/80 p-8">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-950">Your personal registry is empty</h3>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            Save items while exploring the catalog by clicking the heart icon on any work.
          </p>
          <button
            onClick={onNavigateShop}
            className="mt-6 px-8 py-3.5 bg-zinc-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors inline-flex items-center gap-2"
          >
            <span>Explore The Archive</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <div
              key={product.id}
              className="group bg-white rounded-xl border border-zinc-200/80 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
            >
              <div
                onClick={() => onSelectProduct(product)}
                className="relative aspect-[4/5] bg-zinc-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full text-rose-600 hover:text-rose-700 shadow-sm"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
                    {product.category}
                  </span>
                  <h4
                    onClick={() => onSelectProduct(product)}
                    className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-950 truncate cursor-pointer"
                  >
                    {product.name}
                  </h4>
                  <span className="text-sm font-bold text-zinc-950 mt-1 block">
                    {formatINR(product.price)}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex gap-2">
                  <button
                    onClick={() => handleMoveToBag(product)}
                    className="flex-1 py-2 px-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
