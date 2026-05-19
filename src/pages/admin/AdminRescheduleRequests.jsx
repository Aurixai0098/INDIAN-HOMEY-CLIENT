// src/pages/admin/AdminRescheduleRequests.jsx
import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Bell, Search, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { fetchRescheduleRequests, approveRescheduleRequest, rejectRescheduleRequest, sendNotificationToProvider } from '../../services/api';

const formatDateTime = (date) => new Date(date).toLocaleString('en-IN');

const NotificationModal = ({ provider, onClose, onSend }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await onSend(provider._id, message);
      onClose();
    } catch (err) {
      alert('Failed');
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-4">
        <h3 className="text-lg font-bold mb-3">Send to {provider.name}</h3>
        <textarea rows={4} className="w-full border rounded-lg p-2" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type message..." />
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
          <button onClick={handleSend} disabled={sending || !message} className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">
            {sending ? <Loader2 size={16} className="animate-spin" /> : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminRescheduleRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [notificationProvider, setNotificationProvider] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchRescheduleRequests(page, 20, 'pending');
      if (res.success) {
        setRequests(res.data.requests);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page]);

  const filtered = requests.filter(r =>
    r.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.provider?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * 20, page * 20);
  const totalPages = Math.ceil(filtered.length / 20);

  const handleApprove = async () => {
    if (!newDate || !newTime) return;
    setProcessing(true);
    try {
      await approveRescheduleRequest(selectedRequest._id, newDate, newTime);
      alert('Request approved');
      setShowApproveModal(false);
      fetchData();
    } catch (err) { alert(err.message); }
    finally { setProcessing(false); }
  };

  const handleReject = async () => {
    if (!rejectReason) return;
    setProcessing(true);
    try {
      await rejectRescheduleRequest(selectedRequest._id, rejectReason);
      alert('Request rejected');
      setShowRejectModal(false);
      fetchData();
    } catch (err) { alert(err.message); }
    finally { setProcessing(false); }
  };

  const sendNotification = async (id, msg) => {
    await sendNotificationToProvider(id, msg);
    alert('Notification sent');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <RefreshCw size={24} className="text-orange-600" /> Reschedule Requests
        </h1>
        <p className="text-gray-500">Review and approve/reject booking reschedule requests</p>
      </div>

      <div className="bg-white rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            placeholder="Search by Booking ID, Customer, Provider..."
            className="pl-10 pr-4 py-2 border rounded w-full"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Booking ID</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Provider</th>
                <th className="px-6 py-3 text-left">Original Date</th>
                <th className="px-6 py-3 text-left">Requested Date</th>
                <th className="px-6 py-3 text-left">Reason</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                if (loading) {
                  return (
                    <tr>
                      <td colSpan="7" className="text-center py-10">
                        <Loader2 className="animate-spin mx-auto" />
                      </td>
                    </tr>
                  );
                }
                if (paginated.length === 0) {
                  return (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-gray-400">
                        No pending reschedule requests
                      </td>
                    </tr>
                  );
                }
                return paginated.map((r) => (
                  <tr key={r._id} className="border-t">
                    <td className="px-6 py-3 font-mono">{r.bookingId}</td>
                    <td>{r.customer?.fullName}</td>
                    <td>{r.provider?.businessName}</td>
                    <td>{formatDateTime(r.originalDate)}</td>
                    <td>{formatDateTime(r.requestedDate)}</td>
                    <td>{r.reason || 'N/A'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedRequest(r); setShowApproveModal(true); }}
                          className="p-1 bg-green-50 rounded"
                          title="Approve"
                        >
                          <CheckCircle size={14} className="text-green-600" />
                        </button>
                        <button
                          onClick={() => { setSelectedRequest(r); setShowRejectModal(true); }}
                          className="p-1 bg-red-50 rounded"
                          title="Reject"
                        >
                          <XCircle size={14} className="text-red-600" />
                        </button>
                        <button
                          onClick={() => setNotificationProvider(r.provider)}
                          className="p-1 bg-purple-50 rounded"
                        >
                          <Bell size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between p-4 border-t">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-1 border rounded disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1 border rounded disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4">
            <h3 className="text-lg font-bold mb-3">Approve Reschedule</h3>
            <div className="space-y-3">
              <label>
                New Date
                <input
                  type="date"
                  className="border rounded w-full p-2 mt-1"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                />
              </label>
              <label>
                New Time
                <input
                  type="time"
                  className="border rounded w-full p-2 mt-1"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                />
              </label>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowApproveModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={processing || !newDate || !newTime}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg disabled:opacity-50"
                >
                  {processing ? <Loader2 size={16} className="animate-spin" /> : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4">
            <h3 className="text-lg font-bold mb-3">Reject Reschedule</h3>
            <textarea
              placeholder="Reason for rejection"
              rows={3}
              className="border rounded w-full p-2"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectReason}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg disabled:opacity-50"
              >
                {processing ? <Loader2 size={16} className="animate-spin" /> : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {notificationProvider && (
        <NotificationModal
          provider={notificationProvider}
          onClose={() => setNotificationProvider(null)}
          onSend={sendNotification}
        />
      )}
    </div>
  );
};

export default AdminRescheduleRequests;