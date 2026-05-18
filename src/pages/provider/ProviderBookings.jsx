// src/pages/provider/ProviderBookings.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, User, Package, IndianRupee, 
  CheckCircle, AlertCircle, Eye, RefreshCw, Shield, 
  AlertTriangle, Loader2, X, KeyRound, CreditCard,
  ChevronRight, Phone, MessageCircle, MapPin, Search
} from 'lucide-react';
import { 
  fetchMyBookings, confirmBooking, startBooking, 
  completeBooking, generateBookingOTP, fetchProviderVerificationStatus 
} from '../../services/api';

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [otpModal, setOtpModal] = useState({ show: false, bookingId: null, otp: '', generating: false });
  const [completing, setCompleting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    checkVerification();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const checkVerification = async () => {
    try {
      const res = await fetchProviderVerificationStatus();
      if (res.success) {
        setVerificationStatus(res.data);
        if (res.data.verificationStatus === 'verified') {
          loadBookings(true);
          startPolling();
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const startPolling = () => {
    pollingRef.current = setInterval(() => {
      loadBookings(false);
    }, 10000);
  };

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

  useEffect(() => {
    if (verificationStatus?.verificationStatus === 'verified') {
      loadBookings(true);
    }
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

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        label: 'Pending', 
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: AlertCircle,
        iconColor: 'text-amber-500'
      },
      confirmed: { 
        label: 'Confirmed', 
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: CheckCircle,
        iconColor: 'text-blue-500'
      },
      in_progress: { 
        label: 'In Progress', 
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: Clock,
        iconColor: 'text-purple-500'
      },
      completed: { 
        label: 'Completed', 
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        iconColor: 'text-green-500'
      },
      cancelled: { 
        label: 'Cancelled', 
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: AlertTriangle,
        iconColor: 'text-red-500'
      }
    };
    return configs[status] || configs.pending;
  };

  const getActions = (booking) => {
    const isLoading = actionLoading === booking._id;
    switch (booking.status) {
      case 'pending':
        return (
          <button
            onClick={() => handleConfirm(booking._id)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            {isLoading ? 'Confirming...' : 'Confirm Booking'}
          </button>
        );
      case 'confirmed':
        return (
          <button
            onClick={() => handleStart(booking._id)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
            {isLoading ? 'Starting...' : 'Start Service'}
          </button>
        );
      case 'in_progress':
        return (
          <button
            onClick={() => handleGenerateOTP(booking._id)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-all shadow-sm"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Generate OTP & Complete
          </button>
        );
      default:
        return null;
    }
  };

  // If not verified, show KYC required message with better UI
  if (verificationStatus && verificationStatus.verificationStatus !== 'verified') {
    const isPending = verificationStatus.verificationStatus === 'pending';
    const isRejected = verificationStatus.verificationStatus === 'rejected';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-12 h-12 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">KYC Verification Required</h2>
        <p className="text-gray-500 max-w-md mb-6">
          Please complete your KYC verification to accept and manage bookings. 
          This is mandatory for all service providers on GharSeva platform.
        </p>
        <Link 
          to="/provider/kyc" 
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30"
        >
          <Shield size={18} />
          Complete KYC Verification
        </Link>
        {isPending && (
          <p className="text-sm text-amber-600 mt-4 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> Your documents are pending admin verification.
          </p>
        )}
        {isRejected && (
          <p className="text-sm text-red-600 mt-4 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Your KYC was rejected. Please upload correct documents.
          </p>
        )}
      </div>
    );
  }

  if (loading && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-gray-500">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">View and manage all your service bookings</p>
        </div>
        <button 
          onClick={() => loadBookings(true)} 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(status => {
          const displayName = status === '' ? 'All' : status.replace('_', ' ').toUpperCase();
          const isActive = filter === status;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {displayName}
              {status !== '' && (
                <span className={`ml-2 text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                  ({bookings.filter(b => b.status === status).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No bookings found</h3>
            <p className="text-gray-400 text-sm">When customers book your services, they will appear here.</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const StatusIcon = statusConfig.icon;
            const isPaid = booking.payment?.status === 'paid';
            return (
              <div key={booking._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                {/* Booking Header */}
                <div className="p-5 border-b border-gray-50">
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                          {booking.bookingId}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {booking.customer?.fullName || booking.customer?.firstName || 'Customer'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(booking.scheduledDate).toLocaleDateString('en-IN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {booking.scheduledTime.start}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-lg font-bold text-gray-800">
                        <IndianRupee className="w-4 h-4" />
                        {booking.pricing?.total?.toLocaleString()}
                      </div>
                      {isPaid && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                          <CreditCard className="w-3 h-3" />
                          Payment Received
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="p-5 bg-gray-50/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Services</p>
                      <div className="flex flex-wrap gap-1">
                        {booking.items.map((item, idx) => (
                          <span key={idx} className="text-sm text-gray-700 bg-white px-2 py-0.5 rounded border">
                            {item.serviceName}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Address</p>
                      <p className="text-sm text-gray-600 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                        {booking.serviceAddress?.street}, {booking.serviceAddress?.city}, {booking.serviceAddress?.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 py-3 border-t border-gray-50 flex flex-wrap justify-between items-center gap-3 bg-white">
                  <div className="flex gap-2">
                    <Link 
                      to={`/provider/bookings/${booking._id}`}
                      className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>
                    {booking.customer?.phone && (
                      <a 
                        href={`https://wa.me/${booking.customer.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                  <div>
                    {getActions(booking)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* OTP Modal - Redesigned */}
      {otpModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            {otpModal.generating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">Generating OTP...</p>
                <p className="text-sm text-gray-400 mt-1">Please wait</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">Complete Service</h3>
                    <button 
                      onClick={() => setOtpModal({ show: false, bookingId: null, otp: '', generating: false })}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Share this OTP with the customer for verification</p>
                </div>
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-mono font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-wider">
                      {otpModal.otp}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Valid for 30 minutes</p>
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP from customer</label>
                    <input
                      type="text"
                      id="otp-input"
                      placeholder="Enter 4-digit OTP"
                      maxLength="4"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-center text-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const otpValue = document.getElementById('otp-input').value;
                        handleComplete(otpModal.bookingId, otpValue);
                      }}
                      disabled={completing}
                      className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
                    >
                      {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      {completing ? 'Verifying...' : 'Verify & Complete'}
                    </button>
                    <button 
                      onClick={() => setOtpModal({ show: false, bookingId: null, otp: '', generating: false })} 
                      className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
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