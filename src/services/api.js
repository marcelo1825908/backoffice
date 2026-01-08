import axios from 'axios';

// Get API URL from localStorage or use default
const getAPIBaseURL = () => {
  // Get server URL from localStorage (set by ServerUrlModal)
  const serverUrl = localStorage.getItem('serverUrl');
  if (serverUrl) {
    return `${serverUrl}/api`;
  }
  // Default fallback (will be overridden when user sets server URL)
  // return 'http://192.168.124.44:5000/api';
};

// Create a function to get the current API base URL dynamically
export const getCurrentAPIBaseURL = () => {
  return getAPIBaseURL();
};

// Create axios instance - baseURL will be updated dynamically
const api = axios.create({
  baseURL: getAPIBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to update the API base URL
export const updateAPIBaseURL = (serverUrl) => {
  const apiUrl = serverUrl.endsWith('/api') ? serverUrl : `${serverUrl}/api`;
  api.defaults.baseURL = apiUrl;
};

// Mosque Payments API (payments made at the kiosk)
export const getMosquePayments = () => api.get('/mosque/payments');
export const getMosquePaymentById = (id) => api.get(`/mosque/payments/${id}`);
export const getMosquePaymentsByMemberId = (memberId) => api.get(`/mosque/payments/member/${memberId}`);
export const getMosquePaymentStatsByType = (startDate, endDate) => 
  api.get('/mosque/payments/stats/by-type', { params: { startDate, endDate } });
export const getMosquePaymentStatsByMethod = (startDate, endDate) => 
  api.get('/mosque/payments/stats/by-method', { params: { startDate, endDate } });

// Members API (for managing members)
export const getMembers = () => api.get('/members');
export const getMemberById = (id) => api.get(`/members/${id}`);
export const getNextMemberId = () => api.get('/members/next-id');
export const searchMembers = (query) => api.get('/members/search', { params: { q: query } });
export const createMember = (data) => api.post('/members', data);
export const updateMember = (id, data) => api.put(`/members/${id}`, data);
export const deleteMember = (id) => api.delete(`/members/${id}`);

// Member Fees API
export const getMemberFees = () => api.get('/member-fees');
export const getMemberFeeById = (id) => api.get(`/member-fees/${id}`);

// Rental Charges API
export const getRentalCharges = () => api.get('/rental-charges');
export const getRentalChargeById = (id) => api.get(`/rental-charges/${id}`);

// Rental Bookings API
export const getRentalBookings = () => api.get('/rental-bookings');
export const getRentalBookingById = (id) => api.get(`/rental-bookings/${id}`);

// Authentication API
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const updateProfile = (userData) => api.put('/auth/profile', userData);
export const changePassword = (passwordData) => api.put('/auth/password', passwordData);
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

// Set auth token for authenticated requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('authToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  }
};

export default api;

