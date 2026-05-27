// src/pages/admin/AdminKycVerification.jsx

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle, Search, Filter, 
  ChevronLeft, ChevronRight, FileText, 
  Calendar, Mail, Phone, AlertTriangle, Loader2,
  CreditCard, IdCard, Clock, Ban, Check,
  ZoomIn, Image, X, Building2,
  RefreshCw, Eye, MoreHorizontal, UserCheck, UserX,
  Users, UserCheck as UserVerified, XCircle, ChevronDown
} from 'lucide-react';
import { fetchAdminVerifications, verifyProvider, updateAdminUserStatus } from '../../services/api';

// ─── Avatar Component with Image Support ────────────────────────────
const UserAvatar = ({ user, size = 'md' }) => {
  const avatarUrl = user?.avatar?.url;
  const name = user?.fullName || user?.firstName || user?.businessName || '?';
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

// Helper: format date
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const AdminKycVerification = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountStatusFilter, setAccountStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectProviderId, setRejectProviderId] = useState(null);
  const [toast, setToast] = useState(null);
  const [imageZoom, setImageZoom] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(null);

  useEffect(() => {
    loadVerifications();
  }, [page, statusFilter, accountStatusFilter]);

  const loadVerifications = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminVerifications(
        page, 
        10, 
        statusFilter === 'all' ? '' : statusFilter,
        accountStatusFilter === 'all' ? '' : accountStatusFilter
      );
      if (res.success) {
        setVerifications(res.data.verifications || []);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalItems(res.data.pagination?.total || 0);
      } else {
        showToast(res.message || 'Failed to load verifications', 'error');
      }
    } catch (err) {
      console.error('Failed to load verifications:', err);
      showToast(err.message || 'Failed to load verifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const viewProviderDetails = (provider) => {
    setSelectedProvider(provider);
    setShowModal(true);
  };

  const handleStatusChange = async (providerId, newStatus, note = '') => {
    setVerifying(true);
    try {
      const res = await verifyProvider(providerId, newStatus, note);
      if (res.success) {
        const statusMessages = {
          verified: 'Provider verified successfully',
          rejected: 'Provider rejected successfully',
          under_review: 'Provider marked as under review'
        };
        showToast(statusMessages[newStatus] || `Status updated to ${newStatus}`);
        loadVerifications();
        setShowModal(false);
        setSelectedProvider(null);
        setStatusDropdownOpen(null);
      } else {
        showToast(res.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleRejectWithNote = async () => {
    if (!rejectProviderId) return;
    setVerifying(true);
    try {
      const res = await verifyProvider(rejectProviderId, 'rejected', rejectNote);
      if (res.success) {
        showToast('Provider rejected successfully');
        loadVerifications();
        setShowRejectModal(false);
        setRejectNote('');
        setRejectProviderId(null);
        setShowModal(false);
        setSelectedProvider(null);
        setStatusDropdownOpen(null);
      } else {
        showToast(res.message || 'Failed to reject provider', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to reject provider', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleSuspend = async (userId) => {
    if (!confirm('Are you sure you want to suspend this provider?')) return;
    setVerifying(true);
    try {
      const res = await updateAdminUserStatus(userId, 'suspended');
      if (res.success) {
        showToast('Provider suspended successfully');
        loadVerifications();
        setShowModal(false);
        setSelectedProvider(null);
      } else {
        showToast(res.message || 'Failed to suspend provider', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to suspend provider', 'error');
    } finally {
      setVerifying(false);
      setActionMenuOpen(null);
    }
  };

  const handleActivate = async (userId) => {
    setVerifying(true);
    try {
      const res = await updateAdminUserStatus(userId, 'active');
      if (res.success) {
        showToast('Provider activated successfully');
        loadVerifications();
        setShowModal(false);
        setSelectedProvider(null);
      } else {
        showToast(res.message || 'Failed to activate provider', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to activate provider', 'error');
    } finally {
      setVerifying(false);
      setActionMenuOpen(null);
    }
  };

  const openRejectModal = (providerId) => {
    setRejectProviderId(providerId);
    setShowRejectModal(true);
  };

  // Filter verifications by search
  const filteredVerifications = verifications.filter(v => {
    const matchesSearch = (v.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (v.user?.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (v.user?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (v.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Get document images with fallback
  const getDocumentImage = (documents, type) => {
    const doc = documents?.find(d => d.type === type);
    if (doc?.frontImage?.url) return doc.frontImage.url;
    if (doc?.imageUrl) return doc.imageUrl; // fallback for older data
    return null;
  };

  const getDocumentBackImage = (documents, type) => {
    const doc = documents?.find(d => d.type === type);
    return doc?.backImage?.url || null;
  };

  const getDocumentStatus = (documents, type) => {
    const doc = documents?.find(d => d.type === type);
    return doc?.isVerified ? 'verified' : 'pending';
  };

  const getVerificationStatusBadge = (status, providerId) => {
    const statusConfig = {
      verified: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle size={12} className="inline mr-1" />, label: 'Verified' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: <Ban size={12} className="inline mr-1" />, label: 'Rejected' },
      under_review: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Clock size={12} className="inline mr-1" />, label: 'Under Review' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock size={12} className="inline mr-1" />, label: 'Pending' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <div className="relative">
        <button
          onClick={() => setStatusDropdownOpen(statusDropdownOpen === providerId ? null : providerId)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-all ${config.bg} ${config.text}`}
        >
          {config.icon}
          {config.label}
          <ChevronDown size={12} className="ml-1" />
        </button>
        
        {statusDropdownOpen === providerId && (
          <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-fadeIn">
            <button
              onClick={() => handleStatusChange(providerId, 'pending')}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
            >
              <Clock size={14} /> Pending
            </button>
            <button
              onClick={() => handleStatusChange(providerId, 'under_review')}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
            >
              <Clock size={14} /> Under Review
            </button>
            <button
              onClick={() => handleStatusChange(providerId, 'verified')}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
            >
              <Check size={14} /> Verified
            </button>
            <button
              onClick={() => openRejectModal(providerId)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Ban size={14} /> Rejected
            </button>
          </div>
        )}
      </div>
    );
  };

  const getDocumentStatusBadge = (documents) => {
    const hasAadhaar = documents?.some(d => d.type === 'aadhar');
    const hasPAN = documents?.some(d => d.type === 'pan');
    const aadhaarVerified = documents?.find(d => d.type === 'aadhar')?.isVerified;
    const panVerified = documents?.find(d => d.type === 'pan')?.isVerified;
    
    if (hasAadhaar && hasPAN && aadhaarVerified && panVerified) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Both Verified</span>;
    } else if (hasAadhaar && aadhaarVerified && (!hasPAN || !panVerified)) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Aadhaar Only</span>;
    } else if (hasPAN && panVerified && (!hasAadhaar || !aadhaarVerified)) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">PAN Only</span>;
    } else if (hasAadhaar || hasPAN) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Documents Pending</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">No Documents</span>;
  };

  // Stats calculations
  const totalRequests = verifications.length;
  const pendingCount = verifications.filter(v => v.verificationStatus === 'pending' || v.verificationStatus === 'under_review').length;
  const verifiedCount = verifications.filter(v => v.verificationStatus === 'verified').length;
  const rejectedCount = verifications.filter(v => v.verificationStatus === 'rejected').length;
  const suspendedCount = verifications.filter(v => v.user?.status === 'suspended').length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg animate-slideInRight
          ${toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Image Zoom Modal */}
      {imageZoom && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={() => setImageZoom(null)}>
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={imageZoom} alt="Zoom" className="w-full h-full object-contain rounded-lg" />
            <button onClick={() => setImageZoom(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70">
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldCheck className="text-blue-600" size={28} />
          KYC Verification
        </h1>
        <p className="text-gray-500 text-sm mt-1">Verify provider documents and manage verifications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase font-bold">Total Providers</p>
              <p className="text-2xl font-bold text-gray-800">{totalRequests}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase font-bold">Pending KYC</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase font-bold">Verified KYC</p>
              <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <UserVerified size={20} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase font-bold">Rejected KYC</p>
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle size={20} className="text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase font-bold">Suspended</p>
              <p className="text-2xl font-bold text-orange-600">{suspendedCount}</p>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <UserX size={20} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, business..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All KYC Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="relative">
            <UserX className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={accountStatusFilter}
              onChange={(e) => { setAccountStatusFilter(e.target.value); setPage(1); }}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Account Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <button
            onClick={() => loadVerifications()}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredVerifications.length} of {totalItems} providers
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Provider</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Documents</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">KYC Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Account Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Submitted</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-500 mt-2">Loading providers...</p>
                  </td>
                </tr>
              ) : filteredVerifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No providers found</p>
                  </td>
                </tr>
              ) : (
                filteredVerifications.map((provider) => {
                  // Business name fallback – remove undefined
                  const displayBusinessName = provider.businessName && !provider.businessName.includes('undefined')
                    ? provider.businessName
                    : `${provider.user?.firstName || ''} ${provider.user?.lastName || ''}`.trim() || 'Provider';
                  return (
                    <tr key={provider._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={provider.user} size="md" />
                          <div>
                            <p className="font-semibold text-gray-800">{displayBusinessName}</p>
                            <p className="text-xs text-gray-500">{provider.user?.firstName} {provider.user?.lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} className="text-gray-400" />
                            <span className="truncate max-w-[180px]">{provider.user?.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} className="text-gray-400" />
                            <span>{provider.user?.phone}</span>
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-2">
                            {provider.documents?.map((doc, idx) => (
                              <span key={idx} className={`px-2 py-1 rounded-full text-xs font-medium ${
                                doc.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {doc.type === 'aadhar' ? 'Aadhaar' : doc.type === 'pan' ? 'PAN' : doc.type}
                                {doc.isVerified && ' ✓'}
                              </span>
                            ))}
                            {(!provider.documents || provider.documents.length === 0) && (
                              <span className="text-xs text-gray-400">No documents</span>
                            )}
                          </div>
                          <div>
                            {getDocumentStatusBadge(provider.documents)}
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        {getVerificationStatusBadge(provider.verificationStatus, provider._id)}
                       </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          provider.user?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {provider.user?.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                       </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(provider.createdAt)}
                       </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => viewProviderDetails(provider)}
                            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setActionMenuOpen(actionMenuOpen === provider._id ? null : provider._id)}
                              className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {actionMenuOpen === provider._id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                                {provider.user?.status === 'active' ? (
                                  <button
                                    onClick={() => { handleSuspend(provider.user?._id); setActionMenuOpen(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                                  >
                                    <UserX size={14} /> Suspend Account
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => { handleActivate(provider.user?._id); setActionMenuOpen(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
                                  >
                                    <UserCheck size={14} /> Activate Account
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                       </td>
                    </tr>
                  );
                })
              )}
            </tbody>
           </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} className="inline mr-1" />
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight size={16} className="inline ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Provider Details Modal */}
      {showModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} />
                <h2 className="text-xl font-bold">Provider Details</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Provider Info */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <UserAvatar user={selectedProvider.user} size="xl" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedProvider.businessName && !selectedProvider.businessName.includes('undefined')
                      ? selectedProvider.businessName
                      : `${selectedProvider.user?.firstName || ''} ${selectedProvider.user?.lastName || ''}`.trim() || 'Individual Provider'}
                  </h3>
                  <p className="text-gray-500">{selectedProvider.user?.firstName} {selectedProvider.user?.lastName}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getVerificationStatusBadge(selectedProvider.verificationStatus, selectedProvider._id)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedProvider.user?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedProvider.user?.status === 'active' ? 'Account Active' : 'Account Suspended'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <IdCard size={18} className="text-blue-600" />
                Verification Documents
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aadhaar Card */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="font-medium text-gray-700 flex items-center gap-2">
                      <CreditCard size={16} className="text-orange-500" />
                      Aadhaar Card
                    </h4>
                  </div>
                  <div className="p-4">
                    {getDocumentImage(selectedProvider.documents, 'aadhar') ? (
                      <>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Front Side</p>
                            <img 
                              src={getDocumentImage(selectedProvider.documents, 'aadhar')}
                              alt="Aadhaar Front"
                              className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setImageZoom(getDocumentImage(selectedProvider.documents, 'aadhar'))}
                            />
                          </div>
                          {getDocumentBackImage(selectedProvider.documents, 'aadhar') && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Back Side</p>
                              <img 
                                src={getDocumentBackImage(selectedProvider.documents, 'aadhar')}
                                alt="Aadhaar Back"
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setImageZoom(getDocumentBackImage(selectedProvider.documents, 'aadhar'))}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            getDocumentStatus(selectedProvider.documents, 'aadhar') === 'verified' 
                              ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {getDocumentStatus(selectedProvider.documents, 'aadhar') === 'verified' ? 'Verified' : 'Pending Verification'}
                          </span>
                          <button 
                            onClick={() => setImageZoom(getDocumentImage(selectedProvider.documents, 'aadhar'))}
                            className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                          >
                            <ZoomIn size={14} /> Zoom
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Image size={40} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No Aadhaar card uploaded</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* PAN Card */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="font-medium text-gray-700 flex items-center gap-2">
                      <FileText size={16} className="text-blue-500" />
                      PAN Card
                    </h4>
                  </div>
                  <div className="p-4">
                    {getDocumentImage(selectedProvider.documents, 'pan') ? (
                      <>
                        <img 
                          src={getDocumentImage(selectedProvider.documents, 'pan')}
                          alt="PAN Card"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setImageZoom(getDocumentImage(selectedProvider.documents, 'pan'))}
                        />
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            getDocumentStatus(selectedProvider.documents, 'pan') === 'verified' 
                              ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {getDocumentStatus(selectedProvider.documents, 'pan') === 'verified' ? 'Verified' : 'Pending Verification'}
                          </span>
                          <button 
                            onClick={() => setImageZoom(getDocumentImage(selectedProvider.documents, 'pan'))}
                            className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                          >
                            <ZoomIn size={14} /> Zoom
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Image size={40} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No PAN card uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              {selectedProvider.user?.status === 'active' ? (
                <button
                  onClick={() => handleSuspend(selectedProvider.user?._id)}
                  disabled={verifying}
                  className="flex-1 px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <UserX size={18} />
                  Suspend Account
                </button>
              ) : (
                <button
                  onClick={() => handleActivate(selectedProvider.user?._id)}
                  disabled={verifying}
                  className="flex-1 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <UserCheck size={18} />
                  Activate Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500" />
                Reject Verification
              </h3>
              <button onClick={() => { setShowRejectModal(false); setRejectNote(''); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-3">Please provide a reason for rejection:</p>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Enter reason (e.g., Invalid document, Quality issues, etc.)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setRejectNote(''); }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectWithNote}
                disabled={verifying}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifying ? <Loader2 size={18} className="animate-spin" /> : <Ban size={18} />}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKycVerification;