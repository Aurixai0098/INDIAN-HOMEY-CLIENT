// src/pages/admin/AdminBankAccounts.jsx
import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Edit2, Trash2, Star, Save, X,
  Loader2, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import {
  fetchBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  setPrimaryBankAccount
} from '../../services/api';

const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

const accountTypes = [
  { value: 'savings', label: 'Savings Account' },
  { value: 'current', label: 'Current Account' },
  { value: 'business', label: 'Business Account' }
];

const BankAccountModal = ({ account, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    accountType: 'current',
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (account) {
      setFormData({
        accountHolderName: account.accountHolderName || '',
        bankName: account.bankName || '',
        accountNumber: account.accountNumber || '',
        confirmAccountNumber: account.accountNumber || '',
        ifscCode: account.ifscCode || '',
        accountType: account.accountType || 'current',
        isActive: account.isActive !== undefined ? account.isActive : true
      });
    } else {
      setFormData({
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        accountType: 'current',
        isActive: true
      });
    }
  }, [account]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      setError('Account numbers do not match');
      return;
    }
    if (!formData.accountHolderName.trim() || !formData.bankName.trim() || !formData.accountNumber.trim() || !formData.ifscCode.trim()) {
      setError('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const submitData = {
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        accountType: formData.accountType,
        isActive: formData.isActive
      };
      await onSave(account?._id, submitData);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold">{account ? 'Edit Bank Account' : 'Add Bank Account'}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Account Holder Name *</label>
            <input
              type="text"
              value={formData.accountHolderName}
              onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe / Company Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bank Name *</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="State Bank of India"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account Number *</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="XXXXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Account Number *</label>
            <input
              type="text"
              value={formData.confirmAccountNumber}
              onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Re-enter account number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">IFSC Code *</label>
            <input
              type="text"
              value={formData.ifscCode}
              onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="SBIN0001234"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account Type</label>
            <select
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            >
              {accountTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Active (can be used for payments)</label>
          </div>
          <div className="flex gap-2 pt-3">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : (account ? 'Update' : 'Add Account')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminBankAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetchBankAccounts();
      if (res.success) {
        setAccounts(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreate = async (data) => {
    await createBankAccount(data);
    showToast('Bank account added successfully');
    loadAccounts();
  };

  const handleUpdate = async (id, data) => {
    await updateBankAccount(id, data);
    showToast('Bank account updated');
    loadAccounts();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      try {
        await deleteBankAccount(id);
        showToast('Account deleted');
        loadAccounts();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await setPrimaryBankAccount(id);
      showToast('Primary account updated');
      loadAccounts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
          toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
        }`}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="text-blue-600" size={24} /> Company Bank Accounts
          </h1>
          <p className="text-gray-500 mt-1">Manage company bank accounts for receiving payments</p>
        </div>
        <button
          onClick={() => { setEditingAccount(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add Bank Account
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Account Holder</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bank Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Account Number</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">IFSC</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Added On</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10">
                    <Loader2 className="animate-spin mx-auto text-blue-600" size={24} />
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-400">
                    No bank accounts found. Click "Add Bank Account" to add one.
                  </td>
                </tr>
              ) : (
                accounts.map(acc => (
                  <tr key={acc._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{acc.accountHolderName}</td>
                    <td className="px-6 py-4">{acc.bankName}</td>
                    <td className="px-6 py-4 font-mono text-sm">****{acc.accountNumber.slice(-4)}</td>
                    <td className="px-6 py-4 font-mono text-sm">{acc.ifscCode}</td>
                    <td className="px-6 py-4 capitalize">{acc.accountType}</td>
                    <td className="px-6 py-4">
                      {acc.isPrimary ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          <Star size={12} /> Primary
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{formatDate(acc.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2 justify-center">
                        {!acc.isPrimary && (
                          <button
                            onClick={() => handleSetPrimary(acc._id)}
                            className="p-1.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
                            title="Set as Primary"
                          >
                            <Star size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => { setEditingAccount(acc); setShowModal(true); }}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(acc._id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <BankAccountModal
          account={editingAccount}
          onClose={() => { setShowModal(false); setEditingAccount(null); }}
          onSave={(id, data) => id ? handleUpdate(id, data) : handleCreate(data)}
        />
      )}
    </div>
  );
};

export default AdminBankAccounts;