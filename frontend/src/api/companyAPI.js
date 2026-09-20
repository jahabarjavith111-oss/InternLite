import api from './api';
export const getCompanies = (name) => api.get('/companies', { params: name ? { name } : {} });
export const getCompanyById = (id) => api.get(`/companies/${id}`);
export const createCompany = (data) => api.post('/companies', data);
export const updateCompany = (id, data) => api.put(`/companies/${id}`, data);
export const companyAPI = { getCompanies, getCompanyById, createCompany, updateCompany };
