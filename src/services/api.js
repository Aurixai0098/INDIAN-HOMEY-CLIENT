// src/services/api.js

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
console.log('🔧 API BASE_URL:', BASE_URL);

let categoriesCache = { data: null, timestamp: null, promise: null };

// ✅ Single export of apiFetch – no duplicate later
export const apiFetch = async (endpoint, options = {}) => {
    let response;
    try {
        const headers = { ...options.headers };
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        const url = `${BASE_URL}${endpoint}`;
        if (import.meta.env.DEV) console.log('📡 Fetching:', url);
        response = await fetch(url, {
            credentials: 'include',
            headers,
            ...options,
        });
    } catch (networkError) {
        throw new Error('Network error. Please check your connection.');
    }

    if (response.status === 429) {
        throw new Error('Too many requests. Please wait.');
    }

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: response.statusText || `HTTP ${response.status}` };
        }

        const err = new Error(errorData.message || 'Request failed');
        err.data = errorData;
        err.status = response.status;
        throw err;
    }

    return await response.json();
};

// ========== Categories ==========
export const fetchCategories = async (forceRefresh = false) => {
    const now = Date.now();
    const CACHE_TTL = 5 * 60 * 1000;
    if (!forceRefresh && categoriesCache.data && (now - categoriesCache.timestamp) < CACHE_TTL) return categoriesCache.data;
    if (categoriesCache.promise) return await categoriesCache.promise;
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
export const register = async (userData) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
export const login = async (email, password) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const logout = async () => apiFetch('/auth/logout', { method: 'POST' });
export const getMe = async () => apiFetch('/auth/me');
export const forgotPassword = async (email) => apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const resetPassword = async (token, newPassword) => apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) });
export const changePassword = async (currentPassword, newPassword) => apiFetch('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) });

// ========== User Avatar ==========
export const uploadUserAvatar = async (formData) => apiFetch('/users/avatar', { method: 'POST', body: formData });
export const removeUserAvatar = async () => apiFetch('/users/avatar', { method: 'DELETE' });

// ========== User APIs ==========
export const updateUserProfile = async (profileData) => apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(profileData) });
export const updateNotificationPreferences = async (preferences) => apiFetch('/users/notification-preferences', { method: 'PUT', body: JSON.stringify(preferences) });
export const fetchWallet = async () => apiFetch('/users/wallet');
export const fetchNotifications = async (page = 1, limit = 20) => apiFetch(`/users/notifications?page=${page}&limit=${limit}`);
export const markNotificationRead = async (notificationId) => apiFetch(`/users/notifications/${notificationId}/read`, { method: 'PATCH' });
export const markAllNotificationsRead = async () => apiFetch('/users/notifications/read-all', { method: 'PATCH' });

// ========== Address APIs ==========
export const fetchAddresses = async () => apiFetch('/users/addresses');
export const addAddress = async (addressData) => apiFetch('/users/addresses', { method: 'POST', body: JSON.stringify(addressData) });
export const updateAddress = async (addressId, addressData) => apiFetch(`/users/addresses/${addressId}`, { method: 'PUT', body: JSON.stringify(addressData) });
export const deleteAddress = async (addressId) => apiFetch(`/users/addresses/${addressId}`, { method: 'DELETE' });
export const setDefaultAddress = async (addressId) => apiFetch(`/users/addresses/${addressId}/default`, { method: 'PATCH' });

// ========== Admin APIs ==========
export const fetchAdminDashboard = async () => apiFetch('/admin/dashboard');
export const fetchAdminUsers = async (page = 1, limit = 20, role = '', status = '') => {
    let url = `/admin/users?page=${page}&limit=${limit}`;
    if (role) url += `&role=${role}`;
    if (status) url += `&status=${status}`;
    return apiFetch(url);
};
export const fetchAdminUserDetails = async (userId) => apiFetch(`/admin/users/${userId}`);
export const updateAdminUserStatus = async (userId, status) => apiFetch(`/admin/users/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const updateUserByAdmin = async (userId, userData) => apiFetch(`/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(userData) });
export const getUserStats = async (userId) => apiFetch(`/admin/users/${userId}/stats`);
export const sendPushNotification = async (targetType, targetId, message) => apiFetch('/admin/notifications/push', { method: 'POST', body: JSON.stringify({ targetType, targetId, message }) });
export const sendSmsAlert = async (targetType, targetId, message) => apiFetch('/admin/notifications/sms', { method: 'POST', body: JSON.stringify({ targetType, targetId, message }) });
export const fetchAdminVerifications = async (page = 1, limit = 20, status = '', accountStatus = '') => {
    let url = `/admin/verifications?page=${page}&limit=${limit}`;
    if (status && status !== 'all') url += `&status=${status}`;
    if (accountStatus && accountStatus !== 'all') url += `&accountStatus=${accountStatus}`;
    return apiFetch(url);
};
export const verifyProvider = async (providerId, status, note = '') => apiFetch(`/admin/verifications/${providerId}`, { method: 'PATCH', body: JSON.stringify({ status, note }) });
export const fetchProviderDocuments = async (providerId) => apiFetch(`/admin/providers/${providerId}/documents`);
export const createCategory = async (categoryData) => apiFetch('/admin/categories', { method: 'POST', body: JSON.stringify(categoryData) });
export const updateCategory = async (categoryId, categoryData) => apiFetch(`/admin/categories/${categoryId}`, { method: 'PUT', body: JSON.stringify(categoryData) });
export const deleteCategory = async (categoryId) => apiFetch(`/admin/categories/${categoryId}`, { method: 'DELETE' });
export const createService = async (serviceData) => apiFetch('/admin/services', { method: 'POST', body: JSON.stringify(serviceData) });
export const updateService = async (serviceId, serviceData) => apiFetch(`/admin/services/${serviceId}`, { method: 'PUT', body: JSON.stringify(serviceData) });
export const deleteService = async (serviceId) => apiFetch(`/admin/services/${serviceId}`, { method: 'DELETE' });
export const fetchAdminBookings = async (page = 1, limit = 20, status = '') => {
    let url = `/admin/bookings?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return apiFetch(url);
};
export const fetchRevenueReport = async (startDate, endDate) => apiFetch(`/admin/reports/revenue?startDate=${startDate}&endDate=${endDate}`);
export const fetchAdminCategories = async () => apiFetch('/admin/categories');
export const fetchAdminServices = async () => apiFetch('/admin/services');
export const fetchCommission = async () => apiFetch('/admin/settings/commission');
export const updateCommission = async (commissionPercentage) => apiFetch('/admin/settings/commission', { method: 'PUT', body: JSON.stringify({ commissionPercentage }) });
export const fetchUserWallets = async (page = 1, limit = 20, search = '') => {
    let url = `/admin/user-wallets?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return apiFetch(url);
};
export const fetchUserWalletDetails = async (userId) => apiFetch(`/admin/user-wallets/${userId}`);
export const addWalletFunds = async (userId, amount, note = '') => apiFetch(`/admin/user-wallets/${userId}/funds`, { method: 'POST', body: JSON.stringify({ amount, note }) });
export const addWalletCashback = async (userId, amount, note = '') => apiFetch(`/admin/user-wallets/${userId}/cashback`, { method: 'POST', body: JSON.stringify({ amount, note }) });
export const processWalletRefund = async (userId, amount, note = '') => apiFetch(`/admin/user-wallets/${userId}/refund`, { method: 'POST', body: JSON.stringify({ amount, note }) });
export const fetchUserTransactions = async (userId, page = 1, limit = 10) => apiFetch(`/admin/user-wallets/${userId}/transactions?page=${page}&limit=${limit}`);

