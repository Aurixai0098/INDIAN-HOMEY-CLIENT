// src/pages/MyBookingsPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchMyBookings, createOrder, verifyPayment, createReview } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Modern Lucide Icons
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Package,
  Store,
  IndianRupee,
  CreditCard,
  Banknote,
  Star,
  ChevronRight,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Receipt,
  Sparkles,
  ArrowRight,
  Home,
  ShieldCheck,
  Timer,
  X
} from 'lucide-react';

// ─── Helper ─────────────────────────────────────────────────────────
const formatPrice = (price) => `₹${Number(price).toFixed(2)}`;

// ─── Status Config ──────────────────────────────────────────────────
const statusConfig = {
  pending: {
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
    label: 'Pending',
    description: 'Waiting for provider confirmation',
    step: 1,
    gradient: 'from-amber-400 to-orange-400'
  },
  confirmed: {
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCircle2,
    label: 'Confirmed',
    description: 'Provider has accepted your booking',
    step: 2,
    gradient: 'from-blue-400 to-indigo-400'
  },
  in_progress: {
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Loader2,
    label: 'In Progress',
    description: 'Service is being performed now',
    step: 3,
    gradient: 'from-purple-400 to-violet-400'
  },
  completed: {
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    label: 'Completed',
    description: 'Service completed successfully',
    step: 4,
    gradient: 'from-emerald-400 to-teal-400'
  },
  cancelled: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
    label: 'Cancelled',
    description: 'Booking has been cancelled',
    step: 0,
    gradient: 'from-red-400 to-rose-400'
  },
};

// ─── Payment Status Badge ──────────────────────────────────────────
const PaymentBadge = ({ payment }) => {
  if (payment?.status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <ShieldCheck className="w-3 h-3" />
        Paid
      </span>
    );
  }
  if (payment?.method === 'cod') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Banknote className="w-3 h-3" />
        Cash on Delivery
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
      <AlertCircle className="w-3 h-3" />
      Payment Pending
    </span>
  );
};

