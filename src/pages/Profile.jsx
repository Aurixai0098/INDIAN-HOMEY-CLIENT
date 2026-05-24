// src/pages/Profile.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  updateUserProfile, 
  uploadUserAvatar, 
  removeUserAvatar,
  changePassword,
  updateNotificationPreferences,
  fetchNotifications
} from '../services/api';
import { 
  Camera, 
  Loader2, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Save, 
  X,
  Shield,
  Bell,
  LogOut,
  Settings,
  Star,
  Clock,
  Heart,
  ChevronRight,
  Eye,
  EyeOff,
  Moon,
  Sun,
  MailCheck,
  Smartphone,
  Globe
} from 'lucide-react';

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  
  // Active tab
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Password change states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    email: true,
    sms: true,
    push: true
  });
  const [notifLoading, setNotifLoading] = useState(false);
  
  // Stats (mock for now - can be extended later)
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
      });
      setAvatarPreview(user.avatar?.url || null);
      setNotifPrefs(user.notificationPreferences || { email: true, sms: true, push: true });
    }
  }, [user]);

  // Load user stats (optional)
  useEffect(() => {
    const loadStats = async () => {
      try {
        // You can replace this with actual API if available
        const res = await fetchNotifications(1, 1);
        if (res.success) {
          // Just for demo – you can implement real stats endpoint
        }
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    };
    if (user) loadStats();
  }, [user]);

  // Handle profile form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle profile update
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

  // Avatar handlers
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file (JPEG, PNG)');
      setMessageType('error');
      return;
    }
    
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

  // Password change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setMessage('Password must be at least 8 characters');
      setMessageType('error');
      return;
    }
    
    setPasswordLoading(true);
    setMessage('');
    try {
      const res = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (res.success) {
        setMessage('Password changed successfully!');
        setMessageType('success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage(err.message || 'Failed to change password');
      setMessageType('error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Notification preferences handler
  const handleNotifChange = async (key, value) => {
    const newPrefs = { ...notifPrefs, [key]: value };
    setNotifPrefs(newPrefs);
    setNotifLoading(true);
    try {
      const res = await updateNotificationPreferences(newPrefs);
      if (res.success) {
        setMessage('Notification preferences updated');
        setMessageType('success');
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (err) {
      setMessage(err.message || 'Failed to update preferences');
      setMessageType('error');
      setNotifPrefs(notifPrefs); // revert
    } finally {
      setNotifLoading(false);
    }
  };

  // Toast auto-dismiss
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 mt-1">Manage your profile, security, and preferences</p>
        </div>

        {/* Toast Message */}
        {message && (
          <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 animate-in slide-in-from-right ${
            messageType === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}>
            {messageType === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
            <span className="text-sm font-medium">{message}</span>
            <button onClick={() => setMessage('')} className="ml-2 hover:opacity-80">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              {/* Avatar Section */}
              <div className="p-6 text-center border-b border-gray-100">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-lg mx-auto">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={56} className="text-white" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50 border border-gray-200"
                    title="Change profile picture"
                  >
                    <Camera size={16} className="text-gray-600" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-800">{user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle size={12} className="mr-1" />
                  Verified Account
                </div>

                {/* Avatar upload controls */}
                {avatarFile && (
                  <div className="mt-4 flex justify-center gap-2">
                    <button
                      onClick={handleUploadAvatar}
                      disabled={uploading}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                    >
                      {uploading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                      Save
                    </button>
                    <button
                      onClick={cancelAvatarUpload}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition flex items-center gap-1"
                    >
                      <X size={12} />
                      Cancel
                    </button>
                  </div>
                )}
                {!avatarFile && avatarPreview && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={uploading}
                    className="mt-3 text-xs text-red-600 hover:text-red-700 font-medium flex items-center justify-center gap-1"
                  >
                    <Trash2 size={12} />
                    Remove photo
                  </button>
                )}
              </div>

              {/* Navigation Tabs (Sidebar) */}
              <div className="p-4 space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User size={18} />
                  <span>Personal Info</span>
                  {activeTab === 'profile' && <ChevronRight size={16} className="ml-auto" />}
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'security'
                      ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Shield size={18} />
                  <span>Security</span>
                  {activeTab === 'security' && <ChevronRight size={16} className="ml-auto" />}
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'notifications'
                      ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Bell size={18} />
                  <span>Notifications</span>
                  {activeTab === 'notifications' && <ChevronRight size={16} className="ml-auto" />}
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all mt-4"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Stats Card */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Bookings</span>
                    <span className="font-semibold text-gray-800">{stats.totalBookings || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">{stats.completedBookings || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-semibold text-emerald-600">₹{stats.totalSpent || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Tab: Profile Info */}
              {activeTab === 'profile' && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <User size={24} className="text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-5">
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
                        className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                      >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab: Security (Change Password) */}
              {activeTab === 'security' && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield size={24} className="text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-800">Security Settings</h2>
                  </div>
                  <div className="max-w-lg">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                      <div className="flex gap-3">
                        <Shield size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-amber-800 text-sm">Password Security Tips</h3>
                          <p className="text-xs text-amber-700 mt-1">Use at least 8 characters with a mix of letters, numbers, and symbols. Never share your password with anyone.</p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-10"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-10"
                            placeholder="Enter new password (min 8 characters)"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-10"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end">
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                        >
                          {passwordLoading && <Loader2 size={18} className="animate-spin" />}
                          {passwordLoading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab: Notifications */}
              {activeTab === 'notifications' && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Bell size={24} className="text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-800">Notification Preferences</h2>
                  </div>
                  <div className="space-y-4 max-w-lg">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <MailCheck size={20} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-800">Email Notifications</p>
                          <p className="text-xs text-gray-500">Receive updates about bookings and offers via email</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotifChange('email', !notifPrefs.email)}
                        disabled={notifLoading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifPrefs.email ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifPrefs.email ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Smartphone size={20} className="text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-800">SMS Notifications</p>
                          <p className="text-xs text-gray-500">Get SMS alerts for booking status changes</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotifChange('sms', !notifPrefs.sms)}
                        disabled={notifLoading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifPrefs.sms ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifPrefs.sms ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Globe size={20} className="text-orange-600" />
                        <div>
                          <p className="font-medium text-gray-800">Push Notifications</p>
                          <p className="text-xs text-gray-500">Receive in-app notifications and reminders</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotifChange('push', !notifPrefs.push)}
                        disabled={notifLoading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifPrefs.push ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifPrefs.push ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;