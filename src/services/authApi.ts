import api from './api';

export const login = (data: any) => api.post('/auth/login', data);
