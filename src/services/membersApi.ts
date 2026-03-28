import api from './api';

export const getMembers = (params: any = {}) => api.get('/members/', { params });
export const getMember = (id: string) => api.get(`/members/${id}/`);
export const createMember = (data: any) => api.post('/members/', data);
export const deleteMember = (id: string) => api.delete(`/members/${id}/`);
export const updateMember = (id: string, data: any) => api.put(`/members/${id}/`, data);
