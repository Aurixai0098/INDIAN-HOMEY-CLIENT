// src/pages/MyBookingsPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyBookings, createOrder, verifyPayment } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookingCard = ({ booking, onPayNow }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const isCompletedUnpaid = booking.status === 'completed' && booking.payment?.status !== 'paid';

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 mb-4">
      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
        <div>
          <h3 className="font-bold text-gray-800">{booking.bookingId}</h3>
          <p className="text-sm text-gray-500">{new Date(booking.scheduledDate).toLocaleDateString()} • {booking.scheduledTime.start} - {booking.scheduledTime.end}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status] || 'bg-gray-100'}`}>
          {booking.status?.toUpperCase()}
        </span>
      </div>
      <div className="border-t pt-3 mt-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Provider:</span>
          <span className="font-medium">{booking.provider?.businessName || 'N/A'}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">Items:</span>
          <span>{booking.items.map(i => i.serviceName).join(', ')}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">Total Amount:</span>
          <span className="font-bold text-emerald-600">₹{booking.pricing?.total}</span>
        </div>
        {booking.status === 'completed' && !booking.hasReviewed && (
          <Link to={`/review/${booking._id}`} className="inline-block mt-3 text-emerald-600 text-sm hover:underline">
            Write a Review
          </Link>
        )}
        {isCompletedUnpaid && (
          <button
            onClick={() => onPayNow(booking)}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            Pay Now ₹{booking.pricing?.total}
          </button>
        )}
        {booking.payment?.status === 'paid' && (
          <div className="mt-3 text-green-600 text-sm">✓ Payment completed</div>
        )}
      </div>
    </div>
  );
};

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingBookingId, setPayingBookingId] = useState(null);
  const pollingRef = useRef(null);

  const loadBookings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetchMyBookings(1, 50);
      if (res.success) {
        setBookings(res.data.bookings || []);
      } else {
        setError('Failed to load bookings');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Start polling every 10 seconds
  useEffect(() => {
    loadBookings(true);
    pollingRef.current = setInterval(() => {
      loadBookings(false); // silent refresh without loading spinner
    }, 10000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handlePayNow = async (booking) => {
    setPayingBookingId(booking._id);
    try {
      const orderRes = await createOrder({ bookingId: booking._id });
      if (!window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: 'Ghar Seva',
        description: `Booking ${booking.bookingId}`,
        order_id: orderRes.data.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.success) {
              alert('Payment successful!');
              loadBookings(true); // full refresh
            } else {
              alert('Payment verification failed');
            }
          } catch (err) {
            alert(err.message);
          } finally {
            setPayingBookingId(null);
          }
        },
        prefill: {
          name: user?.fullName,
          email: user?.email,
          contact: user?.phone,
        },
        theme: { color: '#059669' },
        modal: { ondismiss: () => setPayingBookingId(null) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.message);
      setPayingBookingId(null);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <button onClick={() => loadBookings(true)} className="text-blue-600 text-sm hover:underline">
          Refresh
        </button>
      </div>
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
          <p className="text-gray-500 mb-4">Looks like you haven't booked any service.</p>
          <Link to="/" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">Browse Services</Link>
        </div>
      ) : (
        <div>
          {bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} onPayNow={handlePayNow} />
          ))}
          {payingBookingId && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg">Processing payment...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;