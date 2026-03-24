import api from './api';

export const getCommunities = () => api.get('/community/communities/');
export const createCommunity = (data: any) => api.post('/community/communities/', data);
export const deleteCommunity = (id: string) => api.delete(`/community/communities/${id}/`);
