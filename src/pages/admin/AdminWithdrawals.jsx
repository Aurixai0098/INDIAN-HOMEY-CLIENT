// src/pages/admin/AdminWithdrawals.jsx
import { useState, useEffect } from 'react';
import { fetchAllWithdrawals, approveWithdrawal, rejectWithdrawal } from '../../services/api';

const AdminWithdrawals = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const res = await fetchAllWithdrawals(filter, page, 20);
            if (res.success) {
                setRequests(res.data.requests);
                setTotalPages(res.data.pagination.pages);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, [filter, page]);

    const handleApprove = async (id) => {
        const transactionId = prompt('Enter transaction ID / UTR number:');
        if (!transactionId) return;
        try {
            await approveWithdrawal(id, transactionId, 'Approved by admin');
            loadRequests();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Reason for rejection:');
        try {
            await rejectWithdrawal(id, reason || 'Rejected by admin');
            loadRequests();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="text-center py-10">Loading withdrawal requests...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Withdrawal Requests</h1>
            <div className="mb-4">
                <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="border p-2 rounded">
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr><th className="px-4 py-2 text-left">Provider</th><th className="px-4 py-2 text-left">Amount</th><th className="px-4 py-2 text-left">Method</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-left">Date</th><th className="px-4 py-2 text-left">Actions</th></tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req._id} className="border-t">
                                <td className="px-4 py-2">{req.provider?.fullName} <br/><span className="text-xs text-gray-500">{req.provider?.email}</span></td>
                                <td className="px-4 py-2">₹{req.amount}</td>
                                <td className="px-4 py-2 text-sm">
                                    {req.accountDetails.upiId ? `UPI: ${req.accountDetails.upiId}` : `${req.accountDetails.bankName} - ${req.accountDetails.accountNumber}`}
                                </td>
                                <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs font-semibold ${req.status === 'pending' ? 'bg-yellow-100' : req.status === 'approved' ? 'bg-blue-100' : 'bg-red-100'}`}>{req.status}</span></td>
                                <td className="px-4 py-2">{new Date(req.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-2 space-x-2">
                                    {req.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleApprove(req._id)} className="text-green-600 hover:underline">Approve</button>
                                            <button onClick={() => handleReject(req._id)} className="text-red-600 hover:underline">Reject</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {requests.length === 0 && <tr><td colSpan="6" className="text-center py-4">No withdrawal requests</td></tr>}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center gap-2 mt-4">
                <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p+1)} className="px-3 py-1 bg-gray-200 rounded">Next</button>
            </div>
        </div>
    );
};

export default AdminWithdrawals;