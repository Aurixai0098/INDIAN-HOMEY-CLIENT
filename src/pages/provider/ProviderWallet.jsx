// src/pages/provider/ProviderWallet.jsx (updated)
import { useState, useEffect } from 'react';
import { 
  Wallet, IndianRupee, TrendingUp, ArrowDownToLine, 
  Clock, CheckCircle, XCircle, AlertCircle, Banknote, 
  CreditCard, Landmark, Smartphone, Loader2, History,
  ChevronRight, Shield, FileText, Filter
} from 'lucide-react';
import { fetchWallet, requestWithdrawal, fetchMyWithdrawals } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProviderWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [accountDetails, setAccountDetails] = useState({
    accountHolderName: '', accountNumber: '', ifscCode: '', bankName: '', upiId: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [statusFilter, setStatusFilter] = useState(''); // '' = all

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [walletRes, withdrawalsRes] = await Promise.all([
        fetchWallet(),
        fetchMyWithdrawals(1, 50, statusFilter)
      ]);
      if (walletRes.success) setWallet(walletRes.data.wallet);
      if (withdrawalsRes.success) setWithdrawals(withdrawalsRes.data.requests || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 100) {
      setMessage({ type: 'error', text: 'Minimum withdrawal amount is ₹100' });
      return;
    }
    if (!wallet || wallet.balance < amt) {
      setMessage({ type: 'error', text: 'Insufficient balance' });
      return;
    }
    const details = paymentMethod === 'bank' ? {
      accountHolderName: accountDetails.accountHolderName,
      accountNumber: accountDetails.accountNumber,
      ifscCode: accountDetails.ifscCode,
      bankName: accountDetails.bankName,
      upiId: null
    } : {
      upiId: accountDetails.upiId,
      accountHolderName: null, accountNumber: null, ifscCode: null, bankName: null
    };
    setSubmitting(true);
    try {
      await requestWithdrawal(amt, details);
      setMessage({ type: 'success', text: 'Withdrawal request submitted successfully!' });
      setAmount('');
      setAccountDetails({ accountHolderName: '', accountNumber: '', ifscCode: '', bankName: '', upiId: '' });
      loadData();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status, adminNote) => {
    const config = {
      pending: { icon: Clock, bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
      processing: { icon: Loader2, bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' },
      completed: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      rejected: { icon: XCircle, bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' }
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return (
      <div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
          <Icon className={`w-3 h-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
          {cfg.label}
        </span>
        {status === 'processing' && adminNote && (
          <p className="text-xs text-gray-500 mt-1">Note: {adminNote}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Wallet className="w-6 h-6 text-emerald-600" /> My Wallet</h1>
        <p className="text-gray-500">Manage your earnings and withdrawal requests</p>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"><Wallet className="w-5 h-5" /></div><span className="text-sm font-medium opacity-90">Available Balance</span></div>
              <Shield className="w-5 h-5 opacity-50" />
            </div>
            <div className="text-4xl font-bold mb-2">₹{wallet?.balance?.toLocaleString() || 0}</div>
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/20">
              <div><p className="text-xs opacity-70">Total Earnings</p><p className="text-lg font-semibold">₹{wallet?.totalEarnings?.toLocaleString() || 0}</p></div>
              <div><p className="text-xs opacity-70">Total Withdrawn</p><p className="text-lg font-semibold">₹{wallet?.totalWithdrawals?.toLocaleString() || 0}</p></div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-6 py-3"><div className="flex items-center gap-2 text-sm"><TrendingUp className="w-4 h-4 opacity-70" /><span className="opacity-70">Keep providing great service to grow your earnings</span></div></div>
        </div>

        {/* Withdrawal Request Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><ArrowDownToLine className="w-4 h-4 text-emerald-600" /></div><h2 className="font-semibold text-gray-800">Request Withdrawal</h2></div>
            <p className="text-xs text-gray-500 mt-1">Minimum withdrawal amount: ₹100</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5"><IndianRupee className="w-4 h-4 inline mr-1" /> Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" className="w-full border rounded-xl px-4 py-2.5" required min="100" step="100" />
              {wallet && <p className="text-xs text-gray-400 mt-1">Max withdrawable: ₹{wallet.balance.toLocaleString()}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setPaymentMethod('bank')} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border ${paymentMethod === 'bank' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500'}`}><Landmark className="w-4 h-4" /> Bank Transfer</button>
                <button type="button" onClick={() => setPaymentMethod('upi')} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border ${paymentMethod === 'upi' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500'}`}><Smartphone className="w-4 h-4" /> UPI</button>
              </div>
            </div>
            {paymentMethod === 'bank' ? (
              <div className="space-y-3">
                <input type="text" placeholder="Account Holder Name" value={accountDetails.accountHolderName} onChange={e => setAccountDetails({...accountDetails, accountHolderName: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required />
                <input type="text" placeholder="Account Number" value={accountDetails.accountNumber} onChange={e => setAccountDetails({...accountDetails, accountNumber: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="IFSC Code" value={accountDetails.ifscCode} onChange={e => setAccountDetails({...accountDetails, ifscCode: e.target.value.toUpperCase()})} className="w-full border rounded-xl px-4 py-2.5" required />
                  <input type="text" placeholder="Bank Name" value={accountDetails.bankName} onChange={e => setAccountDetails({...accountDetails, bankName: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required />
                </div>
              </div>
            ) : (
              <input type="text" placeholder="UPI ID (e.g., name@okhdfcbank)" value={accountDetails.upiId} onChange={e => setAccountDetails({...accountDetails, upiId: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required />
            )}
            <button type="submit" disabled={submitting} className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}{submitting ? 'Submitting...' : 'Request Withdrawal'}</button>
          </form>
        </div>
      </div>

      {/* Withdrawal History with Filters */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2"><History className="w-5 h-5 text-emerald-600" /><h2 className="font-semibold text-gray-800">Withdrawal History</h2></div>
          <div className="flex gap-2">
            {['', 'pending', 'processing', 'completed', 'rejected'].map(status => (
              <button key={status || 'all'} onClick={() => setStatusFilter(status)} className={`px-3 py-1 rounded-full text-xs font-medium ${statusFilter === status ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{status === '' ? 'All' : status}</button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {withdrawals.length === 0 ? (
            <div className="p-12 text-center"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" /><p className="text-gray-400">No withdrawal requests yet</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-semibold">Amount</th><th>Method</th><th>Request Date</th><th>Status</th><th>Transaction ID</th></tr></thead>
                <tbody className="divide-y">
                  {withdrawals.map(req => (
                    <tr key={req._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">₹{req.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{req.accountDetails?.upiId ? 'UPI' : 'Bank'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{getStatusBadge(req.status, req.adminNote)}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-500">{req.transactionId || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
        <div className="flex items-start gap-3"><AlertCircle className="w-5 h-5 text-amber-500" /><div><p className="text-sm font-medium text-amber-800">Withdrawal Processing</p><p className="text-xs text-amber-700">Withdrawal requests are processed within 24-48 hours. You will be notified via email and app notification.</p></div></div>
      </div>
    </div>
  );
};

export default ProviderWallet;