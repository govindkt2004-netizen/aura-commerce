import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR } from '../../utils/currency';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onViewAllResults: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onViewAllResults
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.getProducts({ search: query.trim() });
        setResults(res.products.slice(0, 5));
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onViewAllResults(query.trim());
      onClose();
    }
  };

  const handleQuickTag = (tag: string) => {
    setQuery(tag);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <form onSubmit={handleSubmit} className="flex items-center px-4 py-3.5 border-b border-zinc-200">
              <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search headphones, cashmere coats, leather duffels..."
                className="w-full text-sm sm:text-base text-zinc-900 placeholder-zinc-400 focus:outline-none bg-transparent"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-zinc-400 hover:text-zinc-600 mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 px-2 py-1 bg-zinc-100 rounded"
              >
                ESC
              </button>
            </form>

            {/* Quick Suggestions / Popular Searches */}
            {!query && (
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Headphones', 'Automatic Watch', 'Merino Wool', 'Linen Shirt', 'Ceramic', 'Leather Bag'].map(
                    tag => (
                      <button
                        key={tag}
                        onClick={() => handleQuickTag(tag)}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 text-xs font-medium rounded-full transition-colors"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Live Search Results */}
            {query && (
              <div className="max-h-96 overflow-y-auto divide-y divide-zinc-100 p-2">
                {loading ? (
                  <div className="py-8 text-center text-xs text-zinc-400">Searching archive...</div>
                ) : results.length === 0 ? (
                  <div className="py-8 text-center text-sm text-zinc-500">
                    No matching instruments found for &ldquo;{query}&rdquo;.
                  </div>
                ) : (
                  <>
                    {results.map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          onSelectProduct(prod);
                          onClose();
                        }}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 cursor-pointer transition-colors group"
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-12 h-12 rounded object-cover bg-zinc-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
                            {prod.category}
                          </span>
                          <h4 className="text-sm font-medium text-zinc-900 group-hover:text-zinc-950 truncate">
                            {prod.name}
                          </h4>
                          <span className="text-xs font-bold text-zinc-900">
                            {formatINR(prod.price)}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}

                    <div className="p-3 text-center border-t border-zinc-100 mt-2">
                      <button
                        onClick={() => {
                          onViewAllResults(query);
                          onClose();
                        }}
                        className="text-xs font-semibold text-zinc-950 hover:underline inline-flex items-center gap-1"
                      >
                        View all results for &ldquo;{query}&rdquo; <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
