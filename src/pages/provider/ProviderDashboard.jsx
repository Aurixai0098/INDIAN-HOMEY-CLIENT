// src/pages/provider/ProviderDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, CheckCircle, DollarSign, Star, Clock, TrendingUp, 
  Briefcase, Users, ArrowRight, Eye, Loader2,
  MessageCircle, ThumbsUp, Award, Zap, Wallet, IndianRupee,
  Shield, User, Briefcase as BriefcaseIcon
} from 'lucide-react';
import { fetchProviderStats, fetchMyBookings, fetchProviderProfile, fetchWallet } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Mini chart component for earnings trend
const EarningsTrend = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.earnings), 100);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center">
          <div 
            className="w-full bg-emerald-400/60 rounded-t transition-all duration-500 hover:bg-emerald-500"
            style={{ height: `${(item.earnings / maxValue) * 100}%`, minHeight: '4px' }}
          />
          <span className="text-[10px] text-gray-400 mt-1">{item.month}</span>
        </div>
      ))}
    </div>
  );
};

// Star Rating Display Component
const StarRating = ({ rating, size = 'md', showNumber = true }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`${sizeClass} ${i < fullStars ? 'text-amber-400' : (i === fullStars && hasHalfStar ? 'text-amber-400' : 'text-gray-300')}`}>
            ★
          </span>
        ))}
      </div>
      {showNumber && <span className="text-sm font-medium text-gray-700 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
};

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [earningsTrend, setEarningsTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, bookingsRes, profileRes, walletRes] = await Promise.all([
        fetchProviderStats(),
        fetchMyBookings(1, 5),
        fetchProviderProfile(),
        fetchWallet()
      ]);
      if (statsRes.success) {
        setStats(statsRes.data);
        if (statsRes.data.earningsSummary && statsRes.data.earningsSummary.length > 0) {
          setEarningsTrend(statsRes.data.earningsSummary.slice(0, 6).reverse());
        } else {
          setEarningsTrend([
            { month: 'Jan', earnings: 1200 },
            { month: 'Feb', earnings: 1800 },
            { month: 'Mar', earnings: 1500 },
            { month: 'Apr', earnings: 2200 },
            { month: 'May', earnings: 2700 },
            { month: 'Jun', earnings: 3100 },
          ]);
        }
      }
      if (bookingsRes.success) setRecentBookings(bookingsRes.data.bookings || []);
      if (profileRes.success) setProfile(profileRes.data.provider);
      if (walletRes.success) setWalletData(walletRes.data.wallet);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const statsData = stats?.stats || {};
  const rating = stats?.rating || {};
  const completedBookings = statsData.completedBookings || 0;
  const totalBookings = statsData.totalBookings || 0;
  const totalEarningsGross = statsData.totalEarnings || 0;
  const avgRating = rating.average || 0;
  const reviewCount = rating.count || 0;
  const experienceYears = profile?.experience?.years || 0;
  const businessName = profile?.businessName || user?.businessName || `${user?.firstName} ${user?.lastName}`;
  const avatarUrl = profile?.user?.avatar?.url || user?.avatar?.url;
  const isAvailable = profile?.isAvailable || false;
  const isVerified = profile?.verificationStatus === 'verified';
  const walletBalance = walletData?.balance || 0;
  const walletTotalEarnings = walletData?.totalEarnings || 0;
  const walletTotalWithdrawn = walletData?.totalWithdrawals || 0;

  // Booking status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
      in_progress: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'In Progress' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
    };
    const style = config[status] || config.pending;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Unified Profile + Wallet Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar + Name + Rating + Badges */}
          <div className="flex items-center gap-4 md:min-w-[260px]">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
              <img
                src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(businessName)}&background=ffffff&color=10b981&size=80`}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">{businessName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={avgRating} size="sm" showNumber={true} />
                <span className="text-sm opacity-90">({reviewCount} reviews)</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </span>
                {isVerified && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-white/20 backdrop-blur-sm flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row: Completed Jobs, Total Earnings, Years Exp, Wallet Balance */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{completedBookings}</p>
              <p className="text-xs opacity-90">Completed Jobs</p>
            </div>
            <div>
              <p className="text-2xl font-bold">₹{walletTotalEarnings.toLocaleString()}</p>
              <p className="text-xs opacity-90">Total Earnings</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{experienceYears}+</p>
              <p className="text-xs opacity-90">Years Exp.</p>
            </div>
            <div>
              <p className="text-2xl font-bold">₹{walletBalance.toLocaleString()}</p>
              <p className="text-xs opacity-90">Wallet Balance</p>
              <p className="text-[10px] opacity-70 mt-0.5">Withdrawn: ₹{walletTotalWithdrawn.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid (Total Bookings, Completed Jobs, Total Earnings (Gross), Rating) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalBookings}</p>
          <p className="text-sm text-gray-500">Total Bookings</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{completedBookings}</p>
          <p className="text-sm text-gray-500">Completed Jobs</p>
          <p className="text-xs text-emerald-600 mt-1">
            {totalBookings ? Math.round((completedBookings / totalBookings) * 100) : 0}% completion rate
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">₹{totalEarningsGross.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Earnings (Gross)</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-gray-800">{avgRating.toFixed(1)}</p>
            <span className="text-sm text-gray-400">/ 5</span>
          </div>
          <p className="text-sm text-gray-500">Rating ({reviewCount} reviews)</p>
        </div>
      </div>

      {/* Quick Actions + Earnings Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link to="/provider/bookings" className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
              <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-emerald-600" /><span className="text-sm font-medium text-gray-700">View All Bookings</span></div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
            </Link>
            <Link to="/provider/services" className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
              <div className="flex items-center gap-3"><Briefcase className="w-4 h-4 text-blue-600" /><span className="text-sm font-medium text-gray-700">Manage Services</span></div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
            </Link>
            <Link to="/provider/wallet" className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
              <div className="flex items-center gap-3"><Wallet className="w-4 h-4 text-amber-600" /><span className="text-sm font-medium text-gray-700">Withdraw Earnings</span></div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
            </Link>
            <Link to="/provider/profile" className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
              <div className="flex items-center gap-3"><Users className="w-4 h-4 text-purple-600" /><span className="text-sm font-medium text-gray-700">Update Profile</span></div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Earnings Trend (Last 6 Months)
            </h3>
            <Link to="/provider/wallet" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">View Details →</Link>
          </div>
          <EarningsTrend data={earningsTrend} />
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Total: ₹{earningsTrend.reduce((sum, m) => sum + m.earnings, 0).toLocaleString()}</span>
            <span>Avg: ₹{Math.round(earningsTrend.reduce((sum, m) => sum + m.earnings, 0) / (earningsTrend.length || 1)).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              Recent Bookings
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest service requests</p>
          </div>
          <Link to="/provider/bookings" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No bookings yet
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-700">{booking.bookingId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {booking.customer?.firstName?.[0] || 'U'}
                        </div>
                        <span className="text-sm text-gray-700">{booking.customer?.fullName || booking.customer?.firstName || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {booking.items?.[0]?.serviceName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(booking.scheduledDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      ₹{booking.pricing?.total?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/provider/bookings/${booking._id}`} className="text-gray-400 hover:text-emerald-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;