import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: { Accept: 'application/json' },
});

http.interceptors.response.use(
  response => response,
  error => Promise.reject({
    status: error.response?.status,
    message: error.response?.data?.message || error.message || 'Request failed',
    details: error.response?.data,
  }),
);
