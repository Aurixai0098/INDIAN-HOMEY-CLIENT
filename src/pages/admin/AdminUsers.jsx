import { useState, useEffect } from 'react';
import { fetchAdminUsers, fetchAdminUserDetails, updateAdminUserStatus } from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers(page, 20);
      if (res.success) {
        setUsers(res.data.users);
        setTotalPages(Math.ceil(res.data.pagination.total / res.data.pagination.limit));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  const viewUserDetails = async (userId) => {
    try {
      const res = await fetchAdminUserDetails(userId);
      if (res.success) setSelectedUser(res.data.user);
      setShowModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const updateStatus = async (userId, newStatus) => {
    setStatusUpdating(true);
    try {
      await updateAdminUserStatus(userId, newStatus);
      loadUsers();
      alert(`User status updated to ${newStatus}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr><th className="px-4 py-2 text-left">Name</th><th className="px-4 py-2 text-left">Email</th><th className="px-4 py-2 text-left">Phone</th><th className="px-4 py-2 text-left">Role</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-left">Actions</th></tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-t">
                <td className="px-4 py-2">{user.fullName}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.phone}</td>
                <td className="px-4 py-2 capitalize">{user.role}</td>
                <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span></td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => viewUserDetails(user._id)} className="text-blue-600 hover:underline">View</button>
                  {user.status === 'active' ? (
                    <button onClick={() => updateStatus(user._id, 'suspended')} disabled={statusUpdating} className="text-red-600 hover:underline">Suspend</button>
                  ) : (
                    <button onClick={() => updateStatus(user._id, 'active')} disabled={statusUpdating} className="text-green-600 hover:underline">Activate</button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan="6" className="text-center py-4">No users found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
        <span className="px-3 py-1">Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p+1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            <p><strong>Name:</strong> {selectedUser.fullName}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Phone:</strong> {selectedUser.phone}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>Status:</strong> {selectedUser.status}</p>
            <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
            <button onClick={() => setShowModal(false)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;