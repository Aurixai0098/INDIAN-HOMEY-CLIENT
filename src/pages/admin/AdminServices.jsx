import { useState, useEffect } from 'react';
import { createService, updateService, deleteService, fetchServices, fetchCategories } from '../../services/api';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', category: '', basePrice: 0, priceUnit: 'per_service',
    estimatedDuration: { min: 30, max: 60 }, isActive: true, isFeatured: false, tags: [], imageUrls: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load services and categories
  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await fetchServices(1, 1000);
      if (res.success) setServices(res.data.services);
      else setServices([]);
    } catch (err) {
      console.error('Error loading services:', err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetchCategories();
      if (res.success && res.data.categories) {
        setCategories(res.data.categories);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadServices();
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateService(editingId, form);
      } else {
        await createService(form);
      }
      resetForm();
      loadServices();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '', slug: '', description: '', category: '', basePrice: 0, priceUnit: 'per_service',
      estimatedDuration: { min: 30, max: 60 }, isActive: true, isFeatured: false, tags: [], imageUrls: ''
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const editService = (svc) => {
    const imageUrls = svc.images?.map(img => img.url).join(', ') || '';
    setForm({
      ...svc,
      imageUrls,
      estimatedDuration: svc.estimatedDuration || { min: 30, max: 60 },
      category: svc.category?._id || svc.category
    });
    setEditingId(svc._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(id);
        loadServices();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Services</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit or delete specific services</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Service
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Featured</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {services.map(s => (
              <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  {s.images?.[0]?.url ? (
                    <img src={s.images[0].url} alt={s.name} className="w-10 h-10 object-cover rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">📷</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{s.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">{s.category?.name || s.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">₹{s.basePrice} <span className="text-gray-400 text-xs font-normal">/{s.priceUnit || 'service'}</span></td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {s.isFeatured ? <span className="text-amber-500">★ Yes</span> : <span className="text-gray-400">No</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button onClick={() => editService(s)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(s._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No services found. Click "Add Service" to create one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., AC Gas Refill" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input type="text" required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" placeholder="ac-gas-refill" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Details about the service..."></textarea>
                </div>

                {/* Category Dropdown */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  {loadingCategories ? (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      Loading categories...
                    </div>
                  ) : (
                    <select
                      required
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name} {!cat.isActive && '(Inactive)'}
                        </option>
                      ))}
                    </select>
                  )}
                  {categories.length === 0 && !loadingCategories && (
                    <p className="text-red-500 text-xs mt-1">No categories found. Please create a category first.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                  <input type="number" required value={form.basePrice} onChange={e => setForm({...form, basePrice: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Unit</label>
                  <select value={form.priceUnit} onChange={e => setForm({...form, priceUnit: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="per_service">Per Service</option>
                    <option value="per_hour">Per Hour</option>
                    <option value="per_sqft">Per Sq Ft</option>
                    <option value="per_unit">Per Unit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Duration (Mins)</label>
                  <input type="number" value={form.estimatedDuration.min} onChange={e => setForm({...form, estimatedDuration: {...form.estimatedDuration, min: parseInt(e.target.value)}})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Duration (Mins)</label>
                  <input type="number" value={form.estimatedDuration.max} onChange={e => setForm({...form, estimatedDuration: {...form.estimatedDuration, max: parseInt(e.target.value)}})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (comma separated)</label>
                  <textarea rows="2" value={form.imageUrls} onChange={e => setForm({...form, imageUrls: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"></textarea>
                  {form.imageUrls && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.imageUrls.split(',').slice(0,3).map((url, idx) => url.trim() && (
                        <img key={idx} src={url.trim()} alt="preview" className="w-12 h-12 object-cover rounded border" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma separated)</label>
                  <input type="text" value={form.tags.join(', ')} onChange={e => setForm({...form, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., cleaning, deep clean, home" />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                  <span className="text-sm font-medium text-gray-700">Active Service</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="w-5 h-5 text-amber-500 rounded border-gray-300 focus:ring-amber-500" />
                  <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
                </label>
              </div>

              <div className="mt-6 flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70">
                  {submitting ? 'Saving...' : (editingId ? 'Update Service' : 'Create Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;