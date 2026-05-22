// src/pages/CheckoutPage.jsx – full updated (only relevant parts shown, replace your existing with this)

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchAddresses, addAddress, createBooking } from '../services/api';
import NearbyProvidersModal from '../components/booking/NearbyProvidersModal';
import { MapPin, AlertCircle } from 'lucide-react';

// Improved geocode with timeout and fallback
const geocodeAddress = async (address) => {
  if (!address || !address.street || !address.city || !address.pincode) return null;
  
  const query = `${address.street}, ${address.city}, ${address.state || ''}, ${address.pincode}`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { 
      headers: { 'User-Agent': 'GharSevaApp/1.0' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    if (data && data.length) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch (err) {
    console.error('Geocoding error:', err);
    return null;
  }
};

const formatPrice = (price) => `₹${Number(price).toFixed(2)}`;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

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
  const [showNearbyModal, setShowNearbyModal] = useState(false);
  const [customerCoords, setCustomerCoords] = useState(null);
  const [geocodingAddress, setGeocodingAddress] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) navigate('/cart');
    loadAddresses();
  }, []);

  // Geocode selected address
  useEffect(() => {
    if (selectedAddress) {
      setGeocodingAddress(true);
      setLocationError('');
      geocodeAddress(selectedAddress).then(coords => {
        if (coords) {
          setCustomerCoords(coords);
        } else {
          setLocationError('Could not determine location for this address. Nearby providers may not show correctly.');
        }
      }).finally(() => setGeocodingAddress(false));
    } else {
      setCustomerCoords(null);
    }
  }, [selectedAddress]);

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
        clearCart();
        navigate('/my-bookings', { 
          state: { 
            bookingCreated: true, 
            message: '✅ Booking created! You will be notified when a provider accepts.' 
          } 
        });
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

  const firstCartItem = cartItems[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
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

        {/* RIGHT COLUMN */}
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

            {/* Location status & Nearby button */}
            {geocodingAddress && (
              <div className="mt-3 text-sm text-blue-600 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                Locating address...
              </div>
            )}
            {locationError && !geocodingAddress && (
              <div className="mt-3 text-sm text-amber-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {locationError}
              </div>
            )}
            <button
              onClick={() => setShowNearbyModal(true)}
              disabled={!customerCoords}
              className="w-full mt-3 bg-blue-100 text-blue-700 py-2 rounded-xl text-sm font-medium hover:bg-blue-200 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MapPin className="w-4 h-4" /> View Nearby Providers
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddress}
              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              After placing order, you will be notified when a provider accepts.
            </p>
          </div>
        </div>
      </div>

      {/* Nearby Providers Modal */}
      {showNearbyModal && customerCoords && (
        <NearbyProvidersModal
          isOpen={showNearbyModal}
          onClose={() => setShowNearbyModal(false)}
          lat={customerCoords.lat}
          lng={customerCoords.lng}
          serviceCategory={firstCartItem?.categoryId}
        />
      )}
    </div>
  );
};

export default CheckoutPage;