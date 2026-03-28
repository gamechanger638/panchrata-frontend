import api from './api';

export const getFamilies = (params: any = {}) => api.get('/families/', { params });
export const createFamily = (data: any) => api.post('/families/', data);
export const deleteFamily = (id: string) => api.delete(`/families/${id}/`);
export const getFamily = (id: string) => api.get(`/families/${id}/`);
export const updateFamily = (id: string, data: any) => api.put(`/families/${id}/`, data);
