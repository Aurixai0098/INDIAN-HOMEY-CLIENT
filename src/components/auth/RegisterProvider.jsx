import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchCategories, fetchServices, registerProvider, register as registerUser } from '../../services/api';

const RegisterProvider = () => {
  const { user, setUser, login } = useAuth(); // login function is available
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(user ? 2 : 1); // step 1 = user reg, step 2 = provider reg

  // User registration state (only when not logged in)
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Categories & Services for provider step
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);

  const [providerForm, setProviderForm] = useState({
    businessName: '',
    bio: '',
    experience: 1,
    serviceArea: {
      coordinates: {
        type: 'Point',
        coordinates: [74.6399, 26.4499] // default Jaipur
      },
      radius: 10,
      pincodes: [],
      cities: [],
    },
    workingHours: [
      { day: 'monday', isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
      { day: 'tuesday', isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
      { day: 'wednesday', isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
      { day: 'thursday', isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
      { day: 'friday', isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
      { day: 'saturday', isWorking: true, slots: [{ startTime: '09:00', endTime: '14:00' }] },
      { day: 'sunday', isWorking: false, slots: [] },
    ],
  });

  useEffect(() => {
    loadCategoriesAndServices();
  }, []);

  const loadCategoriesAndServices = async () => {
    try {
      const [catRes, svcRes] = await Promise.all([
        fetchCategories(),
        fetchServices(1, 100),
      ]);
      if (catRes.success) setCategories(catRes.data.categories || []);
      if (svcRes.success) setServices(svcRes.data.services || []);
    } catch (err) {
      console.error('Failed to load categories/services', err);
    }
  };

  // Handle user registration step
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (userForm.password !== userForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await registerUser({
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        email: userForm.email,
        phone: userForm.phone,
        password: userForm.password
      });
      // After successful registration, login automatically (or the register API already sets cookies)
      // Then move to step 2
      setStep(2);
      // Optionally refresh user context
      if (setUser) setUser(res.data.user);
    } catch (err) {
      setError(err.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle provider registration (same as before, but using providerForm)
  const handleProviderSubmit = async (e) => {
    e.preventDefault();
    if (!providerForm.businessName || !providerForm.bio) {
      setError('Business name and bio are required');
      return;
    }
    if (!selectedCategory || selectedServices.length === 0) {
      setError('Please select at least one category and one service');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      businessName: providerForm.businessName,
      bio: providerForm.bio,
      experience: { years: providerForm.experience, description: '' },
      services: [
        {
          category: selectedCategory,
          subServices: selectedServices,
        },
      ],
      serviceArea: providerForm.serviceArea,
      workingHours: providerForm.workingHours,
    };

    try {
      const res = await registerProvider(payload);
      if (res.success) {
        setSuccess(true);
        // Update user role in context
        if (setUser) setUser(prev => ({ ...prev, role: 'provider' }));
        setTimeout(() => navigate('/provider'), 2000);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper for provider form inputs
  const handleProviderChange = (e) => {
    setProviderForm({ ...providerForm, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setSelectedCategory(catId);
    setSelectedServices([]);
  };

  const toggleService = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleWorkingHourChange = (day, field, value) => {
    setProviderForm(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(wh =>
        wh.day === day ? { ...wh, [field]: value } : wh
      ),
    }));
  };

  const handleTimeChange = (day, slotIndex, field, value) => {
    setProviderForm(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(wh =>
        wh.day === day
          ? {
              ...wh,
              slots: wh.slots.map((slot, idx) =>
                idx === slotIndex ? { ...slot, [field]: value } : slot
              ),
            }
          : wh
      ),
    }));
  };

  // If already a provider, redirect
  if (user?.role === 'provider') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">You are already a provider</h2>
          <Link to="/provider" className="text-emerald-600 hover:underline">Go to your dashboard</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Registration Submitted!</h2>
          <p className="text-gray-600 mb-4">Your application is under review. You will be notified once verified.</p>
          <Link to="/" className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 transition">Go Home</Link>
        </div>
      </div>
    );
  }

  // Step 1: User Registration (if not logged in)
  if (!user && step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create an Account</h1>
            <p className="text-gray-600 mt-2">Join as a service provider</p>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          <form onSubmit={handleUserSubmit} className="bg-white shadow-lg rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="First Name" value={userForm.firstName} onChange={e => setUserForm({...userForm, firstName: e.target.value})} className="border rounded-lg px-3 py-2" required />
              <input type="text" placeholder="Last Name" value={userForm.lastName} onChange={e => setUserForm({...userForm, lastName: e.target.value})} className="border rounded-lg px-3 py-2" required />
            </div>
            <input type="email" placeholder="Email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
            <input type="tel" placeholder="Phone (10 digits)" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
            <input type="password" placeholder="Password (min 8 chars)" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
            <input type="password" placeholder="Confirm Password" value={userForm.confirmPassword} onChange={e => setUserForm({...userForm, confirmPassword: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Continue'}
            </button>
            <p className="text-center text-sm text-gray-500">
              Already have an account? <Link to="/login" className="text-emerald-600">Login</Link>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: Provider Registration (user is logged in, either existing or just registered)
  const filteredServices = services.filter(s => s.category?._id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Become a Professional
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Complete your provider profile
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleProviderSubmit} className="space-y-8">
          {/* Business Info */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Business Information</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Business Name *</label>
                <input type="text" name="businessName" value={providerForm.businessName} onChange={handleProviderChange} className="w-full border rounded-lg px-4 py-2.5" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio / Description *</label>
                <textarea rows="4" name="bio" value={providerForm.bio} onChange={handleProviderChange} className="w-full border rounded-lg px-4 py-2.5" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Years of Experience</label>
                <input type="number" name="experience" min="0" value={providerForm.experience} onChange={handleProviderChange} className="w-full border rounded-lg px-4 py-2.5" />
              </div>
            </div>
          </div>

          {/* Services Selection */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Services You Offer</h2>
            </div>
            <div className="p-6 space-y-5">
              <select value={selectedCategory} onChange={handleCategoryChange} className="w-full border rounded-lg px-4 py-2.5" required>
                <option value="">Select a category</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
              {selectedCategory && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Specific Services *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                    {filteredServices.map(service => (
                      <label key={service._id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer">
                        <input type="checkbox" checked={selectedServices.includes(service._id)} onChange={() => toggleService(service._id)} className="w-4 h-4 text-emerald-600" />
                        <span>{service.name} (₹{service.basePrice})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Working Hours</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => {
                  const wh = providerForm.workingHours.find(w => w.day === day);
                  return (
                    <div key={day} className="flex flex-wrap items-center gap-3 border-b pb-3 last:border-0">
                      <div className="w-28 font-medium capitalize">{day}</div>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={wh.isWorking} onChange={e => handleWorkingHourChange(day, 'isWorking', e.target.checked)} />
                        <span>Open</span>
                      </label>
                      {wh.isWorking && (
                        <div className="flex items-center gap-2">
                          <input type="time" value={wh.slots[0]?.startTime || '09:00'} onChange={e => handleTimeChange(day, 0, 'startTime', e.target.value)} className="border rounded px-2 py-1" />
                          <span>–</span>
                          <input type="time" value={wh.slots[0]?.endTime || '18:00'} onChange={e => handleTimeChange(day, 0, 'endTime', e.target.value)} className="border rounded px-2 py-1" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Service Area */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Service Area</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <input type="number" step="any" value={providerForm.serviceArea.coordinates.coordinates[1]} onChange={e => setProviderForm({
                    ...providerForm,
                    serviceArea: {
                      ...providerForm.serviceArea,
                      coordinates: {
                        ...providerForm.serviceArea.coordinates,
                        coordinates: [providerForm.serviceArea.coordinates.coordinates[0], parseFloat(e.target.value)]
                      }
                    }
                  })} className="w-full border rounded-lg px-4 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <input type="number" step="any" value={providerForm.serviceArea.coordinates.coordinates[0]} onChange={e => setProviderForm({
                    ...providerForm,
                    serviceArea: {
                      ...providerForm.serviceArea,
                      coordinates: {
                        ...providerForm.serviceArea.coordinates,
                        coordinates: [parseFloat(e.target.value), providerForm.serviceArea.coordinates.coordinates[1]]
                      }
                    }
                  })} className="w-full border rounded-lg px-4 py-2.5" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Service Radius (km)</label>
                <input type="number" min="1" max="50" value={providerForm.serviceArea.radius} onChange={e => setProviderForm({ ...providerForm, serviceArea: { ...providerForm.serviceArea, radius: parseInt(e.target.value) } })} className="w-full border rounded-lg px-4 py-2.5" />
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button type="submit" disabled={loading} className="w-full sm:w-auto bg-emerald-600 text-white px-12 py-3 rounded-xl font-semibold text-lg shadow-md hover:bg-emerald-700 transition disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterProvider;