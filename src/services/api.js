// src/services/api.js

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api/v1';

// Cache for categories
let categoriesCache = {
  data: null,
  timestamp: null,
  promise: null,
};

const apiFetch = async (endpoint, options = {}) => {
  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  } catch (networkError) {
    throw new Error('Network error. Please check your connection.');
  }

  if (response.status === 429) {
    throw new Error('Too many requests. Please wait a moment and try again.');
  }

  if (!response.ok) {
    let errorMessage;
    try {
      const data = await response.json();
      errorMessage = data.message || 'Request failed';
    } catch (e) {
      errorMessage = response.statusText || `HTTP ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
};

// Cached version of fetchCategories
export const fetchCategories = async (forceRefresh = false) => {
  const now = Date.now();
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  if (!forceRefresh && categoriesCache.data && (now - categoriesCache.timestamp) < CACHE_TTL) {
    return categoriesCache.data;
  }

  if (categoriesCache.promise) {
    return await categoriesCache.promise;
  }

  categoriesCache.promise = (async () => {
    try {
      const result = await apiFetch('/services/categories');
      categoriesCache.data = result;
      categoriesCache.timestamp = now;
      return result;
    } finally {
      categoriesCache.promise = null;
    }
  })();

  return await categoriesCache.promise;
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

export const markNotificationRead = async (notificationId) => {
  return apiFetch(`/users/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
};

// ========== Address APIs ==========
export const fetchAddresses = async () => {
  return apiFetch('/users/addresses');
};

export const addAddress = async (addressData) => {
  return apiFetch('/users/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData),
  });
};

export const updateAddress = async (addressId, addressData) => {
  return apiFetch(`/users/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(addressData),
  });
};

export const deleteAddress = async (addressId) => {
  return apiFetch(`/users/addresses/${addressId}`, {
    method: 'DELETE',
  });
};

export const setDefaultAddress = async (addressId) => {
  return apiFetch(`/users/addresses/${addressId}/default`, {
    method: 'PATCH',
  });
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

export const fetchAdminCategories = async () => {
  return apiFetch('/admin/categories');
};

export const fetchAdminServices = async () => {
  return apiFetch('/admin/services');
};

// Commission settings
export const fetchCommission = async () => {
  return apiFetch('/admin/settings/commission');
};

export const updateCommission = async (commissionPercentage) => {
  return apiFetch('/admin/settings/commission', {
    method: 'PUT',
    body: JSON.stringify({ commissionPercentage }),
  });
};

// ========== Provider APIs ==========
export const registerProvider = async (providerData) => {
  return apiFetch('/providers/register', {
    method: 'POST',
    body: JSON.stringify(providerData),
  });
};

export const fetchProviderProfile = async () => {
  return apiFetch('/providers/profile');
};

export const updateProviderProfile = async (data) => {
  return apiFetch('/providers/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const addProviderService = async (serviceData) => {
  return apiFetch('/providers/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  });
};

export const removeProviderService = async (serviceId) => {
  return apiFetch(`/providers/services/${serviceId}`, {
    method: 'DELETE',
  });
};

export const fetchProviderStats = async () => {
  return apiFetch('/providers/stats');
};

export const updateServiceArea = async (areaData) => {
  return apiFetch('/providers/service-area', {
    method: 'PUT',
    body: JSON.stringify(areaData),
  });
};

export const uploadProviderDocument = async (docData) => {
  return apiFetch('/providers/documents', {
    method: 'POST',
    body: JSON.stringify(docData),
  });
};

export const updateBankDetails = async (bankData) => {
  return apiFetch('/providers/bank-details', {
    method: 'PUT',
    body: JSON.stringify(bankData),
  });
};

export const searchProviders = async (latitude, longitude, radius = 10, serviceCategoryId, pincode = null, city = null) => {
  let url = `/providers/search?radius=${radius}`;
  if (latitude && longitude) {
    url += `&latitude=${latitude}&longitude=${longitude}`;
  }
  if (serviceCategoryId) url += `&service=${serviceCategoryId}`;
  if (pincode) url += `&pincode=${pincode}`;
  if (city) url += `&city=${encodeURIComponent(city)}`;
  return apiFetch(url);
};

export const fetchProviderNotifications = async () => {
  return apiFetch('/providers/notifications');
};

export const mar9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8 = async (notificationId) => {
  return apiFetch(`/providers/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
};

// ========== Payment APIs ==========
export const createOrder = async (data) => {
  return apiFetch('/payments/create-order', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const verifyPayment = async (data) => {
  return apiFetch('/payments/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const fetchPaymentHistory = async (page = 1, limit = 10) => {
  return apiFetch(`/payments/history?page=${page}&limit=${limit}`);
};

export const withdrawFromWallet = async (amount) => {
  return apiFetch('/payments/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
};

// ========== Withdrawal APIs (Provider & Admin) ==========
export const requestWithdrawal = async (amount, accountDetails) => {
  return apiFetch('/providers/withdrawals/request', {
    method: 'POST',
    body: JSON.stringify({ amount, accountDetails }),
  });
};

export const fetchMyWithdrawals = async (page = 1, limit = 10) => {
  return apiFetch(`/providers/withdrawals/my?page=${page}&limit=${limit}`);
};

export const fetchAllWithdrawals = async (status = '', page = 1, limit = 20) => {
  let url = `/admin/withdrawals?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  return apiFetch(url);
};

export const approveWithdrawal = async (withdrawalId, transactionId, adminNote) => {
  return apiFetch(`/admin/withdrawals/${withdrawalId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ transactionId, adminNote }),
  });
};

export const rejectWithdrawal = async (withdrawalId, adminNote) => {
  return apiFetch(`/admin/withdrawals/${withdrawalId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ adminNote }),
  });
};

// ========== Booking APIs (customer & provider) ==========
export const createBooking = async (bookingData) => {
  return apiFetch('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
};

export const fetchMyBookings = async (page = 1, limit = 10, status = '') => {
  let url = `/bookings/my-bookings?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  return apiFetch(url);
};

export const fetchBookingById = async (bookingId) => {
  return apiFetch(`/bookings/${bookingId}`);
};

export const cancelBooking = async (bookingId, reason) => {
  return apiFetch(`/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
};

export const rescheduleBooking = async (bookingId, scheduledDate, scheduledTime) => {
  return apiFetch(`/bookings/${bookingId}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify({ scheduledDate, scheduledTime }),
  });
};

export const confirmBooking = async (bookingId) => {
  return apiFetch(`/bookings/${bookingId}/confirm`, {
    method: 'PATCH',
  });
};

export const startBooking = async (bookingId) => {
  return apiFetch(`/bookings/${bookingId}/start`, {
    method: 'PATCH',
  });
};

export const generateBookingOTP = async (bookingId) => {
  return apiFetch(`/bookings/${bookingId}/generate-otp`, {
    method: 'POST',
  });
};

export const completeBooking = async (bookingId, otp) => {
  return apiFetch(`/bookings/${bookingId}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ completionOTP: otp }),
  });
};

// ========== Public Service/Category APIs ==========
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