// src/pages/admin/AdminComplaints.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle, Search, Filter, ChevronLeft, ChevronRight, Eye, Phone, User, Briefcase,
  Loader2, RefreshCw, X, CheckCircle, XCircle, Clock, AlertTriangle, Trash2, Edit2,
  Mail, MapPin, Calendar, MessageSquare, Flag, Ban, UserCheck, UserX
} from 'lucide-react';
import {
  fetchComplaints,
  fetchComplaintDetails,
  updateComplaintStatus,
  deleteComplaint,
  fetchUserComplaintHistory,
  fetchProviderComplaintHistory,
  fetchAdminUserDetails,
  fetchProviderDetailsById,
  updateAdminUserStatus,
  updateProviderStatus
} from '../../services/api';

const formatDate = (date) => new Date(date).toLocaleString('en-IN');

// Status badge component
const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    under_review: 'bg-blue-100 text-blue-800'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
    </span>
  );
};

// Edit Complaint Status Modal
const EditStatusModal = ({ complaint, onClose, onSave }) => {
  const [status, setStatus] = useState(complaint.status);
  const [adminNote, setAdminNote] = useState(complaint.adminNote || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave(complaint._id, status, adminNote);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Update Complaint Status</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Admin Note (optional)</label>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Add internal note..."
            />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

// User/Provider Details Drawer
const EntityDetailsDrawer = ({ entity, type, onClose }) => {
  const [details, setDetails] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (type === 'user') {
          const [userRes, complaintsRes] = await Promise.all([
            fetchAdminUserDetails(entity._id),
            fetchUserComplaintHistory(entity._id)
          ]);
          if (userRes.success) setDetails(userRes.data.user);
          if (complaintsRes.success) setComplaints(complaintsRes.data);
        } else {
          const [providerRes, complaintsRes] = await Promise.all([
            fetchProviderDetailsById(entity._id),
            fetchProviderComplaintHistory(entity._id)
          ]);
          if (providerRes.success) setDetails(providerRes.data);
          if (complaintsRes.success) setComplaints(complaintsRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity._id, type]);

  const handleBlockToggle = async () => {
    setBlocking(true);
    try {
      if (type === 'user') {
        await updateAdminUserStatus(entity._id, details.status === 'active' ? 'suspended' : 'active');
      } else {
        await updateProviderStatus(entity._id, details.status === 'active' ? 'suspended' : 'active');
      }
      // Refresh details
      const fresh = type === 'user' ? await fetchAdminUserDetails(entity._id) : await fetchProviderDetailsById(entity._id);
      if (fresh.success) setDetails(fresh.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setBlocking(false);
    }
  };

  if (!entity) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <h2 className="text-xl font-bold">{type === 'user' ? 'User Details' : 'Provider Details'}</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
        ) : details ? (
          <>
            {/* Basic Info */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-white mb-4">
              <div className="flex items-center gap-3">
                {details.avatar?.url ? (
                  <img src={details.avatar.url} alt={details.name} className="w-14 h-14 rounded-full border-2 border-white object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                    {(details.fullName || details.businessName || 'U').charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold">{details.fullName || details.businessName}</h3>
                  <p className="text-xs opacity-90">{details.email}</p>
                  <p className="text-xs opacity-90">{details.phone || 'No phone'}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <a href={`tel:${details.phone}`} className="flex-1 flex items-center justify-center gap-1 p-2 bg-green-50 rounded-lg text-green-600 hover:bg-green-100"><Phone size={14} /> Call</a>
              <a href={`mailto:${details.email}`} className="flex-1 flex items-center justify-center gap-1 p-2 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100"><Mail size={14} /> Email</a>
              <button onClick={handleBlockToggle} disabled={blocking} className="flex-1 flex items-center justify-center gap-1 p-2 bg-red-50 rounded-lg text-red-600 hover:bg-red-100">
                {blocking ? <Loader2 size={14} className="animate-spin" /> : details.status === 'active' ? <Ban size={14} /> : <UserCheck size={14} />}
                {details.status === 'active' ? 'Block' : 'Unblock'}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <p className="text-xs text-gray-500">Total Complaints Made</p>
                <p className="text-lg font-bold">{complaints.made?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <p className="text-xs text-gray-500">Total Complaints Against</p>
                <p className="text-lg font-bold">{complaints.against?.length || 0}</p>
              </div>
            </div>

            {/* Complaints Made */}
            {complaints.made?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Complaints Filed</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {complaints.made.map(c => (
                    <div key={c._id} className="border rounded-lg p-2 text-xs">
                      <div className="flex justify-between">
                        <span>Against: {c.againstName}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-gray-500 mt-1 truncate">{c.subject}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Complaints Against */}
            {complaints.against?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Complaints Received</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {complaints.against.map(c => (
                    <div key={c._id} className="border rounded-lg p-2 text-xs bg-red-50">
                      <div className="flex justify-between">
                        <span>By: {c.complainantName}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-gray-500 mt-1 truncate">{c.subject}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Member Since */}
            <div className="mt-4 pt-3 border-t text-xs text-gray-400">
              Joined: {formatDate(details.createdAt)}
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-400">Could not load details</div>
        )}
      </div>
    </div>
  );
};

// Main Component
const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserDrawer, setShowUserDrawer] = useState(false);
  const [showProviderDrawer, setShowProviderDrawer] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [entityType, setEntityType] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, rejected: 0 });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetchComplaints(page, 20, statusFilter, typeFilter);
      if (res.success) {
        setComplaints(res.data.complaints);
        setTotalPages(Math.ceil(res.data.pagination.total / res.data.pagination.limit));
        setStats(res.data.stats || { total: res.data.pagination.total, pending: 0, resolved: 0, rejected: 0 });
      }
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [page, statusFilter, typeFilter]);

  const handleUpdateStatus = async (complaintId, status, adminNote) => {
    await updateComplaintStatus(complaintId, status, adminNote);
    showToast('Complaint status updated');
    loadComplaints();
  };

  const handleDelete = async (complaintId) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await deleteComplaint(complaintId);
        showToast('Complaint deleted');
        loadComplaints();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const filteredComplaints = complaints.filter(c =>
    c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.complainantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.againstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
          toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
        }`}>
          {toast.type === 'error' ? <X size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertCircle className="text-red-600" size={24} /> User Complaints
        </h1>
        <p className="text-gray-500">Manage complaints from users and providers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-2"><AlertCircle size={18} className="text-blue-600" /><span className="text-sm font-medium">Total</span></div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-2"><Clock size={18} className="text-yellow-600" /><span className="text-sm font-medium">Pending</span></div>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-2"><CheckCircle size={18} className="text-green-600" /><span className="text-sm font-medium">Resolved</span></div>
          <p className="text-2xl font-bold">{stats.resolved}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-2"><XCircle size={18} className="text-red-600" /><span className="text-sm font-medium">Rejected</span></div>
          <p className="text-2xl font-bold">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by subject, complainant, respondent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm"
            >
              <option value="">All Types</option>
              <option value="user_to_provider">User → Provider</option>
              <option value="provider_to_user">Provider → User</option>
            </select>
          </div>
          <button onClick={loadComplaints} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><RefreshCw size={16} /></button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Complainant</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Against</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-10"><Loader2 className="animate-spin mx-auto text-blue-600" size={24} /></td></tr>
              ) : filteredComplaints.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-400">No complaints found.</td></tr>
              ) : (
                filteredComplaints.map(complaint => (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{complaint._id.slice(-6)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{complaint.complainantName}</p>
                        <p className="text-xs text-gray-500">{complaint.complainantType === 'user' ? 'User' : 'Provider'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{complaint.againstName}</p>
                        <p className="text-xs text-gray-500">{complaint.againstType === 'user' ? 'User' : 'Provider'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">{complaint.subject}</td>
                    <td className="px-4 py-3"><StatusBadge status={complaint.status} /></td>
                    <td className="px-4 py-3 text-sm">{formatDate(complaint.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setSelectedComplaint(complaint); setShowEditModal(true); }}
                          className="p-1.5 bg-blue-50 rounded hover:bg-blue-100 text-blue-600"
                          title="View/Edit"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => { setSelectedEntity({ _id: complaint.complainantId, name: complaint.complainantName }); setEntityType(complaint.complainantType); setShowUserDrawer(true); }}
                          className="p-1.5 bg-green-50 rounded hover:bg-green-100 text-green-600"
                          title="View Complainant"
                        >
                          <User size={14} />
                        </button>
                        <button
                          onClick={() => { setSelectedEntity({ _id: complaint.againstId, name: complaint.againstName }); setEntityType(complaint.againstType); setShowProviderDrawer(true); }}
                          className="p-1.5 bg-purple-50 rounded hover:bg-purple-100 text-purple-600"
                          title="View Respondent"
                        >
                          <Briefcase size={14} />
                        </button>
                        <a href={`tel:${complaint.complainantPhone}`} className="p-1.5 bg-green-50 rounded hover:bg-green-100 text-green-600" title="Call Complainant">
                          <Phone size={14} />
                        </a>
                        <button
                          onClick={() => handleDelete(complaint._id)}
                          className="p-1.5 bg-red-50 rounded hover:bg-red-100 text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={14} />
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
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="p-1 border rounded disabled:opacity-50"><ChevronLeft size={16} /></button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p+1)} className="p-1 border rounded disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Status Modal */}
      {showEditModal && selectedComplaint && (
        <EditStatusModal
          complaint={selectedComplaint}
          onClose={() => { setShowEditModal(false); setSelectedComplaint(null); }}
          onSave={handleUpdateStatus}
        />
      )}

      {/* User/Provider Drawers */}
      {showUserDrawer && selectedEntity && (
        <EntityDetailsDrawer
          entity={selectedEntity}
          type={entityType}
          onClose={() => { setShowUserDrawer(false); setSelectedEntity(null); }}
        />
      )}
      {showProviderDrawer && selectedEntity && (
        <EntityDetailsDrawer
          entity={selectedEntity}
          type={entityType}
          onClose={() => { setShowProviderDrawer(false); setSelectedEntity(null); }}
        />
      )}
    </div>
  );
};

export default AdminComplaints;