// src/pages/provider/ProviderWallet.jsx
import { useState, useEffect } from 'react';
import { 
  Wallet, IndianRupee, TrendingUp, ArrowDownToLine, 
  Clock, CheckCircle, XCircle, AlertCircle, Banknote, 
  CreditCard, Landmark, Smartphone, Loader2, History,
  ChevronRight, Shield, FileText
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
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [walletRes, withdrawalsRes] = await Promise.all([
        fetchWallet(),
        fetchMyWithdrawals(1, 10)
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
      accountHolderName: null,
      accountNumber: null,
      ifscCode: null,
      bankName: null
    };
    setSubmitting(true);
    try {
      await requestWithdrawal(amt, details);
      setMessage({ type: 'success', text: 'Withdrawal request submitted successfully!' });
      setAmount('');
      // Reset form
      setAccountDetails({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        upiId: ''
      });
      loadData();
      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { icon: Clock, bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
      approved: { icon: CheckCircle, bg: 'bg-blue-100', text: 'text-blue-700', label: 'Approved' },
      completed: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      rejected: { icon: XCircle, bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' }
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-gray-500">Loading wallet...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-600" />
          My Wallet
        </h1>
        <p className="text-gray-500 mt-1">Manage your earnings and withdrawal requests</p>
      </div>

      {/* Message Toast */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-200 ${
          message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium opacity-90">Available Balance</span>
              </div>
              <Shield className="w-5 h-5 opacity-50" />
            </div>
            <div className="text-4xl font-bold mb-2">₹{wallet?.balance?.toLocaleString() || 0}</div>
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/20">
              <div>
                <p className="text-xs opacity-70">Total Earnings</p>
                <p className="text-lg font-semibold">₹{wallet?.totalEarnings?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-xs opacity-70">Total Withdrawn</p>
                <p className="text-lg font-semibold">₹{wallet?.totalWithdrawals?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-6 py-3">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 opacity-70" />
              <span className="opacity-70">Keep providing great service to grow your earnings</span>
            </div>
          </div>
        </div>

        {/* Withdrawal Request Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="font-semibold text-gray-800">Request Withdrawal</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum withdrawal amount: ₹100</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-4 h-4 text-gray-400" />
                  Amount (₹)
                </div>
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
                min="100"
                step="100"
              />
              {wallet && (
                <p className="text-xs text-gray-400 mt-1">Max withdrawable: ₹{wallet.balance.toLocaleString()}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    paymentMethod === 'bank' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Landmark className="w-4 h-4" />
                  Bank Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    paymentMethod === 'upi' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  UPI
                </button>
              </div>
            </div>

            {paymentMethod === 'bank' ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Account Holder Name"
                  value={accountDetails.accountHolderName}
                  onChange={e => setAccountDetails({...accountDetails, accountHolderName: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 transition-all"
                  required
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  value={accountDetails.accountNumber}
                  onChange={e => setAccountDetails({...accountDetails, accountNumber: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 transition-all"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    value={accountDetails.ifscCode}
                    onChange={e => setAccountDetails({...accountDetails, ifscCode: e.target.value.toUpperCase()})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 transition-all"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={accountDetails.bankName}
                    onChange={e => setAccountDetails({...accountDetails, bankName: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="UPI ID (e.g., name@okhdfcbank)"
                  value={accountDetails.upiId}
                  onChange={e => setAccountDetails({...accountDetails, upiId: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
              {submitting ? 'Submitting...' : 'Request Withdrawal'}
            </button>
          </form>
        </div>
      </div>

      {/* Withdrawal History Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-800">Withdrawal History</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{withdrawals.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {withdrawals.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-700 font-medium mb-1">No withdrawal requests yet</h3>
              <p className="text-sm text-gray-400">Your withdrawal history will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Request Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {withdrawals.map(req => (
                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-800">{req.amount.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          {req.accountDetails?.upiId ? (
                            <>
                              <Smartphone className="w-3.5 h-3.5" />
                              UPI
                            </>
                          ) : (
                            <>
                              <Landmark className="w-3.5 h-3.5" />
                              Bank
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(req.createdAt).toLocaleDateString('en-IN')}
                        </div>
                        <p className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {req.transactionId || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Withdrawal Processing</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Withdrawal requests are processed within 24-48 hours. Funds will be transferred to your registered bank account / UPI ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderWallet;