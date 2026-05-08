import { createContext, useContext, useState, useEffect, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/v1";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  // Function to fetch current user from /auth/me
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.user) {
          setUser(data.data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Fetch user error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh token function
  const refreshAccessToken = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        // Token refreshed successfully
        return true;
      } else {
        // Refresh token expired or invalid
        return false;
      }
    } catch (error) {
      console.error("Refresh token error:", error);
      return false;
    }
  };

  // Registration (direct, no OTP)
  const register = async (userData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }
    // After successful registration, user is automatically logged in
    setUser(data.data.user);
    setShowAuth(false);
    return data;
  };

  // Login (direct email/password)
  const login = async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }
    setUser(data.data.user);
    setShowAuth(false);
    return data;
  };

  // Logout
  const logout = async () => {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  // On mount, fetch user
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Intercept fetch requests to handle 401 (token expired) and attempt refresh
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let response = await originalFetch(...args);
      if (response.status === 401) {
        // Try to refresh token once
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry the original request
          response = await originalFetch(...args);
        } else {
          // Refresh failed, logout user
          setUser(null);
          // Optionally redirect to login modal
          setShowAuth(true);
        }
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const value = {
    user,
    loading,
    showAuth,
    setShowAuth,
    register,
    login,
    logout,
    BASE_URL,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);