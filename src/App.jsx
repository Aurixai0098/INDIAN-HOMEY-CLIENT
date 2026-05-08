import { Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import Login from "./components/auth/Login";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./context/AuthContext";

// Example protected pages (create these later)
const Profile = () => <div>Profile Page</div>;
const MyBookings = () => <div>My Bookings</div>;

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
        {/* Add more protected routes as needed */}
      </Routes>
    </>
  );
}