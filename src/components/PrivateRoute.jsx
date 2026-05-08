// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading, setShowAuth } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    // Show login modal instead of redirecting
    setShowAuth(true);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;