// src/pages/provider/ProviderBookings.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Calendar, Clock, User, Package, IndianRupee, 
  CheckCircle, AlertCircle, Eye, RefreshCw, Shield, 
  AlertTriangle, Loader2, X, KeyRound, CreditCard,
  ChevronRight, Phone, MessageCircle, MapPin, Bell,
  Settings, Save, Crosshair, Search
} from 'lucide-react';
import { 
  fetchMyBookings, confirmBooking, startBooking, 
  completeBooking, generateBookingOTP, fetchProviderVerificationStatus,
  fetchProviderProfile, acceptBooking, updateServiceArea
} from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useBookingRequests } from '../../context/BookingRequestContext';
import ChatBox from '../../components/booking/ChatBox';
import LocationMapModal from '../../components/booking/LocationMapModal';

// Expiration Timer Component
const ExpirationTimer = ({ expiry, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      if (remaining <= 0) {
        clearInterval(interval);
        onExpire();
        setTimeLeft('Expired');
      } else {
        setTimeLeft(`${remaining}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiry, onExpire]);
  return <span className="text-xs text-amber-600 font-mono ml-2">Expires in {timeLeft}</span>;
};

// Audio setup (for local sound)
let audioCtx = null;
const playNotybell = async () => {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    const response = await fetch('/notybell.mp3');
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
  } catch (err) { console.warn('Sound play failed:', err); }
};

// Helper: Geocode city
const geocodeCity = async (cityName) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'GharSevaApp/1.0' } });
    const data = await res.json();
    if (data && data.length) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (err) { console.error('Geocoding error:', err); }
  return null;
};

// ======================== Service Area Modal (Proper Form) ========================
const ServiceAreaModal = ({ isOpen, onClose, currentArea, onUpdate }) => {
  const [formData, setFormData] = useState({
    cities: currentArea?.cities || [],
    pincodes: currentArea?.pincodes || [],
    radius: currentArea?.radius || 10,
    coordinates: currentArea?.coordinates || {
      type: 'Point',
      coordinates: [0, 0]
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [pincodeInput, setPincodeInput] = useState('');
  const [latInput, setLatInput] = useState(formData.coordinates.coordinates[1] || '');
  const [lngInput, setLngInput] = useState(formData.coordinates.coordinates[0] || '');

  useEffect(() => {
    if (currentArea) {
      setFormData({
        cities: currentArea.cities || [],
        pincodes: currentArea.pincodes || [],
        radius: currentArea.radius || 10,
        coordinates: currentArea.coordinates || { type: 'Point', coordinates: [0, 0] }
      });
      setLatInput(currentArea.coordinates?.coordinates[1] || '');
      setLngInput(currentArea.coordinates?.coordinates[0] || '');
    }
  }, [currentArea]);

  const addCity = () => {
    if (cityInput.trim() && !formData.cities.includes(cityInput.trim())) {
      setFormData(prev => ({ ...prev, cities: [...prev.cities, cityInput.trim()] }));
      setCityInput('');
    }
  };
  const removeCity = (city) => {
    setFormData(prev => ({ ...prev, cities: prev.cities.filter(c => c !== city) }));
  };
  const addPincode = () => {
    if (pincodeInput.trim() && !formData.pincodes.includes(pincodeInput.trim())) {
      setFormData(prev => ({ ...prev, pincodes: [...prev.pincodes, pincodeInput.trim()] }));
      setPincodeInput('');
    }
  };
  const removePincode = (pincode) => {
    setFormData(prev => ({ ...prev, pincodes: prev.pincodes.filter(p => p !== pincode) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!latInput || !lngInput) {
      setError('Please set center coordinates (latitude & longitude)');
      return;
    }
    const coordinates = { type: 'Point', coordinates: [parseFloat(lngInput), parseFloat(latInput)] };
    const payload = {
      cities: formData.cities,
      pincodes: formData.pincodes,
      radius: formData.radius,
      coordinates
    };
    setLoading(true);
    setError('');
    try {
      await onUpdate(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update service area');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Set Service Area</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cities */}
          <div>
            <label className="block text-sm font-medium mb-1">Cities you serve</label>
            <div className="flex gap-2">
              <input type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)} placeholder="e.g., Jaipur" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
              <button type="button" onClick={addCity} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.cities.map(city => (
                <span key={city} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                  {city}
                  <button type="button" onClick={() => removeCity(city)} className="text-red-500 hover:text-red-700">×</button>
                </span>
              ))}
            </div>
          </div>
          {/* Pincodes */}
          <div>
            <label className="block text-sm font-medium mb-1">Pincodes you serve</label>
            <div className="flex gap-2">
              <input type="text" value={pincodeInput} onChange={(e) => setPincodeInput(e.target.value)} placeholder="e.g., 302001" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
              <button type="button" onClick={addPincode} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.pincodes.map(pin => (
                <span key={pin} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                  {pin}
                  <button type="button" onClick={() => removePincode(pin)} className="text-red-500 hover:text-red-700">×</button>
                </span>
              ))}
            </div>
          </div>
          {/* Radius */}
          <div>
            <label className="block text-sm font-medium mb-1">Radius (km) – optional</label>
            <input type="number" min="1" max="100" value={formData.radius} onChange={(e) => setFormData(prev => ({ ...prev, radius: parseInt(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
            <p className="text-xs text-gray-500 mt-1">If set, providers within this radius will be matched.</p>
          </div>
          {/* Coordinates */}
          <div>
            <label className="block text-sm font-medium mb-1">Service Area Center (Latitude, Longitude)</label>
            <div className="flex gap-2">
              <input type="number" step="any" placeholder="Latitude" value={latInput} onChange={(e) => setLatInput(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm" />
              <input type="number" step="any" placeholder="Longitude" value={lngInput} onChange={(e) => setLngInput(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Used for distance-based matching.</p>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Service Area'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ======================== MAIN ProviderBookings Component ========================
const ProviderBookings = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { incomingRequests, acceptRequest } = useBookingRequests(); // ✅ global state
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [actionLoading, setActionLoading] = useState(null);
  const [otpModal, setOtpModal] = useState({ show: false, bookingId: null, otp: '', generating: false });
  const [completing, setCompleting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const pollingRef = useRef(null);
  const [providerData, setProviderData] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);
  const [locationWarning, setLocationWarning] = useState({ show: false, message: '' });
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [showServiceAreaModal, setShowServiceAreaModal] = useState(false);
  const [socketStatus, setSocketStatus] = useState('checking');
  const [testMessage, setTestMessage] = useState('');
  const locationInterval = useRef(null);

  // Manual open chat function
  const openChatForBooking = (booking) => {
    setChatBooking(booking);
  };
  const closeChat = () => {
    setChatBooking(null);
  };

  // Socket status monitoring
  useEffect(() => {
    if (!socket) {
      setSocketStatus('disconnected');
      return;
    }
    setSocketStatus(socket.connected ? 'connected' : 'disconnected');
    const onConnect = () => setSocketStatus('connected');
    const onDisconnect = () => setSocketStatus('disconnected');
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  const reregisterSocket = () => {
    if (socket && user) {
      socket.emit('register', { userId: user._id, role: 'provider' });
      setTestMessage('Re-registered! Waiting for booking...');
      setTimeout(() => setTestMessage(''), 3000);
    }
  };

  const updateLiveLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch('/api/v1/providers/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ lat: latitude, lng: longitude })
          });
          const data = await res.json();
          if (data.data?.withinServiceArea === false) {
            setLocationWarning({ show: true, message: '⚠️ You are outside your service area. Bookings may not reach you.' });
          } else {
            setLocationWarning({ show: false, message: '' });
          }
        } catch (err) {
          console.error('Location update failed:', err);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocationWarning({ show: true, message: 'Unable to get your location. Please enable GPS and refresh.' });
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  };

  const handleUpdateServiceArea = async (newArea) => {
    const res = await updateServiceArea(newArea);
    if (res.success) {
      await loadProviderData();
      updateLiveLocation();
    } else {
      throw new Error(res.message || 'Update failed');
    }
  };

  useEffect(() => {
    updateLiveLocation();
    locationInterval.current = setInterval(updateLiveLocation, 30000);
    return () => {
      if (locationInterval.current) clearInterval(locationInterval.current);
    };
  }, []);

  useEffect(() => {
    const unlockAudio = async () => {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') await audioCtx.resume();
      } catch (err) {}
    };
    document.addEventListener('click', unlockAudio, { once: true });
    return () => document.removeEventListener('click', unlockAudio);
  }, []);

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
    } catch (err) { console.error('Failed to load provider data', err); }
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
    } catch (err) { console.error(err); setLoading(false); }
  };

  const startPolling = () => {
    pollingRef.current = setInterval(() => { loadBookings(false); }, 10000);
  };

  const loadBookings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetchMyBookings(1, 50, '');
      if (res.success) setBookings(res.data.bookings || []);
    } catch (err) { console.error(err); }
    finally { if (showLoading) setLoading(false); }
  };

  useEffect(() => {
    if (verificationStatus?.verificationStatus === 'verified') loadBookings(true);
  }, []);

  const handleConfirm = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await confirmBooking(bookingId);
      loadBookings(false);
    } catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  };

  const handleStart = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await startBooking(bookingId);
      loadBookings(false);
    } catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  };

  const handleGenerateOTP = async (bookingId) => {
    setOtpModal({ show: true, bookingId, otp: '', generating: true });
    try {
      const res = await generateBookingOTP(bookingId);
      if (res.success) setOtpModal({ show: true, bookingId, otp: res.otp, generating: false });
      else { alert(res.message || 'Failed to generate OTP'); setOtpModal({ show: false, bookingId: null, otp: '', generating: false }); }
    } catch (err) { alert(err.message); setOtpModal({ show: false, bookingId: null, otp: '', generating: false }); }
  };

  const handleComplete = async (bookingId, otp) => {
    if (!otp) { alert('Please enter the OTP'); return; }
    setCompleting(true);
    try {
      await completeBooking(bookingId, otp);
      setOtpModal({ show: false, bookingId: null, otp: '', generating: false });
      loadBookings(false);
    } catch (err) { alert(err.message); }
    finally { setCompleting(false); }
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
        <div className="flex gap-2">
          <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${socketStatus === 'connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <div className={`w-2 h-2 rounded-full ${socketStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            Socket: {socketStatus}
          </div>
          <button onClick={reregisterSocket} className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600">Re‑register Socket</button>
          <button onClick={() => setShowServiceAreaModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-2">
            <Settings className="w-4 h-4" /> Set Service Area
          </button>
          <button onClick={() => loadBookings(true)} className="p-2 bg-white border rounded-xl"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>
      {testMessage && <div className="mb-2 text-sm text-blue-600">{testMessage}</div>}

      {locationWarning.show && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {locationWarning.message}
        </div>
      )}

      <div className="mb-4 p-3 bg-blue-50 rounded-xl text-sm">
        <div className="flex justify-between items-center">
          <p className="font-semibold">📌 How booking matching works:</p>
          <div className="flex gap-2">
            <button onClick={() => setShowLocationMap(true)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition">
              <MapPin className="w-3 h-3 inline mr-1" /> View on Map
            </button>
          </div>
        </div>
        <ul className="list-disc list-inside text-xs text-gray-600 mt-2">
          <li>Your live location (GPS) is used – updated every 30 sec</li>
          <li>You must be within {providerData?.serviceArea?.radius || 10} km of customer's address</li>
          <li>Your status must be Verified & Available</li>
          <li>Your working hours must match booking time</li>
          {locationWarning.show && <li className="text-red-600">⚠️ You are currently outside your service area – bookings won't reach you.</li>}
        </ul>
      </div>

      {/* Incoming Requests Section – uses global state */}
      {incomingRequests.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 font-semibold"><Bell className="w-5 h-5" /> New Booking Requests ({incomingRequests.length})</div>
          {incomingRequests.map(req => (
            <div key={req.bookingId} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex justify-between items-center flex-wrap gap-3">
              <div>
                <p className="font-semibold">{req.customerName} wants <span className="text-emerald-600">{req.serviceName}</span></p>
                <p className="text-sm">Amount: ₹{req.amount} | Date: {new Date(req.scheduledDate).toLocaleDateString()}</p>
                <p className="text-xs truncate">{req.address?.street}, {req.address?.city}</p>
                {req.expiresAt && <ExpirationTimer expiry={req.expiresAt} onExpire={() => {}} />}
              </div>
              <button onClick={() => acceptRequest(req.bookingId)} className="px-5 py-2 bg-emerald-600 text-white rounded-lg">Accept Booking</button>
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
                    {isActive && <button onClick={() => openChatForBooking(booking)} className="text-sm text-purple-600"><MessageCircle className="w-4 h-4 inline mr-1" /> Chat</button>}
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
          onClose={closeChat}
        />
      )}

      {showLocationMap && (
        <LocationMapModal
          currentLocation={providerData?.currentLocation}
          serviceAreaCenter={providerData?.serviceArea?.coordinates}
          radiusKm={providerData?.serviceArea?.radius || 10}
          onClose={() => setShowLocationMap(false)}
        />
      )}

      {showServiceAreaModal && (
        <ServiceAreaModal
          isOpen={showServiceAreaModal}
          onClose={() => setShowServiceAreaModal(false)}
          currentArea={providerData?.serviceArea}
          onUpdate={handleUpdateServiceArea}
        />
      )}
    </div>
  );
};

export default ProviderBookings;