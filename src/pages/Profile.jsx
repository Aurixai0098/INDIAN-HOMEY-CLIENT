// src/pages/Profile.jsx

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, uploadUserAvatar, removeUserAvatar } from '../services/api';
import { Camera, Loader2, Trash2, User, Mail, Phone, Calendar, CheckCircle, XCircle, Save, X } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
      });
      setAvatarPreview(user.avatar?.url || null);
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const res = await updateUserProfile(form);
      if (res.success) {
        setMessage('Profile updated successfully!');
        setMessageType('success');
        if (setUser) {
          setUser(prev => ({ ...prev, ...form }));
        }
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage(err.message || 'Failed to update profile');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file (JPEG, PNG)');
      setMessageType('error');
      return;
    }
    
    // ✅ यहाँ 2MB से बदलकर 5MB किया गया है (backend से match)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size should be less than 5MB');
      setMessageType('error');
      return;
    }
    
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setMessage('');
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    
    setUploading(true);
    setMessage('');
    
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const res = await uploadUserAvatar(formData);
      if (res.success) {
        setAvatarPreview(res.data.avatar.url);
        setAvatarFile(null);
        if (setUser) {
          setUser(prev => ({ ...prev, avatar: res.data.avatar }));
        }
        setMessage('Profile picture updated successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage(err.message || 'Failed to upload avatar');
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;
    
    setUploading(true);
    try {
      const res = await removeUserAvatar();
      if (res.success) {
        setAvatarPreview(null);
        setAvatarFile(null);
        if (setUser) {
          setUser(prev => ({ ...prev, avatar: null }));
        }
        setMessage('Profile picture removed successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage(err.message || 'Failed to remove avatar');
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  const cancelAvatarUpload = () => {
    setAvatarFile(null);
    setAvatarPreview(user?.avatar?.url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {messageType === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
          <span>{message}</span>
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Avatar Section */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-lg">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-white" />
                )}
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Change profile picture"
              >
                <Camera size={18} className="text-gray-600" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <h3 className="font-semibold text-gray-800 text-lg">{user?.firstName} {user?.lastName}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="flex flex-wrap gap-3 mt-3 justify-center sm:justify-start">
                {avatarFile ? (
                  <>
                    <button
                      onClick={handleUploadAvatar}
                      disabled={uploading}
                      className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save
                    </button>
                    <button
                      onClick={cancelAvatarUpload}
                      className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Camera size={14} />
                      Upload Photo
                    </button>
                    {avatarPreview && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={handleRemoveAvatar}
                          disabled={uploading}
                          className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
              {uploading && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <Loader2 size={14} className="animate-spin text-blue-600" />
                  <span className="text-xs text-gray-500">Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Enter your last name"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                <Mail size={18} className="text-gray-400" />
                <span className="text-gray-600">{user?.email}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                <Phone size={18} className="text-gray-400" />
                <span className="text-gray-600">{user?.phone}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;