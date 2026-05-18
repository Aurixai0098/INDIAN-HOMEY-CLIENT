import { useState, useEffect } from 'react';
import { fetchAdminUsers, fetchAdminUserDetails, updateAdminUserStatus } from '../../services/api';

// Modern Lucide Icons
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Eye,
  Ban,
  CheckCircle2,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  Sparkles,
  Crown,
  UserCircle
} from 'lucide-react';

// ─── Avatar Component with Image Support ────────────────────────────
const UserAvatar = ({ user, size = 'md' }) => {
  const avatarUrl = user?.avatar?.url;
  const name = user?.fullName || user?.firstName || '?';
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

// ─── Shimmer Skeleton ────────────────────────────────────────────────
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-50">
        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded-lg w-32"></div>
          <div className="h-3 bg-slate-200 rounded-lg w-48"></div>
        </div>
        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
        <div className="h-6 bg-slate-200 rounded-full w-16"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-slate-200 rounded-lg w-8"></div>
          <div className="h-8 bg-slate-200 rounded-lg w-8"></div>
        </div>
      </div>
    ))}
  </div>
);

const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers(page, 15);
      if (res.success) {
        setUsers(res.data.users);
        setTotalPages(Math.ceil(res.data.pagination.total / res.data.pagination.limit));
        setTotalUsers(res.data.pagination.total);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [page]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const viewUserDetails = async (userId) => {
    try {
      const res = await fetchAdminUserDetails(userId);
      if (res.success) {
        setSelectedUser(res.data.user);
        setShowModal(true);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load user details', 'error');
    }
  };

  const updateStatus = async (userId, newStatus) => {
    setStatusUpdating(true);
    try {
      await updateAdminUserStatus(userId, newStatus);
      loadUsers();
      showToast(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setStatusUpdating(false);
      setActionMenuOpen(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone?.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeCount = users.filter(u => u.status === 'active').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded-lg w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>)}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="h-14 bg-slate-100 border-b border-slate-200"></div>
          <TableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[1100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-slideInRight
          ${toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Users Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor all registered users</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={totalUsers} color="bg-blue-50 text-blue-600" />
        <StatCard icon={UserCheck} label="Active Users" value={activeCount} color="bg-emerald-50 text-emerald-600" subtext={`${((activeCount / totalUsers) * 100 || 0).toFixed(0)}% of total`} />
        <StatCard icon={UserX} label="Suspended" value={suspendedCount} color="bg-red-50 text-red-600" />
        <StatCard icon={Shield} label="Admins" value={adminCount} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by name, email, phone..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 appearance-none cursor-pointer">
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="provider">Provider</option>
              <option value="admin">Admin</option>
            </select>
            <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-[-90deg] pointer-events-none" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 appearance-none cursor-pointer">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-[-90deg] pointer-events-none" />
          </div>
        </div>
        <div className="text-sm text-slate-500">Showing <span className="font-semibold text-slate-700">{filteredUsers.length}</span> of <span className="font-semibold text-slate-700">{totalUsers}</span> users</div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map(user => (
                <tr key={user._id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} size="md" />
                      <div>
                        <p className="font-semibold text-slate-800">{user.fullName}</p>
                        <p className="text-xs text-slate-500">ID: {user._id?.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400" /><span className="truncate max-w-[180px]">{user.email}</span></div>
                      {user.phone && <div className="flex items-center gap-2 text-sm text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400" /><span>{user.phone}</span></div>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      user.role === 'provider' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role === 'admin' && <Crown className="w-3 h-3" />}
                      {user.role === 'provider' && <Shield className="w-3 h-3" />}
                      {user.role === 'user' && <UserCircle className="w-3 h-3" />}
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => updateStatus(user._id, user.status === 'active' ? 'suspended' : 'active')} disabled={statusUpdating}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2 ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${user.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className={`ml-2 text-xs font-medium ${user.status === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>{user.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => viewUserDetails(user._id)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100"><Eye className="w-4 h-4" /></button>
                      <div className="relative">
                        <button onClick={() => setActionMenuOpen(actionMenuOpen === user._id ? null : user._id)} className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100"><MoreHorizontal className="w-4 h-4" /></button>
                        {actionMenuOpen === user._id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50">
                            {user.status === 'active' ? (
                              <button onClick={() => updateStatus(user._id, 'suspended')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><Ban className="w-4 h-4" /> Suspend User</button>
                            ) : (
                              <button onClick={() => updateStatus(user._id, 'active')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50"><CheckCircle2 className="w-4 h-4" /> Activate User</button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && !loading && (
                <tr><td colSpan={6} className="px-6 py-16 text-center"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8 text-slate-400" /></div><p className="text-slate-500 font-medium">No users found</p><p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">Page <span className="font-semibold text-slate-700">{page}</span> of <span className="font-semibold text-slate-700">{totalPages}</span></p>
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /> Previous</button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum; if (totalPages <= 5) pageNum = i + 1; else if (page <= 3) pageNum = i + 1; else if (page >= totalPages - 2) pageNum = totalPages - 4 + i; else pageNum = page - 2 + i;
                  return <button key={pageNum} onClick={() => setPage(pageNum)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${page === pageNum ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{pageNum}</button>;
                })}
              </div>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 disabled:opacity-40">Next <ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-8 text-white overflow-hidden">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl"><X className="w-5 h-5" /></button>
              <div className="relative flex flex-col items-center text-center">
                <UserAvatar user={selectedUser} size="xl" />
                <h2 className="text-2xl font-bold mt-4">{selectedUser.fullName}</h2>
                <p className="text-slate-400 text-sm mt-1">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${selectedUser.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : selectedUser.role === 'provider' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-500/20 text-slate-300'}`}>
                    {selectedUser.role === 'admin' && <Crown className="w-3 h-3" />}{selectedUser.role?.charAt(0).toUpperCase() + selectedUser.role?.slice(1)}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${selectedUser.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    {selectedUser.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}{selectedUser.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4"><div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2"><Mail className="w-3.5 h-3.5" />Email</div><p className="text-sm font-medium text-slate-800 break-all">{selectedUser.email}</p></div>
                <div className="bg-slate-50 rounded-xl p-4"><div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2"><Phone className="w-3.5 h-3.5" />Phone</div><p className="text-sm font-medium text-slate-800">{selectedUser.phone || 'Not provided'}</p></div>
                <div className="bg-slate-50 rounded-xl p-4"><div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2"><Calendar className="w-3.5 h-3.5" />Joined</div><p className="text-sm font-medium text-slate-800">{new Date(selectedUser.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
                <div className="bg-slate-50 rounded-xl p-4"><div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2"><Sparkles className="w-3.5 h-3.5" />User ID</div><p className="text-sm font-mono text-slate-600">{selectedUser._id?.slice(-12)}</p></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200">Close</button>
                {selectedUser.status === 'active' ? (
                  <button onClick={() => { updateStatus(selectedUser._id, 'suspended'); setShowModal(false); }} className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 flex items-center justify-center gap-2"><Ban className="w-4 h-4" /> Suspend User</button>
                ) : (
                  <button onClick={() => { updateStatus(selectedUser._id, 'active'); setShowModal(false); }} className="flex-1 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Activate User</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;