import React, { useState, useEffect } from 'react';
import {
  Wifi, WifiOff, MapPin, Bell, Phone, Search, Filter,
  ChevronLeft, ChevronRight, RefreshCw, Loader2,
  X, Send, User
} from 'lucide-react';
import { fetchProviderStatusList } from '../../services/api';

// Helper: format "last seen" time
const formatLastSeen = (date) => {
  if (!date) return 'Never';
  const diff = Math.floor((Date.now() - new Date(date)) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
  return `${Math.floor(diff / 1440)} days ago`;
};

// Avatar component with image support
const UserAvatar = ({ user, size = 'md' }) => {
  const avatarUrl = user?.avatar;
  const name = user?.name || user?.owner || '?';
  const colors = [
    'from-blue-400 to-blue-600', 'from-emerald-400 to-emerald-600',
    'from-purple-400 to-purple-600', 'from-rose-400 to-rose-600',
    'from-amber-400 to-amber-600', 'from-cyan-400 to-cyan-600',
    'from-indigo-400 to-indigo-600', 'from-pink-400 to-pink-600'
  ];
  const colorIndex = name.length % colors.length;
  const gradient = colors[colorIndex];
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl', xl: 'w-24 h-24 text-3xl'
  };
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-md`}
      />
    );
  }
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-lg`}>
      {name[0]?.toUpperCase() || '?'}
    </div>
  );
};

// Notification Modal (unchanged)
const NotificationModal = ({ provider, onClose, onSend }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await onSend(provider.id, message);
      onClose();
    } catch (err) {
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold flex items-center gap-2"><Bell size={18} /> Send to {provider.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
        </div>
        <div className="p-4">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your notification message..." rows={4} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-3 p-4 border-t">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleSend} disabled={sending || !message.trim()} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const AdminProviderStatus = () => {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const itemsPerPage = 10;

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetchProviderStatusList();
      if (res.success) {
        setProviders(res.data.providers);
        setTotalPages(Math.ceil(res.data.providers.length / itemsPerPage));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load provider status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    const interval = setInterval(fetchProviders, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = [...providers];
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => statusFilter === 'online' ? p.online : !p.online);
    }
    setFilteredProviders(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setPage(1);
  }, [providers, searchTerm, statusFilter]);

  const paginatedProviders = filteredProviders.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const onlineCount = providers.filter(p => p.online).length;
  const offlineCount = providers.length - onlineCount;

  const makeCall = (phone) => { window.location.href = `tel:${phone}`; };
  const sendNotification = async (providerId, message) => {
    // TODO: Replace with actual API
    console.log(`Sending to ${providerId}: ${message}`);
    alert(`Notification sent to provider ${providerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Wifi className="text-green-600" size={28} /> Provider Online Status</h1>
        <p className="text-gray-500 text-sm">Real‑time online/offline status and location</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center gap-4"><div className="p-3 bg-blue-100 rounded-lg"><User size={24} className="text-blue-600" /></div><div><p className="text-sm text-gray-500">Total Providers</p><p className="text-2xl font-bold">{providers.length}</p></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center gap-4"><div className="p-3 bg-green-100 rounded-lg"><Wifi size={24} className="text-green-600" /></div><div><p className="text-sm text-gray-500">Online Now</p><p className="text-2xl font-bold text-green-600">{onlineCount}</p></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center gap-4"><div className="p-3 bg-red-100 rounded-lg"><WifiOff size={24} className="text-red-600" /></div><div><p className="text-sm text-gray-500">Offline</p><p className="text-2xl font-bold text-red-600">{offlineCount}</p></div></div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name, owner, email, phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-gray-500" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Providers</option>
            <option value="online">Online Only</option>
            <option value="offline">Offline Only</option>
          </select>
          <button onClick={fetchProviders} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"><RefreshCw size={16} /></button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Provider</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Current Location</th><th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th></tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /><p className="text-gray-500 mt-2">Loading providers...</p></td></tr>
              ) : paginatedProviders.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-gray-400">No providers found.</td></tr>
              ) : (
                paginatedProviders.map(provider => (
                  <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={{ avatar: provider.avatar, name: provider.name }} size="md" />
                        <div><p className="font-semibold text-gray-900">{provider.name}</p><p className="text-xs text-gray-500">{provider.owner}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><p className="text-sm text-gray-800">{provider.email}</p><p className="text-xs text-gray-500">{provider.phone}</p></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {provider.online ? (
                          <><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span><span className="text-green-600 font-medium text-sm">Online</span><span className="text-xs text-gray-400">({formatLastSeen(provider.lastSeen)})</span></>
                        ) : (
                          <><span className="w-2 h-2 bg-gray-400 rounded-full"></span><span className="text-gray-500 text-sm">Offline</span><span className="text-xs text-gray-400">({formatLastSeen(provider.lastSeen)})</span></>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {provider.location ? (
                        <div className="flex items-center gap-2 text-sm"><MapPin size={14} className="text-blue-500" /><span className="text-gray-600 truncate max-w-xs">{provider.location}</span></div>
                      ) : <span className="text-gray-400 text-sm italic">Location not shared</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => makeCall(provider.phone)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Call Provider"><Phone size={16} /></button>
                        <button onClick={() => { setSelectedProvider(provider); setShowNotificationModal(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Send Notification"><Bell size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-3 border-t">
            <p className="text-sm text-gray-500">Showing {((page-1)*itemsPerPage)+1} to {Math.min(page*itemsPerPage, filteredProviders.length)} of {filteredProviders.length}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p=>p-1)} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronLeft size={16} /></button>
              <span className="px-3 py-1 text-sm">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p=>p+1)} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {showNotificationModal && selectedProvider && (
        <NotificationModal provider={selectedProvider} onClose={() => setShowNotificationModal(false)} onSend={sendNotification} />
      )}
    </div>
  );
};

export default AdminProviderStatus;