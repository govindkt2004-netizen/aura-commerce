import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Globe, Sparkles, Search, Check, X, ShieldAlert } from 'lucide-react';
import { Brand } from '../../types';
import { api } from '../../services/api';

interface AdminBrandsTabProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminBrandsTab: React.FC<AdminBrandsTabProps> = ({ onNotify }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState('');
  const [website, setWebsite] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminBrands();
      setBrands(res.brands);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load brands', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openCreateModal = () => {
    setEditingBrand(null);
    setName('');
    setSlug('');
    setLogo('');
    setDescription('');
    setOrigin('');
    setWebsite('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setSlug(brand.slug);
    setLogo(brand.logo || '');
    setDescription(brand.description || '');
    setOrigin(brand.origin || '');
    setWebsite(brand.website || '');
    setIsActive(brand.isActive);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const payload: Partial<Brand> = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        logo: logo.trim() || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80',
        description: description.trim(),
        origin: origin.trim(),
        website: website.trim(),
        isActive
      };

      if (editingBrand) {
        await api.updateAdminBrand(editingBrand.id, payload);
        onNotify(`Brand "${name}" updated successfully`);
      } else {
        await api.createAdminBrand(payload);
        onNotify(`Brand "${name}" created successfully`);
      }

      setModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      onNotify(err.message || 'Error saving brand', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, brandName: string) => {
    if (!confirm(`Are you sure you want to remove brand "${brandName}"?`)) return;
    try {
      await api.deleteAdminBrand(id);
      onNotify(`Brand "${brandName}" removed`);
      fetchBrands();
    } catch (err: any) {
      onNotify(err.message || 'Error deleting brand', 'error');
    }
  };

  const filteredBrands = brands.filter(
    b =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.origin && b.origin.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-display text-zinc-950 flex items-center gap-2">
            <span>Artisanal Brands & Maisons</span>
            <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full font-sans font-medium">
              {brands.length} Total
            </span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Manage partner ateliers, manufacturing provenance, and brand landing pages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search brands or origin..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 w-60"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand</span>
          </button>
        </div>
      </div>

      {/* Brands Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-400">Loading ateliers...</div>
      ) : filteredBrands.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-500 text-xs">
          No brands matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrands.map(b => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={b.logo || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=100&q=80'}
                      alt={b.name}
                      className="w-12 h-12 rounded-xl object-cover border border-zinc-100 bg-zinc-50"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-zinc-950">{b.name}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                        <Globe className="w-3 h-3 text-zinc-400" />
                        <span>{b.origin || 'International'}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      b.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {b.isActive ? 'Active' : 'Archived'}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 mt-3 line-clamp-2 leading-relaxed">
                  {b.description || 'Artisanal atelier focused on uncompromising craftsmanship and design.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400">/{b.slug}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit brand"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id, b.name)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete brand"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Brand Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <h3 className="font-bold text-base text-zinc-950">
                {editingBrand ? 'Edit Atelier Brand' : 'Create Atelier Brand'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-950 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (!editingBrand) {
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                    }
                  }}
                  placeholder="e.g. Master & Dynamic"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="master-dynamic"
                    className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                    Origin Country / City
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                    placeholder="New York, USA"
                    className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Logo Image URL
                </label>
                <input
                  type="url"
                  value={logo}
                  onChange={e => setLogo(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Brand Overview Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief heritage story or acoustic philosophy..."
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="active-toggle"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                />
                <label htmlFor="active-toggle" className="text-xs text-zinc-700">
                  Visible in public brand filters and catalogs
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingBrand ? 'Save Changes' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
