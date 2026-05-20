// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { fetchAddresses, addAddress, createBooking } from '../services/api';
import MatchingProgress from '../components/booking/MatchingProgress';

// ✅ वही ऑडियो सेटअप (पब्लिक फोल्डर से notybell.mp3)
let audioCtx = null;
const playNotybell = async () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    const response = await fetch('/notybell.mp3');
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
  } catch (err) {
    console.warn('Sound failed:', err);
  }
};

const formatPrice = (price) => `₹${Number(price).toFixed(2)}`;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const socketContext = useSocket();
  const socket = socketContext?.socket;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home', street: '', city: '', state: '', pincode: '', landmark: '', isDefault: false,
  });

  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTimeStart, setScheduledTimeStart] = useState('10:00');
  const [scheduledTimeEnd, setScheduledTimeEnd] = useState('12:00');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showMatching, setShowMatching] = useState(false);
  const [matchingStep, setMatchingStep] = useState(0);
  const [matchingError, setMatchingError] = useState(null);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [matchedProvider, setMatchedProvider] = useState(null);
  const [accepted, setAccepted] = useState(false);

  // ✅ पहली क्लिक पर ऑडियो अनलॉक करें
  useEffect(() => {
    const unlock = async () => {
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
      } catch (err) {}
    };
    document.addEventListener('click', unlock, { once: true });
    return () => document.removeEventListener('click', unlock);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) navigate('/cart');
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await fetchAddresses();
      if (res.success) {
        setAddresses(res.data.addresses || []);
        const defaultAddr = res.data.addresses?.find(addr => addr.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr);
        else if (res.data.addresses?.length > 0) setSelectedAddress(res.data.addresses[0]);
      }
    } catch (err) { console.error(err); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addAddress(newAddress);
      if (res.success) {
        setAddresses(res.data.addresses);
        const added = res.data.addresses.find(addr => addr.isDefault) || res.data.addresses[res.data.addresses.length - 1];
        setSelectedAddress(added);
        setShowAddAddress(false);
        setNewAddress({
          label: 'Home', street: '', city: '', state: '', pincode: '', landmark: '', isDefault: false,
        });
      }
    } catch (err) { alert(err.message); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { setError('Please select a delivery address'); return; }
    if (!scheduledDate) { setError('Please select a date'); return; }

    setLoading(true);
    setError('');
    setAccepted(false);

    const firstCartItem = cartItems[0];
    if (!firstCartItem.categoryId) {
      setError('Category information missing. Please remove and re-add the service.');
      setLoading(false);
      return;
    }

    const items = cartItems.map(item => ({
      service: item.serviceId,
      quantity: item.quantity,
      notes: item.notes || '',
    }));

    const bookingData = {
      services: items,
      category: firstCartItem.categoryId,
      scheduledDate,
      scheduledTime: { start: scheduledTimeStart, end: scheduledTimeEnd },
      serviceAddress: {
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        landmark: selectedAddress.landmark || '',
      },
      payment: { method: paymentMethod },
      notes,
    };

    try {
      const res = await createBooking(bookingData);
      if (res.success) {
        const bookingId = res.data.booking._id;
        setCurrentBookingId(bookingId);
        
        let timeoutId = null;

        if (socket) {
          socket.on('booking-accepted', (data) => {
            if (data.bookingId === bookingId && !accepted) {
              setAccepted(true);
              if (timeoutId) clearTimeout(timeoutId);
              setMatchedProvider(data.provider);
              setMatchingStep(4);
              setShowMatching(false);
              playNotybell();  // 🔊 साउंड
              setTimeout(() => {
                clearCart();
                navigate('/my-bookings', { state: { bookingCreated: true, message: 'Booking confirmed! Provider will contact you soon.' } });
              }, 500);
            }
          });
        }

        // 3 सेकंड बाद मैचिंग मोडल दिखाएं अगर accept न हुआ हो
        timeoutId = setTimeout(() => {
          if (!accepted) {
            setShowMatching(true);
            setMatchingStep(1);
            setTimeout(() => setMatchingStep(2), 2000);
            setTimeout(() => setMatchingStep(3), 4000);
          }
        }, 3000);

        // 30 सेकंड टाइमआउट
        setTimeout(() => {
          if (!accepted && showMatching) {
            setMatchingError('No provider accepted your request. Please try again.');
          }
        }, 30000);
      } else {
        setError(res.message || 'Booking failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <Link to="/" className="text-emerald-600 hover:underline">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* LEFT COLUMN – order summary, payment method, address, schedule */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cartItems.map(item => (
                <div key={item.serviceId} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-3 flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-bold text-lg mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="w-4 h-4" />
                <div><p className="font-medium">Online Payment (Razorpay)</p><p className="text-sm text-gray-500">Pay via Credit/Debit Card, UPI, Net Banking</p></div>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4" />
                <div><p className="font-medium">Cash on Delivery (COD)</p><p className="text-sm text-gray-500">Pay cash to the service provider after service completion</p></div>
              </label>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Delivery Address</h2>
              <button onClick={() => setShowAddAddress(!showAddAddress)} className="text-emerald-600 text-sm">+ Add New</button>
            </div>
            {addresses.length === 0 && !showAddAddress && <p className="text-gray-500 text-sm">No addresses found. Please add one.</p>}
            {!showAddAddress && addresses.length > 0 && (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <label key={addr._id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="address" checked={selectedAddress?._id === addr._id} onChange={() => setSelectedAddress(addr)} className="mt-1" />
                    <div>
                      <p className="font-medium">{addr.label}</p>
                      <p className="text-sm text-gray-600">{addr.street}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                      {addr.landmark && <p className="text-sm text-gray-500">Landmark: {addr.landmark}</p>}
                    </div>
                  </label>
                ))}
              </div>
            )}
            {showAddAddress && (
              <form onSubmit={handleAddAddress} className="space-y-3 mt-3">
                <input type="text" placeholder="Label (Home, Office)" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className="w-full p-2 border rounded-lg" required />
                <input type="text" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-2 border rounded-lg" required />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="p-2 border rounded-lg" required />
                  <input type="text" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="p-2 border rounded-lg" required />
                </div>
                <input type="text" placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full p-2 border rounded-lg" required />
                <input type="text" placeholder="Landmark" value={newAddress.landmark} onChange={e => setNewAddress({...newAddress, landmark: e.target.value})} className="w-full p-2 border rounded-lg" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} />
                  Set as default address
                </label>
                <div className="flex gap-2">
                  <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg">Save</button>
                  <button type="button" onClick={() => setShowAddAddress(false)} className="text-gray-500">Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* Schedule Date & Time */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-bold text-lg mb-4">Schedule Date & Time</h2>
            <div className="space-y-3">
              <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="w-full p-2 border rounded-lg" required min={new Date().toISOString().split('T')[0]} />
              <div className="flex gap-3">
                <select value={scheduledTimeStart} onChange={e => setScheduledTimeStart(e.target.value)} className="flex-1 p-2 border rounded-lg">
                  {Array.from({ length: 12 }, (_, i) => i + 8).map(h => <option key={h} value={`${h}:00`}>{h}:00</option>)}
                </select>
                <span className="self-center">to</span>
                <select value={scheduledTimeEnd} onChange={e => setScheduledTimeEnd(e.target.value)} className="flex-1 p-2 border rounded-lg">
                  {Array.from({ length: 12 }, (_, i) => i + 9).map(h => <option key={h} value={`${h}:00`}>{h}:00</option>)}
                </select>
              </div>
              <textarea placeholder="Additional notes for provider" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded-lg" rows="2"></textarea>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN – Payment Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4">Payment Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>GST (18%)</span>
                <span>{formatPrice(cartTotal * 0.18)}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(cartTotal + cartTotal * 0.18)}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddress}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Placing Order...' : 'Place Order (Auto-match Provider)'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              After placing order, we will find the best provider near you.
            </p>
          </div>
        </div>
      </div>

      {/* Matching Modal */}
      {showMatching && (
        <div className="fixed inset-0 bg-black/50 z-[1100] flex items-center justify-center p-4">
          <MatchingProgress
            currentStep={matchingStep}
            error={matchingError}
            onCancel={() => {
              setShowMatching(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;