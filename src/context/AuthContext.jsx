// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/v1";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  // Refresh token queue management
  let refreshPromise = null;
  let pendingRequests = [];

  const processPendingRequests = () => {
    pendingRequests.forEach(cb => cb());
    pendingRequests = [];
  };

  const refreshAccessToken = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        // Token refreshed successfully – cookies are updated by backend
        return true;
      } else {
        // Refresh token invalid/expired – force logout
        setUser(null);
        setShowAuth(true);
        return false;
      }
    } catch (error) {
      console.error("Refresh token error:", error);
      setUser(null);
      setShowAuth(true);
      return false;
    }
  };

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.data?.user || null);
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

  // Interceptor for automatic token refresh
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      let response = await originalFetch(...args);

      // If 401 and not already refreshing, try to refresh token and retry
      if (response.status === 401 && !refreshPromise) {
        refreshPromise = refreshAccessToken().then(success => {
          refreshPromise = null;
          processPendingRequests();
          return success;
        });

        const refreshed = await refreshPromise;
        if (refreshed) {
          // Retry the original request (cookies are already updated)
          response = await originalFetch(...args);
        }
        return response;
      }

      // If a refresh is already in progress, wait for it
      if (response.status === 401 && refreshPromise) {
        await new Promise(resolve => {
          pendingRequests.push(resolve);
        });
        // Retry with new token
        response = await originalFetch(...args);
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const register = async (userData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      // Throw structured error from backend
      throw new Error(data.message || "Registration failed");
    }
    setUser(data.data.user);
    setShowAuth(false);
    return data;
  };

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

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value = {
    user,
    setUser,
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