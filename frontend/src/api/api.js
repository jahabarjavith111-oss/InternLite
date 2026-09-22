import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://internlite-backen.onrender.com/api',
    // Mail-sending endpoints (OTP) can take several seconds over SMTP
    timeout: 45000,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 403 || err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            const onLoginPage = window.location.hash.includes('#/login') || window.location.pathname.includes('/login');
            if (!onLoginPage) window.location.href = '/#/login';
        }
        return Promise.reject(err);
    }
);

export const isNetworkError = (err) => !err?.response && (!!err?.request || err?.code === 'ECONNABORTED' || err?.message === 'Network Error');

export const friendlyError = (err, fallback) => {
    if (!err?.response) return 'Cannot reach the server. Please make sure the backend is running at ' + (import.meta.env.VITE_API_URL || 'https://internlite-backen.onrender.com/api');
    const d = err?.response?.data;
    if (typeof d === 'string' && d) return d;
    if (d?.message) return d.message;
    if (err?.response?.status === 403) return 'Access denied. Please log in again.';
    if (err?.response?.status === 404) return 'Resource not found.';
    if (err?.response?.status >= 500) return 'Server error. Please try again later.';
    return err?.message || fallback || 'Something went wrong. Please try again.';
};

export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp });

export const sendOtp = (email, name) => api.post('/auth/send-otp', { email, name });

export const register = (data) => api.post('/auth/register', data);

export const login = (credentials) => api.post('/auth/login', credentials);

export default api;
