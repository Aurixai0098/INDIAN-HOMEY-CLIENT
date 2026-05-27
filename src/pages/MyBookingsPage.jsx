import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchMyBookings, createOrder, verifyPayment, createReview } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LiveTrackingMap from '../components/booking/LiveTrackingMap';
import ChatBox from '../components/booking/ChatBox';

// Icons
import {
  Star,
  MessageCircle,
  MapPin,
  X,
  Loader2,
  AlertCircle,
  Check,
  Download,
  ChevronRight,
  ArrowLeft,
  Package,
  Home,
  Phone,
  Filter,
  Calendar
} from 'lucide-react';

// Helper
const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

// Review Modal
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">Rate Your Experience</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star className={`w-8 h-8 ${star <= rating ? 'text-green-600 fill-green-600' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Review Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Great service!"
              className="w-full border rounded-sm px-4 py-2 focus:outline-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Your Review *</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full border rounded-sm px-4 py-2 resize-none focus:outline-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-[#2874f0] text-white rounded-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Booking List Item (Screenshot 1 UI)
const BookingListItem = ({ booking, onClick, onWriteReview }) => {
  const serviceNames = booking.items?.map(i => i.serviceName).join(', ') || 'Service Booking';
  
  let statusColor = 'bg-blue-500';
  let statusText = 'Pending Confirmation';
  let dateText = `Expected: ${new Date(booking.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  if (booking.status === 'confirmed') {
    statusColor = 'bg-blue-500';
    statusText = 'Confirmed';
  } else if (booking.status === 'in_progress') {
    statusColor = 'bg-orange-500';
    statusText = 'In Progress';
    dateText = 'Service is happening now';
  } else if (booking.status === 'completed') {
    statusColor = 'bg-green-500';
    statusText = `Completed on ${new Date(booking.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    dateText = 'Your service has been completed';
  } else if (booking.status === 'cancelled') {
    statusColor = 'bg-red-500';
    statusText = `Cancelled on ${new Date(booking.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    dateText = 'Your booking was cancelled as per request.';
  }

  return (
    <div 
      onClick={() => onClick(booking)}
      className="bg-white border border-gray-200 rounded-sm p-4 hover:shadow-md cursor-pointer transition-shadow mb-3 flex flex-col md:flex-row md:items-center gap-6"
    >
      {/* Image Placeholder */}
      <div className="w-20 h-20 bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400">
        <Package className="w-8 h-8" />
      </div>

      {/* Details */}
      <div className="flex-grow">
        <h3 className="text-[16px] text-gray-900 font-medium hover:text-[#2874f0] transition-colors line-clamp-1">
          {serviceNames}
        </h3>
        <p className="text-sm text-gray-500 mt-1">Provider: {booking.provider?.businessName || 'N/A'}</p>
      </div>

      {/* Price */}
      <div className="w-32 flex-shrink-0">
        <span className="text-[16px] font-medium text-gray-900">{formatPrice(booking.pricing?.total)}</span>
      </div>

      {/* Status & Action */}
      <div className="w-64 flex-shrink-0 flex flex-col">
        <div className="flex items-center gap-2 font-medium text-[14px] text-gray-900">
          <span className={`w-2.5 h-2.5 rounded-full ${statusColor}`}></span>
          {statusText}
        </div>
        <p className="text-[12px] text-gray-500 mt-1">{dateText}</p>
        
        {booking.status === 'completed' && !booking.hasReviewed && (
          <button 
            className="flex items-center gap-1.5 mt-3 text-[14px] font-medium text-[#2874f0] hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              onWriteReview(booking);
            }}
          >
            <Star className="w-4 h-4 fill-[#2874f0]" /> Rate & Review Service
          </button>
        )}
      </div>
    </div>
  );
};

// Main Page Component
const MyBookingsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingBookingId, setPayingBookingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modals & Navigation
  const [selectedBooking, setSelectedBooking] = useState(null); 
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [bookingForReview, setBookingForReview] = useState(null);
  const [trackingBooking, setTrackingBooking] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);

  // Date Filter States
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dateFilter, setDateFilter] = useState({ type: 'none', value: '' }); // type: 'exact' | 'month' | 'none'
  
  const pollingRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [selectedBooking]);

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
    if (showLoading && !selectedBooking) setLoading(true);
    try {
      const res = await fetchMyBookings(1, 50);
      if (res.success) {
        setBookings(res.data.bookings || []);
        if (selectedBooking) {
          const updated = res.data.bookings.find(b => b._id === selectedBooking._id);
          if (updated) setSelectedBooking(updated);
        }
      } else {
        setError('Failed to load bookings');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings(true);
    pollingRef.current = setInterval(() => loadBookings(false), 10000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handlePayNow = async (booking) => {
    setPayingBookingId(booking._id);
    setError(null);
    try {
      const orderRes = await createOrder({ bookingId: booking._id });
      if (!orderRes.success) throw new Error(orderRes.message || 'Failed to create order');

      if (!window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => { throw new Error('Failed to load Razorpay'); };
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
              setSuccessMessage('Payment successful! Your booking is confirmed.');
              await loadBookings(false);
            } else {
              setError('Payment verification failed.');
            }
          } catch (err) {
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
        theme: { color: '#2874f0' },
        modal: { ondismiss: () => setPayingBookingId(null) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError('Payment failed: ' + (response.error?.description || 'Unknown error'));
        setPayingBookingId(null);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Failed to initiate payment.');
      setPayingBookingId(null);
    }
  };

  const openReviewModal = (booking) => {
    setBookingForReview(booking);
    setShowReviewModal(true);
  };

  // Filter Logic
  const filteredBookings = bookings.filter((b) => {
    if (dateFilter.type === 'none' || !dateFilter.value) return true;
    
    const bDate = new Date(b.scheduledDate || b.createdAt);
    if (isNaN(bDate.getTime())) return true; // fallback if date is invalid

    if (dateFilter.type === 'exact') {
      const formattedBDate = bDate.toISOString().split('T')[0];
      return formattedBDate === dateFilter.value; // YYYY-MM-DD
    }
    
    if (dateFilter.type === 'month') {
      const formattedBMonth = bDate.toISOString().slice(0, 7);
      return formattedBMonth === dateFilter.value; // YYYY-MM
    }
    
    return true;
  });

  // ---------------------------------------------------------------------------
  // DETAIL VIEW RENDER
  // ---------------------------------------------------------------------------
  if (selectedBooking) {
    const booking = selectedBooking;
    const isCompletedUnpaid = booking.status === 'completed' && booking.payment?.status !== 'paid';

    const steps = [
      { label: 'Booking Placed', date: new Date(booking.createdAt).toLocaleDateString(), completed: true },
      { label: 'Confirmed', date: '', completed: ['confirmed', 'in_progress', 'completed'].includes(booking.status) },
      { label: 'In Progress', date: '', completed: ['in_progress', 'completed'].includes(booking.status) },
      { label: 'Completed', date: booking.status === 'completed' ? new Date().toLocaleDateString() : '', completed: booking.status === 'completed' }
    ];

    if (booking.status === 'cancelled') {
      steps.splice(1, 3, { label: 'Cancelled', date: new Date().toLocaleDateString(), completed: true, isRed: true });
    }

    return (
      <div className="min-h-screen bg-[#f1f3f6] py-6">
        <div className="max-w-[1200px] mx-auto px-4">
          <button onClick={() => setSelectedBooking(null)} className="flex items-center gap-2 text-sm text-[#2874f0] font-medium mb-4 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Bookings
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Main Details & Tracking */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-gray-200 rounded-sm p-6">
                <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
                  <div>
                    <h1 className="text-xl text-gray-900 font-normal">
                      {booking.items?.map(i => i.serviceName).join(', ')}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Provider: <span className="font-medium text-[#2874f0]">{booking.provider?.businessName || 'N/A'}</span></p>
                    <div className="text-2xl font-medium text-gray-900 mt-3">{formatPrice(booking.pricing?.total)}</div>
                  </div>
                  <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-gray-400">
                     <Package className="w-10 h-10" />
                  </div>
                </div>

                {/* Vertical Timeline */}
                <div className="py-2 px-2">
                  <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                    {steps.map((step, idx) => (
                      <div key={idx} className="relative pl-6">
                        <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                          ${step.isRed ? 'bg-red-500 border-red-500' : step.completed ? 'bg-green-500 border-green-500' : 'bg-gray-100 border-gray-300'}`}
                        >
                          {step.completed && !step.isRed && <Check className="w-3 h-3 text-white" />}
                          {step.isRed && <X className="w-3 h-3 text-white" />}
                        </div>
                        <div className="-mt-1">
                          <p className={`font-medium text-[14px] ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                          {step.date && <p className="text-[12px] text-gray-500 mt-0.5">{step.date}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-100 mt-8 pt-4 flex items-center justify-center gap-6">
                  <button onClick={() => setChatBooking(booking)} className="flex items-center gap-2 font-medium text-sm text-[#2874f0] hover:bg-blue-50 px-4 py-2 rounded">
                    <MessageCircle className="w-5 h-5" /> Chat with Provider
                  </button>
                  {['confirmed', 'in_progress'].includes(booking.status) && (
                    <button onClick={() => setTrackingBooking(booking)} className="flex items-center gap-2 font-medium text-sm text-[#2874f0] hover:bg-blue-50 px-4 py-2 rounded">
                      <MapPin className="w-5 h-5" /> Live Tracking
                    </button>
                  )}
                </div>
              </div>

              {/* Rate Experience Section */}
              {booking.status === 'completed' && !booking.hasReviewed && (
                <div className="bg-white border border-gray-200 rounded-sm p-6">
                  <h2 className="text-[18px] font-medium text-gray-900 mb-4">Rate your experience</h2>
                  <div className="flex items-center justify-between border border-gray-200 rounded-md p-4 bg-gray-50/50">
                    <div className="flex items-center gap-6">
                      <div className="flex gap-1.5">
                        <span className="text-sm font-medium mr-2">Great</span>
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 text-green-600 fill-green-600" />)}
                      </div>
                    </div>
                    <button onClick={() => openReviewModal(booking)} className="flex items-center gap-2 text-[#2874f0] border border-[#2874f0] px-4 py-2 rounded text-sm font-medium hover:bg-blue-50 transition-colors">
                      <Star className="w-4 h-4" /> Write review
                    </button>
                  </div>
                </div>
              )}

              <div className="text-xs text-[#2874f0] pt-2 flex items-center gap-1 cursor-pointer">
                Order #{booking.bookingId} <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* Right Column - Delivery & Price Details */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-sm p-5">
                <h2 className="text-[16px] text-gray-900 font-medium mb-4 pb-3 border-b border-gray-100">Service details</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <Home className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900 block mb-1">Customer Location</span>
                      <span className="text-gray-600 leading-relaxed">{booking.location?.address || 'Address details unavailable.'}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900 block mb-1">Provider Contact</span>
                      <span className="text-gray-600">{booking.provider?.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-sm p-5">
                <h2 className="text-[16px] text-gray-900 font-medium mb-4 pb-3 border-b border-gray-100">Price details</h2>
                <div className="space-y-3 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Listing price</span>
                    <span className="text-gray-900">{formatPrice(booking.pricing?.subtotal)}</span>
                  </div>
                  {(booking.pricing?.additionalCharges > 0) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Extra charges</span>
                      <span className="text-gray-900">{formatPrice(booking.pricing?.additionalCharges)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(booking.pricing?.discount || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between font-medium text-gray-900 text-base pt-3 border-t border-dashed border-gray-200">
                    <span>Total amount</span>
                    <span>{formatPrice(booking.pricing?.total)}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {booking.payment?.status === 'paid' ? (
                      <div className="flex items-center justify-between text-sm p-3 bg-gray-50 border border-gray-200 rounded-sm">
                        <span className="text-gray-700">Paid By</span>
                        <span className="font-bold text-gray-900 border border-gray-300 px-2 py-0.5 bg-white text-xs rounded">ONLINE</span>
                      </div>
                    ) : booking.payment?.method === 'cod' ? (
                      <div className="flex items-center justify-between text-sm p-3 bg-gray-50 border border-gray-200 rounded-sm">
                        <span className="text-gray-700">Payment</span>
                        <span className="font-bold text-gray-900">Cash on Delivery</span>
                      </div>
                    ) : (
                       <button onClick={() => handlePayNow(booking)} disabled={payingBookingId === booking._id} className="w-full bg-[#fb641b] text-white py-3 rounded-sm font-medium shadow-sm hover:bg-[#f35b12] flex justify-center items-center gap-2">
                        {payingBookingId === booking._id ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        {payingBookingId === booking._id ? 'Processing...' : 'Pay Now'}
                      </button>
                    )}

                    <button className="w-full mt-3 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2.5 rounded-sm font-medium text-sm hover:bg-gray-50">
                      <Download className="w-4 h-4" /> Download Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // LIST VIEW RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#f1f3f6] py-6">
      <div className="max-w-[1000px] mx-auto px-4">
        
        {/* Updated Header with Filter Button */}
        <div className="flex justify-between items-center mb-4 bg-white p-4 border border-gray-200 rounded-sm shadow-sm relative">
          <h1 className="text-xl font-medium text-gray-900">My Bookings</h1>
          <button 
            onClick={() => setShowFilterModal(!showFilterModal)} 
            className={`flex items-center gap-2 text-sm border px-4 py-2 rounded-sm transition-colors ${dateFilter.type !== 'none' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" /> 
            {dateFilter.type !== 'none' ? 'Filters Applied' : 'Filter'}
          </button>

          {/* Filter Popover Modal */}
          {showFilterModal && (
            <div className="absolute top-[110%] right-0 bg-white border border-gray-200 rounded-sm shadow-xl p-5 w-72 z-50">
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h3 className="font-medium text-gray-800">Filter By Date</h3>
                <button onClick={() => setShowFilterModal(false)}><X className="w-4 h-4 text-gray-500 hover:text-gray-800" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Exact Date</label>
                  <input 
                    type="date" 
                    value={dateFilter.type === 'exact' ? dateFilter.value : ''}
                    onChange={(e) => setDateFilter({ type: 'exact', value: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-sm text-sm focus:outline-blue-500"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs text-gray-400">OR</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Select Month & Year</label>
                  <input 
                    type="month" 
                    value={dateFilter.type === 'month' ? dateFilter.value : ''}
                    onChange={(e) => setDateFilter({ type: 'month', value: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-sm text-sm focus:outline-blue-500"
                  />
                </div>
              </div>

              <div className="mt-5 pt-3 border-t flex justify-end gap-2">
                <button 
                  onClick={() => { setDateFilter({ type: 'none', value: '' }); setShowFilterModal(false); }}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-sm font-medium"
                >
                  Clear Filters
                </button>
                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-1.5 text-sm bg-[#2874f0] text-white rounded-sm font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-sm flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-sm flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {loading && bookings.length === 0 ? (
          <div className="flex justify-center py-20 bg-white border border-gray-200 rounded-sm">
            <Loader2 className="w-8 h-8 text-[#2874f0] animate-spin" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-sm p-16 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h2>
            <p className="text-gray-500 text-sm mb-6">We couldn't find any bookings matching your current filter.</p>
            {dateFilter.type !== 'none' ? (
               <button onClick={() => setDateFilter({ type: 'none', value: '' })} className="text-[#2874f0] font-medium hover:underline">
                 Clear Filters
               </button>
            ) : (
              <Link to="/" className="inline-block bg-[#2874f0] text-white px-6 py-2 rounded-sm font-medium hover:bg-blue-700">
                Explore Services
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            {filteredBookings.map(booking => (
              <BookingListItem
                key={booking._id}
                booking={booking}
                onClick={setSelectedBooking}
                onWriteReview={openReviewModal}
              />
            ))}
          </div>
        )}
      </div>

      {showReviewModal && bookingForReview && (
        <ReviewModal booking={bookingForReview} onClose={() => setShowReviewModal(false)} onSuccess={() => loadBookings(false)} />
      )}

      {/* Detail Modals overlay */}
      {trackingBooking && (
        <div className="fixed inset-0 bg-black/50 z-[1100] flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Live Tracking</h3>
              <button onClick={() => setTrackingBooking(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <LiveTrackingMap initialCenter={[28.6139, 77.2090]} providerLocation={null} />
            <p className="text-xs text-gray-500 text-center mt-3">Provider's live location will appear once shared.</p>
          </div>
        </div>
      )}

      {chatBooking && (
        <ChatBox
          bookingId={chatBooking._id}
          providerName={chatBooking.provider?.businessName}
          customerName={user?.fullName || user?.firstName}
          onClose={() => setChatBooking(null)}
        />
      )}
    </div>
  );
};

export default MyBookingsPage;