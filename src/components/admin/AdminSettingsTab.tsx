import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  DollarSign,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  Truck,
  UserPlus,
  Lock
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { formatINR } from '../../utils/currency';
import { api } from '../../services/api';

interface AdminSettingsTabProps {
  settings: SiteSettings | null;
  onUpdateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [formData, setFormData] = useState<SiteSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState<'general' | 'commerce' | 'policies'>('general');
  const [adminForm, setAdminForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [adminCreationState, setAdminCreationState] = useState<{ loading: boolean; error: string | null; success: string | null }>({ loading: false, error: null, success: null });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  if (!formData) {
    return (
      <div className="py-12 text-center text-zinc-400">
        Loading site business settings...
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
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
            Storefront & Business Settings
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure Indian Rupee currency (₹), GST tax percentages, shipping thresholds, and official store policies
          </p>
        </div>
        <button
          id="save-settings-btn"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving Configurations...' : 'Save Settings'}
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Business settings updated successfully. Currency, tax calculations, and store contact info are synchronized.</span>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-600" />
              Create Secure Admin Account
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1">Create a new executive account with a strong password and admin role enforcement.</p>
          </div>
        </div>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setAdminCreationState({ loading: true, error: null, success: null });
            try {
              await api.createAdminAccount(adminForm);
              setAdminForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
              setAdminCreationState({ loading: false, error: null, success: 'New admin account created successfully and secured.' });
            } catch (err: any) {
              setAdminCreationState({ loading: false, error: err.message || 'Failed to create admin account', success: null });
            }
          }}
        >
          <div>
            <label className="block text-[11px] text-zinc-600 mb-1">Full name</label>
            <input value={adminForm.name} onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs" placeholder="Ava Stone" required />
          </div>
          <div>
            <label className="block text-[11px] text-zinc-600 mb-1">Email</label>
            <input type="email" value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs" placeholder="ava@aura.store" required />
          </div>
          <div>
            <label className="block text-[11px] text-zinc-600 mb-1">Phone</label>
            <input value={adminForm.phone} onChange={e => setAdminForm({ ...adminForm, phone: e.target.value })} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs" placeholder="+91 98765 43210" />
          </div>
          <div></div>
          <div>
            <label className="block text-[11px] text-zinc-600 mb-1">Password</label>
            <input type="password" value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs" placeholder="Strong password" required />
          </div>
          <div>
            <label className="block text-[11px] text-zinc-600 mb-1">Confirm password</label>
            <input type="password" value={adminForm.confirmPassword} onChange={e => setAdminForm({ ...adminForm, confirmPassword: e.target.value })} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs" placeholder="Repeat password" required />
          </div>

          <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Minimum 8 chars with uppercase, lowercase, number, and symbol.
            </div>
            <button type="submit" disabled={adminCreationState.loading} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white text-[11px] font-semibold rounded-lg disabled:opacity-50">
              {adminCreationState.loading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>

        {adminCreationState.error && <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-[11px] px-3 py-2">{adminCreationState.error}</div>}
        {adminCreationState.success && <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] px-3 py-2">{adminCreationState.success}</div>}
      </div>

      {/* Sub-section Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubSection('general')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubSection === 'general'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          General & Brand Identity
        </button>
        <button
          type="button"
          onClick={() => setActiveSubSection('commerce')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubSection === 'commerce'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Commerce, Currency (INR ₹) & Shipping
        </button>
        <button
          type="button"
          onClick={() => setActiveSubSection('policies')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubSection === 'policies'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Legal & Store Policies
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Brand Identity */}
        {activeSubSection === 'general' && (
          <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-950 pb-2 border-b border-zinc-100">
              Brand Identity & Concierge Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-zinc-700 text-xs mb-1">
                  Storefront Name
                </label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 text-xs mb-1">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 text-xs mb-1">
                  Support & Concierge Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 text-xs mb-1">
                  Concierge Phone Number
                </label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-zinc-700 text-xs mb-1">
                  Atelier Physical Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                Social Media Profiles
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-1">Instagram URL</label>
                  <input
                    type="url"
                    value={formData.socialLinks?.instagram || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                      })
                    }
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-1.5 border border-zinc-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-1">Twitter / X URL</label>
                  <input
                    type="url"
                    value={formData.socialLinks?.twitter || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                      })
                    }
                    placeholder="https://x.com/..."
                    className="w-full px-3 py-1.5 border border-zinc-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-1">Facebook URL</label>
                  <input
                    type="url"
                    value={formData.socialLinks?.facebook || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                      })
                    }
                    placeholder="https://facebook.com/..."
                    className="w-full px-3 py-1.5 border border-zinc-300 rounded text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Commerce, Currency (INR ₹) & Shipping */}
        {activeSubSection === 'commerce' && (
          <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-950 pb-2 border-b border-zinc-100">
              Currency, Taxation & Shipping Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                <span className="font-semibold text-xs text-zinc-800">
                  National Currency (Indian Rupees)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Currency Code
                    </label>
                    <input
                      type="text"
                      value={formData.currency}
                      onChange={e => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={formData.currencySymbol}
                      onChange={e => setFormData({ ...formData, currencySymbol: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-base"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500">
                  All customer catalog items, cart subtotals, invoices, and checkout totals are formatted as ₹ INR.
                </p>
              </div>

              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                <span className="font-semibold text-xs text-zinc-800">
                  Taxation & Inventory Safeguards
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      GST Rate (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.taxPercent}
                      onChange={e => setFormData({ ...formData, taxPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Low Stock Alert Qty
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.lowStockThreshold}
                      onChange={e => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500">
                  GST is applied to order subtotal during checkout calculation. Low stock badge triggers when quantity falls to or below this amount.
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
              <span className="font-semibold text-xs text-zinc-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-zinc-600" />
                Delivery & Express Shipping Thresholds
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Complimentary Free Shipping Threshold (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.freeShippingThreshold}
                    onChange={e => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-bold"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Orders at or above {formatINR(formData.freeShippingThreshold)} receive free insured express delivery.
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Standard Flat Shipping Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.shippingFee}
                    onChange={e => setFormData({ ...formData, shippingFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-bold"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Flat delivery charge applied to orders below free shipping threshold.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legal & Store Policies */}
        {activeSubSection === 'policies' && (
          <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-950 pb-2 border-b border-zinc-100">
              Customer Trust, Guarantees & Legal Policies
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-zinc-700 text-xs mb-1">
                  Return & Exchange Policy
                </label>
                <textarea
                  rows={4}
                  value={formData.policies?.returnPolicy || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      policies: { ...formData.policies, returnPolicy: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 text-xs mb-1">
                  Shipping & Dispatch Policy
                </label>
                <textarea
                  rows={4}
                  value={formData.policies?.shippingPolicy || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      policies: { ...formData.policies, shippingPolicy: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 text-xs mb-1">
                  Privacy Policy Overview
                </label>
                <textarea
                  rows={4}
                  value={formData.policies?.privacyPolicy || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      policies: { ...formData.policies, privacyPolicy: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 text-xs mb-1">
                  Terms of Service & Atelier Charter
                </label>
                <textarea
                  rows={4}
                  value={formData.policies?.termsOfService || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      policies: { ...formData.policies, termsOfService: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving Configurations...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
