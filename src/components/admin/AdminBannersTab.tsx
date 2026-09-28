import React, { useState } from 'react';
import {
  Plus,
  Image as ImageIcon,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  X,
  Sparkles
} from 'lucide-react';
import { Banner } from '../../types';

interface AdminBannersTabProps {
  banners: Banner[];
  onCreateBanner: (data: Partial<Banner>) => Promise<void>;
  onUpdateBanner: (id: string, data: Partial<Banner>) => Promise<void>;
  onDeleteBanner: (id: string) => Promise<void>;
}

export const AdminBannersTab: React.FC<AdminBannersTabProps> = ({
  banners,
  onCreateBanner,
  onUpdateBanner,
  onDeleteBanner
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    badge: 'NEW COLLECTION',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    link: '/shop',
    ctaText: 'Explore Archive',
    position: 'hero',
    isActive: true,
    displayOrder: banners.length + 1
  });

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setForm({
      title: 'Architectural Precision & Luxury Sound',
      subtitle: 'Experience handcrafted audio instruments engineered from solid anodized titanium.',
      badge: 'LIMITED ARCHIVE',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      link: '/shop',
      ctaText: 'Discover Collection',
      position: 'hero',
      isActive: true,
      displayOrder: banners.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Banner) => {
    setEditingBanner(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle,
      badge: b.badge,
      imageUrl: b.imageUrl,
      link: b.link,
      ctaText: b.ctaText,
      position: b.position,
      isActive: b.isActive,
      displayOrder: b.displayOrder ?? 1
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (b: Banner) => {
    try {
      await onUpdateBanner(b.id, { isActive: !b.isActive });
    } catch (err: any) {
      alert(err.message || 'Error updating banner');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.imageUrl) return;
    setIsSaving(true);
    try {
      if (editingBanner) {
        await onUpdateBanner(editingBanner.id, form);
      } else {
        await onCreateBanner(form);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error saving banner');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
            Promotional Banners & Campaigns
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage storefront hero banners, seasonal promotional spotlights, and campaign imagery
          </p>
        </div>
        <button
          id="add-banner-btn"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Storefront Banner
        </button>
      </div>

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-zinc-400 bg-white rounded-xl border border-zinc-200">
            No promotional banners configured.
          </div>
        ) : (
          banners.map(banner => (
            <div
              key={banner.id}
              className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              {/* Banner Visual Preview */}
              <div className="relative h-44 w-full bg-zinc-900 overflow-hidden">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent p-5 flex flex-col justify-end text-white">
                  {banner.badge && (
                    <span className="self-start text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-400 text-zinc-950 rounded mb-1.5 shadow-xs">
                      {banner.badge}
                    </span>
                  )}
                  <h3 className="text-base font-bold leading-tight drop-shadow-xs">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-xs text-zinc-300 line-clamp-1 mt-1 font-normal">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Banner Metadata & Controls */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 font-mono text-[10px] uppercase rounded">
                      {banner.position}
                    </span>
                    <span className="text-zinc-400 text-[11px]">
                      Order: #{banner.displayOrder ?? 1}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                      banner.isActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                    }`}
                  >
                    {banner.isActive ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-zinc-400" />}
                    {banner.isActive ? 'Active on Store' : 'Hidden'}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                  <span className="text-zinc-500 truncate max-w-[220px]">
                    CTA: <strong className="text-zinc-900">{banner.ctaText}</strong> ({banner.link})
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(banner)}
                      className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                      title="Edit banner"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteBanner(banner.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Delete banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <h3 className="text-base font-bold text-zinc-950">
                {editingBanner ? 'Edit Promotional Banner' : 'Create New Banner'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Banner Headline *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Master Audio Instruments"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Sub-headline
                </label>
                <input
                  type="text"
                  value={form.subtitle || ''}
                  onChange={e => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. Hand-assembled in titanium with bespoke drivers"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Badge Pill Text
                  </label>
                  <input
                    type="text"
                    value={form.badge || ''}
                    onChange={e => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g. LIMITED EDITION"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Position Placement
                  </label>
                  <select
                    value={form.position}
                    onChange={e => setForm({ ...form, position: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none cursor-pointer"
                  >
                    <option value="hero">Hero Spotlight</option>
                    <option value="campaign">Collection Ribbon</option>
                    <option value="top_bar">Top Promo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Background Imagery URL *
                </label>
                <input
                  type="url"
                  required
                  value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={form.ctaText || ''}
                    onChange={e => setForm({ ...form, ctaText: e.target.value })}
                    placeholder="e.g. Explore Now"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Target Link URL
                  </label>
                  <input
                    type="text"
                    value={form.link || ''}
                    onChange={e => setForm({ ...form, link: e.target.value })}
                    placeholder="e.g. /shop"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={e => setForm({ ...form, isActive: e.target.checked })}
                      className="rounded text-zinc-950 focus:ring-zinc-950"
                    />
                    <span>Active on Storefront</span>
                  </label>
                </div>
              </div>

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
                  {isSaving ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
