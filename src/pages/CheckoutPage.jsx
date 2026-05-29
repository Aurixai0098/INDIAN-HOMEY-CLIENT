// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchAddresses, addAddress, createBooking } from '../services/api';
import { ArrowLeft, MapPin, Plus, Truck, Shield, Clock, Building2, Home, Briefcase, ShoppingCart, X } from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ type: 'home', street: '', landmark: '', city: '', state: '', pincode: '', isDefault: false });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  
  const [problemDescription, setProblemDescription] = useState('');
  const [problemImages, setProblemImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const directBooking = location.state?.directBooking;
    if (directBooking) {
      const item = {
        serviceId: directBooking.serviceId,
        providerId: directBooking.providerId,
        providerName: directBooking.providerName,
        name: directBooking.serviceName,
        price: directBooking.price,
        priceUnit: directBooking.priceUnit,
        quantity: 1,
        categoryId: directBooking.categoryId,
        image: directBooking.image,
      };
      setCheckoutItems([item]);
    } else {
      setCheckoutItems(cartItems);
    }
  }, [location.state, cartItems]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const addrRes = await fetchAddresses();
        if (addrRes.success) {
          setAddresses(addrRes.data.addresses || []);
          const defaultAddr = addrRes.data.addresses?.find(a => a.isDefault);
          if (defaultAddr) setSelectedAddress(defaultAddr);
          else if (addrRes.data.addresses?.length) setSelectedAddress(addrRes.data.addresses[0]);
        }
      } catch (error) { console.error(error); }
    };
    if (user) loadData();
  }, [user]);

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const platformFee = 29;
  const gst = subtotal * 0.18;
  const total = subtotal + platformFee + gst;

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await addAddress(newAddress);
      if (response.success) {
        const updated = await fetchAddresses();
        setAddresses(updated.data.addresses);
        setSelectedAddress(updated.data.addresses.find(a => a.isDefault) || updated.data.addresses[0]);
        setShowAddressForm(false);
        setNewAddress({ type: 'home', street: '', landmark: '', city: '', state: '', pincode: '', isDefault: false });
      } else alert('Failed to add address');
    } catch (err) { alert('Failed to add address'); }
    finally { setLoading(false); }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + problemImages.length > 3) {
      alert('You can upload at most 3 images');
      return;
    }
    setProblemImages([...problemImages, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...problemImages];
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setProblemImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { alert('Please select or add a delivery address'); return; }
    if (checkoutItems.length === 0) { alert('Your cart is empty'); return; }

    setProcessing(true);
    try {
      const firstItem = checkoutItems[0];
      const categoryId = firstItem.categoryId;
      const services = [{ service: firstItem.serviceId, quantity: firstItem.quantity, notes: orderNote || undefined }];
      const serviceAddress = {
        street: selectedAddress.street,
        landmark: selectedAddress.landmark || '',
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        type: selectedAddress.type || 'home'
      };
      const payment = { method: 'cod', status: 'pending' };
      const scheduledTime = { start: '10:00' };
      const scheduledDate = new Date().toISOString().split('T')[0];

      const formData = new FormData();
      formData.append('services', JSON.stringify(services));
      formData.append('scheduledDate', scheduledDate);
      formData.append('scheduledTime', JSON.stringify(scheduledTime));
      formData.append('serviceAddress', JSON.stringify(serviceAddress));
      formData.append('payment', JSON.stringify(payment));
      formData.append('notes', orderNote);
      formData.append('category', categoryId);
      formData.append('providerId', firstItem.providerId);
      formData.append('problemDescription', problemDescription);
      problemImages.forEach(img => formData.append('images', img));

      const bookingRes = await createBooking(formData);
      if (!bookingRes.success) {
        const errorMsg = bookingRes.errors ? bookingRes.errors.map(e => `${e.field}: ${e.message}`).join(', ') : bookingRes.message || 'Failed to create booking';
        throw new Error(errorMsg);
      }
      const bookingId = bookingRes.data.booking._id;
      if (!location.state?.directBooking) clearCart();
      navigate('/order-success', { state: { bookingId } });
    } catch (error) {
      console.error('Booking error:', error);
      alert(error.message || 'Failed to create booking. Please try again.');
    } finally { setProcessing(false); }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><ShoppingCart className="w-12 h-12 text-gray-400" /></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No items to checkout</h2>
          <p className="text-gray-500 mb-6">Add services to your cart or use "Book Now"</p>
          <Link to="/" className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700">Browse Services</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"><ArrowLeft className="w-5 h-5" /> Back</button>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN */}
          <div className="flex-1 space-y-6">
            {/* Address Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-600" /> Delivery Address</h2>
              {addresses.length === 0 && !showAddressForm && (
                <button onClick={() => setShowAddressForm(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-emerald-600 font-medium flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add New Address</button>
              )}
              {!showAddressForm && addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <label key={addr._id} className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition ${selectedAddress?._id === addr._id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                      <input type="radio" name="address" checked={selectedAddress?._id === addr._id} onChange={() => setSelectedAddress(addr)} className="mt-1 text-emerald-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {addr.type === 'home' && <Home className="w-4 h-4" />}
                          {addr.type === 'work' && <Briefcase className="w-4 h-4" />}
                          {addr.type === 'other' && <Building2 className="w-4 h-4" />}
                          <span className="font-medium capitalize">{addr.type}</span>
                          {addr.isDefault && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Default</span>}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{addr.street}, {addr.landmark ? addr.landmark + ', ' : ''}{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    </label>
                  ))}
                  <button onClick={() => setShowAddressForm(true)} className="text-emerald-600 text-sm font-medium flex items-center gap-1 mt-2"><Plus className="w-4 h-4" /> Add another address</button>
                </div>
              )}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="space-y-3 mt-3">
                  <select value={newAddress.type} onChange={e => setNewAddress({...newAddress, type: e.target.value})} className="w-full p-2 border rounded-lg">
                    <option value="home">Home</option><option value="work">Work</option><option value="other">Other</option>
                  </select>
                  <input type="text" placeholder="Street address" required value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-2 border rounded-lg" />
                  <input type="text" placeholder="Landmark (optional)" value={newAddress.landmark} onChange={e => setNewAddress({...newAddress, landmark: e.target.value})} className="w-full p-2 border rounded-lg" />
                  <input type="text" placeholder="City" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full p-2 border rounded-lg" />
                  <input type="text" placeholder="State" required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full p-2 border rounded-lg" />
                  <input type="text" placeholder="Pincode" required pattern="[0-9]{6}" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full p-2 border rounded-lg" />
                  <label className="flex items-center gap-2"><input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} /> <span className="text-sm">Set as default address</span></label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowAddressForm(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg">Save Address</button>
                  </div>
                </form>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-4">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b border-gray-100">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">🛠️</div>}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.providerName}</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-emerald-600 font-semibold">₹{item.price} / {item.priceUnit}</span>
                        <span className="text-gray-600">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <textarea placeholder="Any special instructions for the provider? (optional)" value={orderNote} onChange={e => setOrderNote(e.target.value)} className="w-full p-3 border rounded-lg text-sm" rows="2" />
              </div>
            </div>

            {/* Problem Description & Images */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Describe the issue (Optional but recommended)</h2>
              <textarea
                rows={3}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="E.g., Switch board not working, wire burnt, fan not rotating, etc."
                className="w-full border rounded-lg p-3 text-sm"
              />
              <div className="mt-3">
                <label className="block text-sm font-medium mb-2">Upload photos (max 3)</label>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="mb-2" />
                <div className="flex gap-2 flex-wrap">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden">
                      <img src={src} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Upload clear photos to help the provider quote accurately.</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:w-96 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Price Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Platform Fee</span><span>₹{platformFee.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>GST (18%)</span><span>₹{gst.toFixed(2)}</span></div>
                <div className="border-t pt-3 mt-3"><div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{total.toFixed(2)}</span></div></div>
              </div>
              <div className="mt-4 text-sm text-gray-500 bg-amber-50 p-3 rounded-lg">💵 Payment will be collected after service completion (price will be confirmed by provider)</div>
              <button onClick={handlePlaceOrder} disabled={processing || !selectedAddress} className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50">
                {processing ? 'Creating Booking...' : 'Confirm Booking'}
              </button>
              <div className="mt-4 text-xs text-gray-500 flex flex-col gap-2">
                <div className="flex items-center gap-1"><Shield className="w-3 h-3" /> No online payment required</div>
                <div className="flex items-center gap-1"><Truck className="w-3 h-3" /> Free cancellation before service</div>
                <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> Same day service available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;