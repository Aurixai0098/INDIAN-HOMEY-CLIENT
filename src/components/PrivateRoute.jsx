// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const PrivateRoute = ({ children }) => {
  const { user, loading, setShowAuth } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    // ✅ Move state update to useEffect to avoid "cannot update component while rendering" error
    useEffect(() => {
      setShowAuth(true);
    }, [setShowAuth]);

    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;