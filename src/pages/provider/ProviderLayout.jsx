// src/pages/provider/ProviderLayout.jsx
import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Wrench,
  IdCard,
  Wallet,
  User,
  Settings,
  LogOut,
  Bell,
  Mail,
  Search,
  Menu,
  X,
  ChevronDown,
  Home,
  Briefcase,
  Star,
} from 'lucide-react';

const ProviderLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { to: '/provider', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/provider/bookings', label: 'Bookings', icon: Calendar },
    { to: '/provider/services', label: 'Services', icon: Wrench },
    { to: '/provider/kyc', label: 'KYC Verification', icon: IdCard },
    { to: '/provider/wallet', label: 'Wallet', icon: Wallet },
    { to: '/provider/profile', label: 'Profile', icon: User },
  ];

  // Helper to get readable page title from path
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
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
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

        {/* Profile Section */}
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
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Pro</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    ({ isActive }) =>
                      isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'
                  }`}
                />
                <span className="font-medium text-sm">{item.label}</span>
                {item.label === 'Bookings' && (
                  <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                    5
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Settings
            </p>
            <NavLink
              to="/provider/settings"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
            >
              <Settings className="w-5 h-5 text-gray-400 group-hover:text-emerald-500" />
              <span className="font-medium text-sm">Settings</span>
            </NavLink>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
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

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-lg border-b border-gray-200/50 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Hamburger button (mobile) */}
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
              {/* Search bar (desktop) */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2 gap-2 w-64">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold border-2 border-white">
                  3
                </span>
              </button>

              {/* Messages */}
              <button className="relative p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full text-white text-xs flex items-center justify-center font-bold border-2 border-white">
                  7
                </span>
              </button>

              {/* User dropdown */}
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

          {/* Mobile search bar (collapsible) - optional, shown below top bar on small screens */}
          <div className="md:hidden mt-3">
            <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2 gap-2 w-full">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>

      {/* Additional Tailwind animations (if not already in global CSS) */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProviderLayout;