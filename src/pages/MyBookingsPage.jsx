// src/pages/MyBookingsPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchMyBookings, createOrder, verifyPayment } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ✅ Helper function to format price
const formatPrice = (price) => {
    return `₹${Number(price).toFixed(2)}`;
};

const BookingCard = ({ booking, onPayNow, payingBookingId }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const isCompletedUnpaid = booking.status === 'completed' && booking.payment?.status !== 'paid';
  const isProcessing = payingBookingId === booking._id;

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
          <span className="font-bold text-emerald-600">{formatPrice(booking.pricing?.total)}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">Payment:</span>
          <span className={`font-medium ${booking.payment?.status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
            {booking.payment?.status === 'paid' ? 'Paid ✓' : booking.payment?.method === 'cod' ? 'Pay on Delivery' : 'Pending'}
          </span>
        </div>
        {booking.status === 'completed' && !booking.hasReviewed && (
          <Link to={`/review/${booking._id}`} className="inline-block mt-3 text-emerald-600 text-sm hover:underline">
            Write a Review
          </Link>
        )}
        {isCompletedUnpaid && booking.payment?.method !== 'cod' && (
          <button
            onClick={() => onPayNow(booking)}
            disabled={isProcessing}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : `Pay Now ${formatPrice(booking.pricing?.total)}`}
          </button>
        )}
        {booking.payment?.method === 'cod' && booking.payment?.status !== 'paid' && (
          <div className="mt-3 text-orange-600 text-sm">💰 Pay {formatPrice(booking.pricing?.total)} cash to provider at service time</div>
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
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingBookingId, setPayingBookingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const pollingRef = useRef(null);

  // Show success message if coming from checkout
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
    } else if (location.state?.bookingCreated) {
      setSuccessMessage('🎉 Booking created successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location]);

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
      loadBookings(false);
    }, 10000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handlePayNow = async (booking) => {
    setPayingBookingId(booking._id);
    setError(null);
    
    try {
      console.log('🔄 Creating order for booking:', booking._id);
      const orderRes = await createOrder({ bookingId: booking._id });
      console.log('✅ Order response:', orderRes);
      
      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to create order');
      }
      
      // Load Razorpay script if not loaded
      if (!window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => {
            throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
          };
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
            console.log('🔄 Verifying payment:', response);
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.success) {
              alert('✅ Payment successful! Your booking is now confirmed.');
              loadBookings(true);
            } else {
              alert('❌ Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Payment verification failed: ' + err.message);
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
        modal: { 
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setPayingBookingId(null);
          }
        },
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        console.error('Payment failed:', response);
        alert('Payment failed: ' + (response.error?.description || 'Unknown error'));
        setPayingBookingId(null);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to initiate payment. Please try again.');
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
      
      {successMessage && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-4 border border-green-200">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 border border-red-200">
          {error}
          <button onClick={() => setError(null)} className="ml-4 text-sm underline">Dismiss</button>
        </div>
      )}
      
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
            <BookingCard 
              key={booking._id} 
              booking={booking} 
              onPayNow={handlePayNow}
              payingBookingId={payingBookingId}
            />
          ))}
        </div>
      )}
      
      {payingBookingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Processing payment...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;