// src/pages/admin/AdminCommission.jsx
import { useState, useEffect } from 'react';
import { getCommissionSettings, updateCommissionSettings } from '../../services/api';
import { Loader2, Percent, Save, AlertCircle, CheckCircle } from 'lucide-react';

const AdminCommission = () => {
  const [commission, setCommission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    loadCommission();
  }, []);

  const loadCommission = async () => {
    setLoading(true);
    try {
      const res = await getCommissionSettings();
      if (res.success) {
        const val = res.data.commission;
        setCommission(val);
        setInputValue(val.toString());
      } else {
        setMessage({ type: 'error', text: 'Failed to load commission settings' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error loading settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const newPercent = parseFloat(inputValue);
    if (isNaN(newPercent) || newPercent < 0 || newPercent > 100) {
      setMessage({ type: 'error', text: 'Commission must be between 0 and 100' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await updateCommissionSettings({ commissionPercentage: newPercent });
      if (res.success) {
        setCommission(newPercent);
        setMessage({ type: 'success', text: 'Commission percentage updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: res.message || 'Update failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Percent className="w-6 h-6 text-emerald-600" />
            Commission System
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Set platform commission percentage deducted from each completed booking
          </p>
        </div>

        <div className="p-6 space-y-6">
          {message.text && (
            <div className={`flex items-center gap-2 p-3 rounded-xl ${
              message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              <span>{message.text}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Percentage (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-center text-lg font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <span className="text-gray-500">% of booking total</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Current commission: <strong>{commission}%</strong>. 
              This will be applied to all future completed bookings.
            </p>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <h3 className="font-medium text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              How it works
            </h3>
            <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
              <li>Customer pays full booking amount via Razorpay (goes to platform account).</li>
              <li>System deducts {commission}% as platform commission.</li>
              <li>Remaining amount is credited to provider's wallet automatically.</li>
              <li>Providers can withdraw their earnings via withdrawal requests.</li>
            </ul>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommission;