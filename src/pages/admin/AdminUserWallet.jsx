// src/pages/admin/AdminUserWallet.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet, Plus, TrendingUp, RefreshCw, Search, ChevronLeft, ChevronRight,
  Eye, Loader2, X, DollarSign, CreditCard, Receipt, Tag, Calendar,
  ArrowUpCircle, ArrowDownCircle, Award, Users, Filter, CheckCircle2
} from 'lucide-react';
import {
  fetchUserWallets,
  fetchUserWalletDetails,
  addWalletFunds,
  addWalletCashback,
  processWalletRefund,
  fetchUserTransactions
} from '../../services/api';

const formatCurrency = (amount) => amount ? `₹${amount.toLocaleString('en-IN')}` : '₹0';
const formatDate = (date) => new Date(date).toLocaleString('en-IN');

// Transaction type icons
const getTransactionIcon = (type) => {
  switch(type) {
    case 'deposit': return <ArrowUpCircle size={14} className="text-green-600" />;
    case 'withdrawal': return <ArrowDownCircle size={14} className="text-red-600" />;
    case 'cashback': return <Award size={14} className="text-purple-600" />;
    case 'refund': return <Receipt size={14} className="text-orange-600" />;
    case 'payment': return <CreditCard size={14} className="text-blue-600" />;
    default: return <DollarSign size={14} className="text-gray-600" />;
  }
};

