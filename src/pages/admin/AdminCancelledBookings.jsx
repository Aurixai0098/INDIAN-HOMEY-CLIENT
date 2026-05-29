// src/pages/admin/AdminCancelledBookings.jsx
import React, { useState, useEffect } from 'react';
import { XCircle, Eye, Bell, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchAdminBookings, sendNotificationToProvider } from '../../services/api';

const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');
const formatCurrency = (amount) => amount ? `₹${amount.toLocaleString('en-IN')}` : '₹0';

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
        <textarea
          rows={4}
          className="w-full border rounded-lg p-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
        />
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
          <button
            onClick={handleSend}
            disabled={sending || !message}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminCancelledBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationProvider, setNotificationProvider] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminBookings(page, 20, 'cancelled');
      if (res.success) {
        setBookings(res.data.bookings);
        setTotalPages(Math.ceil(res.data.pagination.total / res.data.pagination.limit));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const filtered = bookings.filter((b) =>
    b.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.provider?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * 20, page * 20);
  const totalFilteredPages = Math.ceil(filtered.length / 20);

  const sendNotification = async (id, msg) => {
    await sendNotificationToProvider(id, msg);
    alert('Notification sent');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <XCircle size={24} className="text-red-600" /> Cancelled Bookings
        </h1>
        <p className="text-gray-500">Bookings cancelled by customer or provider</p>
      </div>

      <div className="bg-white rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by Booking ID, Customer, Provider..."
            className="pl-10 pr-4 py-2 border rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Cancelled On</th>
                <th className="px-6 py-3 text-left">Reason</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10">
                    <Loader2 className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">
                    No cancelled bookings
                  </td>
                </tr>
              ) : (
                paginated.map((booking) => (
                  <tr key={booking._id} className="border-t">
                    <td className="px-6 py-3 font-mono">{booking.bookingId}</td>
                    <td>{booking.customer?.fullName}</td>
                    <td>{booking.provider?.businessName}</td>
                    <td>{formatCurrency(booking.pricing?.total)}</td>
                    <td>{formatDate(booking.updatedAt)}</td>
                    <td>{booking.cancellationReason || 'N/A'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => (window.location.href = `/admin/bookings/${booking._id}`)}
                          className="p-1 bg-blue-50 rounded"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => booking.provider && setNotificationProvider(booking.provider)}
                          className="p-1 bg-purple-50 rounded"
                        >
                          <Bell size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center p-4 border-t">
          <span className="text-sm">
            Page {page} of {totalFilteredPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1 border rounded disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page === totalFilteredPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1 border rounded disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

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

export default AdminCancelledBookings;