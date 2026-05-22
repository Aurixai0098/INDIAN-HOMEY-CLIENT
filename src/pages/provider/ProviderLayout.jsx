import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBookingRequests } from '../../context/BookingRequestContext';
import {
  LayoutDashboard,
  Calendar,
  Wrench,
  IdCard,
  Wallet,
  User,
  Settings,
  LogOut,
  Mail,
  Search,
  Menu,
  X,
  ChevronDown,
  Home,
  Briefcase,
  Star,
  Power,
  PowerOff,
  Bell,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { updateProviderProfile, updateHeartbeat } from '../../services/api';
import ProviderNotificationBell from '../../components/ProviderNotificationBell';

const ProviderLayout = () => {
  const { user, setUser, logout } = useAuth();
  const { activePopup, acceptRequest, dismissPopup } = useBookingRequests();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [heartbeatInterval, setHeartbeatInterval] = useState(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.role === 'provider' && isAvailable) {
      const interval = setInterval(async () => {
        try {
          await updateHeartbeat();
        } catch (err) {
          console.error('Heartbeat failed', err);
        }
      }, 30000);
      setHeartbeatInterval(interval);
      return () => clearInterval(interval);
    } else if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      setHeartbeatInterval(null);
    }
  }, [user, isAvailable]);

  const toggleAvailability = async () => {
    const newStatus = !isAvailable;
    try {
      await updateProviderProfile({ isAvailable: newStatus });
      setIsAvailable(newStatus);
      if (setUser) {
        setUser(prev => ({ ...prev, isAvailable: newStatus }));
      }
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  const navItems = [
    { to: '/provider', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/provider/bookings', label: 'Bookings', icon: Calendar },
    { to: '/provider/services', label: 'Services', icon: Wrench },
    { to: '/provider/kyc', label: 'KYC Verification', icon: IdCard },
    { to: '/provider/wallet', label: 'Wallet', icon: Wallet },
    { to: '/provider/profile', label: 'Profile', icon: User },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/provider') return 'Dashboard';
    if (path.includes('/bookings')) return 'Bookings';
    if (path.includes('/services')) return 'Services';
    if (path.includes('/kyc')) return 'KYC Verification';
    if (path.includes('/wallet')) return 'Wallet';
    if (path.includes('/profile')) return 'Profile';
    return 'Provider Panel';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Global Popup for New Booking Request */}
      {activePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={dismissPopup} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <XCircle className="w-5 h-5" />
            </button>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">New Booking Request!</h3>
              <p className="text-gray-500 mt-1">A customer needs your service</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="font-semibold">{activePopup.customerName} wants <span className="text-emerald-600">{activePopup.serviceName}</span></p>
              <p className="text-sm text-gray-600 mt-1">Amount: ₹{activePopup.amount}</p>
              <p className="text-sm text-gray-600">Date: {new Date(activePopup.scheduledDate).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500 mt-2 truncate">{activePopup.address?.street}, {activePopup.address?.city}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => acceptRequest(activePopup.bookingId)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Accept Booking
              </button>
              <button
                onClick={dismissPopup}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold"
              >
                Dismiss
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              This request will expire in 30 seconds
            </p>
          </div>
        </div>
      )}

      {/* Sidebar (same as before, unchanged) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg leading-tight">Provider</h1>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={
                  user?.avatar?.url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.businessName || user?.firstName || 'Provider'
                  )}&background=10b981&color=fff&size=80`
                }
                alt="Profile"
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-md"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">
                {user?.businessName || `${user?.firstName} ${user?.lastName}`}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
              <Star className="w-3 h-3" /> Verified
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setSidebarOpen(false)}>
                {({ isActive }) => (
                  <div
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'
                      }`}
                    />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                )}
              </NavLink>
            ))}
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Settings
            </p>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 px-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <span className="text-xs text-gray-500">System Online</span>
            <span className="ml-auto text-xs text-gray-400">v2.4.0</span>
          </div>
        </div>
      </aside>

      <main className="lg:ml-72 min-h-screen">
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-lg border-b border-gray-200/50 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
                <p className="text-xs text-gray-500 hidden sm:block mt-0.5">
                  {getPageTitle() === 'Dashboard'
                    ? "Welcome back, here's what's happening today"
                    : `Manage your ${getPageTitle().toLowerCase()}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleAvailability}
                className={`p-2 rounded-xl border transition-colors shadow-sm ${
                  isAvailable 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' 
                    : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                }`}
                title={isAvailable ? 'Go Offline' : 'Go Online'}
              >
                {isAvailable ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
              </button>

              <ProviderNotificationBell />

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={
                      user?.avatar?.url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.businessName || user?.firstName || 'Provider'
                      )}&background=10b981&color=fff&size=40`
                    }
                    alt="Avatar"
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">
                        {user?.businessName || `${user?.firstName} ${user?.lastName}`}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <NavLink
                      to="/provider/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" /> Profile
                    </NavLink>
                    <NavLink
                      to="/provider/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </NavLink>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default ProviderLayout;