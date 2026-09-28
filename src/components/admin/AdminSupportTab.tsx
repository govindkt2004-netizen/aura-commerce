import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  User,
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCw
} from 'lucide-react';
import { SupportTicket } from '../../types';
import { api } from '../../services/api';

interface AdminSupportTabProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminSupportTab: React.FC<AdminSupportTabProps> = ({ onNotify }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Reply state
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState<string>('in_progress');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminSupportTickets();
      setTickets(res.tickets);
      if (selectedTicket) {
        const updated = res.tickets.find(t => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err: any) {
      onNotify(err.message || 'Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await api.replyAdminSupportTicket(selectedTicket.id, replyMessage, replyStatus);
      setSelectedTicket(res.ticket);
      setReplyMessage('');
      onNotify('Concierge reply sent to patron');
      fetchTickets();
    } catch (err: any) {
      onNotify(err.message || 'Error replying to ticket', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const res = await api.updateAdminSupportTicketStatus(ticketId, newStatus);
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(res.ticket);
      }
      onNotify(`Ticket marked as ${newStatus}`);
      fetchTickets();
    } catch (err: any) {
      onNotify(err.message || 'Error updating status', 'error');
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      (t.orderId && t.orderId.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'open':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'closed':
        return 'bg-zinc-100 text-zinc-600 border-zinc-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-display text-zinc-950 flex items-center gap-2">
            <span>Client Concierge & Support</span>
            <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full font-sans font-medium">
              {tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length} Active
            </span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Resolve patron inquiries, delivery coordination, order returns, and bespoke requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patron, subject, order..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Ticket List (Left 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-xs overflow-hidden flex flex-col">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 pb-3 border-b border-zinc-100">
            Inbox ({filteredTickets.length})
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-400">Loading inquiries...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">No tickets found.</div>
          ) : (
            <div className="divide-y divide-zinc-100 overflow-y-auto max-h-[600px] mt-2">
              {filteredTickets.map(t => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTicket(t);
                      setReplyStatus(t.status === 'open' ? 'in_progress' : t.status);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all flex flex-col gap-2 cursor-pointer ${
                      isSelected ? 'bg-zinc-900 text-white shadow-xs' : 'hover:bg-zinc-50 text-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isSelected ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : getStatusBadge(t.status)
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                      <span className={`text-[11px] ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                        {new Date(t.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs truncate">{t.subject}</h4>
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {t.customerName} ({t.customerEmail})
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className={`capitalize ${isSelected ? 'text-amber-300' : 'text-amber-700 font-medium'}`}>
                        Cat: {t.category}
                      </span>
                      <span className={`uppercase font-mono ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                        {t.priority}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Ticket Conversation Thread (Right 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs flex flex-col justify-between">
          {selectedTicket ? (
            <div className="flex flex-col h-full justify-between">
              {/* Ticket Header & Status Switcher */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">#{selectedTicket.id}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(selectedTicket.status)}`}>
                        {selectedTicket.status.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadge(selectedTicket.priority)}`}>
                        {selectedTicket.priority} Priority
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-zinc-950 mt-1">{selectedTicket.subject}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                      <span>Patron: <strong>{selectedTicket.customerName}</strong> ({selectedTicket.customerEmail})</span>
                      {selectedTicket.orderId && (
                        <span className="bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded text-[11px] font-mono">
                          Order #{selectedTicket.orderId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Status Buttons */}
                  <div className="flex items-center gap-1.5">
                    {selectedTicket.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                    {selectedTicket.status !== 'closed' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')}
                        className="px-3 py-1.5 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Close</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="space-y-4 py-4 max-h-[360px] overflow-y-auto pr-1">
                  {selectedTicket.messages.map((m, idx) => {
                    const isSupport = m.sender === 'support';
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isSupport ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mb-1 px-1">
                          <span className="font-semibold text-zinc-700">{m.senderName}</span>
                          <span>·</span>
                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div
                          className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isSupport
                              ? 'bg-zinc-950 text-white rounded-br-xs'
                              : 'bg-zinc-100 text-zinc-800 rounded-bl-xs'
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-zinc-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-700">Reply as AURA Concierge</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500">Update status to:</span>
                    <select
                      value={replyStatus}
                      onChange={e => setReplyStatus(e.target.value)}
                      className="px-2 py-1 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none"
                    >
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    required
                    rows={3}
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    placeholder="Compose an articulate response to the patron..."
                    className="w-full p-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingReply || !replyMessage.trim()}
                    className="absolute right-2.5 bottom-3.5 px-4 py-1.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {submittingReply ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Dispatch</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-400">
              <LifeBuoy className="w-12 h-12 stroke-1 text-zinc-300 mb-3" />
              <h4 className="font-bold text-sm text-zinc-700">No Ticket Selected</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Select an inquiry from the inbox on the left to review communication history and dispatch solutions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
