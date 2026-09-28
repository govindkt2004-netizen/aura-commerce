import React from 'react';
import { X, Check, ArrowRight, Trash2, Scale, Star, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { useCompare } from '../../context/CompareContext';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/currency';
import { motion, AnimatePresence } from 'motion/react';

interface CompareModalProps {
  onSelectProduct: (product: Product) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ onSelectProduct }) => {
  const { compareProducts, removeFromCompare, clearCompare, isCompareModalOpen, setIsCompareModalOpen } = useCompare();
  const { addItem } = useCart();

  if (!isCompareModalOpen) return null;

  // Aggregate all unique specification labels across selected products
  const allSpecLabels = Array.from(
    new Set(
      compareProducts.flatMap(p => (Array.isArray(p.specs) ? p.specs.map(s => s.label) : []))
    )
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCompareModalOpen(false)}
          className="fixed inset-0 bg-zinc-950/70 backdrop-blur-xs"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col z-10 border border-zinc-200 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-950 font-display">
                  Product Comparison Matrix ({compareProducts.length} items)
                </h2>
                <p className="text-xs text-zinc-500">
                  Side-by-side acoustic, material, and structural breakdown
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {compareProducts.length > 0 && (
                <button
                  onClick={clearCompare}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Matrix
                </button>
              )}
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-950 rounded-full hover:bg-zinc-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Table */}
          <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6">
            {compareProducts.length === 0 ? (
              <div className="py-16 text-center">
                <Scale className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-zinc-900">No items selected for comparison</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Click the &ldquo;Compare&rdquo; button on any product card or detail page to evaluate specifications side-by-side.
                </p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="text-left py-4 px-3 w-40 text-xs font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                      Attribute
                    </th>
                    {compareProducts.map(prod => (
                      <th key={prod.id} className="py-4 px-3 text-left min-w-[220px] max-w-[280px]">
                        <div className="relative group">
                          <button
                            onClick={() => removeFromCompare(prod.id)}
                            className="absolute -top-2 -right-2 bg-zinc-200 hover:bg-rose-100 hover:text-rose-600 text-zinc-600 rounded-full p-1 transition-colors"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-full aspect-[4/3] object-cover rounded-xl border border-zinc-200 mb-3 bg-zinc-50 cursor-pointer"
                            onClick={() => {
                              onSelectProduct(prod);
                              setIsCompareModalOpen(false);
                            }}
                          />
                          <h4
                            onClick={() => {
                              onSelectProduct(prod);
                              setIsCompareModalOpen(false);
                            }}
                            className="font-bold text-sm text-zinc-950 hover:text-amber-700 cursor-pointer line-clamp-2"
                          >
                            {prod.name}
                          </h4>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100 text-xs">
                  {/* Pricing Row */}
                  <tr className="hover:bg-zinc-50/60">
                    <td className="py-3.5 px-3 font-semibold text-zinc-500 bg-zinc-50/30">Price</td>
                    {compareProducts.map(prod => (
                      <td key={prod.id} className="py-3.5 px-3">
                        <div className="flex items-baseline gap-2">
                          <span className="font-extrabold text-base text-zinc-950">
                            {formatINR(prod.price, true)}
                          </span>
                          {prod.compareAtPrice && (
                            <span className="text-xs text-zinc-400 line-through">
                              {formatINR(prod.compareAtPrice, true)}
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Rating Row */}
                  <tr className="hover:bg-zinc-50/60">
                    <td className="py-3.5 px-3 font-semibold text-zinc-500 bg-zinc-50/30">Rating</td>
                    {compareProducts.map(prod => (
                      <td key={prod.id} className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 text-zinc-900 font-bold">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>{prod.rating.toFixed(1)}</span>
                          <span className="text-zinc-400 font-normal">({prod.reviewCount} reviews)</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Stock Availability */}
                  <tr className="hover:bg-zinc-50/60">
                    <td className="py-3.5 px-3 font-semibold text-zinc-500 bg-zinc-50/30">Stock Status</td>
                    {compareProducts.map(prod => (
                      <td key={prod.id} className="py-3.5 px-3">
                        {prod.stock <= 0 ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Sold Out</span>
                        ) : prod.stock <= 10 ? (
                          <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            Only {prod.stock} left
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            In Stock ({prod.stock} units)
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Category */}
                  <tr className="hover:bg-zinc-50/60">
                    <td className="py-3.5 px-3 font-semibold text-zinc-500 bg-zinc-50/30">Category</td>
                    {compareProducts.map(prod => (
                      <td key={prod.id} className="py-3.5 px-3 text-zinc-700">
                        {prod.category}
                      </td>
                    ))}
                  </tr>

                  {/* Dynamic Technical Specs Rows */}
                  {allSpecLabels.map(label => (
                    <tr key={label} className="hover:bg-zinc-50/60">
                      <td className="py-3.5 px-3 font-semibold text-zinc-500 bg-zinc-50/30">{label}</td>
                      {compareProducts.map(prod => {
                        const spec = Array.isArray(prod.specs)
                          ? prod.specs.find(s => s.label.toLowerCase() === label.toLowerCase())
                          : null;
                        return (
                          <td key={prod.id} className="py-3.5 px-3 text-zinc-800">
                            {spec ? spec.value : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Actions Row */}
                  <tr>
                    <td className="py-4 px-3 font-semibold text-zinc-500 bg-zinc-50/30">Actions</td>
                    {compareProducts.map(prod => (
                      <td key={prod.id} className="py-4 px-3">
                        <button
                          onClick={() => {
                            addItem(prod, 1);
                          }}
                          disabled={prod.stock <= 0}
                          className="w-full py-2.5 px-3 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-lg font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add To Bag</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
