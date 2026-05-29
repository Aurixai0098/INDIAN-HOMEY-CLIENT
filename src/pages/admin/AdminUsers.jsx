// src/pages/admin/AdminAllUsers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Filter, ChevronLeft, ChevronRight, Eye, Phone, Bell, Edit2,
  MoreVertical, CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw,
  Wallet, Calendar, ShoppingBag, Star, TrendingUp, Clock, MessageCircle,
  Send, X, Save, User, Mail, Smartphone, UserCheck, UserX, Shield,
  Activity, BookOpen, DollarSign, Award, Mail as MailIcon
} from 'lucide-react';
import {
  fetchAdminUsers,
  updateAdminUserStatus,
  sendPushNotification,
  sendSmsAlert,
  fetchAdminUserDetails,
  updateUserByAdmin,
  getUserStats
} from '../../services/api';

const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');
const formatCurrency = (amount) => amount ? `₹${amount.toLocaleString('en-IN')}` : '₹0';

// Notification Modal
const NotificationModal = ({ user, onClose, onSend }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('push');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      if (type === 'push') {
        await sendPushNotification('specific_user', user._id, message);
      } else {
        await sendSmsAlert('specific_user', user._id, message);
      }
      onSend();
      onClose();
    } catch (err) {
      alert('Failed to send: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold">Send to {user.fullName}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Channel</label>
          <div className="flex gap-2">
            <button onClick={() => setType('push')} className={`px-3 py-1 rounded-lg text-sm ${type === 'push' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Push</button>
            <button onClick={() => setType('sms')} className={`px-3 py-1 rounded-lg text-sm ${type === 'sms' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>SMS</button>
          </div>
        </div>
        <textarea rows={3} className="w-full border rounded-lg p-2" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type message..." />
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
          <button onClick={handleSend} disabled={sending || !message} className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">
            {sending ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit User Modal
const EditUserModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First and last name are required');
      return;
    }
    setSaving(true);
    try {
      await onSave(user._id, form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold">Edit User</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        {error && <div className="mb-3 p-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm">First Name</label>
              <input type="text" className="w-full border rounded p-1" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
            </div>
            <div>
              <label className="text-sm">Last Name</label>
              <input type="text" className="w-full border rounded p-1" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-sm">Phone</label>
            <input type="tel" className="w-full border rounded p-1" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div>
            <label className="text-sm">Email</label>
            <input type="email" className="w-full border rounded p-1 bg-gray-100" value={form.email} disabled />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

// User Detail Drawer
const UserDetailDrawer = ({ user, onClose, onUpdate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await getUserStats(user._id);
        if (res.success) setStats(res.data);
        else setStats(null);
      } catch (err) {
        console.error('Stats error:', err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (!user) return null;

  const handleCall = () => {
    if (user.phone) window.location.href = `tel:${user.phone}`;
  };
  const handleWhatsApp = () => {
    if (user.phone) window.open(`https://wa.me/${user.phone.replace(/\D/g, '')}`, '_blank');
  };
  const handleEmail = () => {
    if (user.email) window.location.href = `mailto:${user.email}`;
  };
  const handleSMS = () => {
    if (user.phone) window.location.href = `sms:${user.phone}`;
  };

  const isActive = user.status === 'active';

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[80] flex flex-col transition-transform duration-300 ease-in-out transform translate-x-0">
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <h2 className="text-xl font-bold">User Details</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  {user.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold">{user.fullName?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{user.fullName}</h3>
                  <p className="text-sm opacity-90">{user.email}</p>
                  <p className="text-sm opacity-90">{user.phone || 'No phone'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 pt-2 border-t border-white/20">
                {user.phone && (
                  <>
                    <button onClick={handleCall} className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition">
                      <Phone size={14} /> Call
                    </button>
                    <button onClick={handleWhatsApp} className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition">
                      <MessageCircle size={14} /> WhatsApp
                    </button>
                    <button onClick={handleSMS} className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition">
                      <Smartphone size={14} /> SMS
                    </button>
                  </>
                )}
                {user.email && (
                  <button onClick={handleEmail} className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition">
                    <MailIcon size={14} /> Email
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Joined</p>
                <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Role</p>
                <p className="text-sm font-medium capitalize">{user.role || 'customer'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Status</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isActive ? 'Active' : user.status === 'suspended' ? 'Suspended' : 'Inactive'}
                </span>
              </div>
              {user.addresses && user.addresses.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                  <p className="text-xs text-gray-500">Default Address</p>
                  <p className="text-sm">
                    {user.addresses.find(a => a.isDefault)?.street || 
                     user.addresses[0]?.street || 'Not set'}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Wallet size={20} className="mx-auto text-green-600 mb-1" />
                <p className="text-xs text-gray-500">Wallet Balance</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(stats?.walletBalance)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <DollarSign size={20} className="mx-auto text-blue-600 mb-1" />
                <p className="text-xs text-gray-500">Total Spent</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(stats?.totalSpent)}</p>
              </div>
            </div>

            <div className="flex border-b mb-3">
              <button onClick={() => setActiveTab('overview')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Overview</button>
              <button onClick={() => setActiveTab('bookings')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'bookings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Bookings</button>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <h4 className="font-semibold mb-2 flex items-center gap-1"><Activity size={16} /> Booking Summary</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div><p className="text-2xl font-bold text-green-600">{stats?.totalCompleted || 0}</p><p className="text-xs text-gray-500">Completed</p></div>
                    <div><p className="text-2xl font-bold text-red-600">{stats?.totalCancelled || 0}</p><p className="text-xs text-gray-500">Cancelled</p></div>
                    <div><p className="text-2xl font-bold text-yellow-600">{stats?.totalPending || 0}</p><p className="text-xs text-gray-500">Pending</p></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-2">
                {stats?.recentBookings?.length > 0 ? stats.recentBookings.map(b => (
                  <div key={b._id} className="border rounded-lg p-3 bg-white">
                    <div className="flex justify-between text-sm">
                      <span className="font-mono">{b.bookingId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${b.status === 'completed' ? 'bg-green-100 text-green-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100'}`}>{b.status}</span>
                    </div>
                    <div className="flex justify-between mt-1 text-sm">
                      <span>Amount: {formatCurrency(b.amount)}</span>
                      <span className="text-gray-400">{formatDate(b.date)}</span>
                    </div>
                  </div>
                )) : <p className="text-gray-400 text-center py-4">No bookings yet</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Main Component
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      // ✅ Only fetch users with role 'customer'
      const res = await fetchAdminUsers(page, 20, 'customer', statusFilter);
      if (res.success) {
        const mappedUsers = res.data.users.map(user => ({
          ...user,
          isActive: user.status === 'active'
        }));
        
        let filteredUsers = mappedUsers;
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          filteredUsers = mappedUsers.filter(u =>
            u.fullName?.toLowerCase().includes(term) ||
            u.email?.toLowerCase().includes(term) ||
            u.phone?.includes(term)
          );
        }
        
        setUsers(filteredUsers);
        setTotalPages(Math.ceil(res.data.pagination.total / res.data.pagination.limit));
      } else {
        showToast('Failed to load users', 'error');
      }
    } catch (err) {
      console.error('Load users error:', err);
      showToast(err.message || 'Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, statusFilter]);

  useEffect(() => {
    if (!loading) loadUsers();
  }, [searchTerm]);

  const handleStatusToggle = async (userId, currentIsActive) => {
    const newStatus = currentIsActive ? 'suspended' : 'active';
    try {
      await updateAdminUserStatus(userId, newStatus);
      showToast(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEditSave = async (userId, data) => {
    try {
      await updateUserByAdmin(userId, data);
      showToast('User updated successfully');
      loadUsers();
    } catch (err) {
      throw err;
    }
  };

  const handleCall = (phone) => {
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (phone) => {
    if (phone) window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  };

  const getPaginatedUsers = () => {
    const start = (page - 1) * 20;
    const end = start + 20;
    return users.slice(start, end);
  };
  const paginatedUsers = getPaginatedUsers();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
          toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
        }`}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-blue-600" size={24} /> Customers
        </h1>
        <p className="text-gray-500">Manage all registered customers, view details, send notifications, and more</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <button onClick={loadUsers} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"><RefreshCw size={16} /></button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></td></tr>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-gray-400">No customers found</td></tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                          {user.avatar?.url ? (
                            <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-blue-600 font-bold">{user.fullName?.charAt(0) || 'U'}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{user.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Active' : user.status === 'suspended' ? 'Suspended' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleCall(user.phone)} className="p-1.5 bg-green-50 rounded hover:bg-green-100" title="Call">
                          <Phone size={14} className="text-green-600" />
                        </button>
                        <button onClick={() => handleWhatsApp(user.phone)} className="p-1.5 bg-green-50 rounded hover:bg-green-100" title="WhatsApp">
                          <MessageCircle size={14} className="text-green-600" />
                        </button>
                        <button onClick={() => { setSelectedUser(user); setShowNotificationModal(true); }} className="p-1.5 bg-blue-50 rounded hover:bg-blue-100" title="Send Notification">
                          <Bell size={14} className="text-blue-600" />
                        </button>
                        <button onClick={() => handleStatusToggle(user._id, user.isActive)} className="p-1.5 bg-orange-50 rounded hover:bg-orange-100" title={user.isActive ? 'Suspend' : 'Activate'}>
                          {user.isActive ? <UserX size={14} className="text-orange-600" /> : <UserCheck size={14} className="text-green-600" />}
                        </button>
                        <button onClick={() => { setSelectedUser(user); setShowEditModal(true); }} className="p-1.5 bg-gray-100 rounded hover:bg-gray-200" title="Edit">
                          <Edit2 size={14} className="text-gray-600" />
                        </button>
                        <button onClick={() => { setSelectedUser(user); setShowDetailDrawer(true); }} className="p-1.5 bg-purple-50 rounded hover:bg-purple-100" title="View Details">
                          <Eye size={14} className="text-purple-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-sm">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="p-1 border rounded disabled:opacity-50"><ChevronLeft size={16} /></button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p+1)} className="p-1 border rounded disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {showNotificationModal && selectedUser && (
        <NotificationModal user={selectedUser} onClose={() => setShowNotificationModal(false)} onSend={() => showToast('Notification sent')} />
      )}
      {showEditModal && selectedUser && (
        <EditUserModal user={selectedUser} onClose={() => setShowEditModal(false)} onSave={handleEditSave} />
      )}
      {showDetailDrawer && selectedUser && (
        <UserDetailDrawer user={selectedUser} onClose={() => setShowDetailDrawer(false)} />
      )}
    </div>
  );
};

export default AdminUsers;