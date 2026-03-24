import api from './api';

export const getLocations = () => api.get('/locations/');
export const createLocation = (data: any) => api.post('/locations/', data);
export const deleteLocation = (id: string) => api.delete(`/locations/${id}/`);
export const updateLocation = (id: string, data: any) => api.patch(`/locations/${id}/`, data);
