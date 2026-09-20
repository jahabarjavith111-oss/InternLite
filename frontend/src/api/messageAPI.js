import api from './api';
export const getInbox = () => api.get('/messages/inbox');
export const getByApplication = (appId) => api.get(`/messages/application/${appId}`);
export const sendMessage = (data) => api.post('/messages', data);
export const markMessageRead = (id) => api.put(`/messages/${id}/read`);
export const messageAPI = { getInbox, getByApplication, sendMessage, markMessageRead };
