import axios from 'axios';

// Get API base URL from environment variables or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 70000, // 70 seconds to accommodate 60s backend timeout + buffer
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors by redirecting to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
