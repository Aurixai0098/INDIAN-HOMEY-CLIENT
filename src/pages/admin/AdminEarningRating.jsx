// src/pages/admin/AdminEarningRating.jsx
import { useState, useEffect } from 'react';
import {
  DollarSign, Star, TrendingUp, Users, Award, Calendar,
  Search, Filter, Eye, ChevronLeft, ChevronRight,
  X, BarChart3, Clock, ThumbsUp, MessageCircle,
  User, Mail, Briefcase, Loader2, RefreshCw, AlertTriangle, CheckCircle2
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import {
  fetchProviderEarningsList,
  fetchProviderEarningsDetails,
  fetchProviderReviews
} from '../../services/api';

// Helper: format currency
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

// Helper: format number
const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return Number(num).toLocaleString('en-IN');
};

// Helper: format date
const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

// Star Rating Component
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

// Avatar component with image support
const UserAvatar = ({ user, size = 'md' }) => {
  const avatarUrl = user?.avatar?.url;
  const name = user?.fullName || user?.businessName || user?.firstName || '?';
  const colors = [
    'from-blue-400 to-blue-600', 'from-emerald-400 to-emerald-600',
    'from-purple-400 to-purple-600', 'from-rose-400 to-rose-600',
    'from-amber-400 to-amber-600', 'from-cyan-400 to-cyan-600',
    'from-indigo-400 to-indigo-600', 'from-pink-400 to-pink-600'
  ];
  const colorIndex = name.length % colors.length;
  const gradient = colors[colorIndex];
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl', xl: 'w-24 h-24 text-3xl'
  };
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-md`}
      />
    );
  }
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-lg`}>
      {name[0]?.toUpperCase() || '?'}
    </div>
  );
};

