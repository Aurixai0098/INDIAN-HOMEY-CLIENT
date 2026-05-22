// src/App.jsx
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Profile from "./pages/Profile";
import CategoryPage from "./pages/CategoryPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import RegisterProvider from "./components/auth/RegisterProvider";
import Navbar from "./components/Navbar";
import Login from "./components/auth/Login";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Footer from "./components/Footer";

// Provider Panel imports
import ProviderLayout from "./pages/provider/ProviderLayout";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderBookings from "./pages/provider/ProviderBookings";
import ProviderServices from "./pages/provider/ProviderServices";
import ProviderProfile from "./pages/provider/ProviderProfile";
import ProviderWallet from "./pages/provider/ProviderWallet";

// Admin imports
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminServices from "./pages/admin/AdminServices";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminKycVerification from "./pages/admin/AdminKycVerification";
import ProviderKYCVerification from "./pages/provider/ProviderKYCVerification";
import AdminEarningRating from "./pages/admin/AdminEarningRating";
import AdminProviderStatus from "./pages/admin/AdminProviderStatus";
import AdminCommission from "./pages/admin/AdminCommission";

// Additional admin pages (for sidebar links)
import AdminUserWallet from "./pages/admin/AdminUserWallet";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminEmailCampaigns from "./pages/admin/AdminEmailCampaigns";
import AdminBannerManagement from "./pages/admin/AdminBannerManagement";
import AdminRolesPermissions from "./pages/admin/AdminRolesPermissions";
import AdminBankAccounts from "./pages/admin/AdminBankAccounts";
import AdminAppSettings from "./pages/admin/AdminAppSettings";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminCancelledBookings from "./pages/admin/AdminCancelledBookings";
import AdminRescheduleRequests from "./pages/admin/AdminRescheduleRequests";
import AdminCouponsOffers from "./pages/admin/AdminCouponsOffers";
import ProviderBookingDetail from "./pages/provider/ProviderBookingDetail";

// ✅ Import BookingRequestProvider for global popup & sound
import { BookingRequestProvider } from "./context/BookingRequestContext";