// Action Modal (Add Funds / Add Cashback / Refund)
const ActionModal = ({ isOpen, onClose, onConfirm, title, amountLabel, loading }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setNote('');
      setError('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    onConfirm(numAmount, note);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        {error && <div className="mb-3 p-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">{amountLabel}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note (optional)</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Reason for this transaction..."
            />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
          <button onClick={handleConfirm} disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Right Side Drawer for User Wallet Details
const UserWalletDrawer = ({ userId, user, onClose }) => {
  const [walletDetails, setWalletDetails] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txnPage, setTxnPage] = useState(1);
  const [txnTotalPages, setTxnTotalPages] = useState(1);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const [detailsRes, txnRes] = await Promise.all([
        fetchUserWalletDetails(userId),
        fetchUserTransactions(userId, txnPage, 10)
      ]);
      if (detailsRes.success) setWalletDetails(detailsRes.data);
      if (txnRes.success) {
        setTransactions(txnRes.data.transactions);
        setTxnTotalPages(Math.ceil(txnRes.data.pagination.total / txnRes.data.pagination.limit));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadDetails();
  }, [userId, txnPage]);

  if (!user) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <h2 className="text-xl font-bold">Wallet Details: {user.fullName}</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
        ) : walletDetails ? (
          <>
            {/* Wallet Balance Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white mb-4">
              <p className="text-sm opacity-90">Current Wallet Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(walletDetails.balance)}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <TrendingUp size={16} className="mx-auto text-green-600 mb-1" />
                <p className="text-[10px] text-gray-500">Total Deposits</p>
                <p className="text-sm font-bold text-green-700">{formatCurrency(walletDetails.totalDeposits)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <ArrowDownCircle size={16} className="mx-auto text-red-600 mb-1" />
                <p className="text-[10px] text-gray-500">Total Withdrawals</p>
                <p className="text-sm font-bold text-red-700">{formatCurrency(walletDetails.totalWithdrawals)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <Award size={16} className="mx-auto text-purple-600 mb-1" />
                <p className="text-[10px] text-gray-500">Cashback Earned</p>
                <p className="text-sm font-bold text-purple-700">{formatCurrency(walletDetails.totalCashback)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <Receipt size={16} className="mx-auto text-orange-600 mb-1" />
                <p className="text-[10px] text-gray-500">Refunds Received</p>
                <p className="text-sm font-bold text-orange-700">{formatCurrency(walletDetails.totalRefunds)}</p>
              </div>
            </div>

            {/* Coupons Used */}
            {walletDetails.couponsUsed > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold mb-1">
                  <Tag size={14} /> Coupons Used
                </div>
                <p className="text-lg font-bold">{walletDetails.couponsUsed} coupons</p>
              </div>
            )}

            {/* Recent Transactions */}
            <div>
              <h3 className="font-semibold text-sm mb-2">Recent Transactions</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-4">No transactions yet</p>
                ) : (
                  transactions.map(txn => (
                    <div key={txn._id} className="border rounded-lg p-2 text-xs">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          {getTransactionIcon(txn.type)}
                          <span className="font-medium capitalize">{txn.type}</span>
                        </div>
                        <span className={`font-bold ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.amount > 0 ? '+' : ''}{formatCurrency(txn.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-400 mt-1">
                        <span>{txn.note || '—'}</span>
                        <span>{formatDate(txn.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {txnTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-2">
                  <button disabled={txnPage === 1} onClick={() => setTxnPage(p => p-1)} className="text-xs px-2 py-0.5 border rounded">Prev</button>
                  <span className="text-xs">{txnPage} / {txnTotalPages}</span>
                  <button disabled={txnPage === txnTotalPages} onClick={() => setTxnPage(p => p+1)} className="text-xs px-2 py-0.5 border rounded">Next</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-400">No wallet data available</div>
        )}
      </div>
    </div>
  );
};

// Main Component
const AdminUserWallet = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState(null); // 'addFunds', 'cashback', 'refund'
  const [modalUser, setModalUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadWallets = async () => {
    setLoading(true);
    try {
      const res = await fetchUserWallets(page, 20, searchTerm);
      if (res.success) {
        setUsers(res.data.users);
        setTotalPages(Math.ceil(res.data.pagination.total / res.data.pagination.limit));
      }
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, [page, searchTerm]);

  const handleAction = async (userId, amount, note, actionType) => {
    setActionLoading(true);
    try {
      let res;
      if (actionType === 'addFunds') res = await addWalletFunds(userId, amount, note);
      else if (actionType === 'cashback') res = await addWalletCashback(userId, amount, note);
      else if (actionType === 'refund') res = await processWalletRefund(userId, amount, note);
      if (res.success) {
        showToast(`${actionType === 'addFunds' ? 'Funds added' : actionType === 'cashback' ? 'Cashback added' : 'Refund processed'} successfully`);
        loadWallets();
        if (showDrawer && selectedUser?._id === userId) {
          // Refresh drawer if open
          setShowDrawer(false);
          setTimeout(() => setShowDrawer(true), 100);
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
      setModalType(null);
      setModalUser(null);
    }
  };

  const openModal = (user, type) => {
    setModalUser(user);
    setModalType(type);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
          toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
        }`}>
          {toast.type === 'error' ? <X size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="text-blue-600" size={24} /> User Wallet & Payments
        </h1>
        <p className="text-gray-500">Manage user wallets, add funds, cashback, process refunds</p>
      </div>

      {/* Search & Refresh */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={loadWallets} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Wallet Balance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total Deposits</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total Withdrawals</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cashback</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Refunds</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Coupons Used</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="9" className="text-center py-10"><Loader2 className="animate-spin mx-auto text-blue-600" size={24} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-10 text-gray-400">No users found.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.fullName}</div>
                      <div className="text-xs text-gray-400">ID: {user._id.slice(-6)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(user.walletBalance)}</td>
                    <td className="px-6 py-4 text-sm">{formatCurrency(user.totalDeposits)}</td>
                    <td className="px-6 py-4 text-sm">{formatCurrency(user.totalWithdrawals)}</td>
                    <td className="px-6 py-4 text-sm">{formatCurrency(user.totalCashback)}</td>
                    <td className="px-6 py-4 text-sm">{formatCurrency(user.totalRefunds)}</td>
                    <td className="px-6 py-4 text-sm">{user.couponsUsed || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedUser(user); setShowDrawer(true); }}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openModal(user, 'addFunds')}
                          className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"
                          title="Add Funds"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => openModal(user, 'cashback')}
                          className="p-1.5 bg-purple-50 text-purple-600 rounded hover:bg-purple-100"
                          title="Add Cashback"
                        >
                          <Award size={14} />
                        </button>
                        <button
                          onClick={() => openModal(user, 'refund')}
                          className="p-1.5 bg-orange-50 text-orange-600 rounded hover:bg-orange-100"
                          title="Process Refund"
                        >
                          <Receipt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-sm">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="p-1 border rounded disabled:opacity-50"><ChevronLeft size={16} /></button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p+1)} className="p-1 border rounded disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Right Side Drawer */}
      {showDrawer && selectedUser && (
        <UserWalletDrawer
          userId={selectedUser._id}
          user={selectedUser}
          onClose={() => { setShowDrawer(false); setSelectedUser(null); }}
        />
      )}

      {/* Action Modals */}
      <ActionModal
        isOpen={modalType === 'addFunds'}
        onClose={() => { setModalType(null); setModalUser(null); }}
        onConfirm={(amount, note) => handleAction(modalUser?._id, amount, note, 'addFunds')}
        title="Add Funds to Wallet"
        amountLabel="Amount to add (₹)"
        loading={actionLoading}
      />
      <ActionModal
        isOpen={modalType === 'cashback'}
        onClose={() => { setModalType(null); setModalUser(null); }}
        onConfirm={(amount, note) => handleAction(modalUser?._id, amount, note, 'cashback')}
        title="Add Cashback"
        amountLabel="Cashback amount (₹)"
        loading={actionLoading}
      />
      <ActionModal
        isOpen={modalType === 'refund'}
        onClose={() => { setModalType(null); setModalUser(null); }}
        onConfirm={(amount, note) => handleAction(modalUser?._id, amount, note, 'refund')}
        title="Process Refund"
        amountLabel="Refund amount (₹)"
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminUserWallet;