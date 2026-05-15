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

// Main App Content Component
const AppContent = () => {
  const location = useLocation();
  const { showAuth } = useAuth();
  
  // Check if current route is admin or provider panel
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isProviderRoute = location.pathname.startsWith('/provider');
  
  // Hide navbar and footer on admin and provider routes
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

        {/* Provider Panel Routes - No Navbar/Footer */}
        <Route path="/provider" element={<PrivateRoute><ProviderLayout /></PrivateRoute>}>
          <Route index element={<ProviderDashboard />} />
          <Route path="bookings" element={<ProviderBookings />} />
          <Route path="kyc" element={<ProviderKYCVerification/>} />
          <Route path="services" element={<ProviderServices />} />
          <Route path="profile" element={<ProviderProfile />} />
          <Route path="wallet" element={<ProviderWallet />} />
        </Route>

        {/* Admin Routes - No Navbar/Footer */}
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="kyc-verification-providers" element={<AdminKycVerification/>} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
        </Route>
      </Routes>
      
      {!hideNavFooter && <Footer />}
    </>
  );
};

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}