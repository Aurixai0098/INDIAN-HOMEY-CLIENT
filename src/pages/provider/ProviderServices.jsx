// src/pages/provider/ProviderServices.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Loader2, Plus, Trash2, Package, Tag, 
  IndianRupee, CheckCircle, AlertCircle, X, 
  ChevronRight, Layers, Briefcase, AlertTriangle
} from 'lucide-react';
import { 
  fetchProviderProfile, addProviderService, removeProviderService, 
  fetchCategories, fetchServices, fetchProviderVerificationStatus 
} from '../../services/api';

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

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c._id === categoryId);
    return cat?.name || 'Category';
  };

  // Verification block (not verified)
  if (verificationStatus && verificationStatus.verificationStatus !== 'verified') {
    const isPending = verificationStatus.verificationStatus === 'pending';
    const isRejected = verificationStatus.verificationStatus === 'rejected';
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-12 h-12 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">KYC Verification Required</h2>
        <p className="text-gray-500 max-w-md mb-6">
          Please complete your KYC verification to add and manage services.
          This is mandatory for all service providers on GharSeva platform.
        </p>
        <Link 
          to="/provider/kyc" 
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30"
        >
          <Shield size={18} />
          Complete KYC Verification
        </Link>
        {isPending && (
          <p className="text-sm text-amber-600 mt-4 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> Your documents are pending admin verification.
          </p>
        )}
        {isRejected && (
          <p className="text-sm text-red-600 mt-4 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Your KYC was rejected. Please upload correct documents.
          </p>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-gray-500">Loading services...</p>
      </div>
    );
  }

  // Filter available services by selected category for display
  const filteredAvailableServices = selectedCategory 
    ? availableServices.filter(s => s.category?._id === selectedCategory)
    : [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the services you offer to customers</p>
        </div>
        <div className="text-sm text-gray-400 bg-white px-3 py-1.5 rounded-full border shadow-sm inline-flex items-center gap-1 w-fit">
          <Package className="w-3.5 h-3.5" />
          {services.length} service{services.length !== 1 ? 's' : ''} offered
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Add New Service Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Plus className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="font-semibold text-gray-800">Add New Service</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Select a category and the services you provide</p>
          </div>
          
          <div className="p-6 space-y-5">
            {/* Category Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-1">
                  <Layers className="w-4 h-4 text-gray-400" />
                  Category
                </div>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedServices([]);
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Services Multi-Select */}
            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    Services (select multiple)
                  </div>
                </label>
                <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500">
                  <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                    {filteredAvailableServices.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        No services available in this category
                      </div>
                    ) : (
                      filteredAvailableServices.map(service => (
                        <label key={service._id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            value={service._id}
                            checked={selectedServices.includes(service._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedServices([...selectedServices, service._id]);
                              } else {
                                setSelectedServices(selectedServices.filter(id => id !== service._id));
                              }
                            }}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{service.name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <IndianRupee className="w-3 h-3" />
                              {service.basePrice}
                            </p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}

            {/* Add Button */}
            <button
              onClick={handleAddService}
              disabled={submitting || !selectedCategory || selectedServices.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {submitting ? 'Adding Services...' : 'Add Selected Services'}
            </button>
          </div>
        </div>

        {/* Right Column: Current Services List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-semibold text-gray-800">Currently Offering</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Services you have added to your profile</p>
          </div>

          {services.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-700 font-medium mb-1">No services added yet</h3>
              <p className="text-sm text-gray-400">Use the form to add services you offer.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {services.map((service, idx) => {
                const categoryName = getCategoryName(service.category);
                const subServiceNames = service.subServices?.map(s => s.name).join(', ') || 'No sub-services';
                return (
                  <div key={service._id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                            <Tag className="w-3 h-3" />
                            {categoryName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {subServiceNames}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(service._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tip Card */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <ChevronRight className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800">Pro Tip</h4>
            <p className="text-xs text-gray-600 mt-1">
              Adding more services increases your visibility to customers. 
              Make sure to keep your service list updated with accurate pricing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderServices;