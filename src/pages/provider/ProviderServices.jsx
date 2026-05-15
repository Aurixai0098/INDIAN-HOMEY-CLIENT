// src/pages/provider/ProviderServices.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProviderProfile, addProviderService, removeProviderService, fetchCategories, fetchServices, fetchProviderVerificationStatus } from '../../services/api';
import { Shield, Loader2, Plus, Trash2 } from 'lucide-react';

const ProviderServices = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    checkVerification();
  }, []);

  const checkVerification = async () => {
    try {
      const res = await fetchProviderVerificationStatus();
      if (res.success) {
        setVerificationStatus(res.data);
        if (res.data.verificationStatus === 'verified') {
          loadData();
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

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

  // If not verified, show KYC required message
  if (verificationStatus && verificationStatus.verificationStatus !== 'verified') {
    return (
      <div className="text-center py-16">
        <Shield className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">KYC Verification Required</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Please complete your KYC verification first to add and manage services.
          This is mandatory for all service providers on GharSeva platform.
        </p>
        <Link to="/provider/kyc" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 inline-flex items-center gap-2">
          <Shield size={18} />
          Complete KYC Verification
        </Link>
        {verificationStatus.verificationStatus === 'pending' && (
          <p className="text-sm text-yellow-600 mt-4">Your documents are pending admin verification.</p>
        )}
        {verificationStatus.verificationStatus === 'rejected' && (
          <p className="text-sm text-red-600 mt-4">Your KYC was rejected. Please upload correct documents.</p>
        )}
      </div>
    );
  }

  if (loading) return (
    <div className="text-center py-10">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
      <p className="text-gray-500">Loading services...</p>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Services</h1>

      {/* Add Service Form */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Plus size={18} className="text-emerald-600" />
          Add New Service
        </h2>
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
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
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
          <p className="p-4 text-gray-500 text-center">No services added yet.</p>
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
                  className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                >
                  <Trash2 size={14} />
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