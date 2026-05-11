// src/pages/provider/ProviderBookings.jsx
import { useState, useEffect, useRef } from 'react';
import { fetchMyBookings, confirmBooking, startBooking, completeBooking, generateBookingOTP } from '../../services/api';

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [otpModal, setOtpModal] = useState({ show: false, bookingId: null, otp: '', generating: false });
  const [completing, setCompleting] = useState(false);
  const pollingRef = useRef(null);

  const loadBookings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetchMyBookings(1, 50, filter);
      if (res.success) setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Start polling every 10 seconds
  useEffect(() => {
    loadBookings(true);
    pollingRef.current = setInterval(() => {
      loadBookings(false); // silent refresh
    }, 10000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [filter]);

  const handleConfirm = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await confirmBooking(bookingId);
      loadBookings(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await startBooking(bookingId);
      loadBookings(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateOTP = async (bookingId) => {
    setOtpModal({ show: true, bookingId, otp: '', generating: true });
    try {
      const res = await generateBookingOTP(bookingId);
      if (res.success) {
        setOtpModal({ show: true, bookingId, otp: res.otp, generating: false });
      } else {
        alert(res.message || 'Failed to generate OTP');
        setOtpModal({ show: false, bookingId: null, otp: '', generating: false });
      }
    } catch (err) {
      alert(err.message);
      setOtpModal({ show: false, bookingId: null, otp: '', generating: false });
    }
  };

  const handleComplete = async (bookingId, otp) => {
    if (!otp) {
      alert('Please enter the OTP');
      return;
    }
    setCompleting(true);
    try {
      await completeBooking(bookingId, otp);
      setOtpModal({ show: false, bookingId: null, otp: '', generating: false });
      loadBookings(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setCompleting(false);
    }
  };

  const getActions = (booking) => {
    switch (booking.status) {
      case 'pending':
        return (
          <button
            onClick={() => handleConfirm(booking._id)}
            disabled={actionLoading === booking._id}
            className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1"
          >
            {actionLoading === booking._id && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            Confirm
          </button>
        );
      case 'confirmed':
        return (
          <button
            onClick={() => handleStart(booking._id)}
            disabled={actionLoading === booking._id}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
          >
            {actionLoading === booking._id && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            Start Service
          </button>
        );
      case 'in_progress':
        return (
          <button
            onClick={() => handleGenerateOTP(booking._id)}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center gap-1"
          >
            Generate OTP & Complete
          </button>
        );
      default:
        return null;
    }
  };

  if (loading && bookings.length === 0) return <div className="text-center py-10">Loading bookings...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Bookings</h1>
        <button onClick={() => loadBookings(true)} className="text-blue-600 text-sm hover:underline">
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              filter === status ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            {status === '' ? 'All' : status.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">No bookings found</div>
        ) : (
          bookings.map(booking => (
            <div key={booking._id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <p className="font-semibold">{booking.bookingId}</p>
                  <p className="text-sm text-gray-600">Customer: {booking.customer?.fullName || booking.customer?.firstName}</p>
                  <p className="text-sm text-gray-600">Service: {booking.items.map(i => i.serviceName).join(', ')}</p>
                  <p className="text-sm text-gray-600">Date: {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime.start}</p>
                  <p className="text-sm font-medium mt-1">Amount: ₹{booking.pricing?.total}</p>
                  {booking.payment?.status === 'paid' && <p className="text-xs text-green-600 mt-1">✓ Payment received</p>}
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                    booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status?.toUpperCase()}
                  </span>
                  <div>{getActions(booking)}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* OTP Modal */}
      {otpModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            {otpModal.generating ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Generating OTP...</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-4">Complete Service</h3>
                <p className="text-sm text-gray-600 mb-4">Share this OTP with the customer for verification:</p>
                <div className="text-center text-3xl font-mono font-bold bg-gray-100 p-3 rounded mb-4">{otpModal.otp}</div>
                <input
                  type="text"
                  placeholder="Enter OTP from customer"
                  id="otp-input"
                  className="w-full border rounded-lg px-4 py-2 mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const otpValue = document.getElementById('otp-input').value;
                      handleComplete(otpModal.bookingId, otpValue);
                    }}
                    disabled={completing}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {completing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    {completing ? 'Verifying...' : 'Verify & Complete'}
                  </button>
                  <button onClick={() => setOtpModal({ show: false, bookingId: null, otp: '', generating: false })} className="flex-1 border py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderBookings;