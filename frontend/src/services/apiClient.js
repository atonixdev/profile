// Central API client that resolves the backend base URL for local and production.

const deriveBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/$/, '');
  }

  const host = typeof window !== 'undefined' ? window.location.hostname : '';

  // Production: any atonixdev.org host points to the API subdomain
  if (host.endsWith('atonixdev.org')) {
    return 'https://api.atonixdev.org/api';
  }

  // Local dev fallbacks
  if (host === '127.0.0.1') {
    return 'http://127.0.0.1:8000/api';
  }
  // Default local
  return 'http://localhost:8000/api';
};

export const API_BASE_URL = deriveBaseUrl();

// Thin wrapper around fetch with base URL and JSON helpers
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const resp = await fetch(url, { ...options, headers });
  const contentType = resp.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await resp.json();
  } else {
    data = await resp.text();
  }

  if (!resp.ok) {
    const err = new Error(`API ${resp.status}`);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function apiGet(path) {
  return apiFetch(path, { method: 'GET' });
}

export async function apiPost(path, body) {
  return apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function apiPut(path, body) {
  return apiFetch(path, { method: 'PUT', body: JSON.stringify(body) });
}

export async function apiDelete(path) {
  return apiFetch(path, { method: 'DELETE' });
}
