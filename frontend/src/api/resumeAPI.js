import api from './api';
export const getMyResumes = () => api.get('/resumes/my');
export const uploadResume = (data) => api.post('/resumes', data);
export const setDefaultResume = (id) => api.put(`/resumes/${id}/default`);
export const deleteResume = (id) => api.delete(`/resumes/${id}`);
export const resumeAPI = { getMyResumes, uploadResume, setDefaultResume, deleteResume };
