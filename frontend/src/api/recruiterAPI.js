import api from './api';

export const getMyInternships = () => api.get('/recruiter/internships');
export const getInternshipApplications = (internshipId) => api.get(`/recruiter/internships/${internshipId}/applications`);
export const getRecruiterStats = () => api.get('/recruiter/stats');
export const getMyCompany = () => api.get('/recruiter/company');
export const postInternship = (data) => api.post('/recruiter/internships', data);
export const updateInternship = (id, data) => api.put(`/recruiter/internships/${id}`, data);
export const updateInternshipStatus = (id, status) => api.put(`/recruiter/internships/${id}/status`, null, { params: { status } });
export const updateApplicationStatus = (appId, status) => api.put(`/applications/${appId}/status`, { status });
export const scheduleInterview = (appId, data) => api.post(`/interviews/${appId}`, data);
export const getInterviewByApplication = (appId) => api.get(`/interviews/application/${appId}`);

export const recruiterAPI = {
    getMyInternships,
    getInternshipApplications,
    getRecruiterStats,
    getMyCompany,
    postInternship,
    updateInternship,
    updateInternshipStatus,
    updateApplicationStatus,
    scheduleInterview,
    getInterviewByApplication,
};
