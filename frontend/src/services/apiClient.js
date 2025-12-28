// Central API client that resolves the backend base URL for local and production.

const deriveBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    const cleaned = envUrl.trim().replace(/\/$/, '');
    // Avoid CSRF/cookie issues caused by mixed loopback hostnames.
    // Example: app served on http://localhost:3000 but API set to http://127.0.0.1:8000/api.
    // Modern browsers treat this as cross-site, so SameSite=Lax cookies won't be sent.
    try {
      if (typeof window !== 'undefined' && window.location?.hostname) {
        const apiUrl = new URL(cleaned);
        const pageHost = window.location.hostname;
        const loopbacks = new Set(['localhost', '127.0.0.1']);
        if (loopbacks.has(apiUrl.hostname) && loopbacks.has(pageHost) && apiUrl.hostname !== pageHost) {
          apiUrl.hostname = pageHost;
          return apiUrl.toString().replace(/\/$/, '');
        }
      }
    } catch {
      // ignore
    }
    return cleaned;
  }

  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';

  // Production: call the API subdomain directly.
  // This avoids relying on a reverse-proxy at /api on the frontend host (which can
  // otherwise return the React HTML and cause "invalid response").
  if (host === 'atonixdev.org' || host === 'www.atonixdev.org') {
    return 'https://api.atonixdev.org/api';
  }
  if (host === 'api.atonixdev.org') {
    return `${protocol}//${host}/api`;
  }

  // Local dev fallbacks
  if (host === '127.0.0.1') {
    return 'http://127.0.0.1:8000/api';
  }
  if (host === 'localhost') {
    return 'http://localhost:8000/api';
  }

  // LAN / non-local host (e.g., testing from phone on same Wi‑Fi)
  // Default to same host on port 8000; override with REACT_APP_API_URL if needed.
  if (host) {
    return `${protocol}//${host}:8000/api`;
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
