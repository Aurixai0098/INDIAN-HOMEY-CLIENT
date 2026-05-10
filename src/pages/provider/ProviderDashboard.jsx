import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProviderStats, fetchMyBookings } from '../../services/api';

const ProviderDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        fetchProviderStats(),
        fetchMyBookings(1, 5), // Uses same function, role-based filtering
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (bookingsRes.success) setRecentBookings(bookingsRes.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;

  const statsData = stats?.stats || {};
  const rating = stats?.rating || {};

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Provider Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-gray-500 text-sm">Total Bookings</p>
          <p className="text-2xl font-bold">{statsData.totalBookings || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-gray-500 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-600">{statsData.completedBookings || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-gray-500 text-sm">Total Earnings</p>
          <p className="text-2xl font-bold text-emerald-600">₹{statsData.totalEarnings || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-gray-500 text-sm">Rating</p>
          <p className="text-2xl font-bold">{rating.average || 0} ★</p>
          <p className="text-xs text-gray-400">({rating.count || 0} reviews)</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Recent Bookings</h2>
          <Link to="/provider/bookings" className="text-emerald-600 text-sm">View All</Link>
        </div>
        <div className="divide-y">
          {recentBookings.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">No bookings yet</p>
          ) : (
            recentBookings.map(booking => (
              <div key={booking._id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{booking.bookingId}</p>
                  <p className="text-sm text-gray-500">{booking.customer?.fullName || booking.customer?.firstName}</p>
                  <p className="text-xs text-gray-400">{new Date(booking.scheduledDate).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  booking.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                  booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {booking.status?.toUpperCase()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;