import api from './api';

export const getMembers = () => api.get('/members/');
export const createMember = (data: any) => api.post('/members/', data);
export const deleteMember = (id: string) => api.delete(`/members/${id}/`);
export const updateMember = (id: string, data: any) => api.put(`/members/${id}/`, data);
