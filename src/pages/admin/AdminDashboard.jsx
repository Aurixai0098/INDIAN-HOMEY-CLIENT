import { useState, useEffect } from 'react';
import { fetchAdminDashboard } from '../../services/api';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Package,
  Star,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

// ✅ Helper function to format price
const formatPrice = (price) => {
    return `₹${Number(price).toFixed(2)}`;
};

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminDashboard();
      if (res.success) {
        setStats(res.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
        <button onClick={loadDashboardData} className="ml-4 underline">Retry</button>
      </div>
    );
  }

  const statsData = stats?.data || stats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening with your platform today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={statsData?.counts?.users || 0}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Providers"
          value={statsData?.counts?.providers || 0}
          icon={Briefcase}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Bookings"
          value={statsData?.counts?.bookings || 0}
          icon={Calendar}
          color="bg-emerald-500"
        />
        <StatCard
          title="Total Revenue"
          value={formatPrice(statsData?.totalRevenue || 0)}
          icon={DollarSign}
          color="bg-orange-500"
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Bookings"
          value={statsData?.today?.bookings || 0}
          icon={Clock}
          color="bg-teal-500"
          subtitle={`Revenue: ${formatPrice(statsData?.today?.revenue || 0)}`}
        />
        <StatCard
          title="Monthly Bookings"
          value={statsData?.monthly?.bookings || 0}
          icon={TrendingUp}
          color="bg-indigo-500"
          subtitle={`Revenue: ${formatPrice(statsData?.monthly?.revenue || 0)}`}
        />
        <StatCard
          title="Platform Commission"
          value={formatPrice(statsData?.platformCommission || 0)}
          icon={Package}
          color="bg-pink-500"
        />
        <StatCard
          title="Pending Withdrawals"
          value={formatPrice(statsData?.pendingWithdrawals || 0)}
          icon={DollarSign}
          color="bg-yellow-500"
        />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {statsData?.recentBookings?.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.bookingId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {booking.customer?.firstName} {booking.customer?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{booking.provider?.businessName || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-emerald-600">
                    {formatPrice(booking.pricing?.total)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!statsData?.recentBookings || statsData.recentBookings.length === 0) && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;