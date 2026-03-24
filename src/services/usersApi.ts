import api from './api';

export const getUsers = () => api.get('/users/').catch(() => ({ data: [] }));
export const createUser = (data: any) => api.post('/users/', data);
export const deleteUser = (id: string) => api.delete(`/users/${id}/`);
export const updateUser = (id: string, data: any) => api.patch(`/users/${id}/`, data);
