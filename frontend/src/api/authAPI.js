import api from './api';

export const sendOtp = (email, name) => api.post('/auth/send-otp', { email, name });
export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword });

export const authAPI = { sendOtp, verifyOtp, register, login, forgotPassword, resetPassword };