// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import LoadingScreen from "../components/LoadingScreen";

const getBaseUrl = () => {
  if (import.meta.env.PROD) {
    let customUrl = import.meta.env.VITE_API_URL;
    if (!customUrl) customUrl = 'https://ghar-seva-server-1.onrender.com';
    customUrl = customUrl.replace(/\/$/, '');
    if (customUrl.endsWith('/api/v1')) return customUrl;
    return `${customUrl}/api/v1`;
  }
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:5000/api/v1`;
  }
  return 'http://localhost:5000/api/v1';
};

const BASE_URL = getBaseUrl();
console.log('🔧 AuthContext BASE_URL:', BASE_URL);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

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
      if (res.ok) return true;
      setUser(null);
      setShowAuth(true);
      return false;
    } catch (error) {
      console.error("Refresh token error:", error);
      setUser(null);
      setShowAuth(true);
      return false;
    }
  };

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, { credentials: "include" });
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

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let response = await originalFetch(...args);
      const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
      if (url.includes('/auth/refresh-token')) return response;

      if (response.status === 401 && !refreshPromise) {
        refreshPromise = refreshAccessToken().then(success => {
          refreshPromise = null;
          processPendingRequests();
          return success;
        });
        const refreshed = await refreshPromise;
        if (refreshed) response = await originalFetch(...args);
        return response;
      }

      if (response.status === 401 && refreshPromise) {
        await new Promise(resolve => pendingRequests.push(resolve));
        response = await originalFetch(...args);
      }
      return response;
    };
    return () => { window.fetch = originalFetch; };
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
      await fetch(`${BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value = { user, setUser, loading, showAuth, setShowAuth, register, login, logout, BASE_URL };
  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);