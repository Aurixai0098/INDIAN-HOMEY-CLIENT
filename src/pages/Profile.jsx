 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  updateUserProfile,
  updateNotificationPreferences,
  fetchWallet,
  fetchNotifications,
} from '../services/api';

// Lucide icons - install: npm install lucide-react
import {
  User, Mail, Smartphone, Bell, MessageCircle, Wallet,
  CreditCard, TrendingUp, TrendingDown, ChevronDown, Loader2,
  CheckCircle2, AlertCircle, Calendar, UserCircle, Save,
  BellRing, IndianRupee, ShieldCheck, Clock, Inbox
} from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
  });
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState({
    email: user?.notificationPreferences?.email ?? true,
    sms: user?.notificationPreferences?.sms ?? true,
    push: user?.notificationPreferences?.push ?? true,
    whatsapp: user?.notificationPreferences?.whatsapp ?? false,
  });
  const [prefUpdating, setPrefUpdating] = useState(false);
  const [prefMessage, setPrefMessage] = useState('');
  const [prefSuccess, setPrefSuccess] = useState(false);

  // Wallet state
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifPage, setNotifPage] = useState(1);
  const [notifHasMore, setNotifHasMore] = useState(true);

  // Active tab state
  const [activeTab, setActiveTab] = useState('profile');

  // Load wallet and notifications on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    loadWallet();
    loadNotifications(1);
  }, []);

  // Auto-hide messages after 4 seconds
  useEffect(() => {
    if (profileMessage) {
      const timer = setTimeout(() => {
        setProfileMessage('');
        setProfileSuccess(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [profileMessage]);

  useEffect(() => {
    if (prefMessage) {
      const timer = setTimeout(() => {
        setPrefMessage('');
        setPrefSuccess(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [prefMessage]);

  const loadWallet = async () => {
    setWalletLoading(true);
    try {
      const res = await fetchWallet();
      if (res.success) {
        setWallet(res.data.wallet);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWalletLoading(false);
    }
  };

  const loadNotifications = async (page) => {
    setNotifLoading(true);
    try {
      const res = await fetchNotifications(page, 10);
      if (res.success) {
        if (page === 1) {
          setNotifications(res.data.notifications);
        } else {
          setNotifications(prev => [...prev, ...res.data.notifications]);
        }
        setNotifHasMore(res.data.notifications.length === 10);
        setNotifPage(page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNotifLoading(false);
    }
  };

  const loadMoreNotifications = () => {
    if (!notifLoading && notifHasMore) {
      loadNotifications(notifPage + 1);
    }
  };

  // Handle profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileUpdating(true);
    setProfileMessage('');
    setProfileSuccess(false);
    try {
      const res = await updateUserProfile(profileForm);
      if (res.success) {
        setProfileSuccess(true);
        setProfileMessage('Profile updated successfully! 🎉');
        if (setUser) setUser(res.data.user);
        setProfileForm({
          firstName: res.data.user.firstName,
          lastName: res.data.user.lastName,
          gender: res.data.user.gender,
          dateOfBirth: res.data.user.dateOfBirth?.split('T')[0] || '',
        });
      }
    } catch (err) {
      setProfileSuccess(false);
      setProfileMessage(err.message || 'Update failed. Please try again.');
    } finally {
      setProfileUpdating(false);
    }
  };

  // Handle notification preferences update
  const handlePrefSubmit = async (e) => {
    e.preventDefault();
    setPrefUpdating(true);
    setPrefMessage('');
    setPrefSuccess(false);
    try {
      const res = await updateNotificationPreferences(notifPrefs);
      if (res.success) {
        setPrefSuccess(true);
        setPrefMessage('Preferences saved successfully! ✅');
        if (setUser && res.data?.notificationPreferences) {
          setUser(prev => ({ ...prev, notificationPreferences: res.data.notificationPreferences }));
        }
      }
    } catch (err) {
      setPrefSuccess(false);
      setPrefMessage(err.message || 'Update failed. Please try again.');
    } finally {
      setPrefUpdating(false);
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    const first = profileForm.firstName?.charAt(0) || '';
    const last = profileForm.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Tab configuration
  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'notifications', label: 'Notifications', icon: BellRing },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header Section with Glassmorphism */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 pb-24 pt-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2NGgtNHpNMjAgMjBoNHY0aC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-white text-3xl font-bold shadow-2xl transform transition-transform group-hover:scale-105">
                {getInitials()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-400 border-3 border-white rounded-full flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Welcome Text */}
            <div className="text-center sm:text-left text-white">
              <p className="text-white/80 text-sm font-medium mb-1">{getGreeting()}</p>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {profileForm.firstName} {profileForm.lastName}
              </h1>
              <p className="text-white/70 text-sm flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4" />
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 relative z-10 pb-12">
        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-2 mb-8">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 transform scale-[1.02]'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'notifications' && notifications.length > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                  <p className="text-sm text-gray-500">Update your personal details</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-500" />
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 outline-none placeholder:text-gray-400"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-500" />
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 outline-none placeholder:text-gray-400"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <UserCircle className="w-4 h-4 text-indigo-500" />
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 outline-none"
                    />
                  </div>
                </div>

                {/* Message Alert */}
                {profileMessage && (
                  <div className={`flex items-center gap-3 p-4 rounded-xl ${
                    profileSuccess
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  } animate-slideIn`}>
                    {profileSuccess ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                    <span className="font-medium">{profileMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={profileUpdating}
                  className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {profileUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Update Profile
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Notification Preferences Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <BellRing className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Notification Preferences</h3>
                  <p className="text-sm text-gray-500">Choose how you want to be notified</p>
                </div>
              </div>

              <form onSubmit={handlePrefSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'email', label: 'Email Notifications', icon: Mail, desc: 'Get updates via email', color: 'blue' },
                    { key: 'sms', label: 'SMS Notifications', icon: Smartphone, desc: 'Receive text messages', color: 'purple' },
                    { key: 'push', label: 'Push Notifications', icon: Bell, desc: 'Browser push alerts', color: 'indigo' },
                    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, desc: 'Messages on WhatsApp', color: 'green' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isChecked = notifPrefs[item.key];
                    const colorClasses = {
                      blue: 'bg-blue-50 border-blue-200 text-blue-700',
                      purple: 'bg-purple-50 border-purple-200 text-purple-700',
                      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
                      green: 'bg-green-50 border-green-200 text-green-700',
                    };
                    const activeColor = {
                      blue: 'bg-blue-500',
                      purple: 'bg-purple-500',
                      indigo: 'bg-indigo-500',
                      green: 'bg-green-500',
                    };

                    return (
                      <label
                        key={item.key}
                        className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          isChecked
                            ? `${colorClasses[item.color]} shadow-md`
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => setNotifPrefs({ ...notifPrefs, [item.key]: e.target.checked })}
                          className="sr-only"
                        />
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isChecked ? 'bg-white shadow-sm' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${isChecked ? activeColor[item.color].replace('bg-', 'text-') : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${isChecked ? 'text-gray-900' : 'text-gray-700'}`}>
                            {item.label}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isChecked
                            ? `${activeColor[item.color]} border-transparent`
                            : 'border-gray-300'
                        }`}>
                          {isChecked && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Message Alert */}
                {prefMessage && (
                  <div className={`flex items-center gap-3 p-4 rounded-xl ${
                    prefSuccess
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  } animate-slideIn`}>
                    {prefSuccess ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                    <span className="font-medium">{prefMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={prefUpdating}
                  className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {prefUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Save Preferences
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 animate-fadeIn">
            {walletLoading ? (
              <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-12 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading your wallet...</p>
              </div>
            ) : wallet ? (
              <>
                {/* Main Balance Card */}
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-2xl shadow-2xl shadow-indigo-500/30 p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white/70 text-sm font-medium">Total Balance</p>
                        <h3 className="text-4xl font-bold">₹{wallet.balance?.toLocaleString() || '0'}</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-300" />
                          <span className="text-white/70 text-sm">Total Earnings</span>
                        </div>
                        <p className="text-2xl font-bold">₹{wallet.totalEarnings?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="w-4 h-4 text-red-300" />
                          <span className="text-white/70 text-sm">Withdrawals</span>
                        </div>
                        <p className="text-2xl font-bold">₹{wallet.totalWithdrawals?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Details Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Bank Details</h3>
                      <p className="text-sm text-gray-500">Your linked bank account status</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          wallet.bankDetails?.isVerified ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          {wallet.bankDetails?.isVerified ? (
                            <ShieldCheck className="w-6 h-6 text-green-600" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {wallet.bankDetails?.isVerified ? 'Bank Verified' : 'Verification Pending'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {wallet.bankDetails?.isVerified
                              ? 'Your bank account is verified and ready for withdrawals'
                              : 'Please complete your bank verification to enable withdrawals'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        wallet.bankDetails?.isVerified
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {wallet.bankDetails?.isVerified ? 'Active' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Wallet</h3>
                <p className="text-gray-500">Something went wrong while loading your wallet data. Please try again later.</p>
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Inbox className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
                    <p className="text-sm text-gray-500">Your recent activity and updates</p>
                  </div>
                </div>
                {notifications.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {notifications.length} Total
                  </span>
                )}
              </div>

              <div className="divide-y divide-gray-100">
                {notifLoading && notifications.length === 0 && (
                  <div className="p-12 flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                    <p className="text-gray-500 font-medium">Loading notifications...</p>
                  </div>
                )}

                {notifications.length === 0 && !notifLoading && (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Notifications</h3>
                    <p className="text-gray-500">You don't have any notifications yet. Check back later!</p>
                  </div>
                )}

                {notifications.map((notif, index) => (
                  <div
                    key={notif._id}
                    className="p-5 hover:bg-gray-50/80 transition-colors duration-200 flex items-start gap-4 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Bell className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium leading-relaxed">{notif.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-400 font-medium">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Just now'}
                        </span>
                      </div>
                    </div>
                    {!notif.read && (
                      <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full flex-shrink-0 mt-2 animate-pulse"></div>
                    )}
                  </div>
                ))}
              </div>

              {notifHasMore && (
                <div className="p-4 border-t border-gray-100">
                  <button
                    onClick={loadMoreNotifications}
                    disabled={notifLoading}
                    className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {notifLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Load More Notifications
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Profile;
 