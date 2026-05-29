// src/pages/admin/AdminAppSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Settings, Globe, Lock, Shield, Bell, Monitor, Smartphone,
  RefreshCw, Download, AlertCircle, CheckCircle, XCircle,
  Save, Loader2, Eye, EyeOff, Mail, Share2, Users
} from 'lucide-react';
import {
  fetchAppSettings,
  updateAppSettings,
  toggleMaintenanceMode,
  checkForAppUpdate,
  publishAppUpdate
} from '../../services/api';

const formatDate = (date) => new Date(date).toLocaleString('en-IN');

const AdminAppSettings = () => {
  const [settings, setSettings] = useState({
    appName: '',
    appVersion: '',
    appDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' },
    isMaintenanceMode: false,
    maintenanceMessage: '',
    features: {
      userRegistration: true,
      providerRegistration: true,
      bookingSystem: true,
      paymentGateway: true,
      reviewsEnabled: true,
      chatEnabled: true
    },
    googleAnalyticsId: '',
    googleMapsApiKey: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maintenanceToggling, setMaintenanceToggling] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({ version: '', message: '', forceUpdate: false, downloadUrl: '' });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetchAppSettings();
      if (res.success) {
        setSettings(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAppSettings(settings);
      showToast('Settings saved successfully');
      loadSettings();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMaintenanceToggle = async () => {
    setMaintenanceToggling(true);
    try {
      await toggleMaintenanceMode(!settings.isMaintenanceMode, settings.maintenanceMessage);
      setSettings({ ...settings, isMaintenanceMode: !settings.isMaintenanceMode });
      showToast(`Maintenance mode ${!settings.isMaintenanceMode ? 'enabled' : 'disabled'}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setMaintenanceToggling(false);
    }
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const res = await checkForAppUpdate();
      if (res.success) {
        setUpdateAvailable(res.data);
        if (res.data.hasUpdate) {
          setUpdateData({
            version: res.data.latestVersion,
            message: res.data.updateMessage,
            forceUpdate: res.data.forceUpdate,
            downloadUrl: res.data.downloadUrl
          });
          setShowUpdateModal(true);
        } else {
          showToast('You are using the latest version', 'info');
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handlePublishUpdate = async () => {
    setSaving(true);
    try {
      await publishAppUpdate(updateData.version, updateData.message, updateData.forceUpdate, updateData.downloadUrl);
      showToast('Update published successfully');
      setShowUpdateModal(false);
      loadSettings();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFeatureToggle = (feature) => {
    setSettings({
      ...settings,
      features: {
        ...settings.features,
        [feature]: !settings.features[feature]
      }
    });
  };

  const handleSocialLinkChange = (platform, value) => {
    setSettings({
      ...settings,
      socialLinks: {
        ...settings.socialLinks,
        [platform]: value
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
          toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
        }`}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="text-blue-600" size={24} /> App Settings
        </h1>
        <p className="text-gray-500">Configure global application settings, maintenance mode, and app updates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - General Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Globe size={18} /> General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">App Name</label>
                <input
                  type="text"
                  value={settings.appName}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">App Version</label>
                <input
                  type="text"
                  value={settings.appVersion}
                  onChange={(e) => setSettings({ ...settings, appVersion: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">App Description</label>
                <textarea
                  rows={2}
                  value={settings.appDescription}
                  onChange={(e) => setSettings({ ...settings, appDescription: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Mail size={18} /> Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  rows={2}
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Share2 size={18} /> Social Media Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Facebook URL</label>
                <input
                  type="url"
                  value={settings.socialLinks.facebook}
                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Twitter URL</label>
                <input
                  type="url"
                  value={settings.socialLinks.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={settings.socialLinks.instagram}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={settings.socialLinks.linkedin}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/..."
                />
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Shield size={18} /> API Keys & Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Google Analytics ID</label>
                <input
                  type="text"
                  value={settings.googleAnalyticsId}
                  onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="UA-XXXXXXXXX-X"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Google Maps API Key</label>
                <input
                  type="text"
                  value={settings.googleMapsApiKey}
                  onChange={(e) => setSettings({ ...settings, googleMapsApiKey: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - System Controls */}
        <div className="space-y-6">
          {/* Maintenance Mode */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Lock size={18} /> Maintenance Mode</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enable Maintenance Mode</span>
                <button
                  onClick={handleMaintenanceToggle}
                  disabled={maintenanceToggling}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.isMaintenanceMode ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.isMaintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {settings.isMaintenanceMode && (
                <div>
                  <label className="block text-sm font-medium mb-1">Maintenance Message</label>
                  <textarea
                    rows={2}
                    value={settings.maintenanceMessage}
                    onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="We are currently under maintenance. Please check back later."
                  />
                </div>
              )}
              {settings.isMaintenanceMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-700">
                  <AlertCircle size={14} className="inline mr-1" /> Website/App will display maintenance message to all visitors.
                </div>
              )}
            </div>
          </div>

          {/* Features Toggle */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Monitor size={18} /> Feature Toggles</h2>
            <div className="space-y-2">
              <FeatureToggle label="User Registration" enabled={settings.features.userRegistration} onToggle={() => handleFeatureToggle('userRegistration')} />
              <FeatureToggle label="Provider Registration" enabled={settings.features.providerRegistration} onToggle={() => handleFeatureToggle('providerRegistration')} />
              <FeatureToggle label="Booking System" enabled={settings.features.bookingSystem} onToggle={() => handleFeatureToggle('bookingSystem')} />
              <FeatureToggle label="Payment Gateway" enabled={settings.features.paymentGateway} onToggle={() => handleFeatureToggle('paymentGateway')} />
              <FeatureToggle label="Reviews & Ratings" enabled={settings.features.reviewsEnabled} onToggle={() => handleFeatureToggle('reviewsEnabled')} />
              <FeatureToggle label="Live Chat" enabled={settings.features.chatEnabled} onToggle={() => handleFeatureToggle('chatEnabled')} />
            </div>
          </div>

          {/* App Update */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><RefreshCw size={18} /> App Update</h2>
            <button
              onClick={handleCheckUpdate}
              disabled={checkingUpdate}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {checkingUpdate ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {checkingUpdate ? 'Checking...' : 'Check for Updates'}
            </button>
            {updateAvailable && updateAvailable.hasUpdate && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">New version available: v{updateAvailable.latestVersion}</p>
                <p className="text-xs text-green-600 mt-1">{updateAvailable.updateMessage}</p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Publish App Update</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Version Number</label>
                <input
                  type="text"
                  value={updateData.version}
                  onChange={(e) => setUpdateData({ ...updateData, version: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  placeholder="1.2.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Update Message</label>
                <textarea
                  rows={2}
                  value={updateData.message}
                  onChange={(e) => setUpdateData({ ...updateData, message: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  placeholder="What's new in this version?"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={updateData.forceUpdate}
                    onChange={(e) => setUpdateData({ ...updateData, forceUpdate: e.target.checked })}
                  />
                  <span className="text-sm">Force Update (users must update to continue)</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium">Download URL</label>
                <input
                  type="url"
                  value={updateData.downloadUrl}
                  onChange={(e) => setUpdateData({ ...updateData, downloadUrl: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  placeholder="https://example.com/app-release.apk"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowUpdateModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
              <button onClick={handlePublishUpdate} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Publish Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureToggle = ({ label, enabled, onToggle }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-5.5' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
};

export default AdminAppSettings;