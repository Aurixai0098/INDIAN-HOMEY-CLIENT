// src/services/api.js

// ✅ Dynamic BASE_URL - works on local network too
const getBaseUrl = () => {
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_BASE_URL || 'https://ghar-seva-server-1.onrender.com/api/v1';
    }
    
    const hostname = window.location.hostname;
    
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:5000/api/v1`;
    }
    
    return 'http://localhost:5000/api/v1';
};

const BASE_URL = getBaseUrl();

console.log('🔧 API BASE_URL:', BASE_URL);

let categoriesCache = {
  data: null,
  timestamp: null,
  promise: null,
};

const apiFetch = async (endpoint, options = {}) => {
  let response;
  try {
    const headers = {
      ...options.headers,
    };
    
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    response = await fetch(`${BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers,
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

export const fetchCategories = async (forceRefresh = false) => {
  const now = Date.now();
  const CACHE_TTL = 5 * 60 * 1000;

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

// ========== Auth APIs ==========
export const register = async (userData) => {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const login = async (email, password) => {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const logout = async () => {
  return apiFetch('/auth/logout', {
    method: 'POST',
  });
};

export const getMe = async () => {
  return apiFetch('/auth/me');
};

// ========== User Avatar APIs ==========
export const uploadUserAvatar = async (formData) => {
  return apiFetch('/users/avatar', {
    method: 'POST',
    body: formData,
  });
};

export const removeUserAvatar = async () => {
  return apiFetch('/users/avatar', {
    method: 'DELETE',
  });
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

export const markAllNotificationsRead = async () => {
  return apiFetch('/users/notifications/read-all', {
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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
};

export const updateUserByAdmin = async (userId, userData) => {
  return apiFetch(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const getUserStats = async (userId) => {
  return apiFetch(`/admin/users/${userId}/stats`);
};

export const sendPushNotification = async (targetType, targetId, message) => {
  return apiFetch('/admin/notifications/push', {
    method: 'POST',
    body: JSON.stringify({ targetType, targetId, message }),
  });
};

export const sendSmsAlert = async (targetType, targetId, message) => {
  return apiFetch('/admin/notifications/sms', {
    method: 'POST',
    body: JSON.stringify({ targetType, targetId, message }),
  });
};

export const fetchAdminVerifications = async (page = 1, limit = 20, status = '', accountStatus = '') => {
  let url = `/admin/verifications?page=${page}&limit=${limit}`;
  if (status && status !== 'all') url += `&status=${status}`;
  if (accountStatus && accountStatus !== 'all') url += `&accountStatus=${accountStatus}`;
  return apiFetch(url);
};

export const verifyProvider = async (providerId, status, note = '') => {
  return apiFetch(`/admin/verifications/${providerId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, note }),
  });
};

export const fetchProviderDocuments = async (providerId) => {
  return apiFetch(`/admin/providers/${providerId}/documents`);
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

export const fetchCommission = async () => {
  return apiFetch('/admin/settings/commission');
};

export const updateCommission = async (commissionPercentage) => {
  return apiFetch('/admin/settings/commission', {
    method: 'PUT',
    body: JSON.stringify({ commissionPercentage }),
  });
};

// ========== Admin User Wallet APIs ==========
export const fetchUserWallets = async (page = 1, limit = 20, search = '') => {
  let url = `/admin/user-wallets?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return apiFetch(url);
};

export const fetchUserWalletDetails = async (userId) => {
  return apiFetch(`/admin/user-wallets/${userId}`);
};

export const addWalletFunds = async (userId, amount, note = '') => {
  return apiFetch(`/admin/user-wallets/${userId}/funds`, {
    method: 'POST',
    body: JSON.stringify({ amount, note }),
  });
};

export const addWalletCashback = async (userId, amount, note = '') => {
  return apiFetch(`/admin/user-wallets/${userId}/cashback`, {
    method: 'POST',
    body: JSON.stringify({ amount, note }),
  });
};

export const processWalletRefund = async (userId, amount, note = '') => {
  return apiFetch(`/admin/user-wallets/${userId}/refund`, {
    method: 'POST',
    body: JSON.stringify({ amount, note }),
  });
};

export const fetchUserTransactions = async (userId, page = 1, limit = 10) => {
  return apiFetch(`/admin/user-wallets/${userId}/transactions?page=${page}&limit=${limit}`);
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

// ========== Provider KYC Document Upload APIs ==========
export const uploadProviderKYCDocuments = async (formData) => {
  return apiFetch('/providers/upload-kyc', {
    method: 'POST',
    body: formData,
  });
};

export const fetchProviderVerificationStatus = async () => {
  return apiFetch('/providers/verification-status');
};

export const fetchProviderNotifications = async () => {
  return apiFetch('/providers/notifications');
};

// ✅ Heartbeat API – updates provider's lastActive timestamp
export const updateHeartbeat = async () => {
  return apiFetch('/providers/heartbeat', {
    method: 'POST',
  });
};

// ✅ Clean export for marking provider notification as read (single, no duplicate)
export const mar9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8 = async (notificationId) => {
  return apiFetch(`/providers/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
};

// Alias for backward compatibility
export const marahJ91ZuNL8Y2px8iYciYeHN8sfSh5eXH8 = mar9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8;

export const markAllProviderNotificationsRead = async () => {
  return apiFetch('/providers/notifications/read-all', {
    method: 'PATCH',
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

// ✅ NEW: Fetch featured providers for homepage
export const fetchFeaturedProviders = async (limit = 20) => {
  return apiFetch(`/providers/featured?limit=${limit}`);
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

// ========== Withdrawal APIs ==========
export const requestWithdrawal = async (amount, accountDetails) => {
  return apiFetch('/providers/withdrawals/request', {
    method: 'POST',
    body: JSON.stringify({ amount, accountDetails }),
  });
};

export const fetchMyWithdrawals = async (page = 1, limit = 10, status = '') => {
  let url = `/providers/withdrawals/my?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  return apiFetch(url);
};

export const fetchAllWithdrawals = async (status = '', page = 1, limit = 20) => {
  let url = `/admin/withdrawals?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  return apiFetch(url);
};

export const approveWithdrawal = async (withdrawalId, transactionId, adminNote) => {
  return apiFetch(`/admin/withdrawals/${withdrawalId}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transactionId, adminNote }),
  });
};

export const rejectWithdrawal = async (withdrawalId, adminNote) => {
  return apiFetch(`/admin/withdrawals/${withdrawalId}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ adminNote }),
  });
};

// ========== Booking APIs ==========
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

// ========== Public APIs ==========
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

// ========== Reviews API ==========
export const createReview = async (reviewData) => {
  return apiFetch('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
};

// ========== Provider Earnings & Ratings APIs ==========
export const fetchProviderEarningsList = async (page = 1, limit = 20, search = '') => {
  let url = `/admin/provider-earnings?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return apiFetch(url);
};

export const fetchProviderEarningsDetails = async (providerId) => {
  return apiFetch(`/admin/provider-earnings/${providerId}`);
};

export const fetchProviderReviews = async (providerId, page = 1, limit = 10) => {
  return apiFetch(`/reviews/provider/${providerId}?page=${page}&limit=${limit}`);
};

export const fetchAdminProviders = fetchProviderEarningsList;

// ========== Provider Status API ==========
export const fetchProviderStatusList = async () => {
  return apiFetch('/admin/providers/status');
};

// ========== COMMISSION SETTINGS (ADMIN) ==========
export const getCommissionSettings = async () => {
  return apiFetch('/admin/settings/commission');
};

export const updateCommissionSettings = async (data) => {
  return apiFetch('/admin/settings/commission', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// ========== Enhanced Withdrawal APIs ==========
export const updateWithdrawalStatus = async (withdrawalId, status, reason = '', transactionId = '') => {
  return apiFetch(`/admin/withdrawals/${withdrawalId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason, transactionId }),
  });
};

export const getAllProviderWallets = async () => {
  return apiFetch('/admin/provider-wallets');
};

export const fetchProviderWithdrawals = async (providerId, page = 1, limit = 50) => {
  return apiFetch(`/admin/providers/${providerId}/withdrawals?page=${page}&limit=${limit}`);
};

// ========== COMPLAINTS & RESCHEDULE APIs (Admin) ==========
export const fetchComplaints = async (page = 1, limit = 20, status = '', type = '') => {
  let url = `/admin/complaints?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  if (type) url += `&type=${type}`;
  return apiFetch(url);
};

export const fetchComplaintDetails = async (complaintId) => {
  return apiFetch(`/admin/complaints/${complaintId}`);
};

export const updateComplaintStatus = async (complaintId, status, adminNote = '') => {
  return apiFetch(`/admin/complaints/${complaintId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, adminNote }),
  });
};

export const deleteComplaint = async (complaintId) => {
  return apiFetch(`/admin/complaints/${complaintId}`, {
    method: 'DELETE',
  });
};

export const fetchUserComplaintHistory = async (userId) => {
  return apiFetch(`/admin/users/${userId}/complaints`);
};

export const fetchProviderComplaintHistory = async (providerId) => {
  return apiFetch(`/admin/providers/${providerId}/complaints`);
};

export const fetchProviderDetailsById = async (providerId) => {
  return apiFetch(`/admin/providers/${providerId}`);
};

export const updateProviderStatus = async (providerId, status) => {
  return apiFetch(`/admin/providers/${providerId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const sendNotificationToProvider = async (providerId, message) => {
  return apiFetch(`/admin/providers/${providerId}/notify`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
};

// Reschedule requests
export const fetchRescheduleRequests = async (page = 1, limit = 20, status = 'pending') => {
  return apiFetch(`/admin/reschedule-requests?page=${page}&limit=${limit}&status=${status}`);
};

export const approveRescheduleRequest = async (requestId, newDate, newTime) => {
  return apiFetch(`/admin/reschedule-requests/${requestId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ newDate, newTime }),
  });
};

export const rejectRescheduleRequest = async (requestId, reason) => {
  return apiFetch(`/admin/reschedule-requests/${requestId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
};

// ========== COUPONS & OFFERS (Admin) ==========
export const fetchCoupons = async () => {
  return apiFetch('/admin/coupons');
};

export const createCoupon = async (couponData) => {
  return apiFetch('/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(couponData),
  });
};

export const updateCoupon = async (couponId, couponData) => {
  return apiFetch(`/admin/coupons/${couponId}`, {
    method: 'PUT',
    body: JSON.stringify(couponData),
  });
};

export const deleteCoupon = async (couponId) => {
  return apiFetch(`/admin/coupons/${couponId}`, {
    method: 'DELETE',
  });
};

// ========== BANNER MANAGEMENT (Admin) ==========
export const fetchBanners = async () => {
  return apiFetch('/admin/banners');
};

export const createBanner = async (formData) => {
  return apiFetch('/admin/banners', {
    method: 'POST',
    body: formData,
  });
};

export const updateBanner = async (bannerId, formData) => {
  return apiFetch(`/admin/banners/${bannerId}`, {
    method: 'PUT',
    body: formData,
  });
};

export const deleteBanner = async (bannerId) => {
  return apiFetch(`/admin/banners/${bannerId}`, {
    method: 'DELETE',
  });
};

export const toggleBannerStatus = async (bannerId, isActive) => {
  return apiFetch(`/admin/banners/${bannerId}/toggle`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
};

export const reorderBanners = async (bannerIds) => {
  return apiFetch('/admin/banners/reorder', {
    method: 'POST',
    body: JSON.stringify({ bannerIds }),
  });
};

// ========== EMAIL CAMPAIGNS (Admin) ==========
export const fetchProviderEmails = async (search = '') => {
  let url = '/admin/emails/providers';
  if (search) url += `?search=${encodeURIComponent(search)}`;
  return apiFetch(url);
};

export const fetchUserEmails = async (search = '') => {
  let url = '/admin/emails/users';
  if (search) url += `?search=${encodeURIComponent(search)}`;
  return apiFetch(url);
};

export const sendEmailCampaign = async (campaignData) => {
  return apiFetch('/admin/email-campaigns', {
    method: 'POST',
    body: JSON.stringify(campaignData),
  });
};

export const fetchCampaignHistory = async (page = 1, limit = 20) => {
  return apiFetch(`/admin/email-campaigns?page=${page}&limit=${limit}`);
};

// ========== ROLES & PERMISSIONS (Admin) ==========
export const fetchRoles = async () => {
  return apiFetch('/admin/roles');
};

export const createRole = async (roleData) => {
  return apiFetch('/admin/roles', {
    method: 'POST',
    body: JSON.stringify(roleData),
  });
};

export const updateRole = async (roleId, roleData) => {
  return apiFetch(`/admin/roles/${roleId}`, {
    method: 'PUT',
    body: JSON.stringify(roleData),
  });
};

export const deleteRole = async (roleId) => {
  return apiFetch(`/admin/roles/${roleId}`, {
    method: 'DELETE',
  });
};

export const fetchAdminUsersList = async (page = 1, limit = 20) => {
  return apiFetch(`/admin/admin-users?page=${page}&limit=${limit}`);
};

export const createAdminUser = async (userData) => {
  return apiFetch('/admin/admin-users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const updateAdminUser = async (userId, userData) => {
  return apiFetch(`/admin/admin-users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const deleteAdminUser = async (userId) => {
  return apiFetch(`/admin/admin-users/${userId}`, {
    method: 'DELETE',
  });
};

export const fetchPermissions = async () => {
  return apiFetch('/admin/permissions');
};

export const updateRolePermissions = async (roleId, permissions) => {
  return apiFetch(`/admin/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissions }),
  });
};

// ========== BANK ACCOUNTS (Admin) ==========
export const fetchBankAccounts = async () => {
  return apiFetch('/admin/bank-accounts');
};

export const createBankAccount = async (accountData) => {
  return apiFetch('/admin/bank-accounts', {
    method: 'POST',
    body: JSON.stringify(accountData),
  });
};

export const updateBankAccount = async (accountId, accountData) => {
  return apiFetch(`/admin/bank-accounts/${accountId}`, {
    method: 'PUT',
    body: JSON.stringify(accountData),
  });
};

export const deleteBankAccount = async (accountId) => {
  return apiFetch(`/admin/bank-accounts/${accountId}`, {
    method: 'DELETE',
  });
};

export const setPrimaryBankAccount = async (accountId) => {
  return apiFetch(`/admin/bank-accounts/${accountId}/primary`, {
    method: 'PATCH',
  });
};

// ========== APP SETTINGS (Admin) ==========
export const fetchAppSettings = async () => {
  return apiFetch('/admin/settings/app');
};

export const updateAppSettings = async (settings) => {
  return apiFetch('/admin/settings/app', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};

export const toggleMaintenanceMode = async (isEnabled, message = '') => {
  return apiFetch('/admin/settings/maintenance', {
    method: 'POST',
    body: JSON.stringify({ isEnabled, message }),
  });
};

export const checkForAppUpdate = async () => {
  return apiFetch('/admin/updates/check');
};

export const publishAppUpdate = async (version, message, forceUpdate, downloadUrl) => {
  return apiFetch('/admin/updates/publish', {
    method: 'POST',
    body: JSON.stringify({ version, message, forceUpdate, downloadUrl }),
  });
};