// ============================================
// DETAIL MODAL – Earnings & Ratings Breakdown
// ============================================
const ProviderDetailModal = ({ provider, onClose }) => {
  const [activeTab, setActiveTab] = useState('earnings');
  const [loading, setLoading] = useState(false);
  const [earningsBreakdown, setEarningsBreakdown] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!provider) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [earningsRes, reviewsRes] = await Promise.all([
          fetchProviderEarningsDetails(provider.id),
          fetchProviderReviews(provider.id, 1, 10)
        ]);
        if (earningsRes?.success && earningsRes.data) {
          const apiData = earningsRes.data;
          const transformed = {
            serviceBreakdown: (apiData.earningsByService || []).map(item => ({
              name: item.serviceName,
              amount: item.amount,
              bookings: item.bookings,
              percentage: item.percentage || 0
            })),
            monthlyEarnings: (apiData.monthlyTrend || []).map(item => ({
              month: item.month,
              earnings: item.earnings
            })),
            recentBookings: (apiData.recentBookings || []).map(b => ({
              id: b.id,
              service: b.service,
              amount: b.amount,
              date: b.date
            }))
          };
          setEarningsBreakdown(transformed);
        } else {
          // Fallback mock data
          setEarningsBreakdown({
            serviceBreakdown: [
              { name: 'Plumbing', amount: 42500, bookings: 28, percentage: 34 },
              { name: 'Electrical', amount: 38200, bookings: 24, percentage: 30 },
              { name: 'AC Repair', amount: 27800, bookings: 15, percentage: 22 },
              { name: 'Cleaning', amount: 19600, bookings: 12, percentage: 14 },
            ],
            monthlyEarnings: [
              { month: 'Jan', earnings: 18500 }, { month: 'Feb', earnings: 22100 },
              { month: 'Mar', earnings: 20300 }, { month: 'Apr', earnings: 27900 },
              { month: 'May', earnings: 31200 }, { month: 'Jun', earnings: 29800 }
            ],
            recentBookings: [
              { id: 'B001', service: 'Plumbing', amount: 1250, date: '2025-05-10' },
              { id: 'B002', service: 'Electrical', amount: 800, date: '2025-05-08' },
              { id: 'B003', service: 'AC Repair', amount: 2200, date: '2025-05-05' }
            ]
          });
        }
        if (reviewsRes?.success) {
          setReviews(reviewsRes.data.reviews || []);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error(err);
        setToast({ message: err.message || 'Failed to load details', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [provider]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (!provider) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Toast */}
        {toast && (
          <div className="absolute top-4 right-4 z-10 bg-red-50 text-red-800 rounded-lg px-4 py-2 text-sm shadow">
            {toast.message}
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <UserAvatar user={provider} size="lg" />
            <div>
              <h2 className="text-xl font-bold">{provider.businessName || provider.name}</h2>
              <div className="flex items-center gap-3 text-sm text-blue-100 mt-0.5">
                <span className="flex items-center gap-1"><User size={14} />{provider.ownerName}</span>
                <span className="flex items-center gap-1"><Mail size={14} />{provider.email}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><X size={20} /></button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-6 h-6 text-green-600" /></div>
            <div><p className="text-xs text-gray-500">Total Earnings</p><p className="text-2xl font-bold">{formatCurrency(provider.totalEarnings)}</p></div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Briefcase className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-xs text-gray-500">Total Bookings</p><p className="text-2xl font-bold">{formatNumber(provider.totalBookings)}</p></div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Star className="w-6 h-6 text-yellow-600" /></div>
            <div><p className="text-xs text-gray-500">Average Rating</p><p className="text-2xl font-bold">{provider.avgRating?.toFixed(1) || '0'}</p><StarRating rating={provider.avgRating || 0} size="sm" /></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6 pt-2 bg-gray-50">
          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'earnings' ? 'bg-white text-blue-600 border-l border-r border-t' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Earnings Breakdown
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'reviews' ? 'bg-white text-blue-600 border-l border-r border-t' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Ratings & Reviews ({reviews.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : activeTab === 'earnings' && earningsBreakdown ? (
            <div className="space-y-8">
              {/* Service-wise earnings chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">Earnings by Service</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={earningsBreakdown.serviceBreakdown || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="amount"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {(earningsBreakdown.serviceBreakdown || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {(earningsBreakdown.serviceBreakdown || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />{item.name}</div>
                        <div className="font-semibold">{formatCurrency(item.amount)} <span className="text-xs text-gray-500">({item.bookings} bookings)</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monthly earnings trend */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={18} /> Monthly Earnings Trend</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={earningsBreakdown.monthlyEarnings || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Area type="monotone" dataKey="earnings" stroke="#3b82f6" fill="#93c5fd" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent bookings table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Earnings from Bookings</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Booking ID</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Service</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Amount</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {(earningsBreakdown.recentBookings || []).map((b, idx) => (
                        <tr key={idx}><td className="px-4 py-2 text-sm">{b.id}</td><td className="px-4 py-2 text-sm">{b.service}</td><td className="px-4 py-2 text-sm font-medium">{formatCurrency(b.amount)}</td><td className="px-4 py-2 text-sm">{formatDate(b.date)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'reviews' ? (
            <div className="space-y-4">
              {/* Rating distribution summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-700 mb-2">Rating Summary</h4>
                <div className="flex items-center gap-4">
                  <div className="text-center"><div className="text-3xl font-bold text-gray-800">{provider.avgRating?.toFixed(1) || '0'}</div><StarRating rating={provider.avgRating || 0} size="sm" /><div className="text-xs text-gray-500">Overall</div></div>
                  <div className="flex-1 space-y-1">
                    {[5,4,3,2,1].map(star => {
                      const count = reviews.filter(r => Math.floor(r.rating?.overall || r.rating) === star).length;
                      const percent = reviews.length ? (count/reviews.length)*100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-sm"><span className="w-8">{star}★</span><div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }} /></div><span className="w-8 text-xs text-gray-500">{count}</span></div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Individual reviews */}
              <div className="space-y-3">
                {reviews.map((review, idx) => (
                  <div key={review._id || review.id || idx} className="border rounded-xl p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <UserAvatar user={review.customer} size="sm" />
                        <span className="font-medium">{review.customer?.fullName || review.userName || 'Customer'}</span>
                        <StarRating rating={review.rating?.overall || review.rating} size="sm" />
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(review.createdAt || review.date)}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
                {reviews.length === 0 && <p className="text-center text-gray-400 py-8">No reviews yet.</p>}
              </div>
            </div>
          ) : <div className="text-center py-12 text-gray-400">No data available</div>}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const AdminEarningRating = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('earnings');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [stats, setStats] = useState({ totalEarnings: 0, totalBookings: 0, avgRating: 0 });
  const [toast, setToast] = useState(null);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const res = await fetchProviderEarningsList(page, 15, searchTerm);
      if (res.success) {
        let providersList = res.data.providers || [];
        // Apply sorting client-side if not done by backend
        if (sortBy === 'earnings') providersList.sort((a,b) => b.totalEarnings - a.totalEarnings);
        else if (sortBy === 'rating') providersList.sort((a,b) => b.avgRating - a.avgRating);
        else if (sortBy === 'bookings') providersList.sort((a,b) => b.totalBookings - a.totalBookings);
        setProviders(providersList);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalItems(res.data.pagination?.total || 0);
        setStats({
          totalEarnings: res.data.summary?.totalEarnings || providersList.reduce((s,p) => s + p.totalEarnings, 0),
          totalBookings: res.data.summary?.totalBookings || providersList.reduce((s,p) => s + p.totalBookings, 0),
          avgRating: res.data.summary?.avgRating || (providersList.length ? providersList.reduce((s,p) => s + p.avgRating, 0) / providersList.length : 0)
        });
      } else {
        // Fallback mock data if API fails
        const mockProviders = [
          { id: 'p1', businessName: 'Quick Fix Plumbers', ownerName: 'Rahul Yadav', email: 'rahul@quickfix.com', totalEarnings: 125000, totalBookings: 342, avgRating: 4.8 },
          { id: 'p2', businessName: 'Spark Electrics', ownerName: 'Priya Sharma', email: 'priya@spark.com', totalEarnings: 112000, totalBookings: 298, avgRating: 4.6 },
          { id: 'p3', businessName: 'CleanMasters', ownerName: 'Amit Patel', email: 'amit@cleanmasters.com', totalEarnings: 98000, totalBookings: 267, avgRating: 4.5 },
          { id: 'p4', businessName: 'CoolAir Services', ownerName: 'Neha Singh', email: 'neha@coolair.com', totalEarnings: 76000, totalBookings: 189, avgRating: 4.3 },
          { id: 'p5', businessName: 'Elite Painters', ownerName: 'Vikram Mehta', email: 'vikram@elitepainters.com', totalEarnings: 62000, totalBookings: 145, avgRating: 4.4 },
        ];
        setProviders(mockProviders);
        setTotalPages(1);
        setTotalItems(mockProviders.length);
        setStats({
          totalEarnings: mockProviders.reduce((s,p) => s + p.totalEarnings, 0),
          totalBookings: mockProviders.reduce((s,p) => s + p.totalBookings, 0),
          avgRating: mockProviders.reduce((s,p) => s + p.avgRating, 0) / mockProviders.length
        });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, [page, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadProviders();
  };

  useEffect(() => {
    if (searchTerm !== undefined) {
      setPage(1);
      loadProviders();
    }
  }, [searchTerm]);

  const paginatedProviders = providers; // API already paginates
  const pageSize = 15;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[1100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-slideInRight
          ${toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><DollarSign className="text-green-600" /> Earnings & Ratings</h1>
        <p className="text-gray-500 text-sm">Monitor provider earnings, ratings, and review feedback</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center gap-4"><div className="p-3 bg-green-100 rounded-lg"><DollarSign className="w-6 h-6 text-green-600" /></div><div><p className="text-sm text-gray-500">Total Disbursed Earnings</p><p className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center gap-4"><div className="p-3 bg-blue-100 rounded-lg"><Briefcase className="w-6 h-6 text-blue-600" /></div><div><p className="text-sm text-gray-500">Total Bookings Completed</p><p className="text-2xl font-bold">{formatNumber(stats.totalBookings)}</p></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center gap-4"><div className="p-3 bg-yellow-100 rounded-lg"><Star className="w-6 h-6 text-yellow-600" /></div><div><p className="text-sm text-gray-500">Average Provider Rating</p><p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p><StarRating rating={stats.avgRating} size="sm" /></div></div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by provider, owner name, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-gray-500" />
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="earnings">Sort by: Highest Earnings</option>
            <option value="rating">Sort by: Highest Rating</option>
            <option value="bookings">Sort by: Most Bookings</option>
          </select>
          <button onClick={() => loadProviders()} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"><RefreshCw size={16} /></button>
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Provider</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Owner</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Earnings</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Bookings</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Rating</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th></tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /><p className="text-gray-500 mt-2">Loading providers...</p></td></tr>
              ) : paginatedProviders.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-gray-400">No providers found.</td></tr>
              ) : (
                paginatedProviders.map(provider => (
                  <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><UserAvatar user={provider} size="md" /><div><p className="font-semibold text-gray-900">{provider.businessName || provider.name}</p><p className="text-xs text-gray-500">ID: {provider.id}</p></div></div></td>
                    <td className="px-6 py-4"><p className="text-sm text-gray-800">{provider.ownerName}</p><p className="text-xs text-gray-500">{provider.email}</p></td>
                    <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(provider.totalEarnings)}</td>
                    <td className="px-6 py-4">{formatNumber(provider.totalBookings)}</td>
                    <td className="px-6 py-4"><StarRating rating={provider.avgRating} size="sm" /></td>
                    <td className="px-6 py-4"><button onClick={() => setSelectedProvider(provider)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100"><Eye size={14} /> View Details</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-3 border-t">
            <p className="text-sm text-gray-500">Showing {((page-1)*pageSize)+1} to {Math.min(page*pageSize, totalItems)} of {totalItems}</p>
            <div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage(p=>p-1)} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronLeft size={16} /></button><span className="px-3 py-1 text-sm">Page {page} of {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(p=>p+1)} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronRight size={16} /></button></div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedProvider && <ProviderDetailModal provider={selectedProvider} onClose={() => setSelectedProvider(null)} />}
    </div>
  );
};

export default AdminEarningRating;