import api from './api';
export const getSaved = () => api.get('/saved');
export const saveInternship = (internshipId) => api.post(`/saved/${internshipId}`);
export const unsaveInternship = (internshipId) => api.delete(`/saved/${internshipId}`);
export const savedAPI = { getSaved, saveInternship, unsaveInternship };
