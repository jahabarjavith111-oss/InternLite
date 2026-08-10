import api from './api';

export const getInternships = (params) => api.get('/internships', { params });
export const getInternshipById = (id) => api.get(`/internships/${id}`);
export const applyInternship = (internshipId, coverLetter, resumeId) =>
    api.post('/applications', { internshipId, coverLetter, resumeId });
export const getMyApplications = () => api.get('/applications/my');

export const internshipAPI = {
    getInternships,
    getInternshipById,
    applyInternship,
    getMyApplications,
};
