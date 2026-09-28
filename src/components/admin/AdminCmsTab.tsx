import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  MessageSquare,
  Shield,
  Truck,
  RotateCcw,
  Clock,
  ExternalLink
} from 'lucide-react';
import { HomepageContent } from '../../types';

interface AdminCmsTabProps {
  content: HomepageContent | null;
  onUpdateContent: (content: Partial<HomepageContent>) => Promise<void>;
}

export const AdminCmsTab: React.FC<AdminCmsTabProps> = ({
  content,
  onUpdateContent
}) => {
  const [formData, setFormData] = useState<HomepageContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (content) {
      setFormData(content);
    }
  }, [content]);

  if (!formData) {
    return (
      <div className="py-12 text-center text-zinc-400">
        Loading storefront content configuration...
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateContent(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save storefront CMS changes');
    } finally {
      setIsSaving(false);
    }
  };

  const updateValueProp = (index: number, field: string, value: string) => {
    const updated = [...(formData.valueProps || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, valueProps: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
            Homepage & Storefront Content CMS
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Customize hero banners, marketing headlines, top announcement bar, and value proposition cards
          </p>
        </div>
        <button
          id="save-cms-btn"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Publishing Updates...' : 'Publish to Live Store'}
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Live Storefront content has been updated successfully! Changes are immediately visible to shoppers.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Announcement Bar Section */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Top Announcement Ribbon
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Displays at the very top of all customer-facing storefront pages
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-800">
              <input
                type="checkbox"
                checked={Boolean(formData.announcementBar?.enabled)}
                onChange={e =>
                  setFormData({
                    ...formData,
                    announcementBar: {
                      enabled: e.target.checked,
                      text: formData.announcementBar?.text || '',
                      link: formData.announcementBar?.link || ''
                    }
                  })
                }
                className="rounded text-zinc-950 focus:ring-zinc-950"
              />
              <span>Enable Announcement Bar</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-700 text-xs mb-1">
                Announcement Message Text
              </label>
              <input
                type="text"
                value={formData.announcementBar?.text || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    announcementBar: {
                      enabled: Boolean(formData.announcementBar?.enabled),
                      text: e.target.value,
                      link: formData.announcementBar?.link || ''
                    }
                  })
                }
                placeholder="e.g. Complimentary insured express shipping across India on orders over ₹4,999..."
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 text-xs mb-1">
                Optional Target Link
              </label>
              <input
                type="text"
                value={formData.announcementBar?.link || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    announcementBar: {
                      enabled: Boolean(formData.announcementBar?.enabled),
                      text: formData.announcementBar?.text || '',
                      link: e.target.value
                    }
                  })
                }
                placeholder="e.g. /shop"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-zinc-100">
            <h3 className="text-sm font-bold text-zinc-950">
              Storefront Hero Showcase
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              The primary landing screen headline, visual storytelling, and action buttons
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-700 text-xs mb-1">
                Hero Headline
              </label>
              <input
                type="text"
                value={formData.heroHeadline}
                onChange={e => setFormData({ ...formData, heroHeadline: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none font-semibold text-zinc-950"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 text-xs mb-1">
                Badge / Pill Label
              </label>
              <input
                type="text"
                value={formData.heroBadge || ''}
                onChange={e => setFormData({ ...formData, heroBadge: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none uppercase font-semibold text-amber-800 bg-amber-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 text-xs mb-1">
              Sub-headline / Paragraph
            </label>
            <textarea
              rows={2}
              value={formData.heroSubheadline}
              onChange={e => setFormData({ ...formData, heroSubheadline: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 text-xs mb-1">
              Hero Background Visual (Image URL)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                value={formData.heroImageUrl}
                onChange={e => setFormData({ ...formData, heroImageUrl: e.target.value })}
                className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
              />
              {formData.heroImageUrl && (
                <img
                  src={formData.heroImageUrl}
                  alt="Hero Preview"
                  className="w-12 h-8 rounded object-cover border border-zinc-200"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-2">
              <span className="font-semibold text-xs text-zinc-800">Primary CTA Action</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Button text"
                  value={formData.heroPrimaryCtaText}
                  onChange={e => setFormData({ ...formData, heroPrimaryCtaText: e.target.value })}
                  className="px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="Link"
                  value={formData.heroPrimaryCtaLink}
                  onChange={e => setFormData({ ...formData, heroPrimaryCtaLink: e.target.value })}
                  className="px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-2">
              <span className="font-semibold text-xs text-zinc-800">Secondary CTA Action</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Button text"
                  value={formData.heroSecondaryCtaText}
                  onChange={e => setFormData({ ...formData, heroSecondaryCtaText: e.target.value })}
                  className="px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="Link"
                  value={formData.heroSecondaryCtaLink}
                  onChange={e => setFormData({ ...formData, heroSecondaryCtaLink: e.target.value })}
                  className="px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Value Propositions Ribbon */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-zinc-100">
            <h3 className="text-sm font-bold text-zinc-950">
              Value Propositions & Assurance Pillars
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              The 4 key trust assurances displayed in the customer storefront footer and banners
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {formData.valueProps?.map((prop, idx) => (
              <div key={idx} className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">
                  Pillar #{idx + 1}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={prop.title}
                    onChange={e => updateValueProp(idx, 'title', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-xs font-semibold text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={prop.description}
                    onChange={e => updateValueProp(idx, 'description', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-[11px] text-zinc-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Publishing Live Changes...' : 'Save & Publish Storefront CMS'}
          </button>
        </div>
      </form>
    </div>
  );
};
