import axios from 'axios';
import { emitJadaEvent } from './jada/jadaEvents';

// Get API base URL from environment variables or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
console.log("DEBUG: API_BASE_URL is", API_BASE_URL);

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
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  config.__jadaRequestId = requestId;

  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  emitJadaEvent('request:start', {
    id: requestId,
    method: config.method,
    url: config.url,
  });

  return config;
});

// Handle 401 errors by redirecting to login
api.interceptors.response.use(
  (response) => {
    emitJadaEvent('request:end', {
      id: response?.config?.__jadaRequestId,
      ok: true,
      status: response?.status,
      url: response?.config?.url,
    });
    return response;
  },
  (error) => {
    emitJadaEvent('request:end', {
      id: error?.config?.__jadaRequestId,
      ok: false,
      status: error?.response?.status,
      url: error?.config?.url,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
