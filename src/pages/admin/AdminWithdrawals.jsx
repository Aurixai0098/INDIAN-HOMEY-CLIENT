// src/pages/admin/AdminWithdrawals.jsx
import { useState, useEffect } from 'react';
import { 
  Wallet, IndianRupee, Users, Clock, CheckCircle, XCircle, 
  Loader2, Eye, ChevronRight, Filter, Search, AlertCircle, 
  Landmark, Smartphone, Calendar, MessageCircle, RefreshCw
} from 'lucide-react';
import { 
  fetchAllWithdrawals, updateWithdrawalStatus, getAllProviderWallets,
  fetchProviderWithdrawals
} from '../../services/api';

const AdminWithdrawals = () => {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'providers'
  const [withdrawals, setWithdrawals] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerWithdrawals, setProviderWithdrawals] = useState([]);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  
  // For status update modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateReason, setUpdateReason] = useState('');
  const [updateTransactionId, setUpdateTransactionId] = useState('');
  
  useEffect(() => {
    if (activeTab === 'requests') loadWithdrawals();
    else loadProviderWallets();
  }, [activeTab, filterStatus]);
  
  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await fetchAllWithdrawals(filterStatus, 1, 100);
      if (res.success) setWithdrawals(res.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadProviderWallets = async () => {
    setLoading(true);
    try {
      const res = await getAllProviderWallets();
      if (res.success) setProviders(res.data.providers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusUpdate = async () => {
    if (!selectedRequest) return;
    setActionLoading(selectedRequest._id);
    try {
      await updateWithdrawalStatus(selectedRequest._id, updateStatus, updateReason, updateTransactionId);
      setModalOpen(false);
      loadWithdrawals();
      if (selectedProvider) loadProviderWithdrawals(selectedProvider.providerId);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
      setSelectedRequest(null);
      setUpdateStatus('');
      setUpdateReason('');
      setUpdateTransactionId('');
    }
  };
  
  const openStatusModal = (request, status) => {
    setSelectedRequest(request);
    setUpdateStatus(status);
    setUpdateReason(request.adminNote || '');
    setUpdateTransactionId(request.transactionId || '');
    setModalOpen(true);
  };
  
  const loadProviderWithdrawals = async (providerId) => {
    setLoading(true);
    try {
      const res = await fetchProviderWithdrawals(providerId);
      if (res.success) setProviderWithdrawals(res.data.withdrawals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleProviderClick = async (provider) => {
    setSelectedProvider(provider);
    await loadProviderWithdrawals(provider.providerId);
    setShowProviderModal(true);
  };
  
  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Loader2, label: 'Processing' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Completed' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Rejected' }
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    );
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Withdrawal Management</h1>
          <p className="text-gray-500 text-sm">Manage provider withdrawal requests and settlements</p>
        </div>
        <button onClick={() => activeTab === 'requests' ? loadWithdrawals() : loadProviderWallets()} className="p-2 bg-white rounded-xl shadow-sm border">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
            activeTab === 'requests' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Withdrawal Requests
          <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{withdrawals.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
            activeTab === 'providers' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Provider Wallets
        </button>
      </div>
      
      {/* Filter for requests tab */}
      {activeTab === 'requests' && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending', 'processing', 'completed', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status === 'all' ? '' : status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                (filterStatus === status || (status === 'all' && filterStatus === ''))
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      )}
      
      {/* Requests List */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No withdrawal requests found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Request Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {withdrawals.map(req => (
                    <tr key={req._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{req.provider?.fullName || req.provider?.firstName}</p>
                          <p className="text-xs text-gray-400">{req.provider?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">₹{req.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-sm">
                          {req.accountDetails?.upiId ? <Smartphone className="w-3.5 h-3.5" /> : <Landmark className="w-3.5 h-3.5" />}
                          {req.accountDetails?.upiId ? 'UPI' : 'Bank'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setModalOpen(true);
                              setUpdateStatus(req.status);
                              setUpdateReason(req.adminNote || '');
                              setUpdateTransactionId(req.transactionId || '');
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View/Update"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {req.status === 'pending' && (
                            <>
                              <button onClick={() => openStatusModal(req, 'processing')} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">Process</button>
                              <button onClick={() => openStatusModal(req, 'rejected')} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg">Reject</button>
                            </>
                          )}
                          {req.status === 'processing' && (
                            <button onClick={() => openStatusModal(req, 'completed')} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg">Complete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Provider Wallets Grid */}
      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-3 flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
          ) : providers.map(provider => (
            <div
              key={provider.providerId}
              onClick={() => handleProviderClick(provider)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={provider.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.businessName)}&background=10b981&color=fff`}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{provider.businessName}</h3>
                  <p className="text-xs text-gray-500">{provider.ownerName}</p>
                </div>
              </div>
              <div className="flex justify-between items-center border-t pt-3 mt-2">
                <div>
                  <p className="text-xs text-gray-400">Wallet Balance</p>
                  <p className="text-xl font-bold text-emerald-600">₹{provider.balance.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total Earned</p>
                  <p className="text-sm font-semibold">₹{provider.totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Withdrawn: ₹{provider.totalWithdrawn.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="text-xs text-emerald-600 flex items-center gap-1">View History <ChevronRight className="w-3 h-3" /></span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal for withdrawal details & status update */}
      {modalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Withdrawal Request #{selectedRequest._id.slice(-6)}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-sm text-gray-500">Provider</p>
                <p className="font-medium">{selectedRequest.provider?.fullName || selectedRequest.provider?.firstName}</p>
                <p className="text-xs text-gray-400">{selectedRequest.provider?.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500">Amount</p><p className="font-bold text-lg">₹{selectedRequest.amount}</p></div>
                <div><p className="text-xs text-gray-500">Requested On</p><p>{new Date(selectedRequest.createdAt).toLocaleString()}</p></div>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Account Details</p>
                {selectedRequest.accountDetails?.upiId ? (
                  <p className="text-sm bg-gray-50 p-2 rounded">UPI: {selectedRequest.accountDetails.upiId}</p>
                ) : (
                  <div className="text-sm bg-gray-50 p-2 rounded space-y-1">
                    <p>Bank: {selectedRequest.accountDetails?.bankName}</p>
                    <p>Account: {selectedRequest.accountDetails?.accountNumber}</p>
                    <p>IFSC: {selectedRequest.accountDetails?.ifscCode}</p>
                    <p>Holder: {selectedRequest.accountDetails?.accountHolderName}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Update Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full border rounded-xl px-4 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              {(updateStatus === 'processing' || updateStatus === 'rejected') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Reason / Note</label>
                  <textarea
                    value={updateReason}
                    onChange={(e) => setUpdateReason(e.target.value)}
                    rows="2"
                    className="w-full border rounded-xl px-4 py-2"
                    placeholder="Optional reason for provider"
                  />
                </div>
              )}
              {updateStatus === 'completed' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Transaction ID / UTR</label>
                  <input
                    type="text"
                    value={updateTransactionId}
                    onChange={(e) => setUpdateTransactionId(e.target.value)}
                    className="w-full border rounded-xl px-4 py-2"
                    placeholder="Enter transaction reference"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-3">
                <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-xl">Cancel</button>
                <button onClick={handleStatusUpdate} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl">Update</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Provider Withdrawal History Modal */}
      {showProviderModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedProvider.businessName}</h2>
                <p className="text-sm text-gray-500">Withdrawal History</p>
              </div>
              <button onClick={() => setShowProviderModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {providerWithdrawals.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No withdrawal requests yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr><th className="px-3 py-2 text-left">Amount</th><th>Status</th><th>Date</th><th>Note</th></tr>
                  </thead>
                  <tbody>
                    {providerWithdrawals.map(w => (
                      <tr key={w._id} className="border-t">
                        <td className="px-3 py-2 font-semibold">₹{w.amount}</td>
                        <td className="px-3 py-2">{getStatusBadge(w.status)}</td>
                        <td className="px-3 py-2 text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</td>
                        <td className="px-3 py-2 text-xs text-gray-400">{w.adminNote || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;