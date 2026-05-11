// src/pages/provider/ProviderWallet.jsx
import { useState, useEffect } from 'react';
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
    const [message, setMessage] = useState('');

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
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt < 100) {
            setMessage('Minimum withdrawal amount is ₹100');
            return;
        }
        if (!wallet || wallet.balance < amt) {
            setMessage('Insufficient balance');
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
            setMessage('Withdrawal request submitted successfully!');
            setAmount('');
            loadData();
        } catch (err) {
            setMessage(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading wallet...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">My Wallet</h1>
            <div className="grid md:grid-cols-2 gap-8">
                {/* Wallet Balance */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-lg font-semibold mb-4">Balance</h2>
                    <div className="text-4xl font-bold text-emerald-600 mb-2">₹{wallet?.balance || 0}</div>
                    <p className="text-gray-500 text-sm">Total earnings: ₹{wallet?.totalEarnings || 0}</p>
                    <p className="text-gray-500 text-sm">Total withdrawn: ₹{wallet?.totalWithdrawals || 0}</p>
                </div>

                {/* Withdrawal Request Form */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-lg font-semibold mb-4">Request Withdrawal</h2>
                    {message && <div className={`p-3 rounded mb-4 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border rounded-lg px-4 py-2" required min="100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Payment Method</label>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full border rounded-lg px-4 py-2">
                                <option value="bank">Bank Transfer</option>
                                <option value="upi">UPI</option>
                            </select>
                        </div>
                        {paymentMethod === 'bank' ? (
                            <>
                                <input type="text" placeholder="Account Holder Name" value={accountDetails.accountHolderName} onChange={e => setAccountDetails({...accountDetails, accountHolderName: e.target.value})} className="w-full border rounded-lg px-4 py-2" required />
                                <input type="text" placeholder="Account Number" value={accountDetails.accountNumber} onChange={e => setAccountDetails({...accountDetails, accountNumber: e.target.value})} className="w-full border rounded-lg px-4 py-2" required />
                                <input type="text" placeholder="IFSC Code" value={accountDetails.ifscCode} onChange={e => setAccountDetails({...accountDetails, ifscCode: e.target.value})} className="w-full border rounded-lg px-4 py-2" required />
                                <input type="text" placeholder="Bank Name" value={accountDetails.bankName} onChange={e => setAccountDetails({...accountDetails, bankName: e.target.value})} className="w-full border rounded-lg px-4 py-2" required />
                            </>
                        ) : (
                            <input type="text" placeholder="UPI ID (e.g., name@okhdfcbank)" value={accountDetails.upiId} onChange={e => setAccountDetails({...accountDetails, upiId: e.target.value})} className="w-full border rounded-lg px-4 py-2" required />
                        )}
                        <button type="submit" disabled={submitting} className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                            {submitting ? 'Submitting...' : 'Request Withdrawal'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Withdrawal History */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border">
                <div className="p-4 border-b font-semibold">Withdrawal History</div>
                {withdrawals.length === 0 ? (
                    <p className="p-4 text-gray-500 text-center">No withdrawal requests yet</p>
                ) : (
                    <div className="divide-y">
                        {withdrawals.map(req => (
                            <div key={req._id} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">₹{req.amount}</p>
                                    <p className="text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    req.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                    req.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {req.status.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderWallet;