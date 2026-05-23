import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '..//../context/AuthContext';
import { fetchCategories, fetchServices, registerProvider } from '../../services/api';

const RegisterProvider = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Categories & Services for dropdowns
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);

  // Form fields – corrected serviceArea structure
  const [formData, setFormData] = useState({
    businessName: '',
    bio: '',
    experience: 1,
    serviceArea: {
      coordinates: {
        type: 'Point',
        coordinates: [74.6399, 26.4499]  // [lng, lat]
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

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setSelectedCategory(catId);
    setSelectedServices([]);
  };

  const toggleService = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleWorkingHourChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(wh =>
        wh.day === day ? { ...wh, [field]: value } : wh
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.businessName || !formData.bio) {
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
      businessName: formData.businessName,
      bio: formData.bio,
      experience: { years: formData.experience, description: '' },
      services: [
        {
          category: selectedCategory,
          subServices: selectedServices,
        },
      ],
      serviceArea: {
        coordinates: formData.serviceArea.coordinates,
        radius: formData.serviceArea.radius,
        pincodes: formData.serviceArea.pincodes,
        cities: formData.serviceArea.cities,
      },
      workingHours: formData.workingHours,
    };

    try {
      const res = await registerProvider(payload);
      if (res.success) {
        setSuccess(true);
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
          <Link to="/" className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Become a Professional</h1>
      <p className="text-gray-600 mb-8">Join INDIAN HOMEY and grow your business</p>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Business Name *</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={e => setFormData({...formData, businessName: e.target.value})}
                className="w-full border rounded-lg px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio / Description *</label>
              <textarea
                rows="3"
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                className="w-full border rounded-lg px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Years of Experience</label>
              <input
                type="number"
                min="0"
                value={formData.experience}
                onChange={e => setFormData({...formData, experience: parseInt(e.target.value)})}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </div>
        </div>

        {/* Services Selection */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Select Your Services</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full border rounded-lg px-4 py-2"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium mb-1">Services (select multiple) *</label>
                <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                  {services
                    .filter(s => s.category?._id === selectedCategory)
                    .map(service => (
                      <label key={service._id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service._id)}
                          onChange={() => toggleService(service._id)}
                          className="w-4 h-4"
                        />
                        <span>{service.name} (₹{service.basePrice})</span>
                      </label>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Select all services you offer</p>
              </div>
            )}
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Working Hours</h2>
          <div className="space-y-3">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
              const wh = formData.workingHours.find(w => w.day === day) || { day, isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] };
              return (
                <div key={day} className="flex flex-wrap items-center gap-3 border-b pb-3">
                  <div className="w-28 capitalize font-medium">{day}</div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={wh.isWorking}
                      onChange={e => handleWorkingHourChange(day, 'isWorking', e.target.checked)}
                    />
                    Working
                  </label>
                  {wh.isWorking && (
                    <>
                      <input
                        type="time"
                        value={wh.slots[0]?.startTime || '09:00'}
                        onChange={e => handleWorkingHourChange(day, 'slots', [{ startTime: e.target.value, endTime: wh.slots[0]?.endTime || '18:00' }])}
                        className="border rounded px-2 py-1"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={wh.slots[0]?.endTime || '18:00'}
                        onChange={e => handleWorkingHourChange(day, 'slots', [{ startTime: wh.slots[0]?.startTime || '09:00', endTime: e.target.value }])}
                        className="border rounded px-2 py-1"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Service Area – corrected inputs */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Service Area</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.serviceArea.coordinates.coordinates[1]}
                onChange={e => setFormData({
                  ...formData,
                  serviceArea: {
                    ...formData.serviceArea,
                    coordinates: {
                      ...formData.serviceArea.coordinates,
                      coordinates: [formData.serviceArea.coordinates.coordinates[0], parseFloat(e.target.value)]
                    }
                  }
                })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.serviceArea.coordinates.coordinates[0]}
                onChange={e => setFormData({
                  ...formData,
                  serviceArea: {
                    ...formData.serviceArea,
                    coordinates: {
                      ...formData.serviceArea.coordinates,
                      coordinates: [parseFloat(e.target.value), formData.serviceArea.coordinates.coordinates[1]]
                    }
                  }
                })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Radius (km)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.serviceArea.radius}
                onChange={e => setFormData({ ...formData, serviceArea: { ...formData.serviceArea, radius: parseInt(e.target.value) } })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Registration'}
        </button>
      </form>
    </div>
  );
};

export default RegisterProvider;