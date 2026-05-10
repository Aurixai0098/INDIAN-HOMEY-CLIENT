import { useState, useEffect } from 'react';
import { fetchMyBookings, confirmBooking, startBooking, completeBooking, generateBookingOTP } from '../../services/api';

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [otpModal, setOtpModal] = useState({ show: false, bookingId: null, otp: '' });

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetchMyBookings(1, 50, filter);
      if (res.success) setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await confirmBooking(bookingId);
      loadBookings();
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
      loadBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateOTP = async (bookingId) => {
    try {
      const res = await generateBookingOTP(bookingId);
      if (res.success) {
        alert(`OTP generated: ${res.otp}`);
        setOtpModal({ show: true, bookingId, otp: res.otp });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleComplete = async (bookingId, otp) => {
    setActionLoading(bookingId);
    try {
      await completeBooking(bookingId, otp);
      setOtpModal({ show: false, bookingId: null, otp: '' });
      loadBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getActions = (booking) => {
    switch (booking.status) {
      case 'pending':
        return (
          <button
            onClick={() => handleConfirm(booking._id)}
            disabled={actionLoading === booking._id}
            className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700"
          >
            Confirm
          </button>
        );
      case 'confirmed':
        return (
          <button
            onClick={() => handleStart(booking._id)}
            disabled={actionLoading === booking._id}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Start Service
          </button>
        );
      case 'in_progress':
        return (
          <button
            onClick={() => handleGenerateOTP(booking._id)}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
          >
            Generate OTP & Complete
          </button>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="text-center py-10">Loading bookings...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Bookings</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              filter === status
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border'
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
                  if (otpValue) handleComplete(otpModal.bookingId, otpValue);
                  else alert('Please enter OTP');
                }}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg"
              >
                Verify & Complete
              </button>
              <button onClick={() => setOtpModal({ show: false, bookingId: null, otp: '' })} className="flex-1 border py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderBookings;