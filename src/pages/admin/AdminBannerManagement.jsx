// src/pages/admin/AdminBannerManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Image, Plus, Edit2, Trash2, Eye, EyeOff, GripVertical,
  X, Upload, Loader2, CheckCircle, XCircle, MoveUp, MoveDown
} from 'lucide-react';
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  reorderBanners
} from '../../services/api';

const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

const BannerCard = ({ banner, onEdit, onDelete, onToggle, onMoveUp, onMoveDown, isFirst, isLast }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Image Preview */}
        <div className="w-full md:w-48 h-32 md:h-auto bg-gray-100 relative group">
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => window.open(banner.imageUrl, '_blank')}
              className="p-1.5 bg-white rounded-full"
            >
              <Eye size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{banner.title}</h3>
              {banner.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{banner.description}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                {banner.buttonText && (
                  <span>🔘 {banner.buttonText} → {banner.buttonLink || '#'}</span>
                )}
                <span>📅 {formatDate(banner.createdAt)}</span>
                <span>🔢 Order: {banner.order}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onToggle(banner._id, !banner.isActive)}
                className={`p-1.5 rounded-lg transition-colors ${
                  banner.isActive
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                title={banner.isActive ? 'Deactivate' : 'Activate'}
              >
                {banner.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                onClick={() => onEdit(banner)}
                className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                title="Edit"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onDelete(banner._id)}
                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Reorder Buttons */}
        <div className="flex flex-row md:flex-col justify-center items-center gap-1 p-2 border-t md:border-t-0 md:border-l border-gray-100">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className={`p-1 rounded ${isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Move Up"
          >
            <MoveUp size={16} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className={`p-1 rounded ${isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Move Down"
          >
            <MoveDown size={16} />
          </button>
          <GripVertical size={14} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
};

// Modal for Add/Edit Banner
const BannerModal = ({ banner, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    buttonText: '',
    buttonLink: '',
    order: 0,
    isActive: true
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        description: banner.description || '',
        image: null,
        buttonText: banner.buttonText || '',
        buttonLink: banner.buttonLink || '',
        order: banner.order || 0,
        isActive: banner.isActive !== undefined ? banner.isActive : true
      });
      setImagePreview(banner.imageUrl || '');
    } else {
      setFormData({
        title: '',
        description: '',
        image: null,
        buttonText: '',
        buttonLink: '',
        order: 0,
        isActive: true
      });
      setImagePreview('');
    }
  }, [banner]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!banner && !formData.image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('buttonText', formData.buttonText);
      submitData.append('buttonLink', formData.buttonLink);
      submitData.append('order', formData.order);
      submitData.append('isActive', formData.isActive);
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      await onSave(submitData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold">{banner ? 'Edit Banner' : 'Add New Banner'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-lg text-sm flex items-center gap-2">
              <XCircle size={16} /> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Summer Sale 2025"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Brief description of the offer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(''); setFormData({ ...formData, image: null }); }}
                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Upload size={32} />
                    <span className="text-sm">Click to upload (JPG, PNG, max 2MB)</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., Shop Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
              <input
                type="text"
                value={formData.buttonLink}
                onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="/products or https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                min="0"
              />
            </div>
            <div className="flex items-center gap-2 mt-7">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active (visible on website)</label>
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Saving...' : 'Save Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const AdminBannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetchBanners();
      if (res.success) {
        setBanners(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleCreate = async (formData) => {
    await createBanner(formData);
    showToast('Banner created successfully');
    loadBanners();
  };

  const handleUpdate = async (bannerId, formData) => {
    await updateBanner(bannerId, formData);
    showToast('Banner updated successfully');
    loadBanners();
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBanner(bannerId);
        showToast('Banner deleted');
        loadBanners();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleToggle = async (bannerId, isActive) => {
    try {
      await toggleBannerStatus(bannerId, isActive);
      showToast(isActive ? 'Banner activated' : 'Banner deactivated');
      loadBanners();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const newBanners = [...banners];
    [newBanners[index - 1], newBanners[index]] = [newBanners[index], newBanners[index - 1]];
    const bannerIds = newBanners.map(b => b._id);
    try {
      await reorderBanners(bannerIds);
      setBanners(newBanners);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMoveDown = async (index) => {
    if (index === banners.length - 1) return;
    const newBanners = [...banners];
    [newBanners[index + 1], newBanners[index]] = [newBanners[index], newBanners[index + 1]];
    const bannerIds = newBanners.map(b => b._id);
    try {
      await reorderBanners(bannerIds);
      setBanners(newBanners);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
          toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Image className="text-blue-600" size={24} /> Banner Management
          </h1>
          <p className="text-gray-500 mt-1">Manage homepage banners, sliders, and promotional images</p>
        </div>
        <button
          onClick={() => { setEditingBanner(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} /> Add New Banner
        </button>
      </div>

      {/* Banners List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          <Image size={48} className="mx-auto mb-3 opacity-50" />
          <p>No banners yet. Click "Add New Banner" to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, idx) => (
            <BannerCard
              key={banner._id}
              banner={banner}
              onEdit={(b) => { setEditingBanner(b); setShowModal(true); }}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onMoveUp={() => handleMoveUp(idx)}
              onMoveDown={() => handleMoveDown(idx)}
              isFirst={idx === 0}
              isLast={idx === banners.length - 1}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <BannerModal
          banner={editingBanner}
          onClose={() => setShowModal(false)}
          onSave={(formData) => editingBanner ? handleUpdate(editingBanner._id, formData) : handleCreate(formData)}
        />
      )}
    </div>
  );
};

export default AdminBannerManagement;