// ─── Timeline Step ────────────────────────────────────────────────
const TimelineStep = ({ step, currentStep, icon: Icon, label, isLast }) => {
  const isCompleted = step < currentStep;
  const isCurrent = step === currentStep;
  return (
    <div className="flex items-center flex-1">
      <div className="flex flex-col items-center relative">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
          ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
            isCurrent ? 'bg-white border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/30' :
            'bg-slate-100 border-slate-200 text-slate-400'}`}
        >
          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />}
        </div>
        <span className={`text-[10px] font-medium mt-1.5 whitespace-nowrap transition-colors
          ${isCompleted || isCurrent ? 'text-slate-700' : 'text-slate-400'}`}>
          {label}
        </span>
      </div>
      {!isLast && (
        <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
      )}
    </div>
  );
};

// ─── Review Modal Component ─────────────────────────────────────
const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a review comment');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createReview({
        booking: booking._id,
        rating: { overall: rating },
        title: title || `Rating ${rating} stars`,
        comment
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Rate Your Experience</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Rating</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star className={`w-8 h-8 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Review Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Great service!"
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Review *</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience with the service provider..."
              className="w-full border rounded-lg px-4 py-2 resize-none"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Booking Card ───────────────────────────────────────────────────
const BookingCard = ({ booking, onPayNow, payingBookingId, onWriteReview }) => {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const isCompletedUnpaid = booking.status === 'completed' && booking.payment?.status !== 'paid';
  const isProcessing = payingBookingId === booking._id;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 mb-5">
      {/* Card Header */}
      <div className="p-5 pb-3">
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-lg`}>
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800">#{booking.bookingId}</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}>
                  <StatusIcon className={`w-3 h-3 ${booking.status === 'in_progress' ? 'animate-spin' : ''}`} />
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {new Date(booking.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                <span className="text-slate-300">•</span>
                <Clock className="w-3.5 h-3.5" />
                {booking.scheduledTime?.start} - {booking.scheduledTime?.end}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800">{formatPrice(booking.pricing?.total)}</p>
            <PaymentBadge payment={booking.payment} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      {booking.status !== 'cancelled' && (
        <div className="px-5 py-3 bg-slate-50/50 border-y border-slate-100">
          <div className="flex items-center">
            {[
              { step: 1, icon: Clock, label: 'Pending' },
              { step: 2, icon: CheckCircle2, label: 'Confirmed' },
              { step: 3, icon: Loader2, label: 'In Progress' },
              { step: 4, icon: CheckCircle2, label: 'Completed' },
            ].map((item, idx, arr) => (
              <TimelineStep
                key={item.step}
                step={item.step}
                currentStep={config.step}
                icon={item.icon}
                label={item.label}
                isLast={idx === arr.length - 1}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">{config.description}</p>
        </div>
      )}

      {/* Card Body */}
      <div className="p-5 space-y-3">
        {/* Provider Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Store className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">Provider:</span>
            <span className="font-semibold text-slate-800">{booking.provider?.businessName || 'N/A'}</span>
          </div>
          {booking.provider?.phone && (
            <a href={`tel:${booking.provider.phone}`} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors">
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Items */}
        <div className="flex items-start gap-2 text-sm">
          <Package className="w-4 h-4 text-slate-400 mt-0.5" />
          <div>
            <span className="text-slate-600">Services:</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {booking.items.map((item, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                  {item.serviceName}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600">Total:</span>
              <span className="font-bold text-emerald-600">{formatPrice(booking.pricing?.total)}</span>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            {expanded ? 'Less details' : 'More details'}
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 animate-fadeIn">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Base Price</span>
              <span className="font-medium text-slate-700">{formatPrice(booking.pricing?.subtotal)}</span>
            </div>
            {booking.pricing?.additionalCharges > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Additional Charges</span>
                <span className="font-medium text-slate-700">{formatPrice(booking.pricing?.additionalCharges)}</span>
              </div>
            )}
            {booking.pricing?.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Discount</span>
                <span className="font-medium text-emerald-600">-{formatPrice(booking.pricing?.discount)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between">
              <span className="font-semibold text-slate-800">Grand Total</span>
              <span className="font-bold text-lg text-slate-900">{formatPrice(booking.pricing?.total)}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {/* Write Review button (manual) */}
          {booking.status === 'completed' && !booking.hasReviewed && (
            <button
              onClick={() => onWriteReview(booking)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-colors"
            >
              <Star className="w-4 h-4" />
              Write a Review
            </button>
          )}

          {/* Pay Now */}
          {isCompletedUnpaid && booking.payment?.method !== 'cod' && (
            <button
              onClick={() => onPayNow(booking)}
              disabled={isProcessing}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay {formatPrice(booking.pricing?.total)}
                </>
              )}
            </button>
          )}

          {/* COD Message */}
          {booking.payment?.method === 'cod' && booking.payment?.status !== 'paid' && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-sm">
              <Banknote className="w-4 h-4" />
              Pay cash to provider at service time
            </div>
          )}

          {/* Paid Success */}
          {booking.payment?.status === 'paid' && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Payment completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────
const MyBookingsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingBookingId, setPayingBookingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
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
              setSuccessMessage('✅ Payment successful! Your booking is now confirmed.');
              await loadBookings(true);
              // Show review modal after successful payment
              setSelectedBookingForReview(booking);
              setShowReviewModal(true);
            } else {
              setError('❌ Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            setError('Payment verification failed: ' + err.message);
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
        setError('Payment failed: ' + (response.error?.description || 'Unknown error'));
        setPayingBookingId(null);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setPayingBookingId(null);
    }
  };

  const handleWriteReview = (booking) => {
    setSelectedBookingForReview(booking);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    // Refresh bookings to update hasReviewed flag
    loadBookings(true);
  };

  // Filter bookings
  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === statusFilter);

  // Count by status
  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    in_progress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  // ─── Loading State ────────────────────────────────────────────────
  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your bookings...</p>
          <p className="text-slate-400 text-sm mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">My Bookings</h1>
              <p className="text-slate-500 text-sm mt-1">Track and manage all your service bookings</p>
            </div>
            <button
              onClick={() => loadBookings(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl flex items-center gap-3 animate-fadeIn">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span className="font-medium">{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="ml-auto p-1 hover:bg-emerald-100 rounded-lg transition-colors">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-sm font-semibold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Status Filter Tabs */}
        {bookings.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Bookings', icon: Receipt },
              { key: 'pending', label: 'Pending', icon: Clock },
              { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
              { key: 'in_progress', label: 'In Progress', icon: Loader2 },
              { key: 'completed', label: 'Completed', icon: CheckCircle2 },
              { key: 'cancelled', label: 'Cancelled', icon: XCircle },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${statusFilter === key
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
              >
                <Icon className={`w-4 h-4 ${key === 'in_progress' && statusFilter === key ? 'animate-spin' : ''}`} />
                {label}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${statusFilter === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {statusCounts[key]}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No bookings yet</h2>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">Looks like you haven't booked any service yet. Explore our services and make your first booking!</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Home className="w-4 h-4" />
              Browse Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No {statusFilter} bookings found</p>
            <button
              onClick={() => setStatusFilter('all')}
              className="mt-3 text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
            >
              View all bookings
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onPayNow={handlePayNow}
                payingBookingId={payingBookingId}
                onWriteReview={handleWriteReview}
              />
            ))}
          </div>
        )}
      </div>

      {/* Payment Processing Overlay */}
      {payingBookingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Processing Payment</h3>
            <p className="text-slate-500 text-sm">Please wait while we prepare your payment...</p>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBookingForReview && (
        <ReviewModal
          booking={selectedBookingForReview}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default MyBookingsPage;