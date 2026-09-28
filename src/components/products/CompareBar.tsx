import React from 'react';
import { Scale, X, ArrowRight } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import { motion, AnimatePresence } from 'motion/react';

export const CompareBar: React.FC = () => {
  const { compareProducts, removeFromCompare, clearCompare, setIsCompareModalOpen } = useCompare();

  if (compareProducts.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] bg-zinc-950 text-white rounded-2xl shadow-2xl p-3 sm:p-4 border border-zinc-800 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          <div className="flex items-center gap-1.5 shrink-0 text-amber-300">
            <Scale className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
              Compare ({compareProducts.length}/4)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {compareProducts.map(p => (
              <div
                key={p.id}
                className="relative group w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 shrink-0 bg-zinc-900"
              >
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromCompare(p.id)}
                  className="absolute inset-0 bg-zinc-950/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="text-xs text-zinc-400 hover:text-white px-2 py-1 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="bg-white hover:bg-zinc-100 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
