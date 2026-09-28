import React, { useState } from 'react';
import { Download, FileSpreadsheet, DollarSign, Package, Users, ShoppingCart, RotateCw, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface AdminReportsTabProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminReportsTab: React.FC<AdminReportsTabProps> = ({ onNotify }) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (type: 'sales' | 'orders' | 'products' | 'customers', label: string) => {
    setDownloading(type);
    try {
      const blob = await api.exportAdminReports(type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aura-${type}-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      onNotify(`${label} report exported successfully`);
    } catch (err: any) {
      onNotify(err.message || 'Failed to download report', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const reportCards = [
    {
      type: 'sales' as const,
      title: 'Sales & Revenue Ledger',
      description: 'Comprehensive financial breakdown including order IDs, transaction timestamps, items count, subtotals, applied coupon discounts, GST taxation, and net revenues.',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      type: 'orders' as const,
      title: 'Fulfillment & Logistics Orders',
      description: 'Detailed customer shipping records, selected delivery tiers, courier tracking numbers, dispatch dates, delivery statuses, and returns ledger.',
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      type: 'products' as const,
      title: 'Product Catalog & Inventory Health',
      description: 'Complete inventory ledger with SKU identifiers, titles, brand provenance, current stock levels, base prices, active sale pricing, and ratings.',
      icon: Package,
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      type: 'customers' as const,
      title: 'Patron Accounts & Cohort Analysis',
      description: 'Directory of registered clients, account types, contact numbers, order acquisition totals, total lifetime spend, and stored delivery coordinates.',
      icon: Users,
      color: 'bg-purple-50 text-purple-800 border-purple-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs">
        <h2 className="text-xl font-bold font-display text-zinc-950 flex items-center gap-2">
          <span>Enterprise Intelligence & CSV Exports</span>
        </h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
          Generate production-ready comma-separated value (CSV) reports for accounting, supply chain logistics, tax audits, and ERP integration.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map(card => {
          const Icon = card.icon;
          const isDownloading = downloading === card.type;

          return (
            <div
              key={card.type}
              className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl border ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-950">{card.title}</h3>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                      Format: RFC-4180 CSV
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">UTF-8 Encoded</span>
                <button
                  onClick={() => handleDownload(card.type, card.title)}
                  disabled={isDownloading}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isDownloading ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isDownloading ? 'Exporting...' : 'Download CSV'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
