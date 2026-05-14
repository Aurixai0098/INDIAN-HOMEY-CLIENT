import { useState, useEffect } from 'react';
import { 
  Users, Wrench, MapPin, Calendar, Zap, CheckCircle, XCircle, 
  Banknote, TrendingUp, Download, Bell, Info, CreditCard, 
  Trophy, BarChart3, DollarSign,
  Building, BookOpen, ShieldCheck, CalendarCheck, CheckCircle2,
  Coins, Hourglass, AlertTriangle, UserCheck, Activity, UserMinus,
  RefreshCw, AlertCircle
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, FunnelChart, Funnel, LabelList
} from 'recharts';
import { fetchAdminDashboard } from '../../services/api';

// Helper: format currency with exactly 2 decimals
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0.00';
  return `₹${Number(amount).toFixed(2)}`;
};

// Helper: format plain number
const formatNumber = (value) => {
  if (value === undefined || value === null) return '0';
  const num = Number(value);
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminDashboard();
      
      if (res.success) {
        const dashboardData = res.data;
        
        // Set main stats from API
        setStats({
          totalUsers: dashboardData.counts?.users || 0,
          totalProviders: dashboardData.counts?.providers || 0,
          totalBookings: dashboardData.counts?.bookings || 0,
          totalCategories: dashboardData.counts?.categories || 0,
          totalServices: dashboardData.counts?.services || 0,
          todayBookings: dashboardData.today?.bookings || 0,
          todayRevenue: dashboardData.today?.revenue || 0,
          monthlyBookings: dashboardData.monthly?.bookings || 0,
          monthlyRevenue: dashboardData.monthly?.revenue || 0,
          yearlyBookings: dashboardData.yearly?.bookings || 0,
          yearlyRevenue: dashboardData.yearly?.revenue || 0,
          totalRevenue: dashboardData.totalRevenue || 0,
          platformCommission: dashboardData.platformCommission || 0,
          pendingWithdrawals: dashboardData.pendingWithdrawals || 0,
          activeCities: dashboardData.activeCities || 0,
          liveBookingsNow: dashboardData.liveBookingsNow || 0,
          completedToday: dashboardData.today?.bookings || 0,
          cancelledToday: dashboardData.cancelledToday || 0,
          pendingVerifications: dashboardData.pendingVerifications || 0,
          activeProviders: dashboardData.activeProviders || 0,
          busyProviders: dashboardData.busyProviders || 0,
          offlineProviders: dashboardData.offlineProviders || 0,
          failedPayments: dashboardData.failedPayments || 0,
          refundRequests: dashboardData.refundRequests || 0,
        });
        
        // Set recent bookings
        setRecentBookings(dashboardData.recentBookings || []);
        
        // Process top providers from API or generate from earnings data
        if (dashboardData.topProviders && dashboardData.topProviders.length > 0) {
          setTopProviders(dashboardData.topProviders);
        } else if (dashboardData.providerEarnings) {
          setTopProviders(dashboardData.providerEarnings.slice(0, 10));
        }
        
        // Process top services from API
        if (dashboardData.topServices && dashboardData.topServices.length > 0) {
          setTopServices(dashboardData.topServices);
        }
        
        // Process revenue trend data
        if (dashboardData.revenueTrend && dashboardData.revenueTrend.length > 0) {
          setRevenueTrend(dashboardData.revenueTrend);
        } else {
          setRevenueTrend([
            { month: 'Jan', revenue: dashboardData.monthly?.revenue * 0.3 || 2000 },
            { month: 'Feb', revenue: dashboardData.monthly?.revenue * 0.4 || 3500 },
            { month: 'Mar', revenue: dashboardData.monthly?.revenue * 0.5 || 2800 },
            { month: 'Apr', revenue: dashboardData.monthly?.revenue * 0.7 || 5000 },
            { month: 'May', revenue: dashboardData.monthly?.revenue || 4200 },
          ]);
        }
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    alert("Report download feature will be implemented soon");
  };

  // Stats list for grid display
  const statsList = [
    { label: 'Total Users', key: 'totalUsers', icon: <Users size={18} />, isCurrency: false },
    { label: 'Providers', key: 'totalProviders', icon: <Building size={18} />, isCurrency: false },
    { label: 'Total Bookings', key: 'totalBookings', icon: <BookOpen size={18} />, isCurrency: false },
    { label: 'Total Revenue', key: 'totalRevenue', icon: <DollarSign size={18} />, isCurrency: true },
    { label: 'Pending Verifications', key: 'pendingVerifications', icon: <ShieldCheck size={18} />, isCurrency: false },
    { label: 'Today Bookings', key: 'todayBookings', icon: <CalendarCheck size={18} />, isCurrency: false },
    { label: 'Completed Today', key: 'completedToday', icon: <CheckCircle2 size={18} />, isCurrency: false },
    { label: 'Cancelled Today', key: 'cancelledToday', icon: <XCircle size={18} />, isCurrency: false },
    { label: 'Monthly Revenue', key: 'monthlyRevenue', icon: <TrendingUp size={18} />, isCurrency: true },
    { label: 'Today Revenue', key: 'todayRevenue', icon: <Coins size={18} />, isCurrency: true },
    { label: 'Pending Payments', key: 'pendingWithdrawals', icon: <Hourglass size={18} />, isCurrency: false },
    { label: 'Failed Payments', key: 'failedPayments', icon: <AlertTriangle size={18} />, isCurrency: false },
    { label: 'Active Providers', key: 'activeProviders', icon: <UserCheck size={18} />, isCurrency: false },
    { label: 'Busy Providers', key: 'busyProviders', icon: <Activity size={18} />, isCurrency: false },
    { label: 'Offline Providers', key: 'offlineProviders', icon: <UserMinus size={18} />, isCurrency: false },
    { label: 'Refund Requests', key: 'refundRequests', icon: <RefreshCw size={18} />, isCurrency: false },
  ];

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
          <button 
            onClick={loadDashboard}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header with Download Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button 
          onClick={downloadReport}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
        >
          <Download size={18} />
          Download Report
        </button>
      </div>

      {/* Top Stats Grid with Icons */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {statsList.map((stat, idx) => (
          <IconStatCard
            key={idx}
            label={stat.label}
            value={stats?.[stat.key] || 0}
            icon={stat.icon}
            isCurrency={stat.isCurrency}
          />
        ))}
      </div>

      {/* Grid for Charts and Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Area Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" /> Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} 
                     tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed KPI Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            label="Live Booking Now" 
            value={stats?.liveBookingsNow || 0} 
            icon={<Zap size={20}/>} 
            color="text-red-500" 
            bg="bg-red-50" 
          />
          <StatCard 
            label="Completed Today" 
            value={stats?.completedToday || 0} 
            icon={<CheckCircle size={20}/>} 
            color="text-green-500" 
            bg="bg-green-50" 
          />
          <StatCard 
            label="Active Cities" 
            value={stats?.activeCities || 0} 
            icon={<MapPin size={20}/>} 
            color="text-purple-500" 
            bg="bg-purple-50" 
          />
          <StatCard 
            label="Platform Commission" 
            value={formatCurrency(stats?.platformCommission || 0)} 
            icon={<Banknote size={20}/>} 
            color="text-orange-500" 
            bg="bg-orange-50" 
          />
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Booking ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Provider</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentBookings.length > 0 ? (
                recentBookings.slice(0, 10).map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{booking.bookingId}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {booking.customer?.firstName} {booking.customer?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {booking.provider?.businessName || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                        booking.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {booking.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {formatCurrency(booking.pricing?.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No recent bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 10 Providers by Revenue */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Trophy size={18} className="text-indigo-600" />
            Top 10 Providers by Revenue
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Bookings</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {topProviders.length > 0 ? (
                topProviders.slice(0, 10).map((provider, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {provider.name || provider.businessName || provider.provider?.businessName || 'Unknown'}
                    </td>
                    <td className="px-6 py-3 text-green-600 font-semibold">
                      {formatCurrency(provider.revenue || provider.totalEarnings || 0)}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {provider.bookings || provider.bookingCount || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    No provider data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 5 Service Demand Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-amber-600" />
          Top 5 Service Demand
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart 
            data={topServices.length > 0 ? topServices : [
              { name: 'Plumbing', demand: 0 },
              { name: 'Electrical', demand: 0 },
              { name: 'Cleaning', demand: 0 },
              { name: 'AC Repair', demand: 0 },
              { name: 'Painting', demand: 0 },
            ]} 
            layout="vertical" 
            margin={{ left: 50 }}
          >
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip formatter={(value) => [`${value} bookings`, 'Demand']} />
            <Bar dataKey="demand" fill="#f59e0b" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// IconStatCard Component
const IconStatCard = ({ label, value, icon, isCurrency = false }) => {
  let displayValue = value;
  if (isCurrency) {
    displayValue = formatCurrency(value);
  } else {
    displayValue = formatNumber(value);
  }
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{label}</p>
        <p className="text-xl font-black text-gray-900">{displayValue}</p>
      </div>
    </div>
  );
};

// StatCard Component
const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-lg ${bg} ${color}`}>{icon}</div>
    <div>
      <p className="text-gray-500 text-xs font-medium">{label}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;