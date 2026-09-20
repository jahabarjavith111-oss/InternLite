import api from './api';
export const getAdminStats = () => api.get('/admin/stats');
export const getAllUsers = () => api.get('/admin/users');
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, null, { params: { role } });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getAllInternshipsAdmin = () => api.get('/admin/internships');
export const getAllApplicationsAdmin = () => api.get('/admin/applications');
export const getAuditLogs = () => api.get('/admin/audit-logs');
export const adminAPI = { getAdminStats, getAllUsers, updateUserRole, deleteUser, getAllInternshipsAdmin, getAllApplicationsAdmin, getAuditLogs };
