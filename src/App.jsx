import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import Login from "./components/auth/Login";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./context/AuthContext";
import Footer from "./components/Footer";

// Temporary placeholder for MyBookings (you can create this page later)
const MyBookings = () => <div className="p-8 text-center text-gray-600">My Bookings page coming soon...</div>;

export default function App() {
  const { showAuth } = useAuth();

  return (
    <>
      {showAuth && <Login />}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        {/* Protected routes */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <PrivateRoute>
              <MyBookings />
            </PrivateRoute>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}