// Fetch all providers (admin)
export const fetchAllProviders = async (page = 1, limit = 20, status = '', verificationStatus = '') => {
    let url = `/admin/providers?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (verificationStatus) url += `&verificationStatus=${verificationStatus}`;
    return apiFetch(url);
};

// ========== Provider APIs ==========
export const registerProvider = async (providerData) => apiFetch('/providers/register', { method: 'POST', body: providerData });
export const fetchProviderProfile = async () => apiFetch('/providers/profile');
export const updateProviderProfile = async (data) => apiFetch('/providers/profile', { method: 'PUT', body: JSON.stringify(data) });
export const addProviderService = async (serviceData) => apiFetch('/providers/services', { method: 'POST', body: JSON.stringify(serviceData) });
export const removeProviderService = async (serviceId) => apiFetch(`/providers/services/${serviceId}`, { method: 'DELETE' });
export const fetchProviderStats = async () => apiFetch('/providers/stats');
export const updateServiceArea = async (areaData) => apiFetch('/providers/service-area', { method: 'PUT', body: JSON.stringify(areaData) });
export const uploadProviderDocument = async (docData) => apiFetch('/providers/documents', { method: 'POST', body: JSON.stringify(docData) });
export const updateBankDetails = async (bankData) => apiFetch('/providers/bank-details', { method: 'PUT', body: JSON.stringify(bankData) });
export const uploadProviderKYCDocuments = async (formData) => apiFetch('/providers/upload-kyc', { method: 'POST', body: formData });
export const fetchProviderVerificationStatus = async () => apiFetch('/providers/verification-status');
export const fetchProviderNotifications = async () => apiFetch('/providers/notifications');
export const updateHeartbeat = async () => apiFetch('/providers/heartbeat', { method: 'POST' });
export const mar9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8 = async (notificationId) => apiFetch(`/providers/notifications/${notificationId}/read`, { method: 'PATCH' });
export const markAllProviderNotificationsRead = async () => apiFetch('/providers/notifications/read-all', { method: 'PATCH' });
export const searchProviders = async (latitude, longitude, radius = 10, serviceCategoryId, pincode = null, city = null) => {
    let url = `/providers/search?radius=${radius}`;
    if (latitude && longitude) url += `&latitude=${latitude}&longitude=${longitude}`;
    if (serviceCategoryId) url += `&service=${serviceCategoryId}`;
    if (pincode) url += `&pincode=${pincode}`;
    if (city) url += `&city=${encodeURIComponent(city)}`;
    return apiFetch(url);
};
export const fetchFeaturedProviders = async (limit = 20) => apiFetch(`/providers/featured?limit=${limit}`);

// ✅ Public: Get provider details by ID (for customer facing pages)
export const fetchProviderDetailsById = async (providerId) => apiFetch(`/providers/${providerId}/public`);
export const fetchAdminProviderDetailsById = async (providerId) => apiFetch(`/admin/providers/${providerId}`);
export const createCustomService = async (formData) => apiFetch('/providers/custom-service', { method: 'POST', body: formData });

// ========== Payment APIs ==========
export const createOrder = async (data) => apiFetch('/payments/create-order', { method: 'POST', body: JSON.stringify(data) });
export const verifyPayment = async (data) => apiFetch('/payments/verify', { method: 'POST', body: JSON.stringify(data) });
export const fetchPaymentHistory = async (page = 1, limit = 10) => apiFetch(`/payments/history?page=${page}&limit=${limit}`);
export const withdrawFromWallet = async (amount) => apiFetch('/payments/withdraw', { method: 'POST', body: JSON.stringify({ amount }) });

// ========== Withdrawal APIs ==========
export const requestWithdrawal = async (amount, accountDetails) => apiFetch('/providers/withdrawals/request', { method: 'POST', body: JSON.stringify({ amount, accountDetails }) });
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
export const approveWithdrawal = async (withdrawalId, transactionId, adminNote) => apiFetch(`/admin/withdrawals/${withdrawalId}/approve`, { method: 'PATCH', body: JSON.stringify({ transactionId, adminNote }) });
export const rejectWithdrawal = async (withdrawalId, adminNote) => apiFetch(`/admin/withdrawals/${withdrawalId}/reject`, { method: 'PATCH', body: JSON.stringify({ adminNote }) });
export const updateWithdrawalStatus = async (withdrawalId, status, reason = '', transactionId = '') => apiFetch(`/admin/withdrawals/${withdrawalId}/status`, { method: 'PATCH', body: JSON.stringify({ status, reason, transactionId }) });
export const getAllProviderWallets = async () => apiFetch('/admin/provider-wallets');
export const fetchProviderWithdrawals = async (providerId, page = 1, limit = 50) => apiFetch(`/admin/providers/${providerId}/withdrawals?page=${page}&limit=${limit}`);

// ========== Booking APIs ==========
export const createBooking = async (bookingData) => {
    const options = {
        method: 'POST',
        body: bookingData
    };
    if (!(bookingData instanceof FormData)) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(bookingData);
    }
    return apiFetch('/bookings', options);
};

export const fetchMyBookings = async (page = 1, limit = 10, status = '') => {
    let url = `/bookings/my-bookings?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return apiFetch(url);
};
export const fetchBookingById = async (bookingId) => apiFetch(`/bookings/${bookingId}`);
export const cancelBooking = async (bookingId, reason) => apiFetch(`/bookings/${bookingId}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) });
export const rescheduleBooking = async (bookingId, scheduledDate, scheduledTime) => apiFetch(`/bookings/${bookingId}/reschedule`, { method: 'PATCH', body: JSON.stringify({ scheduledDate, scheduledTime }) });
export const confirmBooking = async (bookingId) => apiFetch(`/bookings/${bookingId}/confirm`, { method: 'PATCH' });
export const startBooking = async (bookingId) => apiFetch(`/bookings/${bookingId}/start`, { method: 'PATCH' });
export const generateBookingOTP = async (bookingId) => apiFetch(`/bookings/${bookingId}/generate-otp`, { method: 'POST' });
export const completeBooking = async (bookingId, otp) => apiFetch(`/bookings/${bookingId}/complete`, { method: 'PATCH', body: JSON.stringify({ completionOTP: otp }) });
export const acceptBooking = async (bookingId) => apiFetch(`/bookings/${bookingId}/accept`, { method: 'POST' });
export const fetchChatHistory = async (bookingId) => apiFetch(`/chat/${bookingId}`);

// New endpoints for offer flow
export const providerOffer = async (bookingId, amount, note) => apiFetch(`/bookings/${bookingId}/provider-offer`, { method: 'POST', body: JSON.stringify({ amount, note }) });
export const confirmOffer = async (bookingId) => apiFetch(`/bookings/${bookingId}/confirm-offer`, { method: 'POST' });
export const rejectOffer = async (bookingId) => apiFetch(`/bookings/${bookingId}/reject-offer`, { method: 'POST' });

// ========== Public APIs ==========
export const fetchCategoryBySlug = async (slug) => apiFetch(`/services/categories/${slug}`);
export const fetchServices = async (page = 1, limit = 10) => apiFetch(`/services?page=${page}&limit=${limit}`);
export const fetchFeaturedServices = async () => apiFetch('/services/featured');
export const fetchPopularServices = async () => apiFetch('/services/popular');
export const fetchServiceBySlug = async (slug) => apiFetch(`/services/${slug}`);
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
export const createReview = async (reviewData) => apiFetch('/reviews', { method: 'POST', body: JSON.stringify(reviewData) });
export const fetchProviderReviews = async (providerId, page = 1, limit = 10) => apiFetch(`/reviews/provider/${providerId}?page=${page}&limit=${limit}`);

// ========== Provider Earnings & Ratings ==========
export const fetchProviderEarningsList = async (page = 1, limit = 20, search = '') => {
    let url = `/admin/provider-earnings?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return apiFetch(url);
};
export const fetchProviderEarningsDetails = async (providerId) => apiFetch(`/admin/provider-earnings/${providerId}`);
export const fetchAdminProviders = fetchProviderEarningsList;

