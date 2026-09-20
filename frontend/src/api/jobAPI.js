import api from './api';

export const getJobs = (params) => api.get('/jobs', { params });
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const applyJob = (jobId, coverLetter, resumeId) =>
    api.post('/job-applications', { jobId, coverLetter, resumeId });
export const getMyJobApplications = () => api.get('/job-applications/my');
export const withdrawJobApplication = (id) => api.put(`/job-applications/${id}/withdraw`);
export const getJobApplications = (jobId) => api.get(`/job-applications/job/${jobId}`);
export const getMyPostedJobs = () => api.get('/jobs/my');

// External + Unified
export const getExternalJobs = (params) => api.get('/external-jobs', { params });
export const getExternalJobById = (id) => api.get(`/external-jobs/${id}`);
export const getUnifiedJobs = (params) => api.get('/jobs/unified', { params });
export const triggerIngest = (source) => api.post('/admin/jobs/ingest', null, { params: source ? { source } : {} });
export const getIngestStats = () => api.get('/admin/jobs/ingest/stats');

export const jobAPI = {
    getJobs,
    getJobById,
    applyJob,
    getMyJobApplications,
    withdrawJobApplication,
    getJobApplications,
    getMyPostedJobs,
    getExternalJobs,
    getExternalJobById,
    getUnifiedJobs,
    triggerIngest,
    getIngestStats,
};
