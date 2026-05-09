import { useState, useEffect } from 'react';
import { fetchAdminVerifications, verifyProvider } from '../../services/api';

const AdminProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadVerifications = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminVerifications(page, 20);
      if (res.success) {
        setProviders(res.data.providers);
        setTotalPages(Math.ceil(res.data.pagination.total / res.data.pagination.limit));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerifications();
  }, [page]);

  const handleVerification = async (providerId, status, note = '') => {
    try {
      await verifyProvider(providerId, status, note);
      loadVerifications();
      alert(`Provider ${status} successfully`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Provider Verifications</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr><th className="px-4 py-2 text-left">Business Name</th><th className="px-4 py-2 text-left">Owner</th><th className="px-4 py-2 text-left">Email</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-left">Actions</th></tr>
          </thead>
          <tbody>
            {providers.map(provider => (
              <tr key={provider._id} className="border-t">
                <td className="px-4 py-2">{provider.businessName}</td>
                <td className="px-4 py-2">{provider.user?.fullName}</td>
                <td className="px-4 py-2">{provider.user?.email}</td>
                <td className="px-4 py-2 capitalize">{provider.verificationStatus}</td>
                <td className="px-4 py-2 space-x-2">
                  {provider.verificationStatus === 'pending' && (
                    <>
                      <button onClick={() => handleVerification(provider._id, 'verified', 'All documents approved')} className="text-green-600 hover:underline">Approve</button>
                      <button onClick={() => handleVerification(provider._id, 'rejected', 'Documents invalid')} className="text-red-600 hover:underline">Reject</button>
                    </>
                  )}
                  {provider.verificationStatus === 'verified' && <span className="text-gray-500">Already verified</span>}
                  {provider.verificationStatus === 'rejected' && <span className="text-gray-500">Rejected</span>}
                </td>
              </tr>
            ))}
            {providers.length === 0 && <tr><td colSpan="5" className="text-center py-4">No pending verifications</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
        <span className="px-3 py-1">Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p+1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
};

export default AdminProviders;