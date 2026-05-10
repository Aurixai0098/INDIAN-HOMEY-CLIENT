// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchAddresses, addAddress, searchProviders, createBooking } from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false,
  });

  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10);

  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTimeStart, setScheduledTimeStart] = useState('10:00');
  const [scheduledTimeEnd, setScheduledTimeEnd] = useState('12:00');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
    loadAddresses();
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      loadProvidersForAddress(selectedAddress);
    }
  }, [selectedAddress, searchRadius]);

  const loadAddresses = async () => {
    try {
      const res = await fetchAddresses();
      if (res.success) {
        setAddresses(res.data.addresses || []);
        const defaultAddr = res.data.addresses?.find(addr => addr.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr);
        else if (res.data.addresses?.length > 0) setSelectedAddress(res.data.addresses[0]);
      }
    } catch (err) {
      console.error('Failed to load addresses', err);
    }
  };

  const loadProvidersForAddress = async (address) => {
    if (!cartItems.length) return;
    const firstItem = cartItems[0];
    setLoadingProviders(true);
    try {
      let lat, lng;
      if (address.coordinates?.latitude && address.coordinates?.longitude) {
        lat = address.coordinates.latitude;
        lng = address.coordinates.longitude;
      }
      const res = await searchProviders(lat, lng, searchRadius, firstItem.categoryId, address.pincode, address.city);
      if (res.success) {
        setProviders(res.data.providers || []);
      }
    } catch (err) {
      console.error('Failed to load providers', err);
    } finally {
      setLoadingProviders(false);
    }
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
          label: 'Home',
          street: '',
          city: '',
          state: '',
          pincode: '',
          landmark: '',
          isDefault: false,
        });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }
    if (!selectedProvider) {
      setError('Please select a service provider');
      return;
    }
    if (!scheduledDate) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError('');

    // Determine category from the first cart item
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
      provider: selectedProvider._id,
      services: items,
      category: firstCartItem.categoryId,   // ✅ ADD THIS LINE
      scheduledDate,
      scheduledTime: {
        start: scheduledTimeStart,
        end: scheduledTimeEnd,
      },
      serviceAddress: {
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        landmark: selectedAddress.landmark || '',
      },
      payment: {
        method: 'online',
      },
      notes: notes,
    };

    try {
      const res = await createBooking(bookingData);
      if (res.success) {
        clearCart();
        navigate('/my-bookings', { state: { bookingCreated: true } });
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
        {/* Left Column */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cartItems.map(item => (
                <div key={item.serviceId} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-3 flex justify-between font-bold">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Delivery Address</h2>
              <button onClick={() => setShowAddAddress(!showAddAddress)} className="text-emerald-600 text-sm">+ Add New</button>
            </div>
            {addresses.length === 0 && !showAddAddress && (
              <p className="text-gray-500 text-sm">No addresses found. Please add one.</p>
            )}
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

        {/* Right Column - Provider Selection */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4">Choose Service Provider</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius</label>
              <div className="flex items-center gap-2">
                <input type="range" min="5" max="50" step="5" value={searchRadius} onChange={(e) => setSearchRadius(parseInt(e.target.value))} className="flex-1" />
                <span className="text-sm font-medium w-16">{searchRadius} km</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Providers within {searchRadius} km of your address</p>
            </div>

            {!selectedAddress ? (
              <p className="text-gray-500">Please select an address to see available providers.</p>
            ) : loadingProviders ? (
              <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : providers.length === 0 ? (
              <p className="text-gray-500">No providers available for your selected address. Try increasing the radius.</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {providers.map(provider => (
                  <label key={provider._id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${selectedProvider?._id === provider._id ? 'border-emerald-500 bg-emerald-50' : ''}`}>
                    <input type="radio" name="provider" checked={selectedProvider?._id === provider._id} onChange={() => setSelectedProvider(provider)} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-semibold">{provider.businessName}</p>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-amber-500">★</span>
                          <span>{provider.rating?.average || 0} ({provider.rating?.count || 0})</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{provider.bio?.substring(0, 80)}</p>
                      <p className="text-xs text-gray-400 mt-1">{provider.experience?.years} years exp • {provider.serviceArea?.cities?.join(', ')}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

            <button
              onClick={handlePlaceOrder}
              disabled={loading || !selectedProvider || !selectedAddress}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Placing Order...' : 'Place Order & Pay'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">Payment will be processed after order confirmation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;