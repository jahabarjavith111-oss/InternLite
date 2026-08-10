import api from './api';

export const getAll = () => api.get('/skills');

export const skillAPI = { getAll };
