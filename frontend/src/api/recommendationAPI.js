import api from './api';
export const getRecommendations = () => api.get('/recommendations');
export const recommendationAPI = { getRecommendations };