// Main App Content Component
const AppContent = () => {
  const location = useLocation();
  const { showAuth } = useAuth();
  
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isProviderRoute = location.pathname.startsWith('/provider');
  const hideNavFooter = isAdminRoute || isProviderRoute;
  
  return (
    <>
      {showAuth && <Login />}
      {!hideNavFooter && <Navbar />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/service/:slug" element={<ServiceDetailPage />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
        <Route path="/my-bookings" element={<PrivateRoute><MyBookingsPage /></PrivateRoute>} />
        <Route path="/register-provider" element={<PrivateRoute><RegisterProvider /></PrivateRoute>} />

        {/* Provider Panel Routes */}
        <Route path="/provider" element={<PrivateRoute><ProviderLayout /></PrivateRoute>}>
          <Route index element={<ProviderDashboard />} />
          <Route path="bookings" element={<ProviderBookings />} />
          <Route path="bookings/:id" element={<ProviderBookingDetail/>} /> 
          <Route path="kyc" element={<ProviderKYCVerification/>} />
          <Route path="services" element={<ProviderServices />} />
          <Route path="profile" element={<ProviderProfile />} />
          <Route path="wallet" element={<ProviderWallet />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          {/* Core existing routes */}
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="provider-earnings" element={<AdminEarningRating />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="provider-status" element={<AdminProviderStatus />} />
          <Route path="kyc-verification-providers" element={<AdminKycVerification/>} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="commission-system" element={<AdminCommission />} />

          {/* User Management sub-pages */}
          <Route path="user-wallet" element={<AdminUserWallet />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="user-details" element={<AdminUsers />} />
          <Route path="user-bookings" element={<AdminBookings />} />

          {/* Booking Management sub-pages */}
          <Route path="new-bookings" element={<AdminBookings />} />
          <Route path="assigned-bookings" element={<AdminBookings />} />
          <Route path="ongoing-bookings" element={<AdminBookings />} />
          <Route path="completed-bookings" element={<AdminBookings />} />
          <Route path="cancelled-bookings" element={<AdminCancelledBookings />} />
          <Route path="reschedule-requests" element={<AdminRescheduleRequests />} />

          {/* Payments & Earnings sub-pages */}
          <Route path="total-revenue" element={<AdminRevenue />} />
          <Route path="wallet-system" element={<AdminUserWallet />} />
          <Route path="coupons-offers" element={<AdminCouponsOffers />} />
          <Route path="provider-payouts" element={<div className="p-8 text-center">Provider Payouts Coming Soon</div>} />
          <Route path="pending-settlements" element={<div className="p-8 text-center">Pending Settlements Coming Soon</div>} />

          {/* Live Tracking */}
          <Route path="live-tracking" element={<div className="p-8 text-center">Live Tracking Coming Soon</div>} />

          {/* Service Management sub-pages (reuse main services page) */}
          <Route path="services/plumbing" element={<AdminServices />} />
          <Route path="services/ac-repair" element={<AdminServices />} />
          <Route path="services/electrician" element={<AdminServices />} />
          <Route path="services/laundry" element={<AdminServices />} />
          <Route path="services/cleaning" element={<AdminServices />} />
          <Route path="services/painting" element={<AdminServices />} />
          <Route path="services/carpenter" element={<AdminServices />} />
          <Route path="services/ro-service" element={<AdminServices />} />
          <Route path="services/pest-control" element={<AdminServices />} />

          {/* Review & Rating */}
          <Route path="reviews" element={<div className="p-8 text-center">Reviews Management Coming Soon</div>} />

          {/* Marketing Panel sub-pages */}
          <Route path="push-notifications" element={<div className="p-8 text-center">Push Notifications Coming Soon</div>} />
          <Route path="sms-alerts" element={<div className="p-8 text-center">SMS Alerts Coming Soon</div>} />
          <Route path="email-campaigns" element={<AdminEmailCampaigns />} />
          <Route path="banner-management" element={<AdminBannerManagement />} />

          {/* Individual menu items */}
          <Route path="qr-code" element={<div className="p-8 text-center">QR Code Generation Coming Soon</div>} />
          <Route path="provider-wallet" element={<AdminWithdrawals />} />
          <Route path="super-wallet" element={<div className="p-8 text-center">Super Admin Wallet Coming Soon</div>} />
          <Route path="invoices" element={<div className="p-8 text-center">Invoice & Billing Coming Soon</div>} />
          <Route path="commission-management" element={<AdminCommission />} />
          <Route path="escrow" element={<div className="p-8 text-center">Escrow Payment System Coming Soon</div>} />
          <Route path="fraud-security" element={<div className="p-8 text-center">Fraud & Security Coming Soon</div>} />
          <Route path="support" element={<div className="p-8 text-center">Customer Support Coming Soon</div>} />
          <Route path="live-operations" element={<div className="p-8 text-center">Live Operations Coming Soon</div>} />
          <Route path="automation" element={<div className="p-8 text-center">Automation & Reminders Coming Soon</div>} />
          <Route path="ai-systems" element={<div className="p-8 text-center">AI Smart Systems Coming Soon</div>} />
          <Route path="multi-city" element={<div className="p-8 text-center">Multi City System Coming Soon</div>} />

          {/* Settings sub-pages */}
          <Route path="app-settings" element={<AdminAppSettings />} />
          <Route path="taxes-gst" element={<div className="p-8 text-center">Taxes / GST Coming Soon</div>} />
          <Route path="commission-percent" element={<AdminCommission />} />
          <Route path="payment-gateway" element={<div className="p-8 text-center">Payment Gateway Settings Coming Soon</div>} />
          <Route path="roles-permissions" element={<AdminRolesPermissions />} />

          {/* Company Bank Accounts sub-pages */}
          <Route path="bank-accounts" element={<AdminBankAccounts />} />
          <Route path="primary-account" element={<AdminBankAccounts />} />
          <Route path="upi-management" element={<AdminBankAccounts />} />
        </Route>
      </Routes>
      
      {!hideNavFooter && <Footer />}
    </>
  );
};

export default function App() {
  return (
    <CartProvider>
      {/* ✅ BookingRequestProvider added – must be inside SocketProvider and AuthProvider (defined in main.jsx) */}
      <BookingRequestProvider>
        <AppContent />
      </BookingRequestProvider>
    </CartProvider>
  );
}