import React, { useState } from 'react';
import {
  Shield,
  Clock,
  Search,
  User,
  Filter,
  Activity,
  FileText,
  Tag,
  Package,
  ShoppingBag,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import { AdminActivityLog } from '../../types';

interface AdminAuditLogTabProps {
  logs: AdminActivityLog[];
}

export const AdminAuditLogTab: React.FC<AdminAuditLogTabProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [targetFilter, setTargetFilter] = useState('all');

  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.targetId && l.targetId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTarget = targetFilter === 'all' || l.targetType === targetFilter;

    return matchesSearch && matchesTarget;
  });

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="w-3.5 h-3.5 text-blue-600" />;
      case 'order':
        return <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />;
      case 'coupon':
        return <Tag className="w-3.5 h-3.5 text-emerald-600" />;
      case 'banner':
        return <ImageIcon className="w-3.5 h-3.5 text-amber-600" />;
      case 'settings':
      case 'cms':
        return <Settings className="w-3.5 h-3.5 text-zinc-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-zinc-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
            Security & Activity Audit Trail
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Immutable log of administrative operations, pricing updates, status transitions, and config changes
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-700 shadow-xs">
          Recorded Events: {logs.length}
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs by action, admin email, or target ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={targetFilter}
            onChange={e => setTargetFilter(e.target.value)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-3 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 cursor-pointer"
          >
            <option value="all">All Event Types</option>
            <option value="product">Product Catalog</option>
            <option value="order">Order Fulfillment</option>
            <option value="customer">Customer Accounts</option>
            <option value="coupon">Coupons & Discounts</option>
            <option value="banner">Promotional Banners</option>
            <option value="cms">Storefront CMS</option>
            <option value="settings">Site Settings</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100">
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Operator</th>
                <th className="py-3 px-5">Operation</th>
                <th className="py-3 px-5">Target Entity</th>
                <th className="py-3 px-5">Change Summary / Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    No activity records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-5 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}{' '}
                      <span className="text-zinc-400">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="font-semibold text-zinc-900">{log.adminName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{log.adminEmail}</div>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-zinc-950 bg-zinc-100 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-zinc-700 capitalize">
                        {getTargetIcon(log.targetType)}
                        <span>{log.targetType}</span>
                      </div>
                      {log.targetId && (
                        <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                          ID: {log.targetId}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-zinc-600 max-w-md">
                      <div className="line-clamp-2 leading-relaxed text-[11px]">
                        {log.details || 'Administrative record logged'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
