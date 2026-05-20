// src/pages/provider/ProviderBookings.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, Clock, User, Package, IndianRupee, 
  CheckCircle, AlertCircle, Eye, RefreshCw, Shield, 
  AlertTriangle, Loader2, X, KeyRound, CreditCard,
  ChevronRight, Phone, MessageCircle, MapPin, Bell
} from 'lucide-react';
import { 
  fetchMyBookings, confirmBooking, startBooking, 
  completeBooking, generateBookingOTP, fetchProviderVerificationStatus,
  fetchProviderProfile, acceptBooking
} from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import ChatBox from '../../components/booking/ChatBox';

// ✅ ऑडियो सेटअप – पहली क्लिक पर अनलॉक होगा
let audioCtx = null;

const playNotybell = async () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    const response = await fetch('/notybell.mp3'); // अपनी फ़ाइल का सही नाम + एक्सटेंशन
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
  } catch (err) {
    console.warn('Sound play failed:', err);
  }
};

const ProviderBookings = () => {
  const { socket } = useSocket();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [actionLoading, setActionLoading] = useState(null);
  const [otpModal, setOtpModal] = useState({ show: false, bookingId: null, otp: '', generating: false });
  const [completing, setCompleting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const pollingRef = useRef(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [providerData, setProviderData] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);

  // ✅ पहली क्लिक पर ऑडियो अनलॉक करें
  useEffect(() => {
    const unlockAudio = async () => {
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
        console.log('🔊 Audio unlocked');
      } catch (err) {
        console.warn('Audio unlock failed:', err);
      }
    };
    document.addEventListener('click', unlockAudio, { once: true });
    return () => document.removeEventListener('click', unlockAudio);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openChatId = params.get('openChat');
    if (openChatId && bookings.length > 0) {
      const booking = bookings.find(b => b._id === openChatId);
      if (booking) setChatBooking(booking);
    }
  }, [location.search, bookings]);

  useEffect(() => {
    checkVerification();
    loadProviderData();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const loadProviderData = async () => {
    try {
      const res = await fetchProviderProfile();
      if (res.success) setProviderData(res.data.provider);
    } catch (err) {
      console.error('Failed to load provider data', err);
    }
  };

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
      const res = await fetchMyBookings(1, 50, '');
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
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('new-booking-request', (data) => {
      setIncomingRequests(prev => [...prev, data]);
      playNotybell();  // 🔊 नई बुकिंग आने पर साउंड
    });
    socket.on('booking-taken', (data) => {
      setIncomingRequests(prev => prev.filter(req => req.bookingId !== data.bookingId));
    });
    return () => {
      socket.off('new-booking-request');
      socket.off('booking-taken');
    };
  }, [socket]);

  // ✅ बग ठीक – सिर्फ API कॉल, डुप्लीकेट socket emit नहीं
  const handleAccept = async (bookingId) => {
    setIncomingRequests(prev => prev.filter(r => r.bookingId !== bookingId));
    try {
      await acceptBooking(bookingId);
      loadBookings(true);
    } catch (err) {
      console.error('Accept error:', err);
      loadBookings(true);
    }
  };

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
      pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle },
      confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
      in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Clock },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle }
    };
    return configs[status] || configs.pending;
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'active') return booking.status === 'confirmed' || booking.status === 'in_progress';
    if (filter === 'completed') return booking.status === 'completed';
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  const getActions = (booking) => {
    const isLoading = actionLoading === booking._id;
    switch (booking.status) {
      case 'pending':
        return (
          <button onClick={() => handleConfirm(booking._id)} disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            {isLoading ? 'Confirming...' : 'Confirm Booking'}
          </button>
        );
      case 'confirmed':
        return (
          <button onClick={() => handleStart(booking._id)} disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
            {isLoading ? 'Starting...' : 'Start Service'}
          </button>
        );
      case 'in_progress':
        return (
          <button onClick={() => handleGenerateOTP(booking._id)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700">
            <KeyRound className="w-3.5 h-3.5" /> Generate OTP & Complete
          </button>
        );
      default: return null;
    }
  };

  if (verificationStatus && verificationStatus.verificationStatus !== 'verified') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6"><Shield className="w-12 h-12 text-amber-500" /></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">KYC Verification Required</h2>
        <p className="text-gray-500 max-w-md mb-6">Please complete your KYC verification to accept and manage bookings.</p>
        <Link to="/provider/kyc" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium">Complete KYC Verification</Link>
      </div>
    );
  }

  if (loading && bookings.length === 0) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  const activeCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Bookings</h1>
        <button onClick={() => loadBookings(true)} className="p-2 bg-white border rounded-xl"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {incomingRequests.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 font-semibold"><Bell className="w-5 h-5" /> New Booking Requests ({incomingRequests.length})</div>
          {incomingRequests.map(req => (
            <div key={req.bookingId} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex justify-between items-center">
              <div><p className="font-semibold">{req.customerName} wants <span className="text-emerald-600">{req.serviceName}</span></p><p className="text-sm">Amount: ₹{req.amount} | Date: {new Date(req.scheduledDate).toLocaleDateString()}</p><p className="text-xs truncate">{req.address?.street}, {req.address?.city}</p></div>
              <button onClick={() => handleAccept(req.bookingId)} className="px-5 py-2 bg-emerald-600 text-white rounded-lg">Accept Booking</button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {['active', 'all', 'completed', 'cancelled'].map(tab => {
          let label = '', count = 0;
          if (tab === 'active') { label = 'Active'; count = activeCount; }
          else if (tab === 'all') { label = 'All'; count = bookings.length; }
          else if (tab === 'completed') { label = 'Completed'; count = completedCount; }
          else if (tab === 'cancelled') { label = 'Cancelled'; count = cancelledCount; }
          return (
            <button key={tab} onClick={() => setFilter(tab)} className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === tab ? 'bg-emerald-600 text-white' : 'bg-white border'}`}>
              {label} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">No bookings found</div>
        ) : (
          filteredBookings.map(booking => {
            const statusConfig = getStatusConfig(booking.status);
            const StatusIcon = statusConfig.icon;
            const isActive = booking.status === 'confirmed' || booking.status === 'in_progress';
            return (
              <div key={booking._id} className="bg-white rounded-2xl border p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2"><span className="text-xs font-mono">{booking.bookingId}</span><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.color}`}><StatusIcon className="w-3 h-3" /> {statusConfig.label}</span></div>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1"><User className="w-3.5 h-3.5" /> {booking.customer?.fullName} <Calendar className="w-3.5 h-3.5" /> {new Date(booking.scheduledDate).toLocaleDateString()} <Clock className="w-3.5 h-3.5" /> {booking.scheduledTime.start}</div>
                  </div>
                  <div className="text-right"><div className="text-lg font-bold">₹{booking.pricing?.total}</div>{booking.payment?.status === 'paid' && <span className="text-xs text-green-600">Paid</span>}</div>
                </div>
                <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-xl">
                  <div><p className="text-xs text-gray-400">Services</p><div className="flex gap-1">{booking.items.map(item => <span key={item._id} className="px-2 py-0.5 bg-white rounded border">{item.serviceName}</span>)}</div></div>
                  <div><p className="text-xs text-gray-400">Address</p><p>{booking.serviceAddress?.street}, {booking.serviceAddress?.city}</p></div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex gap-2">
                    <Link to={`/provider/bookings/${booking._id}`} className="text-sm text-gray-500 hover:text-emerald-600"><Eye className="w-4 h-4 inline mr-1" /> View Details</Link>
                    {booking.customer?.phone && <a href={`https://wa.me/${booking.customer.phone.replace(/\D/g, '')}`} target="_blank" className="text-sm text-gray-500 hover:text-emerald-600"><MessageCircle className="w-4 h-4 inline mr-1" /> WhatsApp</a>}
                    {isActive && <button onClick={() => setChatBooking(booking)} className="text-sm text-purple-600"><MessageCircle className="w-4 h-4 inline mr-1" /> Chat</button>}
                  </div>
                  <div>{getActions(booking)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {otpModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            {otpModal.generating ? (
              <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /><p>Generating OTP...</p></div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Complete Service</h3><button onClick={() => setOtpModal({ show: false, bookingId: null, otp: '', generating: false })}><X /></button></div>
                <div className="text-center text-4xl font-mono font-bold text-emerald-600 mb-4">{otpModal.otp}</div>
                <input type="text" id="otp-input" placeholder="Enter 4-digit OTP" className="w-full border rounded-xl p-2 text-center text-lg mb-4" />
                <button onClick={() => { const otp = document.getElementById('otp-input').value; handleComplete(otpModal.bookingId, otp); }} disabled={completing} className="w-full bg-emerald-600 text-white py-2 rounded-xl">Verify & Complete</button>
              </>
            )}
          </div>
        </div>
      )}

      {chatBooking && (
        <ChatBox
          bookingId={chatBooking._id}
          providerName={providerData?.businessName || 'Provider'}
          customerName={chatBooking.customer?.fullName || 'Customer'}
          onClose={() => setChatBooking(null)}
        />
      )}
    </div>
  );
};

export default ProviderBookings;