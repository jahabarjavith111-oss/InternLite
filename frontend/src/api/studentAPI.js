import api from './api';

export const getProfile = () => api.get('/students/profile');
export const updateProfile = (data) => api.put('/students/profile', data);
export const getSkills = () => api.get('/skills/student');
export const addSkill = (skillId) => api.post(`/skills/student/${skillId}`);
export const removeSkill = (skillId) => api.delete(`/skills/student/${skillId}`);

export const studentAPI = { getProfile, updateProfile, getSkills, addSkill, removeSkill };
