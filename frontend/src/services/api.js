import axios from 'axios';

import { API_BASE_URL } from './apiClient';

const API_URL = API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Some deployments use a separate API subdomain (api.atonixdev.org). In that case
// the CSRF cookie may not be readable from the main site domain, even though the
// browser still sends it to the API with withCredentials. Keep an in-memory copy
// of the CSRF token returned by /auth/csrf/ as a fallback.
let csrfTokenMemory = null;

export function setCsrfToken(token) {
  csrfTokenMemory = token || null;
}

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

const unsafeMethods = new Set(['post', 'put', 'patch', 'delete']);

// Request interceptor to add CSRF token for unsafe methods
api.interceptors.request.use(
  (config) => {
    const method = (config.method || 'get').toLowerCase();
    if (unsafeMethods.has(method)) {
      const csrf = getCookie('csrftoken') || csrfTokenMemory;
      if (csrf) {
        config.headers = config.headers || {};
        config.headers['X-CSRFToken'] = csrf;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle cookie refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh will use HttpOnly refresh cookie and set a new access cookie
        const csrf = getCookie('csrftoken') || csrfTokenMemory;
        await axios.post(`${API_URL}/auth/refresh/`, null, {
          withCredentials: true,
          headers: csrf ? { 'X-CSRFToken': csrf } : undefined,
        });
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
