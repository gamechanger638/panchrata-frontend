import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Handle 401 Unauthorized for expired tokens
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh: refreshToken });
          const newAccess = res.data.access;
          localStorage.setItem('access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        }
      } catch (err: any) {
        // If the refresh token is explicitly rejected (401/400), we log the user out.
        // If the server is just sleeping (network error, no response, 502/504), don't delete tokens!
        if (err.response && (err.response.status === 401 || err.response.status === 400)) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        // Otherwise, just reject the promise and let them try again without losing their session
      }
    }
    return Promise.reject(error);
  }
);

export default api;
