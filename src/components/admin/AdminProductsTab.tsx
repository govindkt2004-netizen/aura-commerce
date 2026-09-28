import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Filter,
  X,
  ExternalLink,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Product, Category } from '../../types';
import { formatINR } from '../../utils/currency';

interface AdminProductsTabProps {
  products: Product[];
  categories: Category[];
  onCreateProduct: (data: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  onDuplicateProduct: (id: string) => Promise<void>;
  onToggleActive: (id: string) => Promise<void>;
  onUpdateStock: (id: string, stock: number) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  categories,
  onCreateProduct,
  onUpdateProduct,
  onDuplicateProduct,
  onToggleActive,
  onUpdateStock,
  onDeleteProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [form, setForm] = useState<Partial<Product>>({
    name: '',
    sku: '',
    tagline: '',
    description: '',
    price: 4999,
    compareAtPrice: 6999,
    category: categories[0]?.name || 'Audio & Tech',
    categorySlug: categories[0]?.slug || 'audio-tech',
    stock: 20,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'],
    isFeatured: false,
    isNewArrival: true,
    isActive: true,
    tags: ['lifestyle', 'craft']
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || p.categorySlug === categoryFilter;

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'out_of_stock' && p.stock === 0) ||
      (stockFilter === 'low_stock' && p.stock > 0 && p.stock <= 10) ||
      (stockFilter === 'in_stock' && p.stock > 10);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.isActive !== false) ||
      (statusFilter === 'draft' && p.isActive === false);

    return matchesSearch && matchesCategory && matchesStock && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      sku: 'AUR-' + Math.floor(1000 + Math.random() * 9000),
      tagline: '',
      description: '',
      price: 2999,
      compareAtPrice: 3999,
      category: categories[0]?.name || 'Audio & Tech',
      categorySlug: categories[0]?.slug || 'audio-tech',
      stock: 25,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'],
      isFeatured: false,
      isNewArrival: true,
      isActive: true,
      tags: ['craft', 'premium']
    });
    setNewImageUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      sku: p.sku || 'AUR-' + Math.floor(1000 + Math.random() * 9000),
      tagline: p.tagline || '',
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      category: p.category,
      categorySlug: p.categorySlug,
      stock: p.stock,
      images: [...p.images],
      isFeatured: p.isFeatured || false,
      isNewArrival: p.isNewArrival || false,
      isActive: p.isActive !== false,
      tags: p.tags ? [...p.tags] : []
    });
    setNewImageUrl('');
    setIsModalOpen(true);
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setForm(prev => ({
      ...prev,
      images: [...(prev.images || []), newImageUrl.trim()]
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleCategorySelect = (slug: string) => {
    const selected = categories.find(c => c.slug === slug);
    if (selected) {
      setForm(prev => ({
        ...prev,
        category: selected.name,
        categorySlug: selected.slug
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setIsSaving(true);
    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, form);
      } else {
        await onCreateProduct(form);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search/Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
            Product Catalog & Inventory
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage pricing in INR, active status, image galleries, and inventory levels
          </p>
        </div>
        <button
          id="add-product-btn"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by title, SKU, or tag..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-3 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as any)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-3 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 cursor-pointer"
          >
            <option value="all">All Inventory</option>
            <option value="in_stock">In Stock (&gt; 10)</option>
            <option value="low_stock">Low Stock (1 - 10)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-3 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 cursor-pointer"
          >
            <option value="all">All Visibility</option>
            <option value="active">Active (Visible)</option>
            <option value="draft">Draft (Hidden)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100">
                <th className="py-3 px-5">Item</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Price (INR)</th>
                <th className="py-3 px-5">Inventory</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Badges</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'}
                          alt={prod.name}
                          className="w-10 h-10 object-cover rounded-lg bg-zinc-100 shrink-0 border border-zinc-200/60"
                        />
                        <div>
                          <div className="font-semibold text-zinc-900 leading-tight">
                            {prod.name}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                            SKU: {prod.sku || prod.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-5 text-zinc-600 font-medium">
                      {prod.category}
                    </td>

                    <td className="py-3 px-5 font-bold text-zinc-950">
                      <div>{formatINR(prod.price)}</div>
                      {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                        <div className="text-[10px] text-zinc-400 line-through font-normal">
                          {formatINR(prod.compareAtPrice)}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          defaultValue={prod.stock}
                          key={prod.id + '-' + prod.stock}
                          onBlur={e => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val !== prod.stock) {
                              onUpdateStock(prod.id, Math.max(0, val));
                            }
                          }}
                          className={`w-16 py-1 px-2 text-xs font-semibold rounded border text-center ${
                            prod.stock === 0
                              ? 'bg-rose-50 border-rose-300 text-rose-800'
                              : prod.stock <= 10
                              ? 'bg-amber-50 border-amber-300 text-amber-800'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                          }`}
                        />
                        <span className="text-[11px] text-zinc-400">units</span>
                      </div>
                    </td>

                    <td className="py-3 px-5">
                      <button
                        onClick={() => onToggleActive(prod.id)}
                        title="Click to toggle visibility"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                          prod.isActive !== false
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200'
                        }`}
                      >
                        {prod.isActive !== false ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-zinc-500" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1">
                        {prod.isFeatured && (
                          <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-semibold rounded">
                            Featured
                          </span>
                        )}
                        {prod.isNewArrival && (
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 text-[9px] font-semibold rounded">
                            New
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDuplicateProduct(prod.id)}
                          className="p-1.5 text-zinc-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Duplicate product"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(prod.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div>
                <h3 className="text-lg font-bold text-zinc-950">
                  {editingProduct ? 'Edit Product Item' : 'Add New Product'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Set inventory, descriptions, pricing in INR, and gallery images
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Master Wireless Headphones"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    SKU / Identifier
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={e => setForm({ ...form, sku: e.target.value })}
                    placeholder="e.g. AUR-9402"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={e => setForm({ ...form, tagline: e.target.value })}
                  placeholder="e.g. Precision Acoustic Engineering"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed material description, design highlights, specifications..."
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.price}
                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Original Price (Compare At)
                  </label>
                  <input
                    type="number"
                    value={form.compareAtPrice || ''}
                    onChange={e => setForm({ ...form, compareAtPrice: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Optional strike-through"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: Math.max(0, Number(e.target.value)) })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Category *
                </label>
                <select
                  value={form.categorySlug}
                  onChange={e => handleCategorySelect(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Product Images (URLs)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-3 py-2 bg-zinc-900 text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                  >
                    Add Image
                  </button>
                </div>

                {/* Previews */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {form.images?.map((url, idx) => (
                    <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-zinc-200">
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-0 bg-zinc-950/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-zinc-100 grid grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    checked={form.isActive !== false}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded text-zinc-950 focus:ring-zinc-950"
                  />
                  <span>Publish (Active)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    checked={form.isFeatured || false}
                    onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                    className="rounded text-zinc-950 focus:ring-zinc-950"
                  />
                  <span>Featured Collection</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    checked={form.isNewArrival || false}
                    onChange={e => setForm({ ...form, isNewArrival: e.target.checked })}
                    className="rounded text-zinc-950 focus:ring-zinc-950"
                  />
                  <span>New Arrival Badge</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-300 text-zinc-700 font-semibold rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
