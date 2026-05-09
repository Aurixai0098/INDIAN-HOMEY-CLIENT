import { useState, useEffect } from 'react';
import { fetchAdminDashboard } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await fetchAdminDashboard();
      if (res.success) {
        setStats(res.data.stats);
        setRecentBookings(res.data.recentBookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow"><div className="text-gray-500">Total Users</div><div className="text-2xl font-bold">{stats?.totalUsers || 0}</div></div>
        <div className="bg-white p-4 rounded shadow"><div className="text-gray-500">Providers</div><div className="text-2xl font-bold">{stats?.totalProviders || 0}</div></div>
        <div className="bg-white p-4 rounded shadow"><div className="text-gray-500">Bookings</div><div className="text-2xl font-bold">{stats?.totalBookings || 0}</div></div>
        <div className="bg-white p-4 rounded shadow"><div className="text-gray-500">Total Revenue</div><div className="text-2xl font-bold">₹{stats?.totalRevenue || 0}</div></div>
        <div className="bg-white p-4 rounded shadow"><div className="text-gray-500">Pending Verifications</div><div className="text-2xl font-bold">{stats?.pendingVerifications || 0}</div></div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded shadow">
        <div className="p-4 border-b font-semibold">Recent Bookings</div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr><th className="px-4 py-2 text-left">Booking ID</th><th className="px-4 py-2 text-left">Customer</th><th className="px-4 py-2 text-left">Provider</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-left">Total</th><th className="px-4 py-2 text-left">Date</th></tr>
            </thead>
            <tbody>
              {recentBookings.map(booking => (
                <tr key={booking._id} className="border-t">
                  <td className="px-4 py-2">{booking.bookingId}</td>
                  <td className="px-4 py-2">{booking.customer?.fullName}</td>
                  <td className="px-4 py-2">{booking.provider?.businessName}</td>
                  <td className="px-4 py-2 capitalize">{booking.status}</td>
                  <td className="px-4 py-2">₹{booking.pricing?.total}</td>
                  <td className="px-4 py-2">{new Date(booking.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentBookings.length === 0 && <tr><td colSpan="6" className="text-center py-4">No recent bookings</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;