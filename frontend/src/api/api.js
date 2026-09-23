import axios from 'axios';

// Normalize the API base: some deployments set VITE_API_URL without the
// /api suffix (e.g. https://host.onrender.com), which silently sends every
// request to a non-existent protected path — the backend then answers
// 401/403 and the whole app looks broken. Always force the /api prefix.
const rawBase = (import.meta.env.VITE_API_URL || 'https://internlite-backen.onrender.com/api').trim();
const stripped = rawBase.replace(/\/+$/, '');
export const API_BASE = stripped.endsWith('/api') ? stripped : stripped + '/api';

const api = axios.create({
    baseURL: API_BASE,
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
        const status = err.response?.status;
        const url = err.config?.url || '';
        const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register')
            || url.includes('/auth/send-otp') || url.includes('/auth/verify-otp')
            || url.includes('/auth/forgot-password') || url.includes('/auth/reset-password');
        // 401 = session expired. 403 on non-auth endpoints = need login.
        // Auth endpoints return 401/403 as business errors — don't redirect there.
        if ((status === 401 || status === 403) && !isAuthCall) {
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
    if (!err?.response) return 'Cannot reach the server. Please make sure the backend is running at ' + API_BASE;
    const d = err?.response?.data;
    if (typeof d === 'string' && d) return d;
    if (d?.message) return d.message;
    if (d?.error) return `${d.error} (${err.response.status})`;
    if (err?.response?.status === 401) return 'Invalid credentials. Please try again.';
    if (err?.response?.status === 403) return 'Request blocked (403). If you were signing up or logging in, the backend may still be redeploying — wait a moment and try again.';
    if (err?.response?.status === 404) return 'Resource not found.';
    if (err?.response?.status >= 500) return 'Server error. Please try again later.';
    return err?.message || fallback || 'Something went wrong. Please try again.';
};

export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp });

export const sendOtp = (email, name) => api.post('/auth/send-otp', { email, name });

export const register = (data) => api.post('/auth/register', data);

export const login = (credentials) => api.post('/auth/login', credentials);

export default api;
