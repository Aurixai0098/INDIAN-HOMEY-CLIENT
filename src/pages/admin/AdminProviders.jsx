import { useState, useEffect } from 'react';
import { fetchAllProviders, fetchAdminUserDetails, updateAdminUserStatus } from '../../services/api';

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
  UserCircle,
  Briefcase,
  Verified,
  Clock,
  XCircle
} from 'lucide-react';

// ─── Avatar Component with better fallback ────────────────────────────
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

// ─── Skeleton ────────────────────────────────────
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[1, 2, 3, 4, 5, 6].map((i) => (
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

const AdminProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProviders, setTotalProviders] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const res = await fetchAllProviders(page, 20);
      if (res.success) {
        const providerList = res.data.providers || [];
        setProviders(providerList);
        setTotalProviders(res.data.pagination?.total || providerList.length);
        setTotalPages(res.data.pagination?.pages || 1);
      } else {
        showToast('Failed to load providers', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to load providers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, [page]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const viewProviderDetails = async (providerId) => {
    const provider = providers.find(p => p._id === providerId);
    if (provider && provider.user) {
      setSelectedProvider(provider);
      setShowModal(true);
    } else {
      try {
        const res = await fetchAdminUserDetails(provider.user?._id);
        if (res.success) {
          setSelectedProvider({ ...provider, user: res.data.user });
          setShowModal(true);
        }
      } catch (err) {
        showToast(err.message || 'Failed to load provider details', 'error');
      }
    }
  };

  const updateStatus = async (userId, newStatus) => {
    setStatusUpdating(true);
    try {
      await updateAdminUserStatus(userId, newStatus);
      await loadProviders();
      showToast(`Provider ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setStatusUpdating(false);
      setActionMenuOpen(null);
    }
  };

  // Filter providers locally
  const filteredProviders = providers.filter((provider) => {
    const fullName = provider.user ? `${provider.user.firstName} ${provider.user.lastName}` : provider.businessName;
    const matchesSearch = fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.user?.phone?.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || provider.user?.status === statusFilter;
    const matchesVerification = verificationFilter === 'all' || provider.verificationStatus === verificationFilter;
    return matchesSearch && matchesStatus && matchesVerification;
  });

  const paginatedProviders = filteredProviders.slice((page - 1) * 20, page * 20);
  const filteredTotalPages = Math.ceil(filteredProviders.length / 20);

  const activeCount = providers.filter(p => p.user?.status === 'active').length;
  const suspendedCount = providers.filter(p => p.user?.status === 'suspended').length;
  const verifiedCount = providers.filter(p => p.verificationStatus === 'verified').length;
  const pendingCount = providers.filter(p => p.verificationStatus === 'pending').length;
  const underReviewCount = providers.filter(p => p.verificationStatus === 'under_review').length;

  if (loading && providers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded-lg w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>)}
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
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Provider Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor all service providers</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1">
            <Briefcase className="w-4 h-4" />
            Total Providers: {totalProviders}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Providers" value={totalProviders} color="bg-blue-50 text-blue-600" />
        <StatCard icon={UserCheck} label="Active" value={activeCount} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={UserX} label="Suspended" value={suspendedCount} color="bg-red-50 text-red-600" />
        <StatCard icon={Verified} label="Verified" value={verifiedCount} color="bg-purple-50 text-purple-600" subtext={`Pending: ${pendingCount}, Under review: ${underReviewCount}`} />
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-[-90deg] pointer-events-none" />
          </div>
          <div className="relative">
            <Verified className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={verificationFilter}
              onChange={(e) => { setVerificationFilter(e.target.value); setPage(1); }}
              className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 appearance-none cursor-pointer"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-[-90deg] pointer-events-none" />
          </div>
        </div>
        <div className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{paginatedProviders.length}</span> of <span className="font-semibold text-slate-700">{filteredProviders.length}</span> providers
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedProviders.map((provider) => {
                const user = provider.user;
                const fullName = user ? `${user.firstName} ${user.lastName}` : provider.businessName;
                const businessDisplay = provider.businessName && !provider.businessName.includes('undefined')
                  ? provider.businessName
                  : fullName;
                const verificationStatus = provider.verificationStatus || 'pending';
                let verificationBadge;
                if (verificationStatus === 'verified') verificationBadge = <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700"><Verified className="w-3 h-3" />Verified</span>;
                else if (verificationStatus === 'under_review') verificationBadge = <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><Clock className="w-3 h-3" />Under Review</span>;
                else if (verificationStatus === 'rejected') verificationBadge = <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700"><XCircle className="w-3 h-3" />Rejected</span>;
                else verificationBadge = <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><Clock className="w-3 h-3" />Pending</span>;

                return (
                  <tr key={provider._id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} size="md" />
                        <div>
                          <p className="font-semibold text-slate-800">{businessDisplay}</p>
                          <p className="text-xs text-slate-500">{provider.businessName && !provider.businessName.includes('undefined') ? provider.businessName : 'Business name not set'}</p>
                          <p className="text-xs text-slate-400">ID: {provider._id?.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[180px]">{user?.email || 'N/A'}</span>
                        </div>
                        {user?.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{verificationBadge}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => updateStatus(user?._id, user?.status === 'active' ? 'suspended' : 'active')}
                        disabled={statusUpdating}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2
                          ${user?.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${user?.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className={`ml-2 text-xs font-medium ${user?.status === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {user?.status || 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(provider.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewProviderDetails(provider._id)}
                          className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === provider._id ? null : provider._id)}
                            className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {actionMenuOpen === provider._id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-fadeIn">
                              {user?.status === 'active' ? (
                                <button
                                  onClick={() => updateStatus(user._id, 'suspended')}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Ban className="w-4 h-4" />
                                  Suspend Provider
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateStatus(user._id, 'active')}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Activate Provider
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedProviders.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No providers found</p>
                    <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTotalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-700">{page}</span> of <span className="font-semibold text-slate-700">{filteredTotalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, filteredTotalPages) }, (_, i) => {
                  let pageNum;
                  if (filteredTotalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= filteredTotalPages - 2) pageNum = filteredTotalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors
                        ${page === pageNum ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={page === filteredTotalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Provider Details Modal – same avatar logic with business name fallback */}
      {showModal && selectedProvider && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-8 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative flex flex-col items-center text-center">
                <UserAvatar user={selectedProvider.user} size="xl" />
                <h2 className="text-2xl font-bold mt-4">
                  {selectedProvider.user 
                    ? `${selectedProvider.user.firstName} ${selectedProvider.user.lastName}`
                    : (selectedProvider.businessName && !selectedProvider.businessName.includes('undefined') 
                        ? selectedProvider.businessName 
                        : 'Service Provider')}
                </h2>
                <p className="text-slate-400 text-sm mt-1">{selectedProvider.user?.email}</p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                    <Briefcase className="w-3 h-3" />
                    Provider
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                    ${selectedProvider.user?.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    {selectedProvider.user?.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                    {selectedProvider.user?.status || 'inactive'}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                    ${selectedProvider.verificationStatus === 'verified' ? 'bg-purple-500/20 text-purple-300' :
                      selectedProvider.verificationStatus === 'rejected' ? 'bg-red-500/20 text-red-300' :
                      'bg-amber-500/20 text-amber-300'}`}>
                    <Verified className="w-3 h-3" />
                    {selectedProvider.verificationStatus || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </div>
                  <p className="text-sm font-medium text-slate-800 break-all">{selectedProvider.user?.email || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
                    <Phone className="w-3.5 h-3.5" />
                    Phone
                  </div>
                  <p className="text-sm font-medium text-slate-800">{selectedProvider.user?.phone || 'Not provided'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    Business Name
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    {selectedProvider.businessName && !selectedProvider.businessName.includes('undefined')
                      ? selectedProvider.businessName
                      : 'Not set'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(selectedProvider.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              {selectedProvider.bio && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Bio
                  </div>
                  <p className="text-sm text-slate-700">{selectedProvider.bio}</p>
                </div>
              )}
              {selectedProvider.serviceArea && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
                    <Shield className="w-3.5 h-3.5" />
                    Service Area
                  </div>
                  <p className="text-sm text-slate-700">
                    {selectedProvider.serviceArea.cities?.join(', ') || 'No cities specified'} | Radius: {selectedProvider.serviceArea.radius} km
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                  Close
                </button>
                {selectedProvider.user?.status === 'active' ? (
                  <button
                    onClick={() => { updateStatus(selectedProvider.user._id, 'suspended'); setShowModal(false); }}
                    className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    Suspend Provider
                  </button>
                ) : (
                  <button
                    onClick={() => { updateStatus(selectedProvider.user._id, 'active'); setShowModal(false); }}
                    className="flex-1 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Activate Provider
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProviders;