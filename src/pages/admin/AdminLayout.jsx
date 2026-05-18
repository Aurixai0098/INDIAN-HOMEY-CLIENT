import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

// Modern Lucide Icons
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FolderTree,
  Briefcase,
  CalendarDays,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Star,
  DollarSign,
  MapPin,
  Wrench,
  Megaphone,
  Settings,
  Building2,
  QrCode,
  Receipt,
  Percent,
  Headphones,
  Activity,
  Cpu,
  Globe,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Home
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Section toggle state for collapsible menus
  const [openSections, setOpenSections] = useState({
    provider: true,
    booking: true,
    payment: true,
    service: true,
    marketing: true,
    settings: true,
    bank: true,
  });

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center p-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <ShieldCheck className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400">Admin privileges required to access this area.</p>
        </div>
      </div>
    );
  }

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Reusable nav link component for non-collapsible items
  const NavItem = ({ to, icon: Icon, label, end = false }) => {
    const active = end ? location.pathname === to : location.pathname.startsWith(to);
    return (
      <NavLink
        to={to}
        end={end}
        onClick={() => setMobileMenuOpen(false)}
        className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all hover:text-black duration-200 relative overflow-hidden
          ${active
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
            : 'text-slate-400 hover:text-black hover:bg-white/5'
          }
          ${!sidebarOpen && 'justify-center'}
        `}
      >
        {active && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent" />
        )}
        <Icon className={`w-5 h-5 relative z-10 ${active ? 'text-white' : 'group-hover:text-black'}`} />
        {sidebarOpen && (
          <span className="font-medium text-sm relative z-10">{label}</span>
        )}
        {active && sidebarOpen && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-lg shadow-white/50 relative z-10" />
        )}
      </NavLink>
    );
  };

  // Collapsible section component
  const CollapsibleSection = ({ section, icon: Icon, title, children }) => {
    const isOpen = openSections[section];
    return (
      <div className="mt-2">
        <button
          onClick={() => toggleSection(section)}
          className={`group flex items-center justify-between w-full px-3 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:text-black hover:bg-white/5
            ${!sidebarOpen && 'justify-center'}
          `}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium text-sm">{title}</span>}
          </div>
          {sidebarOpen && (
            <div className="text-slate-500">
              {isOpen ? <ChevronDown size={16} /> : <ChevronRightIcon size={16} />}
            </div>
          )}
        </button>
        {sidebarOpen && isOpen && (
          <div className="ml-6 mt-1 space-y-1">
            {children}
          </div>
        )}
      </div>
    );
  };

  const SubNavItem = ({ to, label }) => (
    <NavLink
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className={({ isActive }) =>
        `block px-3 py-2 text-sm rounded-lg transition-colors ${isActive
          ? 'bg-blue-600/20 text-blue-400 font-medium'
          : 'text-slate-400 hover:text-black hover:bg-white/5'
        }`
      }
    >
      {label}
    </NavLink>
  );

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Handle go to website
  const goToWebsite = () => {
    navigate('/');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* Main Layout Container - Fixed height, no scroll */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-white backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Fixed, no scroll on entire sidebar, but nav area scrolls */}
        <aside
          className={`fixed lg:relative inset-y-0 left-0 z-50 text-white transition-all duration-300 ease-in-out flex flex-col
            ${sidebarOpen ? 'w-72' : 'w-20'} 
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            shadow-2xl h-full`}
        >
          {/* Logo Area - Fixed - with Company Logo Images */}
          <div className={`h-20 flex-shrink-0 flex items-center px-4 border-b border-white/10 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            <div className="flex items-center gap-3">
              {/* Company Logo Image */}
              <img
                src="https://res.cloudinary.com/djtvxmttf/image/upload/v1778781548/a7ea1860-5474-4e8d-800b-72c68b9f6b71-removebg-preview_cpmi08.png"
                alt="Company Logo"
                className="w-10 h-10 rounded-xl object-cover"
              />
              {sidebarOpen && (
                <div className="flex">
                  {/* Company Name Image */}
                  <img
                    src="https://res.cloudinary.com/djtvxmttf/image/upload/v1778657661/ChatGPT_Image_May_13__2026__12_33_54_AM-removebg-preview_w7uxh5.png"
                    alt="GharSeva"
                    className="h-20 w-auto object-contain"
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation - This area will scroll if needed - Hidden Scrollbar */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto min-h-0 custom-scrollbar">
            {/* Dashboard */}
            <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" end />

            {/* Provider Management Section */}
            <CollapsibleSection section="provider" icon={Users} title="Provider Management">
              <SubNavItem to="/admin/providers" label="All Providers" />
              <SubNavItem to="/admin/kyc-verification-providers" label="KYC Verification" />
              <SubNavItem to="/admin/provider-earnings" label="Earnings & Ratings" />
              <SubNavItem to="/admin/provider-status" label="Online/Offline Status" />
            </CollapsibleSection>


            <div className="mt-2">
              <button onClick={() => toggleSection('user')} className="flex items-center justify-between w-full px-3 py-2 text-left text-gray-600 font-medium hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2"><Users size={18} /> User Management</div>
                {openSections.user ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {openSections.user && (
                <div className="ml-6 mt-1 space-y-1">
                  <NavLink to="/admin/users" className={({ isActive }) => `block px-3 py-1.5 text-sm rounded ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>All Users</NavLink>
                  <NavLink to="/admin/user-wallet" className={({ isActive }) => `block px-3 py-1.5 text-sm rounded ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>User Wallet</NavLink>
                  <NavLink to="/admin/user-details" className={({ isActive }) => `block px-3 py-1.5 text-sm rounded ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>User Details</NavLink>
                  <NavLink to="/admin/user-bookings" className={({ isActive }) => `block px-3 py-1.5 text-sm rounded ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>User Bookings</NavLink>
                  {/* 👇 ADD THIS NEW LINK */}
                  <NavLink to="/admin/complaints" className={({ isActive }) => `block px-3 py-1.5 text-sm rounded ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Complaints</NavLink>
                </div>
              )}
            </div>

            {/* Booking Management Section */}
            <CollapsibleSection section="booking" icon={Briefcase} title="Booking Management">
              <SubNavItem to="/admin/bookings" label="All Bookings" />
              <SubNavItem to="/admin/new-bookings" label="New" />
              <SubNavItem to="/admin/assigned-bookings" label="Assigned" />
              <SubNavItem to="/admin/ongoing-bookings" label="Ongoing" />
              <SubNavItem to="/admin/completed-bookings" label="Completed" />
              <SubNavItem to="/admin/cancelled-bookings" label="Cancelled" />
              <SubNavItem to="/admin/reschedule-requests" label="Reschedule Requests" />
            </CollapsibleSection>

            {/* Payments & Earnings Section */}
            <CollapsibleSection section="payment" icon={DollarSign} title="Payments & Earnings">
              <SubNavItem to="/admin/total-revenue" label="Total Revenue" />
              <SubNavItem to="/admin/commission-system" label="Commission System" />
              <SubNavItem to="/admin/provider-payouts" label="Provider Payouts" />
              <SubNavItem to="/admin/pending-settlements" label="Pending Settlements" />
              <SubNavItem to="/admin/wallet-system" label="Wallet System" />
              <SubNavItem to="/admin/coupons-offers" label="Coupons / Offers" />
            </CollapsibleSection>

            {/* Live Tracking */}
            <NavItem to="/admin/live-tracking" icon={MapPin} label="Live Tracking" />

            {/* Service Management Section */}
            <CollapsibleSection section="service" icon={Wrench} title="Service Management">
              <SubNavItem to="/admin/categories" label="Categories" />
              <SubNavItem to="/admin/services" label="All Services" />
              <SubNavItem to="/admin/services/plumbing" label="Plumbing" />
              <SubNavItem to="/admin/services/ac-repair" label="AC Repair" />
              <SubNavItem to="/admin/services/electrician" label="Electrician" />
              <SubNavItem to="/admin/services/laundry" label="Laundry" />
              <SubNavItem to="/admin/services/cleaning" label="Cleaning" />
              <SubNavItem to="/admin/services/painting" label="Painting" />
              <SubNavItem to="/admin/services/carpenter" label="Carpenter" />
              <SubNavItem to="/admin/services/ro-service" label="RO Service" />
              <SubNavItem to="/admin/services/pest-control" label="Pest Control" />
            </CollapsibleSection>

            {/* Review & Rating */}
            <NavItem to="/admin/reviews" icon={Star} label="Review & Rating" />

            {/* Marketing Panel Section */}
            <CollapsibleSection section="marketing" icon={Megaphone} title="Marketing Panel">
              <SubNavItem to="/admin/push-notifications" label="Push Notifications" />
              <SubNavItem to="/admin/sms-alerts" label="SMS Alerts" />
              <SubNavItem to="/admin/email-campaigns" label="Email Campaigns" />
              <SubNavItem to="/admin/banner-management" label="Banner Management" />
            </CollapsibleSection>

            {/* Individual Menu Items - EXACTLY matching App.jsx routes */}
            <NavItem to="/admin/qr-code" icon={QrCode} label="QR Code Generation" />
            <NavItem to="/admin/user-wallet" icon={Wallet} label="User Wallet System" />
            <NavItem to="/admin/provider-wallet" icon={Wallet} label="Provider Wallet System" />
            <NavItem to="/admin/withdrawals" icon={DollarSign} label="Provider Withdrawal System" />
            <NavItem to="/admin/super-wallet" icon={ShieldCheck} label="Super Admin Wallet" />
            <NavItem to="/admin/invoices" icon={Receipt} label="Invoice & Billing" />
            <NavItem to="/admin/commission-management" icon={Percent} label="Commission Management" />
            <NavItem to="/admin/escrow" icon={ShieldCheck} label="Escrow Payment System" />
            <NavItem to="/admin/fraud-security" icon={ShieldCheck} label="Fraud & Security" />
            <NavItem to="/admin/support" icon={Headphones} label="Customer Support" />
            <NavItem to="/admin/live-operations" icon={Activity} label="Live Operations" />
            <NavItem to="/admin/automation" icon={Bell} label="Automation & Reminders" />
            <NavItem to="/admin/ai-systems" icon={Cpu} label="AI Smart Systems" />
            <NavItem to="/admin/multi-city" icon={Globe} label="Multi City System" />

            {/* Settings Section */}
            <CollapsibleSection section="settings" icon={Settings} title="Settings">
              <SubNavItem to="/admin/app-settings" label="App Settings" />
              <SubNavItem to="/admin/taxes-gst" label="Taxes / GST" />
              <SubNavItem to="/admin/commission-percent" label="Commission %" />
              <SubNavItem to="/admin/payment-gateway" label="Payment Gateway" />
              <SubNavItem to="/admin/roles-permissions" label="Roles & Permissions" />
            </CollapsibleSection>

            {/* Company Bank Accounts Section */}
            <CollapsibleSection section="bank" icon={Building2} title="Company Bank Accounts">
              <SubNavItem to="/admin/bank-accounts" label="Manage Accounts" />
              <SubNavItem to="/admin/primary-account" label="Set Primary" />
              <SubNavItem to="/admin/upi-management" label="UPI ID Management" />
            </CollapsibleSection>
          </nav>
        </aside>

        {/* Right Side - Header + Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Top Header - Fixed with Avatar Dropdown */}
          <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2 w-80">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>
              <div className="w-px h-8 bg-slate-200 mx-1" />

              {/* Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 focus:outline-none"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-800">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-slate-500 uppercase">Operation Center</p>
                  </div>
                  {user?.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt="Admin Avatar"
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-md cursor-pointer"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer">
                      {user?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        {user?.avatar?.url ? (
                          <img
                            src={user.avatar.url}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {user?.name?.[0]?.toUpperCase() || 'A'}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800">{user?.name || 'Admin'}</p>
                          <p className="text-xs text-slate-500">{user?.email || 'admin@system.com'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        goToWebsite();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Home className="w-4 h-4" />
                      Go to Website
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content - ONLY this area scrolls with hidden scrollbar */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 min-h-0 custom-scrollbar">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global Styles for Custom Scrollbar – FIXED: removed 'jsx' attribute */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.3);
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.5);
        }
        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.3) transparent;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;