// ========== Provider Status ==========
export const fetchProviderStatusList = async () => apiFetch('/admin/providers/status');

// ========== Commission Settings ==========
export const getCommissionSettings = async () => apiFetch('/admin/settings/commission');
export const updateCommissionSettings = async (data) => apiFetch('/admin/settings/commission', { method: 'PUT', body: JSON.stringify(data) });

// ========== Complaints & Reschedule ==========
export const fetchComplaints = async (page = 1, limit = 20, status = '', type = '') => {
    let url = `/admin/complaints?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (type) url += `&type=${type}`;
    return apiFetch(url);
};
export const fetchComplaintDetails = async (complaintId) => apiFetch(`/admin/complaints/${complaintId}`);
export const updateComplaintStatus = async (complaintId, status, adminNote = '') => apiFetch(`/admin/complaints/${complaintId}/status`, { method: 'PATCH', body: JSON.stringify({ status, adminNote }) });
export const deleteComplaint = async (complaintId) => apiFetch(`/admin/complaints/${complaintId}`, { method: 'DELETE' });
export const fetchUserComplaintHistory = async (userId) => apiFetch(`/admin/users/${userId}/complaints`);
export const fetchProviderComplaintHistory = async (providerId) => apiFetch(`/admin/providers/${providerId}/complaints`);
export const updateProviderStatus = async (providerId, status) => apiFetch(`/admin/providers/${providerId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const sendNotificationToProvider = async (providerId, message) => apiFetch(`/admin/providers/${providerId}/notify`, { method: 'POST', body: JSON.stringify({ message }) });
export const fetchRescheduleRequests = async (page = 1, limit = 20, status = 'pending') => apiFetch(`/admin/reschedule-requests?page=${page}&limit=${limit}&status=${status}`);
export const approveRescheduleRequest = async (requestId, newDate, newTime) => apiFetch(`/admin/reschedule-requests/${requestId}/approve`, { method: 'PATCH', body: JSON.stringify({ newDate, newTime }) });
export const rejectRescheduleRequest = async (requestId, reason) => apiFetch(`/admin/reschedule-requests/${requestId}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) });

// ========== Coupons & Offers ==========
export const fetchCoupons = async () => apiFetch('/admin/coupons');
export const createCoupon = async (couponData) => apiFetch('/admin/coupons', { method: 'POST', body: JSON.stringify(couponData) });
export const updateCoupon = async (couponId, couponData) => apiFetch(`/admin/coupons/${couponId}`, { method: 'PUT', body: JSON.stringify(couponData) });
export const deleteCoupon = async (couponId) => apiFetch(`/admin/coupons/${couponId}`, { method: 'DELETE' });

// ========== Banner Management ==========
export const fetchBanners = async () => apiFetch('/admin/banners');
export const createBanner = async (formData) => apiFetch('/admin/banners', { method: 'POST', body: formData });
export const updateBanner = async (bannerId, formData) => apiFetch(`/admin/banners/${bannerId}`, { method: 'PUT', body: formData });
export const deleteBanner = async (bannerId) => apiFetch(`/admin/banners/${bannerId}`, { method: 'DELETE' });
export const toggleBannerStatus = async (bannerId, isActive) => apiFetch(`/admin/banners/${bannerId}/toggle`, { method: 'PATCH', body: JSON.stringify({ isActive }) });
export const reorderBanners = async (bannerIds) => apiFetch('/admin/banners/reorder', { method: 'POST', body: JSON.stringify({ bannerIds }) });

// ========== Email Campaigns ==========
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
export const sendEmailCampaign = async (campaignData) => apiFetch('/admin/email-campaigns', { method: 'POST', body: JSON.stringify(campaignData) });
export const fetchCampaignHistory = async (page = 1, limit = 20) => apiFetch(`/admin/email-campaigns?page=${page}&limit=${limit}`);

// ========== Roles & Permissions ==========
export const fetchRoles = async () => apiFetch('/admin/roles');
export const createRole = async (roleData) => apiFetch('/admin/roles', { method: 'POST', body: JSON.stringify(roleData) });
export const updateRole = async (roleId, roleData) => apiFetch(`/admin/roles/${roleId}`, { method: 'PUT', body: JSON.stringify(roleData) });
export const deleteRole = async (roleId) => apiFetch(`/admin/roles/${roleId}`, { method: 'DELETE' });
export const fetchAdminUsersList = async (page = 1, limit = 20) => apiFetch(`/admin/admin-users?page=${page}&limit=${limit}`);
export const createAdminUser = async (userData) => apiFetch('/admin/admin-users', { method: 'POST', body: JSON.stringify(userData) });
export const updateAdminUser = async (userId, userData) => apiFetch(`/admin/admin-users/${userId}`, { method: 'PUT', body: JSON.stringify(userData) });
export const deleteAdminUser = async (userId) => apiFetch(`/admin/admin-users/${userId}`, { method: 'DELETE' });
export const fetchPermissions = async () => apiFetch('/admin/permissions');
export const updateRolePermissions = async (roleId, permissions) => apiFetch(`/admin/roles/${roleId}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions }) });

