
import { useState, useEffect } from 'react';
import { fetchAdminBookings } from '../../services/api';

// Modern Lucide Icons (install: npm install lucide-react)
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Package,
  User,
  Store,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Eye,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Ban,
  Sparkles,
  X,
  MoreHorizontal,
  Receipt
} from 'lucide-react';

// ─── Shimmer Skeleton ───────────────────────────────────────────────
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-50">
        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded-lg w-32"></div>
          <div className="h-3 bg-slate-200 rounded-lg w-48"></div>
        </div>
        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
        <div className="h-6 bg-slate-200 rounded-full w-16"></div>
        <div className="h-8 bg-slate-200 rounded-lg w-8"></div>
      </div>
    ))}
  </div>
);

const StatCard = ({ icon: Icon, label, value, color, trend, trendValue }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

// ─── Status Badge Component ────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const configs = {
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Pending' },
    confirmed: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2, label: 'Confirmed' },
    in_progress: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Loader2, label: 'In Progress' },
    completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Completed' },
    cancelled: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' },
  };
  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color}`}>
      <Icon className={`w-3.5 h-3.5 ${status === 'in_progress' ? 'animate-spin' : ''}`} />
      {config.label}
    </span>
  );
};

// ─── Status Pipeline Component ─────────────────────────────────────
const StatusPipeline = ({ currentStatus, onStatusChange }) => {
  const statuses = [
    { key: '', label: 'All', count: null },
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'in_progress', label: 'In Progress', icon: Loader2 },
    { key: 'completed', label: 'Completed', icon: CheckCircle2 },
    { key: 'cancelled', label: 'Cancelled', icon: Ban },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onStatusChange(key)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
            ${currentStatus === key
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
        >
          {Icon && <Icon className={`w-4 h-4 ${key === 'in_progress' && currentStatus === key ? 'animate-spin' : ''}`} />}
          {label}
        </button>
      ))}
    </div>
  );
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminBookings(page, 15, statusFilter);
      if (res.success) {
        setBookings(res.data.bookings);
        setTotalPages(Math.ceil(res.data.pagination.total / res.data.pagination.limit));
        setTotalBookings(res.data.pagination.total);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [page, statusFilter]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter & Sort locally
  const filteredBookings = bookings
    .filter(b => {
      const q = searchQuery.toLowerCase();
      return (b.bookingId?.toLowerCase().includes(q) ||
              b.customer?.fullName?.toLowerCase().includes(q) ||
              b.provider?.businessName?.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (!aVal || !bVal) return 0;
      if (sortConfig.direction === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

  // Calculate stats
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.pricing?.total || 0), 0);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  // ─── Loading State ────────────────────────────────────────────────
  if (loading && bookings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded-lg w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>)}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="h-14 bg-slate-100 border-b border-slate-200"></div>
          <TableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ═══ TOAST ═══ */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[1100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-slideInRight
          ${toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track all service bookings</p>
        </div>
      </div>

      {/* ═══ STATS CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Receipt}
          label="Total Bookings"
          value={totalBookings}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          color="bg-emerald-50 text-emerald-600"
          trend="up"
          trendValue="+12% this month"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={pendingCount}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={completedCount}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* ═══ STATUS PIPELINE ═══ */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <StatusPipeline currentStatus={statusFilter} onStatusChange={handleStatusFilter} />
      </div>

      {/* ═══ TOOLBAR ═══ */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by booking ID, customer, provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />
        </div>
        <div className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filteredBookings.length}</span> bookings
        </div>
      </div>

      {/* ═══ BOOKINGS TABLE ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                  onClick={() => handleSort('pricing.total')}
                >
                  <div className="flex items-center gap-1">
                    Total
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.map(booking => (
                <tr key={booking._id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center border border-blue-200">
                        <Receipt className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">#{booking.bookingId}</p>
                        <p className="text-xs text-slate-400">{booking._id?.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                        {booking.customer?.fullName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{booking.customer?.fullName || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{booking.customer?.phone || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{booking.provider?.businessName || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">{booking.pricing?.total?.toLocaleString() || '0'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setSelectedBooking(booking); setShowModal(true); }}
                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No bookings found</p>
                    <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-700">{page}</span> of <span className="font-semibold text-slate-700">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors
                        ${page === pageNum ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ BOOKING DETAIL MODAL ═══ */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto animate-scaleIn">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-8 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Booking #{selectedBooking.bookingId}</h2>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <StatusBadge status={selectedBooking.status} />
                  <span className="text-slate-400 text-sm">
                    {new Date(selectedBooking.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-8 space-y-6">
              {/* Customer & Provider */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">
                    <User className="w-3.5 h-3.5" />
                    Customer
                  </div>
                  <p className="font-semibold text-slate-800">{selectedBooking.customer?.fullName || 'N/A'}</p>
                  <p className="text-sm text-slate-500 mt-1">{selectedBooking.customer?.email || ''}</p>
                  <p className="text-sm text-slate-500">{selectedBooking.customer?.phone || ''}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">
                    <Store className="w-3.5 h-3.5" />
                    Provider
                  </div>
                  <p className="font-semibold text-slate-800">{selectedBooking.provider?.businessName || 'N/A'}</p>
                  <p className="text-sm text-slate-500 mt-1">{selectedBooking.provider?.email || ''}</p>
                  <p className="text-sm text-slate-500">{selectedBooking.provider?.phone || ''}</p>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">
                  <IndianRupee className="w-3.5 h-3.5" />
                  Pricing Details
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Base Price</span>
                    <span className="font-medium text-slate-800">₹{selectedBooking.pricing?.basePrice?.toLocaleString() || '0'}</span>
                  </div>
                  {selectedBooking.pricing?.additionalCharges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Additional Charges</span>
                      <span className="font-medium text-slate-800">₹{selectedBooking.pricing?.additionalCharges?.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedBooking.pricing?.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Discount</span>
                      <span className="font-medium text-emerald-600">-₹{selectedBooking.pricing?.discount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex justify-between">
                    <span className="font-semibold text-slate-800">Total Amount</span>
                    <span className="font-bold text-lg text-slate-900">₹{selectedBooking.pricing?.total?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              {selectedBooking.service && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">
                    <Package className="w-3.5 h-3.5" />
                    Service Details
                  </div>
                  <p className="font-semibold text-slate-800">{selectedBooking.service?.name}</p>
                  <p className="text-sm text-slate-500 mt-1">{selectedBooking.service?.description?.substring(0, 100)}...</p>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
