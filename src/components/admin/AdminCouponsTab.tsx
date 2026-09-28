import React, { useState } from 'react';
import {
  Plus,
  Tag,
  Edit2,
  Trash2,
  Check,
  X,
  Calendar,
  Percent,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Coupon } from '../../types';
import { formatINR } from '../../utils/currency';

interface AdminCouponsTabProps {
  coupons: Coupon[];
  onCreateCoupon: (data: Partial<Coupon>) => Promise<void>;
  onUpdateCoupon: (id: string, data: Partial<Coupon>) => Promise<void>;
  onDeleteCoupon: (id: string) => Promise<void>;
}

export const AdminCouponsTab: React.FC<AdminCouponsTabProps> = ({
  coupons,
  onCreateCoupon,
  onUpdateCoupon,
  onDeleteCoupon
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 2999,
    maxDiscountAmount: 1500,
    isActive: true,
    usageLimit: 100,
    description: ''
  });

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setForm({
      code: 'FESTIVE' + Math.floor(10 + Math.random() * 90),
      discountType: 'percentage',
      discountValue: 15,
      minOrderAmount: 2999,
      maxDiscountAmount: 1500,
      isActive: true,
      usageLimit: 100,
      description: 'Exclusive seasonal discount for atelier patrons'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount,
      maxDiscountAmount: c.maxDiscountAmount,
      expiryDate: c.expiryDate,
      usageLimit: c.usageLimit,
      isActive: c.isActive,
      description: c.description
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (c: Coupon) => {
    try {
      await onUpdateCoupon(c.id, { isActive: !c.isActive });
    } catch (err: any) {
      alert(err.message || 'Error updating coupon');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) return;
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim()
      };
      if (editingCoupon) {
        await onUpdateCoupon(editingCoupon.id, payload);
      } else {
        await onCreateCoupon(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error saving coupon');
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
            Discount & Promotional Coupon Engine
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure percentage and fixed INR checkout voucher codes, usage caps, and validity windows
          </p>
        </div>
        <button
          id="add-coupon-btn"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100">
                <th className="py-3 px-5">Coupon Code</th>
                <th className="py-3 px-5">Discount Offer</th>
                <th className="py-3 px-5">Min Spend</th>
                <th className="py-3 px-5">Max Cap</th>
                <th className="py-3 px-5">Redemptions</th>
                <th className="py-3 px-5">Expiry</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    No promo coupons created yet.
                  </td>
                </tr>
              ) : (
                coupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-950 px-2.5 py-1 bg-zinc-100 border border-zinc-300 rounded text-xs tracking-wider">
                          {coupon.code}
                        </span>
                      </div>
                      {coupon.description && (
                        <div className="text-[11px] text-zinc-400 mt-1">{coupon.description}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-5 font-bold text-zinc-900">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% OFF`
                        : `${formatINR(coupon.discountValue)} OFF`}
                    </td>

                    <td className="py-3.5 px-5 text-zinc-600">
                      {coupon.minOrderAmount ? formatINR(coupon.minOrderAmount) : 'None'}
                    </td>

                    <td className="py-3.5 px-5 text-zinc-600">
                      {coupon.maxDiscountAmount ? formatINR(coupon.maxDiscountAmount) : 'No limit'}
                    </td>

                    <td className="py-3.5 px-5 text-zinc-600">
                      <span className="font-semibold text-zinc-900">{coupon.usageCount}</span>
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' (Unlimited)'}
                    </td>

                    <td className="py-3.5 px-5 text-zinc-500">
                      {coupon.expiryDate ? (
                        new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      ) : (
                        <span className="text-zinc-400">Never expires</span>
                      )}
                    </td>

                    <td className="py-3.5 px-5">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                          coupon.isActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200'
                        }`}
                      >
                        {coupon.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(coupon)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                          title="Edit coupon"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCoupon(coupon.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete coupon"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <h3 className="text-base font-bold text-zinc-950">
                {editingCoupon ? 'Edit Promo Coupon' : 'Create New Promo Coupon'}
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
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. WELCOME15"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs uppercase font-mono font-bold tracking-wider focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={form.discountType}
                    onChange={e => setForm({ ...form, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.discountValue}
                    onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Min Order Spend (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.minOrderAmount || ''}
                    onChange={e => setForm({ ...form, minOrderAmount: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="e.g. 2999"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxDiscountAmount || ''}
                    onChange={e => setForm({ ...form, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="e.g. 1500"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate ? form.expiryDate.split('T')[0] : ''}
                    onChange={e => setForm({ ...form, expiryDate: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Usage Limit (Max Uses)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.usageLimit || ''}
                    onChange={e => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Description / Marketing Note
                </label>
                <input
                  type="text"
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Welcome coupon for new members"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded text-zinc-950 focus:ring-zinc-950"
                  />
                  <span>Enable Coupon Immediately</span>
                </label>
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
                  {isSaving ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
