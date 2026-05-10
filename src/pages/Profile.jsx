// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  updateUserProfile,
  updateNotificationPreferences,
  fetchWallet,
  fetchNotifications,
} from '../services/api';



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

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState({
    email: user?.notificationPreferences?.email ?? true,
    sms: user?.notificationPreferences?.sms ?? true,
    push: user?.notificationPreferences?.push ?? true,
    whatsapp: user?.notificationPreferences?.whatsapp ?? false,
  });
  const [prefUpdating, setPrefUpdating] = useState(false);
  const [prefMessage, setPrefMessage] = useState('');

  // Wallet state
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifPage, setNotifPage] = useState(1);
  const [notifHasMore, setNotifHasMore] = useState(true);


  
  // Load wallet and notifications on mount
  useEffect(() => {
     window.scrollTo(0,0)
    loadWallet();
    loadNotifications(1);
  }, []);

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
    try {
      const res = await updateUserProfile(profileForm);
      if (res.success) {
        setProfileMessage('Profile updated successfully');
        if (setUser) setUser(res.data.user);
        setProfileForm({
          firstName: res.data.user.firstName,
          lastName: res.data.user.lastName,
          gender: res.data.user.gender,
          dateOfBirth: res.data.user.dateOfBirth?.split('T')[0] || '',
        });
      }
    } catch (err) {
      setProfileMessage(err.message || 'Update failed');
    } finally {
      setProfileUpdating(false);
    }
  };

  // Handle notification preferences update
  const handlePrefSubmit = async (e) => {
    e.preventDefault();
    setPrefUpdating(true);
    setPrefMessage('');
    try {
      const res = await updateNotificationPreferences(notifPrefs);
      if (res.success) {
        setPrefMessage('Preferences saved');
        if (setUser && res.data?.notificationPreferences) {
          setUser(prev => ({ ...prev, notificationPreferences: res.data.notificationPreferences }));
        }
      }
    } catch (err) {
      setPrefMessage(err.message || 'Update failed');
    } finally {
      setPrefUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h2>

      {/* Profile Update Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Personal Information</h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">First Name</label>
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Last Name</label>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Gender</label>
            <select
              value={profileForm.gender}
              onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Date of Birth</label>
            <input
              type="date"
              value={profileForm.dateOfBirth}
              onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={profileUpdating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50"
          >
            {profileUpdating ? 'Updating...' : 'Update Profile'}
          </button>
          {profileMessage && (
            <p className={`text-sm ${profileMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {profileMessage}
            </p>
          )}
        </form>
      </div>

      {/* Notification Preferences Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Notification Preferences</h3>
        <form onSubmit={handlePrefSubmit} className="space-y-3">
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifPrefs.email}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, email: e.target.checked })}
                className="w-4 h-4"
              /> Email
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifPrefs.sms}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, sms: e.target.checked })}
                className="w-4 h-4"
              /> SMS
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifPrefs.push}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, push: e.target.checked })}
                className="w-4 h-4"
              /> Push
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifPrefs.whatsapp}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, whatsapp: e.target.checked })}
                className="w-4 h-4"
              /> WhatsApp
            </label>
          </div>
          <button
            type="submit"
            disabled={prefUpdating}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50"
          >
            {prefUpdating ? 'Saving...' : 'Save Preferences'}
          </button>
          {prefMessage && (
            <p className={`text-sm ${prefMessage.includes('saved') ? 'text-green-600' : 'text-red-600'}`}>
              {prefMessage}
            </p>
          )}
        </form>
      </div>

      {/* Wallet Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">My Wallet</h3>
        {walletLoading ? (
          <p className="text-gray-500">Loading wallet...</p>
        ) : wallet ? (
          <div className="space-y-2">
            <p><strong>Balance:</strong> ₹{wallet.balance}</p>
            <p><strong>Total Earnings:</strong> ₹{wallet.totalEarnings}</p>
            <p><strong>Total Withdrawals:</strong> ₹{wallet.totalWithdrawals}</p>
            <p><strong>Bank Verified:</strong> {wallet.bankDetails?.isVerified ? 'Yes' : 'No'}</p>
          </div>
        ) : (
          <p className="text-red-500">Unable to load wallet</p>
        )}
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Notifications</h3>
        {notifLoading && notifications.length === 0 && <p className="text-gray-500">Loading...</p>}
        {notifications.length === 0 && !notifLoading && <p className="text-gray-500">No notifications</p>}
        <ul className="divide-y divide-gray-200">
          {notifications.map(notif => (
            <li key={notif._id} className="py-3 text-gray-700">{notif.message}</li>
          ))}
        </ul>
        {notifHasMore && (
          <button
            onClick={loadMoreNotifications}
            disabled={notifLoading}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
          >
            {notifLoading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;