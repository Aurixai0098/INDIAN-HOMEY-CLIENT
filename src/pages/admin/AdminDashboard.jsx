import { useState, useEffect } from 'react';
import { 
  Users, Wrench, MapPin, Calendar, 
  Zap, CheckCircle, XCircle, Banknote, 
  TrendingUp, Download, Bell, Info, CreditCard 
} from 'lucide-react'; // Tooltip hata kar Info add kiya
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, FunnelChart, Funnel, LabelList
} from 'recharts'; // Recharts ka Tooltip yahan hai
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
        const extendedStats = {
          ...res.data.stats,
          activeCities: 24,
          liveBookingsNow: 38,
          bookingsToday: 142,
          completedToday: 89,
          cancelledToday: 12,
          totalRevenue: 0, // Image ke hisaab se 0
          pendingVerifications: 0,
        };
        setStats(extendedStats);
        setRecentBookings(res.data.recentBookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    alert("Generating and downloading all reports...");
    // Yahan aap CSV ya PDF logic add kar sakte hain
  };
  const paymentMethodData = [
    { name: 'Credit Card', value: 45, color: '#3b82f6' },
    { name: 'UPI', value: 35, color: '#10b981' },
    { name: 'Net Banking', value: 12, color: '#f59e0b' },
    { name: 'Wallet', value: 8, color: '#8b5cf6' },
  ];

  const bookingFunnelData = [
    { name: 'Visited Service Page', value: 12400 },
    { name: 'Added to Cart', value: 7800 },
    { name: 'Checkout Started', value: 5200 },
    { name: 'Payment Completed', value: 3800 },
    { name: 'Booking Confirmed', value: 3600 },
  ];

  const topServicesData = [
    { name: 'Plumbing', demand: 342 },
    { name: 'Electrical', demand: 298 },
    { name: 'Cleaning', demand: 267 },
    { name: 'AC Repair', demand: 189 },
    { name: 'Painting', demand: 145 },
  ];

  const topProvidersData = [
    { name: 'Quick Fix Plumbers', revenue: 125000, bookings: 342 },
    { name: 'Spark Electrics', revenue: 112000, bookings: 298 },
    { name: 'CleanMasters', revenue: 98000, bookings: 267 },
    { name: 'CoolAir Services', revenue: 76000, bookings: 189 },
    { name: 'Elite Painters', revenue: 62000, bookings: 145 },
    { name: 'Secure Locks', revenue: 54000, bookings: 112 },
    { name: 'Garden Pros', revenue: 48000, bookings: 98 },
    { name: 'Pest Control Co', revenue: 43000, bookings: 87 },
    { name: 'Movers & Packers', revenue: 39000, bookings: 76 },
    { name: 'Tech Repair', revenue: 35000, bookings: 68 },
  ];


  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

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

      {/* Top Stats - Exact Layout from Image */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <ImageStatCard label="Total Users" value={stats?.totalUsers || 12} />
        <ImageStatCard label="Providers" value={stats?.totalProviders || 3} />
        <ImageStatCard label=" Total Bookings" value={stats?.totalBookings || 8} />
        <ImageStatCard label="Total Revenue" value={`₹${stats?.totalRevenue || 0}`} />
        <ImageStatCard label="Pending Verifications" value={stats?.pendingVerifications || 0} />
        <ImageStatCard label="Today Bookings" value={stats?.totalBookings || 8} />
        <ImageStatCard label=" Completed Today" value={stats?.completedToday || 8} />
        <ImageStatCard label="Cancelled Today" value={stats?.cancelledToday || 8} />
        <ImageStatCard label="Monthly Revenue" value={`₹${stats?.monthlyRevenue || 0}`} />
        <ImageStatCard label="Today Revenue" value={`₹${stats?.todayRevenue || 0}`} />
        <ImageStatCard label="Pending Payments" value={stats?.pendingPayments || 0} />
        <ImageStatCard label="Failed Payments" value={stats?.failedPayments || 0} />
        <ImageStatCard label="Active Providers" value={stats?.activeProviders || 0} />
        <ImageStatCard label="Busy Providers" value={stats?.busyProviders || 0} />
        <ImageStatCard label="Offline Providers" value={stats?.offlineProviders || 0} />
        <ImageStatCard label="Refund Requests" value={stats?.refundRequests || 0} />
      </div>

      {/* Grid for Charts and Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Area Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" /> Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueTrendData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed KPI Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Live Booking Now" value={stats?.liveBookingsNow} icon={<Zap size={20}/>} color="text-red-500" bg="bg-red-50" />
          <StatCard label="Completed" value={stats?.completedToday} icon={<CheckCircle size={20}/>} color="text-green-500" bg="bg-green-50" />
          <StatCard label="Active Cities" value={stats?.activeCities} icon={<MapPin size={20}/>} color="text-purple-500" bg="bg-purple-50" />
          <StatCard label="Alerts" value="4" icon={<Bell size={20}/>} color="text-orange-500" bg="bg-orange-50" />
          
        </div>
        
      </div>

      {/* Recent Bookings Table - Exact Image Style */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
              {recentBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{booking.bookingId}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{booking.customer?.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{booking.provider?.businessName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight ${
                      booking.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                      booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{booking.pricing?.total?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Top 10 Providers by Revenue
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bookings</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {topProvidersData.map((provider, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-800">{provider.name}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-green-600 font-semibold">₹{provider.revenue.toLocaleString()}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-600">{provider.bookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        {/* Top 5 Service Demand Bar Chart */}
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Top 5 Service Demand
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topServicesData} layout="vertical" margin={{ left: 50 }}>
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

// Reusable Components
const ImageStatCard = ({ label, value }) => (
  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">{label}</p>
    <p className="text-2xl font-black text-gray-900">{value}</p>
  </div>
);

const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-lg ${bg} ${color}`}>{icon}</div>
    <div>
      <p className="text-gray-500 text-xs font-medium">{label}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const revenueTrendData = [
  { month: 'Jan', revenue: 2000 }, { month: 'Feb', revenue: 3500 },
  { month: 'Mar', revenue: 2800 }, { month: 'Apr', revenue: 5000 },
  { month: 'May', revenue: 4200 },
];

export default AdminDashboard;