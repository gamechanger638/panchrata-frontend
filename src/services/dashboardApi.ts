import api from './api';

export const getDashboardInsights = () => api.get('/dashboard/insights/');

export const dashboardAPI = {
  getDashboardInsights,
};
