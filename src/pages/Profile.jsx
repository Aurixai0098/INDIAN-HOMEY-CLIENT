import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('Profile saved:', formData);
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
    });
    setIsEditing(false);
  };

  const getInitials = () => {
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  const getRoleBadgeColor = () => {
    const role = user.role?.toLowerCase();
    switch (role) {
      case 'admin': return 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-600/10';
      case 'provider': return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-600/10';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 ring-1 ring-gray-600/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 animate-slide-down">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800">
            <div className="bg-emerald-500/20 p-1.5 rounded-full">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium text-sm">Profile updated successfully</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="relative h-48 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600">
            {/* Subtle overlay pattern */}
            <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Avatar & Basic Info */}
          <div className="relative px-8 sm:px-10">
            <div className="absolute -top-16 left-8 sm:left-10">
              <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-md">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-4xl font-bold text-white shadow-inner border border-white/20">
                  {getInitials()}
                </div>
              </div>
            </div>

            <div className="pt-20 pb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor()}`}>
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500 text-sm flex items-center gap-1.5 font-medium">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Joined {new Date().getFullYear()}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/my-bookings"
                  className="inline-flex items-center px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Bookings
                </Link>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gray-900 hover:bg-gray-800 transition-all shadow-sm shadow-gray-900/20 active:scale-95"
                  >
                    <svg className="w-4 h-4 mr-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20 active:scale-95"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Content Area */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-100 px-4 sm:px-8 bg-gray-50/50">
            <nav className="flex space-x-8">
              {[
                { id: 'profile', label: 'Personal Details', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { id: 'settings', label: 'Security & Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
                { id: 'bookings', label: 'History', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-5 px-1 inline-flex items-center gap-2 border-b-2 font-semibold text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <svg className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {tab.id === 'settings' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Panels */}
          <div className="p-6 sm:p-10">
            {/* Profile Details Tab */}
            {activeTab === 'profile' && (
              <div className="animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                        placeholder="Enter your first name"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50/50 text-gray-900 rounded-xl border border-transparent font-medium">
                        {user.firstName || '—'}
                      </div>
                    )}
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                        placeholder="Enter your last name"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50/50 text-gray-900 rounded-xl border border-transparent font-medium">
                        {user.lastName || '—'}
                      </div>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <div className="px-4 py-3 bg-gray-50/50 text-gray-600 rounded-xl border border-transparent flex justify-between items-center cursor-not-allowed">
                      <span className="font-medium">{user.email}</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50/50 text-gray-900 rounded-xl border border-transparent font-medium">
                        {user.phone || '—'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'settings' && (
              <div className="animate-fadeIn space-y-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-50 p-3 rounded-full text-emerald-600 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Change Password</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Update your password to keep your account secure</p>
                      </div>
                    </div>
                    <button className="px-5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white hover:border-gray-300 transition-all shadow-sm">
                      Update
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-3 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Manage alerts for bookings and special offers</p>
                      </div>
                    </div>
                    <button className="px-5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white hover:border-gray-300 transition-all shadow-sm">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Booking History Tab */}
            {activeTab === 'bookings' && (
              <div className="animate-fadeIn">
                <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-300">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-100 mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">No bookings yet</h4>
                  <p className="text-gray-500 mt-2 max-w-sm mx-auto">Looks like you haven't booked any services yet. Discover what we have to offer!</p>
                  <Link to="/services" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20 active:scale-95">
                    Browse Services
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4-4m4 4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer / Actions */}
          <div className="border-t border-gray-100 p-6 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
            <button
              onClick={logout}
              className="w-full sm:w-auto flex justify-center gap-2 items-center px-6 py-2.5 text-sm font-bold rounded-xl text-red-600 bg-red-50 hover:bg-red-100 border border-transparent hover:border-red-200 transition-all duration-200"
            > 
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
            <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Need help? <a href="mailto:support@gharseva.com" className="text-emerald-600 hover:text-emerald-700 hover:underline">support@gharseva.com</a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-down {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Profile;