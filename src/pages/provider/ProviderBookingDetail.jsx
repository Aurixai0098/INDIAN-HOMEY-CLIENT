// src/pages/provider/ProviderBookingDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, User, Package, IndianRupee, 
  CheckCircle, AlertCircle, AlertTriangle, Loader2, 
  CreditCard, Phone, MessageCircle, MapPin, ArrowLeft,
  DollarSign, Info, Star, Briefcase, Shield, 
  ChevronRight, Home, Building2, Mail, ThumbsUp
} from 'lucide-react';
import { fetchBookingById, fetchProviderProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Loading Skeleton
const DetailSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded-lg w-48 mb-4"></div>
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-7 bg-gray-200 rounded w-40"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
        ))}
      </div>
    </div>
  </div>
);

const ProviderBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingRes, profileRes] = await Promise.all([
        fetchBookingById(id),
        fetchProviderProfile()
      ]);
      
      if (bookingRes.success) {
        setBooking(bookingRes.data.booking);
      } else {
        setError(bookingRes.message || 'Booking not found');
      }
      
      if (profileRes.success) {
        setProviderProfile(profileRes.data.provider);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        label: 'Pending', 
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        bgLight: 'bg-amber-50',
        icon: AlertCircle,
        gradient: 'from-amber-400 to-orange-400'
      },
      confirmed: { 
        label: 'Confirmed', 
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        bgLight: 'bg-blue-50',
        icon: CheckCircle,
        gradient: 'from-blue-400 to-indigo-400'
      },
      in_progress: { 
        label: 'In Progress', 
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        bgLight: 'bg-purple-50',
        icon: Clock,
        gradient: 'from-purple-400 to-violet-400'
      },
      completed: { 
        label: 'Completed', 
        color: 'bg-green-100 text-green-700 border-green-200',
        bgLight: 'bg-green-50',
        icon: CheckCircle,
        gradient: 'from-emerald-400 to-teal-400'
      },
      cancelled: { 
        label: 'Cancelled', 
        color: 'bg-red-100 text-red-700 border-red-200',
        bgLight: 'bg-red-50',
        icon: AlertTriangle,
        gradient: 'from-red-400 to-rose-400'
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <DetailSkeleton />;

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Not Found</h2>
        <p className="text-gray-500 max-w-md mb-6">
          {error || 'The booking you are looking for does not exist or has been removed.'}
        </p>
        <Link 
          to="/provider/bookings" 
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bookings
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;
  const isPaid = booking.payment?.status === 'paid';
  const rating = providerProfile?.rating?.average || 0;
  const reviewCount = providerProfile?.rating?.count || 0;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link to="/provider" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/provider/bookings" className="hover:text-emerald-600 transition-colors">Bookings</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 font-medium truncate">{booking.bookingId}</span>
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate('/provider/bookings')}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors mb-5 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> 
        Back to all bookings
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header with gradient */}
        <div className={`relative bg-gradient-to-r ${statusConfig.gradient} px-6 py-8 text-white overflow-hidden`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">Booking Details</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30`}>
                  <StatusIcon className="w-4 h-4" />
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-white/80 text-sm font-mono">ID: {booking.bookingId}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">₹{booking.pricing?.total?.toLocaleString()}</div>
              {isPaid ? (
                <span className="inline-flex items-center gap-1 text-xs bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full mt-1">
                  <CreditCard className="w-3 h-3" /> Payment Received
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full mt-1">
                  <AlertCircle className="w-3 h-3" /> Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Provider Profile Section */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600" /> Your Profile
          </h3>
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(providerProfile?.businessName || user?.firstName || 'Provider')}&background=10b981&color=fff&size=80`}
              alt="Provider Avatar"
              className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md"
            />
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 text-lg">{providerProfile?.businessName || `${user?.firstName} ${user?.lastName}`}</h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({reviewCount} reviews)</span>
                {providerProfile?.verificationStatus === 'verified' && (
                  <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {booking.timeline && booking.timeline.length > 0 && (
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" /> Timeline
            </h3>
            <div className="relative">
              <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-5">
                {booking.timeline.map((event, idx) => (
                  <div key={idx} className="relative flex items-start gap-3 pl-6">
                    <div className="absolute left-0 w-5 h-5 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 capitalize">{event.status.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>
                      {event.note && <p className="text-xs text-gray-500 mt-1">{event.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left Column */}
          <div className="p-6 border-r border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" /> Customer Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Name</p>
                <p className="font-medium text-gray-800">{booking.customer?.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Phone</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-800">{booking.customer?.phone || 'N/A'}</p>
                  {booking.customer?.phone && (
                    <>
                      <a href={`tel:${booking.customer.phone}`} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition">
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a href={`https://wa.me/${booking.customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition">
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                <p className="font-medium text-gray-800 break-all">{booking.customer?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="p-6">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" /> Schedule & Address
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Date</p>
                <p className="font-medium text-gray-800">{formatDate(booking.scheduledDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Time Slot</p>
                <p className="font-medium text-gray-800">{booking.scheduledTime?.start} - {booking.scheduledTime?.end}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Service Address</p>
                <p className="text-gray-700 text-sm">
                  {booking.serviceAddress?.street}<br />
                  {booking.serviceAddress?.city}, {booking.serviceAddress?.state} - {booking.serviceAddress?.pincode}
                </p>
                {booking.serviceAddress?.landmark && (
                  <p className="text-xs text-gray-500 mt-1">Landmark: {booking.serviceAddress.landmark}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="p-6 border-t border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" /> Services Provided
          </h3>
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Service</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {booking.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.serviceName}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">₹{item.totalPrice?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Price Breakdown
          </h3>
          <div className="space-y-2 max-w-md">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{booking.pricing?.subtotal?.toLocaleString()}</span>
            </div>
            {booking.pricing?.taxes?.gst > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (18%)</span>
                <span className="font-medium">₹{booking.pricing.taxes.gst?.toLocaleString()}</span>
              </div>
            )}
            {booking.pricing?.convenienceFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Convenience Fee</span>
                <span className="font-medium">₹{booking.pricing.convenienceFee?.toLocaleString()}</span>
              </div>
            )}
            {booking.pricing?.discount?.amount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount {booking.pricing.discount.code ? `(${booking.pricing.discount.code})` : ''}</span>
                <span>-₹{booking.pricing.discount.amount?.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-lg text-emerald-600">₹{booking.pricing?.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Customer Notes */}
        {booking.customerNotes && (
          <div className="p-6 border-t border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600" /> Customer Notes
            </h3>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-sm text-amber-800">{booking.customerNotes}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-3 justify-end">
          {booking.customer?.phone && (
            <a
              href={`https://wa.me/${booking.customer.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          )}
          <Link
            to="/provider/bookings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderBookingDetail;