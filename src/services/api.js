import axios from 'axios';

// Get API URL from window variable (injected by Electron) or environment variable, or fallback to localhost
const getAPIBaseURL = () => {
  // In Electron app, use the injected API URL
  if (window.__API_BASE_URL__) {
    return window.__API_BASE_URL__;
  }
  // In development or if env var is set, use that
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // Fallback to localhost
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getAPIBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default api;

