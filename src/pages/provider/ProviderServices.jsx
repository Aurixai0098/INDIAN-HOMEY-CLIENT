import { useState, useEffect } from 'react';
import { fetchProviderProfile, addProviderService, removeProviderService, fetchCategories, fetchServices } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProviderServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, catRes, allServicesRes] = await Promise.all([
        fetchProviderProfile(),
        fetchCategories(),
        fetchServices(1, 100),
      ]);
      if (profileRes.success) {
        setServices(profileRes.data.provider.services || []);
      }
      if (catRes.success) setCategories(catRes.data.categories || []);
      if (allServicesRes.success) setAvailableServices(allServicesRes.data.services || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!selectedCategory || selectedServices.length === 0) {
      alert('Please select category and at least one service');
      return;
    }
    setSubmitting(true);
    try {
      await addProviderService({
        category: selectedCategory,
        subServices: selectedServices,
      });
      setSelectedCategory('');
      setSelectedServices([]);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (serviceId) => {
    if (confirm('Remove this service from your profile?')) {
      try {
        await removeProviderService(serviceId);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Services</h1>

      {/* Add Service Form */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="font-semibold mb-4">Add New Service</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Services (select multiple)</label>
            <select
              multiple
              value={selectedServices}
              onChange={(e) => setSelectedServices(Array.from(e.target.selectedOptions, opt => opt.value))}
              className="w-full border rounded-lg px-4 py-2 h-40"
            >
              {availableServices
                .filter(s => !selectedCategory || s.category?._id === selectedCategory)
                .map(s => (
                  <option key={s._id} value={s._id}>{s.name} (₹{s.basePrice})</option>
                ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Hold Ctrl (Cmd on Mac) to select multiple</p>
          </div>
          <button
            onClick={handleAddService}
            disabled={submitting}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Service'}
          </button>
        </div>
      </div>

      {/* Current Services List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Currently Offering</h2>
        </div>
        {services.length === 0 ? (
          <p className="p-4 text-gray-500">No services added yet.</p>
        ) : (
          <div className="divide-y">
            {services.map(service => (
              <div key={service._id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{service.category?.name || 'Category'}</p>
                  <p className="text-sm text-gray-500">
                    {service.subServices?.map(s => s.name).join(', ') || 'Sub-services'}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(service._id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderServices;