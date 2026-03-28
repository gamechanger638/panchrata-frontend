import api from './api';

export const getDashboardInsights = (params?: any) => api.get('/dashboard/insights/', { params });

export const exportReport = (params?: any) => api.get('/dashboard/export/', { params, responseType: 'blob' });

export const dashboardAPI = {
  getDashboardInsights,
  exportReport,
};