// ========== Bank Accounts ==========
export const fetchBankAccounts = async () => apiFetch('/admin/bank-accounts');
export const createBankAccount = async (accountData) => apiFetch('/admin/bank-accounts', { method: 'POST', body: JSON.stringify(accountData) });
export const updateBankAccount = async (accountId, accountData) => apiFetch(`/admin/bank-accounts/${accountId}`, { method: 'PUT', body: JSON.stringify(accountData) });
export const deleteBankAccount = async (accountId) => apiFetch(`/admin/bank-accounts/${accountId}`, { method: 'DELETE' });
export const setPrimaryBankAccount = async (accountId) => apiFetch(`/admin/bank-accounts/${accountId}/primary`, { method: 'PATCH' });

// ========== App Settings ==========
export const fetchAppSettings = async () => apiFetch('/admin/settings/app');
export const updateAppSettings = async (settings) => apiFetch('/admin/settings/app', { method: 'PUT', body: JSON.stringify(settings) });
export const toggleMaintenanceMode = async (isEnabled, message = '') => apiFetch('/admin/settings/maintenance', { method: 'POST', body: JSON.stringify({ isEnabled, message }) });
export const checkForAppUpdate = async () => apiFetch('/admin/updates/check');
export const publishAppUpdate = async (version, message, forceUpdate, downloadUrl) => apiFetch('/admin/updates/publish', { method: 'POST', body: JSON.stringify({ version, message, forceUpdate, downloadUrl }) });

// ========== ALIAS for backward compatibility ==========
export const marahJ91ZuNL8Y2px8iYciYeHN8sfSh5eXH8 = mar9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8;

// No duplicate export of apiFetch – it's already exported above.