import api from './api';
export const getMyNotifications = () => api.get('/notifications/my');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const getUnreadCount = (userId) => api.get(`/notifications/unread/${userId}`);
export const notificationAPI = { getMyNotifications, markNotificationRead, getUnreadCount };
