import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, Search, X, RotateCcw } from 'lucide-react';
import { Product, Category, FilterState } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { formatINR } from '../utils/currency';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onSelectProduct: (product: Product) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  selectedCategory,
  setSelectedCategory,
  onSelectProduct,
  searchQuery = '',
  setSearchQuery
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: searchQuery,
    category: selectedCategory || 'all',
    minPrice: 0,
    maxPrice: 60000,
    rating: 0,
    sortBy: 'featured',
    inStockOnly: false
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync category prop if updated from external navbar
  React.useEffect(() => {
    if (selectedCategory && selectedCategory !== filters.category) {
      setFilters(prev => ({ ...prev, category: selectedCategory }));
    }
  }, [selectedCategory]);

  // Sync search query if changed externally
  React.useEffect(() => {
    if (searchQuery !== filters.search) {
      setFilters(prev => ({ ...prev, search: searchQuery }));
    }
  }, [searchQuery]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      minPrice: 0,
      maxPrice: 60000,
      rating: 0,
      sortBy: 'featured',
      inStockOnly: false
    });
    setSelectedCategory('all');
    if (setSearchQuery) setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Category
    if (filters.category && filters.category !== 'all') {
      result = result.filter(
        p => p.categorySlug === filters.category || p.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Price range
    result = result.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);

    // Rating
    if (filters.rating > 0) {
      result = result.filter(p => p.rating >= filters.rating);
    }

    // In-stock
    if (filters.inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [products, filters]);

  const activeFiltersCount =
    (filters.category !== 'all' ? 1 : 0) +
    (filters.search ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < 800 ? 1 : 0) +
    (filters.rating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Breadcrumb */}
      <div className="border-b border-zinc-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Catalog & Archive
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight mt-1">
            {filters.category !== 'all'
              ? categories.find(c => c.slug === filters.category)?.name || 'Collection'
              : 'All Instruments & Artifacts'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Showing {filteredProducts.length} of {products.length} catalog items
          </p>
        </div>

        {/* Sort and Mobile Filter toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-xs font-medium text-zinc-800"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 hidden sm:inline">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-white border border-zinc-200 text-xs rounded-lg px-3 py-2 font-medium text-zinc-800 focus:outline-none focus:border-zinc-950"
            >
              <option value="featured">Featured First</option>
              <option value="newest">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters (Desktop & Mobile Drawer) */}
        <aside
          className={`${
            mobileFilterOpen ? 'block fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden md:block'
          } space-y-6 md:sticky md:top-24`}
        >
          {mobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 mb-4 md:hidden">
              <h3 className="font-bold text-base text-zinc-950">Filter Catalog</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Quick Search Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.search}
                onChange={e => {
                  setFilters(prev => ({ ...prev, search: e.target.value }));
                  if (setSearchQuery) setSearchQuery(e.target.value);
                }}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-950"
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
              Categories
            </label>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, category: 'all' }));
                  setSelectedCategory('all');
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex justify-between ${
                  filters.category === 'all'
                    ? 'bg-zinc-950 text-white font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <span>All Categories</span>
                <span>{products.length}</span>
              </button>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setFilters(prev => ({ ...prev, category: cat.slug }));
                    setSelectedCategory(cat.slug);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex justify-between ${
                    filters.category === cat.slug
                      ? 'bg-zinc-950 text-white font-semibold'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="opacity-70">{cat.productCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Max Price
              </label>
              <span className="text-xs font-bold text-zinc-950">{formatINR(filters.maxPrice)}</span>
            </div>
            <input
              type="range"
              min="3000"
              max="60000"
              step="1000"
              value={filters.maxPrice}
              onChange={e => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
              className="w-full accent-zinc-950 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>₹3,000</span>
              <span>₹60,000+</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
              Minimum Rating
            </label>
            <div className="space-y-1">
              {[0, 4.5, 4.8].map(stars => (
                <button
                  key={stars}
                  onClick={() => setFilters(prev => ({ ...prev, rating: stars }))}
                  className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium ${
                    filters.rating === stars ? 'bg-zinc-200 text-zinc-950 font-bold' : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {stars === 0 ? 'Any Rating' : `${stars} Stars & Above`}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Filter Toggle */}
          <div className="pt-2 border-t border-zinc-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-800">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={e => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
              />
              <span>In Stock Items Only</span>
            </label>
          </div>

          {/* Reset Action */}
          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="w-full py-2 px-3 border border-zinc-200 hover:bg-zinc-100 rounded-lg text-xs font-medium text-zinc-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}

          {mobileFilterOpen && (
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 bg-zinc-950 text-white rounded-lg text-xs font-semibold uppercase tracking-wider mt-4"
            >
              Apply Filters ({filteredProducts.length} Results)
            </button>
          )}
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3">
          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-zinc-400">Active filters:</span>
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-800">
                  &ldquo;{filters.search}&rdquo;
                  <button onClick={() => setFilters(p => ({ ...p, search: '' }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.category !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-800">
                  {categories.find(c => c.slug === filters.category)?.name || filters.category}
                  <button onClick={() => setFilters(p => ({ ...p, category: 'all' }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.maxPrice < 60000 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-800">
                  Under {formatINR(filters.maxPrice)}
                  <button onClick={() => setFilters(p => ({ ...p, maxPrice: 60000 }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.rating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-800">
                  {filters.rating}+ Stars
                  <button onClick={() => setFilters(p => ({ ...p, rating: 0 }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:underline font-semibold ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Grid or Empty state */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-zinc-200/80 p-8">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400 mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">No matching works found</h3>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
                We couldn&apos;t find any instruments matching your selected filter criteria. Try broadening your price or search query.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 px-6 py-2.5 bg-zinc-950 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
