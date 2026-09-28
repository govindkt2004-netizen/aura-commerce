import React, { useState } from 'react';
import {
  Search,
  Users,
  Shield,
  ShieldAlert,
  ShoppingBag,
  Eye,
  CheckCircle,
  XCircle,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { Order } from '../../types';
import { formatINR } from '../../utils/currency';

interface AdminCustomersTabProps {
  customers: {
    user: any;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: string;
  }[];
  orders: Order[];
  onToggleCustomerStatus: (userId: string, currentStatus: string) => Promise<void>;
}

export const AdminCustomersTab: React.FC<AdminCustomersTabProps> = ({
  customers,
  orders,
  onToggleCustomerStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<{
    user: any;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: string;
  } | null>(null);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.user.phone && c.user.phone.includes(searchTerm));

    const userStatus = c.user.status || 'active';
    const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const customerOrders = selectedCustomer
    ? orders.filter(o => o.customerEmail.toLowerCase() === selectedCustomer.user.email.toLowerCase())
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
            Customer Directory & Accounts
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Monitor client lifetime spend in INR, purchase frequency, and manage account authorization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-700 shadow-xs">
            Registered Customers: {customers.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-3 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 cursor-pointer"
          >
            <option value="all">All Customer Status</option>
            <option value="active">Active Accounts</option>
            <option value="suspended">Suspended Accounts</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100">
                <th className="py-3 px-5">Customer Profile</th>
                <th className="py-3 px-5">Role</th>
                <th className="py-3 px-5">Orders</th>
                <th className="py-3 px-5">Total Spend (INR)</th>
                <th className="py-3 px-5">Last Order</th>
                <th className="py-3 px-5">Account Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    No customer profiles found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust, idx) => {
                  const status = cust.user.status || 'active';
                  return (
                    <tr key={cust.user.id || idx} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {cust.user.name ? cust.user.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900">{cust.user.name}</div>
                            <div className="text-[11px] text-zinc-400">{cust.user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          cust.user.role === 'admin'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {cust.user.role === 'admin' ? <Shield className="w-3 h-3" /> : null}
                          {cust.user.role || 'customer'}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 font-semibold text-zinc-800">
                        {cust.totalOrders} order(s)
                      </td>

                      <td className="py-3.5 px-5 font-bold text-zinc-950">
                        {formatINR(cust.totalSpent)}
                      </td>

                      <td className="py-3.5 px-5 text-zinc-500">
                        {cust.lastOrderDate ? (
                          new Date(cust.lastOrderDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        ) : (
                          <span className="text-zinc-400 text-[11px]">No orders yet</span>
                        )}
                      </td>

                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {status}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedCustomer(cust)}
                            className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                            title="Inspect customer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {cust.user.role !== 'admin' && (
                            <button
                              onClick={() => onToggleCustomerStatus(cust.user.id, status)}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                status === 'active'
                                  ? 'text-zinc-400 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={status === 'active' ? 'Suspend customer account' : 'Reactivate account'}
                            >
                              {status === 'active' ? (
                                <ShieldAlert className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-zinc-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-950 text-white font-bold flex items-center justify-center text-sm">
                  {selectedCustomer.user.name ? selectedCustomer.user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">
                    {selectedCustomer.user.name}
                  </h3>
                  <div className="text-xs text-zinc-400">
                    ID: {selectedCustomer.user.id}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5 text-xs max-h-[70vh] overflow-y-auto pr-1">
              {/* Contact Information */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-2">
                <div className="flex items-center gap-2 text-zinc-700">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  <span>{selectedCustomer.user.email}</span>
                </div>
                {selectedCustomer.user.phone && (
                  <div className="flex items-center gap-2 text-zinc-700">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    <span>{selectedCustomer.user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-zinc-700">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span>Member since: {new Date(selectedCustomer.user.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Financial & Order Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-zinc-200 rounded-xl">
                  <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                    Lifetime Spend
                  </span>
                  <div className="text-lg font-bold text-zinc-950 mt-1">
                    {formatINR(selectedCustomer.totalSpent)}
                  </div>
                </div>
                <div className="p-3 bg-white border border-zinc-200 rounded-xl">
                  <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                    Orders Placed
                  </span>
                  <div className="text-lg font-bold text-zinc-950 mt-1">
                    {selectedCustomer.totalOrders}
                  </div>
                </div>
              </div>

              {/* Past Orders */}
              <div>
                <h4 className="font-semibold text-zinc-800 uppercase tracking-wider text-[11px] mb-2">
                  Customer Order History ({customerOrders.length})
                </h4>
                {customerOrders.length === 0 ? (
                  <div className="py-6 text-center text-zinc-400 border border-zinc-100 rounded-xl">
                    No order records found for this customer.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden">
                    {customerOrders.map(order => (
                      <div key={order.id} className="p-3 flex items-center justify-between text-xs bg-white">
                        <div>
                          <div className="font-mono font-bold text-zinc-900">
                            {order.id}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {new Date(order.createdAt).toLocaleDateString('en-IN')} · {order.items.length} items
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-zinc-950">{formatINR(order.total)}</div>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold capitalize bg-zinc-100 text-zinc-700">
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
