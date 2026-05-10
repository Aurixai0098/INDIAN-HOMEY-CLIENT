// src/services/api.js

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api/v1';

const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

// ========== User APIs ==========
export const updateUserProfile = async (profileData) => {
  return apiFetch('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

export const updateNotificationPreferences = async (preferences) => {
  return apiFetch('/users/notification-preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  });
};

export const fetchWallet = async () => {
  return apiFetch('/users/wallet');
};

export const fetchNotifications = async (page = 1, limit = 20) => {
  return apiFetch(`/users/notifications?page=${page}&limit=${limit}`);
};

// ========== Admin APIs ==========
export const fetchAdminDashboard = async () => {
  return apiFetch('/admin/dashboard');
};

export const fetchAdminUsers = async (page = 1, limit = 20, role = '', status = '') => {
  let url = `/admin/users?page=${page}&limit=${limit}`;
  if (role) url += `&role=${role}`;
  if (status) url += `&status=${status}`;
  return apiFetch(url);
};

export const fetchAdminUserDetails = async (userId) => {
  return apiFetch(`/admin/users/${userId}`);
};

export const updateAdminUserStatus = async (userId, status) => {
  return apiFetch(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const fetchAdminVerifications = async (page = 1, limit = 20) => {
  return apiFetch(`/admin/verifications?page=${page}&limit=${limit}`);
};

export const verifyProvider = async (providerId, status, note = '') => {
  return apiFetch(`/admin/verifications/${providerId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });
};

export const createCategory = async (categoryData) => {
  return apiFetch('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
};

export const updateCategory = async (categoryId, categoryData) => {
  return apiFetch(`/admin/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
};

export const deleteCategory = async (categoryId) => {
  return apiFetch(`/admin/categories/${categoryId}`, {
    method: 'DELETE',
  });
};

export const createService = async (serviceData) => {
  return apiFetch('/admin/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  });
};

export const updateService = async (serviceId, serviceData) => {
  return apiFetch(`/admin/services/${serviceId}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData),
  });
};

export const deleteService = async (serviceId) => {
  return apiFetch(`/admin/services/${serviceId}`, {
    method: 'DELETE',
  });
};

export const fetchAdminBookings = async (page = 1, limit = 20, status = '') => {
  let url = `/admin/bookings?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  return apiFetch(url);
};

export const fetchRevenueReport = async (startDate, endDate) => {
  return apiFetch(`/admin/reports/revenue?startDate=${startDate}&endDate=${endDate}`);
};

// ========== Admin Category & Service Fetch (for table) ==========
export const fetchAdminCategories = async () => {
  return apiFetch('/admin/categories');
};

export const fetchAdminServices = async () => {
  return apiFetch('/admin/services');
};

// ========== Public Service/Category APIs ==========
export const fetchCategories = async () => {
  return apiFetch('/services/categories');
};

export const fetchCategoryBySlug = async (slug) => {
  return apiFetch(`/services/categories/${slug}`);
};

export const fetchServices = async (page = 1, limit = 10) => {
  return apiFetch(`/services?page=${page}&limit=${limit}`);
};

export const fetchFeaturedServices = async () => {
  return apiFetch('/services/featured');
};

export const fetchPopularServices = async () => {
  return apiFetch('/services/popular');
};

export const fetchServiceBySlug = async (slug) => {
  return apiFetch(`/services/${slug}`);
};

export const searchServices = async (query) => {
  const res = await fetchServices(1, 100);
  if (res.success && res.data.services) {
    const filtered = res.data.services.filter(service =>
      service.name.toLowerCase().includes(query.toLowerCase()) ||
      service.shortDescription?.toLowerCase().includes(query.toLowerCase()) ||
      service.slug.toLowerCase().includes(query.toLowerCase())
    );
    return { success: true, services: filtered };
  }
  return { success: false, services: [] };
};